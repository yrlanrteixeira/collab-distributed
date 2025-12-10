import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LockStatus } from '../types';
import {
  Lock,
  LockOpen,
  Send,
  FileText,
  CheckCheck,
  Check,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorAreaProps {
  content: string;
  lockStatus: LockStatus;
  isLoading: boolean;
  onContentChange: (content: string) => void;
  onRequestEdit: () => void;
  onSaveAndRelease: () => void;
}

/**
 * Área de edição moderna do documento colaborativo
 */
export const EditorArea: React.FC<EditorAreaProps> = ({
  content,
  lockStatus,
  isLoading,
  onContentChange,
  onRequestEdit,
  onSaveAndRelease,
}) => {
  const canEdit = lockStatus === LockStatus.LOCKED_BY_ME;
  const isFree = lockStatus === LockStatus.FREE;
  const isLockedByOther = lockStatus === LockStatus.LOCKED_BY_OTHER;

  return (
    <Card className="flex flex-col h-full border-2">
      {/* Header */}
      <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-linear-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Documento Colaborativo
          </CardTitle>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Sincronizando...
              </span>
            )}
            <div
              className={cn(
                'w-3 h-3 rounded-full transition-all',
                isFree && 'bg-emerald-500 shadow-lg shadow-emerald-500/50',
                canEdit && 'bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse',
                isLockedByOther && 'bg-red-500 shadow-lg shadow-red-500/50'
              )}
              title={
                isFree
                  ? 'Documento livre'
                  : canEdit
                  ? 'Você está editando'
                  : 'Bloqueado por outro usuário'
              }
            />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
          {isFree && 'Clique em "Solicitar Edição" para começar'}
          {canEdit && 'Editando agora... Salve quando terminar'}
          {isLockedByOther && 'Aguardando liberação do documento'}
        </p>
      </CardHeader>

      {/* Editor Body */}
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-black">
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            disabled={!canEdit}
            placeholder={
              isLockedByOther
                ? '⏳ Aguarde... Outro usuário está editando este documento'
                : isFree
                ? '✏️ Solicite edição para começar a escrever seu conteúdo aqui...'
                : '💡 Digite seu conteúdo aqui...'
            }
            className={cn(
              'w-full h-full resize-none font-mono text-base leading-relaxed',
              'bg-transparent border-none outline-none',
              'placeholder:text-gray-400 dark:placeholder:text-gray-600',
              'transition-all duration-200',
              canEdit
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-500 cursor-not-allowed'
            )}
          />
        </div>

        {/* Status Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-gray-950">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {content.length} caracteres
              </span>
              <span className="flex items-center gap-1.5">
                {canEdit && <CheckCheck className="w-3.5 h-3.5 text-green-500" />}
                {isFree && <LockOpen className="w-3.5 h-3.5 text-emerald-500" />}
                {isLockedByOther && <Lock className="w-3.5 h-3.5 text-red-500" />}
                {canEdit && 'Modificações serão salvas'}
                {isFree && 'Pronto para edição'}
                {isLockedByOther && 'Somente leitura'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Footer com Actions */}
      <div className="border-t-2 border-gray-200 dark:border-gray-800 p-6 bg-linear-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950">
        <div className="flex items-center gap-4">
          {/* Botão Solicitar Edição */}
          {isFree && (
            <Button
              onClick={onRequestEdit}
              disabled={isLoading}
              size="lg"
              className="flex-1 h-12 text-base"
            >
              <LockOpen className="w-5 h-5" />
              Solicitar Edição
            </Button>
          )}

          {/* Botão Salvar e Liberar */}
          {canEdit && (
            <Button
              onClick={onSaveAndRelease}
              disabled={isLoading}
              variant="success"
              size="lg"
              className="flex-1 h-12 text-base"
            >
              <Send className="w-5 h-5" />
              Salvar e Liberar
            </Button>
          )}

          {/* Mensagem de Bloqueio */}
          {isLockedByOther && (
            <div className="flex-1 flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-900 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="font-semibold text-red-800 dark:text-red-300">
                Documento bloqueado por outro usuário
              </span>
            </div>
          )}
        </div>

        {/* Dica de Uso */}
        {!isLockedByOther && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
              <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                {isFree && (
                  <>
                    <strong>Dica:</strong> Ao solicitar edição, você terá controle exclusivo do
                    documento. Outros usuários verão as atualizações em tempo real.
                  </>
                )}
                {canEdit && (
                  <>
                    <strong>Editando:</strong> Suas alterações serão sincronizadas automaticamente
                    ao salvar. Não se esqueça de liberar quando terminar!
                  </>
                )}
              </span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
