import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTopStocks, fetchDollarRate, getCurrentSlotId } from '../services/marketService';

export function useMarketData() {
  const [stocks, setStocks] = useState([]);
  const [dollar, setDollar] = useState(null);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingDollar, setLoadingDollar] = useState(true);
  const [errorStocks, setErrorStocks] = useState(null);
  const [errorDollar, setErrorDollar] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const currentSlotRef = useRef(getCurrentSlotId());

  const loadData = useCallback(async () => {
    // Carrega Ações (só consulta a API se o slot atual de 6h não tiver sido coletado)
    setLoadingStocks(true);
    fetchTopStocks()
      .then((res) => {
        setStocks(res.items || []);
        if (res.lastUpdated) {
          setLastUpdated(res.lastUpdated);
        }
        setErrorStocks(null);
      })
      .catch((err) => {
        setErrorStocks(err.message);
      })
      .finally(() => {
        setLoadingStocks(false);
      });

    // Carrega Dólar (só consulta a API se o slot atual de 6h não tiver sido coletado)
    setLoadingDollar(true);
    fetchDollarRate()
      .then((res) => {
        setDollar(res.rate || null);
        if (res.lastUpdated) {
          setLastUpdated(res.lastUpdated);
        }
        setErrorDollar(null);
      })
      .catch((err) => {
        setErrorDollar(err.message);
      })
      .finally(() => {
        setLoadingDollar(false);
      });
  }, []);

  useEffect(() => {
    // Carga inicial
    loadData();

    // Checagem a cada 60 segundos se o slot do dia virou (mudou de faixa de 6h)
    const intervalId = setInterval(() => {
      const newSlot = getCurrentSlotId();
      if (newSlot !== currentSlotRef.current) {
        currentSlotRef.current = newSlot;
        loadData();
      }
    }, 60 * 1000);

    // Quando o usuário volta à aba, checa se o slot do dia virou
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const newSlot = getCurrentSlotId();
        if (newSlot !== currentSlotRef.current) {
          currentSlotRef.current = newSlot;
          loadData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadData]);

  return {
    stocks,
    dollar,
    loadingStocks,
    loadingDollar,
    errorStocks,
    errorDollar,
    lastUpdated,
  };
}
