# CONFIGURAÇÕES DO AMBIENTE

## Pré-requisitos

- Node.js instalado
- pnpm instalado
- Docker Desktop rodando

## **Para configuração do repositório**

**1. Clonar o Repositório** 

`git clone https://github.com/sofiaavallone/MEMORA`

**2. Instalar as Dependências (pnpm)**

Como usamos o **pnpm**, você precisa instalar as bibliotecas nas duas pastas:

**No terminal:** cd client

`pnpm install`

`cd ../server`

`pnpm install`

**3. Configurar as Variáveis de Ambiente (.env)**

**No Backend (server/.env):** Crie o arquivo `.env` e cole: DATABASE_URL="postgresql://admin:password123@localhost:5432/gemini_app?schema=public" 

GEMINI_API_KEY="COLE_SUA_CHAVE_AQUI" 

PORT=3001

**4. Subir o Banco de Dados (Docker)**

Certifique-se de que o **Docker Desktop** está aberto. Na raiz do projeto, rode: 

`docker-compose up -d`

**5. Sincronizar o Prisma (Banco de Dados)**

Para que o seu banco local tenha as tabelas que criamos, vá na pasta server e rode: 

`cd server`

`pnpm prisma generate`

`pnpm prisma migrate dev --name init`

Obs: certifique-se de que o container do banco está rodando (`docker compose up -d`)

**6. Como Rodar o Projeto**

Agora, abra **dois terminais**:

- **Terminal 1 (Backend):**

`cd server` 

`pnpm dev`

- **Terminal 2 (Frontend):**

`cd ../client`

`pnpm dev`

## **Guia de uso da API**

1. Abra o terminal do seu notebook e digite `git clone https://github.com/sofiaavallone/MEMORA`
2. Certifique-se de que o pnpm e o tsx estão instalados em sua máquina:
    
    ```python
    # 1. Instala o pnpm no seu computador (se ainda não tiver)
    npm install -g pnpm
    
    # 2. Instala o TSX globalmente (Nossa ferramenta para rodar TypeScript sem erros)
    npm install -g tsx
    ```
    
3. Instale os principais pacotes
    
    ```python
    pnpm install
    ```
    
4. Na pasta server, crie um arquivo  `.env`
    1. No arquivo criado, escreva `DATABASE_URL="postgresql://admin:password123@localhost:5432/gemini_app?schema=public"
    GEMINI_API_KEY=sua_chave_secreta_aqui_sem_aspas
    PORT=3001`
    2. Onde está escrito `sua_chave_secreta_aqui_sem_aspas` coloque sua chave API gerada no google AI studio.

    Obs: nunca subir o .env para o GitHub!
5. Após isso, basta executar o arquivo principal, ao digitar no terminal:
    1. `cd ./server`
    2. `npx tsx api/requisicao.ts`
6. Pronto! Espere um pouquinho e a resposta já chegará via terminal 
    1. A resposta esperada virá em formato JSON (delimitado por `{}` e composto de pares `chave:valor`)


# PADRÃO DE DESENVOLVIMENTO

### Padrão de commit
Ex.: feat: adiciona tela de login

fix: corrige validação do formulário

### Pull Request

Quando der `push` depois de criar uma nova feat ou fix

```
O que eu fiz

- Detalhando o que foi feito na branch

Como testar

- Passo 1
- Passo 2
- Passo 3
```

### Padrão de branch

Sempre que for mexer no código, seja para criar uma feat ou fazer um fix:

1. `git pull origin develop`
2. `git checkout -b nome-da-branch`

- feat/oqueFez: uma nova feature
- fix/oqueFez: conserto de algo

Ex: feat/telaLogin
