// Script de setup do banco de dados Supabase
// Usa a service_role key para criar tabelas e seed data
// Execute: node scripts/setup-database.mjs

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://toqinygmtdlsoeocftor.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ============================================
// 1. Criar tabela via PostgREST SQL function
// ============================================

async function createExecSqlFunction() {
  // Tenta criar uma RPC function para executar SQL arbitrário
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql_text: 'SELECT 1' }),
  });
  
  if (res.ok) {
    console.log('✅ exec_sql function exists, can execute SQL');
    return true;
  }
  
  console.log('ℹ️  exec_sql function not found, will try alternative approach');
  return false;
}

// ============================================
// 2. Seed data via PostgREST insert
// ============================================

const mockNews = [
  {
    title: 'Prefeitura anuncia novo pacote de obras para revitalização do centro histórico',
    subtitle: 'Investimento de R$ 150 milhões prevê restauração de prédios tombados e criação de áreas de convivência',
    slug: 'prefeitura-anuncia-novo-pacote-obras-centro-historico',
    content: '<p>A Prefeitura Municipal anunciou nesta segunda-feira um ambicioso pacote de obras para a revitalização completa do centro histórico da cidade. O investimento, estimado em R$ 150 milhões, será executado ao longo dos próximos três anos.</p><p>O projeto contempla a restauração de 23 prédios tombados pelo patrimônio histórico, a criação de novos espaços de convivência e a modernização da infraestrutura urbana, incluindo iluminação em LED e pavimentação em pedras portuguesas.</p><h2>Principais intervenções</h2><p>Entre as principais intervenções previstas, destaca-se a transformação da Rua XV de Novembro em um calçadão exclusivo para pedestres, com jardins suspensos e mobiliário urbano de design contemporâneo.</p><blockquote>"Este é o maior investimento em patrimônio histórico que a cidade já recebeu. Vamos devolver ao centro toda a sua grandiosidade", afirmou o prefeito durante a coletiva de imprensa.</blockquote><p>As obras devem começar no primeiro trimestre do próximo ano, com previsão de conclusão em etapas para minimizar o impacto no comércio local.</p>',
    category: 'geral',
    image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=500&fit=crop',
    author: 'Carlos Mendes',
    published_at: '2026-08-09T14:30:00Z',
    status: 'published',
    featured: true,
  },
  {
    title: 'Operação policial desarticula quadrilha especializada em fraudes bancárias',
    subtitle: 'Grupo movimentou mais de R$ 5 milhões em golpes digitais nos últimos dois anos',
    slug: 'operacao-policial-desarticula-quadrilha-fraudes-bancarias',
    content: '<p>A Polícia Civil deflagrou na manhã desta terça-feira a Operação Firewall, que resultou na prisão de 12 suspeitos envolvidos em uma sofisticada rede de fraudes bancárias digitais.</p><p>Segundo as investigações, o grupo utilizava técnicas avançadas de engenharia social e malware para capturar dados bancários de vítimas em todo o país. Estima-se que mais de 3.000 pessoas tenham sido lesadas.</p><p>Os mandados de busca e apreensão foram cumpridos simultaneamente em 15 endereços, resultando na apreensão de computadores, celulares, documentos falsos e aproximadamente R$ 800 mil em espécie.</p>',
    category: 'policia',
    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=500&fit=crop',
    author: 'Fernanda Lima',
    published_at: '2026-08-09T12:15:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'Congresso aprova reforma tributária em votação histórica',
    subtitle: 'Nova legislação simplifica sistema de impostos e promete reduzir a carga sobre pequenos empreendedores',
    slug: 'congresso-aprova-reforma-tributaria-votacao-historica',
    content: '<p>Em uma sessão que durou mais de 16 horas, o Congresso Nacional aprovou por ampla maioria a tão aguardada reforma tributária. A votação, considerada histórica, contou com 389 votos a favor e 112 contra.</p><p>A nova legislação prevê a unificação de cinco tributos em um único imposto sobre valor agregado (IVA), além de criar faixas diferenciadas para micro e pequenas empresas.</p><h2>Impactos esperados</h2><p>Economistas avaliam que a reforma deve gerar um aumento de até 2% no PIB ao longo dos próximos dez anos.</p>',
    category: 'politica',
    image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=500&fit=crop',
    author: 'Roberto Alves',
    published_at: '2026-08-09T16:45:00Z',
    status: 'published',
    featured: true,
  },
  {
    title: 'Seleção Brasileira vence por 3 a 1 e avança às semifinais da Copa do Mundo',
    subtitle: 'Gols de Endrick, Vini Jr. e Rodrygo garantem classificação emocionante contra a Alemanha',
    slug: 'selecao-brasileira-vence-avanca-semifinais-copa',
    content: '<p>A Seleção Brasileira garantiu vaga nas semifinais da Copa do Mundo com uma vitória convincente de 3 a 1 sobre a Alemanha.</p><p>Endrick abriu o placar logo aos 12 minutos do primeiro tempo. A Alemanha empatou aos 35 minutos em cobrança de falta de Wirtz.</p><p>No segundo tempo, Vini Jr. marcou o segundo gol aos 18 minutos. Rodrygo selou a classificação aos 38 minutos.</p><blockquote>"Estamos muito focados no objetivo. Cada jogo é uma final para nós", declarou o técnico.</blockquote>',
    category: 'esportes',
    image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop',
    author: 'Paulo Santos',
    published_at: '2026-08-09T18:00:00Z',
    status: 'published',
    featured: true,
  },
  {
    title: 'Dólar recua para R$ 4,85 e atinge menor cotação em dois anos',
    subtitle: 'Fluxo de investimentos estrangeiros e juros elevados contribuem para a valorização do real',
    slug: 'dolar-recua-menor-cotacao-dois-anos',
    content: '<p>O dólar comercial encerrou o pregão cotado a R$ 4,85, registrando queda de 1,2% e atingindo o menor patamar em dois anos.</p><p>Analistas atribuem o movimento a uma combinação de fatores: aumento do fluxo de investimentos estrangeiros, manutenção da taxa Selic em patamar elevado e aprovação da reforma tributária.</p>',
    category: 'economia',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop',
    author: 'Ana Beatriz Costa',
    published_at: '2026-08-09T17:30:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'Amazônia registra menor taxa de desmatamento em uma década',
    subtitle: 'Novas tecnologias de monitoramento e fiscalização mais rigorosa contribuíram para a redução',
    slug: 'amazonia-registra-menor-taxa-desmatamento-decada',
    content: '<p>Dados divulgados pelo INPE revelam que a Amazônia brasileira registrou a menor taxa de desmatamento dos últimos dez anos. A redução foi de 42% em comparação ao período anterior.</p><p>O resultado é atribuído ao uso de inteligência artificial para monitoramento em tempo real e operações de fiscalização mais frequentes.</p>',
    category: 'brasil',
    image_url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=500&fit=crop',
    author: 'Marcos Oliveira',
    published_at: '2026-08-09T10:00:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'Acordo de paz histórico é firmado entre nações do Oriente Médio',
    subtitle: 'Tratado mediado pela ONU promete encerrar décadas de conflito na região',
    slug: 'acordo-paz-historico-firmado-oriente-medio',
    content: '<p>Representantes de cinco nações do Oriente Médio assinaram um acordo de paz histórico, mediado pelo secretário-geral das Nações Unidas.</p><p>O tratado prevê cessar-fogo imediato, criação de zonas desmilitarizadas, programas de reconstrução conjuntos e a abertura de corredores humanitários permanentes.</p>',
    category: 'mundo',
    image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=500&fit=crop',
    author: 'Juliana Pires',
    published_at: '2026-08-09T08:45:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'Festival de Cinema de Gramado revela os vencedores da 54ª edição',
    subtitle: 'Filme brasileiro sobre inteligência artificial leva o Kikito de Ouro como melhor longa-metragem',
    slug: 'festival-cinema-gramado-vencedores-54-edicao',
    content: '<p>O 54º Festival de Cinema de Gramado chegou ao fim com uma cerimônia de premiação emocionante. O grande vencedor foi o filme "Além do Código", uma produção que explora os limites éticos da inteligência artificial.</p><p>O longa conquistou quatro Kikitos, incluindo melhor filme, melhor direção, melhor roteiro e melhor ator.</p>',
    category: 'variedades',
    image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop',
    author: 'Camila Duarte',
    published_at: '2026-08-08T22:00:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'Governo lança programa de habitação popular com 500 mil novas moradias',
    subtitle: 'Iniciativa prevê subsídios de até 90% para famílias de baixa renda',
    slug: 'governo-lanca-programa-habitacao-popular',
    content: '<p>O governo federal lançou o programa "Minha Casa, Meu Sonho", que prevê a construção de 500 mil novas unidades habitacionais populares nos próximos quatro anos.</p><p>O programa oferece subsídios de até 90% do valor do imóvel para famílias com renda mensal de até dois salários mínimos.</p>',
    category: 'geral',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop',
    author: 'Ricardo Souza',
    published_at: '2026-08-08T15:20:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'PM apreende arsenal de armas em depósito clandestino na zona norte',
    subtitle: 'Mais de 50 armas de fogo e milhares de munições foram encontradas durante operação de rotina',
    slug: 'pm-apreende-arsenal-armas-deposito-clandestino',
    content: '<p>A Polícia Militar apreendeu um grande arsenal de armas em um depósito clandestino na zona norte da cidade.</p><p>Entre o material apreendido estão 52 armas de fogo de diversos calibres, incluindo pistolas, revólveres e fuzis, além de 15 mil munições.</p>',
    category: 'policia',
    image_url: 'https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=800&h=500&fit=crop',
    author: 'Fernanda Lima',
    published_at: '2026-08-08T21:10:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'CPI investiga superfaturamento em contratos de merenda escolar',
    subtitle: 'Parlamentares convocam secretários municipais e fornecedores para prestar depoimento',
    slug: 'cpi-investiga-superfaturamento-merenda-escolar',
    content: '<p>A CPI instaurada para investigar superfaturamento em contratos de merenda escolar realizou sua primeira audiência pública.</p><p>Documentos indicam que pelo menos 15 contratos apresentam indícios de sobrepreço, com valores até 300% acima da média de mercado.</p>',
    category: 'politica',
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&h=500&fit=crop',
    author: 'Roberto Alves',
    published_at: '2026-08-08T13:00:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'Brasileira conquista medalha de ouro inédita no Mundial de Atletismo',
    subtitle: 'Atleta de 22 anos supera recordistas e faz história nos 400 metros com barreiras',
    slug: 'brasileira-conquista-ouro-inedito-mundial-atletismo',
    content: '<p>A velocista Isabella Ferreira conquistou a medalha de ouro nos 400 metros com barreiras no Campeonato Mundial de Atletismo, em Tóquio.</p><p>Com o tempo de 52.34 segundos, Isabella superou a recordista mundial e favorita americana.</p>',
    category: 'esportes',
    image_url: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcfae?w=800&h=500&fit=crop',
    author: 'Paulo Santos',
    published_at: '2026-08-08T19:45:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'Banco Central mantém taxa Selic em 12,25% ao ano',
    subtitle: 'Decisão unânime do Copom reflete cautela diante de incertezas no cenário global',
    slug: 'banco-central-mantem-taxa-selic',
    content: '<p>O Copom decidiu, por unanimidade, manter a taxa Selic em 12,25% ao ano.</p><p>O comitê destacou que a inflação segue em trajetória de convergência, mas as incertezas no cenário internacional justificam a manutenção.</p>',
    category: 'economia',
    image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=500&fit=crop',
    author: 'Ana Beatriz Costa',
    published_at: '2026-08-07T20:00:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'Nordeste brasileiro bate recorde de geração de energia solar',
    subtitle: 'Região já responde por 40% de toda a energia solar produzida no país',
    slug: 'nordeste-bate-recorde-geracao-energia-solar',
    content: '<p>O Nordeste atingiu um novo recorde de geração de energia solar, respondendo por 40% de toda a produção fotovoltaica do país.</p><p>O estado da Bahia lidera o ranking nacional, seguido por Piauí e Ceará.</p>',
    category: 'brasil',
    image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=500&fit=crop',
    author: 'Marcos Oliveira',
    published_at: '2026-08-07T11:30:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'União Europeia aprova regulamentação histórica para inteligência artificial',
    subtitle: 'Legislação é a mais abrangente do mundo e estabelece limites para uso de IA em decisões críticas',
    slug: 'uniao-europeia-aprova-regulamentacao-inteligencia-artificial',
    content: '<p>O Parlamento Europeu aprovou a regulamentação mais abrangente do mundo para o uso de inteligência artificial.</p><p>As novas regras classificam os sistemas de IA em quatro níveis de risco e proíbem reconhecimento facial em tempo real em espaços públicos.</p>',
    category: 'mundo',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
    author: 'Juliana Pires',
    published_at: '2026-08-07T14:15:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'Exposição imersiva sobre Van Gogh chega ao Brasil com tecnologia inédita',
    subtitle: 'Mostra utiliza projeções 360° e realidade virtual para recriar o universo do pintor holandês',
    slug: 'exposicao-imersiva-van-gogh-chega-brasil',
    content: '<p>A maior exposição imersiva sobre Van Gogh chega ao Brasil, trazendo tecnologia de projeção 360° e experiências em realidade virtual.</p><p>A mostra ocupa 3.000 m² e permite que visitantes "entrem" nas pinturas mais famosas do artista.</p>',
    category: 'variedades',
    image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=500&fit=crop',
    author: 'Camila Duarte',
    published_at: '2026-08-07T09:00:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'Tecnologia brasileira de dessalinização conquista prêmio internacional',
    subtitle: 'Sistema desenvolvido por pesquisadores da USP é 60% mais eficiente que as soluções atuais',
    slug: 'tecnologia-brasileira-dessalinizacao-premio-internacional',
    content: '<p>Um sistema de dessalinização desenvolvido por pesquisadores da USP conquistou o prêmio Global Water Innovation Award.</p><p>A tecnologia é 60% mais eficiente que soluções convencionais, com custo operacional significativamente menor.</p>',
    category: 'geral',
    image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=500&fit=crop',
    author: 'Carlos Mendes',
    published_at: '2026-08-06T16:00:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'Terremoto de magnitude 7.2 atinge costa do Japão; alerta de tsunami é emitido',
    subtitle: 'Tremor foi sentido em Tóquio e região; autoridades orientam evacuação de áreas costeiras',
    slug: 'terremoto-magnitude-72-atinge-japao',
    content: '<p>Um terremoto de magnitude 7.2 atingiu a costa nordeste do Japão. O tremor foi sentido com intensidade em Tóquio.</p><p>A Agência Meteorológica do Japão emitiu alerta de tsunami com previsão de ondas de até 3 metros.</p>',
    category: 'mundo',
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop',
    author: 'Juliana Pires',
    published_at: '2026-08-06T04:30:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'Inflação de alimentos recua pelo terceiro mês consecutivo',
    subtitle: 'Safra recorde de grãos e queda do dólar contribuem para o alívio nos preços',
    slug: 'inflacao-alimentos-recua-terceiro-mes',
    content: '<p>O IBGE divulgou que a inflação no setor de alimentos e bebidas recuou pelo terceiro mês consecutivo, registrando deflação de 0,3% em julho.</p><p>A redução é atribuída à safra recorde de grãos e à valorização do real frente ao dólar.</p>',
    category: 'economia',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=500&fit=crop',
    author: 'Ana Beatriz Costa',
    published_at: '2026-08-06T10:15:00Z',
    status: 'published',
    featured: false,
  },
  {
    title: 'Startup brasileira de saúde digital recebe aporte de US$ 200 milhões',
    subtitle: 'Plataforma de telemedicina com IA já atende mais de 5 milhões de pacientes em todo o país',
    slug: 'startup-brasileira-saude-digital-aporte-200-milhoes',
    content: '<p>A healthtech MediConnect anunciou ter recebido um aporte de US$ 200 milhões em rodada de investimento.</p><p>A empresa utiliza inteligência artificial para triagem e diagnóstico preliminar via telemedicina, com mais de 5 milhões de pacientes.</p>',
    category: 'brasil',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop',
    author: 'Marcos Oliveira',
    published_at: '2026-08-05T14:40:00Z',
    status: 'published',
    featured: false,
  },
];

