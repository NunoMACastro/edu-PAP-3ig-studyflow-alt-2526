/* 

Requisitos recomendados
- Node ≥ 18 LTS (tem `fetch` global e boas APIs modernas)
- npm ≥ 9
- Editor: VS Code com as extensões ESLint/Prettier

TOC
-----------------------------------------------------------------------------
[0]  Setup rápido de projeto (npm, scripts, nodemon, dotenv, .gitignore)
[1]  Módulos em Node: ESM vs CommonJS + resolução de módulos
[2]  Node core útil: path, fs/promises, process, os, events, timers, crypto, streams
[3]  Servidor HTTP nativo vs Express (porque Express)
[4]  Express: app base, middlewares, rotas, respostas, estáticos
[5]  Estrutura de pastas sugerida (MVC leve + camadas)
[6]  Controladores, Router e validação (manual e com Zod - opcional)
[7]  Erros e error‑handling central (404/500), asyncHandler
[8]  Persistência leve em ficheiro (JSON) - sem DB (para já)
[9]  CORS, Helmet, Rate‑Limit, Logging (Morgan), compressão
[10] Variáveis de ambiente (.env), 12‑Factor e config
[11] Testes rápidos (Supertest + Vitest/Jest) - visão geral

Glossário rápido (mostra aos alunos antes de mergulhar no código):
- **Request**: pedido que chega do browser/app móvel. Traz método (GET/POST...), URL, headers e body.
- **Response**: resposta que o servidor devolve com um código (200, 404...) e dados (JSON, HTML, ficheiro).
- **Middleware**: função que corre entre o pedido entrar e a resposta sair. Pode ler/modificar `req` e `res` ou terminar o pedido.
- **Router**: conjunto de rotas relacionadas (ex.: tudo sobre `/api/v1/todos`). Ajuda a dividir a aplicação em módulos.
- **Controller**: função que conhece a regra do endpoint. Lê dados do pedido, chama serviços e decide o que devolver.
- **Service**: camada onde vivem as regras de negócio (por exemplo, “um todo precisa de título”).
- **Repository**: módulo que sabe falar com o armazenamento (ficheiro JSON, base de dados…).
- **Handler de erro**: middleware especial para responder quando algo corre mal.

=============================================================================
[0] SETUP RÁPIDO DE PROJETO
=============================================================================

Terminal, numa pasta vazia:
$ mkdir api-aula && cd api-aula
$ npm init -y
$ npm pkg set type=module                 # usar ES Modules (import/export)
$ npm i express cors helmet morgan compression
$ npm i -D nodemon                         # reload em desenvolvimento
$ npm i zod                               # (opcional) validação de dados
$ npm i -D prettier eslint eslint-config-prettier eslint-plugin-import

Scripts em package.json (exemplo):
{
  "name": "api-aula",
  "type": "module",
  "scripts": {
    "dev": "nodemon --env-file .env --watch src --ext js,mjs,cjs --exec \"node src/server.js\"",
    "start": "node src/server.js",
    "lint": "eslint .",
    "format": "prettier -w ."
  }
}

.gitignore (essencial):
node_modules
.env
coverage
dist

Cria as pastas base:
src/
  app.js
  server.js
  routes/
  controllers/
  middlewares/
  services/
  utils/
  data/              # para persistência em ficheiro neste exemplo
  public/            # (opcional) ficheiros estáticos

=============================================================================
[1] MÓDULOS EM NODE - ESM vs COMMONJS
=============================================================================
ESM (ECMAScript Modules) → `import ... from` e `export` (igual ao browser moderno).
CommonJS → `const x = require("x")` e `module.exports = ...` (o “antigo” Node).

Boas práticas de hoje:
- Preferir **ESM** (define "type":"module" no package.json).
- Quando precisares de JSON: usa `fs/promises` + `JSON.parse`, ou `import` (Node 20
  suporta import de JSON com `assert { type: "json" }`, mas fica fora deste guia).

Exemplos rápidos:
export const soma = (a, b) => a + b;        // ficheiro utils/math.js
// noutra parte
import { soma } from "./utils/math.js";

Import dinâmico (carregamento lazily):
const mod = await import("./utils/math.js");
console.log(mod.soma(2, 3));

Resolução de módulos:
- Imports relativos sempre com extensão: "./ficheiro.js"
- `NODE_PATH` e aliases requerem configs extra (tsconfig/webpack/vite - fora do scope)

=============================================================================
[2] NODE CORE ÚTIL: path, fs/promises, process, os, events, crypto, streams
=============================================================================

/* ===== path (juntar caminhos de forma segura, multiplataforma) ===== */
import path from "node:path";
const raiz = process.cwd(); // diretório de arranque
const ficheiro = path.join(raiz, "data", "todos.json");
const apenasNome = path.basename(ficheiro); // "todos.json"

