import { useState } from 'react';
import { X, Copy, Check, Link2, Type, Image as ImageIcon, ExternalLink, Loader2, Sparkles, HelpCircle } from 'lucide-react';

// Ícone SVG oficial do Instagram
function InstagramIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function InstagramShareModal({
  isOpen,
  onClose,
  article,
  url,
  copyToClipboard,
  showToast,
}) {
  const [copiedSection, setCopiedSection] = useState('');
  const [isSharingImage, setIsSharingImage] = useState(false);

  if (!isOpen || !article) return null;

  const imageUrl =
    (article.images && article.images.length > 0 ? article.images[0] : null) || article.image_url;

  // 1. Copiar Link limpo (pronto para a figurinha de link dos Stories)
  const handleCopyCleanLink = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedSection('link');
      if (showToast) showToast('Link copiado! Cole na figurinha de Link (🔗) dos Stories.');
      setTimeout(() => setCopiedSection(''), 3000);
    }
  };

  // 2. Copiar Título limpo (compatível com a ferramenta de texto do Instagram)
  const handleCopyTitle = async () => {
    const success = await copyToClipboard(article.title);
    if (success) {
      setCopiedSection('title');
      if (showToast) showToast('Título copiado! Pronto para colar no texto (Aa) do Story ou na legenda.');
      setTimeout(() => setCopiedSection(''), 3000);
    }
  };

  // 3. Compartilhar a foto oficial da matéria direto nos Stories via Web Share API
  const handleShareStoriesImage = async () => {
    // Pré-copia o link limpo para a área de transferência:
    // assim que o Story abrir, o link já está na mão para colar na figurinha!
    await copyToClipboard(url);

    if (imageUrl && typeof navigator !== 'undefined' && navigator.share) {
      try {
        setIsSharingImage(true);
        const response = await fetch(imageUrl, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          const mimeType = blob.type || 'image/jpeg';
          const extension = mimeType.includes('png') ? 'png' : 'jpg';
          const file = new File([blob], `noticia-jc.${extension}`, { type: mimeType });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: article.title,
            });
            if (showToast) showToast('Foto aberta nos Stories e link copiado!');
            return;
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('Falha ao compartilhar foto no Instagram:', err);
      } finally {
        setIsSharingImage(false);
      }
    }

    // Fallback caso não suporte envio direto de arquivo: abre o app
    if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.location.href = 'instagram://app';
    } else {
      window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Card Principal */}
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-navy-100 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
      >
        {/* Cabeçalho Gradiente do Instagram */}
        <div className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
              <InstagramIcon className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">Compartilhar no Instagram</h3>
              <p className="text-[11px] text-white/90">Stories, Feed e Reels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo com opções */}
        <div className="p-5 space-y-4 overflow-y-auto text-navy-800">
          {/* Prévia da Matéria */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-navy-50/70 border border-navy-100">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={article.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-navy-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-navy-100 flex items-center justify-center shrink-0">
                <ImageIcon size={22} className="text-navy-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-navy-900 line-clamp-2 leading-snug">
                {article.title}
              </p>
              <p className="text-[11px] text-navy-500 truncate mt-0.5">
                jcpanorama365.com.br
              </p>
            </div>
          </div>

          {/* Opção 1: Abrir Foto nos Stories */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={handleShareStoriesImage}
              disabled={isSharingImage}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-75"
            >
              {isSharingImage ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white shrink-0" />
                  <span>Preparando foto...</span>
                </>
              ) : (
                <>
                  <ImageIcon size={18} className="shrink-0" />
                  <span>1. Abrir Foto nos Stories</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-navy-500 text-center px-2">
              Abre o Instagram com a foto de capa e <strong>já copia o link da matéria</strong>.
            </p>
          </div>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-navy-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[11px] font-semibold text-navy-400 uppercase tracking-wider">
                Copiar para colar no Instagram
              </span>
            </div>
          </div>

          {/* Opção 2: Copiar Link da Figurinha 🔗 */}
          <div className="p-3.5 rounded-2xl border border-pink-200 bg-pink-50/50 hover:bg-pink-50 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Link2 size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-navy-900 leading-tight">
                    Link Clicável (Figurinha 🔗)
                  </h4>
                  <p className="text-[11px] text-navy-500 leading-relaxed mt-0.5">
                    Cole no sticker de <strong>Link</strong> dos Stories para os leitores clicarem.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyCleanLink}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-xs ${
                  copiedSection === 'link'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white hover:bg-pink-100 text-pink-700 border border-pink-300'
                }`}
              >
                {copiedSection === 'link' ? (
                  <>
                    <Check size={14} className="shrink-0" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="shrink-0" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Opção 3: Copiar Título da Matéria (Texto Aa) */}
          <div className="p-3.5 rounded-2xl border border-navy-200 bg-navy-50/50 hover:bg-navy-50 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-navy-100 text-navy-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Type size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-navy-900 leading-tight">
                    Título da Notícia (Texto Aa)
                  </h4>
                  <p className="text-[11px] text-navy-500 leading-relaxed mt-0.5">
                    Cole no <strong>Texto (Aa)</strong> dos Stories ou na legenda do Feed.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyTitle}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-xs ${
                  copiedSection === 'title'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white hover:bg-navy-100 text-navy-700 border border-navy-300'
                }`}
              >
                {copiedSection === 'title' ? (
                  <>
                    <Check size={14} className="shrink-0" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="shrink-0" />
                    <span>Copiar Título</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dica visual passo a passo */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Sparkles size={13} className="text-amber-600 shrink-0" />
              <span>Como colocar o link nos Stories:</span>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-amber-900/90 pl-1">
              <li>Nos Stories, toque no ícone de <strong>Figurinha</strong> no topo</li>
              <li>Escolha a opção <strong>LINK (🔗)</strong></li>
              <li>Toque e segure no campo URL e clique em <strong>Colar</strong></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