// ============================================
// 3. Criar admin user via Supabase Auth
// ============================================

async function createAdminUser() {
  console.log('\n📧 Criando usuário admin...');
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@jcpanorama365.com.br',
    password: 'admin123456',
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes('already been registered')) {
      console.log('ℹ️  Usuário admin já existe');
      return;
    }
    console.error('❌ Erro ao criar admin:', error.message);
    return;
  }

  console.log('✅ Admin criado:', data.user.email);
}

// ============================================
// 4. Verificar e inserir dados
// ============================================

async function checkAndSeedData() {
  console.log('\n📰 Verificando dados existentes...');
  
  const { data: existing, error: checkErr } = await supabase
    .from('news')
    .select('id')
    .limit(1);

  if (checkErr) {
    console.error('❌ Tabela news não encontrada:', checkErr.message);
    console.log('\n⚠️  Você precisa criar a tabela manualmente no Supabase SQL Editor.');
    console.log('📋 Copie e cole o SQL do arquivo: scripts/create-tables.sql');
    console.log('🔗 Link: https://supabase.com/dashboard/project/toqinygmtdlsoeocftor/sql/new\n');
    return false;
  }

  if (existing && existing.length > 0) {
    console.log('ℹ️  Já existem dados na tabela news, pulando seed');
    return true;
  }

  console.log('📥 Inserindo notícias de exemplo...');
  
  const { data, error } = await supabase
    .from('news')
    .insert(mockNews)
    .select();

  if (error) {
    console.error('❌ Erro ao inserir dados:', error.message);
    return false;
  }

  console.log(`✅ ${data.length} notícias inseridas com sucesso!`);
  return true;
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('🚀 Setup do Banco de Dados - JC Panorama 365\n');
  console.log('='.repeat(50));
  
  // Tentar criar admin
  await createAdminUser();
  
  // Tentar fazer seed dos dados
  const seedOk = await checkAndSeedData();
  
  if (seedOk) {
    console.log('\n' + '='.repeat(50));
    console.log('✅ Setup concluído com sucesso!');
    console.log('\n📧 Login admin: admin@jcpanorama365.com.br');
    console.log('🔑 Senha admin: admin123456');
  } else {
    console.log('\n' + '='.repeat(50));
    console.log('⚠️  Setup parcial. Crie a tabela e rode novamente.');
  }
}

main().catch(console.error);
