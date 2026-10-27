import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const NewsContext = createContext(null);
const STORAGE_KEY = 'jc_news_cache';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getInitialNews = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar cache local de notícias:', e);
  }
  return [];
};

export function NewsProvider({ children }) {
  const [news, setNews] = useState(getInitialNews);
  const [loading, setLoading] = useState(() => getInitialNews().length === 0);

  // Fallback direto via REST API pura (compatível com Chrome no Windows 7 caso a lib supabase falhe)
  const fetchFromRestApi = async () => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    const url = `${supabaseUrl}/rest/v1/news?select=*&order=published_at.desc.nullslast`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Accept': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  };

  // Salvar no localStorage de forma segura (com fallback se o conteúdo exceder a cota)
  const saveToStorage = (articles) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    } catch (e) {
      try {
        const lightweight = articles.map(n => ({
          ...n,
          content: n.content ? n.content.substring(0, 500) : '',
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
      } catch (e2) {
        console.warn('Não foi possível armazenar notícias no localStorage:', e2);
      }
    }
  };

  // Carregar notícias do Supabase ou fallback REST
  const fetchNews = useCallback(async () => {
    let rawData = null;

    // Tentativa 1: Via cliente Supabase
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false });

      if (!error && data && data.length > 0) {
        rawData = data;
      } else if (error) {
        throw error;
      }
    } catch (err) {
      console.warn('Tentando fallback REST para notícias no navegador legado:', err.message);
      // Tentativa 2: Fallback direto via fetch HTTP REST
      try {
        const restData = await fetchFromRestApi();
        if (Array.isArray(restData) && restData.length > 0) {
          rawData = restData;
        }
      } catch (restErr) {
        console.error('Falha também no fallback REST de notícias:', restErr.message);
      }
    }

    if (rawData && Array.isArray(rawData) && rawData.length > 0) {
      const normalizedData = rawData.map(item => {
        const images = Array.isArray(item.images) && item.images.length > 0
          ? item.images
          : (item.image_url ? [item.image_url] : []);

        const normalized = {
          ...item,
          images,
        };

        if (item.columnist_id || item.columnist_name) {
          return { ...normalized, category: 'colunistas' };
        }
        return normalized;
      });
      setNews(normalizedData);
      saveToStorage(normalizedData);
    } else {
      // Se a rede falhar totalmente, garantir que o cache local seja preservado
      const cached = getInitialNews();
      if (cached.length > 0) {
        setNews(cached);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNews();

    // Realtime: escutar mudanças na tabela news de forma isolada e segura
    let channel = null;
    try {
      channel = supabase
        .channel('news-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => {
          fetchNews();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime indisponível neste navegador:', e);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {}
      }
    };
  }, [fetchNews]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const addNews = useCallback(async (newArticle) => {
    const isColumnist = Boolean(newArticle.columnist_id) || Boolean(newArticle.columnist_name);
    const category = isColumnist ? 'colunistas' : (newArticle.category || 'geral');

    const imagesArray = Array.isArray(newArticle.images) && newArticle.images.length > 0
      ? newArticle.images
      : (newArticle.image_url ? [newArticle.image_url] : []);
    const coverUrl = imagesArray[0] || newArticle.image_url || '';

    const article = {
      title: newArticle.title,
      subtitle: newArticle.subtitle,
      content: newArticle.content,
      category,
      image_url: coverUrl,
      images: imagesArray,
      author: newArticle.author,
      status: newArticle.status || 'draft',
      featured: newArticle.featured || false,
      show_on_home: newArticle.show_on_home !== undefined ? Boolean(newArticle.show_on_home) : true,
      home_order: Number(newArticle.home_order) || 0,
      columnist_id: newArticle.columnist_id || null,
      columnist_name: newArticle.columnist_name || null,
      columnist_avatar: newArticle.columnist_avatar || null,
      columnist_bio: newArticle.columnist_bio || null,
      columnist_role: newArticle.columnist_role || null,
      slug: generateSlug(newArticle.title),
      published_at: newArticle.status === 'published'
        ? (newArticle.published_at || new Date().toISOString())
        : null,
    };

    let { data, error } = await supabase
      .from('news')
      .insert(article)
      .select()
      .single();

    // Fallback caso a coluna 'images' ainda não tenha sido criada no Supabase
    if (error && error.message && error.message.includes('images')) {
      console.warn('Coluna "images" ainda não existe no Supabase. Salvando apenas image_url...');
      const { images: _unused, ...articleWithoutImages } = article;
      const retry = await supabase
        .from('news')
        .insert(articleWithoutImages)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Erro ao criar notícia:', error.message);
      throw error;
    }

    const savedArticle = {
      ...data,
      images: data.images || imagesArray,
      category: (data.columnist_id || data.columnist_name) ? 'colunistas' : data.category,
    };

    setNews(prev => {
      const updated = [savedArticle, ...prev];
      saveToStorage(updated);
      return updated;
    });
    return savedArticle;
  }, []);

  const updateNews = useCallback(async (id, updates) => {
    const updateData = { ...updates };
    
    if (updates.title) {
      updateData.slug = generateSlug(updates.title);
    }

    if (updates.images && Array.isArray(updates.images)) {
      if (!updates.image_url && updates.images.length > 0) {
        updateData.image_url = updates.images[0];
      }
    }

    if (updates.columnist_id || updates.columnist_name) {
      if (!updates.category || updates.category === 'variedades') {
        updateData.category = 'colunistas';
      }
    }
    
    if (updates.status === 'published') {
      const current = news.find(n => n.id === id);
      if (current && !current.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    let { data, error } = await supabase
      .from('news')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    // Fallback caso a coluna 'images' ainda não tenha sido criada no Supabase
    if (error && error.message && error.message.includes('images')) {
      console.warn('Coluna "images" ainda não existe no Supabase. Atualizando sem campo images...');
      const { images: _unused, ...updateWithoutImages } = updateData;
      const retry = await supabase
        .from('news')
        .update(updateWithoutImages)
        .eq('id', id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Erro ao atualizar notícia:', error.message);
      throw error;
    }

    const updatedArticle = {
      ...data,
      images: data.images || updates.images || (data.image_url ? [data.image_url] : []),
      category: (data.columnist_id || data.columnist_name) ? 'colunistas' : data.category,
    };

    setNews(prev => {
      const updated = prev.map(item => item.id === id ? updatedArticle : item);
      saveToStorage(updated);
      return updated;
    });
    return updatedArticle;
  }, [news]);

  const deleteNews = useCallback(async (id) => {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir notícia:', error.message);
      throw error;
    }

    setNews(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const getNewsById = useCallback((id) => {
    return news.find(item => item.id === id);
  }, [news]);

  const getNewsBySlug = useCallback((slug) => {
    return news.find(item => item.slug === slug);
  }, [news]);

  const getNewsByCategory = useCallback((category) => {
    return news
      .filter(item => {
        if (item.status !== 'published') return false;

        const isColumnistArticle = item.category === 'colunistas' || Boolean(item.columnist_id) || Boolean(item.columnist_name);

        if (category === 'colunistas') {
          return isColumnistArticle;
        }

        if (category === 'variedades') {
          return item.category === 'variedades' && !isColumnistArticle;
        }

        return item.category === category;
      })
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  }, [news]);

  const getAllColumnistNews = useCallback(() => {
    return news
      .filter(item =>
        item.status === 'published' &&
        (item.category === 'colunistas' || Boolean(item.columnist_id) || Boolean(item.columnist_name))
      )
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  }, [news]);

  const getPublishedNews = useCallback(() => {
    return news
      .filter(item => item.status === 'published')
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  }, [news]);

  const getFeaturedNews = useCallback(() => {
    return news
      .filter(item => item.featured && item.status === 'published' && item.show_on_home !== false)
      .sort((a, b) => {
        const orderA = (a.home_order && Number(a.home_order) > 0) ? Number(a.home_order) : 999999;
        const orderB = (b.home_order && Number(b.home_order) > 0) ? Number(b.home_order) : 999999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.published_at || 0) - new Date(a.published_at || 0);
      });
  }, [news]);

  const getHomeNews = useCallback(() => {
    return news
      .filter(item => item.show_on_home && item.status === 'published')
      .sort((a, b) => {
        // Notícias com home_order > 0 têm prioridade fixa (1, 2, 3...)
        // Notícias sem ordem definida (0, null, undefined) ficam depois, ordenadas por data mais recente
        const orderA = (a.home_order && Number(a.home_order) > 0) ? Number(a.home_order) : 999999;
        const orderB = (b.home_order && Number(b.home_order) > 0) ? Number(b.home_order) : 999999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.published_at || 0) - new Date(a.published_at || 0);
      });
  }, [news]);

  const searchNews = useCallback((query) => {
    const q = query.toLowerCase();
    return news
      .filter(item =>
        item.status === 'published' && (
          item.title.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
          (item.content && item.content.toLowerCase().includes(q)) ||
          (item.author && item.author.toLowerCase().includes(q))
        )
      )
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  }, [news]);

  const getAllNews = useCallback(() => {
    return [...news].sort(
      (a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0)
    );
  }, [news]);

  const getStats = useCallback(() => {
    const published = news.filter(n => n.status === 'published');
    const drafts = news.filter(n => n.status === 'draft');
    const today = new Date().toDateString();
    const publishedToday = published.filter(n =>
      n.published_at && new Date(n.published_at).toDateString() === today
    );

    return {
      total: news.length,
      published: published.length,
      drafts: drafts.length,
      publishedToday: publishedToday.length,
    };
  }, [news]);

  const getNewsByColumnist = useCallback((columnistId, columnistName) => {
    return news
      .filter(item =>
        item.status === 'published' && (
          (columnistId && (item.columnist_id === columnistId || String(item.columnist_id) === String(columnistId))) ||
          (columnistName && item.columnist_name && item.columnist_name.toLowerCase() === columnistName.toLowerCase())
        )
      )
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  }, [news]);

  const value = {
    news,
    loading,
    addNews,
    updateNews,
    deleteNews,
    getNewsById,
    getNewsBySlug,
    getNewsByCategory,
    getNewsByColumnist,
    getAllColumnistNews,
    getPublishedNews,
    getFeaturedNews,
    getHomeNews,
    searchNews,
    getAllNews,
    getStats,
    refetch: fetchNews,
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNewsContext() {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNewsContext must be used within a NewsProvider');
  }
  return context;
}

export default NewsContext;
