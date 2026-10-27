import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Se já está autenticado, redirecionar
  if (isAuthenticated) {
    navigate('/admin');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      if (err.message && err.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos');
      } else if (err.message && err.message.includes('Email not confirmed')) {
        setError('E-mail não confirmado. Verifique sua caixa de entrada.');
      } else {
        setError(err.message || 'Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#0F1A2E' }}
    >
      <div className="w-full max-w-md">
        {/* Card do Formulário */}
        <div className="bg-white rounded-2xl shadow-2xl border border-navy-100 p-8 sm:p-10">
          {/* Logo e Cabeçalho */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 mb-4">
              <img
                src="/logo-full.jpg"
                alt="JC Panorama 365"
                className="h-24 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-navy-950">Painel Administrativo</h1>
            <p className="text-navy-500 text-sm mt-1">Acesse sua conta para gerenciar o portal</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-navy-800 block mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-50/50 border border-navy-200 text-navy-900 placeholder:text-navy-400 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-navy-800 block mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-navy-50/50 border border-navy-200 text-navy-900 placeholder:text-navy-400 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3.5 mt-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar no Painel'
              )}
            </Button>
          </form>
        </div>

        {/* Rodapé institucional */}
        <p className="text-center text-xs text-navy-400 mt-6">
          JC Panorama 365 &copy; {new Date().getFullYear()} &bull; Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
