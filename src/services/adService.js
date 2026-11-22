import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'jc_ads_cache';

const DEFAULT_ADS = [
  {
    id: 'ad_home_1',
    title: 'Anúncio 1 (Após a 3ª notícia)',
    position: 1,
    image_url: '',
    is_active: true,
  },
  {
    id: 'ad_home_2',
    title: 'Anúncio 2 (Após mais três notícias)',
    position: 2,
    image_url: '',
    is_active: true,
  },
];

/**
 * Obtém os anúncios do cache local com fallback inicial
 */
function getCachedAds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler cache de anúncios:', e);
  }
  return DEFAULT_ADS;
}

/**
 * Salva os anúncios no cache local
 */
function setCachedAds(ads) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
  } catch (e) {
    console.warn('Erro ao salvar cache de anúncios:', e);
  }
}

/**
 * Busca todos os anúncios configurados (do Supabase com fallback local)
 */
export async function getAds() {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('position', { ascending: true, nullsFirst: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      // Mescla com defaults caso falte algum
      const merged = DEFAULT_ADS.map(def => {
        const found = data.find(d => d.id === def.id);
        return found ? { ...def, ...found } : def;
      });
      setCachedAds(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Supabase indisponível para anúncios, usando cache local:', err?.message || err);
  }

  return getCachedAds();
}

/**
 * Atualiza um anúncio específico por ID no Supabase e no cache local
 * Retorna o status detalhado da sincronização com o banco
 */
export async function updateAd(adId, updates) {
  const currentAds = getCachedAds();
  const updatedAds = currentAds.map(item => {
    if (item.id === adId) {
      return { ...item, ...updates, updated_at: new Date().toISOString() };
    }
    return item;
  });

  // Salva no cache local imediatamente (garante alta responsividade na interface)
  setCachedAds(updatedAds);

  let syncedWithDb = false;
  let dbError = null;

  // Persiste no banco Supabase
  try {
    const targetAd = updatedAds.find(item => item.id === adId);
    if (targetAd) {
      const { error } = await supabase
        .from('ads')
        .upsert({
          id: targetAd.id,
          title: targetAd.title,
          position: targetAd.position || (adId === 'ad_home_1' ? 1 : 2),
          image_url: targetAd.image_url || '',
          is_active: targetAd.is_active !== false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        dbError = error.message;
        console.warn('Erro ao salvar anúncio no Supabase:', error.message);
      } else {
        syncedWithDb = true;
      }
    }
  } catch (err) {
    dbError = err?.message || 'Falha de comunicação com o Supabase';
    console.warn('Falha na requisição Supabase de anúncio:', dbError);
  }

  return {
    ads: updatedAds,
    syncedWithDb,
    dbError,
  };
}
