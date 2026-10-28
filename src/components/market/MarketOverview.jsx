import { useState } from 'react';
import { DollarSign, BarChart2, CloudSun } from 'lucide-react';
import { useMarketData } from '../../hooks/useMarketData';
import { useWeather } from '../../hooks/useWeather';
import DollarCard from './DollarCard';
import StocksCard from './StocksCard';
import WeatherCard from '../weather/WeatherCard';

/**
 * Componente que exibe os indicadores essenciais do dia:
 * - Previsão do Tempo (Open-Meteo)
 * - Cotação do Dólar Comercial
 * - Ações da B3
 *
 * Disposição:
 * - Desktop: Card do Tempo ACIMA do Dólar, seguido pela B3.
 * - Tablet: Clima em destaque no topo + Grid de 2 colunas com Dólar e B3.
 * - Mobile: Seletor fluido com 3 abas compactas para não poluir a tela.
 */
export default function MarketOverview() {
  const {
    stocks,
    dollar,
    loadingStocks,
    loadingDollar,
    lastUpdated,
  } = useMarketData();

  const { weather, loading: loadingWeather } = useWeather();

  // No mobile (< 640px), abas: 'weather' | 'dollar' | 'stocks'
  const [activeTab, setActiveTab] = useState('weather');

  const dollarVariationPercent = dollar?.changePercent;
  const isDollarPositive = dollarVariationPercent > 0;
  const isDollarNegative = dollarVariationPercent < 0;

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* 1. VISUALIZAÇÃO DESKTOP (lg e superior): Empilhados à direita */}
      {/* ========================================================= */}
      <div className="hidden lg:flex flex-col gap-5">
        {/* Previsão do Tempo ACIMA da Cotação do Dólar */}
        <WeatherCard
          weather={weather}
          loading={loadingWeather}
        />

        {/* Cotação do Dólar */}
        <DollarCard
          dollar={dollar}
          loading={loadingDollar}
          lastUpdated={lastUpdated}
        />

        {/* Cotação Ações B3 */}
        <StocksCard
          stocks={stocks}
          loading={loadingStocks}
          lastUpdated={lastUpdated}
        />
      </div>

      {/* ========================================================= */}
      {/* 2. VISUALIZAÇÃO TABLET (sm a lg: 640px a 1023px)          */}
      {/* ========================================================= */}
      <div className="hidden sm:flex lg:hidden flex-col gap-4">
        {/* Previsão do Tempo */}
        <WeatherCard
          weather={weather}
          loading={loadingWeather}
        />

        {/* Dólar e B3 lado a lado */}
        <div className="grid grid-cols-2 gap-4 items-start">
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
      </div>

      {/* ========================================================= */}
      {/* 3. VISUALIZAÇÃO CELULAR (< 640px): 3 Abas Compactas        */}
      {/* ========================================================= */}
      <div className="sm:hidden space-y-2.5">
        {/* Seletor de 3 abas para mobile */}
        <div className="flex rounded-xl bg-navy-100/70 p-1 border border-navy-200/60 shadow-xs">
          {/* Aba Clima */}
          <button
            type="button"
            onClick={() => setActiveTab('weather')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'weather'
                ? 'bg-white text-navy-950 shadow-xs'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            <CloudSun size={14} className={activeTab === 'weather' ? 'text-amber-500 shrink-0' : 'text-navy-400 shrink-0'} />
            <span className="truncate">Clima</span>
            {weather?.temperature !== undefined && (
              <span className="text-[10px] font-mono text-navy-600 ml-0.5">
                {weather.temperature}°C
              </span>
            )}
          </button>

          {/* Aba Dólar */}
          <button
            type="button"
            onClick={() => setActiveTab('dollar')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

          {/* Aba B3 */}
          <button
            type="button"
            onClick={() => setActiveTab('stocks')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stocks'
                ? 'bg-white text-navy-950 shadow-xs'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            <BarChart2 size={14} className={activeTab === 'stocks' ? 'text-accent-600 shrink-0' : 'text-navy-400 shrink-0'} />
            <span className="truncate">Ações B3</span>
          </button>
        </div>

        {/* Card ativo no celular */}
        <div className="w-full">
          {activeTab === 'weather' && (
            <WeatherCard
              weather={weather}
              loading={loadingWeather}
            />
          )}

          {activeTab === 'dollar' && (
            <DollarCard
              dollar={dollar}
              loading={loadingDollar}
              lastUpdated={lastUpdated}
            />
          )}

          {activeTab === 'stocks' && (
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
