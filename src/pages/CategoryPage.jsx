import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useNews } from '../hooks/useNews';
import { getCategoryBySlug } from '../data/categories';
import NewsCard from '../components/news/NewsCard';
import Sidebar from '../components/layout/Sidebar';

export default function CategoryPage() {
  const { slug } = useParams();
  const { getNewsByCategory } = useNews();
  const category = getCategoryBySlug(slug);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-navy-900 mb-4">Categoria não encontrada</h1>
        <p className="text-navy-500">A categoria que você procura não existe.</p>
      </div>
    );
  }

  const articles = getNewsByCategory(category.id);
  const Icon = category.icon;

  return (
    <div>
      {/* Category Banner */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: category.color }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/20" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-white/10" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-10 relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Icon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{category.name}</h1>
              <p className="text-white/80 text-sm mt-1">{category.description}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <p className="text-white/70 text-sm">
              {articles.length} {articles.length === 1 ? 'publicação encontrada' : 'publicações encontradas'}
            </p>
            {category.id === 'colunistas' && (
              <Link
                to="/colunistas"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-200 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition-colors self-start sm:self-auto border border-white/15"
              >
                <span>Conhecer todos os colunistas</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {articles.map(article => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-card">
                <Icon size={48} className="mx-auto text-navy-200 mb-4" />
                <h3 className="text-lg font-semibold text-navy-700 mb-2">
                  Nenhuma notícia nesta categoria
                </h3>
                <p className="text-navy-400 text-sm">
                  Novas notícias serão publicadas em breve.
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
    </div>
  );
}
