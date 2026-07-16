![Header](../Images/Header.png)

# Node.js (12.º Ano) - 04 · Express básico

> **Objetivo deste ficheiro**
>
> - Criar uma aplicação Express base com `app.js` e `server.js`.
> - Configurar middlewares globais essenciais.
> - Criar endpoints simples de API.
> - Perceber a ordem dos middlewares e o papel de cada bloco.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Separar `app.js` e `server.js`](#sec-1)
- [2. [ESSENCIAL] Middlewares globais](#sec-2)
- [3. [ESSENCIAL] Primeiros endpoints](#sec-3)
- [4. [ESSENCIAL+] 404 e erros iniciais](#sec-4)
- [5. [EXTRA] Ficheiros estáticos](#sec-5)
- [Exercícios - Express básico](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo cria a primeira versão da app Express que será reorganizada nos capítulos seguintes. Começa simples de propósito: primeiro é preciso ver a aplicação a responder.

- **Núcleo do tema:** as secções [ESSENCIAL] montam a app, middlewares e endpoints.
- **Aprofundamento:** as secções [ESSENCIAL+] introduzem o tratamento básico de rotas inexistentes.
- **Contexto adicional:** as secções [EXTRA] mostram como servir ficheiros estáticos.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Separar `app.js` e `server.js`

### 1.1 Modelo mental

`app.js` configura a aplicação.

`server.js` arranca a aplicação numa porta.

```text
src/app.js      -> cria e configura o Express
src/server.js   -> chama app.listen(...)
```

Esta separação permite testar `app.js` com Supertest sem abrir uma porta real.

---

### 1.2 `src/app.js`

```js
/**
 * Cria e configura a aplicação Express.
 */
import express from "express";

export const app = express();

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", ts: Date.now() });
});
```

---

### 1.3 `src/server.js`

```js
/**
 * Ponto de arranque do servidor HTTP.
 */
import { app } from "./app.js";

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";

app.listen(PORT, HOST, () => {
    console.log(`API a escutar em http://${HOST}:${PORT}`);
});
```

---

### 1.4 Testar no terminal

```bash
npm run dev
```

Depois abre:

```text
http://127.0.0.1:3000/api/health
```

Deves receber JSON:

```json
{
    "status": "ok",
    "ts": 1710000000000
}
```

---

### 1.5 Erros comuns

- Importar `./app` sem extensão `.js`.
- Chamar `app.listen` dentro de `app.js` e dificultar testes.
- Usar uma porta já ocupada.

### 1.6 Checkpoint

- Porque é que `app.js` e `server.js` ficam separados?
- Qual é a função de `app.listen`?
- O que devolve `/api/health`?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Middlewares globais

### 2.1 Instalar dependências

```bash
npm i cors helmet morgan compression
```

---

### 2.2 Adicionar middlewares

```js
/**
 * Cria e configura a aplicação Express.
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";

export const app = express();

app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: process.env.CORS_CREDENTIALS === "true",
    })
);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", ts: Date.now() });
});
```

---

### 2.3 O que cada middleware faz

| Middleware | Função |
| --- | --- |
| `helmet()` | Adiciona headers de segurança |
| `cors()` | Controla que origens podem chamar a API |
| `compression()` | Comprime respostas |
| `morgan()` | Regista pedidos HTTP no terminal |
| `express.json()` | Lê body JSON e cria `req.body` |
| `express.urlencoded()` | Lê dados de formulários HTML |

---

### 2.4 Ordem recomendada

1. Segurança e configuração global.
2. Logs e utilitários.
3. Parsers de body.
4. Rotas.
5. 404.
6. Handler de erro.

A ordem importa porque cada middleware recebe o pedido antes do próximo.

---

### 2.5 Erros comuns

- Colocar `express.json()` depois das rotas `POST`.
- Usar `credentials: true` com `origin: "*"`.
- Achar que `helmet()` substitui validação, autenticação ou autorização.

### 2.6 Checkpoint

- Para que serve `express.json()`?
- Porque é que CORS precisa de origem específica quando há credenciais?
- Em que ordem devem ficar rotas e 404?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Primeiros endpoints

### 3.1 Lista em memória

Antes de usar ficheiros JSON, podes começar com dados em memória:

```js
const todos = [
    { id: "1", titulo: "Estudar Express", concluido: false },
    { id: "2", titulo: "Criar uma rota GET", concluido: true },
];
```

---

### 3.2 `GET /api/v1/todos`

```js
app.get("/api/v1/todos", (_req, res) => {
    res.json(todos);
});
```

---

### 3.3 `GET /api/v1/todos/:id`

```js
app.get("/api/v1/todos/:id", (req, res) => {
    const todo = todos.find((item) => item.id === req.params.id);

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
});
```

---

### 3.4 `POST /api/v1/todos`

```js
// no topo de src/app.js
import crypto from "node:crypto";

app.post("/api/v1/todos", (req, res) => {
    const titulo =
        typeof req.body.titulo === "string" ? req.body.titulo.trim() : "";

    if (!titulo) {
        return res.status(422).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "Título é obrigatório",
                details: [{ field: "titulo", message: "Obrigatório" }],
            },
        });
    }

    const novo = {
        id: crypto.randomUUID(),
        titulo,
        concluido: false,
        criadoEm: Date.now(),
    };

    todos.push(novo);
    res.status(201).json(novo);
});
```

Este exemplo ainda usa memória. Quando o servidor reinicia, os dados desaparecem. A persistência em JSON entra no capítulo 08.

---

### 3.5 Erros comuns

- Devolver `200` quando crias um recurso. O mais adequado é `201`.
- Não validar `titulo` antes de criar.
- Esquecer que dados em memória desaparecem ao reiniciar.

### 3.6 Checkpoint

- Para que serve `req.params.id`?
- Porque é que `POST` deve devolver `201` quando cria algo?
- Porque é que a validação deve acontecer antes de guardar dados?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] 404 e erros iniciais

### 4.1 Middleware de 404

Coloca este middleware depois das rotas:

```js
app.use((_req, res) => {
    res.status(404).json({
        error: {
            code: "ROUTE_NOT_FOUND",
            message: "Rota não encontrada",
            details: [],
        },
    });
});
```

---

### 4.2 Handler de erro inicial

```js
app.use((err, _req, res, _next) => {
    console.error(err);

    res.status(500).json({
        error: {
            code: "INTERNAL_ERROR",
            message: "Erro interno",
            details: [],
        },
    });
});
```

No capítulo 07, este padrão fica mais completo.

---

### 4.3 Checkpoint

- Porque é que o 404 fica depois das rotas?
- O que distingue um erro 404 de um erro 500?
- Porque é que não deves enviar stack trace em produção?

<a id="sec-5"></a>

## 5. [EXTRA] Ficheiros estáticos

### 5.1 Expor a pasta `public`

```js
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use("/static", express.static(path.join(__dirname, "public")));
```

Um ficheiro `src/public/styles.css` fica acessível em:

```text
http://127.0.0.1:3000/static/styles.css
```

Ficheiros estáticos são úteis em páginas EJS ou em pequenos protótipos sem React.

<a id="exercicios"></a>

## Exercícios - Express básico

1. Cria `src/app.js` e `src/server.js`.
2. Implementa `GET /api/health`.
3. Adiciona `helmet`, `cors`, `compression`, `morgan`, `express.json` e `express.urlencoded`.
4. Cria uma lista `todos` em memória.
5. Implementa `GET /api/v1/todos`.
6. Implementa `GET /api/v1/todos/:id`.
7. Implementa `POST /api/v1/todos` com validação simples.
8. Faz um erro de propósito: envia `{}` no body e confirma que recebes status `422`.
9. Adiciona o middleware de 404.
10. (EXTRA) Serve um ficheiro CSS pela pasta `public`.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com progressão app/server, middlewares, endpoints, checkpoints e exercícios.
- 2025-11-10: criação do capítulo com app base, middlewares e estáticos.

![Footer](../Images/Footer.png)
