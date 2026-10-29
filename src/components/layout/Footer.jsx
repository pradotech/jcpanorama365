import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe, Camera, MessageCircle, Play } from 'lucide-react';
import categories from '../../data/categories';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & About */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <div className="bg-white rounded-lg px-4 py-2">
                <img
                  src="/logo-full.jpg"
                  alt="JC Panorama 365"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-navy-300 text-sm leading-relaxed mb-5">
              Informação que conecta. Todos os dias. Seu portal de notícias com cobertura completa e independente.
            </p>
            <div className="flex gap-3">
              {[Globe, Camera, MessageCircle, Play].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-navy-300 hover:text-white transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-navy-200">
              Editorias
            </h3>
            <ul className="space-y-2.5">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link
                    to={cat.id === 'colunistas' ? '/colunistas' : `/categoria/${cat.slug}`}
                    className="text-sm text-navy-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-navy-200">
              Institucional
            </h3>
            <ul className="space-y-2.5">
              {/* 'Sobre Nós' comentado a pedido */}
              {[/* 'Sobre Nós', */ 'Equipe', 'Política de Privacidade', 'Termos de Uso', 'Anuncie Conosco', 'Trabalhe Conosco'].map(item => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-navy-400 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-navy-200">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="text-accent-400 mt-0.5 shrink-0" />
                <span className="text-sm text-navy-400">redacao@jcpanorama365.com.br</span>
              </li>
              {/* <li className="flex items-start gap-2.5">
                <Phone size={16} className="text-accent-400 mt-0.5 shrink-0" />
                <span className="text-sm text-navy-400">(11) 9999-9999</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-accent-400 mt-0.5 shrink-0" />
                <span className="text-sm text-navy-400">
                  Rua da Imprensa, 100<br />
                  Centro — São Paulo, SP
                </span>
              </li> */}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-navy-500">
            © {new Date().getFullYear()} JC Panorama 365. Todos os direitos reservados.
          </p>
          <p className="text-xs text-navy-500">
            Informação que conecta. Todos os dias.
          </p>
        </div>
      </div>
    </footer>
  );
}
