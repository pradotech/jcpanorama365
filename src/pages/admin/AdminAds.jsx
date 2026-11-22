import { useState, useEffect, useRef } from 'react';
import {
  Megaphone, Upload, Trash2, Eye, EyeOff, Save, Check, AlertCircle, Loader2, Image as ImageIcon, ExternalLink,
  Copy, Database, ChevronDown
} from 'lucide-react';
import { getAds, updateAd } from '../../services/adService';
import { uploadImage } from '../../lib/storage';
import AdCard from '../../components/news/AdCard';

export default function AdminAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSqlBox, setShowSqlBox] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  const sqlQuery = `-- Tabela de Anúncios no Supabase
CREATE TABLE IF NOT EXISTS public.ads (
  id text PRIMARY KEY,
  title text NOT NULL,
  position integer DEFAULT 1,
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de anúncios" ON public.ads;
DROP POLICY IF EXISTS "Permitir gestão de anúncios para administradores" ON public.ads;

CREATE POLICY "Permitir leitura pública de anúncios" ON public.ads FOR SELECT USING (true);
CREATE POLICY "Permitir gestão de anúncios para administradores" ON public.ads FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.ads (id, title, position, image_url, is_active)
VALUES
  ('ad_home_1', 'Anúncio 1 (Após a 3ª notícia)', 1, '', true),
  ('ad_home_2', 'Anúncio 2 (Após mais três notícias)', 2, '', true)
ON CONFLICT (id) DO NOTHING;`;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getAds();
        setAds(data);
      } catch (err) {
        console.error('Erro ao carregar anúncios:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleToggleActive = async (ad) => {
    const updatedStatus = !ad.is_active;
    setSavingId(ad.id);
    try {
      const res = await updateAd(ad.id, { is_active: updatedStatus });
      setAds(res.ads);
      if (res.syncedWithDb) {
        showToast(updatedStatus ? '✅ Anúncio ativado e salvo no banco de dados!' : '✅ Anúncio pausado e salvo no banco de dados!');
      } else {
        showToast(updatedStatus ? 'Anúncio ativado (salvo localmente)!' : 'Anúncio pausado (salvo localmente)!');
      }
    } catch (err) {
      setErrorMessage('Erro ao alterar status: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleFileUpload = async (adId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(adId);
    setErrorMessage('');
    try {
      const publicUrl = await uploadImage(file);
      const res = await updateAd(adId, { image_url: publicUrl, is_active: true });
      setAds(res.ads);
      if (res.syncedWithDb) {
        showToast('✅ Imagem salva e persistida no banco de dados Supabase com sucesso!');
      } else {
        showToast('✅ Imagem publicada no storage e salva no navegador! (Execute o SQL abaixo para persistir no banco de todos)');
      }
    } catch (err) {
      setErrorMessage('Erro no upload da imagem: ' + err.message);
    } finally {
      setUploadingId(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleUrlChange = async (adId, newUrl) => {
    setSavingId(adId);
    try {
      const res = await updateAd(adId, { image_url: newUrl });
      setAds(res.ads);
      if (res.syncedWithDb) {
        showToast('✅ URL salva e persistida no banco de dados!');
      } else {
        showToast('URL atualizada!');
      }
    } catch (err) {
      setErrorMessage('Erro ao salvar URL: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleRemoveImage = async (adId) => {
    if (!confirm('Deseja realmente remover a imagem deste anúncio? Ele deixará de ser exibido na Home.')) {
      return;
    }
    setSavingId(adId);
    try {
      const res = await updateAd(adId, { image_url: '' });
      setAds(res.ads);
      if (res.syncedWithDb) {
        showToast('✅ Anúncio removido do banco de dados e da Home!');
      } else {
        showToast('Imagem do anúncio removida!');
      }
    } catch (err) {
      setErrorMessage('Erro ao remover: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const ad1 = ads.find(a => a.id === 'ad_home_1') || {
    id: 'ad_home_1',
    title: 'Anúncio 1 (Após a 3ª notícia)',
    image_url: '',
    is_active: true,
  };

  const ad2 = ads.find(a => a.id === 'ad_home_2') || {
    id: 'ad_home_2',
    title: 'Anúncio 2 (Após mais três notícias)',
    image_url: '',
    is_active: true,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <Loader2 size={32} className="animate-spin mx-auto text-accent-500" />
          <p className="text-sm font-medium text-navy-500">Carregando configurações de anúncios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2.5">
            <Megaphone size={24} className="text-accent-500" />
            Gerenciar Anúncios da Home
          </h1>
          <p className="text-navy-500 text-sm mt-1">
            Configure as imagens dos 2 cards publicitários que aparecem entre os blocos de notícias na página inicial.
          </p>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-xs animate-in fade-in">
          <Check size={18} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-xs">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Regras e Informações */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 text-xs sm:text-sm text-blue-900 leading-relaxed">
        <p className="font-semibold mb-1 flex items-center gap-1.5 text-blue-950">
          📌 Como funciona a exibição na Página Inicial:
        </p>
        <ul className="list-disc list-inside space-y-1 text-blue-800/90 pl-1">
          <li><strong>Posição 1:</strong> Exibido logo após a 3ª notícia da listagem principal.</li>
          <li><strong>Posição 2:</strong> Exibido após mais três notícias (6ª notícia da listagem).</li>
          <li><strong>Formato:</strong> Possui exatamente o mesmo tamanho e proporção dos cards de notícias, exibindo apenas a imagem pura (sem links de redirecionamento e sem textos).</li>
          <li><strong>Exibição inteligente:</strong> Se um anúncio estiver desativado ou sem imagem, ele não ocupará espaço vazio, mantendo o fluxo natural das notícias.</li>
        </ul>
      </div>

      {/* Grid com os 2 Anúncios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD DO ANÚNCIO 1 */}
        <div className="bg-white rounded-2xl shadow-card border border-navy-100/80 p-5 sm:p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-navy-100">
              <div>
                <span className="text-[11px] font-extrabold text-accent-600 uppercase tracking-wider block">
                  1º Card de Anúncio
                </span>
                <h3 className="text-base font-bold text-navy-900 mt-0.5">Após a 3ª notícia</h3>
              </div>
              <button
                type="button"
                onClick={() => handleToggleActive(ad1)}
                disabled={savingId === ad1.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  ad1.is_active && ad1.image_url
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-navy-50 text-navy-400 border border-navy-200'
                }`}
              >
                {ad1.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                <span>{ad1.is_active ? 'Ativo' : 'Pausado'}</span>
              </button>
            </div>

            {/* Preview da Imagem */}
            <div className="mt-4">
              <span className="text-xs font-semibold text-navy-600 block mb-2">
                Prévia em tempo real (idêntica à Home):
              </span>
              <div className="w-full max-w-sm mx-auto">
                {uploadingId === ad1.id ? (
                  <div className="aspect-[4/3] rounded-xl border border-navy-200/80 bg-navy-50 flex items-center justify-center p-4">
                    <div className="text-center">
                      <Loader2 size={24} className="animate-spin mx-auto text-accent-500 mb-2" />
                      <span className="text-xs text-navy-500 font-medium">Otimizando e enviando imagem...</span>
                    </div>
                  </div>
                ) : ad1.image_url ? (
                  <AdCard imageUrl={ad1.image_url} alt="Prévia Anúncio 1" />
                ) : (
                  <div className="aspect-[4/3] rounded-xl border border-dashed border-navy-300 bg-navy-50/60 flex items-center justify-center text-center p-6 text-navy-400">
                    <div>
                      <ImageIcon size={32} className="mx-auto mb-1.5 opacity-40 text-navy-400" />
                      <span className="text-xs font-medium block">Nenhuma imagem cadastrada</span>
                      <span className="text-[11px] text-navy-400/80 mt-0.5 block">Envie uma imagem abaixo para ativar este anúncio</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ações de Upload */}
          <div className="space-y-3 pt-3 border-t border-navy-100">
            <input
              type="file"
              ref={fileInputRef1}
              accept="image/*"
              onChange={(e) => handleFileUpload(ad1.id, e)}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef1.current?.click()}
                disabled={uploadingId === ad1.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Upload size={16} />
                <span>{ad1.image_url ? 'Trocar Imagem' : 'Enviar Imagem'}</span>
              </button>

              {ad1.image_url && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(ad1.id)}
                  className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remover imagem"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Inserir URL manual opcional */}
            <div className="pt-2">
              <label className="text-[11px] font-medium text-navy-400 block mb-1">
                Ou cole a URL direta da imagem:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://..."
                  defaultValue={ad1.image_url || ''}
                  onBlur={(e) => {
                    if (e.target.value !== ad1.image_url) {
                      handleUrlChange(ad1.id, e.target.value.trim());
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-navy-200 text-navy-800 focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD DO ANÚNCIO 2 */}
        <div className="bg-white rounded-2xl shadow-card border border-navy-100/80 p-5 sm:p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-navy-100">
              <div>
                <span className="text-[11px] font-extrabold text-accent-600 uppercase tracking-wider block">
                  2º Card de Anúncio
                </span>
                <h3 className="text-base font-bold text-navy-900 mt-0.5">Após a 6ª notícia</h3>
              </div>
              <button
                type="button"
                onClick={() => handleToggleActive(ad2)}
                disabled={savingId === ad2.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  ad2.is_active && ad2.image_url
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-navy-50 text-navy-400 border border-navy-200'
                }`}
              >
                {ad2.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                <span>{ad2.is_active ? 'Ativo' : 'Pausado'}</span>
              </button>
            </div>

            {/* Preview da Imagem */}
            <div className="mt-4">
              <span className="text-xs font-semibold text-navy-600 block mb-2">
                Prévia em tempo real (idêntica à Home):
              </span>
              <div className="w-full max-w-sm mx-auto">
                {uploadingId === ad2.id ? (
                  <div className="aspect-[4/3] rounded-xl border border-navy-200/80 bg-navy-50 flex items-center justify-center p-4">
                    <div className="text-center">
                      <Loader2 size={24} className="animate-spin mx-auto text-accent-500 mb-2" />
                      <span className="text-xs text-navy-500 font-medium">Otimizando e enviando imagem...</span>
                    </div>
                  </div>
                ) : ad2.image_url ? (
                  <AdCard imageUrl={ad2.image_url} alt="Prévia Anúncio 2" />
                ) : (
                  <div className="aspect-[4/3] rounded-xl border border-dashed border-navy-300 bg-navy-50/60 flex items-center justify-center text-center p-6 text-navy-400">
                    <div>
                      <ImageIcon size={32} className="mx-auto mb-1.5 opacity-40 text-navy-400" />
                      <span className="text-xs font-medium block">Nenhuma imagem cadastrada</span>
                      <span className="text-[11px] text-navy-400/80 mt-0.5 block">Envie uma imagem abaixo para ativar este anúncio</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ações de Upload */}
          <div className="space-y-3 pt-3 border-t border-navy-100">
            <input
              type="file"
              ref={fileInputRef2}
              accept="image/*"
              onChange={(e) => handleFileUpload(ad2.id, e)}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef2.current?.click()}
                disabled={uploadingId === ad2.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Upload size={16} />
                <span>{ad2.image_url ? 'Trocar Imagem' : 'Enviar Imagem'}</span>
              </button>

              {ad2.image_url && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(ad2.id)}
                  className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remover imagem"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Inserir URL manual opcional */}
            <div className="pt-2">
              <label className="text-[11px] font-medium text-navy-400 block mb-1">
                Ou cole a URL direta da imagem:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://..."
                  defaultValue={ad2.image_url || ''}
                  onBlur={(e) => {
                    if (e.target.value !== ad2.image_url) {
                      handleUrlChange(ad2.id, e.target.value.trim());
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-navy-200 text-navy-800 focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caixa de Ajuda / Sincronização com o Banco de Dados */}
      <div className="bg-white rounded-2xl shadow-card border border-navy-100/80 p-5 overflow-hidden">
        <div
          onClick={() => setShowSqlBox(prev => !prev)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center">
              <Database size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy-900">
                Persistência no Banco de Dados (Supabase)
              </h3>
              <p className="text-xs text-navy-500">
                Os anúncios já são persistidos no Supabase através da tabela <code className="bg-navy-50 px-1 py-0.5 rounded font-mono text-[11px]">ads</code>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-accent-600">
              {showSqlBox ? 'Ocultar script' : 'Ver script SQL'}
            </span>
            <ChevronDown size={16} className={`text-navy-400 transition-transform ${showSqlBox ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {showSqlBox && (
          <div className="mt-4 pt-4 border-t border-navy-100 space-y-3">
            <div className="flex items-center justify-between text-xs text-navy-500">
              <span>Execute uma única vez no <strong>SQL Editor</strong> do Supabase para criar a tabela de anúncios:</span>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 text-white font-bold hover:bg-navy-800 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-navy-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed">
              {sqlQuery}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
