import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import CategoryBadge from '../ui/CategoryBadge';

export default function FeaturedNews({ article }) {
  if (!article) return null;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Link
      to={`/noticia/${article.slug}`}
      className="group block relative rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500"
    >
      <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)' }}
        />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="mb-3">
            <CategoryBadge categoryId={article.category} size="md" />
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight font-serif">
            {article.title}
          </h1>
          <p className="text-base md:text-lg text-white/80 mb-4 max-w-3xl line-clamp-2">
            {article.subtitle}
          </p>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-2.5">
              {article.columnist_avatar ? (
                <img
                  src={article.columnist_avatar}
                  alt={article.columnist_name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-accent-400 shrink-0 shadow-md ring-2 ring-white/20"
                />
              ) : article.columnist_name ? (
                <div className="w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-white/40">
                  {article.columnist_name.charAt(0)}
                </div>
              ) : (
                <User size={15} className="text-white/80" />
              )}
              <span className="font-semibold text-white">
                {article.columnist_name ? `Coluna de ${article.columnist_name}` : article.author}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-white/70 text-xs">
              <Clock size={14} />
              {formatDate(article.published_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
