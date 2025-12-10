# 📝 Editor de Texto Colaborativo Distribuído - Frontend

Frontend em **React + TypeScript** para o Editor de Texto Colaborativo Distribuído, implementando conceitos de Sistemas Distribuídos com **Relógio Lógico de Lamport** e **Exclusão Mútua**.

## 🏗️ Arquitetura

O projeto segue uma **Feature-Based Architecture** organizada da seguinte forma:

```
src/
  lib/
    axios.ts                    # Cliente HTTP configurado (baseURL: http://localhost:8000)
  features/
    editor/
      types/
        index.ts                # Interfaces TypeScript (EditorState, LockRequest, etc)
      services/
        editorApi.ts            # Funções puras para chamadas API
      hooks/
        useEditor.ts            # Hook customizado (Lógica de Polling e Relógio de Lamport)
      components/
        StatusPanel.tsx         # Painel de status (ID, Lock, Relógios)
        EditorArea.tsx          # Área de edição (Textarea + Botões)
      EditorFeature.tsx         # Componente principal que integra tudo
  App.tsx                       # Renderiza <EditorFeature />
  main.tsx                      # Ponto de entrada React
  index.css                     # Estilos Tailwind CSS
```

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18+ instalado
- Backend rodando em `http://localhost:8000`

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: **http://localhost:3000**

## 🔧 Funcionalidades

### ✨ Principais Features

- **Polling Automático**: Sincroniza com o servidor a cada 1 segundo
- **Exclusão Mútua**: Apenas um usuário pode editar por vez
- **Relógio Lógico de Lamport**: Garante ordenação de eventos distribuídos
- **UI em Tempo Real**: Feedback visual imediato do status do documento

### 📊 Painel de Status

O `StatusPanel` exibe:

- **Meu ID**: Identificador único do cliente (UUID)
- **Status do Lock**:
  - 🟢 **LIVRE**: Documento disponível para edição
  - 🔵 **EDITANDO**: Você está editando
  - 🔴 **BLOQUEADO POR OUTRO**: Outro usuário está editando
- **Relógio Lógico Local**: Contador Lamport do cliente
- **Relógio Lógico Servidor**: Contador Lamport do servidor

### ✏️ Área de Edição

O `EditorArea` permite:

- **Solicitar Edição**: Adquire o lock (disponível quando LIVRE)
- **Editar Documento**: TextArea habilitado apenas quando você possui o lock
- **Salvar e Liberar**: Envia alterações e libera o lock

## 🧠 Implementação do Relógio de Lamport

### Regra de Leitura (Polling)

Ao receber o estado do servidor:

```typescript
local_clock = max(local_clock, server_clock) + 1
```

### Regra de Escrita (Update)

Antes de enviar uma atualização:

```typescript
local_clock = local_clock + 1
// Envia local_clock junto com o conteúdo
```

Implementado em: [src/features/editor/hooks/useEditor.ts](src/features/editor/hooks/useEditor.ts)

## 🎨 Stack Tecnológica

- **React 18**: Biblioteca UI
- **TypeScript**: Type safety
- **Vite**: Build tool e dev server
- **Axios**: Cliente HTTP
- **Tailwind CSS**: Estilização utilitária
- **UUID**: Geração de identificadores únicos

## 📡 Endpoints do Backend

O frontend consome os seguintes endpoints:

| Método | Endpoint             | Descrição                  | Body                                        |
| ------ | -------------------- | -------------------------- | ------------------------------------------- |
| GET    | `/state`             | Obter estado do documento  | -                                           |
| POST   | `/lock/acquire`      | Solicitar lock             | `{ client_id: string }`                     |
| POST   | `/lock/release`      | Liberar lock               | `{ client_id: string }`                     |
| POST   | `/document/update`   | Atualizar documento        | `{ client_id, content, client_clock }`      |

## 🧪 Testando o Sistema Distribuído

Para visualizar o comportamento distribuído:

1. Abra **duas abas** do navegador em `http://localhost:3000`
2. Em uma aba, clique em **"Solicitar Edição"**
3. Observe que:
   - A primeira aba fica com status **EDITANDO** (azul)
   - A segunda aba fica **BLOQUEADO POR OUTRO** (vermelho)
   - Os relógios de Lamport são atualizados automaticamente
4. Faça alterações e clique em **"Salvar e Liberar"**
5. A segunda aba receberá as alterações automaticamente via polling

## 🔍 Conceitos Implementados

### 1. **Exclusão Mútua Distribuída**

- Apenas um cliente pode adquirir o lock por vez
- Implementado no backend, respeitado no frontend

### 2. **Relógio Lógico de Lamport**

- Garante ordenação causal de eventos
- Cada operação incrementa o relógio local
- Sincronização com o servidor mantém consistência

### 3. **Polling (Simulação de Tempo Real)**

- Busca estado a cada 1 segundo
- Simula sistema em tempo real sem WebSockets
- Atualiza UI automaticamente

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

## 📝 Notas de Implementação

- O **ID do cliente** é gerado com `uuid` e persiste durante a sessão
- O **polling** é implementado com `setInterval` no hook `useEditor`
- A **UI é bloqueada** automaticamente quando outro usuário possui o lock
- **Tailwind CSS** é usado para estilização rápida e responsiva

## 📄 Licença

Projeto educacional para demonstração de Sistemas Distribuídos.

---

Desenvolvido com ❤️ para PUC - Conceitos de Computação Distribuída
