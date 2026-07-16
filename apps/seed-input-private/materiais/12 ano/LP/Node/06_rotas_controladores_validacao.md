![Header](../Images/Header.png)

# Node.js (12.º Ano) - 06 · Rotas, controladores e validação

> **Objetivo deste ficheiro**
>
> - Criar routers Express por recurso.
> - Implementar controladores com responsabilidades claras.
> - Validar `params`, `body` e `query`.
> - Comparar validação manual com validação usando Zod.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Router de `todos`](#sec-1)
- [2. [ESSENCIAL] Controller de `todos`](#sec-2)
- [3. [ESSENCIAL] Validação manual](#sec-3)
- [4. [ESSENCIAL+] Validação com Zod](#sec-4)
- [5. [EXTRA] Query strings para filtros](#sec-5)
- [Exercícios - Rotas, controladores e validação](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo transforma endpoints soltos numa API organizada por recurso. O recurso usado nos exemplos é `todos`.

- **Núcleo do tema:** as secções [ESSENCIAL] criam router, controller e validação manual.
- **Aprofundamento:** as secções [ESSENCIAL+] mostram validação com schemas.
- **Contexto adicional:** as secções [EXTRA] introduzem filtros por query string.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Router de `todos`

### 1.1 Modelo mental

Um router agrupa rotas relacionadas.

Em vez de ter todas as rotas no `app.js`, podes ter:

```text
src/routes/todos.router.js
```

E montar no `app.js`:

```js
import todosRouter from "./routes/todos.router.js";

app.use("/api/v1/todos", todosRouter);
```

Assim, dentro do router, `/` significa `/api/v1/todos`.

---

### 1.2 Router completo

```js
// src/routes/todos.router.js
import { Router } from "express";
import * as todosController from "../controllers/todos.controller.js";

const router = Router();

router.get("/", todosController.listar);
router.get("/:id", todosController.obter);
router.post("/", todosController.criar);
router.patch("/:id", todosController.atualizar);
router.delete("/:id", todosController.remover);

export default router;
```

---

### 1.3 Verbos HTTP no recurso

| Método | Rota completa | Função |
| --- | --- | --- |
| `GET` | `/api/v1/todos` | listar |
| `GET` | `/api/v1/todos/:id` | obter |
| `POST` | `/api/v1/todos` | criar |
| `PATCH` | `/api/v1/todos/:id` | atualizar parcialmente |
| `DELETE` | `/api/v1/todos/:id` | remover |

---

### 1.4 Erros comuns

- Montar o router em `/api/v1/todos` e depois repetir `/todos` dentro do router.
- Usar `POST` para tudo.
- Misturar plural e singular, como `/todo` e `/todos`.

### 1.5 Checkpoint

- O que significa `/:id` numa rota?
- Porque é que o router usa `/` para listar todos?
- Qual é o método correto para remover um recurso?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Controller de `todos`

### 2.1 Controller completo

```js
// src/controllers/todos.controller.js
import * as todosService from "../services/todos.service.js";

export async function listar(_req, res) {
    const todos = await todosService.listar();
    res.json(todos);
}

export async function obter(req, res) {
    const todo = await todosService.obter(req.params.id);

    if (!todo) {
        return res.status(404).json({
            error: {
                code: "NOT_FOUND",
                message: "Tarefa não encontrada",
                details: [],
            },
        });
    }

    res.json(todo);
}

export async function criar(req, res) {
    const novo = await todosService.criar(req.body);
    res.status(201).json(novo);
}

export async function atualizar(req, res) {
    const todo = await todosService.atualizar(req.params.id, req.body);

    if (!todo) {
        return res.status(404).json({
            error: {
                code: "NOT_FOUND",
                message: "Tarefa não encontrada",
                details: [],
            },
        });
    }

    res.json(todo);
}

export async function remover(req, res) {
    const removido = await todosService.remover(req.params.id);

    if (!removido) {
        return res.status(404).json({
            error: {
                code: "NOT_FOUND",
                message: "Tarefa não encontrada",
                details: [],
            },
        });
    }

    res.status(204).send();
}
```

No capítulo 07, estas funções vão ser embrulhadas com `asyncHandler` para encaminhar erros assíncronos.

---

### 2.2 Responsabilidades do controller

O controller deve:

- ler dados do pedido;
- chamar o service;
- escolher status HTTP;
- formatar a resposta.

O controller não deve:

- abrir ficheiros diretamente;
- conter regras complexas de negócio;
- conhecer detalhes de base de dados.

---

### 2.3 Erros comuns

- Fazer validação, regra de negócio e persistência toda no controller.
- Esquecer `return` depois de uma resposta de erro.
- Devolver body num `204 No Content`.

### 2.4 Checkpoint

- Que camada o controller chama?
- Porque é que `remover` devolve `204` quando corre bem?
- O que pode acontecer se faltares ao `return` depois de `res.status(404).json(...)`?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Validação manual

### 3.1 Validar criação

Antes de guardar dados, valida o input.

```js
function validarCriacaoTodo(body) {
    const titulo = typeof body.titulo === "string" ? body.titulo.trim() : "";

    if (!titulo) {
        return {
            ok: false,
            status: 422,
            error: {
                code: "VALIDATION_ERROR",
                message: "Título é obrigatório",
                details: [{ field: "titulo", message: "Obrigatório" }],
            },
        };
    }

    return {
        ok: true,
        value: {
            titulo,
            concluido:
                typeof body.concluido === "boolean" ? body.concluido : false,
        },
    };
}
```

Uso no controller:

```js
export async function criar(req, res) {
    const result = validarCriacaoTodo(req.body);

    if (!result.ok) {
        return res.status(result.status).json({ error: result.error });
    }

    const novo = await todosService.criar(result.value);
    res.status(201).json(novo);
}
```

---

### 3.2 Validar `id`

Para um primeiro projeto, podes aceitar `id` como string não vazia:

```js
function validarId(id) {
    return typeof id === "string" && id.trim().length > 0;
}
```

Se usares `crypto.randomUUID()`, faz sentido validar UUID no capítulo com Zod.

---

### 3.3 Erros comuns

- Confiar em `req.body` sem validar.
- Validar apenas no frontend. O backend tem sempre de validar também.
- Devolver mensagens de erro diferentes em cada endpoint.

### 3.4 Checkpoint

- Porque é que o backend tem de validar mesmo quando o frontend já validou?
- Porque é que `422` é adequado para erro de validação?
- Que formato de erro estás a usar?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Validação com Zod

### 4.1 Instalar

```bash
npm i zod
```

Zod justifica-se quando tens vários endpoints e queres declarar contratos de dados num formato consistente.

---

### 4.2 Schemas

```js
// src/schemas/todo.schemas.js
import { z } from "zod";

export const idParamSchema = z.object({
    id: z.string().uuid("id precisa de ser um UUID válido"),
});

export const todoCreateSchema = z.object({
    titulo: z.string().trim().min(1, "Título é obrigatório"),
    concluido: z.boolean().optional().default(false),
});

export const todoUpdateSchema = z
    .object({
        titulo: z.string().trim().min(1).optional(),
        concluido: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: "Envia pelo menos um campo para atualizar",
    });
```

---

### 4.3 Middleware `validate`

```js
// src/middlewares/validate.js
import { ZodError } from "zod";

export function validate(schemas = {}) {
    return (req, res, next) => {
        try {
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }

            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }

            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }

            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(422).json({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Dados inválidos",
                        details: err.issues.map((issue) => ({
                            field: issue.path.join("."),
                            message: issue.message,
                        })),
                    },
                });
            }

            next(err);
        }
    };
}
```

---

### 4.4 Router com validação

```js
// src/routes/todos.router.js
import { Router } from "express";
import * as todosController from "../controllers/todos.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    idParamSchema,
    todoCreateSchema,
    todoUpdateSchema,
} from "../schemas/todo.schemas.js";

const router = Router();

router.get("/", todosController.listar);
router.get("/:id", validate({ params: idParamSchema }), todosController.obter);
router.post("/", validate({ body: todoCreateSchema }), todosController.criar);
router.patch(
    "/:id",
    validate({ params: idParamSchema, body: todoUpdateSchema }),
    todosController.atualizar
);
router.delete(
    "/:id",
    validate({ params: idParamSchema }),
    todosController.remover
);

export default router;
```

---

### 4.5 Checkpoint

- Que problema o Zod resolve?
- Porque é útil validar `params` e não apenas `body`?
- O que acontece se o `id` não for UUID?

<a id="sec-5"></a>

## 5. [EXTRA] Query strings para filtros

### 5.1 Exemplo de rota

```text
GET /api/v1/todos?concluido=true&q=node
```

`req.query` contém os valores da query string:

```js
export async function listar(req, res) {
    const filtros = {
        concluido: req.query.concluido,
        q: req.query.q,
    };

    const todos = await todosService.listar(filtros);
    res.json(todos);
}
```

Lembra-te: valores vindos da query string chegam como strings. `concluido=true` chega como `"true"`.

---

### 5.2 Schema para query

```js
export const todoQuerySchema = z.object({
    concluido: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => (value === undefined ? undefined : value === "true")),
    q: z.string().trim().optional(),
});
```

<a id="exercicios"></a>

## Exercícios - Rotas, controladores e validação

1. Cria `src/routes/todos.router.js` com as cinco rotas principais.
2. Monta o router em `/api/v1/todos`.
3. Cria `src/controllers/todos.controller.js`.
4. Implementa `listar`, `obter`, `criar`, `atualizar` e `remover`.
5. Adiciona validação manual ao `POST`.
6. Faz um erro de propósito: envia `{ "titulo": "" }` e confirma status `422`.
7. Instala Zod e cria `todo.schemas.js`.
8. Cria o middleware `validate`.
9. Liga o middleware ao router.
10. (EXTRA) Adiciona `GET /api/v1/todos?q=node` e filtra por texto.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, validação manual, Zod, checkpoints e exercícios.
- 2025-11-10: criação do capítulo com router, controller e validação opcional.

![Footer](../Images/Footer.png)
