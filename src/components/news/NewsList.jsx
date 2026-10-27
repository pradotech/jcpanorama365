import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import NewsCard from './NewsCard';
import { getCategoryById } from '../../data/categories';

export default function NewsList({ categoryId, articles, limit, showHeader = true }) {
  const category = getCategoryById(categoryId);
  const displayArticles = limit ? articles.slice(0, limit) : articles;

  if (displayArticles.length === 0) return null;

  return (
    <section>
      {showHeader && category && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <h2 className="text-xl font-bold text-navy-900">{category.name}</h2>
          </div>
          <Link
            to={`/categoria/${category.slug}`}
            className="flex items-center gap-1 text-sm font-semibold transition-colors hover:gap-2"
            style={{ color: category.color }}
          >
            Ver todas
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayArticles.map(article => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
