import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, ArrowLeft, ArrowRight, Share2, Check, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { useNews } from '../hooks/useNews';
import { getCategoryById } from '../data/categories';
import CategoryBadge from '../components/ui/CategoryBadge';
import NewsCard from '../components/news/NewsCard';
import { recordNewsView } from '../services/analyticsService';
import { getArticleImages } from '../lib/imageUtils';

export default function ArticlePage() {
  const { slug } = useParams();
  const { getNewsBySlug, getNewsByCategory } = useNews();
  const article = getNewsBySlug(slug);
  const [copied, setCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const recordedArticleIdRef = useRef(null);

  const images = getArticleImages(article);

  useEffect(() => {
    setActiveImageIndex(0);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [slug]);

  // Autoplay da galeria de fotos na matéria (4.5s)
  useEffect(() => {
    if (!images || images.length <= 1 || isGalleryHovered) return;

    const timer = setInterval(() => {
      setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(timer);
  }, [images, isGalleryHovered]);

  useEffect(() => {
    if (article?.id && recordedArticleIdRef.current !== article.id) {
      recordedArticleIdRef.current = article.id;
      recordNewsView(article.id);
    }
  }, [article?.id]);

  const handleShare = async () => {
    if (!article) return;
    const url = window.location.href;
    const shareText = `📰 *${article.title}*\n\n${article.subtitle ? `${article.subtitle}\n\n` : ''}Confira a matéria completa no JC Panorama 365:`;

    // 1. Suporte nativo do celular (iOS / Android): abre Facebook, Instagram, WhatsApp, etc.
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: shareText,
          url: url,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('Erro ao compartilhar via Web Share API:', err);
      }
    }

    // 2. Fallback para navegadores Desktop ou sem suporte a Web Share: copia para a área de transferência
    const fullTextToCopy = `${shareText}\n${url}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(fullTextToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      } catch (err) {
        console.warn('Erro ao copiar via clipboard API, usando fallback:', err);
      }
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = fullTextToCopy;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      alert('Não foi possível copiar o link.');
    }
  };

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-navy-900 mb-4">Notícia não encontrada</h1>
        <p className="text-navy-500 mb-6">A notícia que você procura não existe ou foi removida.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-white rounded-lg font-semibold hover:bg-accent-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar ao início
        </Link>
      </div>
    );
  }

  const category = getCategoryById(article.category);
  const related = getNewsByCategory(article.category)
    .filter(n => n.id !== article.id)
    .slice(0, 3);

  const formatDateFull = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const date = d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const time = d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${date} às ${time}`;
  };

  const cleanArticleContent = (html) => {
    if (!html) return '';
    return html
      // Preserva parágrafos vazios ou que só continham espaços/spans como quebras de linha reais
      .replace(/<p([^>]*)>(\s|&nbsp;|<br\s*\/?>|<\/?span[^>]*>)*<\/p>/gi, '<p$1><br></p>')
      // Substitui &nbsp; e \u00A0 (espaços não-quebráveis) por espaços normais no texto
      .replace(/&nbsp;/gi, ' ')
      .replace(/\u00A0/g, ' ')
      // Remove soft hyphens e caracteres invisíveis de quebra
      .replace(/[\u00AD\u200B\u200C\u200D\uFEFF\u2060]/g, '')
      // Corrige palavras divididas com hífen no final de linha (ex: coladas de colunas de PDF)
      .replace(/([a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ])-(\s*<br\s*\/?>\s*|\s*<\/p>\s*<p[^>]*>\s*|\s*\n\s*)([a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ])/gi, '$1$3');
  };

  return (
    <article className="pt-2 sm:pt-3">
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        {/* Botão Voltar para Tela Inicial */}
        <div className="mb-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-navy-50 text-navy-700 hover:text-navy-950 text-xs sm:text-sm font-semibold border border-navy-200/80 shadow-xs transition-all duration-200 hover:shadow-sm active:scale-95 group cursor-pointer"
          >
            <ArrowLeft size={16} className="text-navy-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar para tela inicial</span>
          </Link>
        </div>

        {/* Article Header Card */}
        <div className="bg-white rounded-2xl shadow-card border border-navy-100/80 p-3.5 sm:p-4 md:p-5 mb-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Link
                to="/"
                className="text-navy-400 hover:text-navy-600 transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                Início
              </Link>
              <span className="text-navy-300">/</span>
              {category && (
                <Link
                  to={`/categoria/${category.slug}`}
                  className="font-semibold transition-colors"
                  style={{ color: category.color }}
                >
                  {category.name}
                </Link>
              )}
            </div>
            <CategoryBadge categoryId={article.category} size="sm" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-[2.15rem] lg:text-[2.35rem] font-bold text-navy-950 mt-0 mb-1.5 font-serif leading-[1.25] [text-wrap:pretty]">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-sm sm:text-base md:text-lg text-navy-600 mb-2.5 leading-relaxed [text-wrap:pretty]">
              {article.subtitle}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-navy-100">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              {article.columnist_name ? (
                <Link
                  to={`/colunista/${article.columnist_id || encodeURIComponent(article.columnist_name)}`}
                  className="group flex items-center gap-2.5 sm:gap-3 hover:opacity-90 transition-opacity min-w-0"
                >
                  {article.columnist_avatar ? (
                    <img
                      src={article.columnist_avatar}
                      alt={article.columnist_name}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-accent-500 shadow-xs ring-2 ring-accent-100 shrink-0 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center font-extrabold text-sm sm:text-base shrink-0 border-2 border-accent-300 shadow-xs group-hover:scale-105 transition-transform">
                      {article.columnist_name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-accent-600 block leading-none mb-0.5 truncate">
                      {article.columnist_role || 'Colunista'}
                    </span>
                    <h2 className="text-sm sm:text-base font-extrabold text-navy-950 leading-tight group-hover:text-accent-600 transition-colors truncate">
                      {article.columnist_name}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-navy-500 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                      <Clock size={11} className="text-navy-400 shrink-0" />
                      <span className="capitalize hidden sm:inline">{formatDateFull(article.published_at)}</span>
                      <span className="sm:hidden">{formatDateShort(article.published_at)}</span>
                    </p>
                  </div>
                </Link>
              ) : (
                <>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center font-bold text-sm shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-navy-400 block leading-none mb-0.5">
                      Autor
                    </span>
                    <p className="text-sm sm:text-base font-bold text-navy-950 leading-tight truncate">
                      {article.author || 'Redação'}
                    </p>
                    <p className="text-[11px] sm:text-xs text-navy-500 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                      <Clock size={11} className="text-navy-400 shrink-0" />
                      <span className="capitalize hidden sm:inline">{formatDateFull(article.published_at)}</span>
                      <span className="sm:hidden">{formatDateShort(article.published_at)}</span>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Botão Único de Compartilhar */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={handleShare}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shadow-xs active:scale-95 shrink-0 ${
                  copied
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 ring-2 ring-emerald-100'
                    : 'bg-navy-50 hover:bg-accent-50 text-navy-800 hover:text-accent-700 border border-navy-200/80 hover:border-accent-300'
                }`}
                title="Copiar link e resumo da notícia para a área de transferência"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} className="text-accent-600 shrink-0" />
                    <span>Compartilhar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Galeria de Imagens da Notícia (Exibida com suporte a carrossel se houver múltiplas fotos) */}
        {images.length > 0 && (
          <div className="mb-4 sm:mb-6 space-y-3">
            <figure
              className="relative rounded-2xl overflow-hidden shadow-card border border-navy-100/80 bg-slate-900 group"
              onMouseEnter={() => setIsGalleryHovered(true)}
              onMouseLeave={() => setIsGalleryHovered(false)}
            >
              {images.length > 1 ? (
                <div
                  className="flex w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
                  style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
                >
                  {images.map((imgSrc, idx) => (
                    <div key={idx} className="w-full shrink-0 flex items-center justify-center bg-slate-950/40">
                      <img
                        src={imgSrc}
                        alt={`${article.title} - Foto ${idx + 1}`}
                        className="w-full h-auto max-h-[620px] object-contain mx-auto block pointer-events-none"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <img
                  src={images[0]}
                  alt={article.title}
                  className="w-full h-auto max-h-[620px] object-contain mx-auto block"
                  loading="eager"
                />
              )}

              {images.length > 1 && (
                <>
                  {/* Seta Esquerda */}
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                    aria-label="Foto anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-lg select-none"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  {/* Seta Direita */}
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    aria-label="Próxima foto"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-lg select-none"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </figure>

            {/* Miniaturas navegáveis para múltiplas imagens */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-14 sm:w-20 sm:h-16 rounded-lg overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${
                      idx === activeImageIndex
                        ? 'border-accent-500 ring-2 ring-accent-200 opacity-100 scale-102'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Article Content */}
        <div className="bg-white rounded-2xl shadow-card border border-navy-100/80 p-6 md:p-10 mb-8">
          <div className="article-content ql-snow">
            <div
              className="ql-editor !p-0 !min-h-0 text-navy-800"
              dangerouslySetInnerHTML={{ __html: cleanArticleContent(article.content) }}
            />
          </div>
        </div>

        {/* Bloco de Autoria / Colunista abaixo do texto */}
        {article.columnist_name ? (
          <div
            className="rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-navy-700/50 relative overflow-hidden text-white"
            style={{
              backgroundColor: '#0F1A2E',
              background: 'linear-gradient(135deg, #0F1A2E 0%, #102a43 55%, #1a365d 100%)',
            }}
          >
            {/* Glow decorativo de fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 md:gap-6 relative z-10 text-center sm:text-left">
              {article.columnist_avatar ? (
                <Link
                  to={`/colunista/${article.columnist_id || encodeURIComponent(article.columnist_name)}`}
                  className="relative shrink-0 group"
                >
                  <img
                    src={article.columnist_avatar}
                    alt={article.columnist_name}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-3 border-accent-400 shadow-xl ring-4 ring-accent-500/20 group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0F1A2E] rounded-full" />
                </Link>
              ) : (
                <Link
                  to={`/colunista/${article.columnist_id || encodeURIComponent(article.columnist_name)}`}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-white/20 shadow-xl shrink-0 hover:scale-105 transition-transform"
                >
                  {article.columnist_name.charAt(0)}
                </Link>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-white bg-accent-500 px-3 py-1 rounded-full shadow-sm">
                    {article.columnist_role || 'Colunista'}
                  </span>
                  <span className="text-xs font-semibold text-accent-200 tracking-wide">
                    JC Panorama 365
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2 drop-shadow-sm">
                  <Link
                    to={`/colunista/${article.columnist_id || encodeURIComponent(article.columnist_name)}`}
                    className="hover:text-accent-300 transition-colors"
                  >
                    {article.columnist_name}
                  </Link>
                </h3>
                {article.columnist_bio ? (
                  <p className="text-sm md:text-base text-slate-100/90 leading-relaxed max-w-2xl font-normal mb-4">
                    {article.columnist_bio}
                  </p>
                ) : (
                  <p className="text-sm md:text-base text-slate-200/80 leading-relaxed font-normal mb-4">
                    Articulista e colunista exclusivo do JC Panorama 365.
                  </p>
                )}

                <Link
                  to={`/colunista/${article.columnist_id || encodeURIComponent(article.columnist_name)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <span>Ver todas as matérias de {article.columnist_name}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                {article.author ? article.author.charAt(0) : 'J'}
              </div>
              <div>
                <p className="font-bold text-navy-900">{article.author || 'Redação'}</p>
                <p className="text-sm text-navy-500">Jornalista — JC Panorama 365</p>
              </div>
            </div>
          </div>
        )}

        {/* Botão de retorno à tela inicial ao final da leitura */}
        <div className="flex justify-center my-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white hover:bg-navy-50 text-navy-800 hover:text-navy-950 font-bold text-sm border border-navy-200 shadow-card hover:shadow-card-hover transition-all duration-200 hover:scale-[1.02] active:scale-95 group cursor-pointer"
          >
            <ArrowLeft size={18} className="text-navy-500 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para tela inicial</span>
          </Link>
        </div>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-3">
            <span
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: category?.color || '#1E56A0' }}
            />
            Notícias relacionadas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map(item => (
              <NewsCard key={item.id} article={item} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
