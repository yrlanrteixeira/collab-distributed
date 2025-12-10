import { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LockCountdownProps {
  lockAcquiredAt: number | null;
  isLockedByMe: boolean;
  timeoutSeconds?: number;
}

/**
 * Componente que exibe um countdown visual do timeout do lock
 * Mostra uma barra de progresso e tempo restante
 */
export const LockCountdown: React.FC<LockCountdownProps> = ({
  lockAcquiredAt,
  isLockedByMe,
  timeoutSeconds = 15,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeoutSeconds);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!lockAcquiredAt || !isLockedByMe) {
      setTimeRemaining(timeoutSeconds);
      setIsWarning(false);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const elapsed = (now - lockAcquiredAt) / 1000; // em segundos
      const remaining = Math.max(0, timeoutSeconds - elapsed);

      setTimeRemaining(remaining);
      setIsWarning(remaining < 5); // Aviso quando < 5 segundos
    };

    // Atualiza a cada 100ms para fluidez
    const interval = setInterval(updateCountdown, 100);
    updateCountdown(); // Executa imediatamente

    return () => clearInterval(interval);
  }, [lockAcquiredAt, isLockedByMe, timeoutSeconds]);

  if (!isLockedByMe) {
    return null; // Não mostra se não é você que tem o lock
  }

  // Calcula percentual de progresso (0-100)
  const progress = ((timeoutSeconds - timeRemaining) / timeoutSeconds) * 100;

  // Define cores baseado no tempo restante
  const getColor = () => {
    if (timeRemaining > 10) return 'bg-green-500'; // Verde
    if (timeRemaining > 5) return 'bg-yellow-500'; // Amarelo
    return 'bg-red-500'; // Vermelho quando < 5s
  };

  const getTextColor = () => {
    if (timeRemaining > 10) return 'text-green-700 dark:text-green-300';
    if (timeRemaining > 5) return 'text-yellow-700 dark:text-yellow-300';
    return 'text-red-700 dark:text-red-300';
  };

  const getBgColor = () => {
    if (timeRemaining > 10) return 'bg-green-50 dark:bg-green-950/20';
    if (timeRemaining > 5) return 'bg-yellow-50 dark:bg-yellow-950/20';
    return 'bg-red-50 dark:bg-red-950/20';
  };

  const getBorderColor = () => {
    if (timeRemaining > 10) return 'border-green-300 dark:border-green-800';
    if (timeRemaining > 5) return 'border-yellow-300 dark:border-yellow-800';
    return 'border-red-300 dark:border-red-800';
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 transition-all',
        getBgColor(),
        getBorderColor()
      )}
    >
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Clock className={cn('w-4 h-4', getTextColor())} />
          <span className={cn('text-xs font-semibold uppercase tracking-wide', getTextColor())}>
            {isWarning ? '⚠ Timeout Próximo' : '🔒 Lock Ativo'}
          </span>
        </div>
        <span className={cn('text-sm font-bold ml-auto', getTextColor())}>
          {Math.ceil(timeRemaining)}s
        </span>
      </div>

      {/* Barra de Progresso */}
      <div className="mb-3">
        <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
          <div
            className={cn(
              'h-full transition-all duration-100',
              getColor(),
              isWarning && 'animate-pulse'
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between">
        <span className={cn('text-xs font-medium', getTextColor())}>
          Timeout: {timeoutSeconds}s
        </span>
        <span className={cn('text-xs', getTextColor())}>
          {Math.ceil(timeRemaining)}s restantes
        </span>
      </div>

      {/* Aviso quando tempo está acabando */}
      {isWarning && (
        <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-300 font-medium">
            Seu lock expira em {Math.ceil(timeRemaining)} segundos! Salve suas mudanças.
          </p>
        </div>
      )}

      {/* Info extra */}
      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          O sistema revoga locks inativos para evitar travamentos.{' '}
          <strong>Clique em "Salvar" para manter o lock renovado.</strong>
        </p>
      </div>
    </div>
  );
};
