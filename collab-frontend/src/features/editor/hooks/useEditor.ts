import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as editorApi from '../services/editorApi';
import { LockStatus, type EditorHookState } from '../types';
import { computeSHA256 } from '../../../lib/hashUtils';

const POLLING_INTERVAL = 1000; // 1 segundo

/**
 * Hook customizado para gerenciar o estado do editor colaborativo
 * Implementa Relógio Lógico de Lamport, polling e detecção de conflitos
 */
export const useEditor = () => {
  // Gera e persiste o ID do cliente (único para esta sessão)
  const myIdRef = useRef<string>(uuidv4());
  const myId = myIdRef.current;

  const [state, setState] = useState<EditorHookState>({
    myId,
    content: '',
    lockedBy: null,
    serverClock: 0,
    localClock: 0,
    lockStatus: LockStatus.FREE,
    lockAcquiredAt: null,
    isLoading: true,
    error: null,
  });

  // Ref para armazenar o conteúdo local (durante edição)
  const localContentRef = useRef<string>('');
  
  // Ref para armazenar o hash do conteúdo quando o cliente adquiriu o lock
  const contentHashWhenLockedRef = useRef<string | undefined>(undefined);

  /**
   * Calcula o status do lock baseado no locked_by
   */
  const calculateLockStatus = useCallback(
    (lockedBy: string | null): LockStatus => {
      if (!lockedBy) return LockStatus.FREE;
      if (lockedBy === myId) return LockStatus.LOCKED_BY_ME;
      return LockStatus.LOCKED_BY_OTHER;
    },
    [myId]
  );

  /**
   * Polling: busca o estado do servidor periodicamente
   * Implementa a Regra de Lamport para leitura:
   * local_clock = max(local_clock, server_clock) + 1
   */
  const fetchState = useCallback(async () => {
    try {
      const serverState = await editorApi.getEditorState();

      setState((prev) => {
        // Regra de Lamport (Leitura)
        const newLocalClock = Math.max(prev.localClock, serverState.lamport_clock) + 1;

        const newLockStatus = calculateLockStatus(serverState.lock_holder);

        // Se não estou editando (sem lock), atualiza o conteúdo local
        const shouldUpdateContent = newLockStatus !== LockStatus.LOCKED_BY_ME;

        return {
          ...prev,
          content: shouldUpdateContent ? serverState.content : prev.content,
          lockedBy: serverState.lock_holder,
          serverClock: serverState.lamport_clock,
          localClock: newLocalClock,
          lockStatus: newLockStatus,
          lockAcquiredAt: serverState.lock_acquired_at ? serverState.lock_acquired_at * 1000 : null,
          isLoading: false,
          error: null,
        };
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar estado',
      }));
    }
  }, [calculateLockStatus]);

  /**
   * Inicia o polling quando o componente monta
   */
  useEffect(() => {
    // Busca inicial
    fetchState();

    // Configura polling a cada 1 segundo
    const intervalId = setInterval(fetchState, POLLING_INTERVAL);

    // Cleanup: para o polling quando o componente desmonta
    return () => clearInterval(intervalId);
  }, [fetchState]);

  /**
   * Solicita o lock para edição
   * Armazena o hash do conteúdo atual para detectar conflitos depois
   */
  const requestEdit = useCallback(async () => {
    try {
      await editorApi.acquireLock(myId);
      
      // Armazena o conteúdo e seu hash quando o lock é adquirido
      localContentRef.current = state.content;
      contentHashWhenLockedRef.current = await computeSHA256(state.content);
      
      // O polling irá atualizar o estado automaticamente
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao solicitar edição',
      }));
    }
  }, [myId, state.content]);

  /**
   * Salva as alterações e libera o lock
   * Implementa a Regra de Lamport para escrita:
   * local_clock = local_clock + 1 (antes de enviar)
   * Também envia o hash para detectar conflitos
   */
  const saveAndRelease = useCallback(async () => {
    try {
      // Incrementa o relógio local antes de enviar (Regra de Lamport - Escrita)
      const newLocalClock = state.localClock + 1;

      // Envia atualização com o novo relógio e hash do conteúdo ao adquirir lock
      const response = await editorApi.updateDocument(
        myId,
        state.content,
        newLocalClock,
        contentHashWhenLockedRef.current
      );

      // Atualiza o relógio local no estado
      setState((prev) => ({
        ...prev,
        localClock: newLocalClock,
        // Se detectou conflito, mostra erro ao usuário
        error: response.conflict_detected
          ? 'Aviso: O documento foi modificado por outro cliente enquanto você editava. Suas alterações foram salvas, mas verifique o conteúdo.'
          : null,
      }));

      // Libera o lock
      await editorApi.releaseLock(myId);
      
      // Limpa o hash armazenado
      contentHashWhenLockedRef.current = undefined;

      // O polling irá atualizar o estado automaticamente
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao salvar documento',
      }));
    }
  }, [myId, state.content, state.localClock]);

  /**
   * Atualiza o conteúdo local (durante edição)
   */
  const updateContent = useCallback((newContent: string) => {
    setState((prev) => ({
      ...prev,
      content: newContent,
    }));
  }, []);

  /**
   * Limpa mensagens de erro
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    // Estado
    myId: state.myId,
    content: state.content,
    lockedBy: state.lockedBy,
    serverClock: state.serverClock,
    localClock: state.localClock,
    lockStatus: state.lockStatus,
    lockAcquiredAt: state.lockAcquiredAt,
    isLoading: state.isLoading,
    error: state.error,

    // Ações
    requestEdit,
    saveAndRelease,
    updateContent,
    clearError,

    // Flags úteis para UI
    canEdit: state.lockStatus === LockStatus.LOCKED_BY_ME,
    isFree: state.lockStatus === LockStatus.FREE,
    isLockedByOther: state.lockStatus === LockStatus.LOCKED_BY_OTHER,
  };
};
