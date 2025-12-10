import { useEditor } from './hooks/useEditor';
import { StatusPanel } from './components/StatusPanel';
import { EditorArea } from './components/EditorArea';
import { Network, X, Sparkles } from 'lucide-react';

/**
 * Feature principal do Editor Colaborativo com design moderno
 */
export const EditorFeature: React.FC = () => {
  const {
    myId,
    content,
    lockedBy,
    serverClock,
    localClock,
    lockStatus,
    lockAcquiredAt,
    isLoading,
    error,
    requestEdit,
    saveAndRelease,
    updateContent,
    clearError,
  } = useEditor();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-950 dark:via-slate-950 dark:to-zinc-950">
      {/* Header com gradiente */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Editor Colaborativo
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Sistema Distribuído • Relógio de Lamport • Exclusão Mútua
                </p>
              </div>
            </div>

            {/* Badge de Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Conectado
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-900 rounded-xl p-4 shadow-lg animate-in slide-in-from-top">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-red-900 dark:text-red-300 mb-1">
                  Erro de Comunicação
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                aria-label="Fechar erro"
              >
                <X className="w-5 h-5 text-red-700 dark:text-red-400" />
              </button>
            </div>
          </div>
        )}

        {/* Layout Grid Responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar: Status Panel (1/3 em lg) */}
          <aside className="lg:col-span-4">
            <StatusPanel
              myId={myId}
              lockStatus={lockStatus}
              lockedBy={lockedBy}
              localClock={localClock}
              serverClock={serverClock}
              lockAcquiredAt={lockAcquiredAt}
            />
          </aside>

          {/* Main: Editor Area (2/3 em lg) */}
          <section className="lg:col-span-8">
            <div className="h-[calc(100vh-12rem)]">
              <EditorArea
                content={content}
                lockStatus={lockStatus}
                isLoading={isLoading}
                onContentChange={updateContent}
                onRequestEdit={requestEdit}
                onSaveAndRelease={saveAndRelease}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <p className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Sistema de Computação Distribuída
            </p>
            <p className="text-xs">
              Implementação de{' '}
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                Relógio Lógico de Lamport
              </span>{' '}
              e{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Exclusão Mútua Distribuída
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
