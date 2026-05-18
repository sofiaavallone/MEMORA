# Testes Sprint 3

Esta pasta concentra os testes de processamento de PDF e validação de entrada da rota `POST /decks/generate`. As decisões abaixo registram divergências entre os critérios descritos no Notion e o estado atual do código, para evitar retrabalho na revisão.

## Decisões

**1. PDF chega como URL, não upload.** O schema de `generate` aceita `pdfUrl` opcional (`z.string().url()`). Não existe rota multipart para upload binário. O critério "rejeitar requisição sem PDF anexado" foi reinterpretado: quando `pdfUrl` é enviado, validamos que é URL bem formada e que o carregamento via `PdfManager` falha de forma controlada quando o conteúdo é inacessível ou inválido. Requisições sem `pdfUrl` são legítimas (geração só pelo tópico).

**2. `quantity` aceita range, não enum.** O schema atual é `z.coerce.number().int().min(5).max(50)`. O critério do Notion menciona apenas as opções 10/30/50. Como a constraint da sprint proíbe alterar código de produção, os testes validam o comportamento real: aceita 5..50, rejeita 0, negativos, 4, 51 e não-inteiros. Pendente alinhamento com produto.

**3. Sem limite de tamanho de PDF.** Não há checagem de bytes em `PdfManager`. O único corte temporal é o `DOWNLOAD_TIMEOUT_MS = 30_000` que aborta o `fetch` via `AbortController`. O caso "PDF muito grande" é coberto simulando o `AbortError`, garantindo que o erro propaga com mensagem legível e o servidor não trava.

**4. `PdfManager` não faz parsing.** A classe apenas carrega bytes (Buffer, URL ou arquivo local) e empacota num `Blob` com mime `application/pdf`. Corrupção real do PDF só seria detectada pelo Gemini, que está fora do escopo desta suíte. Os testes cobrem o que o `PdfManager` consegue distinguir: URL retornando 404, Content-Type inesperado (warning), arquivo local inexistente e timeout.

**5. Nomenclatura segue o código.** O campo é `topic`, não `tema`. `quantity`, não `quantidade`. Os testes não introduzem nomes paralelos.

## Pendências para alinhamento

- Definir se `quantity` deve virar enum 10/30/50 ou permanecer range.
- Decidir se o backend deve aceitar upload multipart de PDF ou se a URL é a interface final.
- Definir limite de tamanho explícito (atualmente o único guardrail é o timeout de download).

## Como rodar

Da pasta `server/`:

```
npm install
npm test
```

Para rodar um arquivo específico:

```
npx vitest run PdfManager
npx vitest run DeckController.generate.validation
```

Para cobertura:

```
npx vitest run --coverage
```
