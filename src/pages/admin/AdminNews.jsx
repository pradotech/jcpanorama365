import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle, Search, Edit3, Trash2, Eye, EyeOff, Star, StarOff, Home
} from 'lucide-react';
import { useNews } from '../../hooks/useNews';
import categories from '../../data/categories';
import CategoryBadge from '../../components/ui/CategoryBadge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export default function AdminNews() {
  const { getAllNews, deleteNews, updateNews } = useNews();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);

  const allNews = getAllNews();

  const filteredNews = allNews.filter(item => {
    const matchSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = !filterCategory || item.category === filterCategory;
    const matchStatus = !filterStatus || item.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const handleDelete = async (id) => {
    try {
      await deleteNews(id);
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
    setDeleteModal(null);
  };

  const toggleStatus = async (item) => {
    try {
      await updateNews(item.id, {
        status: item.status === 'published' ? 'draft' : 'published',
      });
    } catch (err) {
      alert('Erro ao alterar status: ' + err.message);
    }
  };

  const toggleFeatured = async (item) => {
    try {
      await updateNews(item.id, { featured: !item.featured });
    } catch (err) {
      alert('Erro ao alterar destaque: ' + err.message);
    }
  };

  const toggleShowOnHome = async (item) => {
    try {
      await updateNews(item.id, { show_on_home: !item.show_on_home });
    } catch (err) {
      alert('Erro ao alterar exibição na página inicial: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Gerenciar Notícias</h1>
          <p className="text-navy-500 text-sm mt-1">{filteredNews.length} notícias encontradas</p>
        </div>
        <Link
          to="/admin/noticias/nova"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-500 text-white rounded-lg font-semibold text-sm hover:bg-accent-600 transition-colors shadow-sm"
        >
          <PlusCircle size={16} />
          Nova Notícia
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-navy-200 text-sm text-navy-700 focus:outline-none focus:ring-2 focus:ring-accent-400 bg-white cursor-pointer"
          >
            <option value="">Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-navy-200 text-sm text-navy-700 focus:outline-none focus:ring-2 focus:ring-accent-400 bg-white cursor-pointer"
          >
            <option value="">Todos os status</option>
            <option value="published">Publicado</option>
            <option value="draft">Rascunho</option>
          </select>
        </div>
      </div>

      {/* News Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-navy-50/50 border-b border-navy-100">
                <th className="text-left text-xs font-semibold text-navy-500 uppercase tracking-wider px-6 py-3">
                  Notícia
                </th>
                <th className="text-left text-xs font-semibold text-navy-500 uppercase tracking-wider px-4 py-3">
                  Categoria
                </th>
                <th className="text-left text-xs font-semibold text-navy-500 uppercase tracking-wider px-4 py-3">
                  Autor
                </th>
                <th className="text-left text-xs font-semibold text-navy-500 uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-navy-500 uppercase tracking-wider px-4 py-3">
                  Data
                </th>
                <th className="text-center text-xs font-semibold text-navy-500 uppercase tracking-wider px-4 py-3">
                  Início
                </th>
                <th className="text-right text-xs font-semibold text-navy-500 uppercase tracking-wider px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {filteredNews.map(item => (
                <tr key={item.id} className="hover:bg-navy-50/30 transition-colors group">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-12 h-9 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/admin/noticias/editar/${item.id}`}
                          className="text-sm font-semibold text-navy-800 hover:text-accent-600 transition-colors line-clamp-1"
                        >
                          {item.title}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <CategoryBadge categoryId={item.category} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-sm text-navy-600">
                    {item.author}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {item.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-navy-500 whitespace-nowrap">
                    {item.published_at
                      ? new Date(item.published_at).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => toggleShowOnHome(item)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        item.show_on_home
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'bg-navy-50 text-navy-400 hover:bg-navy-100'
                      }`}
                      title={item.show_on_home ? 'Clique para remover da página inicial' : 'Clique para exibir na página inicial'}
                    >
                      <Home size={12} />
                      {item.show_on_home ? (item.home_order ? `Sim (#${item.home_order})` : 'Sim') : 'Não'}
                    </button>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleFeatured(item)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          item.featured
                            ? 'text-amber-500 hover:bg-amber-50'
                            : 'text-navy-300 hover:bg-navy-50 hover:text-navy-500'
                        }`}
                        title={item.featured ? 'Remover destaque' : 'Destacar'}
                      >
                        {item.featured ? <Star size={16} /> : <StarOff size={16} />}
                      </button>
                      <button
                        onClick={() => toggleStatus(item)}
                        className="p-1.5 rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-600 transition-colors cursor-pointer"
                        title={item.status === 'published' ? 'Despublicar' : 'Publicar'}
                      >
                        {item.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Link
                        to={`/admin/noticias/editar/${item.id}`}
                        className="p-1.5 rounded-lg text-navy-400 hover:bg-accent-50 hover:text-accent-600 transition-colors"
                        title="Editar"
                      >
                        <Edit3 size={16} />
                      </Link>
                      <button
                        onClick={() => setDeleteModal(item)}
                        className="p-1.5 rounded-lg text-navy-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <Search size={40} className="mx-auto text-navy-200 mb-3" />
            <p className="text-navy-500 font-medium">Nenhuma notícia encontrada</p>
            <p className="text-navy-400 text-sm mt-1">Tente ajustar os filtros</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-navy-700">
            Tem certeza que deseja excluir a notícia{' '}
            <strong>"{deleteModal?.title}"</strong>?
          </p>
          <p className="text-sm text-navy-500">
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteModal(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(deleteModal?.id)}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
