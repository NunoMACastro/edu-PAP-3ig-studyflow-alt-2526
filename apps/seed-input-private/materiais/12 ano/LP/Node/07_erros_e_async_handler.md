![Header](../Images/Header.png)

# Node.js (12.º Ano) - 07 · Erros e asyncHandler

> **Objetivo deste ficheiro**
>
> - Centralizar respostas de erro numa API Express.
> - Distinguir erros 404, erros de validação e erros internos.
> - Usar `asyncHandler` para encaminhar erros assíncronos.
> - Evitar fuga de informação sensível em produção.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Modelo mental de erros em Express](#sec-1)
- [2. [ESSENCIAL] `notFound` e `errorHandler`](#sec-2)
- [3. [ESSENCIAL] `asyncHandler`](#sec-3)
- [4. [ESSENCIAL+] `HttpError`](#sec-4)
- [5. [EXTRA] Formato consistente de erro](#sec-5)
- [Exercícios - Erros e asyncHandler](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo melhora a robustez da API. Quando algo falha, o servidor deve responder de forma previsível, sem duplicar `try/catch` em todos os endpoints.

- **Núcleo do tema:** as secções [ESSENCIAL] criam 404, handler global e `asyncHandler`.
- **Aprofundamento:** as secções [ESSENCIAL+] criam erros HTTP reutilizáveis.
- **Contexto adicional:** as secções [EXTRA] alinham o formato de erro com o frontend.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Modelo mental de erros em Express

### 1.1 O fluxo normal

```text
pedido
  ↓
middlewares
  ↓
rota/controller
  ↓
resposta
```

Quando há erro, queremos outro caminho:

```text
erro
  ↓
next(err)
  ↓
middleware de erro
  ↓
resposta JSON consistente
```

---

### 1.2 Middleware de erro tem quatro parâmetros

Express reconhece um middleware de erro pela assinatura:

```js
function errorHandler(err, req, res, next) {
    // ...
}
```

Mesmo que não uses todos os parâmetros, eles devem existir na assinatura.

---

### 1.3 Tipos de erro comuns

| Situação | Status comum |
| --- | --- |
| Rota não existe | `404` |
| Recurso não existe | `404` |
| Dados inválidos | `400` ou `422` |
| Sem autenticação | `401` |
| Sem permissão | `403` |
| Erro inesperado no servidor | `500` |

---

### 1.4 Erros comuns

- Devolver sempre status `500`.
- Mostrar `err.stack` em produção.
- Ter formatos de erro diferentes em cada controller.

### 1.5 Checkpoint

- Como Express reconhece um middleware de erro?
- Porque é que erro de validação não deve ser `500`?
- Que informação nunca deve ser enviada em produção?

<a id="sec-2"></a>

## 2. [ESSENCIAL] `notFound` e `errorHandler`

### 2.1 `notFound`

```js
// src/middlewares/errors.js
export function notFound(_req, res) {
    res.status(404).json({
        error: {
            code: "ROUTE_NOT_FOUND",
            message: "Rota não encontrada",
            details: [],
        },
    });
}
```

Este middleware deve ficar depois das rotas.

---

### 2.2 `errorHandler`

```js
// src/middlewares/errors.js
export function errorHandler(err, _req, res, _next) {
    const status = err.statusCode || err.status || 500;
    const isProduction = process.env.NODE_ENV === "production";

    const payload = {
        error: {
            code: err.code || "INTERNAL_ERROR",
            message:
                status >= 500 && isProduction
                    ? "Erro interno"
                    : err.message || "Erro inesperado",
            details: err.details || [],
        },
    };

    if (!isProduction) {
        payload.error.stack = err.stack;
    }

    res.status(status).json(payload);
}
```

Em desenvolvimento, `stack` ajuda a descobrir ficheiro e linha.

Em produção, a API deve evitar expor detalhes internos.

---

### 2.3 Ligar no `app.js`

```js
import { errorHandler, notFound } from "./middlewares/errors.js";

// rotas antes
app.use("/api/v1/todos", todosRouter);

// erros no fim
app.use(notFound);
app.use(errorHandler);
```

---

### 2.4 Erros comuns

- Colocar `notFound` antes dos routers.
- Esquecer `app.use(errorHandler)` no fim.
- Enviar resposta no controller e depois chamar `next(err)`.

### 2.5 Checkpoint

- Porque é que `notFound` fica depois das rotas?
- Qual é o papel de `errorHandler`?
- Como o handler decide se mostra stack trace?

<a id="sec-3"></a>

## 3. [ESSENCIAL] `asyncHandler`

### 3.1 O problema

Controllers assíncronos podem lançar erros:

```js
export async function listar(_req, res) {
    const todos = await todosService.listar();
    res.json(todos);
}
```

Se `todosService.listar()` falhar, queremos que o erro chegue ao `errorHandler`.

---

### 3.2 Implementação

```js
// src/utils/asyncHandler.js
/**
 * Encaminha erros de handlers assíncronos para o middleware de erro do Express.
 *
 * @param {Function} fn
 * @returns {Function}
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
```

---

### 3.3 Uso no controller

```js
// src/controllers/todos.controller.js
import * as todosService from "../services/todos.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listar = asyncHandler(async (_req, res) => {
    const todos = await todosService.listar();
    res.json(todos);
});

export const criar = asyncHandler(async (req, res) => {
    const novo = await todosService.criar(req.body);
    res.status(201).json(novo);
});
```

O controller fica limpo e não precisa de repetir `try/catch`.

---

### 3.4 Erros comuns

- Esquecer de usar `asyncHandler` em controllers com `await`.
- Fazer `try/catch` em todas as rotas sem necessidade.
- Apanhar o erro e não o encaminhar com `next(err)`.

### 3.5 Checkpoint

- O que faz `asyncHandler`?
- Porque é que `Promise.resolve(...).catch(next)` funciona?
- Em que tipo de controller deves usar este padrão?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] `HttpError`

### 4.1 Criar uma classe de erro HTTP

```js
// src/utils/HttpError.js
export class HttpError extends Error {
    constructor(message, statusCode = 500, options = {}) {
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode;
        this.code = options.code || "HTTP_ERROR";
        this.details = options.details || [];
    }
}
```

---

### 4.2 Usar no service

```js
import { HttpError } from "../utils/HttpError.js";
import * as todosRepository from "../repositories/todos.repo.file.js";

export async function obter(id) {
    const todo = await todosRepository.obter(id);

    if (!todo) {
        throw new HttpError("Tarefa não encontrada", 404, {
            code: "NOT_FOUND",
        });
    }

    return todo;
}
```

Agora o controller pode ficar mais direto:

```js
export const obter = asyncHandler(async (req, res) => {
    const todo = await todosService.obter(req.params.id);
    res.json(todo);
});
```

---

### 4.3 Validação com `HttpError`

```js
throw new HttpError("Dados inválidos", 422, {
    code: "VALIDATION_ERROR",
    details: [{ field: "titulo", message: "Obrigatório" }],
});
```

O `errorHandler` transforma isto numa resposta JSON consistente.

---

### 4.4 Checkpoint

- Que vantagem tem lançar `HttpError` no service?
- Que propriedades são importantes num erro HTTP?
- Porque é que o controller fica mais simples?

<a id="sec-5"></a>

## 5. [EXTRA] Formato consistente de erro

Um formato previsível ajuda o frontend a mostrar mensagens sem muitos casos especiais:

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Dados inválidos",
        "details": [
            { "field": "titulo", "message": "Obrigatório" }
        ]
    }
}
```

Regras práticas:

- `code` é estável e útil para lógica;
- `message` é legível;
- `details` guarda erros por campo;
- `stack` só aparece em desenvolvimento.

<a id="exercicios"></a>

## Exercícios - Erros e asyncHandler

1. Cria `src/middlewares/errors.js` com `notFound` e `errorHandler`.
2. Liga ambos no fim do `app.js`.
3. Cria `src/utils/asyncHandler.js`.
4. Atualiza os controllers para usar `asyncHandler`.
5. Cria `src/utils/HttpError.js`.
6. Altera `todosService.obter(id)` para lançar `HttpError` quando não encontra a tarefa.
7. Faz um pedido para um `id` inexistente e confirma status `404`.
8. Faz uma rota que lança `new Error("Falha teste")` e confirma que o handler global responde.
9. Define `NODE_ENV=production` e confirma que `stack` não aparece na resposta.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, modelo mental, `HttpError`, checkpoints e exercícios.
- 2025-11-10: criação do capítulo com 404, 500 e `asyncHandler`.

![Footer](../Images/Footer.png)
