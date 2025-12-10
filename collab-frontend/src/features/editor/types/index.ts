/**
 * Estado do editor retornado pelo servidor
 */
export interface EditorState {
  content: string;
  lock_holder: string | null;
  lamport_clock: number;
}

/**
 * Requisição para adquirir ou liberar o lock
 */
export interface LockRequest {
  client_id: string;
}

/**
 * Requisição para atualizar o documento
 */
export interface DocumentUpdateRequest {
  client_id: string;
  content: string;
  client_clock: number;
}

/**
 * Status do lock para UI
 */
export enum LockStatus {
  FREE = 'free',
  LOCKED_BY_ME = 'locked_by_me',
  LOCKED_BY_OTHER = 'locked_by_other',
}

/**
 * Estado interno do hook useEditor
 */
export interface EditorHookState {
  myId: string;
  content: string;
  lockedBy: string | null;
  serverClock: number;
  localClock: number;
  lockStatus: LockStatus;
  isLoading: boolean;
  error: string | null;
}
