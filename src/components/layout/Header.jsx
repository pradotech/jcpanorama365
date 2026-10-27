import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Download, Feather } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import categories from '../../data/categories';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [latestEdition, setLatestEdition] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchLatestEdition = async () => {
      const { data } = await supabase
        .from('editions')
        .select('*')
        .order('edition_date', { ascending: false })
        .limit(1)
        .single();
      if (data) setLatestEdition(data);
    };
    fetchLatestEdition();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-header">
      {/* Top bar */}
      <div className="bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs">
          <span className="text-navy-300">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <Link
            to="/admin"
            className="text-navy-300 hover:text-white transition-colors"
          >
            Painel Admin
          </Link>
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
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar notícias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 rounded-full border border-navy-200 bg-navy-50 text-sm text-navy-700 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent focus:bg-white transition-all"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
              </div>
            </form>

            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50 transition-colors cursor-pointer"
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

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar notícias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-navy-200 bg-navy-50 text-sm text-navy-700 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
            </form>
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
                  className={`flex items-center gap-1.5 px-3.5 py-3 text-sm font-semibold transition-all relative ${
                    isActive('/colunistas') || location.pathname.startsWith('/colunista')
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
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive('/colunistas') || location.pathname.startsWith('/colunista')
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
