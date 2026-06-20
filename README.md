<div align="center">

# 🧠 MEMORA

### Plataforma de estudo com IA — transforme seus PDFs em flashcards e estude com repetição espaçada

**Pare de perder horas montando material de revisão. Suba o conteúdo, deixe a IA criar os flashcards e estude o que importa, na hora certa.**

`TypeScript` · `React` · `Express` · `Prisma` · `PostgreSQL` · `Google Gemini`

</div>

---

## 📑 Sumário

1. [O problema](#-o-problema)
2. [A solução](#-a-solução)
3. [Funcionalidades](#-funcionalidades)
4. [Fundamentação pedagógica](#-fundamentação-pedagógica)
5. [Arquitetura](#-arquitetura)
6. [Stack tecnológica](#-stack-tecnológica)
7. [Como rodar o projeto](#-como-rodar-o-projeto)
8. [Variáveis de ambiente](#-variáveis-de-ambiente)
9. [Scripts disponíveis](#-scripts-disponíveis)
10. [API REST](#-api-rest)
11. [Estrutura de pastas](#-estrutura-de-pastas)
12. [Qualidade e testes](#-qualidade-e-testes)
13. [Equipe](#-equipe)

---

## 🎯 O problema

Estudar bem dá trabalho — mas grande parte desse trabalho é **preparação**, não aprendizado de fato. Estudantes universitários, vestibulandos e concurseiros enfrentam três dores recorrentes:

1. **Transformar conteúdo bruto em material de revisão** — montar flashcards e resumos manualmente consome horas.
2. **Manter revisões consistentes** ao longo do tempo, lutando contra a curva do esquecimento.
3. **Saber o que revisar primeiro** — sem dados, todo conteúdo parece igualmente urgente.

O resultado é o estudo passivo (reler e grifar), comprovadamente menos eficaz, adotado simplesmente porque o método ativo dá trabalho demais para preparar.

## 💡 A solução

O **MEMORA** automatiza a parte chata e mantém o estudante na parte que importa: revisar. Você faz upload de um PDF, define o tópico e a quantidade de cards, e a IA gera flashcards estruturados (pergunta/resposta) em segundos. A partir daí, um algoritmo de repetição espaçada decide **quais cards mostrar e quando**, priorizando o que você tem mais chance de esquecer.

> "Salvamos horas de digitação e devolvemos o foco para o estudo ativo, baseado em evidências."

## ✨ Funcionalidades

| Recurso | Descrição |
| --- | --- |
| 📄 **Geração de flashcards por IA** | Upload de PDF → flashcards pergunta/resposta gerados pelo Google Gemini |
| 🗂️ **Decks organizados** | Crie, edite e organize baralhos por matéria ou tópico |
| 🔁 **Repetição espaçada (SM-2)** | O sistema recalcula a próxima revisão de cada card conforme o seu desempenho |
| ⏰ **Cards pendentes ("due")** | Badge na sidebar mostra quantos cards estão prontos para revisar hoje |
| 📊 **Estatísticas de estudo** | Visão geral, *streak* de dias consecutivos e *sparkline* semanal |
| 💬 **Modo Tira-Dúvidas** | Botão "Me explique isso" gera uma explicação didática para o card que você errou |
| 🔐 **Autenticação** | Cadastro/login com e-mail e senha (JWT) e login com Google (OAuth) |

## 📚 Fundamentação pedagógica

O MEMORA não é só um gerador de flashcards — ele é construído sobre técnicas de aprendizagem com respaldo científico:

- **Active Recall (recordação ativa):** recuperar a informação da memória (responder) consolida muito mais do que reler. Cada flashcard força esse esforço de recuperação.
- **Spaced Repetition (repetição espaçada):** revisar em intervalos crescentes combate a curva do esquecimento. O algoritmo **SM-2** ajusta o intervalo de cada card individualmente.
- **Aprendizagem adaptativa:** o desempenho do estudante alimenta a priorização, concentrando esforço nos conteúdos mais difíceis.

**Inspirações:** Anki (repetição espaçada), Quizlet (flashcards), RemNote (notas + cards) e Duolingo (adaptatividade) — com um diferencial central: **a automação da criação do material via IA.**

## 🏗 Arquitetura

O MEMORA adota o padrão **MVC (Model–View–Controller)**, dividido em duas camadas físicas independentes que se comunicam por uma **API REST**:

```
┌─────────────────────┐         REST/JSON          ┌──────────────────────────┐
│   CLIENT (View)     │  ───────────────────────▶  │   SERVER (Controller)     │
│   React + Vite      │                            │   Express 5 + TypeScript  │
│   TypeScript        │  ◀───────────────────────  │                           │
└─────────────────────┘                            └────────────┬──────────────┘
                                                                │
                                          ┌─────────────────────┼─────────────────────┐
                                          │                     │                     │
                                   ┌──────▼───────┐    ┌─────────▼────────┐   ┌────────▼────────┐
                                   │  Prisma ORM   │   │  GeminiService    │   │  authMiddleware │
                                   │  (Model)      │   │  (serviço de IA)  │   │  (JWT)          │
                                   └──────┬───────┘    └──────────────────┘   └─────────────────┘
                                          │
                                   ┌──────▼───────┐
                                   │  PostgreSQL   │
                                   └──────────────┘
```

| Camada MVC | Tecnologia | Responsabilidade |
| --- | --- | --- |
| **View** | React + TypeScript (Vite) | Interface, captura de eventos, exibição de dados |
| **Controller** | Express 5 + TypeScript | Validação de entrada, orquestração, respostas HTTP |
| **Model** | Prisma ORM + PostgreSQL | Persistência e regras de negócio de dados |
| **Serviço externo** | Google Gemini SDK | Geração de flashcards via IA (encapsulado no servidor) |

A integração com a IA fica **totalmente encapsulada** no `GeminiService` (upload do PDF, *polling* de processamento, chamada ao modelo, *parse* do JSON e limpeza do arquivo remoto). O frontend nunca conhece esses detalhes — ele só consome a API REST. Trocar o provedor de IA exige mudança apenas nessa classe.

## 🛠 Stack tecnológica

**Frontend (`client/`)**
- React + TypeScript, build com **Vite**
- **Zustand** para gerenciamento de estado
- Vitest + Testing Library para testes de GUI

**Backend (`server/`)**
- **Express 5** + TypeScript (ESM)
- **Prisma ORM** + **PostgreSQL**
- **Google Gemini SDK** (`@google/genai`) para geração de flashcards
- Autenticação com **JWT** + **OAuth Google**
- Vitest para testes de unidade/integração

**Infraestrutura**
- **Docker Compose** para o banco PostgreSQL
- **pnpm** como gerenciador de pacotes

## 🚀 Como rodar o projeto

### Pré-requisitos

| Ferramenta | Versão mínima | Verificação |
| --- | --- | --- |
| Node.js | 18.x | `node -v` |
| pnpm | 9.x | `pnpm -v` |
| Docker Desktop | — | `docker compose version` |
| Git | 2.x | `git --version` |

> Se não tiver o pnpm: `npm install -g pnpm`

### 1. Clonar o repositório

```bash
git clone https://github.com/sofiaavallone/MEMORA.git
cd MEMORA
```

### 2. Subir o banco de dados (Docker)

```bash
docker compose up -d
```

Isso sobe um PostgreSQL 15 na porta `5432`.

### 3. Configurar e iniciar o backend

```bash
cd server
pnpm install
cp .env.example .env        # preencha as variáveis (veja a seção abaixo)
pnpm prisma migrate dev     # aplica as migrações no banco
pnpm dev                    # sobe a API em http://localhost:3001
```

### 4. Iniciar o frontend

```bash
cd ../client
pnpm install
pnpm dev                    # sobe a aplicação em http://localhost:5173
```

Acesse **http://localhost:5173** no navegador. 🎉

## 🔑 Variáveis de ambiente

Crie um arquivo `.env` em `server/` a partir do `.env.example`:

```env
# Banco de dados PostgreSQL
DATABASE_URL="postgresql://admin:password123@localhost:5432/memora?schema=public"

# Chave de API do Gemini (obrigatória para gerar flashcards)
GEMINI_API_KEY=""

# Servidor
PORT=3001
NODE_ENV=development

# JWT — gere com:
# node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET="troque-este-valor-por-uma-string-longa-e-aleatoria"
JWT_EXPIRES_IN=30d

# CORS — múltiplas origens separadas por vírgula
CORS_ORIGIN=http://localhost:5173

# Google OAuth (opcional — login com Google fica desabilitado se vazio)
GOOGLE_CLIENT_ID=
```

> ⚠️ Os arquivos `.env` estão no `.gitignore` e **não devem ser commitados**.

## 📜 Scripts disponíveis

**Backend (`server/`)**

| Comando | Ação |
| --- | --- |
| `pnpm dev` | Sobe a API em modo watch (`tsx`) |
| `pnpm build` | Compila o TypeScript para `dist/` |
| `pnpm start` | Roda a build de produção |
| `pnpm test` | Executa a suíte de testes (Vitest) |
| `pnpm test:watch` | Testes em modo watch |

**Frontend (`client/`)**

| Comando | Ação |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento (Vite) |
| `pnpm build` | Type-check + build de produção |
| `pnpm preview` | Pré-visualiza a build |
| `pnpm lint` | Roda o ESLint |

## 🔌 API REST

Todas as rotas têm o prefixo `/api`. As rotas de decks, flashcards, stats e sessões exigem **JWT** (`Authorization: Bearer <token>`).

| Método | Rota | Descrição | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Health check | ❌ |
| `POST` | `/api/auth/register` | Cadastro | ❌ |
| `POST` | `/api/auth/login` | Login (e-mail/senha) | ❌ |
| `POST` | `/api/auth/google` | Login com Google (OAuth) | ❌ |
| `GET` | `/api/auth/me` | Dados do usuário logado | ✅ |
| `GET/POST` | `/api/decks` | Lista / cria decks (geração via IA) | ✅ |
| `POST` | `/api/flashcards/...` | Registra revisão (SM-2) e busca cards `/due` | ✅ |
| `GET` | `/api/stats` | Estatísticas de estudo | ✅ |
| `*` | `/api/sessions` | Sessões de estudo | ✅ |

## 📁 Estrutura de pastas

```
MEMORA/
├── client/                    # Frontend React + Vite
│   └── src/
│       ├── app/               # Páginas (decks, flashcard, review, upload, profile)
│       ├── components/        # Componentes (sidebar, modais, deckCard)
│       ├── hooks/             # Hooks (useDueCards)
│       ├── services/          # Chamadas à API (authService, deckService)
│       ├── store/             # Estado global Zustand (auth, deck, study)
│       └── tests/             # Testes de GUI
├── server/                    # Backend Express + Prisma
│   ├── prisma/                # Schema e migrações
│   └── src/
│       ├── controllers/       # AuthController, DeckController, FlashcardController, StatsController
│       ├── services/          # FlashcardService, GeminiService, PdfManager
│       ├── routes/            # Definição das rotas da API
│       ├── middleware/        # authMiddleware (JWT)
│       ├── prompts/           # FlashcardPromptBuilder
│       └── tests/             # Testes de unidade/integração
├── docker-compose.yml         # PostgreSQL
└── CONTRIBUTING.md            # Guia de contribuição da equipe
```

## ✅ Qualidade e testes

O projeto passou por uma análise de **arquitetura, qualidade e refactoring** (Sprint 3), com:

- **Análise estática** via ESLint 9.x + `@typescript-eslint` + `eslint-plugin-react-hooks`.
- **Métricas de complexidade** (complexidade ciclomática) e detecção de duplicação.
- **Plano de pagamento de dívida técnica** documentado (ver `MEMORA_Divida_Tecnica.docx`).
- Suítes de teste no backend (PDF, validação de entradas) e no frontend (exibição de flashcards).

Rode os testes com `pnpm test` em `server/` e `client/`.

## 👥 Equipe

Projeto desenvolvido pela **Equipe 5** na disciplina de Engenharia de Software:

**José Eduardo · Sofia Avallone · Cauã Emanuel · Amanda Muniz · Leonardo Gonçalves**

---

<div align="center">

*Estude menos tempo montando material. Estude mais tempo aprendendo.* — **MEMORA**

</div>
