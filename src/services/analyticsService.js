import { supabase } from '../lib/supabase';

// Trava síncrona em memória para evitar concorrência e disparos duplicados do React StrictMode
const pendingViews = new Set();

/**
 * Retorna a data no formato YYYY-MM-DD no fuso de Brasília (America/Sao_Paulo).
 * Evita o bug de virar o dia às 21h/22h (como ocorria ao usar toISOString() que usa UTC).
 */
export function getLocalDateString(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Registra o clique/visualização de uma notícia.
 * Utiliza trava em memória + sessionStorage para contabilizar exatamente 1 clique por notícia por sessão.
 */
export async function recordNewsView(newsId) {
  if (!newsId) return;

  // 1. Bloqueio instantâneo em memória (resolve React StrictMode e duplo clique imediato)
  if (pendingViews.has(newsId)) {
    return;
  }

  const storageKey = `viewed_news_${newsId}`;
  try {
    if (sessionStorage.getItem(storageKey)) {
      pendingViews.add(newsId);
      return; // Já contabilizado nesta sessão
    }
  } catch {
    // sessionStorage indisponível
  }

  // Marcar como pendente/processado IMEDIATAMENTE (antes da requisição assíncrona)
  pendingViews.add(newsId);
  try {
    sessionStorage.setItem(storageKey, '1');
  } catch {
    // Ignora erro
  }

  try {
    // 1. Tentar via RPC dedicada
    const { error: rpcError } = await supabase.rpc('record_news_view', {
      p_news_id: newsId,
    });

    // 2. Se a RPC falhar ou não tiver sido criada ainda, tentar insert direto informando a date_key de Brasília
    if (rpcError) {
      const { error: insertError } = await supabase
        .from('news_views')
        .insert([{ news_id: newsId, date_key: getLocalDateString() }]);

      if (insertError) {
        console.warn('Não foi possível registrar o clique:', insertError.message);
      }
    }
  } catch (err) {
    console.warn('Erro ao registrar visualização:', err);
  }
}

/**
 * Busca o ranking de notícias mais lidas em uma data específica (YYYY-MM-DD).
 */
export async function getNewsViewsByDate(targetDate) {
  const dateStr = targetDate || getLocalDateString();

  try {
    // Tenta pela função RPC otimizada
    const { data, error } = await supabase.rpc('get_news_views_by_date', {
      target_date: dateStr,
    });

    if (!error && Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        total_clicks: Number(item.total_clicks || 0),
      }));
    }

    // Fallback: consulta direta caso a RPC não exista
    const { data: viewsData, error: viewsError } = await supabase
      .from('news_views')
      .select('news_id, news(id, title, category, slug, image_url)')
      .eq('date_key', dateStr);

    if (viewsError) {
      console.warn('Erro ao consultar cliques da data:', viewsError.message);
      return [];
    }

    const counterMap = new Map();
    (viewsData || []).forEach(row => {
      if (!row.news_id) return;
      const existing = counterMap.get(row.news_id) || {
        news_id: row.news_id,
        title: row.news?.title || 'Sem título',
        category: row.news?.category || 'geral',
        slug: row.news?.slug || '',
        image_url: row.news?.image_url || null,
        total_clicks: 0,
      };
      existing.total_clicks += 1;
      counterMap.set(row.news_id, existing);
    });

    return Array.from(counterMap.values()).sort(
      (a, b) => b.total_clicks - a.total_clicks
    );
  } catch (err) {
    console.error('Falha ao obter visualizações por data:', err);
    return [];
  }
}

/**
 * Busca o histórico de cliques dos últimos X dias para montar gráficos de linha/barra.
 */
export async function getDailyViewsHistory(daysLimit = 14) {
  try {
    const { data, error } = await supabase.rpc('get_daily_views_history', {
      days_limit: daysLimit,
    });

    if (!error && Array.isArray(data)) {
      return data.map(item => ({
        date_key: item.date_key,
        total_clicks: Number(item.total_clicks || 0),
      }));
    }

    // Fallback
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLimit);
    const startDateStr = getLocalDateString(startDate);

    const { data: viewsData, error: viewsError } = await supabase
      .from('news_views')
      .select('date_key')
      .gte('date_key', startDateStr);

    if (viewsError) {
      return [];
    }

    const counts = {};
    (viewsData || []).forEach(row => {
      const d = row.date_key;
      counts[d] = (counts[d] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([date_key, total_clicks]) => ({ date_key, total_clicks }))
      .sort((a, b) => a.date_key.localeCompare(b.date_key));
  } catch (err) {
    console.error('Falha ao obter histórico diário:', err);
    return [];
  }
}

/**
 * Retorna o total geral acumulado de cliques no portal.
 */
export async function getTotalViewsCount() {
  try {
    const { count, error } = await supabase
      .from('news_views')
      .select('*', { count: 'exact', head: true });

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}
