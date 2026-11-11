import { Download, X } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export default function PwaFloatingBanner() {
  const { canInstall, isBannerDismissed, installApp, dismissBanner } = usePWA();

  if (!canInstall || isBannerDismissed) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:hidden z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-navy-950/95 text-white p-3 rounded-2xl shadow-2xl border border-white/15 backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
            <img src="/favicon.png" alt="JC" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate leading-tight">
              JC Panorama 365
            </p>
            <p className="text-[11px] text-navy-300 truncate">
              Adicione o atalho na tela inicial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={installApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Download size={13} />
            <span>Instalar</span>
          </button>
          <button
            type="button"
            onClick={dismissBanner}
            className="p-1 rounded-full text-navy-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Dispensar"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

