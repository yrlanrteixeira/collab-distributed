import { useEffect, useRef } from 'react';
import { api } from '../../../lib/axios';

const HEARTBEAT_INTERVAL = 5000; // 5 segundos

/**
 * Hook customizado para gerenciar heartbeats periódicos
 *
 * Envia heartbeats para o servidor a cada 5 segundos para indicar
 * que o cliente está ativo/online.
 *
 * Conceito de Sistemas Distribuídos:
 * - Detecção de falhas através de heartbeats
 * - Presença distribuída (quem está online)
 */
export const useHeartbeat = (clientId: string) => {
  const intervalIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Envia heartbeat inicial imediatamente
    sendHeartbeat(clientId);

    // Configura envio periódico de heartbeats
    intervalIdRef.current = setInterval(() => {
      sendHeartbeat(clientId);
    }, HEARTBEAT_INTERVAL);

    // Cleanup: para o envio de heartbeats quando o componente desmonta
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [clientId]);
};

/**
 * Envia um heartbeat para o servidor
 */
const sendHeartbeat = async (clientId: string): Promise<void> => {
  try {
    await api.post('/heartbeat', { client_id: clientId });
    // Heartbeat enviado silenciosamente (não precisa de feedback visual)
  } catch (error) {
    // Falhas de heartbeat são silenciosas para não incomodar o usuário
    // Em produção, você poderia logar isso para debugging
    console.debug('[Heartbeat] Erro ao enviar:', error);
  }
};
