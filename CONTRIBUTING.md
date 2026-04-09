# Guia de Contribuição — MEMORA

> Documento de referência para configuração do ambiente, padrões de desenvolvimento e fluxo de trabalho da Equipe 5.

---

## Sumário

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configuração do Ambiente](#2-configuração-do-ambiente)
3. [Executando o Projeto](#3-executando-o-projeto)
4. [Arquitetura do Projeto](#4-arquitetura-do-projeto)
5. [Fluxo de Trabalho Git](#5-fluxo-de-trabalho-git)
6. [Padrão de Commits](#6-padrão-de-commits)
7. [Pull Requests e Code Review](#7-pull-requests-e-code-review)
8. [Padrões de Código](#8-padrões-de-código)
9. [Teste da API (Script Standalone)](#9-teste-da-api-script-standalone)

---

## 1. Pré-requisitos

Antes de iniciar, certifique-se de que as seguintes ferramentas estão instaladas e funcionando:

| Ferramenta       | Versão mínima | Verificação             |
| ---------------- | ------------- | ----------------------- |
| Node.js          | 18.x          | `node -v`               |
| pnpm             | 9.x           | `pnpm -v`               |
| Docker Desktop   | —             | `docker compose version`|
| Git              | 2.x           | `git --version`         |

Caso não tenha o `pnpm` instalado:

```bash
npm install -g pnpm
```

---

## 2. Configuração do Ambiente

### 2.1. Clonar o Repositório

```bash
git clone https://github.com/sofiaavallone/MEMORA.git
cd MEMORA
```

### 2.2. Instalar as Dependências

O projeto é dividido em dois módulos (`client` e `server`). Instale as dependências de ambos:

```bash
# Frontend
cd client
pnpm install

# Backend
cd ../server
pnpm install
```

### 2.3. Configurar as Variáveis de Ambiente

Crie o arquivo `server/.env` com o seguinte conteúdo:

```env
DATABASE_URL="postgresql://admin:password123@localhost:5432/gemini_app?schema=public"
GEMINI_API_KEY=sua_chave_secreta_aqui
PORT=3001
```

> **Como obter a GEMINI_API_KEY:** Acesse o [Google AI Studio](https://aistudio.google.com/apikey), gere uma chave e cole no campo acima.

> ⚠️ **Nunca suba o arquivo `.env` para o repositório.** Ele já está incluído no `.gitignore`.

### 2.4. Subir o Banco de Dados (Docker)

Com o Docker Desktop aberto, na **raiz do projeto**, execute:

```bash
docker compose up -d
```

Verifique se o container está rodando:

```bash
docker compose ps
```

### 2.5. Sincronizar o Prisma (ORM)

Na pasta `server`, gere o client do Prisma e aplique as migrations:

```bash
cd server
pnpm prisma generate
pnpm prisma migrate dev --name init
```

> **Obs:** O container do banco de dados precisa estar rodando para este passo funcionar.

---

## 3. Executando o Projeto

Abra **dois terminais** na raiz do projeto:

**Terminal 1 — Backend:**

```bash
cd server
pnpm dev
```

O servidor estará disponível em: `http://localhost:3001`

**Terminal 2 — Frontend:**

```bash
cd client
pnpm dev
```

O cliente estará disponível em: `http://localhost:5173` (padrão do Vite)

---

## 4. Arquitetura do Projeto

```
MEMORA/
├── client/                  # Frontend — React + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── assets/
│   ├── package.json
│   └── vite.config.ts
│
├── server/                  # Backend — Express + TypeScript + Prisma + Gemini
│   ├── src/
│   │   ├── index.ts         # Entry point do servidor Express
│   │   ├── routes/          # Definição das rotas HTTP
│   │   ├── controllers/     # Lógica de requisição/resposta
│   │   ├── services/        # Regras de negócio e integração com IA
│   │   ├── lib/             # Utilitários (ex: instância do Prisma)
│   │   └── types/           # Interfaces e tipos TypeScript
│   ├── prisma/
│   │   └── schema.prisma    # Modelos do banco de dados
│   ├── api/
│   │   └── requisicao.ts    # Script standalone de teste da IA
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml       # Configuração do PostgreSQL via Docker
├── CONTRIBUTING.md           # Este arquivo
└── README.md
```

**Padrão arquitetural do Backend:** `Routes → Controllers → Services`

| Camada         | Responsabilidade                                            |
| -------------- | ----------------------------------------------------------- |
| **Routes**     | Definição dos endpoints HTTP e mapeamento para controllers  |
| **Controllers**| Validação de entrada, tratamento de erros, resposta HTTP    |
| **Services**   | Regras de negócio, integração com Gemini, operações no banco|
| **Types**      | Interfaces e tipos compartilhados do TypeScript             |
| **Lib**        | Instâncias singleton (Prisma, etc.)                         |

---

## 5. Fluxo de Trabalho Git

O projeto utiliza o modelo **Git Flow simplificado** com a branch `develop` como base.

### 5.1. Antes de começar qualquer tarefa

```bash
# 1. Ir para a branch develop e atualizar
git checkout develop
git pull origin develop

# 2. Criar a branch da tarefa a partir da develop
git checkout -b tipo/descricao-curta
```

### 5.2. Padrão de nomenclatura de branches

| Prefixo   | Uso                                  | Exemplo                   |
| --------- | ------------------------------------ | ------------------------- |
| `feat/`   | Nova funcionalidade                  | `feat/tela-login`         |
| `fix/`    | Correção de bug                      | `fix/validacao-formulario`|
| `refactor/`| Refatoração sem mudança funcional   | `refactor/servico-ia`     |
| `docs/`   | Alterações em documentação           | `docs/contributing`       |
| `chore/`  | Tarefas de manutenção (configs, CI)  | `chore/docker-setup`      |

> Utilize **kebab-case** (palavras separadas por hífen) nos nomes das branches.

### 5.3. Finalizando a tarefa

```bash
# Adicionar e commitar as alterações
git add .
git commit -m "feat: implementa endpoint de geração de flashcards"

# Subir a branch para o repositório remoto
git push origin feat/endpoint-generate
```

Em seguida, abra um **Pull Request** no GitHub apontando para a branch `develop`.

---

## 6. Padrão de Commits

O projeto adota o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/).

### Formato

```
tipo: descrição curta no imperativo
```

### Tipos permitidos

| Tipo         | Descrição                                |
| ------------ | ---------------------------------------- |
| `feat`       | Nova funcionalidade                      |
| `fix`        | Correção de bug                          |
| `refactor`   | Refatoração de código (sem mudança funcional) |
| `docs`       | Alteração em documentação                |
| `style`      | Formatação, ponto-e-vírgula, espaços     |
| `test`       | Adição ou correção de testes             |
| `chore`      | Tarefas de manutenção (build, configs)   |

### Exemplos

```
feat: adiciona tela de login
fix: corrige validação do formulário de cadastro
refactor: extrai lógica de geração para FlashcardService
docs: atualiza CONTRIBUTING com padrão de commits
chore: configura ESLint no backend
```

### Regras

- Sempre em **português**
- Usar o **imperativo** ("adiciona", não "adicionado" ou "adicionando")
- Primeira letra **minúscula** após o tipo
- Sem ponto final na descrição
- Máximo de **72 caracteres** na primeira linha

---

## 7. Pull Requests e Code Review

### 7.1. Abrindo um Pull Request

Todo PR deve apontar para a branch `develop` e seguir este template:

```markdown
## O que foi feito
- Descrever de forma clara as alterações realizadas

## Tipo da alteração
- [ ] Nova funcionalidade (feat)
- [ ] Correção de bug (fix)
- [ ] Refatoração (refactor)
- [ ] Documentação (docs)
- [ ] Manutenção (chore)

## Como testar
1. Passo a passo para validar a alteração
2. Incluir exemplos de requisição/resposta se for endpoint
3. Indicar cenários de sucesso e erro

## Checklist
- [ ] Código compila sem erros (`pnpm build`)
- [ ] Comentários em português no código
- [ ] Tipos TypeScript utilizados (sem `any` desnecessário)
- [ ] Prisma migrations geradas (se alterou schema)
- [ ] Testei localmente com o banco rodando
```

### 7.2. Code Review (QA)

O processo de Code Review é conduzido pelo QA da equipe:

1. O QA recebe o PR via notificação no GitHub
2. Faz checkout na branch e testa localmente
3. Verifica aderência aos padrões de código e arquitetura
4. Aprova ou solicita alterações com comentários construtivos
5. Após aprovação, o PR é mergeado na `develop`

> **Regra:** Nenhum PR é mergeado sem pelo menos **1 aprovação** de outro membro.

---

## 8. Padrões de Código

### 8.1. Linguagem e Comentários

- Todo código deve ser escrito em **TypeScript**
- Todos os comentários devem ser em **português brasileiro**
- Comentários devem explicar o **porquê**, não o **como**

```typescript
// ✅ BOM — explica a intenção
// Aguarda o processamento do PDF no Gemini antes de prosseguir
while (statusArquivo.state === "PROCESSING") { ... }

// ❌ RUIM — apenas repete o código
// Faz um while enquanto o estado é PROCESSING
while (statusArquivo.state === "PROCESSING") { ... }
```

### 8.2. TypeScript

- Evitar `any` — utilizar tipos explícitos ou `unknown` quando necessário
- Utilizar `interface` para contratos de dados e `type` para unions/aliases
- Exportar tipos de um arquivo centralizado (`src/types/index.ts`)

### 8.3. Nomenclatura

| Elemento        | Convenção       | Exemplo                     |
| --------------- | --------------- | --------------------------- |
| Arquivos        | camelCase       | `flashcardRoutes.ts`        |
| Classes         | PascalCase      | `FlashcardService`          |
| Interfaces      | PascalCase      | `GenerateRequest`           |
| Variáveis       | camelCase       | `statusArquivo`             |
| Constantes      | UPPER_SNAKE_CASE| `MAX_FLASHCARDS`            |
| Rotas HTTP      | kebab-case      | `/api/generate`             |
| Colunas Prisma  | camelCase (PT)  | `criadoEm`, `pergunta`      |

### 8.4. Estrutura de Endpoints

Todo novo endpoint deve seguir o padrão:

```
src/routes/      → Definição da rota
src/controllers/ → Validação + resposta HTTP
src/services/    → Lógica de negócio
src/types/       → Tipos da requisição/resposta
```

---

## 9. Teste da API (Script Standalone)

Para testar a integração com o Gemini **sem subir o servidor Express**, existe um script standalone:

```bash
cd server
npx tsx api/requisicao.ts
```

Este script:

- Faz download de um PDF de exemplo
- Envia para o Gemini 2.5 Flash
- Gera flashcards em formato JSON
- Exibe o resultado no terminal

> **Obs:** Este script usa o pacote `@google/genai` (diferente do servidor principal que usa `@google/generative-ai`). Certifique-se de que as dependências em `server/api/` estejam instaladas.

---

## Referências

- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express 5.x](https://expressjs.com/)
- [Google AI Studio](https://aistudio.google.com/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
