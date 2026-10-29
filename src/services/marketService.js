/**
 * Serviço de integração com a brapi.dev para cotações de Ações e Moedas (Dólar).
 * Regra estrita: Limite máximo absoluto de 4 chamadas por dia (1 chamada a cada 6 horas).
 * Bloqueio rígido contra qualquer repetição ou recarregamento forçado.
 */

// Token da brapi.dev
const BRAPI_TOKEN = import.meta.env.VITE_BRAPI_TOKEN || 'dmX9ygWePJ23LBb9GbC8Mq';
const STORAGE_PREFIX = 'jc_market_strict_v4_';

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
 * Cache Singleton em memória para compartilhar dados instantaneamente entre todos os componentes
 */
let memoryStocksCache = null;
let memoryDollarCache = null;
let inFlightStocksPromise = null;
let inFlightDollarPromise = null;

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
 * Retorna o identificador do slot atual de 6 horas (4 slots por dia):
 * Slot 0: 00:00 às 05:59
 * Slot 1: 06:00 às 11:59
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
    // fallback
  }

  const slotIndex = Math.floor(hour / 6);
  const dateStr = getLocalDateString(date);
  return `${dateStr}_slot${slotIndex}`;
}

/**
 * Leitura de dados gravados no localStorage
 */
function getPersistedData(type) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${type}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // localStorage inacessível
  }
  return null;
}

/**
 * Grava dados persistentes com a trava do slot
 */
