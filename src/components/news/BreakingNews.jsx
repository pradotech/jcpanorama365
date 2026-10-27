import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNews } from '../../hooks/useNews';

export default function BreakingNews() {
  const { getPublishedNews } = useNews();
  const latest = getPublishedNews().slice(0, 8);

  if (latest.length === 0) return null;

  return (
    <div
      className="bg-red-700 bg-gradient-to-r from-red-700 to-red-600 text-white overflow-hidden"
      style={{ backgroundColor: '#b91c1c' }}
    >
      <div className="max-w-7xl mx-auto flex items-center">
        <div
          className="flex items-center gap-2 px-4 py-2 bg-red-800 shrink-0 z-10"
          style={{ backgroundColor: '#991b1b' }}
        >
          <Zap size={14} className="animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap text-white">
            Últimas
          </span>
        </div>
        <div className="overflow-hidden flex-1 min-w-0">
          <div
            className="animate-ticker flex items-center gap-8 whitespace-nowrap py-2 px-4"
            style={{ display: 'inline-flex', width: 'max-content' }}
          >
            {[...latest, ...latest].map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                to={`/noticia/${item.slug}`}
                className="inline-flex items-center gap-2 text-sm text-white hover:text-red-100 transition-colors shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                <span className="font-medium">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
