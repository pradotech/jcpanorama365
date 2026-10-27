import {
  Newspaper, Shield, Landmark, Trophy,
  TrendingUp, MapPin, Globe, Sparkles, Feather
} from 'lucide-react';

const categories = [
  {
    id: 'geral',
    name: 'Geral',
    slug: 'geral',
    icon: Newspaper,
    color: '#1E56A0',
    bgLight: '#e6f0ff',
    description: 'As principais notícias do dia'
  },
  {
    id: 'policia',
    name: 'Polícia',
    slug: 'policia',
    icon: Shield,
    color: '#991B1B',
    bgLight: '#fef2f2',
    description: 'Segurança pública e ocorrências policiais'
  },
  {
    id: 'politica',
    name: 'Política',
    slug: 'politica',
    icon: Landmark,
    color: '#6B21A8',
    bgLight: '#faf5ff',
    description: 'Cenário político nacional e regional'
  },
  {
    id: 'esportes',
    name: 'Esportes',
    slug: 'esportes',
    icon: Trophy,
    color: '#15803D',
    bgLight: '#f0fdf4',
    description: 'Futebol, esportes olímpicos e mais'
  },
  {
    id: 'economia',
    name: 'Economia',
    slug: 'economia',
    icon: TrendingUp,
    color: '#B45309',
    bgLight: '#fffbeb',
    description: 'Mercado financeiro, negócios e finanças'
  },
  {
    id: 'brasil',
    name: 'Brasil',
    slug: 'brasil',
    icon: MapPin,
    color: '#047857',
    bgLight: '#ecfdf5',
    description: 'Notícias de todo o Brasil'
  },
  {
    id: 'mundo',
    name: 'Mundo',
    slug: 'mundo',
    icon: Globe,
    color: '#0369A1',
    bgLight: '#f0f9ff',
    description: 'Acontecimentos internacionais'
  },
  {
    id: 'variedades',
    name: 'Variedades',
    slug: 'variedades',
    icon: Sparkles,
    color: '#BE185D',
    bgLight: '#fdf2f8',
    description: 'Cultura, entretenimento e curiosidades'
  },
  {
    id: 'colunistas',
    name: 'Colunistas',
    slug: 'colunistas',
    icon: Feather,
    color: '#0F1A2E',
    bgLight: '#f1f5f9',
    description: 'Opiniões, análises e artigos exclusivos dos nossos colunistas'
  }
];

export default categories;

export function getCategoryById(id) {
  return categories.find(cat => cat.id === id);
}

export function getCategoryBySlug(slug) {
  return categories.find(cat => cat.slug === slug);
}
