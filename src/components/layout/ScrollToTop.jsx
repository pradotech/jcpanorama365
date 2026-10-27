import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Rola a janela para o topo sempre que a rota (pathname) mudar.
 * Corrige o comportamento padrão de SPAs onde o scroll é mantido ao navegar.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
}
