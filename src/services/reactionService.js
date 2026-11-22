import { supabase } from '../lib/supabase';

// Chave para identificar o dispositivo de forma anônima e segura
function getOrCreateDeviceId() {
  const STORAGE_KEY = 'jc_device_uuid';
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'dev_anonymous';
  }
}

/**
 * Obtém a reação salva localmente pelo usuário para uma notícia específica.
 * Retorna 'like' | 'dislike' | null
 */
export function getUserReaction(newsId) {
  if (!newsId) return null;
  try {
    return localStorage.getItem(`jc_reaction_${newsId}`) || null;
  } catch {
    return null;
  }
}

/**
 * Salva a reação do usuário e sincroniza com o Supabase.
 * - Suporta alternância (toggle): se clicar no mesmo botão, remove a reação.
 * - Suporta troca direta de 'like' para 'dislike' (e vice-versa).
 * 
 * @param {string} newsId ID da notícia
 * @param {'like' | 'dislike' | null} newReaction Nova reação desejada
 * @returns {Promise<{ success: boolean, reaction: 'like' | 'dislike' | null }>}
 */
export async function toggleReaction(newsId, newReaction) {
  if (!newsId) return { success: false, reaction: null };

  const currentReaction = getUserReaction(newsId);
  const targetReaction = currentReaction === newReaction ? null : newReaction;
  const deviceId = getOrCreateDeviceId();

  // 1. Atualizar imediatamente no localStorage (otimista)
  try {
    if (targetReaction) {
      localStorage.setItem(`jc_reaction_${newsId}`, targetReaction);
    } else {
      localStorage.removeItem(`jc_reaction_${newsId}`);
    }
  } catch (e) {
    console.warn('Erro ao salvar reação localmente:', e);
  }

  // 2. Sincronizar com o Supabase
  try {
    // Tentativa 1: RPC dedicada 'record_news_reaction'
    const { error: rpcError } = await supabase.rpc('record_news_reaction', {
      p_news_id: newsId,
      p_reaction: targetReaction,
      p_prev_reaction: currentReaction,
      p_device_id: deviceId,
    });

    if (rpcError) {
      // Tentativa 2: Tabela news_reactions ou incremento direto
      if (targetReaction) {
        await supabase
          .from('news_reactions')
          .upsert(
            { news_id: newsId, device_id: deviceId, reaction_type: targetReaction },
            { onConflict: 'news_id,device_id' }
          );
      } else {
        await supabase
          .from('news_reactions')
          .delete()
          .match({ news_id: newsId, device_id: deviceId });
      }
    }
  } catch (err) {
    // Falha silenciosa para não travar a experiência do usuário
    console.warn('Não foi possível sincronizar a reação com o banco:', err?.message || err);
  }

  return { success: true, reaction: targetReaction };
}

/**
 * Busca o total de curtidas e descurtidas de todas as notícias ou de uma notícia específica.
 * Usado exclusivamente pelo painel de administração.
 */
export async function getAdminReactionsStats() {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('id, likes_count, dislikes_count');

    if (!error && Array.isArray(data)) {
      const totalLikes = data.reduce((acc, curr) => acc + (Number(curr.likes_count) || 0), 0);
      const totalDislikes = data.reduce((acc, curr) => acc + (Number(curr.dislikes_count) || 0), 0);
      return { totalLikes, totalDislikes, newsStats: data };
    }
  } catch (e) {
    console.warn('Erro ao obter estatísticas de reações:', e);
  }

  return { totalLikes: 0, totalDislikes: 0, newsStats: [] };
}
