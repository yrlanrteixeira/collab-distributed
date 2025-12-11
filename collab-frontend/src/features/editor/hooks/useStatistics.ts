import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../lib/axios';

const STATS_POLLING_INTERVAL = 2000; // 2 segundos

export interface Statistics {
  active_clients_count: number;
  active_clients: string[];
  total_edits: number;
  total_clients_ever: number;
  current_lock_holder: string | null;
  lamport_clock: number;
}

/**
 * Hook customizado para buscar estatísticas do sistema
 *
 * Faz polling das estatísticas a cada 2 segundos para mostrar
 * informações em tempo real sobre o sistema distribuído.
 */
export const useStatistics = () => {
  const [stats, setStats] = useState<Statistics>({
    active_clients_count: 0,
    active_clients: [],
    total_edits: 0,
    total_clients_ever: 0,
    current_lock_holder: null,
    lamport_clock: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await api.get<Statistics>('/stats');
      setStats(response.data);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar estatísticas');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Busca inicial
    fetchStatistics();

    // Configura polling a cada 2 segundos
    const intervalId = setInterval(fetchStatistics, STATS_POLLING_INTERVAL);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [fetchStatistics]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStatistics,
  };
};