/* ===== fs/promises (I/O assíncrono em ficheiros) ===== */
import fs from "node:fs/promises";
async function lerJSON(caminho, fallback = null) {
    try {
        return JSON.parse(await fs.readFile(caminho, "utf8"));
    } catch (e) {
        if (e.code === "ENOENT") return fallback;
        throw e;
    }
}
async function escreverJSON(caminho, dados) {
    await fs.mkdir(path.dirname(caminho), { recursive: true });
    const tmp = caminho + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(dados, null, 2), "utf8");
    await fs.rename(tmp, caminho); // escrita “quase atómica”
}

/* ===== process / os ===== */
import os from "node:os";
console.log(process.env.NODE_ENV); // "development" | "production"
console.log(os.cpus().length, os.totalmem());

/* ===== events (EventEmitter) ===== */
import { EventEmitter } from "node:events";
const bus = new EventEmitter();
bus.on("novo_todo", (todo) => console.log("Evento:", todo));

/* ===== crypto (hash, random) - para passwords ver secção [9]/Auth nota rápida ===== */
import crypto from "node:crypto";
const id = crypto.randomUUID(); // "b2e2..."
const sum = crypto.createHash("sha256").update("abc").digest("hex");

/* ===== streams (ler ficheiros grandes sem carregar tudo na RAM) ===== */
// Ex.: criar um endpoint que faz stream de um .log - fica como exercício em [12]
/*
=============================================================================
[3] HTTP NATIVO vs EXPRESS
=============================================================================

Com http nativo: */
import http from "node:http";
const server = http.createServer((req, res) => {
    if (req.url === "/") {
        res.writeHead(200);
        res.end("Olá");
        return;
    }
    res.writeHead(404);
    res.end("Não encontrado");
});
server.listen(3000);
/*
Porquê Express?
- Roteamento simples, middlewares, JSON de corpo, erros centralizados, ecossistema
  gigante (CORS, Helmet, Rate‑limit, etc.). Ideal para aulas e projetos.
Exemplo: A seguir 

=============================================================================
[4] EXPRESS - APP BASE, MIDDLEWARES, ROTAS, RESPOSTAS, ESTÁTICOS
=============================================================================

/* ===== src/app.js ===== */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";

import todosRouter from "./routes/todos.router.js";
import { notFound, errorHandler } from "./middlewares/errors.js";

export const app = express();

// Middlewares globais (ordem importa!)
app.use(helmet()); // headers de segurança
app.use(cors({ origin: true, credentials: true })); // CORS básico (ajusta origin)
app.use(compression()); // gzip/br (tamanho menor)
app.use(morgan("dev")); // logs em dev
app.use(express.json({ limit: "1mb" })); // parse de JSON
app.use(express.urlencoded({ extended: true })); // forms

// Estáticos (opcional): /public fica acessível como /static/...
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/static", express.static(path.join(__dirname, "public")));

// Health endpoint (monitorização simples)
app.get("/api/health", (req, res) =>
    res.json({ status: "ok", ts: Date.now() })
);

// Monta os routers da API
app.use("/api/v1/todos", todosRouter);

// 404 e erros (sempre no fim)
app.use(notFound);
app.use(errorHandler);