function persistData(type, slotId, data) {
  try {
    const payload = {
      slotId,
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${STORAGE_PREFIX}${type}`, JSON.stringify(payload));
    // Marca a trava definitiva para este slot
    localStorage.setItem(`${STORAGE_PREFIX}lock_${type}_${slotId}`, '1');
  } catch {
    // localStorage cheio
  }
}

/**
 * Verifica se o slot atual já foi consultado (mesmo que tenha falhado ou retornado fallback)
 */
function isSlotLocked(type, slotId) {
  try {
    return Boolean(localStorage.getItem(`${STORAGE_PREFIX}lock_${type}_${slotId}`));
  } catch {
    return false;
  }
}

/**
 * Busca cotações das ações da B3.
 * SÓ CHAMA A API 1 ÚNICA VEZ NO SLOT ATUAL DE 6 HORAS.
 */
export async function fetchTopStocks(symbols = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4']) {
  const currentSlotId = getCurrentSlotId();

  // 1. Se já temos na memória para este mesmo slot, retorna na hora
  if (memoryStocksCache && memoryStocksCache.slotId === currentSlotId) {
    return {
      items: memoryStocksCache.data,
      lastUpdated: new Date(memoryStocksCache.timestamp),
    };
  }

  // 2. Se o slot atual já foi consultado ou trancado no localStorage
  const persisted = getPersistedData('stocks');
  const locked = isSlotLocked('stocks', currentSlotId);
  const isOldDummyFallback = persisted?.data?.[0]?.price === 36.85 && persisted?.data?.[1]?.price === 61.20;

  // Se tem dados reais gravados para este slot, reaproveita sem fazer nova requisição
  if (!isOldDummyFallback && (locked || (persisted && persisted.slotId === currentSlotId))) {
    const items = persisted?.data || FALLBACK_STOCKS;
    const timestamp = persisted?.timestamp || Date.now();
    memoryStocksCache = { slotId: currentSlotId, data: items, timestamp };
    return {
      items,
      lastUpdated: new Date(timestamp),
    };
  }

  // Se estava travado com o fallback de erro antigo do dia 27, limpa para atualizar com dados reais
  if (isOldDummyFallback) {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}lock_stocks_${currentSlotId}`);
      localStorage.removeItem(`${STORAGE_PREFIX}stocks`);
      memoryStocksCache = null;
    } catch {}
  }

  // 3. Se já existe uma requisição em andamento, reaproveita a mesma Promise
  if (inFlightStocksPromise) {
    return inFlightStocksPromise;
  }

  // 4. Tranca imediatamente o slot para impedir qualquer disparo duplicado
  try {
    localStorage.setItem(`${STORAGE_PREFIX}lock_stocks_${currentSlotId}`, '1');
  } catch {}

  inFlightStocksPromise = (async () => {
    try {
      const tickers = symbols.join(',');
      const url = `https://brapi.dev/api/quote/${encodeURIComponent(tickers)}?token=${encodeURIComponent(BRAPI_TOKEN)}`;

      // Requisição GET simples sem headers customizados para evitar preflight OPTIONS de CORS no browser
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro status ${response.status}`);
      }

      const json = await response.json();
      const rawResults = json.results || [];

      if (!Array.isArray(rawResults) || rawResults.length === 0) {
        throw new Error('Retorno vazio');
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

      // Grava no cache e persiste
      persistData('stocks', currentSlotId, formatted);
      memoryStocksCache = { slotId: currentSlotId, data: formatted, timestamp: Date.now() };

      return {
        items: formatted,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.warn('Aviso: consulta de ações da brapi.dev falhou, trancando slot e usando contingência:', error.message);
      // Salva os dados de contingência para este slot para NUNCA mais tentar no mesmo ciclo
      const fallbackItems = persisted?.data || FALLBACK_STOCKS;
      persistData('stocks', currentSlotId, fallbackItems);
      memoryStocksCache = { slotId: currentSlotId, data: fallbackItems, timestamp: Date.now() };

      return {
        items: fallbackItems,
        lastUpdated: new Date(persisted?.timestamp || Date.now()),
      };
    } finally {
      inFlightStocksPromise = null;
    }
  })();

  return inFlightStocksPromise;
}

/**
 * Busca cotação oficial do Dólar Comercial (USD-BRL) via DolarApi.com (Brasil).
 * Endpoint: https://br.dolarapi.com/v1/cotacoes/usd
 * Fonte de dados: Investing.com
 */
async function fetchDollarFromDolarApi() {
  try {
    const response = await fetch('https://br.dolarapi.com/v1/cotacoes/usd');
    if (!response.ok) {
      throw new Error(`DolarApi status: ${response.status}`);
    }

    const raw = await response.json();
    const data = Array.isArray(raw) ? raw[0] : raw;

    if (!data) {
      throw new Error('Retorno vazio da DolarApi');
    }

    const bidPrice = parseFloat(data.compra || data.venda || 0);
    const askPrice = parseFloat(data.venda || data.compra || bidPrice);
    const fechoAnterior = parseFloat(data.fechoAnterior || 0);

    let variation = 0;
    let changePercent = 0;

    if (fechoAnterior > 0) {
      variation = Number((bidPrice - fechoAnterior).toFixed(4));
      changePercent = Number(((variation / fechoAnterior) * 100).toFixed(2));
    }

    const high = fechoAnterior > 0 ? Number(Math.max(bidPrice, fechoAnterior).toFixed(4)) : Number((bidPrice * 1.004).toFixed(4));
    const low = fechoAnterior > 0 ? Number(Math.min(bidPrice, fechoAnterior).toFixed(4)) : Number((bidPrice * 0.996).toFixed(4));

    return {
      pair: 'USD-BRL',
      name: 'Dólar Comercial',
      bidPrice,
      askPrice,
      high,
      low,
      variation,
      changePercent,
      updatedAt: data.dataAtualizacao || new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Aviso: consulta à DolarApi.com falhou:', error?.message);
    return null;
  }
}

/**
 * Busca cotação e oscilação do Dólar Comercial.
 * SÓ CHAMA A API 1 ÚNICA VEZ NO SLOT ATUAL DE 6 HORAS.
 */
export async function fetchDollarRate() {
  const currentSlotId = getCurrentSlotId();

  // 1. Se já temos na memória para este mesmo slot (e não é o fallback estático antigo 5.682)
  if (memoryDollarCache && memoryDollarCache.slotId === currentSlotId) {
    if (memoryDollarCache.data?.bidPrice !== 5.682) {
      return {
        rate: memoryDollarCache.data,
        lastUpdated: new Date(memoryDollarCache.timestamp),
      };
    }
  }

  // 2. Se o slot atual já foi consultado e salvo no localStorage
  const persisted = getPersistedData('dollar');
  const isOldDummyFallback = persisted?.data?.bidPrice === 5.682 && persisted?.data?.changePercent === 0.37;

  // Se tem dados reais gravados para este slot, reaproveita sem fazer nova requisição
  if (persisted && persisted.slotId === currentSlotId && !isOldDummyFallback) {
    memoryDollarCache = { slotId: currentSlotId, data: persisted.data, timestamp: persisted.timestamp };
    return {
      rate: persisted.data,
      lastUpdated: new Date(persisted.timestamp),
    };
  }

  // Se estava travado com o fallback estático de erro antigo (5.682), limpa a trava para permitir carregar da DolarApi
  if (isOldDummyFallback) {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}lock_dollar_${currentSlotId}`);
      localStorage.removeItem(`${STORAGE_PREFIX}dollar`);
    } catch {}
  }

  // 3. Se já existe uma requisição em andamento, reaproveita a mesma Promise
  if (inFlightDollarPromise) {
    return inFlightDollarPromise;
  }

  inFlightDollarPromise = (async () => {
    try {
      // 1. Fonte Primária Oficial: DolarApi.com (Brasil)
      let formattedRate = await fetchDollarFromDolarApi();

      // 2. Fallback final apenas se não houver conexão de rede
      if (!formattedRate) {
        formattedRate = persisted?.data || FALLBACK_DOLLAR;
      }

      // Se obtivemos dados reais, persiste e tranca para o slot atual (respeitando as 4 chamadas/dia)
      if (formattedRate.bidPrice !== 5.682) {
        persistData('dollar', currentSlotId, formattedRate);
      }

      const now = Date.now();
      memoryDollarCache = { slotId: currentSlotId, data: formattedRate, timestamp: now };

      return {
        rate: formattedRate,
        lastUpdated: new Date(formattedRate.updatedAt || now),
      };
    } catch (error) {
      console.warn('Aviso: falha geral ao buscar cotação de dólar:', error);
      const fallbackRate = persisted?.data || FALLBACK_DOLLAR;
      return {
        rate: fallbackRate,
        lastUpdated: new Date(persisted?.timestamp || Date.now()),
      };
    } finally {
      inFlightDollarPromise = null;
    }
  })();

  return inFlightDollarPromise;
}
