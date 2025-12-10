"""
FastAPI Application - Editor de Texto Colaborativo
Servidor centralizado com implementação de algoritmos de Sistemas Distribuídos
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import (
    LockRequest,
    LockResponse,
    DocumentUpdate,
    UpdateResponse,
    DocumentState
)
from app.service import CollaborativeEditorService

# ===== CONFIGURAÇÃO DO FASTAPI =====
app = FastAPI(
    title="Editor de Texto Colaborativo",
    description="API REST com Exclusão Mútua, Relógios de Lamport e Detecção de Falhas",
    version="1.0.0"
)

# ===== CONFIGURAÇÃO DE CORS =====
# Permite requisições do frontend (Vite rodando em localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "*"  # Permite todas as origens (use com cautela em produção)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos HTTP
    allow_headers=["*"],  # Permite todos os headers
)

# ===== INSTÂNCIA DO SERVIÇO =====
# Timeout de 15 segundos para detecção de falhas
editor_service = CollaborativeEditorService(timeout_seconds=15)


# ===== ENDPOINTS DA API =====

@app.get("/")
async def root():
    """Endpoint raiz para verificação de saúde da API"""
    return {
        "message": "Editor de Texto Colaborativo - API REST",
        "algorithms": [
            "1. Exclusão Mútua (Lock Centralizado)",
            "2. Relógios Lógicos de Lamport",
            "3. Tratamento de Falhas (Timeout 15s)"
        ],
        "endpoints": {
            "GET /state": "Obtém estado do documento",
            "POST /lock/acquire": "Adquire lock de edição",
            "POST /lock/release": "Libera lock de edição",
            "POST /document/update": "Atualiza conteúdo do documento"
        }
    }


@app.get("/state", response_model=DocumentState)
async def get_state():
    """
    Retorna o estado completo do documento e do sistema.

    Returns:
        DocumentState: Contém:
            - content: Conteúdo atual do documento
            - lamport_clock: Relógio lógico de Lamport do servidor
            - lock_holder: ID do cliente que possui o lock (ou None)
            - lock_acquired_at: Timestamp de quando o lock foi adquirido
    """
    state = editor_service.get_state()
    return DocumentState(**state)


@app.post("/lock/acquire", response_model=LockResponse)
async def acquire_lock(request: LockRequest):
    """
    ===== ALGORITMO 1: EXCLUSÃO MÚTUA (LOCK CENTRALIZADO) =====

    Tenta adquirir o lock de edição para um cliente.

    Comportamento:
    - Se o lock está livre: concede ao cliente
    - Se o cliente já tem o lock: renova o lock (heartbeat)
    - Se outro cliente tem o lock: nega a requisição

    Args:
        request: Contém client_id do solicitante

    Returns:
        LockResponse: Resultado da tentativa de aquisição
    """
    success, message, lock_holder = editor_service.acquire_lock(request.client_id)

    return LockResponse(
        success=success,
        message=message,
        lock_holder=lock_holder
    )


@app.post("/lock/release", response_model=LockResponse)
async def release_lock(request: LockRequest):
    """
    ===== ALGORITMO 1: EXCLUSÃO MÚTUA (LOCK CENTRALIZADO) =====

    Libera o lock de edição.

    Apenas o cliente que possui o lock pode liberá-lo.

    Args:
        request: Contém client_id do cliente que deseja liberar

    Returns:
        LockResponse: Resultado da tentativa de liberação
    """
    success, message = editor_service.release_lock(request.client_id)

    return LockResponse(
        success=success,
        message=message,
        lock_holder=None if success else editor_service.lock_holder
    )


@app.post("/document/update", response_model=UpdateResponse)
async def update_document(request: DocumentUpdate):
    """
    ===== ALGORITMOS 1, 2 e 3 COMBINADOS =====

    Atualiza o conteúdo do documento aplicando todos os algoritmos:

    1. EXCLUSÃO MÚTUA: Verifica se o cliente tem o lock
    2. RELÓGIOS DE LAMPORT: Atualiza clock com max(clock_servidor, clock_cliente) + 1
    3. TRATAMENTO DE FALHAS: Verifica timeouts e renova o lock

    Args:
        request: Contém:
            - client_id: ID do cliente
            - content: Novo conteúdo do documento
            - client_clock: Relógio lógico de Lamport do cliente

    Returns:
        UpdateResponse: Resultado da atualização com novo relógio do servidor
    """
    success, message, new_clock = editor_service.update_document(
        client_id=request.client_id,
        content=request.content,
        client_clock=request.client_clock
    )

    if not success:
        raise HTTPException(status_code=403, detail=message)

    return UpdateResponse(
        success=success,
        message=message,
        new_lamport_clock=new_clock
    )


# ===== EXECUÇÃO DO SERVIDOR =====
if __name__ == "__main__":
    import uvicorn

    print("=" * 60)
    print("Editor de Texto Colaborativo - Servidor Iniciando")
    print("=" * 60)
    print("Algoritmos Implementados:")
    print("  1. Exclusão Mútua (Lock Centralizado)")
    print("  2. Relógios Lógicos de Lamport")
    print("  3. Tratamento de Falhas (Timeout: 15s)")
    print("=" * 60)
    print("Servidor rodando em: http://localhost:8000")
    print("Documentação interativa: http://localhost:8000/docs")
    print("=" * 60)

    uvicorn.run(app, host="0.0.0.0", port=8000)
