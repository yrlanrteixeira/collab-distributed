# Editor Colaborativo Distribuído

Sistema de edição colaborativa em tempo real que implementa conceitos fundamentais de sistemas distribuídos: exclusão mútua, relógios lógicos de Lamport e sincronização de estado entre múltiplos clientes.

## Visão Geral

O projeto consiste em um editor de texto onde múltiplos usuários podem visualizar o documento simultaneamente, mas apenas um pode editá-lo por vez. O sistema garante consistência através de um mecanismo de lock distribuído e utiliza relógios lógicos de Lamport para ordenação de eventos.

## Tecnologias

**Backend:**

- FastAPI (Python)
- Uvicorn (servidor ASGI)

**Frontend:**

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios

## Pré-requisitos

- Python 3.9 ou superior
- Node.js 18 ou superior
- npm ou yarn

## Instalação e Execução

### Backend

```bash
cd collab-backend

# Criar e ativar ambiente virtual (recomendado)
python -m venv venv
venv\Scripts\Activate.ps1  # Windows PowerShell
# venv\Scripts\activate.bat  # Windows CMD
# source venv/bin/activate   # Linux/Mac

# Instalar dependências
pip install -r requirements.txt
# ou: pip install fastapi uvicorn

# Executar servidor
uvicorn app.main:app --reload --port 8000
```

O backend estará disponível em `http://localhost:8000`

### Frontend

```bash
cd collab-frontend

# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## Testando o Sistema

1. Abra duas ou mais abas do navegador apontando para o frontend
2. Em uma aba, clique em "Solicitar Edição" para obter o lock
3. Observe que as outras abas ficam bloqueadas automaticamente
4. Edite o texto e clique em "Salvar e Liberar"
5. As outras abas receberão as atualizações automaticamente via polling

## Estrutura do Projeto

```text
collab-distributed/
├── collab-backend/          # Servidor FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # Endpoints da API
│   │   ├── models.py        # Modelos de dados
│   │   └── service.py       # Lógica de negócio e Lamport
│   ├── requirements.txt
│   └── run.py
├── collab-frontend/         # Cliente React
│   ├── src/
│   │   ├── features/
│   │   │   └── editor/      # Feature de edição
│   │   │       ├── components/
│   │   │       ├── hooks/   # useEditor hook
│   │   │       ├── services/
│   │   │       └── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## Arquitetura

### Backend (FastAPI)

- Gerenciamento de estado do documento
- Sistema de lock distribuído (exclusão mútua)
- Relógio Lógico de Lamport
- API REST com CORS habilitado

### Frontend (React/TypeScript)

- Hook customizado `useEditor` com lógica de Lamport
- Polling automático a cada 1 segundo
- Interface com Tailwind CSS
- Sincronização automática entre clientes

## API Endpoints

| Método | Endpoint           | Descrição                 |
|--------|-------------------|---------------------------|
| GET    | `/state`          | Obtém estado do documento |
| POST   | `/lock/acquire`   | Solicita lock de edição   |
| POST   | `/lock/release`   | Libera lock de edição     |
| POST   | `/document/update`| Atualiza documento        |

## Conceitos Implementados

- **Exclusão Mútua**: Controle de acesso ao documento
- **Relógio Lógico de Lamport**: Ordenação de eventos distribuídos
- **Sincronização**: Estado consistente entre múltiplos clientes
