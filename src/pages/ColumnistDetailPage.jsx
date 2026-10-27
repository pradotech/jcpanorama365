import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Feather, Sparkles } from 'lucide-react';
import { useColumnists } from '../hooks/useColumnists';
import { useNews } from '../hooks/useNews';
import NewsCard from '../components/news/NewsCard';

export default function ColumnistDetailPage() {
  const { id } = useParams();
  const { columnists, loading: loadingColumnists } = useColumnists();
  const { getNewsByColumnist, loading: loadingNews } = useNews();

  // Procurar por ID ou nome/slug
  const columnist = columnists.find(
    c => c.id === id || String(c.id) === String(id) || c.name.toLowerCase() === decodeURIComponent(id || '').toLowerCase()
  );

  const articles = columnist ? getNewsByColumnist(columnist.id, columnist.name) : [];

  if (loadingColumnists) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!columnist) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-navy-100 text-navy-500 flex items-center justify-center mx-auto mb-4">
          <Feather size={28} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">Colunista não encontrado</h1>
        <p className="text-navy-500 mb-6">O colunista que você procura não existe ou foi desativado.</p>
        <Link
          to="/colunistas"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-white rounded-xl font-semibold hover:bg-accent-600 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} />
          Ver todos os colunistas
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Hero do Colunista */}
      <div
        className="text-white relative overflow-hidden py-12 md:py-16 border-b border-navy-800"
        style={{
          backgroundColor: '#0F1A2E',
          background: 'linear-gradient(135deg, #0F1A2E 0%, #102a43 60%, #1a365d 100%)',
        }}
      >
        {/* Glow decorativo de fundo */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-accent-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-300 mb-6">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft size={14} />
              Início
            </Link>
            <span className="text-navy-400">/</span>
            <Link to="/colunistas" className="hover:text-white transition-colors">
              Colunistas
            </Link>
            <span className="text-navy-400">/</span>
            <span className="text-white truncate">{columnist.name}</span>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Foto Grande do Colunista */}
            <div className="relative shrink-0">
              {columnist.avatar_url ? (
                <img
                  src={columnist.avatar_url}
                  alt={columnist.name}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-3 border-accent-400 shadow-2xl ring-4 ring-accent-500/20"
                />
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-accent-600 text-white flex items-center justify-center font-extrabold text-4xl shadow-2xl border-2 border-white ring-4 ring-accent-500/20">
                  {columnist.name.charAt(0)}
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-3 border-[#0F1A2E] rounded-full" />
            </div>

            {/* Informações */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white bg-accent-500 px-3.5 py-1 rounded-full shadow-sm">
                  {columnist.role || 'Colunista'}
                </span>
                <span className="text-xs font-semibold text-accent-200 uppercase tracking-wide">
                  JC Panorama 365
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-serif mb-3">
                {columnist.name}
              </h1>

              <p className="text-slate-100/90 text-sm md:text-base leading-relaxed max-w-3xl mb-4 font-normal">
                {columnist.bio || 'Articulista e colunista exclusivo do JC Panorama 365, trazendo análises, reflexões e conteúdos informativos.'}
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-navy-200">
                <BookOpen size={14} className="text-accent-400" />
                <span>{articles.length} {articles.length === 1 ? 'matéria publicada' : 'matérias publicadas'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Artigos do Colunista */}
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-navy-200">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy-950 tracking-tight flex items-center gap-2.5">
              <span className="w-1.5 h-7 rounded-full bg-accent-500" />
              Todas as Matérias da Coluna
            </h2>
            <p className="text-sm text-navy-500 mt-1">
              Publicações e textos de autoria de {columnist.name}
            </p>
          </div>

          <Link
            to="/colunistas"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-accent-600 hover:text-accent-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Ver outros colunistas
          </Link>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center max-w-lg mx-auto border border-navy-100">
            <div className="w-16 h-16 rounded-full bg-navy-50 text-navy-400 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">
              Nenhuma matéria publicada ainda
            </h3>
            <p className="text-sm text-navy-500 mb-6">
              Este colunista ainda não possui publicações cadastradas no portal.
            </p>
            <Link
              to="/colunistas"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-white rounded-xl text-sm font-semibold hover:bg-accent-600 transition-colors shadow-sm"
            >
              <ArrowLeft size={16} />
              Voltar aos colunistas
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
