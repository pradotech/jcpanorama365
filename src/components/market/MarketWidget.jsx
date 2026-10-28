import { useMarketData } from '../../hooks/useMarketData';
import StocksCard from './StocksCard';
import DollarCard from './DollarCard';

/**
 * Widget com os 2 cards de mercado financeiro:
 * - 4 principais ações da B3
 * - Cotação e oscilação do Dólar Comercial
 *
 * @param {string} layout 'vertical' para sidebar (empilhado) ou 'grid' para 2 colunas
 */
export default function MarketWidget({ layout = 'vertical' }) {
  const {
    stocks,
    dollar,
    loadingStocks,
    loadingDollar,
    lastUpdated,
  } = useMarketData();

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DollarCard
          dollar={dollar}
          loading={loadingDollar}
          lastUpdated={lastUpdated}
        />
        <StocksCard
          stocks={stocks}
          loading={loadingStocks}
          lastUpdated={lastUpdated}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DollarCard
        dollar={dollar}
        loading={loadingDollar}
        lastUpdated={lastUpdated}
      />
      <StocksCard
        stocks={stocks}
        loading={loadingStocks}
        lastUpdated={lastUpdated}
      />
    </div>
  );
}
