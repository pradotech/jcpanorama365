import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PWAContext = createContext(null);
const DISMISS_KEY = 'jc_pwa_dismissed_until';

export function PWAProvider({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(true);

  // Detecta se é dispositivo iOS (iPhone, iPad, iPod)
  const isIOS = typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !window.MSStream;

  // Verifica se o app já está rodando instalado em modo standalone (PWA)
  useEffect(() => {
    const checkInstalled = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');

      setIsInstalled(isStandaloneMode);
    };

    checkInstalled();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e) => setIsInstalled(e.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    // Verifica se o banner inferior foi dispensado recentemente (por 7 dias)
    try {
      const dismissedUntil = localStorage.getItem(DISMISS_KEY);
      if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
        setIsBannerDismissed(false);
      } else {
        setIsBannerDismissed(true);
      }
    } catch {
      setIsBannerDismissed(false);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Captura o evento nativo de instalação do PWA (Android / Chrome / Edge)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Previne a abertura automática do mini-infobar do navegador para controlar via botão
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowIOSModal(false);
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now() + 365 * 24 * 60 * 60 * 1000));
      } catch {}
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Dispara a instalação
  const installApp = useCallback(async () => {
    // 1. Caso Android / Chrome com suporte ao prompt nativo
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setInstallPrompt(null);
        return;
      } catch (err) {
        console.warn('Erro ao disparar prompt de instalação:', err);
      }
    }

    // 2. Caso iOS ou navegador sem evento nativo: abre instruções visuais
    setShowIOSModal(true);
  }, [installPrompt]);

  // Dispensar banner por 7 dias
  const dismissBanner = useCallback(() => {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch {}
  }, []);

  const canInstall = !isInstalled;

  const value = {
    canInstall,
    isInstalled,
    isIOS,
    installPrompt: Boolean(installPrompt),
    showIOSModal,
    setShowIOSModal,
    isBannerDismissed,
    installApp,
    dismissBanner,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA deve ser utilizado dentro de um PWAProvider');
  }
  return context;
}

