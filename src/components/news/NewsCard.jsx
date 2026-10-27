import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import CategoryBadge from '../ui/CategoryBadge';
import ImageCarousel from './ImageCarousel';
import { getArticleImages } from '../../lib/imageUtils';
import { formatTimeAgo } from '../../lib/dateUtils';

export default function NewsCard({ article, variant = 'default' }) {
  const images = getArticleImages(article);

  if (variant === 'compact') {
    return (
      <Link
        to={`/noticia/${article.slug}`}
        className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <ImageCarousel
            images={images}
            alt={article.title}
            aspectRatio="aspect-[16/10]"
            imageClassName="group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10 pointer-events-none">
            <CategoryBadge categoryId={article.category} size="sm" />
          </div>
        </div>
        <div className="flex flex-col flex-1 p-4">
          <h3 className="text-sm font-bold text-navy-900 group-hover:text-accent-600 transition-colors leading-snug mb-1.5">
            {article.title}
          </h3>
          <p className="text-xs text-navy-500 line-clamp-2 mb-3.5 leading-relaxed">
            {article.subtitle}
          </p>

          <div className="mt-auto pt-3 border-t border-navy-100/80 flex items-center justify-between gap-2.5">
            {article.columnist_name ? (
              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                {article.columnist_avatar ? (
                  <img
                    src={article.columnist_avatar}
                    alt={article.columnist_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-accent-500 shadow-sm shrink-0 ring-2 ring-accent-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center font-extrabold text-sm shrink-0 border border-accent-300">
                    {article.columnist_name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-600 block leading-none mb-1">
                    {article.columnist_role || 'Colunista'}
                  </span>
                  <span className="text-sm font-bold text-navy-950 truncate block leading-tight">
                    {article.columnist_name}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0 text-xs text-navy-600 font-medium">
                <User size={14} className="text-navy-400 shrink-0" />
                <span className="truncate">{article.author || 'Redação'}</span>
              </div>
            )}
            <span className="flex items-center gap-1 text-[11px] text-navy-400 font-medium shrink-0">
              <Clock size={12} />
              {formatTimeAgo(article.published_at)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/noticia/${article.slug}`}
        className="group flex gap-4 bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
      >
        <div className="w-40 h-28 md:w-48 md:h-32 shrink-0 overflow-hidden relative">
          <ImageCarousel
            images={images}
            alt={article.title}
            aspectRatio="w-full h-full"
            className="w-full h-full"
            imageClassName="group-hover:scale-105 transition-transform duration-500"
            showDots={false}
          />
        </div>
        <div className="flex flex-col justify-center py-3.5 pr-4 min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <CategoryBadge categoryId={article.category} size="sm" />
          </div>
          <h3 className="text-sm font-bold text-navy-900 mt-1.5 group-hover:text-accent-600 transition-colors leading-snug">
            {article.title}
          </h3>
          <div className="mt-auto pt-2.5 border-t border-navy-100/80 flex items-center justify-between gap-2.5">
            {article.columnist_name ? (
              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                {article.columnist_avatar ? (
                  <img
                    src={article.columnist_avatar}
                    alt={article.columnist_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-accent-500 shadow-sm shrink-0 ring-2 ring-accent-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center font-extrabold text-sm shrink-0 border border-accent-300">
                    {article.columnist_name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-600 block leading-none mb-1">
                    {article.columnist_role || 'Colunista'}
                  </span>
                  <span className="text-sm font-bold text-navy-950 truncate block leading-tight">
                    {article.columnist_name}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0 text-xs text-navy-600 font-medium">
                <User size={14} className="text-navy-400 shrink-0" />
                <span className="truncate">{article.author || 'Redação'}</span>
              </div>
            )}
            <span className="flex items-center gap-1 text-[11px] text-navy-400 font-medium shrink-0">
              <Clock size={12} />
              {formatTimeAgo(article.published_at)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/noticia/${article.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <ImageCarousel
          images={images}
          alt={article.title}
          aspectRatio="aspect-[16/10]"
          imageClassName="group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
          <CategoryBadge categoryId={article.category} size="sm" />
        </div>
      </div>
      <div className="flex flex-col flex-1 p-5 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-navy-900 group-hover:text-accent-600 transition-colors leading-snug mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-navy-500 line-clamp-2 mb-4 leading-relaxed">
          {article.subtitle}
        </p>

        <div className="mt-auto pt-3.5 border-t border-navy-100/80 flex items-center justify-between gap-3">
          {article.columnist_name ? (
            <div className="flex items-center gap-3.5 min-w-0 pr-1">
              {article.columnist_avatar ? (
                <img
                  src={article.columnist_avatar}
                  alt={article.columnist_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-accent-500 shadow-md shrink-0 ring-2 ring-accent-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center font-extrabold text-base shrink-0 border border-accent-300">
                  {article.columnist_name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-accent-600 block leading-none mb-1">
                  {article.columnist_role || 'Colunista'}
                </span>
                <span className="text-base font-extrabold text-navy-950 truncate block leading-tight">
                  {article.columnist_name}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0 text-sm text-navy-600 font-medium">
              <User size={16} className="text-navy-400 shrink-0" />
              <span className="truncate">{article.author || 'Redação'}</span>
            </div>
          )}
          <span className="flex items-center gap-1 text-xs text-navy-400 font-medium shrink-0">
            <Clock size={13} />
            {formatTimeAgo(article.published_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}
