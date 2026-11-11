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
  const { getFeaturedNews, getHomeNews, getNewsByCategory, loading } = useNews();

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

  // Todas as categorias editoriais existentes (exceto Colunistas que já tem seção própria acima)
  // Traz todas as categorias que possuem notícias (priorizando homeNews e complementando com as publicadas)
  const activeCategories = categories
    .filter(cat => cat.id !== 'colunistas')
    .map(cat => {
      const articles = (categoryNewsMap[cat.id] && categoryNewsMap[cat.id].length > 0)
        ? categoryNewsMap[cat.id]
        : (getNewsByCategory ? getNewsByCategory(cat.id) : []);
      return {
        ...cat,
        articles,
      };
    })
    .filter(cat => cat.articles.length > 0);

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
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-navy-100 select-none">
              <div className="flex items-center gap-2.5 pointer-events-none select-none">
                <span className="w-1.5 h-6 rounded-full bg-red-600" />
                <h2 className="text-lg md:text-xl font-bold text-navy-950 tracking-tight flex items-center gap-2 select-none">
                  <Clock size={20} className="text-red-600" />
                  Últimas Notícias
                </h2>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-navy-400 pointer-events-none select-none">
                Mais Recentes
              </span>
            </div>

            {/* Grid Principal: Notícias à esquerda + Coluna Lateral à direita */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
              {/* Coluna Lateral: No mobile fica no topo (order-1), no desktop fica à direita (order-2) */}
              <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
                <MarketOverview />
                <div className="hidden lg:block">
                  <Sidebar onlyHome={true} />
                </div>
              </div>

              {/* Coluna das Notícias: No mobile fica após as cotações (order-2), no desktop fica à esquerda (order-1) */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {latestNews.map(article => (
                    <NewsCard key={article.id} article={article} variant="compact" />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* No Celular: Nossos Colunistas acima de Mais Lidas */}
        <div className="lg:hidden mb-10">
          <ColumnistsSection articles={columnistArticles} />
          <div className="mt-8">
            <Sidebar onlyHome={true} />
          </div>
        </div>

        {/* No Desktop: Nossos Colunistas na largura total abaixo do grid principal */}
        <div className="hidden lg:block">
          <ColumnistsSection articles={columnistArticles} />
        </div>

        {/* Main content (Todas as Categorias Existentes com Notícias) */}
        <div className="space-y-10">
          {activeCategories.map(cat => (
            <NewsList
              key={cat.id}
              categoryId={cat.id}
              articles={cat.articles}
              limit={4}
              cardVariant="compact"
            />
          ))}

          {/* Caso não haja nenhuma notícia publicada */}
          {activeCategories.length === 0 && (
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
      </div>
    </>
  );
}
