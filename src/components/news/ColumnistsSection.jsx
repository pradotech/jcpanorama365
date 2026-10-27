import { Link } from 'react-router-dom';
import { Feather, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { useColumnists } from '../../hooks/useColumnists';
import { formatTimeAgo } from '../../lib/dateUtils';

export default function ColumnistsSection({ articles = [] }) {
  const { columnists } = useColumnists();

  // Se não houver artigos nem colunistas, não exibe a seção
  if (articles.length === 0 && columnists.length === 0) {
    return null;
  }

  // Ordenar artigos pelo mais recente
  const sortedArticles = [...articles].sort((a, b) => {
    const timeA = new Date(a.published_at || a.created_at || 0).getTime();
    const timeB = new Date(b.published_at || b.created_at || 0).getTime();
    return timeB - timeA;
  });

  // Filtrar apenas o artigo mais recente de cada colunista para nunca repetir o mesmo autor
  const seenColumnists = new Set();
  const uniqueColumnistArticles = [];

  for (const article of sortedArticles) {
    const key = article.columnist_id
      ? `id_${article.columnist_id}`
      : (article.columnist_name || article.author || article.id || '').trim().toLowerCase();

    if (key && !seenColumnists.has(key)) {
      seenColumnists.add(key);
      uniqueColumnistArticles.push(article);
    }
  }

  const displayArticles = uniqueColumnistArticles.slice(0, 4);

  return (
    <section
      className="mb-12 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden bg-[#0F1A2E]"
      style={{
        backgroundColor: '#0F1A2E',
        background: 'linear-gradient(135deg, #0F1A2E 0%, #102a43 60%, #1a365d 100%)',
      }}
    >
      {/* Detalhes de iluminação de fundo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-accent-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Cabeçalho da Seção */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-5 border-b border-navy-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-300 text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">
            <Feather size={13} className="text-accent-400" />
            Opinião & Análise
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-white">
            Nossos Colunistas
          </h2>
          <p className="text-navy-200 text-sm mt-1 max-w-xl">
            Artigos exclusivos, pontos de vista e reflexões dos nossos principais articulistas.
          </p>
        </div>

        <Link
          to="/colunistas"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-accent-200 text-sm font-semibold transition-all border border-white/15 self-start sm:self-auto shrink-0 group shadow-sm"
        >
          <span>Conhecer todos os colunistas</span>
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid de Postagens de Colunistas */}
      {displayArticles.length > 0 ? (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayArticles.map((article) => {
            const authorName = article.columnist_name || article.author || 'Colunista';
            const authorRole = article.columnist_role || 'Colunista';
            const avatarUrl = article.columnist_avatar;

            return (
              <article
                key={article.id}
                className="group flex flex-col justify-between bg-[#152744]/90 hover:bg-[#1c3358] rounded-xl p-5 border border-white/10 hover:border-accent-400/50 transition-all duration-300 shadow-md"
              >
                <div>
                  {/* Perfil do Colunista */}
                  <div className="flex items-center gap-3 mb-4 pb-3.5 border-b border-white/10">
                    <div className="relative shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={authorName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-accent-400 ring-2 ring-white/10 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-lg border-2 border-accent-400 shadow-sm">
                          {authorName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-accent-300 block truncate">
                        {authorRole}
                      </span>
                      <h3 className="text-sm font-bold text-white group-hover:text-accent-200 transition-colors truncate">
                        {authorName}
                      </h3>
                    </div>
                  </div>

                  {/* Título da Notícia / Artigo */}
                  <Link to={`/noticia/${article.slug}`} className="block">
                    <h4 className="text-base font-bold text-white group-hover:text-accent-300 transition-colors leading-snug line-clamp-2 mb-2">
                      {article.title}
                    </h4>
                  </Link>

                  {/* Subtítulo / Resumo */}
                  {article.subtitle && (
                    <p className="text-xs text-navy-200 line-clamp-2 leading-relaxed mb-4">
                      {article.subtitle}
                    </p>
                  )}
                </div>

                {/* Rodapé do Card */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-navy-300">
                  <span className="flex items-center gap-1 text-navy-300">
                    <Clock size={12} className="text-accent-400" />
                    {formatTimeAgo(article.published_at, { withSuffix: true })}
                  </span>
                  <Link
                    to={`/noticia/${article.slug}`}
                    className="text-accent-300 font-semibold group-hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>Ler coluna</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Caso ainda não haja postagens, exibe os perfis dos colunistas */
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columnists.slice(0, 4).map((col) => (
            <Link
              key={col.id}
              to={`/colunista/${col.id}`}
              className="group bg-[#152744]/90 hover:bg-[#1c3358] rounded-xl p-5 border border-white/10 hover:border-accent-400/50 transition-all flex items-center gap-3.5 shadow-md"
            >
              {col.avatar_url ? (
                <img
                  src={col.avatar_url}
                  alt={col.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-accent-400 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {col.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-300 block truncate">
                  {col.role || 'Colunista'}
                </span>
                <h4 className="text-sm font-bold text-white group-hover:text-accent-300 transition-colors truncate">
                  {col.name}
                </h4>
                <span className="text-xs text-navy-200 flex items-center gap-1 mt-0.5">
                  <BookOpen size={11} className="text-accent-400" />
                  Ver artigos
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
