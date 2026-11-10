import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Feather, ArrowRight, Newspaper } from 'lucide-react';
import { useNews } from '../../hooks/useNews';
import CategoryBadge from '../ui/CategoryBadge';
import { formatTimeAgo } from '../../lib/dateUtils';
import categories from '../../data/categories';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const { searchNews } = useNews();
  const navigate = useNavigate();
  const location = useLocation();

  const trimmedQuery = searchQuery.trim();
  const searchResults = useMemo(() => {
    if (!trimmedQuery || trimmedQuery.length < 2) return [];
    return searchNews(trimmedQuery);
  }, [trimmedQuery, searchNews]);

  // Fechar dropdown e buscas ao mudar de página
  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery('');
    setIsSearchFocused(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Fechar dropdown ao clicar fora (desktop)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (trimmedQuery) {
      navigate(`/busca?q=${encodeURIComponent(trimmedQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
      setIsSearchFocused(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  const renderDropdownContent = () => {
    if (searchResults.length === 0) {
      return (
        <div className="p-6 text-center text-xs text-navy-500">
          <Search size={22} className="mx-auto text-navy-300 mb-1.5" />
          <p className="font-semibold text-navy-700">Nenhuma notícia encontrada</p>
          <p className="text-navy-400 mt-0.5">Tente buscar por outras palavras-chave.</p>
        </div>
      );
    }

    return (
      <>
        <div className="px-4 py-2 bg-navy-50/80 border-b border-navy-100 flex items-center justify-between text-[11px] font-bold text-navy-500 uppercase tracking-wider">
          <span>Resultados</span>
          <span>{searchResults.length} {searchResults.length === 1 ? 'notícia' : 'notícias'}</span>
        </div>
        <div className="divide-y divide-navy-50 max-h-[340px] overflow-y-auto">
          {searchResults.slice(0, 5).map(item => (
            <Link
              key={item.id}
              to={`/noticia/${item.slug}`}
              onClick={() => {
                setSearchQuery('');
                setSearchOpen(false);
                setIsSearchFocused(false);
              }}
              className="flex items-center gap-3 p-3 hover:bg-accent-50/60 transition-colors group cursor-pointer"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-navy-100 group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-navy-100 flex items-center justify-center text-navy-400 shrink-0">
                  <Newspaper size={18} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-navy-900 group-hover:text-accent-600 transition-colors line-clamp-2 leading-tight mb-1">
                  {item.title}
                </p>
                <div className="flex items-center gap-2">
                  <CategoryBadge categoryId={item.category} size="sm" />
                  <span className="text-[11px] text-navy-400">
                    {formatTimeAgo(item.published_at, { withSuffix: true })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            navigate(`/busca?q=${encodeURIComponent(trimmedQuery)}`);
            setSearchQuery('');
            setSearchOpen(false);
            setIsSearchFocused(false);
          }}
          className="w-full py-2.5 px-4 bg-navy-50 hover:bg-accent-50 text-center text-xs font-bold text-accent-700 border-t border-navy-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Ver todos os {searchResults.length} resultados para "{trimmedQuery}"</span>
          <ArrowRight size={13} />
        </button>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-header">
      {/* Top bar */}
      <div className="bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs">
          <span className="text-navy-300 capitalize">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Logo bar */}
      <div className="border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="group">
            <img
              src="/logo-full.jpg"
              alt="JC Panorama 365"
              className="h-24 sm:h-35 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          <div className="flex items-center gap-3">
            {/* Desktop search */}
            <div ref={desktopSearchRef} className="relative hidden md:block">
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar notícias..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchFocused(true);
                    }}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-64 pl-10 pr-8 py-2 rounded-full border border-navy-200 bg-navy-50 text-sm text-navy-700 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent focus:bg-white transition-all"
                  />
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 p-0.5 cursor-pointer"
                      title="Limpar busca"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </form>

              {/* Desktop Instant Dropdown */}
              {isSearchFocused && trimmedQuery.length >= 2 && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-navy-100 overflow-hidden z-50">
                  {renderDropdownContent()}
                </div>
              )}
            </div>

            {/* Mobile search toggle */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (!searchOpen) {
                  setIsSearchFocused(true);
                }
              }}
              className="md:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50 transition-colors cursor-pointer"
              title="Buscar notícias"
            >
              <Search size={20} />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar com resultados em tempo real */}
        {searchOpen && (
          <div ref={mobileSearchRef} className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar notícias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-9 py-2.5 rounded-full border border-navy-200 bg-navy-50 text-sm text-navy-700 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent focus:bg-white"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 p-1 cursor-pointer"
                  title="Limpar busca"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            {/* Mobile Instant Results Dropdown */}
            {trimmedQuery.length >= 2 && (
              <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-navy-100 overflow-hidden">
                {renderDropdownContent()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="hidden lg:block border-b border-navy-100 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <ul className="flex items-center gap-1">
              <li>
                <Link
                  to="/"
                  className={`block px-4 py-3 text-sm font-semibold transition-colors relative ${isActive('/') ? 'text-accent-500' : 'text-navy-700 hover:text-accent-500'
                    }`}
                >
                  Início
                  {isActive('/') && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-accent-500 rounded-full" />
                  )}
                </Link>
              </li>
              {categories.filter(cat => cat.id !== 'colunistas').map(cat => {
                const Icon = cat.icon;
                const active = isActive(`/categoria/${cat.slug}`);
                return (
                  <li key={cat.id}>
                    <Link
                      to={`/categoria/${cat.slug}`}
                      className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-all relative ${active ? 'font-semibold' : 'hover:text-opacity-100'
                        }`}
                      style={{ color: active ? cat.color : undefined }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = cat.color; }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = ''; }}
                    >
                      <Icon size={15} />
                      {cat.name}
                      {active && (
                        <span
                          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}

              {/* Botão Nossos Colunistas */}
              <li>
                <Link
                  to="/colunistas"
                  className={`flex items-center gap-1.5 px-3.5 py-3 text-sm font-semibold transition-all relative ${isActive('/colunistas') || location.pathname.startsWith('/colunista')
                      ? 'text-accent-600 font-bold'
                      : 'text-navy-800 hover:text-accent-600'
                    }`}
                >
                  <Feather size={15} className="text-accent-500" />
                  <span>Nossos Colunistas</span>
                  {(isActive('/colunistas') || location.pathname.startsWith('/colunista')) && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-accent-600 rounded-full" />
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Category Horizontal Scroll (Exibido no celular acima da linha vermelha) */}
      <nav
        aria-label="Categorias em dispositivos móveis"
        className="lg:hidden border-b border-navy-100 bg-white"
      >
        <div
          className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <Link
            to="/"
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${isActive('/')
                ? 'bg-accent-600 text-white shadow-xs'
                : 'text-navy-700 bg-navy-50 hover:bg-navy-100'
              }`}
          >
            Início
          </Link>

          {categories.filter(cat => cat.id !== 'colunistas').map(cat => {
            const Icon = cat.icon;
            const active = isActive(`/categoria/${cat.slug}`);
            return (
              <Link
                key={cat.id}
                to={`/categoria/${cat.slug}`}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${active
                    ? 'shadow-xs font-bold'
                    : 'text-navy-700 bg-navy-50/80 hover:bg-navy-100'
                  }`}
                style={
                  active
                    ? { backgroundColor: cat.bgLight || '#e6f0ff', color: cat.color }
                    : undefined
                }
              >
                <Icon size={13} style={{ color: cat.color }} />
                <span>{cat.name}</span>
              </Link>
            );
          })}

          <Link
            to="/colunistas"
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${isActive('/colunistas') || location.pathname.startsWith('/colunista')
                ? 'bg-accent-50 text-accent-700 font-bold border border-accent-300'
                : 'text-navy-700 bg-navy-50/80 hover:bg-navy-100'
              }`}
          >
            <Feather size={13} className="text-accent-500" />
            <span>Colunistas</span>
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-navy-200 shadow-lg z-50">
          <nav className="max-w-7xl mx-auto px-4 py-3">
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-navy-700 hover:bg-navy-50 transition-colors"
                >
                  Início
                </Link>
              </li>
              {categories.filter(cat => cat.id !== 'colunistas').map(cat => {
                const Icon = cat.icon;
                return (
                  <li key={cat.id}>
                    <Link
                      to={`/categoria/${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-navy-700 hover:bg-navy-50 transition-colors"
                    >
                      <Icon size={16} style={{ color: cat.color }} />
                      {cat.name}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  to="/colunistas"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${isActive('/colunistas') || location.pathname.startsWith('/colunista')
                      ? 'bg-accent-50 text-accent-700 font-bold'
                      : 'text-navy-800 hover:bg-navy-50'
                    }`}
                >
                  <Feather size={16} className="text-accent-500" />
                  <span>Nossos Colunistas</span>
                </Link>
              </li>
              {/* {latestEdition && (
                <li className="pt-2 mt-2 border-t border-navy-100">
                  <a
                    href={latestEdition.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-navy-950 bg-navy-50 hover:bg-navy-100 transition-colors"
                  >
                    <Download size={16} />
                    Baixar Edição do Dia
                  </a>
                </li>
              )} */}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
