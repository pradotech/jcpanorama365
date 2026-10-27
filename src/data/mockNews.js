const mockNews = [
  {
    id: '1',
    title: 'Prefeitura anuncia novo pacote de obras para revitalização do centro histórico',
    subtitle: 'Investimento de R$ 150 milhões prevê restauração de prédios tombados e criação de áreas de convivência',
    slug: 'prefeitura-anuncia-novo-pacote-obras-centro-historico',
    content: `<p>A Prefeitura Municipal anunciou nesta segunda-feira um ambicioso pacote de obras para a revitalização completa do centro histórico da cidade. O investimento, estimado em R$ 150 milhões, será executado ao longo dos próximos três anos.</p>
    <p>O projeto contempla a restauração de 23 prédios tombados pelo patrimônio histórico, a criação de novos espaços de convivência e a modernização da infraestrutura urbana, incluindo iluminação em LED e pavimentação em pedras portuguesas.</p>
    <h2>Principais intervenções</h2>
    <p>Entre as principais intervenções previstas, destaca-se a transformação da Rua XV de Novembro em um calçadão exclusivo para pedestres, com jardins suspensos e mobiliário urbano de design contemporâneo.</p>
    <blockquote>"Este é o maior investimento em patrimônio histórico que a cidade já recebeu. Vamos devolver ao centro toda a sua grandiosidade", afirmou o prefeito durante a coletiva de imprensa.</blockquote>
    <p>As obras devem começar no primeiro trimestre do próximo ano, com previsão de conclusão em etapas para minimizar o impacto no comércio local.</p>`,
    category: 'geral',
    image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=500&fit=crop',
    author: 'Carlos Mendes',
    published_at: '2026-08-09T14:30:00',
    status: 'published',
    featured: true
  },
  {
    id: '2',
    title: 'Operação policial desarticula quadrilha especializada em fraudes bancárias',
    subtitle: 'Grupo movimentou mais de R$ 5 milhões em golpes digitais nos últimos dois anos',
    slug: 'operacao-policial-desarticula-quadrilha-fraudes-bancarias',
    content: `<p>A Polícia Civil deflagrou na manhã desta terça-feira a Operação Firewall, que resultou na prisão de 12 suspeitos envolvidos em uma sofisticada rede de fraudes bancárias digitais. A quadrilha operava em pelo menos cinco estados brasileiros.</p>
    <p>Segundo as investigações, o grupo utilizava técnicas avançadas de engenharia social e malware para capturar dados bancários de vítimas em todo o país. Estima-se que mais de 3.000 pessoas tenham sido lesadas.</p>
    <p>Os mandados de busca e apreensão foram cumpridos simultaneamente em 15 endereços, resultando na apreensão de computadores, celulares, documentos falsos e aproximadamente R$ 800 mil em espécie.</p>
    <p>Os presos foram encaminhados ao sistema penitenciário e responderão por estelionato, associação criminosa e lavagem de dinheiro.</p>`,
    category: 'policia',
    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=500&fit=crop',
    author: 'Fernanda Lima',
    published_at: '2026-08-09T12:15:00',
    status: 'published',
    featured: false
  },
  {
    id: '3',
    title: 'Congresso aprova reforma tributária em votação histórica',
    subtitle: 'Nova legislação simplifica sistema de impostos e promete reduzir a carga sobre pequenos empreendedores',
    slug: 'congresso-aprova-reforma-tributaria-votacao-historica',
    content: `<p>Em uma sessão que durou mais de 16 horas, o Congresso Nacional aprovou por ampla maioria a tão aguardada reforma tributária. A votação, considerada histórica por parlamentares de diferentes partidos, contou com 389 votos a favor e 112 contra.</p>
    <p>A nova legislação prevê a unificação de cinco tributos em um único imposto sobre valor agregado (IVA), além de criar faixas diferenciadas para micro e pequenas empresas.</p>
    <h2>Impactos esperados</h2>
    <p>Economistas ouvidos pela reportagem avaliam que a reforma deve gerar um aumento de até 2% no PIB ao longo dos próximos dez anos, além de simplificar significativamente o ambiente de negócios no país.</p>
    <p>A implementação será gradual, com um período de transição de cinco anos para que empresas e governos se adaptem às novas regras.</p>`,
    category: 'politica',
    image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=500&fit=crop',
    author: 'Roberto Alves',
    published_at: '2026-08-09T16:45:00',
    status: 'published',
    featured: true
  },
  {
    id: '4',
    title: 'Seleção Brasileira vence por 3 a 1 e avança às semifinais da Copa do Mundo',
    subtitle: 'Gols de Endrick, Vini Jr. e Rodrygo garantem classificação emocionante contra a Alemanha',
    slug: 'selecao-brasileira-vence-avanca-semifinais-copa',
    content: `<p>A Seleção Brasileira garantiu vaga nas semifinais da Copa do Mundo com uma vitória convincente de 3 a 1 sobre a Alemanha, nesta quarta-feira, em partida disputada no Estádio Nacional.</p>
    <p>Endrick abriu o placar logo aos 12 minutos do primeiro tempo, com um chute de fora da área que não deu chances ao goleiro adversário. A Alemanha empatou aos 35 minutos em cobrança de falta de Wirtz.</p>
    <p>No segundo tempo, Vini Jr. fez uma jogada individual espetacular pela esquerda e marcou o segundo gol aos 18 minutos. Rodrygo selou a classificação aos 38 minutos, após contra-ataque fulminante.</p>
    <blockquote>"Estamos muito focados no objetivo. Cada jogo é uma final para nós", declarou o técnico da seleção após a partida.</blockquote>
    <p>O Brasil enfrentará a França na semifinal, na próxima terça-feira.</p>`,
    category: 'esportes',
    image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop',
    author: 'Paulo Santos',
    published_at: '2026-08-09T18:00:00',
    status: 'published',
    featured: true
  },
  {
    id: '5',
    title: 'Dólar recua para R$ 4,85 e atinge menor cotação em dois anos',
    subtitle: 'Fluxo de investimentos estrangeiros e juros elevados contribuem para a valorização do real',
    slug: 'dolar-recua-menor-cotacao-dois-anos',
    content: `<p>O dólar comercial encerrou o pregão desta quinta-feira cotado a R$ 4,85, registrando queda de 1,2% e atingindo o menor patamar em dois anos. A moeda norte-americana acumula desvalorização de 8% no ano.</p>
    <p>Analistas do mercado financeiro atribuem o movimento a uma combinação de fatores: o aumento do fluxo de investimentos estrangeiros diretos, a manutenção da taxa Selic em patamar elevado e a aprovação da reforma tributária.</p>
    <h2>Perspectivas</h2>
    <p>Segundo relatório divulgado pelo Banco Central, as projeções indicam que o dólar deve se manter na faixa entre R$ 4,70 e R$ 5,00 até o final do ano, dependendo do cenário econômico global.</p>
    <p>A queda do dólar traz alívio para importadores e viajantes, mas gera preocupação entre exportadores, que veem suas receitas em moeda nacional diminuírem.</p>`,
    category: 'economia',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop',
    author: 'Ana Beatriz Costa',
    published_at: '2026-08-09T17:30:00',
    status: 'published',
    featured: false
  },
  {
    id: '6',
    title: 'Amazônia registra menor taxa de desmatamento em uma década',
    subtitle: 'Novas tecnologias de monitoramento e fiscalização mais rigorosa contribuíram para a redução',
    slug: 'amazonia-registra-menor-taxa-desmatamento-decada',
    content: `<p>Dados divulgados pelo Instituto Nacional de Pesquisas Espaciais (INPE) nesta sexta-feira revelam que a Amazônia brasileira registrou a menor taxa de desmatamento dos últimos dez anos. A redução foi de 42% em comparação ao período anterior.</p>
    <p>O resultado é atribuído a uma combinação de fatores, incluindo o uso de inteligência artificial para monitoramento em tempo real, operações de fiscalização mais frequentes e programas de incentivo à preservação para comunidades locais.</p>
    <p>O ministro do Meio Ambiente celebrou os números e reafirmou o compromisso do governo com a meta de desmatamento zero até 2030.</p>
    <p>Organizações ambientais, embora reconheçam o avanço, pedem cautela e afirmam que os esforços precisam ser contínuos para garantir resultados sustentáveis a longo prazo.</p>`,
    category: 'brasil',
    image_url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=500&fit=crop',
    author: 'Marcos Oliveira',
    published_at: '2026-08-09T10:00:00',
    status: 'published',
    featured: false
  },
  {
    id: '7',
    title: 'Acordo de paz histórico é firmado entre nações do Oriente Médio',
    subtitle: 'Tratado mediado pela ONU promete encerrar décadas de conflito na região',
    slug: 'acordo-paz-historico-firmado-oriente-medio',
    content: `<p>Representantes de cinco nações do Oriente Médio assinaram nesta quinta-feira um acordo de paz histórico, mediado pelo secretário-geral das Nações Unidas. A cerimônia de assinatura ocorreu em Genebra, na Suíça.</p>
    <p>O tratado prevê cessar-fogo imediato, criação de zonas desmilitarizadas, programas de reconstrução conjuntos e a abertura de corredores humanitários permanentes.</p>
    <p>Líderes mundiais saudaram o acordo como um marco na diplomacia internacional. O presidente dos Estados Unidos classificou o momento como "um novo capítulo na história da humanidade".</p>
    <p>Observadores internacionais serão destacados para a região nas próximas semanas para acompanhar a implementação dos termos acordados.</p>`,
    category: 'mundo',
    image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=500&fit=crop',
    author: 'Juliana Pires',
    published_at: '2026-08-09T08:45:00',
    status: 'published',
    featured: false
  },
  {
    id: '8',
    title: 'Festival de Cinema de Gramado revela os vencedores da 54ª edição',
    subtitle: 'Filme brasileiro sobre inteligência artificial leva o Kikito de Ouro como melhor longa-metragem',
    slug: 'festival-cinema-gramado-vencedores-54-edicao',
    content: `<p>O 54º Festival de Cinema de Gramado chegou ao fim neste sábado com uma cerimônia de premiação emocionante. O grande vencedor da noite foi o filme "Além do Código", uma produção brasileira que explora os limites éticos da inteligência artificial.</p>
    <p>O longa-metragem, dirigido por Marina Torres, conquistou quatro Kikitos, incluindo melhor filme, melhor direção, melhor roteiro e melhor ator para Rodrigo Santoro, que interpretou um cientista em conflito moral.</p>
    <p>Na categoria de curta-metragem, o vencedor foi "Raízes", uma animação que retrata a história de comunidades ribeirinhas da Amazônia com uma estética visual inovadora.</p>
    <p>O festival recebeu este ano um público recorde de 180 mil visitantes ao longo de dez dias de programação.</p>`,
    category: 'variedades',
    image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop',
    author: 'Camila Duarte',
    published_at: '2026-08-08T22:00:00',
    status: 'published',
    featured: false
  },
  {
    id: '9',
    title: 'Governo lança programa de habitação popular com 500 mil novas moradias',
    subtitle: 'Iniciativa prevê subsídios de até 90% para famílias de baixa renda',
    slug: 'governo-lanca-programa-habitacao-popular',
    content: `<p>O governo federal lançou nesta segunda-feira o programa "Minha Casa, Meu Sonho", que prevê a construção de 500 mil novas unidades habitacionais populares em todo o país nos próximos quatro anos.</p>
    <p>O programa oferece subsídios de até 90% do valor do imóvel para famílias com renda mensal de até dois salários mínimos, e condições especiais de financiamento para faixas de renda mais elevadas.</p>
    <p>As primeiras entregas estão previstas para o segundo semestre do próximo ano, com foco inicial nas regiões metropolitanas com maior déficit habitacional.</p>`,
    category: 'geral',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop',
    author: 'Ricardo Souza',
    published_at: '2026-08-08T15:20:00',
    status: 'published',
    featured: false
  },
  {
    id: '10',
    title: 'PM apreende arsenal de armas em depósito clandestino na zona norte',
    subtitle: 'Mais de 50 armas de fogo e milhares de munições foram encontradas durante operação de rotina',
    slug: 'pm-apreende-arsenal-armas-deposito-clandestino',
    content: `<p>A Polícia Militar apreendeu na noite desta terça-feira um grande arsenal de armas em um depósito clandestino localizado na zona norte da cidade. A descoberta ocorreu durante uma operação de rotina no bairro.</p>
    <p>Entre o material apreendido estão 52 armas de fogo de diversos calibres, incluindo pistolas, revólveres e fuzis, além de aproximadamente 15 mil munições e coletes balísticos.</p>
    <p>Dois suspeitos foram detidos no local e encaminhados à delegacia especializada. As investigações apontam que o depósito abastecia facções criminosas de toda a região metropolitana.</p>`,
    category: 'policia',
    image_url: 'https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=800&h=500&fit=crop',
    author: 'Fernanda Lima',
    published_at: '2026-08-08T21:10:00',
    status: 'published',
    featured: false
  },
  {
    id: '11',
    title: 'CPI investiga superfaturamento em contratos de merenda escolar',
    subtitle: 'Parlamentares convocam secretários municipais e fornecedores para prestar depoimento',
    slug: 'cpi-investiga-superfaturamento-merenda-escolar',
    content: `<p>A Comissão Parlamentar de Inquérito (CPI) instaurada para investigar supostos casos de superfaturamento em contratos de merenda escolar realizou sua primeira audiência pública nesta quarta-feira.</p>
    <p>Documentos apresentados pelos relatores indicam que pelo menos 15 contratos firmados nos últimos três anos apresentam indícios de sobrepreço, com valores até 300% acima da média de mercado.</p>
    <p>A comissão aprovou a convocação de seis secretários municipais e representantes de quatro empresas fornecedoras para prestarem depoimento nas próximas semanas.</p>`,
    category: 'politica',
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&h=500&fit=crop',
    author: 'Roberto Alves',
    published_at: '2026-08-08T13:00:00',
    status: 'published',
    featured: false
  },
  {
    id: '12',
    title: 'Brasileira conquista medalha de ouro inédita no Mundial de Atletismo',
    subtitle: 'Atleta de 22 anos supera recordistas e faz história nos 400 metros com barreiras',
    slug: 'brasileira-conquista-ouro-inedito-mundial-atletismo',
    content: `<p>A velocista brasileira Isabella Ferreira conquistou nesta quinta-feira a medalha de ouro nos 400 metros com barreiras no Campeonato Mundial de Atletismo, realizado em Tóquio. É a primeira vez que o Brasil sobe ao lugar mais alto do pódio nesta prova.</p>
    <p>Com o tempo de 52.34 segundos, Isabella superou a recordista mundial e favorita americana, além da forte concorrência holandesa, cruzando a linha de chegada com mais de meio segundo de vantagem.</p>
    <p>A atleta, natural de Salvador, dedicou a conquista à sua família e ao projeto social que a revelou para o atletismo aos 14 anos.</p>`,
    category: 'esportes',
    image_url: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcfae?w=800&h=500&fit=crop',
    author: 'Paulo Santos',
    published_at: '2026-08-08T19:45:00',
    status: 'published',
    featured: false
  },
  {
    id: '13',
    title: 'Banco Central mantém taxa Selic em 12,25% ao ano',
    subtitle: 'Decisão unânime do Copom reflete cautela diante de incertezas no cenário global',
    slug: 'banco-central-mantem-taxa-selic',
    content: `<p>O Comitê de Política Monetária (Copom) do Banco Central decidiu, por unanimidade, manter a taxa básica de juros em 12,25% ao ano. A decisão veio em linha com as expectativas do mercado financeiro.</p>
    <p>Em comunicado, o comitê destacou que a inflação segue em trajetória de convergência para a meta, mas que as incertezas no cenário internacional — especialmente em relação à política monetária dos Estados Unidos — justificam a manutenção do atual patamar.</p>
    <p>Economistas projetam que o ciclo de redução da Selic deve ser retomado na próxima reunião, com corte estimado de 0,25 ponto percentual.</p>`,
    category: 'economia',
    image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=500&fit=crop',
    author: 'Ana Beatriz Costa',
    published_at: '2026-08-07T20:00:00',
    status: 'published',
    featured: false
  },
  {
    id: '14',
    title: 'Nordeste brasileiro bate recorde de geração de energia solar',
    subtitle: 'Região já responde por 40% de toda a energia solar produzida no país',
    slug: 'nordeste-bate-recorde-geracao-energia-solar',
    content: `<p>O Nordeste brasileiro atingiu um novo recorde de geração de energia solar, respondendo agora por 40% de toda a produção fotovoltaica do país. Os dados foram divulgados pela Agência Nacional de Energia Elétrica (ANEEL).</p>
    <p>O estado da Bahia lidera o ranking nacional, seguido por Piauí e Ceará. Juntos, os três estados possuem capacidade instalada superior a 15 GW, suficiente para abastecer mais de 10 milhões de residências.</p>
    <p>O crescimento é impulsionado pela combinação de alta irradiação solar, incentivos fiscais e redução nos custos de instalação dos painéis fotovoltaicos.</p>`,
    category: 'brasil',
    image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=500&fit=crop',
    author: 'Marcos Oliveira',
    published_at: '2026-08-07T11:30:00',
    status: 'published',
    featured: false
  },
  {
    id: '15',
    title: 'União Europeia aprova regulamentação histórica para inteligência artificial',
    subtitle: 'Legislação é a mais abrangente do mundo e estabelece limites para uso de IA em decisões críticas',
    slug: 'uniao-europeia-aprova-regulamentacao-inteligencia-artificial',
    content: `<p>O Parlamento Europeu aprovou nesta quarta-feira a regulamentação mais abrangente do mundo para o uso de inteligência artificial. A legislação, batizada de "AI Act 2.0", entrará em vigor em janeiro do próximo ano.</p>
    <p>As novas regras classificam os sistemas de IA em quatro níveis de risco e proíbem o uso de reconhecimento facial em tempo real em espaços públicos, exceto em casos de segurança nacional previamente autorizados.</p>
    <p>Empresas de tecnologia terão 18 meses para se adequar às novas exigências, que incluem transparência algorítmica, auditorias independentes e direito de explicação para cidadãos afetados por decisões automatizadas.</p>`,
    category: 'mundo',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
    author: 'Juliana Pires',
    published_at: '2026-08-07T14:15:00',
    status: 'published',
    featured: false
  },
  {
    id: '16',
    title: 'Exposição imersiva sobre Van Gogh chega ao Brasil com tecnologia inédita',
    subtitle: 'Mostra utiliza projeções 360° e realidade virtual para recriar o universo do pintor holandês',
    slug: 'exposicao-imersiva-van-gogh-chega-brasil',
    content: `<p>A maior exposição imersiva sobre a obra de Vincent van Gogh chega ao Brasil neste mês, trazendo tecnologia de projeção 360° e experiências em realidade virtual nunca antes apresentadas no país.</p>
    <p>A mostra "Van Gogh Alive: Beyond the Stars" ocupa um espaço de 3.000 m² e permite que visitantes literalmente "entrem" nas pinturas mais famosas do artista holandês, como "A Noite Estrelada" e "Os Girassóis".</p>
    <p>Os ingressos já estão à venda e os organizadores esperam receber mais de 500 mil visitantes durante os quatro meses de exibição.</p>`,
    category: 'variedades',
    image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=500&fit=crop',
    author: 'Camila Duarte',
    published_at: '2026-08-07T09:00:00',
    status: 'published',
    featured: false
  },
  {
    id: '17',
    title: 'Tecnologia brasileira de dessalinização conquista prêmio internacional',
    subtitle: 'Sistema desenvolvido por pesquisadores da USP é 60% mais eficiente que as soluções atuais',
    slug: 'tecnologia-brasileira-dessalinizacao-premio-internacional',
    content: `<p>Um sistema de dessalinização de água desenvolvido por pesquisadores da Universidade de São Paulo (USP) conquistou o prêmio Global Water Innovation Award, considerado o mais importante do setor de recursos hídricos.</p>
    <p>A tecnologia, baseada em membranas de grafeno modificado, é capaz de converter água do mar em água potável com eficiência 60% superior às soluções convencionais, com custo operacional significativamente menor.</p>
    <p>O sistema já está sendo testado em uma planta piloto no litoral do Ceará e pode beneficiar comunidades em todo o semiárido brasileiro.</p>`,
    category: 'geral',
    image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=500&fit=crop',
    author: 'Carlos Mendes',
    published_at: '2026-08-06T16:00:00',
    status: 'published',
    featured: false
  },
  {
    id: '18',
    title: 'Terremoto de magnitude 7.2 atinge costa do Japão; alerta de tsunami é emitido',
    subtitle: 'Tremor foi sentido em Tóquio e região; autoridades orientam evacuação de áreas costeiras',
    slug: 'terremoto-magnitude-72-atinge-japao',
    content: `<p>Um terremoto de magnitude 7.2 na escala Richter atingiu a costa nordeste do Japão na madrugada desta sexta-feira (horário local). O tremor foi sentido com intensidade em diversas cidades, incluindo Tóquio.</p>
    <p>A Agência Meteorológica do Japão emitiu alerta de tsunami para toda a costa do Pacífico, com previsão de ondas de até 3 metros de altura. Moradores das áreas costeiras foram orientados a buscar locais elevados.</p>
    <p>Até o momento, não há relatos de vítimas fatais, mas autoridades confirmam danos estruturais em edifícios e interrupção dos serviços de transporte na região afetada.</p>`,
    category: 'mundo',
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop',
    author: 'Juliana Pires',
    published_at: '2026-08-06T04:30:00',
    status: 'published',
    featured: false
  },
  {
    id: '19',
    title: 'Inflação de alimentos recua pelo terceiro mês consecutivo',
    subtitle: 'Safra recorde de grãos e queda do dólar contribuem para o alívio nos preços',
    slug: 'inflacao-alimentos-recua-terceiro-mes',
    content: `<p>O IBGE divulgou nesta terça-feira que a inflação no setor de alimentos e bebidas recuou pelo terceiro mês consecutivo, registrando deflação de 0,3% em julho. No acumulado dos últimos três meses, a queda é de 1,8%.</p>
    <p>A redução é atribuída principalmente à safra recorde de grãos, especialmente soja e milho, combinada à valorização do real frente ao dólar, que barateia os insumos importados.</p>
    <p>Entre os itens que mais caíram de preço estão o arroz (-5,2%), o feijão (-3,8%) e o óleo de soja (-4,1%). Por outro lado, carnes e frutas ainda apresentam alta, embora em ritmo menor.</p>`,
    category: 'economia',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=500&fit=crop',
    author: 'Ana Beatriz Costa',
    published_at: '2026-08-06T10:15:00',
    status: 'published',
    featured: false
  },
  {
    id: '20',
    title: 'Startup brasileira de saúde digital recebe aporte de US$ 200 milhões',
    subtitle: 'Plataforma de telemedicina com IA já atende mais de 5 milhões de pacientes em todo o país',
    slug: 'startup-brasileira-saude-digital-aporte-200-milhoes',
    content: `<p>A healthtech brasileira MediConnect anunciou nesta segunda-feira ter recebido um aporte de US$ 200 milhões em rodada de investimento liderada por fundos de venture capital dos Estados Unidos e Japão.</p>
    <p>A empresa, que utiliza inteligência artificial para triagem e diagnóstico preliminar via telemedicina, já atende mais de 5 milhões de pacientes cadastrados e conta com uma rede de 15 mil médicos parceiros.</p>
    <p>Com o novo investimento, a MediConnect planeja expandir suas operações para outros cinco países da América Latina ainda neste ano e investir no desenvolvimento de novos algoritmos de diagnóstico.</p>`,
    category: 'brasil',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop',
    author: 'Marcos Oliveira',
    published_at: '2026-08-05T14:40:00',
    status: 'published',
    featured: false
  }
];

export default mockNews;
