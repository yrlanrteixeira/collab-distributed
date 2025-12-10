import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LockStatus } from '../types';
import { Lock, LockOpen, Users, Clock, Server, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { LockCountdown } from './LockCountdown';

interface StatusPanelProps {
  myId: string;
  lockStatus: LockStatus;
  lockedBy: string | null;
  localClock: number;
  serverClock: number;
  lockAcquiredAt?: number | null;
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
  lockAcquiredAt,
}) => {
  const [prevLocalClock, setPrevLocalClock] = useState(localClock);
  const [prevServerClock, setPrevServerClock] = useState(serverClock);
  const [localClockChanged, setLocalClockChanged] = useState(false);
  const [serverClockChanged, setServerClockChanged] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Detectar mudanças de relógio e animar
  useEffect(() => {
    if (localClock !== prevLocalClock) {
      setLocalClockChanged(true);
      setPrevLocalClock(localClock);
      const timer = setTimeout(() => setLocalClockChanged(false), 600);
      return () => clearTimeout(timer);
    }
  }, [localClock, prevLocalClock]);

  useEffect(() => {
    if (serverClock !== prevServerClock) {
      setServerClockChanged(true);
      setPrevServerClock(serverClock);
      const timer = setTimeout(() => setServerClockChanged(false), 600);
      return () => clearTimeout(timer);
    }
  }, [serverClock, prevServerClock]);

  const clockDifference = Math.abs(localClock - serverClock);
  const isSynchronized = clockDifference === 0;

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

          {/* Lock Countdown */}
          {lockStatus === LockStatus.LOCKED_BY_ME && (
            <LockCountdown
              lockAcquiredAt={lockAcquiredAt || null}
              isLockedByMe={true}
              timeoutSeconds={15}
            />
          )}
        </CardContent>
      </Card>

      {/* Relógios de Lamport Card */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Relógios de Lamport
            {isSynchronized && (
              <CheckCircle className="w-5 h-5 text-green-500 ml-auto" title="Relógios sincronizados" />
            )}
            {!isSynchronized && (
              <AlertCircle className="w-5 h-5 text-yellow-500 ml-auto" title="Relógios dessincronizados" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Relógio Local */}
          <div
            className={cn(
              'p-4 rounded-lg border-2 transition-all duration-500',
              localClockChanged
                ? 'bg-purple-100 dark:bg-purple-900/50 border-purple-400 dark:border-purple-600 shadow-lg scale-105'
                : 'bg-linear-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase">
                Cliente (Local)
              </span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                {localClockChanged && <span className="text-purple-600 font-bold animate-pulse">↑</span>}
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 tabular-nums">
              {localClock}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">seu relógio lógico</p>
          </div>

          {/* Relógio Servidor */}
          <div
            className={cn(
              'p-4 rounded-lg border-2 transition-all duration-500',
              serverClockChanged
                ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-400 dark:border-indigo-600 shadow-lg scale-105'
                : 'bg-linear-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-indigo-200 dark:border-indigo-800'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase">
                Servidor (Remoto)
              </span>
              <div className="flex items-center gap-1">
                <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                {serverClockChanged && <span className="text-indigo-600 font-bold animate-pulse">↑</span>}
              </div>
            </div>
            <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 tabular-nums">
              {serverClock}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">relógio do servidor</p>
          </div>

          {/* Sincronização Status */}
          <div
            className={cn(
              'p-3 rounded-lg border-2 transition-all',
              isSynchronized
                ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-800'
            )}
          >
            <div className="flex items-center gap-2">
              {isSynchronized ? (
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  isSynchronized
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-yellow-700 dark:text-yellow-300'
                )}
              >
                {isSynchronized
                  ? '✓ Relógios sincronizados'
                  : `⚠ Diferença: ${clockDifference} eventos`}
              </span>
            </div>
          </div>

          {/* Info com Tooltip */}
          <div
            className="pt-3 border-t border-gray-200 dark:border-gray-800 cursor-help group"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            title="Clique para saber mais sobre Lamport Clock"
          >
            <div className="relative">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                Os relógios garantem a <strong>ordenação causal</strong> de eventos no sistema distribuído.
                Cada ação incrementa os relógios automaticamente.
              </p>
              {showTooltip && (
                <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded shadow-lg w-48 z-10">
                  <p>
                    <strong>Lamport Clock:</strong> Número que incrementa com cada evento. Se evento A
                    → B, então clock(A) {'<'} clock(B). Garante que é possível determinar a ordem
                    causal dos eventos.
                  </p>
                </div>
              )}
            </div>
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
