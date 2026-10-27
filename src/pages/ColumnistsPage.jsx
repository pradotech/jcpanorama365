import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ArrowLeft, BookOpen, ArrowRight, Sparkles, Feather, Newspaper } from 'lucide-react';
import { useColumnists } from '../hooks/useColumnists';
import { useNews } from '../hooks/useNews';
import NewsCard from '../components/news/NewsCard';

export default function ColumnistsPage() {
  const { columnists, loading } = useColumnists();
  const { getNewsByColumnist, getAllColumnistNews } = useNews();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumnistId, setSelectedColumnistId] = useState('all');

  const allArticles = getAllColumnistNews ? getAllColumnistNews() : [];
  const filteredArticles = selectedColumnistId === 'all'
    ? allArticles
    : allArticles.filter(item => String(item.columnist_id) === String(selectedColumnistId));

  const filteredColumnists = columnists.filter(col => {
    const q = searchTerm.toLowerCase();
    return (
      col.name.toLowerCase().includes(q) ||
      (col.role && col.role.toLowerCase().includes(q)) ||
      (col.bio && col.bio.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-16">
      {/* Hero Header */}
      <div className="bg-[#0F1A2E] text-white relative overflow-hidden py-12 md:py-16 border-b border-navy-800">
        {/* Glow decorativo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-accent-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-300 mb-4">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft size={14} />
              Início
            </Link>
            <span className="text-navy-400">/</span>
            <span>Colunistas</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 border border-accent-400/30 text-xs font-bold uppercase tracking-wider mb-3">
                <Feather size={13} />
                Espaço de Opinião & Análise
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-serif text-white">
                Nossos Colunistas
              </h1>
              <p className="text-navy-200 text-base md:text-lg mt-3 max-w-2xl leading-relaxed">
                Acompanhe as reflexões, análises especializadas e pontos de vista exclusivos dos principais articulistas do JC Panorama 365.
              </p>
            </div>

            {/* Campo de busca de colunista */}
            <div className="w-full md:w-80">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nome ou área..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-700 bg-navy-900/90 text-sm text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all shadow-inner"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Colunistas */}
      <div className="max-w-7xl mx-auto px-4 pt-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-navy-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-navy-100 rounded w-3/4" />
                    <div className="h-3 bg-navy-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-12 bg-navy-50 rounded mb-4" />
                <div className="h-8 bg-navy-100 rounded" />
              </div>
            ))}
          </div>
        ) : filteredColumnists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColumnists.map(col => {
              const articles = getNewsByColumnist(col.id, col.name);
              const latestArticle = articles[0];

              return (
                <div
                  key={col.id}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-navy-100/60 hover:-translate-y-1"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Header do Card */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative shrink-0">
                        {col.avatar_url ? (
                          <img
                            src={col.avatar_url}
                            alt={col.name}
                            className="w-16 h-16 md:w-18 md:h-18 rounded-full object-cover border-2 border-accent-500 shadow-md ring-3 ring-accent-100 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-gradient-to-br from-accent-500 to-accent-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-white ring-3 ring-accent-100">
                            {col.name.charAt(0)}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-accent-50 text-accent-700 border border-accent-200/60 mb-1.5">
                          {col.role || 'Colunista'}
                        </span>
                        <h3 className="font-extrabold text-navy-950 text-lg md:text-xl leading-tight group-hover:text-accent-600 transition-colors">
                          {col.name}
                        </h3>
                        <p className="text-xs text-navy-400 mt-1 flex items-center gap-1 font-medium">
                          <BookOpen size={13} className="text-accent-500" />
                          {articles.length} {articles.length === 1 ? 'matéria publicada' : 'matérias publicadas'}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-navy-600 line-clamp-3 mb-5 leading-relaxed flex-1">
                      {col.bio || 'Articulista e colunista exclusivo do JC Panorama 365.'}
                    </p>

                    {/* Último artigo publicado */}
                    {latestArticle && (
                      <div className="bg-navy-50/70 rounded-xl p-3 mb-5 border border-navy-100/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 block mb-1">
                          Última publicação
                        </span>
                        <p className="text-xs font-semibold text-navy-900 line-clamp-1 group-hover:text-accent-700 transition-colors">
                          "{latestArticle.title}"
                        </p>
                      </div>
                    )}

                    {/* Botão de Ação */}
                    <Link
                      to={`/colunista/${col.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-navy-950 hover:bg-accent-600 text-white text-sm font-bold transition-colors shadow-sm group-hover:shadow-md cursor-pointer"
                    >
                      <span>Ver Matérias da Coluna</span>
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center max-w-lg mx-auto border border-navy-100">
            <div className="w-16 h-16 rounded-full bg-navy-50 text-navy-400 flex items-center justify-center mx-auto mb-4">
              <Users size={28} />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">
              Nenhum colunista encontrado
            </h3>
            <p className="text-sm text-navy-500 mb-6">
              {searchTerm
                ? `Não encontramos colunistas para o termo "${searchTerm}".`
                : 'Ainda não há colunistas cadastrados na plataforma.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-accent-500 text-white rounded-lg text-sm font-semibold hover:bg-accent-600 transition-colors"
              >
                Limpar busca
              </button>
            )}
          </div>
        )}

        {/* Seção com as postagens dos colunistas */}
        <div className="mt-16 pt-12 border-t border-navy-200/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 text-accent-700 border border-accent-200/60 text-xs font-bold uppercase tracking-wider mb-2">
                <Newspaper size={13} className="text-accent-500" />
                Artigos Publicados
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-navy-950 font-serif">
                Publicações dos Nossos Colunistas
              </h2>
              <p className="text-sm text-navy-500 mt-1">
                Todas as postagens, colunas e análises reunidas em um só lugar.
              </p>
            </div>

            {/* Chips de filtro por colunista */}
            {columnists.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedColumnistId('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedColumnistId === 'all'
                      ? 'bg-navy-950 text-white shadow-sm'
                      : 'bg-white text-navy-700 hover:bg-navy-100 border border-navy-200'
                  }`}
                >
                  Todos ({allArticles.length})
                </button>
                {columnists.map(col => {
                  const colArticles = allArticles.filter(a => String(a.columnist_id) === String(col.id));
                  return (
                    <button
                      key={col.id}
                      onClick={() => setSelectedColumnistId(col.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        selectedColumnistId === col.id
                          ? 'bg-navy-950 text-white shadow-sm'
                          : 'bg-white text-navy-700 hover:bg-navy-100 border border-navy-200'
                      }`}
                    >
                      <span>{col.name}</span>
                      <span className="text-[10px] opacity-75">({colArticles.length})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Grid de artigos */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-card p-12 text-center max-w-lg mx-auto border border-navy-100">
              <div className="w-16 h-16 rounded-full bg-navy-50 text-navy-400 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">
                Nenhum artigo publicado ainda
              </h3>
              <p className="text-sm text-navy-500">
                {selectedColumnistId === 'all'
                  ? 'As postagens e artigos dos colunistas serão exibidos aqui assim que forem publicados.'
                  : 'Este colunista ainda não possui artigos publicados.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
