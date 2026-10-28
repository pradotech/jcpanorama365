import { useNews } from '../hooks/useNews';
import categories from '../data/categories';
import BreakingNews from '../components/news/BreakingNews';
import FeaturedNews from '../components/news/FeaturedNews';
import NewsList from '../components/news/NewsList';
import NewsCard from '../components/news/NewsCard';
import Sidebar from '../components/layout/Sidebar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ColumnistsSection from '../components/news/ColumnistsSection';
import MarketOverview from '../components/market/MarketOverview';
import { Clock } from 'lucide-react';

export default function HomePage() {
  const { getFeaturedNews, getHomeNews, loading } = useNews();

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

  // Notícias destinadas à página inicial (filtradas por show_on_home e ordenadas por home_order/data)
  const homeNews = getHomeNews();

  // Últimas notícias da home (até 12 cards, respeitando prioridade de posição e data)
  const latestNews = homeNews.slice(0, 12);

  // Artigos de colunistas da página inicial
  const columnistArticles = homeNews.filter(
    article => article.category === 'colunistas' || Boolean(article.columnist_id) || Boolean(article.columnist_name)
  );
  
  // Agrupar notícias da home por categoria (garantindo que colunistas não fiquem em variedades)
  const categoryNewsMap = {};
  homeNews.forEach(article => {
    const isColumnist = article.category === 'colunistas' || Boolean(article.columnist_id) || Boolean(article.columnist_name);
    const cat = isColumnist ? 'colunistas' : article.category;
    if (!categoryNewsMap[cat]) {
      categoryNewsMap[cat] = [];
    }
    categoryNewsMap[cat].push(article);
  });

  // Filtrar e ordenar apenas os segmentos de notícias mais ativos da home
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

        {/* Seção Últimas Notícias com Mercado Financeiro ao lado */}
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

            {/* Grid Principal: Notícias à esquerda + Cotações à direita (Desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
              {/* Celular / Tablet: Cards no topo com abas responsivas */}
              <div className="lg:hidden mb-4 sm:mb-6">
                <MarketOverview />
              </div>

              {/* Coluna da Esquerda (2 colunas no desktop): Notícias Recentes */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {latestNews.map(article => (
                    <NewsCard key={article.id} article={article} variant="compact" />
                  ))}
                </div>
              </div>

              {/* Coluna da Direita (Desktop): Cards de Dólar e Bolsa no topo */}
              <div className="hidden lg:block lg:col-span-1">
                <MarketOverview />
              </div>
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
              <Sidebar onlyHome={true} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
