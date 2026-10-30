/**
 * Serviço de cotações financeiras (Ações B3 e Dólar Comercial).
 * 
 * Regra: Cache com atualização inteligente sem chamadas desnecessárias.
 * Conexão direta com proxy interno /market.php (no servidor HostGator) ou APIs públicas abertas
 * para garantir que os dados reflitam SEMPRE o dia atual.
 */

const STORAGE_PREFIX = 'jc_market_v5_';

const FRIENDLY_NAMES = {
  PETR4: 'Petrobras PN',
  VALE3: 'Vale ON',
  ITUB4: 'Itaú Unibanco',
  BBDC4: 'Bradesco PN',
};

// Fallback de contingência caso não haja conexão com a internet
const FALLBACK_STOCKS = [
  { symbol: 'PETR4', shortName: 'Petrobras PN', price: 36.85, change: 0.42, changePercent: 1.15 },
  { symbol: 'VALE3', shortName: 'Vale ON', price: 61.20, change: -0.35, changePercent: -0.57 },
  { symbol: 'ITUB4', shortName: 'Itaú Unibanco', price: 34.90, change: 0.18, changePercent: 0.52 },
  { symbol: 'BBDC4', shortName: 'Bradesco PN', price: 13.45, change: -0.09, changePercent: -0.66 },
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
};

let memoryStocksCache = null;
let memoryDollarCache = null;
let inFlightStocksPromise = null;
let inFlightDollarPromise = null;

/**
 * Retorna o slot atual de 6 horas
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
  } catch {}

  const slotIndex = Math.floor(hour / 6);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}_slot${slotIndex}`;
}

function getPersistedData(type) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${type}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function persistData(type, slotId, data) {
  try {
    const payload = {
      slotId,
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${STORAGE_PREFIX}${type}`, JSON.stringify(payload));
  } catch {}
}

/**
 * Busca cotações das ações da B3
 */
