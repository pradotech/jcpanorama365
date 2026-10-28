import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Moon,
  CloudMoon,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Calendar,
} from 'lucide-react';

/**
 * Renderiza o ícone de tempo correspondente
 */
function renderWeatherIcon(iconType, isDay = true, className = 'w-6 h-6') {
  switch (iconType) {
    case 'sun':
      return isDay ? (
        <Sun className={`${className} text-amber-500`} />
      ) : (
        <Moon className={`${className} text-indigo-300`} />
      );
    case 'sun-cloud':
    case 'cloud-sun':
      return isDay ? (
        <CloudSun className={`${className} text-amber-500`} />
      ) : (
        <CloudMoon className={`${className} text-indigo-300`} />
      );
    case 'cloud':
      return <Cloud className={`${className} text-slate-400`} />;
    case 'drizzle':
      return <CloudDrizzle className={`${className} text-cyan-500`} />;
    case 'rain':
    case 'rain-heavy':
      return <CloudRain className={`${className} text-blue-500`} />;
    case 'thunder':
      return <CloudLightning className={`${className} text-amber-400`} />;
    case 'fog':
      return <CloudFog className={`${className} text-slate-400`} />;
    default:
      return <Sun className={`${className} text-amber-500`} />;
  }
}

/**
 * Formata data e hora
 */
function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} às ${timeStr}`;
}

export default function WeatherCard({ weather, loading = false }) {
  const isDay = weather?.isDay ?? true;
  // Próximos dias da semana (excluindo o índice 0 que é hoje)
  const upcomingDays = (weather?.forecast || []).filter(item => !item.isToday).slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-card border border-navy-100/70 overflow-hidden transition-all hover:shadow-card-hover w-full">
      {/* Header do Card */}
      <div
        className="px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between text-white"
        style={{ background: 'linear-gradient(to right, #0F1A2E, #2563EB)' }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <MapPin size={17} className="text-cyan-300 shrink-0" />
          <h3 className="font-bold text-xs sm:text-sm tracking-wide truncate">
            {weather?.city || 'Jundiaí, SP'}
          </h3>
        </div>
        <span className="text-[9px] sm:text-[10px] uppercase font-semibold bg-white/15 px-1.5 sm:px-2 py-0.5 rounded text-white/90 shrink-0">
          Tempo & Semana
        </span>
      </div>

      {/* Conteúdo */}
      <div className="p-3.5 sm:p-4">
        {loading && !weather ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-navy-400">
            <span className="w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Carregando previsão do tempo...</span>
          </div>
        ) : (
          <div>
            {/* Bloco Central com Temperatura de Hoje e Condição */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-navy-50/80 border border-navy-100/60 shrink-0">
                  {renderWeatherIcon(weather?.iconType, isDay, 'w-8 h-8 sm:w-9 sm:h-9')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-navy-950 font-mono tracking-tight">
                      {weather?.temperature ?? 24}°C
                    </span>
                  </div>
                  <p className="text-xs text-navy-600 font-medium truncate">
                    {weather?.condition || 'Tempo estável'}
                  </p>
                </div>
              </div>

              {/* Sensação Térmica */}
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-semibold text-navy-400 block mb-0.5">
                  Sensação
                </span>
                <span className="text-sm sm:text-base font-bold text-navy-800 font-mono">
                  {weather?.apparentTemperature ?? 25}°C
                </span>
              </div>
            </div>

            {/* Grid com Máxima, Mínima e Umidade de Hoje */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3 bg-navy-50/60 rounded-xl border border-navy-100/40 text-center mb-3">
              <div>
                <span className="text-[9px] sm:text-[10px] text-navy-400 block font-medium flex items-center justify-center gap-0.5">
                  <ArrowUpRight size={10} className="text-amber-600" /> Máx.
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-navy-800 font-mono">
                  {weather?.tempMax ? `${weather.tempMax}°C` : '--'}
                </span>
              </div>
              <div className="border-x border-navy-100/60">
                <span className="text-[9px] sm:text-[10px] text-navy-400 block font-medium flex items-center justify-center gap-0.5">
                  <ArrowDownRight size={10} className="text-cyan-600" /> Mín.
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-navy-800 font-mono">
                  {weather?.tempMin ? `${weather.tempMin}°C` : '--'}
                </span>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] text-navy-400 block font-medium flex items-center justify-center gap-0.5">
                  <Droplets size={10} className="text-blue-500" /> Umidade
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-navy-800 font-mono">
                  {weather?.humidity ? `${weather.humidity}%` : '--'}
                </span>
              </div>
            </div>

            {/* Previsão para os Próximos Dias da Semana */}
            {upcomingDays.length > 0 && (
              <div className="pt-2.5 border-t border-navy-100/60">
                <div className="flex items-center gap-1.5 mb-2 text-navy-500">
                  <Calendar size={12} className="text-accent-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Próximos Dias
                  </span>
                </div>

                <div className="divide-y divide-navy-50/80">
                  {upcomingDays.map((day) => (
                    <div
                      key={day.date || day.dayLabel}
                      className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2 text-xs"
                    >
                      {/* Dia da Semana */}
                      <span className="font-semibold text-navy-800 w-16 shrink-0 text-[11px] sm:text-xs">
                        {day.dayLabel}
                      </span>

                      {/* Ícone e Condição */}
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <div className="shrink-0">
                          {renderWeatherIcon(day.iconType, true, 'w-4 h-4')}
                        </div>
                        <span className="text-[10px] text-navy-500 truncate hidden xs:inline">
                          {day.condition}
                        </span>
                        {day.rainProbability >= 25 && (
                          <span className="text-[9px] text-blue-600 font-semibold flex items-center gap-0.5 shrink-0 bg-blue-50 px-1 rounded">
                            <Droplets size={8} />
                            {day.rainProbability}%
                          </span>
                        )}
                      </div>

                      {/* Temperaturas Máx e Mín */}
                      <div className="text-right shrink-0 font-mono text-[11px] sm:text-xs flex items-center gap-1.5">
                        <span className="font-bold text-navy-900">
                          {day.tempMax}°
                        </span>
                        <span className="text-navy-400 text-[10px]">
                          {day.tempMin}°
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rodapé sutil */}
            <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-navy-100/50 flex flex-wrap items-center justify-between gap-1 text-[9px] sm:text-[10px] text-navy-400">
              <span className="truncate">Open-Meteo • 7 dias</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">
                  {weather?.updatedAt ? `Atualizado em ${formatDateTime(weather.updatedAt)}` : 'Previsão semanal'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
