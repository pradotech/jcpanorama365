import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Eye, PenLine, Clock, TrendingUp, PlusCircle,
  MousePointerClick, Calendar, BarChart2, RefreshCw, Award, ArrowUpRight, Flame
} from 'lucide-react';
import { useNews } from '../../hooks/useNews';
import categories from '../../data/categories';
import CategoryBadge from '../../components/ui/CategoryBadge';
import {
  getNewsViewsByDate,
  getDailyViewsHistory,
  getTotalViewsCount,
  getLocalDateString
} from '../../services/analyticsService';

export default function AdminDashboard() {
  const { getStats, getAllNews, getNewsByCategory } = useNews();
  const stats = getStats();
  const recentNews = getAllNews().slice(0, 8);

  // Data de hoje e ontem no fuso oficial de Brasília (virando estritamente às 00:00)
  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateString(d);
  }, []);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [dailyRanking, setDailyRanking] = useState([]);
  const [historyViews, setHistoryViews] = useState([]);
  const [totalAllTime, setTotalAllTime] = useState(0);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Carregar dados de analytics
  const loadAnalytics = useCallback(async (date) => {
    setLoadingAnalytics(true);
    try {
      const [ranking, history, allTime] = await Promise.all([
        getNewsViewsByDate(date),
        getDailyViewsHistory(14),
        getTotalViewsCount()
      ]);
      setDailyRanking(ranking);
      setHistoryViews(history);
      setTotalAllTime(allTime);
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics(selectedDate);
  }, [selectedDate, loadAnalytics]);

  // Cálculos do dia selecionado
  const totalClicksSelectedDay = useMemo(() => {
    return dailyRanking.reduce((acc, curr) => acc + (curr.total_clicks || 0), 0);
  }, [dailyRanking]);

  const topNewsOfDay = dailyRanking.length > 0 ? dailyRanking[0] : null;

  // Encontrar o maior valor no histórico para escala do gráfico
  const maxHistoryClicks = useMemo(() => {
    const max = Math.max(...historyViews.map(h => h.total_clicks), 1);
    return max;
  }, [historyViews]);

  // Formatar data para exibição amigável
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const isToday = selectedDate === todayStr;
  const isYesterday = selectedDate === yesterdayStr;

  const statCards = [
    {
      label: 'Cliques Hoje',
      value: isToday ? totalClicksSelectedDay : (historyViews.find(h => h.date_key === todayStr)?.total_clicks || 0),
      icon: MousePointerClick,
      color: 'from-accent-500 to-accent-600',
    },
    {
      label: 'Total de Acessos Acumulados',
      value: totalAllTime,
      icon: Eye,
      color: 'from-blue-600 to-indigo-700',
    },
    {
      label: 'Notícias Publicadas',
      value: stats.published,
      icon: FileText,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Rascunhos',
      value: stats.drafts,
      icon: PenLine,
      color: 'from-amber-500 to-amber-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="text-navy-500 text-sm mt-1">Visão geral e desempenho do portal em tempo real</p>
        </div>
        <Link
          to="/admin/noticias/nova"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-500 text-white rounded-lg font-semibold text-sm hover:bg-accent-600 transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          Nova Notícia
        </Link>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl shadow-card p-5 flex items-center gap-4 border border-navy-100/60"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">
                  {typeof card.value === 'number' ? card.value.toLocaleString('pt-BR') : card.value}
                </p>
                <p className="text-xs text-navy-500 font-medium">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* SEÇÃO PRINCIPAL DE MÉTRICAS & CLIQUES POR DIA */}
      <div className="bg-white rounded-xl shadow-card p-6 border border-navy-100/70 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-navy-100">
          <div>
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <BarChart2 size={20} className="text-accent-500" />
              Acessos e Desempenho por Dia
            </h2>
            <p className="text-xs text-navy-500 mt-0.5">
              Consulte os cliques e descubra quais notícias foram mais lidas em cada data
            </p>
          </div>

          {/* Filtros de data */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isToday
                  ? 'bg-accent-500 text-white shadow-sm'
                  : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setSelectedDate(yesterdayStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isYesterday
                  ? 'bg-accent-500 text-white shadow-sm'
                  : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
              }`}
            >
              Ontem
            </button>

            <div className="flex items-center gap-1.5 bg-navy-50 px-2.5 py-1 rounded-lg border border-navy-200">
              <Calendar size={14} className="text-navy-500" />
              <input
                type="date"
                max={todayStr}
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-navy-800 focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => loadAnalytics(selectedDate)}
              title="Atualizar dados"
              className="p-1.5 text-navy-500 hover:text-accent-600 hover:bg-navy-50 rounded-lg transition-colors"
            >
              <RefreshCw size={15} className={loadingAnalytics ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Mini-cards do dia selecionado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-navy-50/60 rounded-xl p-4 border border-navy-100">
            <span className="text-xs font-medium text-navy-500 uppercase tracking-wider block">
              Cliques em {formatDisplayDate(selectedDate)}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-navy-900">
                {totalClicksSelectedDay.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-navy-500">acessos</span>
            </div>
          </div>

          <div className="bg-navy-50/60 rounded-xl p-4 border border-navy-100">
            <span className="text-xs font-medium text-navy-500 uppercase tracking-wider block">
              Matérias Acessadas no Dia
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-navy-900">
                {dailyRanking.length}
              </span>
              <span className="text-xs text-navy-500">notícias</span>
            </div>
          </div>

          <div className="bg-accent-50/50 rounded-xl p-4 border border-accent-100/70">
            <span className="text-xs font-medium text-accent-700 uppercase tracking-wider flex items-center gap-1">
              <Flame size={13} className="text-accent-600" />
              Mais Lida de {formatDisplayDate(selectedDate)}
            </span>
            <p className="text-sm font-bold text-navy-900 mt-1 line-clamp-1" title={topNewsOfDay?.title}>
              {topNewsOfDay ? topNewsOfDay.title : 'Nenhum clique registrado'}
            </p>
            {topNewsOfDay && (
              <span className="text-xs text-accent-600 font-semibold mt-0.5 block">
                {topNewsOfDay.total_clicks} acessos ({Math.round((topNewsOfDay.total_clicks / (totalClicksSelectedDay || 1)) * 100)}% do dia)
              </span>
            )}
          </div>
        </div>

        {/* Grid com Tabela de Mais Lidas + Gráfico de Histórico */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Tabela: Notícias Mais Lidas do Dia (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-1.5">
              <Award size={16} className="text-amber-500" />
              Notícias Mais Acessadas no Dia ({formatDisplayDate(selectedDate)})
            </h3>

            <div className="border border-navy-100 rounded-xl overflow-hidden flex-1 bg-white">
              {loadingAnalytics ? (
                <div className="p-8 text-center text-sm text-navy-500">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-accent-500" />
                  Carregando estatísticas...
                </div>
              ) : dailyRanking.length === 0 ? (
                <div className="p-8 text-center">
                  <MousePointerClick size={32} className="mx-auto text-navy-300 mb-2" />
                  <p className="text-sm font-semibold text-navy-700">Nenhum clique registrado nesta data</p>
                  <p className="text-xs text-navy-400 mt-1 max-w-sm mx-auto">
                    Assim que os leitores acessarem as notícias no site em {formatDisplayDate(selectedDate)}, os cliques aparecerão aqui em tempo real.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-navy-50 max-h-[380px] overflow-y-auto">
                  {dailyRanking.map((item, index) => {
                    const percentage = totalClicksSelectedDay > 0
                      ? Math.round((item.total_clicks / totalClicksSelectedDay) * 100)
                      : 0;

                    const medalColors = [
                      'bg-amber-100 text-amber-800 border-amber-300',
                      'bg-slate-200 text-slate-800 border-slate-300',
                      'bg-amber-700/10 text-amber-900 border-amber-400/40',
                    ];

                    return (
                      <div key={item.news_id} className="p-3.5 hover:bg-navy-50/40 transition-colors flex items-center gap-3">
                        <div className="shrink-0 w-7 text-center">
                          {index < 3 ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border ${medalColors[index]}`}>
                              {index + 1}º
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-navy-400">
                              {index + 1}º
                            </span>
                          )}
                        </div>

                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                            className="w-11 h-8 rounded-lg object-cover shrink-0 bg-navy-100"
                          />
                        ) : (
                          <div className="w-11 h-8 rounded-lg bg-navy-100 flex items-center justify-center shrink-0">
                            <FileText size={14} className="text-navy-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CategoryBadge categoryId={item.category} size="sm" />
                          </div>
                          <Link
                            to={`/noticia/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-navy-900 hover:text-accent-600 transition-colors line-clamp-1 inline-flex items-center gap-1 group"
                          >
                            <span>{item.title}</span>
                            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </Link>

                          {/* Barra de porcentagem relativa */}
                          <div className="w-full bg-navy-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div
                              className="bg-accent-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(percentage, 4)}%` }}
                            />
                          </div>
                        </div>

                        <div className="shrink-0 text-right pl-2">
                          <span className="text-sm font-bold text-navy-900 block">
                            {item.total_clicks}
                          </span>
                          <span className="text-[11px] text-navy-500">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Barras: Histórico dos Últimos 14 Dias (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-accent-500" />
                Evolução Diária (Últimos 14 dias)
              </h3>
              <span className="text-[11px] text-navy-400">Clique na barra para ver o dia</span>
            </div>

            <div className="border border-navy-100 rounded-xl p-4 bg-navy-50/30 flex-1 flex flex-col justify-end">
              {historyViews.length === 0 ? (
                <div className="py-12 text-center text-xs text-navy-400">
                  Nenhum dado histórico registrado ainda.
                </div>
              ) : (
                <div className="flex items-end justify-between gap-1.5 h-48 pt-6 pb-2">
                  {historyViews.map((day) => {
                    const isSelected = day.date_key === selectedDate;
                    const heightPercent = Math.max(Math.round((day.total_clicks / maxHistoryClicks) * 100), 8);
                    const dayNumber = day.date_key.split('-')[2];
                    const monthNumber = day.date_key.split('-')[1];

                    return (
                      <div
                        key={day.date_key}
                        onClick={() => setSelectedDate(day.date_key)}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                        title={`${formatDisplayDate(day.date_key)}: ${day.total_clicks} cliques`}
                      >
                        {/* Tooltip com quantidade ao passar o mouse */}
                        <span className="text-[10px] font-bold text-navy-700 opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                          {day.total_clicks}
                        </span>

                        {/* Barra */}
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            isSelected
                              ? 'bg-accent-600 ring-2 ring-accent-400'
                              : 'bg-accent-200 hover:bg-accent-400'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />

                        {/* Rótulo do dia */}
                        <span className={`text-[10px] mt-1.5 font-medium transition-colors ${
                          isSelected ? 'font-bold text-accent-700' : 'text-navy-400 group-hover:text-navy-700'
                        }`}>
                          {dayNumber}/{monthNumber}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-navy-100/80 flex items-center justify-between text-[11px] text-navy-500">
                <span>Dia selecionado: <strong className="text-navy-900">{formatDisplayDate(selectedDate)}</strong></span>
                <span>Total no dia: <strong className="text-accent-600">{totalClicksSelectedDay}</strong> cliques</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories overview */}
      <div className="bg-white rounded-xl shadow-card p-6 border border-navy-100/70">
        <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-accent-500" />
          Notícias por Categoria
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map(cat => {
            const count = getNewsByCategory(cat.id).length;
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="rounded-xl p-4 text-center transition-all hover:scale-105"
                style={{ backgroundColor: cat.bgLight }}
              >
                <Icon size={20} className="mx-auto mb-2" style={{ color: cat.color }} />
                <p className="text-2xl font-bold" style={{ color: cat.color }}>{count}</p>
                <p className="text-xs font-medium text-navy-600">{cat.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent news table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden border border-navy-100/70">
        <div className="px-6 py-4 border-b border-navy-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-900">Últimas Notícias Cadastradas</h2>
          <Link
            to="/admin/noticias"
            className="text-sm font-semibold text-accent-500 hover:text-accent-600 transition-colors"
          >
            Ver todas →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-navy-50/50">
                <th className="text-left text-xs font-semibold text-navy-500 uppercase tracking-wider px-6 py-3">
                  Título
                </th>
                <th className="text-left text-xs font-semibold text-navy-500 uppercase tracking-wider px-6 py-3">
                  Categoria
                </th>
                <th className="text-left text-xs font-semibold text-navy-500 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-navy-500 uppercase tracking-wider px-6 py-3">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {recentNews.map(item => (
                <tr key={item.id} className="hover:bg-navy-50/30 transition-colors">
                  <td className="px-6 py-3">
                    <Link
                      to={`/admin/noticias/editar/${item.id}`}
                      className="text-sm font-medium text-navy-800 hover:text-accent-600 transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <CategoryBadge categoryId={item.category} size="sm" />
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {item.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-navy-500">
                    {item.published_at
                      ? new Date(item.published_at).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
