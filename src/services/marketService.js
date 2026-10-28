/**
 * Serviço de integração com a brapi.dev para cotações de Ações e Moedas (Dólar).
 * Regra estrita: Limite máximo de 4 chamadas por dia divididas em 4 slots fixos de 6h.
 * Bloqueado qualquer tipo de recarregamento forçado.
 */

// Token da brapi.dev
const BRAPI_TOKEN = import.meta.env.VITE_BRAPI_TOKEN || 'dmX9ygWePJ23LBb9GbC8Mq';
const STORAGE_PREFIX = 'jc_market_slot_v3_';

// Nomes amigáveis padrão para as 4 principais ações
const FRIENDLY_NAMES = {
  PETR4: 'Petrobras PN',
  VALE3: 'Vale ON',
  ITUB4: 'Itaú Unibanco',
  BBDC4: 'Bradesco PN',
};

// Fallback de contingência caso a API esteja temporariamente inacessível
const FALLBACK_STOCKS = [
  {
    symbol: 'PETR4',
    shortName: 'Petrobras PN',
    price: 36.85,
    change: 0.42,
    changePercent: 1.15,
    updatedAt: new Date().toISOString(),
  },
  {
    symbol: 'VALE3',
    shortName: 'Vale ON',
    price: 61.20,
    change: -0.35,
    changePercent: -0.57,
    updatedAt: new Date().toISOString(),
  },
  {
    symbol: 'ITUB4',
    shortName: 'Itaú Unibanco',
    price: 34.90,
    change: 0.18,
    changePercent: 0.52,
    updatedAt: new Date().toISOString(),
  },
  {
    symbol: 'BBDC4',
    shortName: 'Bradesco PN',
    price: 13.45,
    change: -0.09,
    changePercent: -0.66,
    updatedAt: new Date().toISOString(),
  },
];

const FALLBACK_DOLLAR = {
  pair: 'USD-BRL',
  name: 'Dólar Comercial',
  bidPrice: 5.682,
  askPrice: 5.685,
  high: 5.714,
  low: 5.642,
  variation: 0.021,
  changePercent: 0.37,
  updatedAt: new Date().toISOString(),
};

/**
 * Retorna a data no formato YYYY-MM-DD no fuso de Brasília.
 */
function getLocalDateString(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Retorna o identificador único do slot de 6h do dia atual (4 janelas por dia):
 * Slot 0: 00:00 até 05:59
 * Slot 1: 06:00 até 11:59
 * Slot 2: 12:00 até 17:59
 * Slot 3: 18:00 até 23:59
 */
export function getCurrentSlotId(date = new Date()) {
  let hour = date.getHours();
  try {
    const hourFormatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      hour12: false,
    });
    hour = parseInt(hourFormatter.format(date), 10);
  } catch {
    // fallback para getHours local
  }

  const slotIndex = Math.floor(hour / 6);
  const dateStr = getLocalDateString(date);
  return `${dateStr}_slot${slotIndex}`;
}

/**
 * Leitura de dados do slot do localStorage
 */
function getSlotData(type, slotId) {
  try {
    const key = `${STORAGE_PREFIX}${type}_${slotId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // localStorage bloqueado ou parse error
  }
  return null;
}

/**
 * Busca o dado mais recente previamente gravado em qualquer slot anterior
 */
function getLatestSavedData(type) {
  try {
    const latestRaw = localStorage.getItem(`${STORAGE_PREFIX}${type}_latest`);
    if (latestRaw) {
      return JSON.parse(latestRaw);
    }
  } catch {
    // ignora
  }
  return null;
}

/**
 * Gravação de dados no slot atual e como último registro global
 */
function saveSlotData(type, slotId, data) {
  try {
    const payload = {
      data,
      slotId,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${STORAGE_PREFIX}${type}_${slotId}`, JSON.stringify(payload));
    localStorage.setItem(`${STORAGE_PREFIX}${type}_latest`, JSON.stringify(payload));
  } catch {
    // localStorage cheio
  }
}

// Bloqueio em memória para evitar chamadas simultâneas
let inFlightStocksPromise = null;
let inFlightDollarPromise = null;

/**
 * Busca cotações das ações da B3.
 * SÓ CHAMA A API SE O SLOT ATUAL AINDA NÃO TIVER SIDO COLETADO (máx. 4x/dia).
 * Forçar chamada externa está terminantemente desabilitado.
 */
