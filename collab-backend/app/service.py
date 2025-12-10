"""
Service Layer - Implementação dos Algoritmos de Sistemas Distribuídos
Contém toda a lógica de negócio do Editor Colaborativo
"""
import time
import hashlib
from typing import Optional
from threading import Lock as ThreadLock


class CollaborativeEditorService:
    """
    Classe que gerencia o estado compartilhado do documento e implementa
    os três algoritmos de sistemas distribuídos:
    1. Exclusão Mútua (Lock Centralizado)
    2. Relógios Lógicos de Lamport
    3. Tratamento de Falhas (Timeout/Heartbeat)
    """

    def __init__(self, timeout_seconds: int = 15):
        # Estado do documento
        self.document_content: str = ""

        # ===== DETECÇÃO DE CONFLITOS =====
        # Hash SHA-256 do conteúdo do documento
        # Usado para detectar mudanças entre quando cliente adquiriu lock e quando tenta salvar
        self.document_hash: str = self._compute_hash("")

        # ===== ALGORITMO 1: EXCLUSÃO MÚTUA (LOCK CENTRALIZADO) =====
        # O servidor mantém o controle de um "token" ou "lock" de edição.
        # Apenas um cliente pode ter o lock por vez.
        self.lock_holder: Optional[str] = None  # ID do cliente que possui o lock
        self.lock_acquired_at: Optional[float] = None  # Timestamp de quando o lock foi adquirido

        # ThreadLock para garantir operações atômicas (thread-safety)
        # Isso evita race conditions quando múltiplas requisições chegam simultaneamente
        self._thread_lock = ThreadLock()

        # ===== ALGORITMO 2: RELÓGIOS LÓGICOS DE LAMPORT =====
        # Relógio lógico do servidor para ordenação causal de eventos
        # Cada evento incrementa o relógio seguindo a regra de Lamport
        self.lamport_clock: int = 0

        # ===== ALGORITMO 3: TRATAMENTO DE FALHAS (TIMEOUT) =====
        # Tempo máximo (em segundos) que um cliente pode manter o lock sem interação
        # Se exceder, o lock é revogado automaticamente
        self.timeout_seconds: int = timeout_seconds

    def _compute_hash(self, content: str) -> str:
        """
        ===== DETECÇÃO DE CONFLITOS =====
        Computa o hash SHA-256 de um conteúdo.
        
        Usado para detectar quando múltiplos clientes alteraram o documento
        entre o momento que um cliente adquiriu o lock e quando tenta salvar.
        
        Args:
            content: Conteúdo a ser hashado
            
        Returns:
            str: Hash SHA-256 em formato hexadecimal
        """
        return hashlib.sha256(content.encode('utf-8')).hexdigest()

    def _check_and_revoke_expired_lock(self) -> bool:
        """
        ===== ALGORITMO 3: TRATAMENTO DE FALHAS (TIMEOUT/HEARTBEAT) =====

        Verifica se o lock atual expirou devido a inatividade do cliente.
        Se o cliente ficou mais de `timeout_seconds` sem interagir, revoga o lock.

        Isso simula a detecção de falhas em sistemas distribuídos, onde
        um nó que não responde é considerado "morto" ou desconectado.

        Returns:
            bool: True se um lock foi revogado, False caso contrário
        """
        if self.lock_holder is not None and self.lock_acquired_at is not None:
            elapsed_time = time.time() - self.lock_acquired_at

            # Se o tempo desde a última interação excedeu o timeout
            if elapsed_time > self.timeout_seconds:
                print(f"[TIMEOUT] Lock do cliente '{self.lock_holder}' expirou após {elapsed_time:.2f}s")
                self.lock_holder = None
                self.lock_acquired_at = None
                return True

        return False

    def acquire_lock(self, client_id: str) -> tuple[bool, str, Optional[str]]:
        """
        ===== ALGORITMO 1: EXCLUSÃO MÚTUA (LOCK CENTRALIZADO) =====

        Tenta adquirir o lock de edição para um cliente.

        O servidor age como um coordenador centralizado que controla
        o acesso exclusivo ao recurso compartilhado (documento).

        Fluxo:
        1. Verifica se há um lock expirado e revoga se necessário
        2. Se nenhum cliente tem o lock, concede ao solicitante
        3. Se o próprio cliente já tem o lock, renova o timestamp (heartbeat)
        4. Se outro cliente tem o lock, nega a requisição

        Args:
            client_id: Identificador do cliente solicitante

        Returns:
            tuple: (sucesso, mensagem, lock_holder_atual)
        """
        with self._thread_lock:  # Garante operação atômica
            # Verifica timeouts antes de processar a requisição
            self._check_and_revoke_expired_lock()

            # Caso 1: Nenhum cliente tem o lock - CONCEDE
            if self.lock_holder is None:
                self.lock_holder = client_id
                self.lock_acquired_at = time.time()
                print(f"[LOCK ACQUIRED] Cliente '{client_id}' adquiriu o lock")
                return True, f"Lock adquirido com sucesso por {client_id}", client_id

            # Caso 2: O próprio cliente já tem o lock - RENOVA (heartbeat)
            elif self.lock_holder == client_id:
                # Atualiza o timestamp para renovar o lock (mantém-no vivo)
                self.lock_acquired_at = time.time()
                print(f"[LOCK RENEWED] Cliente '{client_id}' renovou o lock")
                return True, f"Lock renovado para {client_id}", client_id

            # Caso 3: Outro cliente tem o lock - NEGA
            else:
                print(f"[LOCK DENIED] Cliente '{client_id}' negado. Lock pertence a '{self.lock_holder}'")
                return False, f"Lock já está sendo usado por {self.lock_holder}", self.lock_holder

    def release_lock(self, client_id: str) -> tuple[bool, str]:
        """
        ===== ALGORITMO 1: EXCLUSÃO MÚTUA (LOCK CENTRALIZADO) =====

        Libera o lock de edição.

        Apenas o cliente que possui o lock pode liberá-lo.
        Após a liberação, outros clientes podem adquiri-lo.

        Args:
            client_id: Identificador do cliente que deseja liberar

        Returns:
            tuple: (sucesso, mensagem)
        """
        with self._thread_lock:
            # Verifica timeouts antes de processar
            self._check_and_revoke_expired_lock()

            # Caso 1: Nenhum lock ativo
            if self.lock_holder is None:
                return False, "Nenhum lock ativo para liberar"

            # Caso 2: Cliente correto liberando o lock
            elif self.lock_holder == client_id:
                print(f"[LOCK RELEASED] Cliente '{client_id}' liberou o lock")
                self.lock_holder = None
                self.lock_acquired_at = None
                return True, f"Lock liberado com sucesso por {client_id}"

            # Caso 3: Cliente diferente tentando liberar o lock de outro
            else:
                return False, f"Apenas {self.lock_holder} pode liberar o lock atual"

    def update_document(self, client_id: str, content: str, client_clock: int, content_hash_before: Optional[str] = None) -> tuple[bool, str, int, bool]:
        """
        ===== ALGORITMOS 1, 2, 3 e DETECÇÃO DE CONFLITOS =====

        Atualiza o conteúdo do documento aplicando os três algoritmos + detecção de conflitos:

        1. EXCLUSÃO MÚTUA: Verifica se o cliente tem permissão (possui o lock)
        2. RELÓGIOS DE LAMPORT: Atualiza o relógio lógico seguindo a regra de Lamport
        3. TRATAMENTO DE FALHAS: Verifica timeouts e renova o lock do cliente
        4. DETECÇÃO DE CONFLITOS: Compara hash do conteúdo quando cliente adquiriu lock
           com o hash atual. Se diferem, outro cliente editou enquanto este tinha lock.

        Regra do Relógio de Lamport:
        - Ao receber um evento (update) com clock do cliente:
          clock_servidor = max(clock_servidor, clock_cliente) + 1

        - Isso garante ordenação causal: se evento A → B, então clock(A) < clock(B)

        Args:
            client_id: ID do cliente enviando a atualização
            content: Novo conteúdo do documento
            client_clock: Relógio lógico do cliente no momento do envio
            content_hash_before: Hash SHA-256 do conteúdo quando cliente adquiriu lock

        Returns:
            tuple: (sucesso, mensagem, novo_clock_servidor, conflito_detectado)
        """
        with self._thread_lock:
            # ===== ALGORITMO 3: Verifica se há locks expirados =====
            self._check_and_revoke_expired_lock()

            # ===== ALGORITMO 1: EXCLUSÃO MÚTUA =====
            # Apenas o detentor do lock pode editar o documento
            if self.lock_holder != client_id:
                current_holder = self.lock_holder or "ninguém"
                return False, f"Acesso negado. Lock pertence a {current_holder}", self.lamport_clock, False

            # ===== DETECÇÃO DE CONFLITOS =====
            # Verifica se o conteúdo foi modificado por outro cliente enquanto este tinha o lock
            conflict_detected = False
            if content_hash_before is not None and content_hash_before != self.document_hash:
                conflict_detected = True
                print(f"[CONFLICT DETECTED] Cliente '{client_id}' tentou salvar com conteúdo desatualizado.")
                print(f"  Hash esperado: {content_hash_before}")
                print(f"  Hash atual:    {self.document_hash}")
            
            # ===== ALGORITMO 2: RELÓGIOS LÓGICOS DE LAMPORT =====
            # Aplica a regra de atualização do relógio de Lamport:
            # Ao receber mensagem: clock = max(clock_local, clock_recebido) + 1
            old_clock = self.lamport_clock
            self.lamport_clock = max(self.lamport_clock, client_clock) + 1

            print(f"[LAMPORT CLOCK] Atualizado: {old_clock} → {self.lamport_clock} "
                  f"(client_clock={client_clock})")

            # Atualiza o conteúdo do documento
            self.document_content = content
            self.document_hash = self._compute_hash(content)

            # ===== ALGORITMO 3: Renova o lock (heartbeat) =====
            # Atualiza o timestamp para indicar que o cliente ainda está ativo
            self.lock_acquired_at = time.time()

            print(f"[DOCUMENT UPDATED] por '{client_id}' | Tamanho: {len(content)} chars")

            return True, "Documento atualizado com sucesso", self.lamport_clock, conflict_detected

    def get_state(self) -> dict:
        """
        Retorna o estado completo do sistema.

        Antes de retornar, verifica se há locks expirados (Algoritmo 3).

        Returns:
            dict: Estado contendo documento, hash, relógio, lock_holder e timestamp
        """
        with self._thread_lock:
            # ===== ALGORITMO 3: Verifica timeouts =====
            self._check_and_revoke_expired_lock()

            return {
                "content": self.document_content,
                "content_hash": self.document_hash,
                "lamport_clock": self.lamport_clock,
                "lock_holder": self.lock_holder,
                "lock_acquired_at": self.lock_acquired_at
            }
