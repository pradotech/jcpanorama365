import { DollarSign, TrendingUp, TrendingDown, Minus, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Formata valor de câmbio (precisão de 3 ou 4 casas para câmbio)
 */
function formatExchangeRate(value) {
  if (value === undefined || value === null || isNaN(value)) return 'R$ --';
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 3,
    maximumFractionDigits: 4,
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
 * Formata variação em reais
 */
function formatVariation(value) {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}R$ ${Number(Math.abs(value)).toFixed(3).replace('.', ',')}`;
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

export default function DollarCard({ dollar, loading = false, lastUpdated }) {
  const isPositive = dollar?.changePercent > 0;
  const isNegative = dollar?.changePercent < 0;
  const updateDate = lastUpdated || dollar?.updatedAt;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-navy-100/70 overflow-hidden transition-all hover:shadow-card-hover w-full">
      {/* Header do Card */}
      <div
        className="px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between text-white"
        style={{ background: 'linear-gradient(to right, #1E56A0, #0F2D59)' }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <DollarSign size={17} className="text-emerald-300 shrink-0" />
          <h3 className="font-bold text-xs sm:text-sm tracking-wide truncate">Cotação Dólar</h3>
        </div>
        <span className="text-[9px] sm:text-[10px] uppercase font-semibold bg-white/15 px-1.5 sm:px-2 py-0.5 rounded text-white/90 shrink-0">
          USD / BRL
        </span>
      </div>

      {/* Conteúdo */}
      <div className="p-3.5 sm:p-4">
        {loading && !dollar ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-navy-400">
            <RefreshCw size={20} className="animate-spin text-accent-500" />
            <span className="text-xs">Carregando cotação do dólar...</span>
          </div>
        ) : (
          <div>
            {/* Cotação Principal */}
            <div className="flex flex-wrap items-baseline justify-between gap-1.5 mb-2.5 sm:mb-3">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] uppercase font-semibold tracking-wider text-navy-400 block mb-0.5">
                  Dólar Comercial
                </span>
                <span className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight font-mono">
                  {formatExchangeRate(dollar?.bidPrice)}
                </span>
              </div>

              {/* Badge de Oscilação */}
              <div
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-bold shrink-0 ${
                  isPositive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : isNegative
                    ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    : 'bg-navy-100 text-navy-600'
                }`}
              >
                {isPositive && <TrendingUp size={13} className="stroke-[2.5]" />}
                {isNegative && <TrendingDown size={13} className="stroke-[2.5]" />}
                {!isPositive && !isNegative && <Minus size={13} />}
                <span>{formatPercent(dollar?.changePercent)}</span>
              </div>
            </div>

            {/* Grid com Máxima, Mínima e Variação */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3 bg-navy-50/60 rounded-xl border border-navy-100/40 text-center">
              <div>
                <span className="text-[9px] sm:text-[10px] text-navy-400 block font-medium flex items-center justify-center gap-0.5">
                  <ArrowUpRight size={10} className="text-emerald-600" /> Máx.
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-navy-800 font-mono">
                  {dollar?.high ? Number(dollar.high).toFixed(3).replace('.', ',') : '--'}
                </span>
              </div>
              <div className="border-x border-navy-100/60">
                <span className="text-[9px] sm:text-[10px] text-navy-400 block font-medium flex items-center justify-center gap-0.5">
                  <ArrowDownRight size={10} className="text-rose-600" /> Mín.
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-navy-800 font-mono">
                  {dollar?.low ? Number(dollar.low).toFixed(3).replace('.', ',') : '--'}
                </span>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] text-navy-400 block font-medium">
                  Oscilação
                </span>
                <span
                  className={`text-[11px] sm:text-xs font-bold font-mono ${
                    isPositive ? 'text-emerald-700' : isNegative ? 'text-rose-700' : 'text-navy-700'
                  }`}
                >
                  {formatVariation(dollar?.variation)}
                </span>
              </div>
            </div>

            {/* Rodapé sutil */}
            <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-navy-100/50 flex flex-wrap items-center justify-between gap-1 text-[9px] sm:text-[10px] text-navy-400">
              <span className="truncate">PTAX / Banco Central</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">{updateDate ? `Atualizado em ${formatDateTime(updateDate)}` : 'Atualizado'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
