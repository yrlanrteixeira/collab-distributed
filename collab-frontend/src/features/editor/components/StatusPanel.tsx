import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LockStatus } from '../types';
import { Lock, LockOpen, Users, Clock, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusPanelProps {
  myId: string;
  lockStatus: LockStatus;
  lockedBy: string | null;
  localClock: number;
  serverClock: number;
}

/**
 * Painel moderno que exibe informações de status do editor colaborativo
 */
export const StatusPanel: React.FC<StatusPanelProps> = ({
  myId,
  lockStatus,
  lockedBy,
  localClock,
  serverClock,
}) => {
  const getStatusConfig = () => {
    switch (lockStatus) {
      case LockStatus.FREE:
        return {
          text: 'Disponível',
          icon: LockOpen,
          gradient: 'from-emerald-500 to-green-600',
          bgColor: 'bg-linear-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
          borderColor: 'border-emerald-300 dark:border-emerald-700',
          textColor: 'text-emerald-700 dark:text-emerald-300',
        };
      case LockStatus.LOCKED_BY_ME:
        return {
          text: 'Você está editando',
          icon: Lock,
          gradient: 'from-blue-500 to-indigo-600',
          bgColor: 'bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
          borderColor: 'border-blue-300 dark:border-blue-700',
          textColor: 'text-blue-700 dark:text-blue-300',
        };
      case LockStatus.LOCKED_BY_OTHER:
        return {
          text: 'Bloqueado',
          icon: Lock,
          gradient: 'from-red-500 to-rose-600',
          bgColor: 'bg-linear-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
          borderColor: 'border-red-300 dark:border-red-700',
          textColor: 'text-red-700 dark:text-red-300',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="overflow-hidden border-2">
        <div className={cn('h-2 bg-linear-to-r', statusConfig.gradient)} />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Status da Sessão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ID do Usuário */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Seu ID
            </label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <code className="text-sm font-mono text-gray-900 dark:text-gray-100 flex-1">
                {myId.substring(0, 8)}...
              </code>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>

          {/* Status do Lock */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Status do Editor
            </label>
            <div
              className={cn(
                'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                statusConfig.bgColor,
                statusConfig.borderColor
              )}
            >
              <StatusIcon className={cn('w-6 h-6', statusConfig.textColor)} />
              <div className="flex-1">
                <p className={cn('font-semibold text-sm', statusConfig.textColor)}>
                  {statusConfig.text}
                </p>
                {lockStatus === LockStatus.LOCKED_BY_ME && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Salvará automaticamente ao liberar
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bloqueado por outro usuário */}
          {lockedBy && lockStatus === LockStatus.LOCKED_BY_OTHER && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
              <p className="text-xs font-medium text-red-800 dark:text-red-300">
                Bloqueado por:{' '}
                <code className="font-mono bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded">
                  {lockedBy.substring(0, 8)}...
                </code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relógios de Lamport Card */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Relógios de Lamport
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Relógio Local */}
          <div className="p-4 bg-linear-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-lg border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase">
                Cliente (Local)
              </span>
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 tabular-nums">
              {localClock}
            </p>
          </div>

          {/* Relógio Servidor */}
          <div className="p-4 bg-linear-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase">
                Servidor (Remoto)
              </span>
              <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 tabular-nums">
              {serverClock}
            </p>
          </div>

          {/* Info sobre Lamport */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Os relógios garantem a <strong>ordenação causal</strong> de eventos no sistema
              distribuído.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-2 border-gray-200 dark:border-gray-800 bg-linear-to-br from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            ℹ️ Como funciona
          </h3>
          <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Sincronização automática a cada segundo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Apenas um usuário edita por vez (exclusão mútua)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">•</span>
              <span>Relógios de Lamport para ordenação de eventos</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
