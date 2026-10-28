import { useState, useEffect } from 'react';
import { fetchTopStocks, fetchDollarRate } from '../services/marketService';

export function useMarketData() {
  const [stocks, setStocks] = useState([]);
  const [dollar, setDollar] = useState(null);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingDollar, setLoadingDollar] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Busca ações (trava no service garante que só roda 1x por slot de 6h)
    fetchTopStocks()
      .then((res) => {
        if (isMounted) {
          setStocks(res.items || []);
          if (res.lastUpdated) {
            setLastUpdated(res.lastUpdated);
          }
          setLoadingStocks(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadingStocks(false);
        }
      });

    // Busca dólar (trava no service garante que só roda 1x por slot de 6h)
    fetchDollarRate()
      .then((res) => {
        if (isMounted) {
          setDollar(res.rate || null);
          if (res.lastUpdated) {
            setLastUpdated(res.lastUpdated);
          }
          setLoadingDollar(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadingDollar(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    stocks,
    dollar,
    loadingStocks,
    loadingDollar,
    lastUpdated,
  };
}
