import { Link } from 'react-router-dom';
import { Feather, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { useColumnists } from '../../hooks/useColumnists';
import { formatTimeAgo } from '../../lib/dateUtils';

export default function ColumnistsSection({ articles = [] }) {
  const { columnists } = useColumnists();

  // Se não houver artigos nem colunistas cadastrados, não exibe a seção
  if (articles.length === 0 && columnists.length === 0) {
    return null;
  }

  // Ordenar todos os artigos recebidos pelo mais recente
  const sortedArticles = [...articles].sort((a, b) => {
    const timeA = new Date(a.published_at || a.created_at || 0).getTime();
    const timeB = new Date(b.published_at || b.created_at || 0).getTime();
    return timeB - timeA;
  });

  // Mapear cada colunista cadastrado com seu artigo mais recente
  const matchedArticleIds = new Set();
  const items = [];

  // 1. Processar todos os colunistas cadastrados no banco / contexto
  columnists.forEach((col) => {
    const latestArticle = sortedArticles.find(
      (a) =>
        (a.columnist_id && String(a.columnist_id) === String(col.id)) ||
        (a.columnist_name && col.name && a.columnist_name.trim().toLowerCase() === col.name.trim().toLowerCase())
    );

    if (latestArticle) {
      matchedArticleIds.add(latestArticle.id);
    }

    items.push({
      id: col.id ? `col_${col.id}` : `col_name_${col.name}`,
      columnistId: col.id,
      name: col.name,
      role: col.role || 'Colunista',
      avatarUrl: col.avatar_url || latestArticle?.columnist_avatar || '',
      bio: col.bio || '',
      article: latestArticle || null,
      sortDate: latestArticle
        ? new Date(latestArticle.published_at || latestArticle.created_at || 0).getTime()
        : 0,
    });
  });

  // 2. Incluir eventuais artigos de colunistas não cadastrados formalmente na tabela (legados)
  sortedArticles.forEach((article) => {
    if (matchedArticleIds.has(article.id)) return;

    const authorName = article.columnist_name || article.author || 'Colunista';
    const alreadyIncluded = items.some(
      (item) => item.name.trim().toLowerCase() === authorName.trim().toLowerCase()
    );

    if (!alreadyIncluded) {
      matchedArticleIds.add(article.id);
      items.push({
        id: `article_${article.id}`,
        columnistId: article.columnist_id || null,
        name: authorName,
        role: article.columnist_role || 'Colunista',
        avatarUrl: article.columnist_avatar || '',
        bio: '',
        article,
        sortDate: new Date(article.published_at || article.created_at || 0).getTime(),
      });
    }
  });

  // 3. Ordenar: colunistas com artigos mais recentes primeiro, seguidos pelos demais em ordem alfabética
  items.sort((a, b) => {
    if (a.sortDate && b.sortDate) {
      return b.sortDate - a.sortDate;
    }
    if (a.sortDate) return -1;
    if (b.sortDate) return 1;
    return a.name.localeCompare(b.name);
  });

  // Todos os colunistas são exibidos sem limitação de quantidade
  const displayItems = items;

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

      {/* Grid de Postagens e Perfis dos Colunistas */}
      {displayItems.length > 0 && (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayItems.map((item) => {
            const { columnistId, name, role, avatarUrl, bio, article } = item;
            const columnistLink = columnistId ? `/colunista/${columnistId}` : (article ? `/noticia/${article.slug}` : '/colunistas');

            return (
              <article
                key={item.id}
                className="group flex flex-col justify-between bg-[#152744]/90 hover:bg-[#1c3358] rounded-xl p-5 border border-white/10 hover:border-accent-400/50 transition-all duration-300 shadow-md h-full"
              >
                <div>
                  {/* Perfil do Colunista */}
                  <div className="flex items-center gap-3 mb-4 pb-3.5 border-b border-white/10">
                    <Link to={columnistLink} className="relative shrink-0 block">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-accent-400 ring-2 ring-white/10 shadow-sm transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-lg border-2 border-accent-400 shadow-sm">
                          {name.charAt(0)}
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-accent-300 block truncate">
                        {role}
                      </span>
                      <Link
                        to={columnistLink}
                        className="text-sm font-bold text-white group-hover:text-accent-200 transition-colors truncate block"
                      >
                        {name}
                      </Link>
                    </div>
                  </div>

                  {/* Título da Notícia ou Breve Apresentação do Colunista */}
                  {article ? (
                    <>
                      <Link to={`/noticia/${article.slug}`} className="block">
                        <h4 className="text-base font-bold text-white group-hover:text-accent-300 transition-colors leading-snug line-clamp-2 mb-2">
                          {article.title}
                        </h4>
                      </Link>
                      {article.subtitle ? (
                        <p className="text-xs text-navy-200 line-clamp-2 leading-relaxed mb-4">
                          {article.subtitle}
                        </p>
                      ) : (
                        <div className="mb-4" />
                      )}
                    </>
                  ) : (
                    <Link to={columnistLink} className="block">
                      <h4 className="text-sm font-medium text-navy-200 leading-relaxed line-clamp-3 mb-4">
                        {bio || 'Espaço dedicado a reflexões, artigos e análises exclusivas.'}
                      </h4>
                    </Link>
                  )}
                </div>

                {/* Rodapé do Card */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-navy-300 mt-auto">
                  {article ? (
                    <>
                      <span className="flex items-center gap-1 text-navy-300">
                        <Clock size={12} className="text-accent-400" />
                        {formatTimeAgo(article.published_at || article.created_at, { withSuffix: true })}
                      </span>
                      <Link
                        to={`/noticia/${article.slug}`}
                        className="text-accent-300 font-semibold group-hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>Ler coluna</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1 text-navy-300">
                        <BookOpen size={12} className="text-accent-400" />
                        Colunista
                      </span>
                      <Link
                        to={columnistLink}
                        className="text-accent-300 font-semibold group-hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>Ver coluna</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
