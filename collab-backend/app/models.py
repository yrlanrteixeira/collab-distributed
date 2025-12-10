"""
Modelos Pydantic para Request e Response da API do Editor Colaborativo
"""
from pydantic import BaseModel, Field
from typing import Optional


# ===== REQUEST MODELS =====

class ClientIdentifier(BaseModel):
    """Modelo para identificar um cliente"""
    client_id: str = Field(..., description="Identificador único do cliente")


class LockRequest(BaseModel):
    """Modelo para requisição de aquisição ou liberação de lock"""
    client_id: str = Field(..., description="ID do cliente que quer o lock")


class DocumentUpdate(BaseModel):
    """Modelo para atualização do documento"""
    client_id: str = Field(..., description="ID do cliente enviando a atualização")
    content: str = Field(..., description="Novo conteúdo do documento")
    client_clock: int = Field(..., ge=0, description="Relógio lógico de Lamport do cliente")


# ===== RESPONSE MODELS =====

class LockResponse(BaseModel):
    """Resposta para tentativa de aquisição de lock"""
    success: bool = Field(..., description="Se o lock foi adquirido com sucesso")
    message: str = Field(..., description="Mensagem descritiva do resultado")
    lock_holder: Optional[str] = Field(None, description="ID do cliente que possui o lock atualmente")


class DocumentState(BaseModel):
    """Estado completo do documento e sistema"""
    content: str = Field(..., description="Conteúdo atual do documento")
    lamport_clock: int = Field(..., description="Relógio lógico de Lamport do servidor")
    lock_holder: Optional[str] = Field(None, description="ID do cliente que possui o lock (None se livre)")
    lock_acquired_at: Optional[float] = Field(None, description="Timestamp de quando o lock foi adquirido")


class UpdateResponse(BaseModel):
    """Resposta para atualização de documento"""
    success: bool = Field(..., description="Se a atualização foi bem-sucedida")
    message: str = Field(..., description="Mensagem descritiva do resultado")
    new_lamport_clock: int = Field(..., description="Novo valor do relógio lógico após atualização")
