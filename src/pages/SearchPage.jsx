import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useNews } from '../hooks/useNews';
import NewsCard from '../components/news/NewsCard';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { searchNews } = useNews();
  const results = query ? searchNews(query) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SearchIcon size={24} className="text-accent-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-navy-900">
            Resultados da busca
          </h1>
        </div>
        {query && (
          <p className="text-navy-500">
            {results.length} {results.length === 1 ? 'resultado' : 'resultados'} para{' '}
            <span className="font-semibold text-navy-700">"{query}"</span>
          </p>
        )}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-card">
          <SearchIcon size={56} className="mx-auto text-navy-200 mb-4" />
          <h3 className="text-xl font-semibold text-navy-700 mb-2">
            {query ? 'Nenhum resultado encontrado' : 'Digite algo para buscar'}
          </h3>
          <p className="text-navy-400 text-sm max-w-md mx-auto">
            {query
              ? 'Tente buscar por outros termos ou navegue pelas categorias.'
              : 'Use o campo de busca no topo da página para encontrar notícias.'}
          </p>
        </div>
      )}
    </div>
  );
}
