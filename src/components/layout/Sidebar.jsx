import { Link } from 'react-router-dom';
import { Clock, TrendingUp } from 'lucide-react';
import { useNews } from '../../hooks/useNews';
import CategoryBadge from '../ui/CategoryBadge';
import { formatTimeAgo } from '../../lib/dateUtils';

export default function Sidebar({ onlyHome = false }) {
  const { getPublishedNews, getHomeNews } = useNews();
  const allNews = onlyHome ? getHomeNews() : getPublishedNews();
  const latestNews = allNews.slice(0, 6);

  return (
    <aside className="space-y-6">
      {/* Mais Lidas */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 py-4 bg-navy-950" style={{ background: 'linear-gradient(to right, #0F1A2E, #243b53)' }}>
          <h3 className="text-white font-bold flex items-center gap-2">
            <TrendingUp size={18} />
            Mais Lidas
          </h3>
        </div>
        <div className="divide-y divide-navy-50">
          {allNews.slice(0, 5).map((item, index) => (
            <Link
              key={item.id}
              to={`/noticia/${item.slug}`}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-navy-50/50 transition-colors group"
            >
              <span className="text-2xl font-black text-navy-200 group-hover:text-accent-500 transition-colors w-7 shrink-0">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy-800 group-hover:text-accent-600 transition-colors leading-snug">
                  {item.title}
                </p>
                <CategoryBadge categoryId={item.category} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Últimas Notícias */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 py-4 bg-accent-500" style={{ background: 'linear-gradient(to right, #1E56A0, #1a4b8c)' }}>
          <h3 className="text-white font-bold flex items-center gap-2">
            <Clock size={18} />
            Últimas Notícias
          </h3>
        </div>
        <div className="divide-y divide-navy-50">
          {latestNews.map(item => (
            <Link
              key={item.id}
              to={`/noticia/${item.slug}`}
              className="block px-5 py-3.5 hover:bg-navy-50/50 transition-colors group"
            >
              <p className="text-sm font-semibold text-navy-800 group-hover:text-accent-600 transition-colors leading-snug mb-1.5">
                {item.title}
              </p>
              <div className="flex items-center justify-between">
                <CategoryBadge categoryId={item.category} size="sm" />
                <span className="text-xs text-navy-400">
                  {formatTimeAgo(item.published_at, { withSuffix: true })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
