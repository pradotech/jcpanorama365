import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, ArrowRight, Upload, X, Loader2, UserCheck, Users, Trash2, Images, Star, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNews } from '../../hooks/useNews';
import { useColumnists } from '../../hooks/useColumnists';
import { uploadImage } from '../../lib/storage';
import { getArticleImages } from '../../lib/imageUtils';
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
  images: [],
  author: '',
  status: 'draft',
  featured: false,
  show_on_home: true,
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
  const [uploadProgressText, setUploadProgressText] = useState('');

  useEffect(() => {
    if (isEditing) {
      const article = getNewsById(id);
      if (article) {
        const articleImages = getArticleImages(article);
        setForm({
          ...article,
          images: articleImages,
          image_url: articleImages[0] || article.image_url || '',
        });
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

  // Upload de imagens (permite múltiplas fotos)
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validação dos arquivos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFile = files.find(file => file.type && !allowedTypes.includes(file.type) && !file.type.startsWith('image/'));
    if (invalidFile) {
      setErrors(prev => ({ ...prev, image_url: 'Formato não suportado. Use JPG, PNG, WebP ou GIF.' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const oversizedFile = files.find(file => file.size > 5 * 1024 * 1024);
    if (oversizedFile) {
      setErrors(prev => ({ ...prev, image_url: 'Cada imagem deve ter no máximo 5MB.' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    setErrors(prev => ({ ...prev, image_url: '' }));

    try {
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgressText(`Enviando foto ${i + 1} de ${files.length}...`);
        const publicUrl = await uploadImage(files[i]);
        uploadedUrls.push(publicUrl);
      }

      setForm(prev => {
        const currentList = Array.isArray(prev.images) && prev.images.length > 0
          ? prev.images
          : (prev.image_url ? [prev.image_url] : []);
        const updated = [...currentList, ...uploadedUrls];
        return {
          ...prev,
          images: updated,
          image_url: updated[0] || '',
        };
      });
    } catch (err) {
      console.error('Erro no upload:', err);
      setErrors(prev => ({ ...prev, image_url: err.message || 'Erro ao enviar imagens' }));
    } finally {
      setUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImageAt = (index) => {
    setForm(prev => {
      const currentList = Array.isArray(prev.images) && prev.images.length > 0
        ? prev.images
        : (prev.image_url ? [prev.image_url] : []);
      const updated = currentList.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || '',
      };
    });
  };

  const makeCover = (index) => {
    if (index === 0) return;
    setForm(prev => {
      const currentList = Array.isArray(prev.images) && prev.images.length > 0
        ? prev.images
        : (prev.image_url ? [prev.image_url] : []);
      const item = currentList[index];
      const rest = currentList.filter((_, idx) => idx !== index);
      const updated = [item, ...rest];
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || '',
      };
    });
  };

  const moveImage = (fromIndex, toIndex) => {
    setForm(prev => {
      const currentList = Array.isArray(prev.images) && prev.images.length > 0
        ? [...prev.images]
        : (prev.image_url ? [prev.image_url] : []);
      if (toIndex < 0 || toIndex >= currentList.length) return prev;
      const [moved] = currentList.splice(fromIndex, 1);
      currentList.splice(toIndex, 0, moved);
      return {
        ...prev,
        images: currentList,
        image_url: currentList[0] || '',
      };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!form.subtitle.trim()) newErrors.subtitle = 'Subtítulo é obrigatório';
    if (!form.content.trim() || form.content === '<p><br></p>') newErrors.content = 'Conteúdo é obrigatório';
    if (!form.author.trim()) newErrors.author = 'Autor é obrigatório';
    const hasImage = (Array.isArray(form.images) && form.images.length > 0) || Boolean(form.image_url && form.image_url.trim());
    if (!hasImage) newErrors.image_url = 'Ao menos uma imagem de capa é obrigatória';
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
    const imagesList = Array.isArray(form.images) && form.images.length > 0
      ? form.images
      : (form.image_url ? [form.image_url] : []);

    const cleanedForm = {
      ...form,
      images: imagesList,
      image_url: imagesList[0] || '',
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

          {/* Fotos da Publicação (Capa e Galeria/Carrossel) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Images size={16} className="text-accent-600" />
                <span>Fotos da Publicação</span>
                {form.images?.length > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-navy-100 text-navy-700">
                    {form.images.length} {form.images.length === 1 ? 'foto' : 'fotos'}
                  </span>
                )}
              </label>
              {form.images?.length > 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-600 hover:text-accent-700 hover:bg-accent-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>Adicionar fotos</span>
                </button>
              )}
            </div>

            {form.images && form.images.length > 0 ? (
              <div className="space-y-3">
                {/* Visualização de Fotos Adicionadas em Grade */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {form.images.map((imgUrl, index) => (
                    <div
                      key={index}
                      className={`relative rounded-xl overflow-hidden border-2 bg-navy-50 group/thumb transition-all ${
                        index === 0
                          ? 'border-accent-500 ring-2 ring-accent-100 shadow-sm'
                          : 'border-navy-200 hover:border-navy-300'
                      }`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Tag de Capa ou Posição */}
                      <div className="absolute top-1.5 left-1.5 z-10 pointer-events-none">
                        {index === 0 ? (
                          <span className="bg-accent-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                            <Star size={10} className="fill-white" />
                            Capa
                          </span>
                        ) : (
                          <span className="bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                            #{index + 1}
                          </span>
                        )}
                      </div>

                      {/* Ações da foto visíveis no hover (ou sempre em mobile) */}
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeImageAt(index)}
                            title="Remover foto"
                            className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => moveImage(index, index - 1)}
                                title="Mover para trás"
                                className="w-6 h-6 rounded-md bg-white/90 hover:bg-white text-navy-800 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                              >
                                <ArrowLeft size={12} />
                              </button>
                            )}
                            {index < form.images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveImage(index, index + 1)}
                                title="Mover para frente"
                                className="w-6 h-6 rounded-md bg-white/90 hover:bg-white text-navy-800 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                              >
                                <ArrowRight size={12} />
                              </button>
                            )}
                          </div>

                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => makeCover(index)}
                              title="Definir como capa principal"
                              className="text-[10px] font-bold bg-white/90 hover:bg-white text-navy-900 px-2 py-1 rounded-md transition-colors shadow-xs cursor-pointer"
                            >
                              Tornar capa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-navy-500">
                  <p>
                    💡 A foto marcada como <strong>Capa</strong> (#1) é a principal. Quando houver 2 ou mais fotos, elas serão exibidas em <strong>carrossel automático navegável</strong> nos cards e na matéria.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-100 hover:bg-navy-200 text-navy-800 font-medium transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Adicionar mais fotos</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-navy-200 rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-accent-400 hover:bg-accent-50/30 transition-all group"
              >
                <Upload size={32} className="mx-auto text-navy-300 group-hover:text-accent-500 transition-colors mb-3" />
                <p className="text-sm font-medium text-navy-600 group-hover:text-accent-600 transition-colors">
                  Clique para enviar imagens (uma ou várias)
                </p>
                <p className="text-xs text-navy-400 mt-1">
                  JPG, PNG, WebP ou GIF • Máximo 5MB por foto • Selecione vários arquivos para criar um carrossel
                </p>
              </div>
            )}

            {uploading && (
              <div className="flex items-center gap-2 text-accent-700 bg-accent-50 border border-accent-200 px-4 py-2.5 rounded-lg text-sm font-medium animate-pulse">
                <Loader2 size={16} className="animate-spin text-accent-600 shrink-0" />
                <span>{uploadProgressText || 'Enviando imagens...'}</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
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