export async function fetchTopStocks(symbols = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4']) {
  const currentSlotId = getCurrentSlotId();

  // 1. Se já coletou no slot atual, NUNCA chama a API externa
  const existingSlot = getSlotData('stocks', currentSlotId);
  if (existingSlot && existingSlot.data) {
    return {
      items: existingSlot.data,
      lastUpdated: new Date(existingSlot.timestamp),
    };
  }

  // 2. Se já existe uma requisição em andamento para este slot, reaproveita
  if (inFlightStocksPromise) {
    return inFlightStocksPromise;
  }

  inFlightStocksPromise = (async () => {
    try {
      const tickers = symbols.join(',');
      const url = `https://brapi.dev/api/quote/${encodeURIComponent(tickers)}?token=${encodeURIComponent(BRAPI_TOKEN)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${BRAPI_TOKEN}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro brapi.dev status ${response.status}`);
      }

      const json = await response.json();
      const rawResults = json.results || [];

      if (!Array.isArray(rawResults) || rawResults.length === 0) {
        throw new Error('Nenhum dado retornado para as ações');
      }

      const formatted = rawResults.map((item) => {
        const price = typeof item.regularMarketPrice === 'number'
          ? item.regularMarketPrice
          : parseFloat(item.regularMarketPrice || 0);

        const change = typeof item.regularMarketChange === 'number'
          ? item.regularMarketChange
          : parseFloat(item.regularMarketChange || 0);

        const changePercent = typeof item.regularMarketChangePercent === 'number'
          ? item.regularMarketChangePercent
          : parseFloat(item.regularMarketChangePercent || 0);

        return {
          symbol: item.symbol,
          shortName: FRIENDLY_NAMES[item.symbol] || item.shortName || item.longName || item.symbol,
          price,
          change,
          changePercent,
          logourl: item.logourl || null,
          updatedAt: item.regularMarketTime || new Date().toISOString(),
        };
      });

      // Grava no slot atual (assegura que não será chamado de novo neste slot)
      saveSlotData('stocks', currentSlotId, formatted);

      return {
        items: formatted,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.warn('Aviso: falha na coleta das ações da brapi.dev, usando dados seguros:', error.message);
      const fallback = getLatestSavedData('stocks');
      return {
        items: fallback?.data || FALLBACK_STOCKS,
        lastUpdated: fallback?.timestamp ? new Date(fallback.timestamp) : new Date(),
      };
    } finally {
      inFlightStocksPromise = null;
    }
  })();

  return inFlightStocksPromise;
}

/**
 * Busca cotação e oscilação do Dólar Comercial.
 * SÓ CHAMA A API SE O SLOT ATUAL AINDA NÃO TIVER SIDO COLETADO (máx. 4x/dia).
 * Forçar chamada externa está terminantemente desabilitado.
 */
export async function fetchDollarRate() {
  const currentSlotId = getCurrentSlotId();

  // 1. Se já coletou no slot atual, NUNCA chama a API externa
  const existingSlot = getSlotData('dollar', currentSlotId);
  if (existingSlot && existingSlot.data) {
    return {
      rate: existingSlot.data,
      lastUpdated: new Date(existingSlot.timestamp),
    };
  }

  // 2. Se já existe uma requisição em andamento para este slot, reaproveita
  if (inFlightDollarPromise) {
    return inFlightDollarPromise;
  }

  inFlightDollarPromise = (async () => {
    try {
      const url = `https://brapi.dev/api/v2/currency?currency=USD-BRL&token=${encodeURIComponent(BRAPI_TOKEN)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${BRAPI_TOKEN}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro brapi.dev moedas status ${response.status}`);
      }

      const json = await response.json();
      const list = json.currency || [];
      const item = list[0];

      if (!item) {
        throw new Error('Nenhum dado retornado para USD-BRL');
      }

      const bidPrice = parseFloat(item.bidPrice) || 0;
      const askPrice = parseFloat(item.askPrice) || bidPrice;
      const high = parseFloat(item.high) || bidPrice;
      const low = parseFloat(item.low) || bidPrice;
      const variation = parseFloat(item.bidVariation) || 0;

      let changePercent = parseFloat(item.percentageChange);
      if (isNaN(changePercent)) {
        const prevPrice = bidPrice - variation;
        changePercent = prevPrice > 0 ? (variation / prevPrice) * 100 : 0;
      }

      const formatted = {
        pair: 'USD-BRL',
        name: 'Dólar Comercial',
        bidPrice,
        askPrice,
        high,
        low,
        variation,
        changePercent,
        updatedAt: item.updatedAtDate || (item.updatedAtTimestamp ? new Date(item.updatedAtTimestamp * 1000).toISOString() : new Date().toISOString()),
      };

      // Grava no slot atual (assegura que não será chamado de novo neste slot)
      saveSlotData('dollar', currentSlotId, formatted);

      return {
        rate: formatted,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.warn('Aviso: falha na coleta do dólar da brapi.dev, usando dados seguros:', error.message);
      const fallback = getLatestSavedData('dollar');
      return {
        rate: fallback?.data || FALLBACK_DOLLAR,
        lastUpdated: fallback?.timestamp ? new Date(fallback.timestamp) : new Date(),
      };
    } finally {
      inFlightDollarPromise = null;
    }
  })();

  return inFlightDollarPromise;
}
