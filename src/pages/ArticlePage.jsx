import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, ArrowLeft, ArrowRight, Share2, Check, ChevronLeft, ChevronRight, Loader2, FileText, ChevronDown, Link2 } from 'lucide-react';
import { useNews } from '../hooks/useNews';
import { supabase } from '../lib/supabase';
import { getCategoryById } from '../data/categories';
import CategoryBadge from '../components/ui/CategoryBadge';
import NewsCard from '../components/news/NewsCard';
import { recordNewsView } from '../services/analyticsService';
import { getArticleImages } from '../lib/imageUtils';
import { cleanPlainText } from '../lib/stringUtils';

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.449-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function InstagramDropdownMenu({
  isOpen,
  onClose,
  onSelectStories,
  onSelectFeed,
  onCopyCaption,
  sharingInsta,
  copiedType,
  align = 'right',
  direction = 'down',
}) {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute ${align === 'right' ? 'right-0' : 'left-0 sm:left-auto sm:right-0'} ${
        direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
      } w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-navy-100 p-2 z-50 text-left`}
      style={{ filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.12))' }}
    >
      <div className="px-3 py-2 border-b border-navy-50 flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-navy-400">
          Instagram
        </span>
        <span className="text-[10px] text-navy-400 font-medium">Escolha uma opção</span>
      </div>

      <div className="py-1 space-y-1">
        {/* Opção 1: Stories */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onSelectStories();
          }}
          disabled={!!sharingInsta}
          className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50/80 active:bg-purple-100 transition-colors flex items-start gap-3 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <Link2 size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-navy-950 group-hover:text-purple-700 leading-tight">
                Stories (com Link 🔗)
              </span>
              {copiedType === 'stories' && (
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-md shrink-0">
                  Copiado!
                </span>
              )}
            </div>
            <p className="text-[11px] text-navy-500 leading-snug mt-0.5">
              Envia a foto e copia o link da matéria para colar na figurinha de Link dos Stories.
            </p>
          </div>
        </button>

        {/* Opção 2: Feed / Post */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onSelectFeed();
          }}
          disabled={!!sharingInsta}
          className="w-full text-left p-2.5 rounded-xl hover:bg-pink-50/80 active:bg-pink-100 transition-colors flex items-start gap-3 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-[#E1306C] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <InstagramIcon className="w-4 h-4 fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-navy-950 group-hover:text-pink-700 leading-tight">
                Post no Feed (com Legenda)
              </span>
              {copiedType === 'insta' && (
                <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-1.5 py-0.5 rounded-md shrink-0">
                  Copiado!
                </span>
              )}
            </div>
            <p className="text-[11px] text-navy-500 leading-snug mt-0.5">
              Envia a foto e copia a notícia completa com chamada para o link da bio.
            </p>
          </div>
        </button>

        {/* Opção 3: Apenas Copiar Legenda */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onCopyCaption();
          }}
          className="w-full text-left p-2.5 rounded-xl hover:bg-navy-50 active:bg-navy-100 transition-colors flex items-start gap-3 group cursor-pointer border-t border-navy-50"
        >
          <div className="w-8 h-8 rounded-xl bg-navy-100 text-navy-700 flex items-center justify-center shrink-0 mt-0.5">
            {copiedType === 'caption' ? <Check size={16} className="text-emerald-600" /> : <FileText size={16} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-navy-950 group-hover:text-accent-600 leading-tight">
                Apenas Copiar Legenda
              </span>
              {copiedType === 'caption' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md shrink-0">
                  Copiada!
                </span>
              )}
            </div>
            <p className="text-[11px] text-navy-500 leading-snug mt-0.5">
              Copia a notícia completa para a área de transferência sem abrir o app.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function ArticlePage() {
  const { slug } = useParams();
  const { getNewsBySlug, getNewsByCategory, loading: newsLoading } = useNews();
  const contextArticle = getNewsBySlug(slug);

  const [directArticle, setDirectArticle] = useState(null);
  const [isDirectLoading, setIsDirectLoading] = useState(() => !contextArticle);

  const article = contextArticle || directArticle;
  const [copiedType, setCopiedType] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [sharingInsta, setSharingInsta] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [activeInstaDropdown, setActiveInstaDropdown] = useState(null); // 'top' | 'bottom' | null
  const topInstaMenuRef = useRef(null);
  const bottomInstaMenuRef = useRef(null);
  const recordedArticleIdRef = useRef(null);

  // Fecha o dropdown do Instagram ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        topInstaMenuRef.current &&
        !topInstaMenuRef.current.contains(event.target) &&
        bottomInstaMenuRef.current &&
        !bottomInstaMenuRef.current.contains(event.target)
      ) {
        setActiveInstaDropdown(null);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  // Busca a notícia diretamente pelo slug caso o usuário abra direto pelo WhatsApp/link
  useEffect(() => {
    if (contextArticle) {
      setIsDirectLoading(false);
      return;
    }

    let isMounted = true;
    setIsDirectLoading(true);

    const fetchDirectArticle = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (isMounted) {
          if (!error && data) {
            const images = Array.isArray(data.images) && data.images.length > 0
              ? data.images
              : (data.image_url ? [data.image_url] : []);
            setDirectArticle({ ...data, images });
          }
          setIsDirectLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setIsDirectLoading(false);
        }
      }
    };

    fetchDirectArticle();

    return () => {
      isMounted = false;
    };
  }, [slug, contextArticle]);

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

  // SEO & Metadados Dinâmicos (Title, Open Graph, Schema.org NewsArticle)
  useEffect(() => {
    if (!article) return;

    const previousTitle = document.title;
    document.title = `${article.title} | JC Panorama 365`;

    const setMeta = (attribute, name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const description = article.subtitle || (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : 'Notícias de Jundiaí e Região.');
    const mainImage = images && images.length > 0 ? images[0] : 'https://jcpanorama365.com.br/logo.png';
    const pageUrl = window.location.href;

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', article.title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', mainImage);
    setMeta('property', 'og:url', pageUrl);
    setMeta('property', 'og:type', 'article');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', article.title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', mainImage);

    // Schema.org NewsArticle JSON-LD (Google News & Discover)
    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      'headline': article.title,
      'description': description,
      'image': [mainImage],
      'datePublished': article.published_at || article.created_at,
      'dateModified': article.updated_at || article.published_at || article.created_at,
      'author': {
        '@type': 'Person',
        'name': article.columnist_name || article.author || 'Redação JC Panorama 365',
      },
      'publisher': {
        '@type': 'NewsMediaOrganization',
        'name': 'JC Panorama 365',
        'url': 'https://jcpanorama365.com.br',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://jcpanorama365.com.br/logo.png',
        },
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
    };

    let scriptTag = document.getElementById('news-article-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'news-article-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLdData);

    return () => {
      document.title = previousTitle;
      const el = document.getElementById('news-article-schema');
      if (el) el.remove();
    };
  }, [article, images]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Clipboard API falhou, tentando fallback', err);
      }
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      textarea.style.opacity = '0.01';
      textarea.style.fontSize = '16px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (e) {
      return false;
    }
  };

  // WhatsApp: mantém formato rico atual (URL no início, título em negrito, subtítulo e chamada)
  const handleShareWhatsApp = () => {
    if (!article) return;
    const url = window.location.href;
    const shareText = `${url} 📰 *${article.title}*${article.subtitle ? `\n\n${article.subtitle}` : ''}\n\nLeia a matéria completa:`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Facebook: Compartilhamento padrão da matéria (título grande nativo e imagem oficial via Open Graph)
  const handleShareFacebook = () => {
    if (!article) return;
    const url = window.location.href;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  // Converte HTML da notícia em texto limpo preservando quebras de parágrafos
  const formatContentForCaption = (html) => {
    if (!html) return '';
    return html
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n$1\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\u00A0/g, ' ')
      .replace(/[\u00AD\u200B-\u200D\uFEFF\u2060]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Monta a legenda oficial completa para o Instagram (Título + Notícia toda + Link da Bio)
  const getArticleInstagramCaption = () => {
    if (!article) return '';
    const cleanTitle = cleanPlainText(article.title);
    const cleanSubtitle = cleanPlainText(article.subtitle || '');
    const cleanContent = formatContentForCaption(article.content);
    const bioCallout = 'Veja mais notícias clicando no link da bio.';

    const parts = [cleanTitle];
    if (cleanSubtitle) {
      parts.push(cleanSubtitle);
    }
    if (cleanContent) {
      parts.push(cleanContent);
    }
    parts.push(bioCallout);

    let caption = parts.join('\n\n');

    // Instagram possui limite de 2.200 caracteres para legenda de Feed.
    // Se exceder, corta com segurança no último ponto final e preserva a chamada da bio.
    const MAX_INSTA_CHARS = 2180;
    if (caption.length > MAX_INSTA_CHARS) {
      const headerLen = cleanTitle.length + (cleanSubtitle ? cleanSubtitle.length + 2 : 0);
      const footerLen = bioCallout.length + 4;
      const availableForContent = MAX_INSTA_CHARS - headerLen - footerLen;

      if (availableForContent > 80 && cleanContent) {
        let trimmed = cleanContent.slice(0, availableForContent);
        const lastSentenceEnd = Math.max(trimmed.lastIndexOf('.'), trimmed.lastIndexOf('!'), trimmed.lastIndexOf('?'));
        if (lastSentenceEnd > availableForContent * 0.6) {
          trimmed = trimmed.slice(0, lastSentenceEnd + 1);
        } else {
          trimmed = trimmed.trim() + '...';
        }

        const safeParts = [cleanTitle];
        if (cleanSubtitle) safeParts.push(cleanSubtitle);
        safeParts.push(trimmed);
        safeParts.push(bioCallout);
        caption = safeParts.join('\n\n');
      }
    }

    return caption;
  };

  // Copiar legenda completa para colar no Instagram
  const handleCopyCaption = async () => {
    if (!article) return;
    const captionText = getArticleInstagramCaption();
    const success = await copyToClipboard(captionText);
    if (success) {
      setCopiedType('caption');
      showToast('Notícia e legenda copiadas! Pronto para colar no Instagram.');
      setTimeout(() => setCopiedType(''), 3000);
    } else {
      alert('Não foi possível copiar a legenda.');
    }
  };

  // Instagram: Abre a tela nativa de compartilhamento
  // mode = 'stories' -> copia o LINK direto para colar na figurinha de Link (🔗) dos Stories
  // mode = 'feed'    -> copia a LEGENDA completa com texto da notícia toda + link da bio para o Feed/Post
  const handleShareInstagram = async (mode = 'stories') => {
    if (!article) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const cleanTitle = cleanPlainText(article.title);
    const imageUrl = (images && images.length > 0 ? images[0] : null) || article.image_url;

    // Se for stories, copia o link limpo para a figurinha 🔗. Se for feed, copia a notícia toda + bio.
    const textToCopy = mode === 'stories' ? url : getArticleInstagramCaption();
    const successToast =
      mode === 'stories'
        ? 'Foto enviada e link copiado! Cole na figurinha de Link (🔗) dos Stories.'
        : 'Foto enviada e texto da notícia copiado! Cole na legenda do Feed.';

    await copyToClipboard(textToCopy);

    // Se houver imagem e suporte nativo ao envio de arquivos via Web Share API (celular)
    if (imageUrl && typeof navigator !== 'undefined' && navigator.share) {
      try {
        setSharingInsta(mode);
        const response = await fetch(imageUrl, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          const mimeType = blob.type || 'image/jpeg';
          const extension = mimeType.includes('png') ? 'png' : 'jpg';
          const file = new File([blob], `noticia-jc.${extension}`, { type: mimeType });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: cleanTitle,
              text: textToCopy,
            });
            setCopiedType(mode === 'stories' ? 'stories' : 'insta');
            showToast(successToast);
            setTimeout(() => setCopiedType(''), 3000);
            return;
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return; // Usuário cancelou a tela de compartilhamento
        console.warn('Falha no envio de arquivo direto para Instagram, usando fallback:', err);
      } finally {
        setSharingInsta(false);
      }
    }

    // Fallback caso não suporte compartilhamento direto de arquivo
    setCopiedType(mode === 'stories' ? 'stories' : 'insta');
    showToast(successToast);
    setTimeout(() => setCopiedType(''), 3000);

    if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      setTimeout(() => {
        window.location.href = 'instagram://app';
      }, 500);
    }
  };


  if (!article) {
    if (isDirectLoading || newsLoading) {
      return (
        <div className="min-h-[65vh] flex flex-col items-center justify-center px-4 py-24">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-accent-600 rounded-full animate-spin mb-4" />
          <p className="text-navy-700 font-semibold text-sm animate-pulse">
            Carregando notícia...
          </p>
        </div>
      );
    }

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

            {/* Botões de Compartilhar */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                title="Compartilhar no WhatsApp"
                className="w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={handleShareFacebook}
                title="Compartilhar no Facebook"
                className="w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <FacebookIcon className="w-4 h-4 text-[#1877F2] shrink-0" />
                <span className="hidden sm:inline">Facebook</span>
              </button>

              {/* Instagram Dropdown */}
              <div className="relative inline-flex items-center justify-center shrink-0" ref={topInstaMenuRef}>
                <button
                  type="button"
                  onClick={() => setActiveInstaDropdown(prev => prev === 'top' ? null : 'top')}
                  title="Opções de compartilhamento no Instagram"
                  className={`w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs leading-none ${
                    activeInstaDropdown === 'top'
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border-purple-300 ring-2 ring-purple-100'
                      : copiedType === 'stories' || copiedType === 'insta' || copiedType === 'caption'
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 border-purple-200/80'
                  } ${sharingInsta ? 'opacity-70 pointer-events-none' : ''}`}
                >
                  {sharingInsta ? (
                    <Loader2 size={14} className="animate-spin text-purple-600 shrink-0" />
                  ) : (
                    <InstagramIcon className="w-4 h-4 text-[#E4405F] shrink-0" />
                  )}
                  <span className="hidden sm:inline">
                    {sharingInsta ? 'Enviando...' : 'Instagram'}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`hidden sm:inline text-purple-600 transition-transform duration-200 ${
                      activeInstaDropdown === 'top' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <InstagramDropdownMenu
                  isOpen={activeInstaDropdown === 'top'}
                  onClose={() => setActiveInstaDropdown(null)}
                  onSelectStories={() => handleShareInstagram('stories')}
                  onSelectFeed={() => handleShareInstagram('feed')}
                  onCopyCaption={handleCopyCaption}
                  sharingInsta={sharingInsta}
                  copiedType={copiedType}
                  align="right"
                  direction="down"
                />
              </div>
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

        {/* Bloco de Compartilhamento ao final da matéria */}
        <div className="bg-white rounded-2xl shadow-card border border-navy-100/80 p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-bold text-navy-900 flex items-center justify-center sm:justify-start gap-2">
              <Share2 size={16} className="text-accent-500" />
              Gostou da notícia? Compartilhe:
            </h4>
            <p className="text-xs text-navy-500 mt-0.5">
              Envie para seus amigos ou redes sociais
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
              title="Compartilhar matéria completa no WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
              <span>WhatsApp</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={handleShareFacebook}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
              title="Compartilhar no Facebook (Leia aqui)"
            >
              <FacebookIcon className="w-4 h-4 fill-white shrink-0" />
              <span>Facebook</span>
            </button>

            {/* Instagram Dropdown */}
            <div className="relative inline-flex items-center justify-center shrink-0" ref={bottomInstaMenuRef}>
              <button
                type="button"
                onClick={() => setActiveInstaDropdown(prev => prev === 'bottom' ? null : 'bottom')}
                className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95 leading-none"
                title="Opções de compartilhamento no Instagram"
              >
                {sharingInsta ? (
                  <Loader2 size={16} className="animate-spin text-white shrink-0" />
                ) : (
                  <InstagramIcon className="w-4 h-4 fill-white shrink-0" />
                )}
                <span>{sharingInsta ? 'Enviando...' : 'Instagram'}</span>
                <ChevronDown
                  size={14}
                  className={`text-white transition-transform duration-200 ${
                    activeInstaDropdown === 'bottom' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <InstagramDropdownMenu
                isOpen={activeInstaDropdown === 'bottom'}
                onClose={() => setActiveInstaDropdown(null)}
                onSelectStories={() => handleShareInstagram('stories')}
                onSelectFeed={() => handleShareInstagram('feed')}
                onCopyCaption={handleCopyCaption}
                sharingInsta={sharingInsta}
                copiedType={copiedType}
                align="right"
                direction="down"
              />
            </div>
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

      {/* Toast de Feedback de Compartilhamento */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-navy-950/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2.5 text-xs sm:text-sm font-medium backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-[90vw]">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </article>
  );
}
