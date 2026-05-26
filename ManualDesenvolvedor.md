# Manual do Desenvolvedor — Memora

> Versão do documento: 1.0  
> Última atualização: Maio de 2026

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Tecnologias e Dependências](#2-tecnologias-e-dependências)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Configuração do Ambiente](#4-configuração-do-ambiente)
5. [Banco de Dados e Schema](#5-banco-de-dados-e-schema)
6. [Arquitetura do Backend](#6-arquitetura-do-backend)
7. [Autenticação e Autorização](#7-autenticação-e-autorização)
8. [Pipeline de Geração de Flashcards com IA](#8-pipeline-de-geração-de-flashcards-com-ia)
9. [Algoritmo de Repetição Espaçada (SM-2)](#9-algoritmo-de-repetição-espaçada-sm-2)
10. [Arquitetura do Frontend](#10-arquitetura-do-frontend)
11. [Rotas da API](#11-rotas-da-api)
12. [Tratamento de Erros](#12-tratamento-de-erros)
13. [Testes](#13-testes)
14. [Scripts Disponíveis](#14-scripts-disponíveis)
15. [Decisões de Arquitetura](#15-decisões-de-arquitetura)

---

## 1. Visão Geral

Memora é uma aplicação de estudo baseada em flashcards gerados por IA. O usuário faz upload de um PDF ou informa um tópico, e a aplicação usa o **Google Gemini** para gerar flashcards automaticamente. A revisão dos cards segue o algoritmo **SM-2** (Spaced Repetition), que agenda a próxima revisão de cada card com base no desempenho do usuário.

```
┌─────────────┐     HTTP/REST     ┌─────────────────┐     Prisma     ┌──────────────┐
│   Client    │ ◄───────────────► │   Server        │ ◄────────────► │  PostgreSQL  │
│  React/Vite │                   │  Express + TS   │                │              │
└─────────────┘                   └────────┬────────┘                └──────────────┘
                                           │ HTTPS
                                  ┌────────▼────────┐
                                  │  Google Gemini  │
                                  │  (gemini-2.5)   │
                                  └─────────────────┘
```

---

## 2. Tecnologias e Dependências

### Backend (`/server`)

| Pacote | Versão | Função |
|---|---|---|
| Express | ^5.2 | Framework HTTP |
| Prisma | ^7.5 | ORM e migrations |
| `@prisma/adapter-pg` | ^7.8 | Adapter PostgreSQL para Prisma v7 |
| `@google/genai` | ^1.17 | SDK do Google Gemini |
| `jsonwebtoken` | ^9.0 | Geração e verificação de JWT |
| `bcryptjs` | ^3.0 | Hash de senhas |
| Zod | ^4.3 | Validação de schemas de entrada |
| `tsx` | ^4.21 | Execução de TypeScript em dev |
| Vitest | ^4.1 | Framework de testes |

### Frontend (`/client`)

| Pacote | Versão | Função |
|---|---|---|
| React | ^19.2 | UI |
| React Router DOM | ^7.14 | Roteamento SPA |
| Vite | ^8.0 | Build e dev server |
| Tailwind CSS | ^3.4 | Estilização |
| lucide-react | ^1.8 | Ícones |
| TypeScript | ~5.9 | Tipagem estática |

---

## 3. Estrutura de Pastas

```
MEMORA/
├── client/                        # Frontend React
│   └── src/
│       ├── App.tsx                # Roteador raiz (BrowserRouter + Routes)
│       ├── main.tsx               # Entry point
│       ├── app/                   # Páginas (uma por rota)
│       │   ├── uploadPage.tsx     # / — Upload e geração de deck
│       │   ├── decksPage.tsx      # /decks — Lista de decks
│       │   ├── flashcardPage.tsx  # /flashcards — Estudo de um deck
│       │   ├── reviewPage.tsx     # /review — Revisão diária (SM-2)
│       │   └── profilePage.tsx   # /profile — Perfil do usuário
│       ├── components/            # Componentes reutilizáveis
│       │   ├── sideBar.tsx
│       │   ├── deckCard.tsx
│       │   ├── loginModal.tsx
│       │   └── registerModal.tsx
│       ├── hooks/
│       │   └── useDueCards.ts     # Busca e agrupa cards com revisão pendente
│       └── services/              # Chamadas HTTP para a API
│           ├── authService.ts     # Login e cadastro
│           └── deckService.ts     # Decks, flashcards, revisão
│
└── server/                        # Backend Express
    ├── prisma/
    │   └── schema.prisma          # Schema do banco de dados
    ├── prisma.config.ts           # Configuração de conexão (Prisma v7)
    └── src/
        ├── index.ts               # Entry point: Express app + rotas + middlewares
        ├── controllers/           # Handlers HTTP (request → response)
        │   ├── AuthController.ts
        │   ├── DeckController.ts
        │   ├── FlashcardController.ts
        │   ├── StatsController.ts
        │   └── StudySessionController.ts
        ├── routes/                # Registro de rotas por domínio
        │   ├── authRoutes.ts
        │   ├── deckRoutes.ts
        │   ├── flashcardRoutes.ts
        │   ├── statsRoutes.ts
        │   └── studySessionRoutes.ts
        ├── services/              # Lógica de negócio e integrações externas
        │   ├── FlashcardService.ts  # Orquestra geração (PDF + Gemini)
        │   └── GeminiService.ts     # Comunicação com a API do Gemini
        ├── prompts/
        │   └── FlashcardPromptBuilder.ts  # Monta o prompt enviado à IA
        ├── middleware/
        │   └── authMiddleware.ts   # requireAuth — valida JWT
        ├── lib/
        │   ├── env.ts             # Leitura e validação de variáveis de ambiente
        │   ├── jwt.ts             # signJwt / verifyJwt
        │   └── prisma.ts          # Instância global do PrismaClient
        ├── errors/
        │   └── index.ts           # Hierarquia de erros de domínio
        ├── utils/
        │   └── PdfManager.ts      # Carrega PDF de URL, path ou Buffer
        └── tests/
            ├── DeckController.generate.test.ts
            └── GeminiService.test.ts
```

---

## 4. Configuração do Ambiente

### Pré-requisitos

- Node.js ≥ 20
- PostgreSQL ≥ 14 rodando localmente
- Chave de API do Google Gemini ([console do Google AI Studio](https://aistudio.google.com/app/apikey))

### Instalação

```bash
# Backend
cd server
npm install
cp .env.example .env   # preencha as variáveis abaixo

# Frontend
cd ../client
npm install
```

### Variáveis de ambiente (`server/.env`)

```env
# Banco de dados — string de conexão PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/memora"

# JWT
JWT_SECRET="string-aleatoria-longa-e-segura"
JWT_EXPIRES_IN="30d"          # opcional, padrão: 30d

# IA
GEMINI_API_KEY="sua-chave-aqui"

# Servidor
PORT=3001                     # opcional, padrão: 3001
CORS_ORIGIN="http://localhost:5173"  # opcional

# OAuth Google — opcional
# GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"
```

> **Gerar um JWT_SECRET seguro:**
> ```bash
> openssl rand -base64 32
> ```

### Banco de dados

```bash
cd server

# Criar tabelas (primeira vez ou após alterar o schema)
npx prisma migrate dev --name init

# Visualizar dados no navegador
npx prisma studio
```

### Rodando em desenvolvimento

```bash
# Terminal 1 — backend (hot reload automático)
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Health check | http://localhost:3001/api/health |
| Prisma Studio | http://localhost:5555 |

---

## 5. Banco de Dados e Schema

O schema está em `server/prisma/schema.prisma`. São quatro models:

### `User`
Armazena dados de autenticação. Suporta login por senha e por OAuth Google.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | `String` (CUID) | PK gerado automaticamente |
| `email` | `String` | Único, indexado |
| `passwordHash` | `String?` | `null` para usuários Google |
| `provider` | `AuthProvider` | `PASSWORD` ou `GOOGLE` |
| `googleId` | `String?` | ID único do Google OAuth |

### `Deck`
Conjunto de flashcards gerado por tópico.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | `String` (CUID) | PK |
| `title` | `String` | Igual ao `topic` na criação |
| `topic` | `String` | Tópico informado pelo usuário |
| `color` | `String` | Cor aleatória atribuída na geração |
| `sourceName` | `String?` | Nome do arquivo de origem (se houver) |
| `userId` | `String` | FK → `User` (cascade delete) |

### `Flashcard`
Card individual com campos para o algoritmo SM-2.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | `String` (CUID) | PK |
| `question` | `String` | Pergunta gerada pela IA |
| `answer` | `String` | Resposta gerada pela IA |
| `mastered` | `Boolean` | `true` após 5 acertos consecutivos |
| `nextReviewAt` | `DateTime` | Data da próxima revisão (SM-2) |
| `interval` | `Int` | Intervalo atual em dias |
| `correctCount` | `Int` | Acertos consecutivos sem erro |
| `deckId` | `String` | FK → `Deck` (cascade delete) |

> **Índice composto:** `@@index([deckId, nextReviewAt])` — otimiza a query de cards pendentes para revisão.

### `StudySession`
Registro histórico de cada sessão de estudo.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | `String` (CUID) | PK |
| `durationSec` | `Int` | Duração da sessão em segundos |
| `cardsStudied` | `Int` | Total de cards respondidos |
| `cardsCorrect` | `Int` | Total de acertos |
| `userId` | `String` | FK → `User` |
| `deckId` | `String` | FK → `Deck` |

### Relações

```
User ──< Deck ──< Flashcard
User ──< StudySession
Deck ──< StudySession
```

Todos os relacionamentos têm `onDelete: Cascade` — deletar um usuário remove todos os seus dados.

---

## 6. Arquitetura do Backend

O servidor segue um padrão **Controller → Service → Prisma** sem injeção de dependência formal. Cada domínio tem seu próprio arquivo de rotas que instancia o controller.

### Fluxo de uma requisição

```
Request
  │
  ▼
index.ts (Express app)
  │  cors, json parser, cookie-parser
  ▼
routes/deckRoutes.ts
  │  createDeckRoutes() → Router
  ▼
middleware/authMiddleware.ts (requireAuth)
  │  extrai token → verifica JWT → busca user no banco → injeta userId
  ▼
controllers/DeckController.ts
  │  valida body (Zod) → chama service ou Prisma
  ▼
services/FlashcardService.ts  (apenas para generate)
  │  PdfManager + FlashcardPromptBuilder + GeminiService
  ▼
Response JSON
```

### `lib/env.ts` — Variáveis de ambiente

Centraliza a leitura das variáveis. `required()` lança erro na inicialização se a variável estiver ausente, evitando que o servidor suba com configuração incompleta.

```ts
export const env = {
  jwtSecret: required("JWT_SECRET"),  // lança se ausente
  geminiApiKey: required("GEMINI_API_KEY"),
  port: Number(process.env.PORT) || 3001,
  // ...
};
```

### `lib/prisma.ts` — Instância global

```ts
// Uma única instância compartilhada em toda a aplicação
export const prisma = new PrismaClient({ adapter });
```

> **Atenção:** nunca instancie `PrismaClient` diretamente em controllers ou services. Sempre importe de `lib/prisma.js`.

### `middleware/authMiddleware.ts` — `requireAuth`

Extrai o token de duas fontes (header `Authorization: Bearer <token>` ou cookie `token`), verifica com `verifyJwt`, busca o usuário no banco e injeta `userId` e `userEmail` na request.

```ts
// Nas rotas protegidas, o controller acessa assim:
const { userId } = req as AuthedRequest;
```

---

## 7. Autenticação e Autorização

### JWT

- Gerado em `lib/jwt.ts` com `signJwt({ sub: userId, email })`
- Expiração configurável via `JWT_EXPIRES_IN` (padrão: 30 dias)
- Verificado em `verifyJwt` — retorna `null` em vez de lançar exceção

### Fluxo de registro

```
POST /api/auth/register
  → Valida body com Zod (nome, email, senha)
  → Verifica email duplicado (409 se existir)
  → bcrypt.hash(senha, 12)
  → prisma.user.create(...)
  → signJwt({ sub: user.id, email })
  → { user, token }
```

### Fluxo de login

```
POST /api/auth/login
  → Valida body com Zod
  → prisma.user.findUnique({ email })
  → bcrypt.compare(senha, passwordHash)
  → Mensagem genérica "Email ou senha incorretos." (não revela se email existe)
  → signJwt(...)
  → { user, token }
```

### Armazenamento no cliente

```ts
// Após login/cadastro bem-sucedido
localStorage.setItem("memora_token", token);
localStorage.setItem("memora_user", JSON.stringify({ name, email }));
```

O token é enviado em todas as requisições autenticadas via header:
```
Authorization: Bearer <token>
```

---

## 8. Pipeline de Geração de Flashcards com IA

A geração envolve três classes em sequência:

```
DeckController.generate()
  │
  ▼
FlashcardService.generate({ topic, quantity, pdfUrl? })
  │
  ├─ FlashcardPromptBuilder.build({ topico, quantidade })
  │    └─ Monta prompt com persona, diretrizes e formato esperado
  │
  ├─ [se pdfUrl] PdfManager.loadPdf(url)
  │    └─ Baixa o PDF com timeout de 30s → retorna Blob
  │
  └─ GeminiService
       ├─ [com PDF] uploadFile() → waitForProcessing() → callModel()
       └─ [sem PDF] generateFlashcardsFromPrompt()
```

### `FlashcardPromptBuilder`

Monta um prompt em três seções:
1. **Persona** — define o Gemini como professor especialista em Active Recall
2. **Diretrizes** — tópico alvo, quantidade exata, fidelidade ao documento, idioma
3. **Formato** — instrui a retornar um Array JSON `[{ pergunta, resposta }]`

> A diretriz `"Se o documento NÃO abordar o tópico, retorne []"` é importante — o `DeckController` trata array vazio como 422 para orientar o usuário.

### `GeminiService`

- Modelo: `gemini-2.5-flash-lite`
- Resposta forçada como JSON via `responseMimeType: "application/json"` e `responseSchema`
- Para PDFs: faz upload via Files API, aguarda o estado `ACTIVE` com polling (máx. 20 tentativas × 3s) e deleta o arquivo remoto no `finally`
- `parseJsonResponse()` sanitiza fences de markdown (` ```json `) antes de fazer `JSON.parse`

### `PdfManager`

Carrega um PDF de três fontes diferentes com a mesma interface:

```ts
await pdfManager.loadPdf("https://...")   // URL remota (timeout 30s)
await pdfManager.loadPdf("/tmp/file.pdf") // Caminho local
await pdfManager.loadPdf(buffer)          // Buffer em memória
```

---

## 9. Algoritmo de Repetição Espaçada (SM-2)

Implementado em `FlashcardController.ts` na função `calcularProximoIntervalo`.

### Lógica

| Situação | Próximo intervalo | `correctCount` |
|---|---|---|
| Erro | 1 dia | Reset para 0 |
| 1º acerto | 1 dia | 1 |
| 2º acerto consecutivo | 6 dias | 2 |
| 3º+ acerto consecutivo | `intervaloAtual × 2.5` (arredondado) | +1 |
| 5º acerto consecutivo | — | `mastered = true` |

### Sequência de intervalos para acertos consecutivos

```
1 → 1 dia
2 → 6 dias
3 → 15 dias  (6 × 2.5)
4 → 37 dias  (15 × 2.5)
5 → 92 dias  (37 × 2.5) + mastered = true
```

### Como os cards pendentes são buscados

```ts
// FlashcardController.due
prisma.flashcard.findMany({
  where: {
    deck: { userId },
    nextReviewAt: { lte: new Date() },  // vencidos até agora
  },
  orderBy: { nextReviewAt: "asc" },     // mais atrasados primeiro
})
```

### Hook `useDueCards` (frontend)

Centraliza a busca de cards pendentes. Usado por todas as páginas para exibir o badge da sidebar com a contagem real e agrupar os cards por deck na página de revisão.

```ts
const { totalDue, byDeck, loading, refresh } = useDueCards();
// refresh() é chamado após concluir uma sessão para atualizar o badge
```

---

## 10. Arquitetura do Frontend

### Roteamento

```ts
// App.tsx
<Routes>
  <Route path="/"          element={<UploadPage />} />
  <Route path="/decks"     element={<DecksPage />} />
  <Route path="/flashcards" element={<FlashcardPage />} />
  <Route path="/review"    element={<ReviewPage />} />
  <Route path="/profile"   element={<ProfilePage />} />
</Routes>
```

### Navegação com estado de rota

A passagem de dados entre `DecksPage → FlashcardPage` é feita via route state (não query params):

```ts
// Quem navega
navigate("/flashcards", { state: { deckId: deck.id, deckTitle: deck.title } });

// Quem recebe
const { deckId, deckTitle } = useLocation().state;
```

### `deckService.ts` — Camada de API

Centraliza todos os `fetch` para o backend. Funções principais:

| Função | Método | Endpoint |
|---|---|---|
| `fetchDecks()` | GET | `/api/decks` |
| `fetchDeck(id)` | GET | `/api/decks/:id` |
| `generateDeck(params)` | POST | `/api/decks/generate` |
| `deleteDeck(id)` | DELETE | `/api/decks/:id` |
| `fetchDueFlashcards(deckId?)` | GET | `/api/flashcards/due` |
| `reviewFlashcard(id, result, durationSec)` | POST | `/api/flashcards/:id/review` |

Todas as funções:
1. Leem o token de `localStorage.getItem("memora_token")`
2. Lançam `Error` com a mensagem do campo `error` do JSON de resposta se `!res.ok`

### Validação no frontend

Os modais e o formulário de upload realizam validação **local** antes de chamar a API:

- **`loginModal`** — email (formato) e senha (obrigatório)
- **`registerModal`** — nome (mín. 2, máx. 100), email, senha (mín. 6) + indicador de força
- **`uploadPage`** — tipo de arquivo (PDF/PPT/PPTX/PNG/JPG), tamanho (máx. 10 MB), tópico (mín. 3, máx. 200 chars)

Erros são exibidos por campo (`fieldErrors`) e somem ao editar o campo. Erros da API ficam num bloco separado (`apiError`).

---

## 11. Rotas da API

Todas as rotas (exceto `/api/health` e `/api/auth/*`) requerem `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/register` | Cadastro com email e senha |
| POST | `/login` | Login com email e senha |
| POST | `/google` | Login com token Google OAuth |
| GET | `/me` | Dados do usuário autenticado |
| POST | `/logout` | Logout (stateless — apenas 204) |
| GET | `/config` | Se OAuth Google está configurado |

### Decks — `/api/decks`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Lista os decks do usuário com estatísticas |
| POST | `/generate` | Gera novo deck com IA |
| GET | `/:id` | Detalhes de um deck com flashcards |
| DELETE | `/:id` | Remove deck e seus dados em cascata |

**Body de `/generate`:**
```json
{
  "topic": "Mitose e Meiose",
  "quantity": 10,
  "pdfUrl": "https://...",     // opcional
  "sourceName": "bio.pdf"      // opcional
}
```

### Flashcards — `/api/flashcards`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/due?deckId=` | Cards com revisão pendente (hoje) |
| POST | `/:id/review` | Registra acerto/erro e atualiza SM-2 |

**Body de `/review`:**
```json
{ "result": "correct", "durationSec": 12 }
```

### Stats — `/api/stats`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/overview` | Totais: decks, cards, acertos, tempo, sparkline 7 dias |
| GET | `/streak` | Sequência de dias estudados (atual e maior) |

### Sessions — `/api/sessions`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/` | Cria sessão de estudo manualmente |

---

## 12. Tratamento de Erros

### Hierarquia de erros de domínio (`errors/index.ts`)

```
Error
└── GeminiServiceError        — falhas na comunicação com o Gemini
    ├── JsonParsingError      — parse da resposta JSON falhou
    └── FileProcessingTimeoutError — arquivo não ficou ACTIVE a tempo

PromptValidationError         — configuração inválida do prompt
```

### Mapeamento de status HTTP no `DeckController.generate`

| Erro | Status | Quando |
|---|---|---|
| `PromptValidationError` | 400 | Tópico vazio ou quantidade fora do range |
| `FileProcessingTimeoutError` | 504 | PDF não ficou pronto no Gemini |
| `GeminiServiceError` | 502 | Qualquer falha de comunicação com a IA |
| Array vazio retornado pela IA | 422 | Tópico não encontrado no documento |
| Erro inesperado | 500 | Erro não mapeado |

### Handler global no `index.ts`

```ts
// Captura SyntaxError de JSON malformado no body
app.use((error, _req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "O corpo da requisição JSON é inválido." });
  }
  // ...
  return res.status(500).json({ error: "Erro interno do servidor." });
});
```

### Padrão de resposta de erro

```json
{
  "error": "Mensagem principal (primeiro erro).",
  "erros": ["Lista completa de erros de validação Zod"]
}
```

---

## 13. Testes

Os testes ficam em `server/src/tests/` e usam **Vitest**.

```bash
cd server

# Roda todos os testes uma vez
npm test

# Modo watch (re-roda ao salvar)
npm run test:watch
```

Arquivos existentes:
- `DeckController.generate.test.ts` — testa o fluxo de geração com mocks do `FlashcardService`
- `GeminiService.test.ts` — testa parsing de JSON, validação de flashcards e extração de fences

Para adicionar novos testes, siga o padrão:
```ts
import { describe, it, expect, vi } from "vitest";

describe("NomeDaClasse.metodo", () => {
  it("deve fazer X quando Y", () => {
    expect(resultado).toBe(esperado);
  });
});
```

---

## 14. Scripts Disponíveis

### Backend (`/server`)

```bash
npm run dev        # Inicia com tsx watch (hot reload)
npm run build      # Compila TypeScript → dist/
npm run start      # Roda o build compilado (produção)
npm test           # Roda testes com Vitest
npm run test:watch # Testes em modo watch
```

```bash
npx prisma migrate dev --name <nome>  # Cria nova migration
npx prisma migrate deploy             # Aplica migrations em produção
npx prisma studio                     # GUI do banco no navegador
npx prisma generate                   # Regenera o Prisma Client
```

### Frontend (`/client`)

```bash
npm run dev        # Dev server (Vite)
npm run build      # Build de produção → dist/
npm run preview    # Prévia do build local
npm run lint       # ESLint
```

---

## 15. Decisões de Arquitetura

### Por que Prisma v7 com `prisma.config.ts`?

A v7 removeu o campo `url` do `datasource` no `schema.prisma`. A URL de conexão vai em `prisma.config.ts` e o adapter (`@prisma/adapter-pg`) é passado ao construtor do `PrismaClient`. Isso desacopla a conexão do schema e permite usar connection poolers sem alterar o schema.

### Por que JWT stateless em vez de sessions?

Simplicidade de deploy — sem necessidade de Redis ou tabela de sessões. O logout é implementado apenas no client (descarta o token do `localStorage`). Para invalidar tokens antes da expiração seria necessário implementar uma blocklist.

### Por que `localStorage` em vez de cookies httpOnly?

O projeto é client-side SPA sem SSR. Para cookies httpOnly funcionar bem seria necessário configurar o servidor para emitir e renovar cookies, adicionando complexidade. O `localStorage` é simples e funciona bem para o contexto atual. Em ambiente de produção com requisitos de segurança elevados, migrar para cookies httpOnly é recomendado.

### Por que atualização otimista no review de flashcards?

```ts
// UI responde imediatamente
setResults(updatedResults);

// API em background — falha silenciosa
reviewFlashcard(id, result, durationSec).catch(() => console.warn(...));
```

O usuário não deve esperar a API para continuar estudando. A falha de rede em uma resposta é aceitável — o card voltará para revisão na próxima vez.

### Por que `useDueCards` como hook e não Context?

Os cards pendentes são necessários em múltiplas páginas, mas o carregamento é rápido e o dado não precisa ser persistido entre sessões de navegação. Um hook simples com `refresh()` manual é suficiente sem a complexidade de um Context Provider ou estado global.

### Separação `pergunta`/`resposta` vs `question`/`answer`

A IA responde em português (`pergunta`, `resposta`) por instrução do prompt. O banco armazena em inglês (`question`, `answer`) para consistência com o resto do schema. A conversão acontece no `DeckController.generate` na hora de criar os flashcards:

```ts
flashcards: { create: flashcards.map((f, idx) => ({
  question: f.pergunta,
  answer: f.resposta,
  order: idx,
})) }
```