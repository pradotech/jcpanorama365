/**
 * Formata o tempo decorrido desde a publicação da notícia de forma inteligente e segura.
 * - Evita tempos negativos (-185min) causados por fusos ou relógios adiantados.
 * - Se for recente ou futuro: "Agora".
 * - Se for minutos (< 60): "Xmin".
 * - Se for horas (>= 60min e < 24h): "Xh".
 * - Se for dias (>= 24h e < 7d): "Xd".
 * - Se for mais antigo: data abreviada (ex: "20 out").
 */
export function formatTimeAgo(dateStr, { withSuffix = false } = {}) {
  if (!dateStr) return '';

  const postDate = new Date(dateStr);
  const time = postDate.getTime();
  if (isNaN(time)) return '';

  const now = Date.now();
  const diffMs = now - time;

  // Se a data estiver no futuro (por fuso horário de máquina legada) ou há menos de 1 minuto:
  if (diffMs < 60000) {
    return 'Agora';
  }

  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) {
    return withSuffix ? `${mins}min atrás` : `${mins}min`;
  }

  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return withSuffix ? `${hours}h atrás` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return withSuffix ? `${days}d atrás` : `${days}d`;
  }

  // Notícias com mais de 7 dias: exibir dia e mês legíveis
  return postDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).replace('.', '');
}
