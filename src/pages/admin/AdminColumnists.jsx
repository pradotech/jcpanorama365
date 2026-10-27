import { useState, useRef } from 'react';
import { PlusCircle, Search, Edit3, Trash2, Upload, X, Loader2, UserCheck, Sparkles } from 'lucide-react';
import { useColumnists } from '../../hooks/useColumnists';
import { uploadImage } from '../../lib/storage';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const emptyColumnist = {
  name: '',
  avatar_url: '',
  bio: '',
  role: 'Colunista',
};

export default function AdminColumnists() {
  const { columnists, loading, addColumnist, updateColumnist, deleteColumnist } = useColumnists();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingColumnist, setEditingColumnist] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const [form, setForm] = useState(emptyColumnist);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const filteredColumnists = columnists.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.role && c.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.bio && c.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openNewModal = () => {
    setEditingColumnist(null);
    setForm(emptyColumnist);
    setImagePreview('');
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (columnist) => {
    setEditingColumnist(columnist);
    setForm({
      name: columnist.name || '',
      avatar_url: columnist.avatar_url || '',
      bio: columnist.bio || '',
      role: columnist.role || 'Colunista',
    });
    setImagePreview(columnist.avatar_url || '');
    setErrors({});
    setModalOpen(true);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, avatar_url: 'Formato não suportado. Use JPG, PNG, WebP ou GIF.' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar_url: 'A foto deve ter no máximo 5MB.' }));
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setUploading(true);
    setErrors(prev => ({ ...prev, avatar_url: '' }));

    try {
      const publicUrl = await uploadImage(file);
      setForm(prev => ({ ...prev, avatar_url: publicUrl }));
      setImagePreview(publicUrl);
    } catch (err) {
      console.error('Erro no upload:', err);
      setErrors(prev => ({ ...prev, avatar_url: err.message }));
      setImagePreview('');
      setForm(prev => ({ ...prev, avatar_url: '' }));
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, avatar_url: '' }));
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nome do colunista é obrigatório';
    if (!form.avatar_url.trim()) newErrors.avatar_url = 'Foto do colunista é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (editingColumnist) {
        await updateColumnist(editingColumnist.id, form);
      } else {
        await addColumnist(form);
      }
      setModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar colunista: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteColumnist(id);
      setDeleteModal(null);
    } catch (err) {
      alert('Erro ao excluir colunista: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Gerenciar Colunistas</h1>
          <p className="text-navy-500 text-sm mt-1">
            Cadastre e edite os colunistas do JC Panorama 365
          </p>
        </div>
        <Button onClick={openNewModal} variant="primary">
          <PlusCircle size={16} />
          Novo Colunista
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="Buscar colunista por nome ou especialidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Grid of Columnists */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-accent-500" />
        </div>
      ) : filteredColumnists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredColumnists.map(col => (
            <div
              key={col.id}
              className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col justify-between p-6 border border-navy-100 hover:shadow-card-hover transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  {col.avatar_url ? (
                    <img
                      src={col.avatar_url}
                      alt={col.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-accent-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-bold text-xl">
                      {col.name.charAt(0)}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-navy-900 text-base leading-tight truncate">
                    {col.name}
                  </h3>
                  <span className="inline-block px-2 py-0.5 mt-1 rounded text-xs font-semibold bg-accent-50 text-accent-700">
                    {col.role || 'Colunista'}
                  </span>
                  {col.bio && (
                    <p className="text-xs text-navy-500 mt-2 line-clamp-2 leading-relaxed">
                      {col.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-navy-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(col)}
                  className="p-2 rounded-lg text-navy-500 hover:bg-navy-50 hover:text-navy-800 transition-colors cursor-pointer text-xs font-medium flex items-center gap-1.5"
                  title="Editar"
                >
                  <Edit3 size={15} />
                  Editar
                </button>
                <button
                  onClick={() => setDeleteModal(col)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer text-xs font-medium flex items-center gap-1.5"
                  title="Excluir"
                >
                  <Trash2 size={15} />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <UserCheck size={48} className="mx-auto text-navy-200 mb-3" />
          <h3 className="text-lg font-bold text-navy-800">Nenhum colunista encontrado</h3>
          <p className="text-sm text-navy-400 mt-1 max-w-md mx-auto">
            Cadastre os colunistas e articulistas para poder vinculá-los às matérias e exibir a foto de autoria abaixo das notícias.
          </p>
          <div className="mt-6">
            <Button onClick={openNewModal} variant="primary">
              <PlusCircle size={16} />
              Cadastrar Primeiro Colunista
            </Button>
          </div>
        </div>
      )}

      {/* Modal Criar / Editar Colunista */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingColumnist ? 'Editar Colunista' : 'Novo Colunista'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label className="text-sm font-medium text-navy-700 block mb-2">
              Foto do Colunista
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-accent-200"
                  />
                  {!uploading && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                      title="Remover foto"
                    >
                      <X size={12} />
                    </button>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <Loader2 size={16} className="animate-spin text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full border-2 border-dashed border-navy-300 hover:border-accent-400 hover:bg-accent-50/50 flex flex-col items-center justify-center cursor-pointer transition-all shrink-0"
                >
                  <Upload size={18} className="text-navy-400" />
                  <span className="text-[10px] text-navy-500 mt-1">Foto</span>
                </div>
              )}

              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Enviando...' : imagePreview ? 'Alterar foto' : 'Enviar foto'}
                </Button>
                <p className="text-xs text-navy-400 mt-1">
                  Recomendado imagem quadrada (ex: 400x400) • Máximo 5MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {errors.avatar_url && (
              <span className="text-xs text-red-500 mt-1 block">{errors.avatar_url}</span>
            )}
          </div>

          <Input
            label="Nome do Colunista"
            placeholder="Ex: Dra. Mariana Costa"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
          />

          <Input
            label="Especialidade / Cargo"
            placeholder="Ex: Política & Economia / Especialista em Saúde"
            value={form.role}
            onChange={(e) => handleChange('role', e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy-700">
              Mini Biografia / Descrição
            </label>
            <textarea
              rows={3}
              placeholder="Breve descrição do colunista, formação ou especialidade que aparecerá no rodapé da notícia..."
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-navy-200 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving || uploading}
            >
              {saving ? 'Salvando...' : editingColumnist ? 'Salvar Alterações' : 'Cadastrar Colunista'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Exclusão */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-navy-700">
            Tem certeza que deseja excluir o(a) colunista{' '}
            <strong>"{deleteModal?.name}"</strong>?
          </p>
          <p className="text-xs text-navy-500">
            As notícias já vinculadas continuarão com as informações gravadas.
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
