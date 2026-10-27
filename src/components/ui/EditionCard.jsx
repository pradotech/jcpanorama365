import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Newspaper, Download, ChevronLeft, ChevronRight, X, Loader2, Calendar, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';

// Configurar worker do PDF.js (build legacy para compatibilidade com Win7)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function EditionCard() {
  const [edition, setEdition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Buscar a última edição
  useEffect(() => {
    const fetchLatestEdition = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('editions')
        .select('*')
        .order('edition_date', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setEdition(data);
      }
      setLoading(false);
    };
    fetchLatestEdition();
  }, []);

  // Gerar thumbnail da primeira página
  useEffect(() => {
    if (!edition?.pdf_url) return;

    const generateThumbnail = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ url: edition.pdf_url });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        
        setThumbnailUrl(canvas.toDataURL('image/jpeg', 0.85));
      } catch (err) {
        console.error('Erro ao gerar thumbnail do PDF:', err);
      }
    };

    generateThumbnail();
  }, [edition]);

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-red-700 to-red-500">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Newspaper size={18} />
            Edição do Dia
          </h3>
        </div>
        <div className="p-8 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-navy-300" />
        </div>
      </div>
    );
  }

  if (!edition) return null;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden group">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-700 to-red-500">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Newspaper size={18} />
            Edição do Dia
          </h3>
        </div>

        {/* Preview da primeira página */}
        <div
          className="relative cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          {thumbnailUrl ? (
            <div className="relative overflow-hidden">
              <img
                src={thumbnailUrl}
                alt={`Preview - ${edition.title}`}
                className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
              />
              {/* Overlay ao hover */}
              <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/40 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-75">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-2.5 shadow-lg">
                    <Eye size={18} className="text-accent-600" />
                    <span className="text-sm font-semibold text-navy-900">Ler edição</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-[3/4] bg-navy-50 flex items-center justify-center">
              <div className="text-center">
                <Newspaper size={40} className="mx-auto text-navy-200 mb-2" />
                <p className="text-xs text-navy-400">Carregando preview...</p>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-5 py-4">
          <p className="text-sm font-bold text-navy-800 mb-1">{edition.title}</p>
          <p className="text-xs text-navy-400 flex items-center gap-1.5">
            <Calendar size={12} />
            {formatDate(edition.edition_date)}
          </p>

          <button
            onClick={() => setModalOpen(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
          >
            <Eye size={15} />
            Ler Agora
          </button>
        </div>
      </div>

      {/* Modal para leitura do PDF */}
      {modalOpen && (
        <PdfReaderModal
          edition={edition}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}


function PdfReaderModal({ edition, onClose }) {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderingRef = useRef(false);
  const pendingPageRef = useRef(null);

  // Bloquear scroll do body
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Carregar o PDF
  useEffect(() => {
    if (!edition?.pdf_url) return;

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ url: edition.pdf_url });
        const pdfDoc = await loadingTask.promise;
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar PDF:', err);
        setLoading(false);
      }
    };
    loadPdf();
  }, [edition]);

  // Renderizar página atual — usa ref para evitar loop de re-render
  const renderPage = useCallback(async (pageNum) => {
    if (!pdf) return;

    // Se já está renderizando, guarda a página pendente
    if (renderingRef.current) {
      pendingPageRef.current = pageNum;
      return;
    }

    renderingRef.current = true;

    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const container = containerRef.current;
      const containerWidth = container ? container.clientWidth - 48 : 900;
      
      // Usar devicePixelRatio para renderizar em resolução nativa do dispositivo
      const dpr = window.devicePixelRatio || 1;
      
      // Escala base para preencher a largura do container
      const originalViewport = page.getViewport({ scale: 1 });
      const baseScale = (containerWidth / originalViewport.width) * 1.2;
      
      // Escala final = base × devicePixelRatio (mais pixels internos = mais nitidez)
      const renderScale = baseScale * dpr;
      
      const viewport = page.getViewport({ scale: renderScale });
      const context = canvas.getContext('2d');
      
      // Canvas interno com resolução alta (pixels reais do dispositivo)
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Tamanho visual via CSS (pixels CSS, independente da densidade)
      const cssViewport = page.getViewport({ scale: baseScale });
      canvas.style.width = `${cssViewport.width}px`;
      canvas.style.height = `${cssViewport.height}px`;
      
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
    } catch (err) {
      console.error('Erro ao renderizar página:', err);
    } finally {
      renderingRef.current = false;

      // Se há uma página pendente, renderizar
      if (pendingPageRef.current !== null) {
        const nextPage = pendingPageRef.current;
        pendingPageRef.current = null;
        renderPage(nextPage);
      }
    }
  }, [pdf]);

  useEffect(() => {
    if (pdf) {
      renderPage(currentPage);
    }
  }, [pdf, currentPage, renderPage]);

  const goToPrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const goToNext = () => {
    if (currentPage < numPages) setCurrentPage(prev => prev + 1);
  };

  // Navegação por teclado
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentPage, numPages]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = edition.pdf_url;
    link.download = `${edition.title}.pdf`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col" style={{ backgroundColor: 'rgba(15, 26, 46, 0.97)' }}>
      {/* Header do Modal */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-navy-950 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Newspaper size={20} className="text-red-400 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-white font-bold text-sm md:text-base truncate">{edition.title}</h2>
            <p className="text-navy-400 text-xs hidden sm:block">
              {new Date(edition.edition_date + 'T12:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Download button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs md:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Baixar PDF</span>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-navy-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Conteúdo do PDF */}
      <div ref={containerRef} className="flex-1 overflow-auto p-4 md:p-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <Loader2 size={36} className="animate-spin text-red-400 mx-auto mb-3" />
              <p className="text-white/70 text-sm">Carregando edição...</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-lg shadow-2xl"
              style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>

      {/* Navegação de páginas */}
      {!loading && numPages > 0 && (
        <div className="flex items-center justify-center gap-4 px-4 py-3 bg-navy-950 border-t border-white/10 shrink-0">
          <button
            onClick={goToPrev}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10">
            <span className="text-white text-sm font-medium">
              {currentPage}
            </span>
            <span className="text-white/40 text-sm">/</span>
            <span className="text-white/60 text-sm">
              {numPages}
            </span>
          </div>

          <button
            onClick={goToNext}
            disabled={currentPage >= numPages}
            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