/* ===== src/server.js ===== */
import { app } from "./app.js";
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`API a escutar em http://localhost:${PORT}`)
);
/*
=============================================================================
[5] ESTRUTURA DE PASTAS (SUGESTÃO)
=============================================================================
src/
  app.js                # cria e configura o express app
  server.js             # arranque do servidor (listen)
  routes/
    todos.router.js     # definicao das rotas /api/v1/todos
  controllers/
    todos.controller.js # lógica de cada rota (sem I/O direto)
  services/
    todos.service.js    # regras de negócio (chama repositórios)
  repositories/
    todos.repo.file.js  # acesso a dados (aqui: ficheiro JSON). Troca por DB depois.
  middlewares/
    errors.js           # notFound + errorHandler
    validate.js         # (opcional) middleware de validação com Zod
  utils/                # helpers (asyncHandler, uuid, etc.)
  data/
    todos.json          # persistência em ficheiro (didático)
  public/               # estáticos

Separação de responsabilidades:
- **Route**: recebe req/res e chama o controller.
- **Controller**: valida input, chama service, devolve resposta.
- **Service**: regras de negócio.
- **Repository**: detalhe de acesso a dados (ficheiro/DB).

=============================================================================
[6] CONTROLADORES, ROUTER E VALIDAÇÃO
=============================================================================

/* ===== src/routes/todos.router.js ===== */
import { Router } from "express";
import * as ctrl from "../controllers/todos.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    todoCreateSchema,
    todoUpdateSchema,
    idParamSchema,
} from "../schemas/todo.schemas.js";

const r = Router();

r.get("/", ctrl.listar);
r.get("/:id", validate({ params: idParamSchema }), ctrl.obter);
r.post("/", validate({ body: todoCreateSchema }), ctrl.criar);
r.patch(
    "/:id",
    validate({ params: idParamSchema, body: todoUpdateSchema }),
    ctrl.atualizar
);
r.delete("/:id", validate({ params: idParamSchema }), ctrl.remover);

export default r;

/* ===== src/controllers/todos.controller.js ===== */
import * as service from "../services/todos.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listar = asyncHandler(async (req, res) => {
    const itens = await service.listar();
    res.json(itens);
});

export const obter = asyncHandler(async (req, res) => {
    const item = await service.obter(req.params.id);
    if (!item) return res.status(404).json({ error: "Todo não encontrado" });
    res.json(item);
});

export const criar = asyncHandler(async (req, res) => {
    const novo = await service.criar(req.body);
    res.status(201).json(novo);
});

export const atualizar = asyncHandler(async (req, res) => {
    const item = await service.atualizar(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Todo não encontrado" });
    res.json(item);
});

export const remover = asyncHandler(async (req, res) => {
    const ok = await service.remover(req.params.id);
    if (!ok) return res.status(404).json({ error: "Todo não encontrado" });
    res.status(204).send();
});

/* ===== src/middlewares/validate.js (opcional usando Zod) ===== */
// Se não quiseres Zod, valida manualmente no controller.
import { ZodError } from "zod";
export function validate(schemas = {}) {
    return (req, res, next) => {
        try {
            if (schemas.params) req.params = schemas.params.parse(req.params);
            if (schemas.query) req.query = schemas.query.parse(req.query);
            if (schemas.body) req.body = schemas.body.parse(req.body);
            next();
        } catch (e) {
            if (e instanceof ZodError) {
                return res
                    .status(400)
                    .json({ error: "Validação falhou", details: e.issues });
            }
            next(e);
        }
    };
}

/* ===== src/schemas/todo.schemas.js ===== */
import { z } from "zod";

export const idParamSchema = z.object({
    id: z.string().uuid("id precisa ser UUID válido"),
});

export const todoCreateSchema = z.object({
    titulo: z.string().min(1),
    concluido: z.boolean().optional().default(false),
});

export const todoUpdateSchema = todoCreateSchema.partial();
/*
=============================================================================
[7] ERROS E ERROR‑HANDLING CENTRAL (404/500), asyncHandler
=============================================================================

/* ===== src/middlewares/errors.js ===== */
export function notFound(req, res, _next) {
    res.status(404).json({ error: "Rota não encontrada" });
}

export function errorHandler(err, req, res, _next) {
    const status = err.status || 500;
    const payload = {
        error: err.message || "Erro interno",
    };
    // Em dev, enviar stack ajuda a depurar; em prod, omite!
    if (process.env.NODE_ENV !== "production") payload.stack = err.stack;
    res.status(status).json(payload);
}

/* ===== src/utils/asyncHandler.js ===== */
export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
/*
=============================================================================
[8] PERSISTÊNCIA EM FICHEIRO (JSON) - *didático*, troca por DB no futuro
=============================================================================

/* ===== src/repositories/todos.repo.file.js ===== */
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const F = path.join(__dirname, "..", "data", "todos.json");

async function lerTodos() {
    try {
        return JSON.parse(await fs.readFile(F, "utf8"));
    } catch (e) {
        if (e.code === "ENOENT") return [];
        throw e;
    }
}
async function gravarTodos(lista) {
    await fs.mkdir(path.dirname(F), { recursive: true });
    const tmp = F + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(lista, null, 2), "utf8");
    await fs.rename(tmp, F);
}

