import { api } from '../../../lib/axios';
import type { EditorState, LockRequest, DocumentUpdateRequest } from '../types';

/**
 * Obtém o estado atual do editor do servidor
 */
export const getEditorState = async (): Promise<EditorState> => {
  const response = await api.get<EditorState>('/state');
  return response.data;
};

/**
 * Solicita a aquisição do lock para edição
 */
export const acquireLock = async (clientId: string): Promise<void> => {
  const payload: LockRequest = { client_id: clientId };
  await api.post('/lock/acquire', payload);
};

/**
 * Libera o lock de edição
 */
export const releaseLock = async (clientId: string): Promise<void> => {
  const payload: LockRequest = { client_id: clientId };
  await api.post('/lock/release', payload);
};

/**
 * Atualiza o conteúdo do documento no servidor
 */
export const updateDocument = async (
  clientId: string,
  content: string,
  clientClock: number
): Promise<void> => {
  const payload: DocumentUpdateRequest = {
    client_id: clientId,
    content,
    client_clock: clientClock,
  };
  await api.post('/document/update', payload);
};
