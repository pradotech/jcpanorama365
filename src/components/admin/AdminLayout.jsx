import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, LogOut,
  Menu, X, ChevronRight, ExternalLink, Newspaper, Users
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const adminMenu = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: FileText, label: 'Notícias', path: '/admin/noticias' },
  { icon: PlusCircle, label: 'Nova Notícia', path: '/admin/noticias/nova' },
  { icon: Users, label: 'Colunistas', path: '/admin/colunistas' },
  { icon: Newspaper, label: 'Edição do Dia', path: '/admin/edicoes' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    if (path === '/admin/noticias/nova') return location.pathname === '/admin/noticias/nova';
    if (path === '/admin/noticias') return location.pathname === '/admin/noticias' || location.pathname.startsWith('/admin/noticias/editar');
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-navy-50/50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-950 text-white shrink-0">
        <div className="px-4 py-4 border-b border-white/10">
          <Link to="/" className="inline-block">
            <div className="bg-white rounded-lg px-3 py-1.5">
              <img
                src="/logo-full.jpg"
                alt="JC Panorama 365"
                className="h-8 w-auto object-contain"
              />
            </div>
          </Link>
          <p className="text-[9px] text-navy-400 tracking-wider uppercase mt-2 px-1">Painel Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {adminMenu.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-accent-500 text-white shadow-md'
                        : 'text-navy-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          {user && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs text-navy-500 truncate">{user.email}</p>
            </div>
          )}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <ExternalLink size={18} />
            Voltar ao Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-navy-950 text-white flex flex-col">
            <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
              <Link to="/" className="inline-block">
                <div className="bg-white rounded-lg px-3 py-1.5">
                  <img
                    src="/logo-full.jpg"
                    alt="JC Panorama 365"
                    className="h-7 w-auto object-contain"
                  />
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-navy-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4">
              <ul className="space-y-1">
                {adminMenu.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? 'bg-accent-500 text-white'
                            : 'text-navy-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon size={18} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-navy-100 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50 transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm text-navy-400">
            <Link to="/admin" className="hover:text-navy-600 transition-colors">
              Admin
            </Link>
            {location.pathname !== '/admin' && (
              <>
                <ChevronRight size={14} />
                <span className="text-navy-700 font-medium">
                  {adminMenu.find(m => isActive(m.path))?.label || 'Página'}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