export async function listar() {
    return lerTodos();
}
export async function obter(id) {
    const L = await lerTodos();
    return L.find((t) => t.id === id) || null;
}
export async function criar({ titulo, concluido = false }) {
    const novo = {
        id: crypto.randomUUID(),
        titulo,
        concluido,
        criadoEm: Date.now(),
    };
    const L = await lerTodos();
    L.push(novo);
    await gravarTodos(L);
    return novo;
}
export async function atualizar(id, patch) {
    const L = await lerTodos();
    const idx = L.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    L[idx] = { ...L[idx], ...patch, atualizadoEm: Date.now() };
    await gravarTodos(L);
    return L[idx];
}
export async function remover(id) {
    const L = await lerTodos();
    const n = L.length;
    const filtrado = L.filter((t) => t.id !== id);
    if (filtrado.length === n) return false;
    await gravarTodos(filtrado);
    return true;
}

/* ===== src/services/todos.service.js ===== */
import * as repo from "../repositories/todos.repo.file.js";
export async function listar() {
    return repo.listar();
}
export async function obter(id) {
    return repo.obter(id);
}
export async function criar(data) {
    return repo.criar(data);
}
export async function atualizar(id, patch) {
    return repo.atualizar(id, patch);
}
export async function remover(id) {
    return repo.remover(id);
}
/*
=============================================================================
[9] CORS, HELMET, RATE‑LIMIT, LOGGING, COMPRESSÃO (+ Auth nota rápida)
=============================================================================
- **CORS**: controla quais origens (front-ends) podem chamar a tua API.
- **Helmet**: adiciona headers de segurança comuns (X‑Frame‑Options, etc.).
- **Rate‑limit**: protege contra abuso (DDOS/lots of requests).
- **Morgan/Winston/Pino**: logging simples vs estruturado.
- **Compression**: comprime as respostas (gzip/br).

Instalar rate‑limit e um logger estrutural (opcional):
$ npm i express-rate-limit pino pino-pretty

Exemplo mínimo (app.js):
import rateLimit from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
app.use(pinoHttp({ logger }));

const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
app.use(limiter);

Auth (visão geral para futuro):
- NUNCA guardes passwords em claro. Usa `bcryptjs` ou `argon2`.
- JWT (jsonwebtokens) para sessões stateless. Guarda o token em HTTP‑only cookies
  ou no header `Authorization: Bearer`. Define expiração e *refresh tokens*.

=============================================================================
[10] VARIÁVEIS DE AMBIENTE (.env), 12‑FACTOR E CONFIG
=============================================================================
Cria `.env` na raiz:
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173

Ler no código:
const PORT = process.env.PORT ?? 3000;

Boas práticas (12‑Factor):
- Não “hardcode” segredos/URLs no código.
- Parâmetros variáveis (portas, chaves, URLs) via env.
- Um “config module” ajuda a centralizar:

/* ===== src/utils/config.js ===== */
function reqEnv(name, def = undefined) {
    const v = process.env[name] ?? def;
    if (v === undefined) throw new Error(`Falta variável de ambiente: ${name}`);
    return v;
}
export const config = Object.freeze({
    env: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 3000),
    corsOrigin: process.env.CORS_ORIGIN || "*",
}); /* %>
/*
=============================================================================
[11] TESTES RÁPIDOS (Supertest + Vitest/Jest) - visão geral
=============================================================================
$ npm i -D supertest vitest
Esqueleto:
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("health", () => {
  it("GET /api/health devolve ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

Scripts:
"test": "vitest --run",
"test:watch": "vitest"
*/ /* %>

// ============================================================================
// [12] VIEWS COM EJS (Templates no servidor)
// ============================================================================
// O que é?
// - EJS (Embedded JavaScript) é um motor de templates muito simples para gerar
//   HTML no servidor (SSR) com Express.
// - Sintaxe: <% código %>  |  <%= expr_escapada %>  |  <%- expr_sem_escape %>
//   • <%= ... %> ESCAPA HTML (seguro por defeito)
//   • <%- ... %> NÃO escapa (só para HTML de confiança)
// - Usa "includes" para cabeçalhos/rodapés/fragmentos reutilizáveis.
// ----------------------------------------------------------------------------
// Instalar:
//   npm i ejs express-ejs-layouts   # (o layouts é opcional, mas útil)
// ----------------------------------------------------------------------------
// Estrutura recomendada:
//   src/
//     app.js
//     ...
//     views/
//       layout.ejs               # (se usares express-ejs-layouts)
//       partials/
//         head.ejs
//         header.ejs
//         footer.ejs
//       pages/
//         home.ejs
//         todos/
//           index.ejs
//           new.ejs
//           show.ejs
//           edit.ejs
//     public/                     # css/js/imagens estáticos (via express.static)
// ============================================================================

// File: src/app.js  (adicionar estas linhas à tua app base)
/*
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import expressLayouts from "express-ejs-layouts"; // opcional, mas simplifica layouts

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();

// ... (resto de middlewares globais já existentes: helmet, cors, etc.)

// 1) View engine EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 2) Layouts (opcional)
app.use(expressLayouts);
app.set("layout", "layout"); // usa views/layout.ejs por omissão

// 3) Estáticos (CSS/JS/Imagens de client-side)
app.use("/static", express.static(path.join(__dirname, "public")));

// 4) Locals globais (helpers disponíveis em TODAS as views)
app.locals.appName = "Minha App";
app.locals.fmtData = (ts) =>
  new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" })
    .format(ts);

// 5) Locals por pedido (ex.: user autenticado no futuro)
// app.use((req, _res, next) => { res.locals.user = req.user || null; next(); });

// ============================================================================
// Rotas de páginas (UI) - exemplo com Todos a partir do teu service
// ============================================================================

// File: src/routes/pages.router.js
import { Router } from "express";
import * as todos from "../services/todos.service.js"; // reusa a tua camada de serviços

const pages = Router();

// Home simples
pages.get("/", (_req, res) => {
  res.render("pages/home", { titulo: "Bem-vindo", agora: Date.now() });
});

// Listagem de todos em HTML
pages.get("/todos", async (_req, res, next) => {
  try {
    const lista = await todos.listar();
    res.render("pages/todos/index", { titulo: "Lista de Tarefas", lista });
  } catch (e) { next(e); }
});

// Form para criar novo todo
pages.get("/todos/new", (_req, res) => {
  res.render("pages/todos/new", { titulo: "Novo Todo", errors: [], values: {} });
});

// Submissão do form (HTML → POST)
pages.post("/todos", async (req, res, next) => {
  try {
    // garante que tens express.urlencoded ativo em app.js
    // app.use(express.urlencoded({ extended: true }))
    const { titulo } = req.body;
    if (!titulo?.trim()) {
      return res.status(400).render("pages/todos/new", {
        titulo: "Novo Todo",
        errors: [{ message: "Título é obrigatório" }],
        values: { titulo }
      });
    }
    await todos.criar({ titulo });
    res.redirect("/todos");
  } catch (e) { next(e); }
});

export default pages;

// E em src/app.js monta as páginas (tipicamente antes dos handlers JSON de API se quiseres):
//   import pagesRouter from "./routes/pages.router.js";
//   app.use("/", pagesRouter);

// ============================================================================
// Views - exemplos mínimos
// ============================================================================

// File: src/views/layout.ejs   (se estiveres a usar express-ejs-layouts)
<!doctype html>
<html lang="pt-PT">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><%= typeof titulo !== "undefined" ? titulo + " - " : "" %><%= appName %></title>
    <link rel="stylesheet" href="/static/styles.css">
    <% /* Partials comuns: meta tags, ícones, etc. 
    <%- include("partials/head") %>
  </head>
  <body>
    <%- include("partials/header") %>

    <main class="container">
      <%- body %> <% /* <- express-ejs-layouts insere aqui o conteúdo da página */
