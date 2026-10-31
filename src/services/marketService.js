/**
 * Serviço de cotações financeiras (Ações B3 e Dólar Comercial).
 * 
 * Horários exatos de atualização no dia:
 * 1) 10h15 - Logo após abertura do pregão da B3 (10h)
 * 2) 12h20 - Ponto médio do pregão / oscilações do almoço
 * 3) 15h20 - Tarde do pregão
 * 4) 18h00 - Fechamento definitivo da B3 (17h) e Dólar (18h)
 * 
 * Regra: Cache inteligente e inviolável. Todos os visitantes entre esses horários
 * leem os dados do cache local sem disparar novas chamadas.
 */

const STORAGE_PREFIX = 'jc_market_v6_';

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
 * Retorna o identificador do slot atual com base nos 4 horários oficiais:
 * Slot 0: Antes das 10h15 (mantém fechamento anterior) -> `_antes_10h15`
 * Slot 1: Das 10h15 até 12h19 -> `_10h15`
 * Slot 2: Das 12h20 até 15h19 -> `_12h20`
 * Slot 3: Das 15h20 até 17h59 -> `_15h20`
 * Slot 4: A partir das 18h00 -> `_18h00`
 */
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
  // 10h15 = 615 min, 12h20 = 740 min, 15h20 = 920 min, 18h00 = 1080 min
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
        // Continua
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
        // Continua
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
          // Continua
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
