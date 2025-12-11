import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Edit3, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStatistics } from '../hooks/useStatistics';
import { useEffect, useState } from 'react';

/**
 * Componente que exibe contador de usuários ativos e estatísticas do sistema
 *
 * Demonstra o conceito de presença distribuída em sistemas distribuídos:
 * - Detecção de quais clientes estão online (via heartbeats)
 * - Métricas agregadas do sistema
 * - Estado compartilhado entre múltiplos nós
 */
export const ActiveUsersCounter: React.FC = () => {
  const { stats, isLoading } = useStatistics();
  const [prevCount, setPrevCount] = useState(stats.active_clients_count);
  const [countChanged, setCountChanged] = useState(false);

  // Anima quando o número de usuários muda
  useEffect(() => {
    if (stats.active_clients_count !== prevCount) {
      setCountChanged(true);
      setPrevCount(stats.active_clients_count);
      const timer = setTimeout(() => setCountChanged(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [stats.active_clients_count, prevCount]);

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Activity className="w-5 h-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Carregando estatísticas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Presença Distribuída
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contador Principal de Usuários Ativos */}
        <div
          className={cn(
            'p-6 rounded-xl border-2 transition-all duration-500',
            countChanged
              ? 'bg-green-100 dark:bg-green-900/50 border-green-400 dark:border-green-600 shadow-lg scale-105'
              : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
              Usuários Online
            </span>
            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-bold text-green-900 dark:text-green-100 tabular-nums">
              {stats.active_clients_count}
            </p>
            {countChanged && (
              <span className="text-green-600 dark:text-green-400 font-bold text-2xl animate-bounce">
                ↑
              </span>
            )}
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            {stats.active_clients_count === 1 ? 'usuário ativo' : 'usuários ativos'}
          </p>
        </div>

        {/* Grid de Estatísticas */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total de Edições */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase">
                Edições
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 tabular-nums">
              {stats.total_edits}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">total</p>
          </div>

          {/* Total de Clientes */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase">
                Visitantes
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 tabular-nums">
              {stats.total_clients_ever}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">únicos</p>
          </div>
        </div>

        {/* Lista de Clientes Ativos (IDs truncados) */}
        {stats.active_clients.length > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Clientes Conectados
            </p>
            <div className="flex flex-wrap gap-2">
              {stats.active_clients.map((clientId) => (
                <div
                  key={clientId}
                  className="px-2 py-1 bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded-md"
                >
                  <code className="text-xs font-mono text-green-800 dark:text-green-300">
                    {clientId.substring(0, 8)}...
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explicação do Conceito */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong className="text-gray-900 dark:text-gray-100">Heartbeat:</strong> Clientes enviam
            sinais a cada 5s. Se não recebermos heartbeat por 30s, o cliente é considerado offline
            (detecção de falhas).
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
