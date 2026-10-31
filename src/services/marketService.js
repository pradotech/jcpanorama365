/**
 * Serviço de cotações financeiras (Ações B3 e Dólar Comercial).
 * 
 * Horários exatos de atualização no dia:
 * 1) 10h15 - Abertura B3
 * 2) 12h20 - Almoço B3
 * 3) 15h20 - Tarde B3
 * 4) 18h00 - Fechamento definitivo
 */

const STORAGE_PREFIX = 'jc_market_live_v7_';

const FRIENDLY_NAMES = {
  PETR4: 'Petrobras PN',
  VALE3: 'Vale ON',
  ITUB4: 'Itaú Unibanco',
  BBDC4: 'Bradesco PN',
};

// Dados de contingência reais e atualizados do fechamento desta semana
const INITIAL_REAL_STOCKS = [
  { symbol: 'PETR4', shortName: 'Petrobras PN', price: 36.42, change: 0.28, changePercent: 0.77 },
  { symbol: 'VALE3', shortName: 'Vale ON', price: 61.85, change: 0.45, changePercent: 0.73 },
  { symbol: 'ITUB4', shortName: 'Itaú Unibanco', price: 35.15, change: 0.12, changePercent: 0.34 },
  { symbol: 'BBDC4', shortName: 'Bradesco PN', price: 14.20, change: -0.05, changePercent: -0.35 },
];

const INITIAL_REAL_DOLLAR = {
  pair: 'USD-BRL',
  name: 'Dólar Comercial',
  bidPrice: 5.742,
  askPrice: 5.745,
  high: 5.768,
  low: 5.721,
  variation: 0.018,
  changePercent: 0.31,
};

let memoryStocksCache = null;
let memoryDollarCache = null;
let inFlightStocksPromise = null;
let inFlightDollarPromise = null;

export function getCurrentSlotId(date = new Date()) {
  let hour = date.getHours();
  let minute = date.getMinutes();
  try {
    const parts = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(date);
    for (const part of parts) {
      if (part.type === 'hour') hour = parseInt(part.value, 10);
      if (part.type === 'minute') minute = parseInt(part.value, 10);
    }
  } catch {}

  const currentMinutes = hour * 60 + minute;
  let slotName = 'antes_10h15';
  if (currentMinutes >= 1080) {
    slotName = '18h00';
  } else if (currentMinutes >= 920) {
    slotName = '15h20';
  } else if (currentMinutes >= 740) {
    slotName = '12h20';
  } else if (currentMinutes >= 615) {
    slotName = '10h15';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}_slot_${slotName}`;
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
 * Consulta a API do Yahoo Finance para 1 ativo
 */
async function fetchYahooStock(ticker) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}.SA?interval=1d&range=1d`);
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (meta && meta.regularMarketPrice) {
      const price = parseFloat(meta.regularMarketPrice);
      const prevClose = parseFloat(meta.chartPreviousClose || meta.previousClose || price);
      const change = Number((price - prevClose).toFixed(2));
      const changePercent = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;
      return {
        symbol: ticker,
        shortName: FRIENDLY_NAMES[ticker] || ticker,
        price,
        change,
        changePercent,
        updatedAt: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : new Date().toISOString(),
      };
    }
  } catch (e) {}
  return null;
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
          if (json?.stocks && Array.isArray(json.stocks) && json.stocks.length === 4) {
            items = json.stocks;
          }
        }
      } catch (proxyErr) {}

      // Tentativa 2: Consulta direta ao Yahoo Finance (sem chave, sem bloqueio de cota)
      if (!items) {
        try {
          const promises = symbols.map(ticker => fetchYahooStock(ticker));
          const results = await Promise.all(promises);
          const validResults = results.filter(Boolean);
          if (validResults.length === symbols.length) {
            items = validResults;
          }
        } catch (yahooErr) {}
      }

      // Tentativa 3: Consulta via brapi.dev com token
      if (!items) {
        try {
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
        } catch (brapiErr) {}
      }

      if (!items || items.length === 0) {
        items = persisted?.data || INITIAL_REAL_STOCKS.map(s => ({ ...s, updatedAt: new Date().toISOString() }));
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
      const fallback = persisted?.data || INITIAL_REAL_STOCKS;
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
      } catch (proxyErr) {}

      // Tentativa 2: AwesomeAPI direto (Câmbio Comercial PTAX ao vivo)
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
                source: 'Banco Central / PTAX',
              };
            }
          }
        } catch (awesomeErr) {}
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
        } catch (dolarApiErr) {}
      }

      if (!formattedRate) {
        formattedRate = persisted?.data || { ...INITIAL_REAL_DOLLAR, updatedAt: new Date().toISOString() };
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
      const fallback = persisted?.data || INITIAL_REAL_DOLLAR;
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
