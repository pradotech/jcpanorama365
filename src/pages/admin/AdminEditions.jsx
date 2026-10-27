import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, FileText, Download, Loader2, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatStorageError } from '../../lib/storage';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

export default function AdminEditions() {
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [title, setTitle] = useState('');
  const [editionDate, setEditionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Carregar edições
  const fetchEditions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('editions')
      .select('*')
      .order('edition_date', { ascending: false });

    if (error) {
      console.error('Erro ao carregar edições:', error.message);
    } else {
      setEditions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEditions();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Apenas arquivos PDF são aceitos.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 50MB.');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Preencher título automático se vazio
    if (!title.trim()) {
      setTitle(`Edição ${new Date(editionDate).toLocaleDateString('pt-BR')}`);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Selecione um arquivo PDF.');
      return;
    }
    if (!title.trim()) {
      setError('Preencha o título da edição.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // 1. Upload do PDF
      const timestamp = Date.now();
      const fileName = `${editionDate}-${timestamp}.pdf`;
      const filePath = `pdfs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('editions')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 2. Obter URL pública
      const { data: urlData } = supabase.storage
        .from('editions')
        .getPublicUrl(filePath);

      // 3. Salvar no banco
      const { error: dbError } = await supabase
        .from('editions')
        .insert({
          title: title.trim(),
          edition_date: editionDate,
          pdf_url: urlData.publicUrl,
        });

      if (dbError) throw dbError;

      // Limpar formulário e recarregar
      setTitle('');
      setEditionDate(new Date().toISOString().split('T')[0]);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchEditions();
    } catch (err) {
      console.error('Erro no upload:', err);
      setError('Erro ao enviar edição: ' + formatStorageError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (edition) => {
    try {
      // Extrair path do arquivo
      if (edition.pdf_url) {
        const url = new URL(edition.pdf_url);
        const pathParts = url.pathname.split('editions/');
        if (pathParts.length >= 2) {
          await supabase.storage.from('editions').remove([pathParts[1]]);
        }
      }

      // Deletar do banco
      await supabase.from('editions').delete().eq('id', edition.id);
      await fetchEditions();
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
    setDeleteModal(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Edição do Dia</h1>
        <p className="text-navy-500 text-sm mt-1">
          Faça upload do PDF da edição impressa do jornal
        </p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4">
          Nova Edição
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-navy-700">
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Edição 09/08/2026"
                className="w-full px-4 py-2.5 rounded-lg border border-navy-200 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-navy-700">
                Data da Edição
              </label>
              <input
                type="date"
                value={editionDate}
                onChange={(e) => setEditionDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-navy-200 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* File upload area */}
          <div>
            {selectedFile ? (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-accent-50 border border-accent-200">
                <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600">
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-800 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-navy-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-2 rounded-lg text-navy-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-navy-200 rounded-xl p-8 text-center cursor-pointer hover:border-accent-400 hover:bg-accent-50/30 transition-all group"
              >
                <Upload size={32} className="mx-auto text-navy-300 group-hover:text-accent-500 transition-colors mb-3" />
                <p className="text-sm font-medium text-navy-600 group-hover:text-accent-600 transition-colors">
                  Clique para selecionar o PDF
                </p>
                <p className="text-xs text-navy-400 mt-1">
                  Arquivo PDF • Máximo 50MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={uploading || !selectedFile}>
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload size={16} />
                  Enviar Edição
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Editions List */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-100">
          <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
            Edições Publicadas
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-navy-300" />
          </div>
        ) : editions.length === 0 ? (
          <div className="py-12 text-center">
            <FileText size={40} className="mx-auto text-navy-200 mb-3" />
            <p className="text-navy-500 font-medium">Nenhuma edição publicada</p>
            <p className="text-navy-400 text-sm mt-1">Faça upload do primeiro PDF acima</p>
          </div>
        ) : (
          <div className="divide-y divide-navy-50">
            {editions.map(edition => (
              <div
                key={edition.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-navy-50/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-800">
                    {edition.title}
                  </p>
                  <p className="text-xs text-navy-400 flex items-center gap-1.5 mt-0.5">
                    <Calendar size={12} />
                    {new Date(edition.edition_date + 'T12:00:00').toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={edition.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-accent-500 hover:bg-accent-50 transition-colors"
                    title="Baixar PDF"
                  >
                    <Download size={16} />
                  </a>
                  <button
                    onClick={() => setDeleteModal(edition)}
                    className="p-2 rounded-lg text-navy-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-navy-700">
            Tem certeza que deseja excluir a edição{' '}
            <strong>"{deleteModal?.title}"</strong>?
          </p>
          <p className="text-sm text-navy-500">
            O PDF será removido permanentemente.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteModal)}>
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