/*
    </main>

    <%- include("partials/footer") %>
  </body>
</html>

// File: src/views/partials/head.ejs
<meta name="theme-color" content="#111" />

// File: src/views/partials/header.ejs
<header class="site-header">
  <nav>
    <a href="/">Home</a>
    <a href="/todos">Todos</a>
    <a href="/todos/new">Novo</a>
  </nav>
</header>

// File: src/views/partials/footer.ejs
<footer class="site-footer">
  <small>&copy; <%= new Date().getFullYear() %> - <%= appName %></small>
</footer>

// File: src/views/pages/home.ejs
<section>
  <h1><%= titulo %></h1>
  <p>Agora: <%= fmtData(agora) %></p>
  <p>Exemplo de escaping: <%= "<strong>isto aparece como texto</strong>" %></p>
  <p>Exemplo sem escape (⚠️ só se confiares no conteúdo): <%- "<strong>negrito</strong>" %></p>
</section>

// File: src/views/pages/todos/index.ejs
<section>
  <h1><%= titulo %></h1>

  <% if (!lista || lista.length === 0) { %>
    <p>Sem tarefas ainda.</p>
  <% } else { %>
    <ul class="todos">
      <% for (const t of lista) { %>
        <li class="<%= t.concluido ? "done" : "" %>">
          <span><%= t.titulo %></span>
          <small>criado em <%= fmtData(t.criadoEm || Date.now()) %></small>
        </li>
      <% } %>
    </ul>
  <% } %>
</section>

// File: src/views/pages/todos/new.ejs
<section>
  <h1><%= titulo %></h1>

  <% if (errors && errors.length) { %>
    <div class="alert error">
      <% for (const e of errors) { %><p><%= e.message %></p><% } %>
    </div>
  <% } %>

  <form action="/todos" method="post">
    <label>Título
      <input name="titulo" value="<%= values.titulo || "" %>" required />
    </label>
    <button type="submit">Criar</button>
  </form>
</section>

// ============================================================================
// Includes e "componentes" com parâmetros
// ============================================================================
// - Podes passar dados aos includes (EJS 3+):
//   <%- include("partials/card", { title: "Produto X", preco: 12.5 }) %>
//
// File: src/views/partials/card.ejs
<article class="card">
  <h3><%= title %></h3>
  <p><%= typeof preco !== "undefined" ? preco : "" %></p>
</article>

// ============================================================================
// Dicas de segurança/performance com EJS
// ============================================================================
// 1) Usa <%= ... %> (escapado) por defeito; evita <%- ... %>.
// 2) Ao embutir JSON em <script>, evita fechar a tag acidentalmente:
//    <script>
//      const DATA = <%- JSON.stringify(obj).replace(/</g, "\\u003c") %>;
//    </script>
// 3) Em produção, ativa o cache de views (Express ativa por defeito em prod):
//    app.set("view cache", process.env.NODE_ENV === "production");
// 4) Mantém CSS/JS em ficheiros estáticos (em /public) para melhor CSP.
// 5) Para layouts sem plugin, substitui o layout por includes manuais:
//    header.ejs + <%- include(...) %> + footer.ejs.
// ============================================================================ */

/*
## Changelog
-   **v1.1.0 - 2025-11-10**
    -   Adicionado glossário introdutório e criada secção de changelog para o guia completo.
*/
