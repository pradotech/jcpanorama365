import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import NewsCard from './NewsCard';
import { getCategoryById } from '../../data/categories';

export default function NewsList({
  categoryId,
  articles,
  limit = 3,
  showHeader = true,
  cardVariant = 'compact',
}) {
  const category = getCategoryById(categoryId);
  const displayArticles = limit ? articles.slice(0, limit) : articles;

  if (displayArticles.length === 0) return null;

  return (
    <section>
      {showHeader && category && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-navy-100/70">
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

      {/* Versão Celular: estilo feed editorial compacto (foto à esquerda + categoria em destaque + título) */}
      <div className="flex flex-col sm:hidden divide-y divide-navy-100/80">
        {displayArticles.map(article => (
          <NewsCard
            key={article.id}
            article={article}
            variant="editorial-list"
          />
        ))}
      </div>

      {/* Versão Tablet/Desktop: grid de 3 cards alinhados */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
