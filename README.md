# 🚀 Instruções de Execução - Editor Colaborativo Distribuído

Este documento contém as instruções para executar o sistema completo (Backend + Frontend).

## 📋 Pré-requisitos

- **Python 3.9+** (para o backend)
- **Node.js 18+** (para o frontend)
- **Terminal** (CMD, PowerShell, Git Bash, etc.)

## 🔧 Configuração e Execução

### 1️⃣ Backend (FastAPI)

Abra um terminal e execute:

```bash
# Navegar para a pasta do backend
cd collab-backend

# (Opcional) Criar ambiente virtual Python
python -m venv venv

# Ativar ambiente virtual
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# Windows (CMD):
venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install fastapi uvicorn

# Executar servidor
uvicorn app.main:app --reload --port 8000
```

✅ **Backend rodando em:** `http://localhost:8000`

### 2️⃣ Frontend (React + TypeScript)

Abra **outro terminal** (mantenha o backend rodando) e execute:

```bash
# Navegar para a pasta do frontend
cd collab-frontend

# Instalar dependências (apenas na primeira vez)
npm install

# Executar servidor de desenvolvimento
npm run dev
```

✅ **Frontend rodando em:** `http://localhost:3000`

## 🧪 Testando o Sistema Distribuído

### Teste 1: Exclusão Mútua

1. Abra **duas abas** do navegador em `http://localhost:3000`
2. Na **aba 1**, clique em **"Solicitar Edição"**
3. Observe:
   - **Aba 1**: Status = **EDITANDO** (azul)
   - **Aba 2**: Status = **BLOQUEADO POR OUTRO** (vermelho)
4. Digite algo na **aba 1** e clique em **"Salvar e Liberar"**
5. Observe que a **aba 2** recebe as alterações automaticamente

### Teste 2: Relógios de Lamport

1. Observe os **Relógios Lógicos** no painel de status
2. A cada operação (polling, lock, update):
   - **Relógio Local** é incrementado
   - **Relógio Servidor** é sincronizado
3. Regra implementada: `local_clock = max(local_clock, server_clock) + 1`

### Teste 3: Sincronização Automática

1. Mantenha **duas abas** abertas
2. Edite na **aba 1** e salve
3. A **aba 2** recebe as mudanças em até **1 segundo** (polling interval)

## 📊 Endpoints da API

O backend expõe os seguintes endpoints:

| Método | Endpoint             | Descrição                  |
| ------ | -------------------- | -------------------------- |
| GET    | `/state`             | Obtém estado do documento  |
| POST   | `/lock/acquire`      | Solicita lock de edição    |
| POST   | `/lock/release`      | Libera lock de edição      |
| POST   | `/document/update`   | Atualiza documento         |

Você pode testar manualmente usando:

```bash
# Obter estado
curl http://localhost:8000/state

# Solicitar lock
curl -X POST http://localhost:8000/lock/acquire \
  -H "Content-Type: application/json" \
  -d '{"client_id": "test-123"}'
```

## 🎯 Funcionalidades Implementadas

### Backend (Python/FastAPI)
- ✅ Gerenciamento de estado do documento
- ✅ Sistema de lock distribuído (exclusão mútua)
- ✅ Relógio Lógico de Lamport
- ✅ API REST com FastAPI
- ✅ CORS habilitado para desenvolvimento

### Frontend (React/TypeScript)
- ✅ Arquitetura feature-based
- ✅ Hook customizado `useEditor` com lógica de Lamport
- ✅ Polling automático a cada 1 segundo
- ✅ Interface com Tailwind CSS
- ✅ Painel de status em tempo real
- ✅ Controle de bloqueio visual
- ✅ Sincronização automática entre clientes

## 🛑 Parando os Servidores

### Backend
Pressione `Ctrl + C` no terminal do backend

### Frontend
Pressione `Ctrl + C` no terminal do frontend

## 🐛 Solução de Problemas

### Porta 8000 já em uso
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Porta 3000 já em uso
O Vite irá sugerir automaticamente outra porta (ex: 3001)

### Erro de CORS
Certifique-se de que o backend está rodando em `http://localhost:8000`

### Erro "Cannot find module"
```bash
# Reinstalar dependências
cd collab-frontend
rm -rf node_modules package-lock.json
npm install
```

## 📚 Conceitos de Sistemas Distribuídos

Este projeto demonstra:

1. **Exclusão Mútua**: Apenas um processo pode acessar o recurso crítico (documento)
2. **Relógio Lógico de Lamport**: Ordenação de eventos em sistema distribuído
3. **Sincronização**: Polling para manter estado consistente
4. **Sistemas Cliente-Servidor**: Backend centralizado + múltiplos clientes

## 📞 Suporte

Em caso de dúvidas:
- Verifique os logs no console do navegador (F12)
- Verifique os logs no terminal do backend
- Consulte o README.md em `collab-frontend/`

---

**Bom teste! 🎉**