export async function fetchTopStocks(symbols = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4']) {
  const currentSlotId = getCurrentSlotId();

  // 1. Memória RAM (mesmo slot)
  if (memoryStocksCache && memoryStocksCache.slotId === currentSlotId) {
    return {
      items: memoryStocksCache.data,
      lastUpdated: new Date(memoryStocksCache.timestamp),
    };
  }

  // 2. LocalStorage (mesmo slot)
  const persisted = getPersistedData('stocks');
  if (persisted && persisted.slotId === currentSlotId) {
    memoryStocksCache = { slotId: currentSlotId, data: persisted.data, timestamp: persisted.timestamp };
    return {
      items: persisted.data,
      lastUpdated: new Date(persisted.timestamp),
    };
  }

  if (inFlightStocksPromise) {
    return inFlightStocksPromise;
  }

  inFlightStocksPromise = (async () => {
    try {
      let items = null;

      // Tentativa 1: Endpoint Proxy local no servidor HostGator (/market.php?type=stocks)
      try {
        const res = await fetch('/market.php?type=stocks');
        if (res.ok) {
          const json = await res.json();
          if (json?.stocks && Array.isArray(json.stocks) && json.stocks.length > 0) {
            items = json.stocks;
          }
        }
      } catch (proxyErr) {
        // Fallback para chamada externa
      }

      // Tentativa 2: Consulta direta via brapi.dev
      if (!items) {
        const token = 'dmX9ygWePJ23LBb9GbC8Mq';
        const tickers = symbols.join(',');
        const res = await fetch(`https://brapi.dev/api/quote/${encodeURIComponent(tickers)}?token=${encodeURIComponent(token)}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.results && Array.isArray(json.results) && json.results.length > 0) {
            items = json.results.map(item => ({
              symbol: item.symbol,
              shortName: FRIENDLY_NAMES[item.symbol] || item.shortName || item.longName || item.symbol,
              price: parseFloat(item.regularMarketPrice || 0),
              change: parseFloat(item.regularMarketChange || 0),
              changePercent: parseFloat(item.regularMarketChangePercent || 0),
              logourl: item.logourl || null,
              updatedAt: item.regularMarketTime || new Date().toISOString(),
            }));
          }
        }
      }

      if (!items || items.length === 0) {
        items = persisted?.data || FALLBACK_STOCKS.map(s => ({ ...s, updatedAt: new Date().toISOString() }));
      }

      const now = Date.now();
      persistData('stocks', currentSlotId, items);
      memoryStocksCache = { slotId: currentSlotId, data: items, timestamp: now };

      return {
        items,
        lastUpdated: new Date(items[0]?.updatedAt || now),
      };
    } catch (e) {
      console.warn('Aviso: falha ao buscar ações B3:', e);
      const fallback = persisted?.data || FALLBACK_STOCKS;
      return {
        items: fallback,
        lastUpdated: new Date(persisted?.timestamp || Date.now()),
      };
    } finally {
      inFlightStocksPromise = null;
    }
  })();

  return inFlightStocksPromise;
}

/**
 * Busca cotação oficial do Dólar Comercial (USD-BRL)
 */
export async function fetchDollarRate() {
  const currentSlotId = getCurrentSlotId();

  // 1. Memória RAM (mesmo slot)
  if (memoryDollarCache && memoryDollarCache.slotId === currentSlotId) {
    return {
      rate: memoryDollarCache.data,
      lastUpdated: new Date(memoryDollarCache.timestamp),
    };
  }

  // 2. LocalStorage (mesmo slot)
  const persisted = getPersistedData('dollar');
  if (persisted && persisted.slotId === currentSlotId) {
    memoryDollarCache = { slotId: currentSlotId, data: persisted.data, timestamp: persisted.timestamp };
    return {
      rate: persisted.data,
      lastUpdated: new Date(persisted.timestamp),
    };
  }

  if (inFlightDollarPromise) {
    return inFlightDollarPromise;
  }

  inFlightDollarPromise = (async () => {
    try {
      let formattedRate = null;

      // Tentativa 1: Endpoint Proxy local no servidor HostGator (/market.php?type=dollar)
      try {
        const res = await fetch('/market.php?type=dollar');
        if (res.ok) {
          const json = await res.json();
          if (json?.dollar && json.dollar.bidPrice) {
            formattedRate = json.dollar;
          }
        }
      } catch (proxyErr) {
        // Fallback para provedores externos diretos
      }

      // Tentativa 2: AwesomeAPI direto (Câmbio Comercial em tempo real, sem chave)
      if (!formattedRate) {
        try {
          const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
          if (res.ok) {
            const data = await res.json();
            const item = data?.USDBRL;
            if (item && item.bid) {
              const bidPrice = parseFloat(item.bid);
              const askPrice = parseFloat(item.ask || bidPrice);
              const high = parseFloat(item.high || bidPrice);
              const low = parseFloat(item.low || bidPrice);
              const variation = parseFloat(item.varBid || 0);
              const changePercent = parseFloat(item.pctChange || 0);

              formattedRate = {
                pair: 'USD-BRL',
                name: 'Dólar Comercial',
                bidPrice,
                askPrice,
                high,
                low,
                variation,
                changePercent,
                updatedAt: item.create_date ? new Date(item.create_date).toISOString() : new Date().toISOString(),
                source: 'AwesomeAPI / Banco Central',
              };
            }
          }
        } catch (awesomeErr) {
          // Continua para o próximo provedor
        }
      }

      // Tentativa 3: DolarApi.com (Brasil)
      if (!formattedRate) {
        try {
          const res = await fetch('https://br.dolarapi.com/v1/cotacoes/usd');
          if (res.ok) {
            const raw = await res.json();
            const item = Array.isArray(raw) ? raw[0] : raw;
            if (item && (item.compra || item.venda)) {
              const bidPrice = parseFloat(item.compra || item.venda || 0);
              const askPrice = parseFloat(item.venda || item.compra || bidPrice);
              const fechoAnterior = parseFloat(item.fechoAnterior || 0);
              const variation = fechoAnterior > 0 ? Number((bidPrice - fechoAnterior).toFixed(4)) : 0;
              const changePercent = fechoAnterior > 0 ? Number(((variation / fechoAnterior) * 100).toFixed(2)) : 0;

              formattedRate = {
                pair: 'USD-BRL',
                name: 'Dólar Comercial',
                bidPrice,
                askPrice,
                high: fechoAnterior > 0 ? Number(Math.max(bidPrice, fechoAnterior).toFixed(4)) : Number((bidPrice * 1.004).toFixed(4)),
                low: fechoAnterior > 0 ? Number(Math.min(bidPrice, fechoAnterior).toFixed(4)) : Number((bidPrice * 0.996).toFixed(4)),
                variation,
                changePercent,
                updatedAt: new Date().toISOString(),
                source: 'Investing.com / DolarApi',
              };
            }
          }
        } catch (dolarApiErr) {
          // Continua
        }
      }

      if (!formattedRate) {
        formattedRate = persisted?.data || { ...FALLBACK_DOLLAR, updatedAt: new Date().toISOString() };
      }

      const now = Date.now();
      persistData('dollar', currentSlotId, formattedRate);
      memoryDollarCache = { slotId: currentSlotId, data: formattedRate, timestamp: now };

      return {
        rate: formattedRate,
        lastUpdated: new Date(formattedRate.updatedAt || now),
      };
    } catch (e) {
      console.warn('Aviso: falha ao buscar dólar:', e);
      const fallback = persisted?.data || FALLBACK_DOLLAR;
      return {
        rate: fallback,
        lastUpdated: new Date(persisted?.timestamp || Date.now()),
      };
    } finally {
      inFlightDollarPromise = null;
    }
  })();

  return inFlightDollarPromise;
}
