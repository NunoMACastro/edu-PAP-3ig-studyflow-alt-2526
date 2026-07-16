![Header](../Images/Header.png)

# Documentação (12.º Ano) - 04 · Documentação da API

> **Objetivo deste ficheiro**
> Documentar endpoints com exemplos claros.
> Explicar autenticação, erros e status codes.
> Incluir paginação, filtros e uploads.

---

## Índice

-   [0. Enquadramento do material](#sec-0)
-   [1. [ESSENCIAL] Endpoints com request/response](#sec-1)
-   [2. [ESSENCIAL] Autenticação e autorização](#sec-2)
-   [3. [ESSENCIAL] Erros e status codes](#sec-3)
-   [4. [ESSENCIAL] Paginação, filtros e uploads](#sec-4)
-   [5. [EXTRA] OpenAPI e Postman](#sec-5)
-   [Erros comuns](#erros-comuns)
-   [Boas práticas](#boas-práticas)
-   [Checkpoint](#checkpoint)
-   [Exercícios - API](#exercícios)
-   [Changelog](#changelog)

<a id="sec-0"></a>

## 0. Enquadramento do material

Esta secção situa o ficheiro dentro do módulo de Documentação e clarifica o tipo de informação que o tema ajuda a organizar.

- **Núcleo do tema:** as secções [ESSENCIAL] apresentam os elementos que tornam a documentação clara para leitores diferentes.
- **Aprofundamento:** as secções [EXTRA] acrescentam detalhe, critérios de qualidade ou exemplos de aplicação.
- **Ligação ao percurso:** os checkpoints e exercícios relacionam a documentação com projetos React, Node/Express, MongoDB e fullstack.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Endpoints com request/response

Vais aprender a **descrever cada endpoint** com exemplos reais. Isto evita que o frontend adivinhe formatos.

### O que é um request e um response

-   **Request:** o pedido que fazes (método, URL, body, headers).
-   **Response:** o que o servidor devolve (status + JSON).

### Estrutura recomendada

-   **Método + URL**
-   **Body** (se existir)
-   **Resposta** (status + JSON)

### Nota de consistência

Cada endpoint deve referenciar o modelo de dados relevante (ver `05_documentacao_dados.md`) e listar os erros possíveis.

### Exemplo

```text
GET /api/tarefas
200 OK
{
  "items": [ { "_id": "...", "titulo": "Estudar", "feito": false } ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

```text
POST /api/tarefas
Body: { "titulo": "Rever React" }

201 Created
{ "_id": "...", "titulo": "Rever React", "feito": false }
```

### Dica

Escreve sempre pelo menos 1 exemplo de sucesso e 1 exemplo de erro.

### Nota sobre o envelope

Devolvemos sempre `{ items, page, limit, total }` para o frontend e os testes serem mais simples e previsíveis.
Mesmo sem query params, usamos defaults (`page=1`, `limit=20`).

<a id="sec-2"></a>

## 2. [ESSENCIAL] Autenticação e autorização

Vais aprender a explicar **quem pode usar o quê** na tua API.

### O essencial

-   **Autenticação:** quem és.
-   **Autorização:** o que podes fazer.

### Exemplo simples (explicado)

-   `GET /auth/me` -> devolve o utilizador atual **se estiver autenticado**.
-   Se não estiver autenticado, o backend devolve `401`.
-   Se estiver autenticado mas não tiver permissão, devolve `403`.

### Exemplo simples

-   `GET /auth/me` -> devolve utilizador atual.
-   `401` se não estiver autenticado.

<a id="sec-3"></a>

## 3. [ESSENCIAL] Erros e status codes

Vais aprender a explicar **como a API responde quando algo corre mal**, para o frontend conseguir mostrar mensagens certas.

### Formato padrão

```json
{ "error": { "code": "SOME_CODE", "message": "Mensagem", "details": [] } }
```

### O que é um status code

É um número que indica o resultado do pedido. Ex.: `200` = ok, `404` = não encontrado.

### Lista rápida

-   **400** INVALID_ID
-   **401** NOT_AUTHENTICATED
-   **403** FORBIDDEN
-   **404** NOT_FOUND
-   **409** DUPLICATE_KEY
-   **422** VALIDATION_ERROR

### Exemplo de erro

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Título é obrigatório", "details": ["titulo"] } }
```

### O que documentar

-   Que erros cada endpoint pode devolver.
-   O formato do erro.
-   Como o frontend deve mostrar a mensagem.
-   O modelo de dados relevante (ver `05_documentacao_dados.md`).

<a id="sec-4"></a>

## 4. [ESSENCIAL] Paginação, filtros e uploads

Vais explicar como **pedir listas grandes**, como **filtrar resultados** e como **enviar ficheiros**.

### Paginação

```
GET /api/tarefas?page=1&limit=20
```

### Filtros (exemplo simples)

```
GET /api/tarefas?q=estudar&feito=false
GET /api/tarefas?sort=createdAt&order=desc
```

### Resposta recomendada

```json
{ "items": [], "page": 1, "limit": 20, "total": 42 }
```

### O que documentar na paginação

-   O significado de `page` e `limit`.
-   O que acontece se não enviar parâmetros.
-   Se existe limite máximo.
-   Que campos podem ser usados no `sort` (ex.: `createdAt`, `updatedAt`).

> **Nota:** o backend deve garantir `createdAt/updatedAt` (timestamps).

### Upload

-   `POST /api/upload`
-   Body: `multipart/form-data`

### O que documentar no upload

-   Tipos de ficheiro aceites (ex.: `.png`, `.jpg`).
-   Tamanho máximo.
-   Campo esperado (ex.: `file`).

<a id="sec-5"></a>

## 5. [EXTRA] OpenAPI e Postman

-   **OpenAPI:** formato padrão para descrever endpoints.
-   **Postman/Insomnia:** coleções para testar pedidos.

Mesmo que não uses OpenAPI, um README com exemplos já ajuda muito.

<a id="erros-comuns"></a>

## Erros comuns

-   Descrever endpoints sem exemplos reais.
-   Ignorar erros e status codes.
-   Misturar auth com endpoints públicos.
-   Não dizer quais são obrigatórios e quais são opcionais.

<a id="boas-práticas"></a>

## Boas práticas

-   Mantém exemplos pequenos e reais.
-   Mostra pelo menos 1 erro por endpoint.
-   Atualiza quando mudares a API.
-   Usa sempre o mesmo formato de erro.

<a id="checkpoint"></a>

## Checkpoint

-   Um colega consegue usar a API só com a tua documentação?
-   As respostas de erro estão claras e consistentes?

<a id="exercícios"></a>

## Exercícios - API

1. Documenta `GET /api/tarefas` com exemplo real.
2. Documenta `POST /api/tarefas` com erro de validação.
3. Adiciona um bloco de paginação com `page/limit`.
4. Adiciona um exemplo de filtro e explica o que faz.

<a id="changelog"></a>

## Changelog

-   2026-01-14: criação do ficheiro sobre documentação da API.
-   2026-01-14: expansão pedagógica com explicações e exemplos detalhados.
-   2026-01-14: checklist de documentação oficial por endpoint.
-   2026-01-14: alinhado com a estrutura mínima e completa de documentação.
-   2026-01-14: GET com envelope, sort por createdAt e ligações a dados.

![Footer](../Images/Footer.png)
