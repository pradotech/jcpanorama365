import { X, Share, PlusSquare, Check } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export default function PwaInstallModal() {
  const { showIOSModal, setShowIOSModal, isIOS } = usePWA();

  if (!showIOSModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop escurecido */}
      <div
        className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setShowIOSModal(false)}
      />

      {/* Card do Modal */}
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-navy-100 z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header do Card */}
        <div className="bg-gradient-to-r from-navy-950 to-navy-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
              <img src="/favicon.png" alt="JC" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Adicionar à Tela Inicial</h3>
              <p className="text-[11px] text-navy-300">JC Panorama 365</p>
            </div>
          </div>
          <button
            onClick={() => setShowIOSModal(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo com os passos ilustrados */}
        <div className="p-5 space-y-4">
          <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
            Tenha acesso instantâneo ao portal direto da tela inicial do seu celular, como um aplicativo:
          </p>

          <div className="space-y-3">
            {/* Passo 1 */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-navy-50/70 border border-navy-100">
              <div className="w-7 h-7 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs font-black shrink-0">
                1
              </div>
              <div className="text-xs text-navy-800 leading-tight">
                {isIOS ? (
                  <>
                    No Safari do iPhone, toque no botão de <strong>Compartilhar</strong>{' '}
                    <span className="inline-flex items-center align-middle px-1.5 py-0.5 rounded bg-white border border-navy-200 font-bold text-accent-600">
                      <Share size={12} className="inline mr-1" /> Compartilhar
                    </span>{' '}
                    na barra inferior.
                  </>
                ) : (
                  <>
                    No menu do navegador (três pontinhos no canto superior).
                  </>
                )}
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-navy-50/70 border border-navy-100">
              <div className="w-7 h-7 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs font-black shrink-0">
                2
              </div>
              <div className="text-xs text-navy-800 leading-tight">
                Role as opções e toque em{' '}
                <span className="inline-flex items-center align-middle px-1.5 py-0.5 rounded bg-white border border-navy-200 font-bold text-navy-900">
                  <PlusSquare size={12} className="inline mr-1 text-accent-600" /> Adicionar à Tela de Início
                </span>.
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-navy-50/70 border border-navy-100">
              <div className="w-7 h-7 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs font-black shrink-0">
                3
              </div>
              <div className="text-xs text-navy-800 leading-tight">
                Toque em <strong>"Adicionar"</strong> no canto superior direito para confirmar. Pronto!
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowIOSModal(false)}
            className="w-full py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Check size={16} />
            <span>Entendi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
