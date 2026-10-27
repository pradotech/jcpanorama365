import { useNews } from '../hooks/useNews';
import categories from '../data/categories';
import BreakingNews from '../components/news/BreakingNews';
import FeaturedNews from '../components/news/FeaturedNews';
import NewsList from '../components/news/NewsList';
import NewsCard from '../components/news/NewsCard';
import Sidebar from '../components/layout/Sidebar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ColumnistsSection from '../components/news/ColumnistsSection';
import { Clock } from 'lucide-react';

export default function HomePage() {
  const { getFeaturedNews, getHomeNews, getPublishedNews, loading } = useNews();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const featured = getFeaturedNews();
  const mainFeatured = featured[0];
  const secondaryFeatured = featured.slice(1, 4);

  // Todas as notícias publicadas
  const allPublished = getPublishedNews();

  // Últimas notícias publicadas (até 12 cards)
  const latestNews = allPublished.slice(0, 12);

  // Artigos de colunistas separados
  const columnistArticles = allPublished.filter(
    article => article.category === 'colunistas' || Boolean(article.columnist_id) || Boolean(article.columnist_name)
  );
  
  // Agrupar notícias publicadas por categoria (garantindo que colunistas não fiquem em variedades)
  const categoryNewsMap = {};
  allPublished.forEach(article => {
    const isColumnist = article.category === 'colunistas' || Boolean(article.columnist_id) || Boolean(article.columnist_name);
    const cat = isColumnist ? 'colunistas' : article.category;
    if (!categoryNewsMap[cat]) {
      categoryNewsMap[cat] = [];
    }
    categoryNewsMap[cat].push(article);
  });

  // Filtrar e ordenar apenas os segmentos de notícias mais ativos (excluindo colunistas pois terá seção dedicada exclusiva)
  const topActiveCategories = Object.keys(categoryNewsMap)
    .filter(catId => catId !== 'colunistas' && categoryNewsMap[catId].length > 0)
    .sort((a, b) => categoryNewsMap[b].length - categoryNewsMap[a].length)
    .slice(0, 4);

  return (
    <>
      <BreakingNews />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section */}
        {mainFeatured && (
          <section className="mb-8">
            <FeaturedNews article={mainFeatured} />
          </section>
        )}

        {/* Secondary featured */}
        {secondaryFeatured.length > 0 && (
          <section className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {secondaryFeatured.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Seção Últimas Notícias (até 12 cards, independente de segmento) */}
        {latestNews.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-navy-100">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full bg-red-600" />
                <h2 className="text-lg md:text-xl font-bold text-navy-950 tracking-tight flex items-center gap-2">
                  <Clock size={20} className="text-red-600" />
                  Últimas Notícias
                </h2>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-navy-400">
                Mais Recentes
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestNews.map(article => (
                <NewsCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          </section>
        )}

        {/* Seção Exclusiva de Colunistas */}
        <ColumnistsSection articles={columnistArticles} />

        {/* Main content (Segmentos Mais Ativos) + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            {/* Principais segmentos com mais publicações */}
            {topActiveCategories.map(catId => {
              const cat = categories.find(c => c.id === catId);
              if (!cat) return null;
              return (
                <NewsList
                  key={cat.id}
                  categoryId={cat.id}
                  articles={categoryNewsMap[catId]}
                  limit={3}
                />
              );
            })}

            {/* Caso não haja nenhuma notícia publicada */}
            {topActiveCategories.length === 0 && (
              <div className="text-center py-16">
                <p className="text-navy-400 text-lg">
                  Nenhuma notícia publicada ainda.
                </p>
                <p className="text-navy-300 text-sm mt-2">
                  Crie e publique notícias através do painel admin.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
