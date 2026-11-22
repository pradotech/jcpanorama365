import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Eye, PenLine, Clock, TrendingUp, PlusCircle,
  MousePointerClick, Calendar, BarChart2, RefreshCw, Award, ArrowUpRight, Flame, ThumbsUp, ThumbsDown,
  Search, Edit3
} from 'lucide-react';
import { useNews } from '../../hooks/useNews';
import categories from '../../data/categories';
import CategoryBadge from '../../components/ui/CategoryBadge';
import Modal from '../../components/ui/Modal';
import {
  getNewsViewsByDate,
  getDailyViewsHistory,
  getTotalViewsCount,
  getLocalDateString
} from '../../services/analyticsService';
import { getAdminReactionsStats } from '../../services/reactionService';

export default function AdminDashboard() {
  const { getStats, getAllNews, getNewsByCategory } = useNews();
  const stats = getStats();
  const allNewsList = getAllNews();
  const recentNews = allNewsList.slice(0, 8);

  const newsMap = useMemo(() => {
    const map = new Map();
    allNewsList.forEach(n => {
      map.set(n.id, n);
    });
    return map;
  }, [allNewsList]);

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
  const [reactionsStats, setReactionsStats] = useState({ totalLikes: 0, totalDislikes: 0 });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Modal de Detalhamento de Reações (Likes e Dislikes)
  const [reactionModalOpen, setReactionModalOpen] = useState(false);
  const [reactionModalTab, setReactionModalTab] = useState('likes'); // 'likes' | 'dislikes' | 'all'
  const [reactionModalSearch, setReactionModalSearch] = useState('');

  // Notícias avaliadas filtradas para o Modal
  const evaluatedNews = useMemo(() => {
    return allNewsList.filter(item => (item.likes_count || 0) > 0 || (item.dislikes_count || 0) > 0);
  }, [allNewsList]);

  const filteredModalNews = useMemo(() => {
    let list = [...allNewsList];
    if (reactionModalTab === 'likes') {
      list = list.filter(item => (item.likes_count || 0) > 0);
      list.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else if (reactionModalTab === 'dislikes') {
      list = list.filter(item => (item.dislikes_count || 0) > 0);
      list.sort((a, b) => (b.dislikes_count || 0) - (a.dislikes_count || 0));
    } else {
      list = list.filter(item => (item.likes_count || 0) > 0 || (item.dislikes_count || 0) > 0);
      list.sort((a, b) => ((b.likes_count || 0) + (b.dislikes_count || 0)) - ((a.likes_count || 0) + (a.dislikes_count || 0)));
    }

    if (reactionModalSearch) {
      const q = reactionModalSearch.toLowerCase();
      list = list.filter(item => (item.title || '').toLowerCase().includes(q));
    }

    return list;
  }, [allNewsList, reactionModalTab, reactionModalSearch]);

  // Carregar dados de analytics
  const loadAnalytics = useCallback(async (date) => {
    setLoadingAnalytics(true);
    try {
      const [ranking, history, allTime, reactions] = await Promise.all([
        getNewsViewsByDate(date),
        getDailyViewsHistory(14),
        getTotalViewsCount(),
        getAdminReactionsStats()
      ]);
      setDailyRanking(ranking);
      setHistoryViews(history);
      setTotalAllTime(allTime);
      if (reactions) {
        setReactionsStats(reactions);
      }
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

  // Métricas de reações e engajamento
  const totalReactions = (reactionsStats.totalLikes || 0) + (reactionsStats.totalDislikes || 0);
  const approvalRate = totalReactions > 0
    ? Math.round((reactionsStats.totalLikes / totalReactions) * 100)
    : null;

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

      {/* Top Stats Cards - 4 colunas com espaçamento generoso */}
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
              <div className="min-w-0">
                <p className="text-2xl font-bold text-navy-900">
                  {typeof card.value === 'number' ? card.value.toLocaleString('pt-BR') : card.value}
                </p>
                <p className="text-xs text-navy-500 font-medium truncate">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção Exclusiva: Avaliações dos Leitores (Likes e Dislikes) */}
      <div className="bg-white rounded-xl shadow-card p-5 sm:p-6 border border-navy-100/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-navy-100/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ThumbsUp size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-navy-900">
                Avaliação das Matérias pelos Leitores
              </h2>
              <p className="text-xs text-navy-500 mt-0.5">
                Métricas de curtidas e descurtidas (clique nos cards para ver as notícias)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <span className="text-[11px] font-semibold text-navy-500 bg-navy-50 px-3 py-1 rounded-full border border-navy-100">
              {totalReactions > 0 ? `${totalReactions.toLocaleString('pt-BR')} avaliações registradas` : 'Aguardando primeiras avaliações'}
            </span>
            <button
              type="button"
              onClick={() => {
                setReactionModalTab('all');
                setReactionModalOpen(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-accent-600 hover:text-accent-700 bg-accent-50 hover:bg-accent-100 px-3 py-1 rounded-full transition-colors cursor-pointer"
            >
              <span>Ver todas</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Curtidas */}
          <div
            onClick={() => {
              setReactionModalTab('likes');
              setReactionModalOpen(true);
            }}
            className="bg-gradient-to-br from-blue-50/70 to-blue-50/30 rounded-xl p-4 border border-blue-100 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
            title="Clique para ver todas as matérias curtidas"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <ThumbsUp size={22} className="fill-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-navy-900">
                  {reactionsStats.totalLikes.toLocaleString('pt-BR')}
                </span>
                <p className="text-xs font-semibold text-blue-700 mt-0.5">Curtidas (Gostei)</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
              Ver lista →
            </span>
          </div>

          {/* Descurtidas */}
          <div
            onClick={() => {
              setReactionModalTab('dislikes');
              setReactionModalOpen(true);
            }}
            className="bg-gradient-to-br from-rose-50/70 to-rose-50/30 rounded-xl p-4 border border-rose-100 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md hover:border-rose-300 transition-all group"
            title="Clique para ver todas as matérias com descurtidas"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/25 group-hover:scale-105 transition-transform">
                <ThumbsDown size={22} className="fill-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-navy-900">
                  {reactionsStats.totalDislikes.toLocaleString('pt-BR')}
                </span>
                <p className="text-xs font-semibold text-rose-700 mt-0.5">Descurtidas (Não gostei)</p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
              Ver lista →
            </span>
          </div>

          {/* Índice de Satisfação */}
          <div
            onClick={() => {
              setReactionModalTab('all');
              setReactionModalOpen(true);
            }}
            className="bg-gradient-to-br from-emerald-50/70 to-emerald-50/30 rounded-xl p-4 border border-emerald-100 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group"
            title="Clique para ver todas as matérias avaliadas"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <Award size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-navy-900">
                    {approvalRate !== null ? `${approvalRate}%` : '—'}
                  </span>
                  <span className="text-xs text-navy-500">aprovação</span>
                </div>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">Índice Positivo</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
              Ver lista →
            </span>
          </div>
        </div>
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

                    const newsObj = newsMap.get(item.news_id);
                    const likesCount = item.likes_count ?? newsObj?.likes_count ?? 0;
                    const dislikesCount = item.dislikes_count ?? newsObj?.dislikes_count ?? 0;

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
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <CategoryBadge categoryId={item.category} size="sm" />
                            <div className="inline-flex items-center gap-1.5 text-xs">
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100"
                                title={`${likesCount} curtidas`}
                              >
                                <ThumbsUp size={10} className="fill-blue-500 text-blue-600" />
                                {likesCount}
                              </span>
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-100"
                                title={`${dislikesCount} descurtidas`}
                              >
                                <ThumbsDown size={10} className="fill-rose-500 text-rose-600" />
                                {dislikesCount}
                              </span>
                            </div>
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
                <th className="text-center text-xs font-semibold text-navy-500 uppercase tracking-wider px-4 py-3">
                  Reações
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
                  <td className="px-6 py-3 text-sm text-navy-500 whitespace-nowrap">
                    {item.published_at
                      ? new Date(item.published_at).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 text-xs">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100"
                        title={`${item.likes_count || 0} curtidas`}
                      >
                        <ThumbsUp size={11} className="fill-blue-500 text-blue-600" />
                        {item.likes_count || 0}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-100"
                        title={`${item.dislikes_count || 0} descurtidas`}
                      >
                        <ThumbsDown size={11} className="fill-rose-500 text-rose-600" />
                        {item.dislikes_count || 0}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalhado de Matérias Avaliadas */}
      <Modal
        isOpen={reactionModalOpen}
        onClose={() => {
          setReactionModalOpen(false);
          setReactionModalSearch('');
        }}
        title="Avaliações das Notícias pelos Leitores"
        size="xl"
      >
        <div className="space-y-4">
          {/* Abas e Filtro de Busca */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-100">
            {/* Abas */}
            <div className="flex items-center gap-1.5 p-1 bg-navy-50 rounded-xl flex-wrap">
              <button
                type="button"
                onClick={() => setReactionModalTab('likes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reactionModalTab === 'likes'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                <ThumbsUp size={13} className={reactionModalTab === 'likes' ? 'fill-white' : ''} />
                <span>Curtidas ({allNewsList.filter(n => (n.likes_count || 0) > 0).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setReactionModalTab('dislikes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reactionModalTab === 'dislikes'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                <ThumbsDown size={13} className={reactionModalTab === 'dislikes' ? 'fill-white' : ''} />
                <span>Descurtidas ({allNewsList.filter(n => (n.dislikes_count || 0) > 0).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setReactionModalTab('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reactionModalTab === 'all'
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                <span>Todas Avaliadas ({evaluatedNews.length})</span>
              </button>
            </div>

            {/* Campo de Busca */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                type="text"
                placeholder="Buscar notícia avaliada..."
                value={reactionModalSearch}
                onChange={(e) => setReactionModalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-accent-400 bg-white"
              />
            </div>
          </div>

          {/* Lista de Notícias */}
          {filteredModalNews.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-navy-50 text-navy-400 mx-auto flex items-center justify-center mb-3">
                <ThumbsUp size={20} />
              </div>
              <p className="text-sm font-semibold text-navy-800">Nenhuma notícia encontrada nesta seleção</p>
              <p className="text-xs text-navy-500 mt-1 max-w-sm mx-auto">
                {reactionModalSearch
                  ? 'Nenhuma matéria corresponde ao termo buscado.'
                  : 'Assim que os leitores avaliarem as matérias no portal, elas aparecerão listadas aqui com suas respectivas contagens.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-navy-50 max-h-[50vh] overflow-y-auto pr-1">
              {filteredModalNews.map((item, idx) => {
                const likes = item.likes_count || 0;
                const dislikes = item.dislikes_count || 0;
                const total = likes + dislikes;
                const itemApproval = total > 0 ? Math.round((likes / total) * 100) : null;

                return (
                  <div key={item.id} className="py-3 flex items-center gap-3.5 hover:bg-navy-50/50 px-2 rounded-xl transition-colors group">
                    <span className="text-xs font-bold text-navy-400 w-5 text-center shrink-0">
                      {idx + 1}º
                    </span>

                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-14 h-10 rounded-lg object-cover bg-navy-100 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-10 rounded-lg bg-navy-100 flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-navy-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <CategoryBadge categoryId={item.category} size="sm" />
                        {itemApproval !== null && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            itemApproval >= 70
                              ? 'bg-emerald-50 text-emerald-700'
                              : itemApproval >= 50
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {itemApproval}% aprovação
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/noticia/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-semibold text-navy-900 hover:text-accent-600 transition-colors line-clamp-1 inline-flex items-center gap-1"
                        title={item.title}
                      >
                        <span>{item.title}</span>
                        <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </Link>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100"
                        title="Total de curtidas"
                      >
                        <ThumbsUp size={12} className="fill-blue-500 text-blue-600" />
                        {likes}
                      </span>

                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs border border-rose-100"
                        title="Total de descurtidas"
                      >
                        <ThumbsDown size={12} className="fill-rose-500 text-rose-600" />
                        {dislikes}
                      </span>

                      <Link
                        to={`/admin/noticias/editar/${item.id}`}
                        className="p-1.5 rounded-lg text-navy-400 hover:text-accent-600 hover:bg-navy-100 transition-colors ml-1"
                        title="Editar notícia no admin"
                      >
                        <Edit3 size={15} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rodapé do Modal */}
          <div className="pt-3 border-t border-navy-100 flex items-center justify-between text-xs text-navy-500">
            <span>
              Total exibido: <strong className="text-navy-900">{filteredModalNews.length}</strong> matérias
            </span>
            <Link
              to={`/admin/noticias?reacao=${reactionModalTab === 'all' ? 'any' : reactionModalTab}`}
              className="font-bold text-accent-600 hover:text-accent-700 hover:underline flex items-center gap-1"
            >
              <span>Abrir no Gerenciador de Notícias</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
}
