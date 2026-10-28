import { useState } from 'react';
import { DollarSign, BarChart2 } from 'lucide-react';
import { useMarketData } from '../../hooks/useMarketData';
import DollarCard from './DollarCard';
import StocksCard from './StocksCard';

/**
 * Componente que exibe os cards de Cotação de Dólar e Ações B3:
 * - Desktop (>= 1024px): Posicionado na coluna direita, empilhado com sticky scroll.
 * - Tablet (640px a 1023px): Grid de 2 colunas perfeitamente alinhadas lado a lado.
 * - Mobile (< 640px): Seletor em abas fluido com visualização do card ativo sem empurrar a tela verticalmente.
 */
export default function MarketOverview() {
  const {
    stocks,
    dollar,
    loadingStocks,
    loadingDollar,
    lastUpdated,
  } = useMarketData();

  // No mobile (< 640px), permite alternar entre Dólar e Ações
  const [activeTab, setActiveTab] = useState('dollar'); // 'dollar' | 'stocks'

  const dollarVariationPercent = dollar?.changePercent;
  const isDollarPositive = dollarVariationPercent > 0;
  const isDollarNegative = dollarVariationPercent < 0;

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* 1. VISUALIZAÇÃO DESKTOP (lg e superior): Empilhados à direita */}
      {/* ========================================================= */}
      <div className="hidden lg:flex flex-col gap-5 sticky top-28">
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

      {/* ========================================================= */}
      {/* 2. VISUALIZAÇÃO TABLET (sm a lg: 640px a 1023px): Grid 2 cols */}
      {/* ========================================================= */}
      <div className="hidden sm:grid lg:hidden sm:grid-cols-2 gap-4 items-start">
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

      {/* ========================================================= */}
      {/* 3. VISUALIZAÇÃO CELULAR (< 640px): Abas compactas e fluidas */}
      {/* ========================================================= */}
      <div className="sm:hidden space-y-2.5">
        {/* Seletor de abas para mobile */}
        <div className="flex rounded-xl bg-navy-100/70 p-1 border border-navy-200/60 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('dollar')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dollar'
                ? 'bg-white text-navy-950 shadow-xs'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            <DollarSign size={14} className={activeTab === 'dollar' ? 'text-accent-600 shrink-0' : 'text-navy-400 shrink-0'} />
            <span className="truncate">Dólar</span>
            {dollar?.bidPrice && (
              <span className={`hidden min-[360px]:inline text-[10px] font-mono ml-0.5 ${
                isDollarPositive ? 'text-emerald-600' : isDollarNegative ? 'text-rose-600' : 'text-navy-500'
              }`}>
                {Number(dollar.bidPrice).toFixed(2).replace('.', ',')}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stocks')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stocks'
                ? 'bg-white text-navy-950 shadow-xs'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            <BarChart2 size={14} className={activeTab === 'stocks' ? 'text-accent-600 shrink-0' : 'text-navy-400 shrink-0'} />
            <span className="truncate">Ações B3</span>
            <span className="hidden min-[360px]:inline text-[10px] bg-navy-100 text-navy-600 px-1 py-0.2 rounded font-medium">
              4 ações
            </span>
          </button>
        </div>

        {/* Card ativo no mobile */}
        <div className="w-full">
          {activeTab === 'dollar' ? (
            <DollarCard
              dollar={dollar}
              loading={loadingDollar}
              lastUpdated={lastUpdated}
            />
          ) : (
            <StocksCard
              stocks={stocks}
              loading={loadingStocks}
              lastUpdated={lastUpdated}
            />
          )}
        </div>
      </div>
    </div>
  );
}
