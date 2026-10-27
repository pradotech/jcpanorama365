import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Upload, X, Loader2, UserCheck, Users, Trash2 } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNews } from '../../hooks/useNews';
import { useColumnists } from '../../hooks/useColumnists';
import { uploadImage } from '../../lib/storage';
import categories from '../../data/categories';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';

const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const emptyArticle = {
  title: '',
  subtitle: '',
  content: '',
  category: 'geral',
  image_url: '',
  author: '',
  status: 'draft',
  featured: false,
  show_on_home: false,
  home_order: 0,
  columnist_id: '',
  columnist_name: '',
  columnist_avatar: '',
  columnist_bio: '',
  columnist_role: '',
};

export default function AdminNewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getNewsById, addNews, updateNews } = useNews();
  const { columnists } = useColumnists();
  const isEditing = !!id;
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(emptyArticle);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (isEditing) {
      const article = getNewsById(id);
      if (article) {
        setForm(article);
        if (article.image_url) setImagePreview(article.image_url);
      } else {
        navigate('/admin/noticias');
      }
    }
  }, [id, isEditing, getNewsById, navigate]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Upload de imagem
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação do arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (file.type && !allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image_url: 'Formato não suportado. Use JPG, PNG, WebP ou GIF.' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image_url: 'A imagem deve ter no máximo 5MB.' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Preview local imediato
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    setUploading(true);
    setErrors(prev => ({ ...prev, image_url: '' }));

    try {
      const publicUrl = await uploadImage(file);
      setForm(prev => ({ ...prev, image_url: publicUrl }));
      setImagePreview(publicUrl);
    } catch (err) {
      console.error('Erro no upload:', err);
      setErrors(prev => ({ ...prev, image_url: err.message }));
      setImagePreview(form.image_url || '');
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, image_url: '' }));
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!form.subtitle.trim()) newErrors.subtitle = 'Subtítulo é obrigatório';
    if (!form.content.trim() || form.content === '<p><br></p>') newErrors.content = 'Conteúdo é obrigatório';
    if (!form.author.trim()) newErrors.author = 'Autor é obrigatório';
    if (!form.image_url.trim()) newErrors.image_url = 'Imagem de capa é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const cleanContent = (html) => {
    if (!html) return '';
    return html
      .replace(/&nbsp;/gi, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/[\u00AD\u200B\u200C\u200D\uFEFF\u2060]/g, '')
      .replace(/([a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ])-(\s*<br\s*\/?>\s*|\s*<\/p>\s*<p[^>]*>\s*|\s*\n\s*)([a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ])/gi, '$1$3');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const cleanedForm = {
      ...form,
      content: cleanContent(form.content),
    };

    try {
      if (isEditing) {
        await updateNews(id, cleanedForm);
      } else {
        await addNews(cleanedForm);
      }
      navigate('/admin/noticias');
    } catch (err) {
      console.error('Erro ao salvar:', err.message);
      alert('Erro ao salvar notícia: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/noticias')}
          className="p-2 rounded-lg text-navy-400 hover:bg-navy-100 hover:text-navy-600 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            {isEditing ? 'Editar Notícia' : 'Nova Notícia'}
          </h1>
          <p className="text-navy-500 text-sm mt-1">
            {isEditing ? 'Atualize os dados da notícia' : 'Preencha os campos para criar uma notícia'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main card */}
        <div className="bg-white rounded-xl shadow-card p-4 sm:p-6 space-y-5">
          <Textarea
            label="Título"
            placeholder="Digite o título da notícia"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            rows={2}
          />

          <Textarea
            label="Subtítulo"
            placeholder="Uma breve descrição ou resumo da notícia"
            value={form.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            error={errors.subtitle}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-navy-700">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-navy-200 text-navy-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent bg-white cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-navy-700 flex items-center justify-between">
                <span>Colunista (Opcional)</span>
                {form.columnist_name && (
                  <span className="text-[11px] text-accent-600 font-semibold">Vinculado</span>
                )}
              </label>
              <select
                value={form.columnist_id || ''}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  if (!selectedId) {
                    setForm(prev => ({
                      ...prev,
                      columnist_id: '',
                      columnist_name: '',
                      columnist_avatar: '',
                      columnist_bio: '',
                      columnist_role: '',
                      category: prev.category === 'colunistas' ? 'geral' : prev.category,
                    }));
                  } else {
                    const col = columnists.find(c => String(c.id) === String(selectedId));
                    if (col) {
                      setForm(prev => ({
                        ...prev,
                        columnist_id: col.id,
                        columnist_name: col.name,
                        columnist_avatar: col.avatar_url,
                        columnist_bio: col.bio || '',
                        columnist_role: col.role || 'Colunista',
                        author: prev.author ? prev.author : col.name,
                        category: 'colunistas',
                      }));
                    }
                  }
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-navy-200 text-navy-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="">Nenhum (Redação / Sem Colunista)</option>
                {columnists.map(col => (
                  <option key={col.id} value={col.id}>{col.name} ({col.role || 'Colunista'})</option>
                ))}
              </select>
            </div>

            <Input
              label="Autor / Repórter"
              placeholder="Nome do autor"
              value={form.author}
              onChange={(e) => handleChange('author', e.target.value)}
              error={errors.author}
            />
          </div>

          {/* Preview do Colunista selecionado */}
          {form.columnist_name && (
            <div className="bg-accent-50/50 border border-accent-100 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {form.columnist_avatar ? (
                  <img
                    src={form.columnist_avatar}
                    alt={form.columnist_name}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-accent-200 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-accent-200 text-accent-800 flex items-center justify-center font-bold text-base shrink-0">
                    {form.columnist_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-navy-900">{form.columnist_name}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-accent-200/60 text-accent-800">
                      {form.columnist_role || 'Colunista'}
                    </span>
                  </div>
                  <p className="text-xs text-navy-500 truncate mt-0.5">
                    {form.columnist_bio || 'A foto e informações deste colunista serão exibidas abaixo do texto da notícia.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm(prev => ({
                    ...prev,
                    columnist_id: '',
                    columnist_name: '',
                    columnist_avatar: '',
                    columnist_bio: '',
                    columnist_role: '',
                  }));
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer self-end sm:self-center"
              >
                Desvincular
              </button>
            </div>
          )}

          {/* Imagem de Capa — Upload */}
          <div>
            <label className="text-sm font-medium text-navy-700 block mb-1.5">
              Imagem de Capa
            </label>

            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-navy-200 bg-navy-50">
                  <img
                    src={imagePreview}
                    alt="Preview da capa"
                    className="w-full h-48 sm:h-64 object-cover"
                    onError={() => setImagePreview('')}
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-lg">
                        <Loader2 size={18} className="animate-spin text-accent-400" />
                        <span>Enviando nova imagem...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controles para trocar ou remover imagem - visíveis tanto no celular quanto no computador */}
                {!uploading && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium rounded-lg bg-navy-100 text-navy-800 hover:bg-navy-200 transition-colors cursor-pointer"
                    >
                      <Upload size={16} className="text-navy-600" />
                      <span>Trocar foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                      <span>Remover</span>
                    </button>
                    <span className="text-xs text-navy-400 ml-auto hidden sm:inline">
                      JPG, PNG, WebP ou GIF • Máximo 5MB
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-navy-200 rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-accent-400 hover:bg-accent-50/30 transition-all group"
              >
                <Upload size={32} className="mx-auto text-navy-300 group-hover:text-accent-500 transition-colors mb-3" />
                <p className="text-sm font-medium text-navy-600 group-hover:text-accent-600 transition-colors">
                  Clique para enviar uma imagem
                </p>
                <p className="text-xs text-navy-400 mt-1">
                  JPG, PNG, WebP ou GIF • Máximo 5MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {errors.image_url && (
              <span className="text-xs text-red-500 mt-1 block">{errors.image_url}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy-700">Conteúdo</label>
            <ReactQuill
              theme="snow"
              value={form.content}
              onChange={(value) => handleChange('content', value)}
              modules={quillModules}
              placeholder="Escreva o conteúdo da notícia..."
            />
            {errors.content && (
              <span className="text-xs text-red-500">{errors.content}</span>
            )}
          </div>
        </div>

        {/* Sidebar options */}
        <div className="bg-white rounded-xl shadow-card p-4 sm:p-6 space-y-5">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
            Opções de publicação
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-navy-200 text-navy-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent bg-white cursor-pointer"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-navy-100 hover:bg-navy-50/50 cursor-pointer group transition-colors">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => handleChange('featured', e.target.checked)}
              className="w-4 h-4 rounded border-navy-300 text-accent-500 focus:ring-accent-400 cursor-pointer"
            />
            <span className="text-sm font-medium text-navy-700 group-hover:text-navy-900 transition-colors">
              Marcar como destaque
            </span>
          </label>

          <div className="border-t border-navy-100 pt-4 space-y-4">
            <h4 className="text-xs font-bold text-navy-500 uppercase tracking-wider">
              Página Inicial
            </h4>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-navy-100 hover:bg-navy-50/50 cursor-pointer group transition-colors">
              <input
                type="checkbox"
                checked={form.show_on_home}
                onChange={(e) => handleChange('show_on_home', e.target.checked)}
                className="w-4 h-4 rounded border-navy-300 text-accent-500 focus:ring-accent-400 cursor-pointer"
              />
              <span className="text-sm font-medium text-navy-700 group-hover:text-navy-900 transition-colors">
                Exibir na página inicial
              </span>
            </label>

            {form.show_on_home && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-navy-700">
                  Ordem de exibição
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={form.home_order || ''}
                  onChange={(e) => handleChange('home_order', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 1, 2, 3..."
                  className="w-full px-4 py-2.5 rounded-lg border border-navy-200 text-navy-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
                />
                <p className="text-xs text-navy-400">
                  Menor número = mais acima na página
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/noticias')}
            className="w-full sm:w-auto justify-center"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={saving || uploading}
            className="w-full sm:w-auto justify-center"
          >
            <Save size={18} />
            {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Publicar Notícia'}
          </Button>
        </div>
      </form>
    </div>
  );
}
