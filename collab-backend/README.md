# Editor de Texto Colaborativo - Backend

API REST em Python/FastAPI que implementa um servidor centralizado para editor de texto colaborativo com foco em **algoritmos de Sistemas Distribuídos**.

## Algoritmos Implementados

### 1. Exclusão Mútua (Lock Centralizado)
- Sistema de "token" ou "lock" de edição
- Apenas um cliente pode editar o documento por vez
- O servidor age como coordenador centralizado
- Suporta renovação de lock (heartbeat)

### 2. Relógios Lógicos de Lamport
- Cada evento incrementa o relógio lógico
- Regra de Lamport: `clock_servidor = max(clock_servidor, clock_cliente) + 1`
- Garante ordenação causal de eventos distribuídos

### 3. Tratamento de Falhas (Timeout/Heartbeat)
- Detecta clientes que "morreram" ou perderam conexão
- Lock é revogado automaticamente após 15 segundos de inatividade
- Permite que outros clientes assumam o controle

## Estrutura do Projeto

```
collab-backend/
├── app/
│   ├── __init__.py      # Inicialização do pacote
│   ├── main.py          # (Controller) Rotas FastAPI
│   ├── models.py        # (DTOs) Modelos Pydantic Request/Response
│   └── service.py       # (Business Logic) Algoritmos distribuídos
├── requirements.txt     # Dependências Python
├── run.py              # Script para executar o servidor
├── .env.example        # Exemplo de configuração
├── .gitignore          # Arquivos ignorados pelo Git
└── README.md           # Esta documentação
```

## Instalação e Execução

### 1. Criar ambiente virtual (recomendado)
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Instalar dependências
```bash
pip install -r requirements.txt
```

### 3. Executar o servidor

```bash
# Opção 1: Usar o script run.py (recomendado)
python run.py

# Opção 2: Usar uvicorn diretamente
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

O servidor estará disponível em:
- **API**: http://localhost:8000
- **Documentação interativa (Swagger)**: http://localhost:8000/docs
- **Redoc**: http://localhost:8000/redoc

## Endpoints da API

### `GET /`
Informações sobre a API e algoritmos implementados.

### `GET /state`
Retorna o estado completo do documento.

**Response:**
```json
{
  "content": "Conteúdo do documento",
  "lamport_clock": 42,
  "lock_holder": "client-123",
  "lock_acquired_at": 1702345678.9
}
```

### `POST /lock/acquire`
Tenta adquirir o lock de edição.

**Request:**
```json
{
  "client_id": "client-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lock adquirido com sucesso por client-123",
  "lock_holder": "client-123"
}
```

### `POST /lock/release`
Libera o lock de edição.

**Request:**
```json
{
  "client_id": "client-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lock liberado com sucesso por client-123",
  "lock_holder": null
}
```

### `POST /document/update`
Atualiza o conteúdo do documento (requer lock).

**Request:**
```json
{
  "client_id": "client-123",
  "content": "Novo conteúdo do documento",
  "client_clock": 41
}
```

**Response:**
```json
{
  "success": true,
  "message": "Documento atualizado com sucesso",
  "new_lamport_clock": 42
}
```

## Configuração CORS

O servidor está configurado para aceitar requisições de:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`
- `*` (todas as origens - ajuste conforme necessário)

Para modificar, edite [main.py:25-35](main.py#L25-L35).

## Detalhes Técnicos

### Thread Safety
O código utiliza `threading.Lock()` para garantir operações atômicas em ambientes multi-threaded, evitando race conditions.

### Timeout e Detecção de Falhas
- **Timeout padrão**: 15 segundos
- Verificado automaticamente em cada operação
- Pode ser configurado ao instanciar `CollaborativeEditorService`

### Logs do Servidor
O servidor imprime logs detalhados no console:
```
[LOCK ACQUIRED] Cliente 'client-123' adquiriu o lock
[LOCK RENEWED] Cliente 'client-123' renovou o lock
[LAMPORT CLOCK] Atualizado: 40 → 42 (client_clock=41)
[DOCUMENT UPDATED] por 'client-123' | Tamanho: 1234 chars
[TIMEOUT] Lock do cliente 'client-123' expirou após 15.34s
```

## Testando a API

### Usando curl

**Obter estado:**
```bash
curl http://localhost:8000/state
```

**Adquirir lock:**
```bash
curl -X POST http://localhost:8000/lock/acquire \
  -H "Content-Type: application/json" \
  -d '{"client_id": "client-123"}'
```

**Atualizar documento:**
```bash
curl -X POST http://localhost:8000/document/update \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "client-123",
    "content": "Hello, distributed systems!",
    "client_clock": 5
  }'
```

### Usando Swagger UI
Acesse http://localhost:8000/docs para testar interativamente todos os endpoints.

## Dependências

- **FastAPI 0.115.6**: Framework web moderno e rápido
- **Uvicorn 0.32.1**: Servidor ASGI de alta performance
- **Pydantic 2.9.2**: Validação de dados com type hints
- **python-multipart**: Suporte a formulários multipart

## Trabalho Acadêmico

Este projeto foi desenvolvido para o curso de **Computação Distribuída** da PUC.

### Objetivos Alcançados
- ✅ Implementação manual de Exclusão Mútua (sem bibliotecas prontas)
- ✅ Implementação de Relógios Lógicos de Lamport
- ✅ Detecção de falhas via timeout/heartbeat
- ✅ Separação clara entre rotas, modelos e lógica de negócio
- ✅ Código documentado com explicação de cada algoritmo

### Extensões Futuras (Opcional)
- [ ] Algoritmo de Berkeley para sincronização de relógios
- [ ] Implementação de Snapshot de Chandy-Lamport
- [ ] Replicação de estado com consenso (Raft/Paxos)
- [ ] Suporte a WebSockets para atualizações em tempo real

## Licença

Projeto acadêmico - uso livre para estudos.
