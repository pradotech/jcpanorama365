import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente de Carrossel de Imagens para Cards e Páginas.
 * - Passa as imagens automaticamente (autoplay) com intervalo otimizado.
 * - Pausa automaticamente ao passar o mouse ou interagir.
 * - Suporta navegação por setas, dots indicadores e touch swipe no celular.
 */
export default function ImageCarousel({
  images = [],
  alt = 'Imagem da notícia',
  aspectRatio = 'aspect-[16/10]',
  className = '',
  imageClassName = '',
  showBadge = false,
  showDots = true,
  showArrows = true,
  autoPlay = true,
  autoPlayInterval = 3800,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const validImages = Array.isArray(images)
    ? images.filter(img => typeof img === 'string' && img.trim().length > 0)
    : [];

  const hasMultiple = validImages.length > 1;

  const goToPrev = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex(prev => (prev === 0 ? validImages.length - 1 : prev - 1));
  }, [validImages.length]);

  const goToNext = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex(prev => (prev === validImages.length - 1 ? 0 : prev + 1));
  }, [validImages.length]);

  const goToIndex = (e, index) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex(index);
  };

  // Autoplay: avança automaticamente a cada intervalo configurado, pausando no hover
  useEffect(() => {
    if (!autoPlay || !hasMultiple || isHovered) return;

    const timer = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, hasMultiple, isHovered, goToNext]);

  // Suporte a gestos touch (swipe no mobile)
  const handleTouchStart = (e) => {
    setIsHovered(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    setIsHovered(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;

    if (diff > minSwipeDistance) {
      goToNext(e);
    } else if (diff < -minSwipeDistance) {
      goToPrev(e);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (validImages.length === 0) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden group/carousel select-none ${aspectRatio} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={hasMultiple ? handleTouchStart : undefined}
      onTouchMove={hasMultiple ? handleTouchMove : undefined}
      onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
    >
      {/* Slider Track com transição ultra-suave */}
      {hasMultiple ? (
        <div
          className="flex w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {validImages.map((imgSrc, idx) => (
            <div key={idx} className="w-full h-full shrink-0 relative overflow-hidden">
              <img
                src={imgSrc}
                alt={`${alt} (${idx + 1} de ${validImages.length})`}
                className={`w-full h-full object-cover pointer-events-none ${imageClassName}`}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      ) : (
        <img
          src={validImages[0]}
          alt={alt}
          className={`w-full h-full object-cover ${imageClassName}`}
          loading="lazy"
        />
      )}

      {/* Controles para múltiplas imagens */}
      {hasMultiple && (
        <>
          {/* Botão Anterior */}
          {showArrows && (
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Imagem anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/55 hover:bg-black/85 text-white flex items-center justify-center transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover/carousel:opacity-100 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Botão Próximo */}
          {showArrows && (
            <button
              type="button"
              onClick={goToNext}
              aria-label="Próxima imagem"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/55 hover:bg-black/85 text-white flex items-center justify-center transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover/carousel:opacity-100 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Indicadores de bolinhas (Dots) */}
          {showDots && validImages.length <= 8 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-xs">
              {validImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => goToIndex(e, idx)}
                  aria-label={`Ir para imagem ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    idx === currentIndex
                      ? 'w-4 h-1.5 bg-white'
                      : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
