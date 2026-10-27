import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const ColumnistsContext = createContext(null);

const STORAGE_KEY = 'jc_columnists';

export function ColumnistsProvider({ children }) {
  const [columnists, setColumnists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar colunistas do Supabase ou localStorage
  const fetchColumnists = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('columnists')
        .select('*')
        .order('name');

      if (!error && data && data.length > 0) {
        setColumnists(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        // Fallback para localStorage
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          try {
            setColumnists(JSON.parse(local));
          } catch (e) {
            setColumnists([]);
          }
        } else if (data) {
          setColumnists(data);
        }
      }
    } catch (err) {
      console.warn('Usando armazenamento local de colunistas:', err.message);
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        try {
          setColumnists(JSON.parse(local));
        } catch (e) {
          setColumnists([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColumnists();
  }, [fetchColumnists]);

  // Adicionar colunista
  const addColumnist = useCallback(async (newColumnist) => {
    const columnistData = {
      name: newColumnist.name,
      avatar_url: newColumnist.avatar_url || '',
      bio: newColumnist.bio || '',
      role: newColumnist.role || 'Colunista',
    };

    let created = null;

    try {
      const { data, error } = await supabase
        .from('columnists')
        .insert(columnistData)
        .select()
        .single();

      if (!error && data) {
        created = data;
      }
    } catch (err) {
      console.warn('Erro ao inserir colunista no Supabase, salvando localmente:', err.message);
    }

    if (!created) {
      created = {
        ...columnistData,
        id: crypto.randomUUID ? crypto.randomUUID() : `col_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
    }

    setColumnists(prev => {
      const updated = [created, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return created;
  }, []);

  // Atualizar colunista
  const updateColumnist = useCallback(async (id, updates) => {
    let updatedData = null;

    try {
      const { data, error } = await supabase
        .from('columnists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        updatedData = data;
      }
    } catch (err) {
      console.warn('Erro ao atualizar colunista no Supabase, atualizando localmente:', err.message);
    }

    setColumnists(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          return updatedData || { ...c, ...updates };
        }
        return c;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return updatedData || updates;
  }, []);

  // Excluir colunista
  const deleteColumnist = useCallback(async (id) => {
    try {
      await supabase
        .from('columnists')
        .delete()
        .eq('id', id);
    } catch (err) {
      console.warn('Erro ao excluir no Supabase:', err.message);
    }

    setColumnists(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Buscar colunista por ID
  const getColumnistById = useCallback((id) => {
    return columnists.find(c => c.id === id);
  }, [columnists]);

  const value = {
    columnists,
    loading,
    addColumnist,
    updateColumnist,
    deleteColumnist,
    getColumnistById,
    refetch: fetchColumnists,
  };

  return (
    <ColumnistsContext.Provider value={value}>
      {children}
    </ColumnistsContext.Provider>
  );
}

export function useColumnistsContext() {
  const context = useContext(ColumnistsContext);
  if (!context) {
    throw new Error('useColumnistsContext must be used within a ColumnistsProvider');
  }
  return context;
}

export default ColumnistsContext;
