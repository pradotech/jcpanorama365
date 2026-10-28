import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import NewsCard from './NewsCard';
import { getCategoryById } from '../../data/categories';

export default function NewsList({
  categoryId,
  articles,
  limit = 4,
  showHeader = true,
  cardVariant = 'compact',
}) {
  const category = getCategoryById(categoryId);
  const displayArticles = limit ? articles.slice(0, limit) : articles;

  if (displayArticles.length === 0) return null;

  return (
    <section>
      {showHeader && category && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-navy-100/70">
          <div className="flex items-center gap-2.5">
            <span
              className="w-1.5 h-6 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <h2 className="text-lg md:text-xl font-bold text-navy-950 tracking-tight">
              {category.name}
            </h2>
          </div>
          <Link
            to={`/categoria/${category.slug}`}
            className="flex items-center gap-1 text-xs md:text-sm font-semibold transition-colors hover:gap-1.5"
            style={{ color: category.color }}
          >
            Ver todas
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {displayArticles.map(article => (
          <NewsCard
            key={article.id}
            article={article}
            variant={cardVariant}
          />
        ))}
      </div>
    </section>
  );
}
