import { TrendingUp, TrendingDown, Minus, RefreshCw, BarChart2 } from 'lucide-react';

/**
 * Formata valor em reais (BRL)
 */
function formatCurrency(value) {
  if (value === undefined || value === null || isNaN(value)) return 'R$ --';
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata variação percentual
 */
function formatPercent(value) {
  if (value === undefined || value === null || isNaN(value)) return '0,00%';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${Number(value).toFixed(2).replace('.', ',')}%`;
}

/**
 * Formata data e hora da última atualização
 */
function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} às ${timeStr}`;
}

export default function StocksCard({ stocks = [], loading = false, lastUpdated }) {
  const updateDate = stocks[0]?.updatedAt || lastUpdated;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-navy-100/70 overflow-hidden transition-all hover:shadow-card-hover w-full">
      {/* Header do Card */}
      <div
        className="px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between text-white"
        style={{ background: 'linear-gradient(to right, #0F1A2E, #1E3A8A)' }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <BarChart2 size={17} className="text-accent-300 shrink-0" />
          <h3 className="font-bold text-xs sm:text-sm tracking-wide truncate">Ações B3</h3>
        </div>
        <span className="text-[9px] sm:text-[10px] uppercase font-semibold bg-white/15 px-1.5 sm:px-2 py-0.5 rounded text-white/90 shrink-0">
          Principais
        </span>
      </div>

      {/* Conteúdo */}
      <div className="p-3.5 sm:p-4">
        {loading && stocks.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-navy-400">
            <RefreshCw size={20} className="animate-spin text-accent-500" />
            <span className="text-xs">Carregando cotações...</span>
          </div>
        ) : (
          <div className="divide-y divide-navy-50">
            {stocks.map((stock) => {
              const isPositive = stock.changePercent > 0;
              const isNegative = stock.changePercent < 0;

              return (
                <div
                  key={stock.symbol}
                  className="py-2 sm:py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2 group hover:bg-navy-50/50 px-1.5 sm:px-2 rounded-lg transition-colors"
                >
                  {/* Ticker e Nome */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-navy-950 tracking-tight">
                        {stock.symbol}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-navy-400 truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[180px]">
                      {stock.shortName}
                    </p>
                  </div>

                  {/* Preço e Variação */}
                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-bold text-navy-900 font-mono">
                      {formatCurrency(stock.price)}
                    </div>
                    <div
                      className={`inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-700'
                          : isNegative
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-navy-100 text-navy-600'
                      }`}
                    >
                      {isPositive && <TrendingUp size={10} className="stroke-[2.5]" />}
                      {isNegative && <TrendingDown size={10} className="stroke-[2.5]" />}
                      {!isPositive && !isNegative && <Minus size={10} />}
                      <span>{formatPercent(stock.changePercent)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rodapé sutil */}
        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-navy-100/50 flex flex-wrap items-center justify-between gap-1 text-[9px] sm:text-[10px] text-navy-400">
          <span className="truncate">B3 • Bovespa</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">{updateDate ? `Atualizado em ${formatDateTime(updateDate)}` : 'Atualizado'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
