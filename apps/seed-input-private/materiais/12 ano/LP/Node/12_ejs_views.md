![Header](../Images/Header.png)

# Node.js (12.º Ano) - 12 · Views com EJS

> **Objetivo deste ficheiro**
>
> - Perceber o que é renderização HTML no servidor.
> - Configurar EJS numa app Express.
> - Criar páginas, partials e formulários simples.
> - Aplicar cuidados de segurança com escaping e dados vindos do utilizador.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] O que é EJS e SSR](#sec-1)
- [2. [ESSENCIAL] Configurar EJS no Express](#sec-2)
- [3. [ESSENCIAL] Criar páginas e partials](#sec-3)
- [4. [ESSENCIAL+] Formulários com EJS](#sec-4)
- [5. [EXTRA] Segurança e organização](#sec-5)
- [Exercícios - Views com EJS](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Até aqui a API respondeu sobretudo com JSON. Este capítulo mostra outra possibilidade: o servidor gerar HTML pronto a enviar para o browser.

- **Núcleo do tema:** as secções [ESSENCIAL] configuram EJS e criam páginas.
- **Aprofundamento:** as secções [ESSENCIAL+] ligam formulários HTML aos services.
- **Contexto adicional:** as secções [EXTRA] tratam segurança, escaping e organização.

<a id="sec-1"></a>

## 1. [ESSENCIAL] O que é EJS e SSR

### 1.1 Modelo mental

Com uma API JSON:

```text
browser
  ↓ GET /api/v1/todos
servidor
  ↓ JSON
browser transforma JSON em UI
```

Com SSR, server-side rendering:

```text
browser
  ↓ GET /todos
servidor
  ↓ HTML pronto
browser mostra página
```

EJS é um motor de templates. Permite escrever HTML com pequenas zonas de JavaScript.

---

### 1.2 Sintaxe essencial

```ejs
<% if (lista.length === 0) { %>
    <p>Sem tarefas.</p>
<% } %>
```

```ejs
<%= titulo %>
```

`<%= ... %>` imprime texto escapado. É a opção segura por defeito.

```ejs
<%- htmlConfiavel %>
```

`<%- ... %>` imprime HTML sem escapar. Usa apenas quando tens a certeza de que o conteúdo é confiável.

---

### 1.3 Quando usar EJS

EJS faz sentido para:

- páginas simples geradas no servidor;
- dashboards pequenos;
- protótipos sem React;
- formulários tradicionais;
- páginas públicas que não precisam de SPA.

React continua a fazer sentido quando a interface tem muito estado no browser.

---

### 1.4 Erros comuns

- Usar `<%- ... %>` com conteúdo vindo do utilizador.
- Tentar usar estado de React dentro de EJS.
- Misturar rotas JSON e rotas HTML sem organização.

### 1.5 Checkpoint

- O que significa SSR?
- Qual é a diferença entre `<%= ... %>` e `<%- ... %>`?
- Em que caso EJS pode ser suficiente sem React?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Configurar EJS no Express

### 2.1 Instalar

```bash
npm i ejs
```

Só precisas de `ejs` para começar. Layouts podem ser feitos com partials.

---

### 2.2 Estrutura

```text
src/
  views/
    pages/
      home.ejs
      todos/
        index.ejs
        new.ejs
    partials/
      head.ejs
      header.ejs
      footer.ejs
  public/
    styles.css
```

---

### 2.3 Configuração no `app.js`

```js
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/static", express.static(path.join(__dirname, "public")));

app.locals.appName = "API Aula";
app.locals.formatarData = (timestamp) =>
    new Intl.DateTimeFormat("pt-PT", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(timestamp);
```

`app.locals` disponibiliza valores em todas as views.

---

### 2.4 Router de páginas

```js
// src/routes/pages.router.js
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
    res.render("pages/home", {
        titulo: "Início",
        agora: Date.now(),
    });
});

export default router;
```

No `app.js`:

```js
import pagesRouter from "./routes/pages.router.js";

app.use("/", pagesRouter);
```

---

### 2.5 Erros comuns

- Configurar `views` com caminho errado.
- Esquecer `app.set("view engine", "ejs")`.
- Escrever `res.json` quando queres devolver HTML. Para views, usa `res.render`.

### 2.6 Checkpoint

- Para que serve `app.set("views", ...)`?
- Que método renderiza uma view?
- O que fica disponível através de `app.locals`?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Criar páginas e partials

### 3.1 Partials

```ejs
<!-- src/views/partials/head.ejs -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><%= titulo %> - <%= appName %></title>
<link rel="stylesheet" href="/static/styles.css">
```

```ejs
<!-- src/views/partials/header.ejs -->
<header>
    <nav>
        <a href="/">Início</a>
        <a href="/todos">Tarefas</a>
        <a href="/todos/new">Nova tarefa</a>
    </nav>
</header>
```

```ejs
<!-- src/views/partials/footer.ejs -->
<footer>
    <small>&copy; <%= new Date().getFullYear() %> - <%= appName %></small>
</footer>
```

---

### 3.2 Página inicial

```ejs
<!-- src/views/pages/home.ejs -->
<!doctype html>
<html lang="pt-PT">
    <head>
        <%- include("../partials/head", { titulo }) %>
    </head>
    <body>
        <%- include("../partials/header") %>

        <main>
            <h1><%= titulo %></h1>
            <p>Agora: <%= formatarData(agora) %></p>
        </main>

        <%- include("../partials/footer") %>
    </body>
</html>
```

Os partials são incluídos com `<%- include(...) %>` porque o partial contém HTML controlado pelo projeto.

---

### 3.3 Listar tarefas

```js
// src/routes/pages.router.js
import { Router } from "express";
import * as todosService from "../services/todos.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
    "/todos",
    asyncHandler(async (_req, res) => {
        const lista = await todosService.listar();

        res.render("pages/todos/index", {
            titulo: "Tarefas",
            lista,
        });
    })
);

export default router;
```

```ejs
<!-- src/views/pages/todos/index.ejs -->
<!doctype html>
<html lang="pt-PT">
    <head>
        <%- include("../../partials/head", { titulo }) %>
    </head>
    <body>
        <%- include("../../partials/header") %>

        <main>
            <h1><%= titulo %></h1>

            <% if (lista.length === 0) { %>
                <p>Sem tarefas.</p>
            <% } else { %>
                <ul>
                    <% for (const todo of lista) { %>
                        <li>
                            <span><%= todo.titulo %></span>
                            <% if (todo.concluido) { %>
                                <strong>concluída</strong>
                            <% } %>
                        </li>
                    <% } %>
                </ul>
            <% } %>
        </main>

        <%- include("../../partials/footer") %>
    </body>
</html>
```

---

### 3.4 Checkpoint

- Para que servem partials?
- Porque é que `todo.titulo` usa `<%= ... %>`?
- Que dados a rota `/todos` envia para a view?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Formulários com EJS

### 4.1 Ativar forms no Express

No `app.js`:

```js
app.use(express.urlencoded({ extended: true }));
```

Este middleware lê dados enviados por formulários HTML.

---

### 4.2 Página de criação

```js
router.get("/todos/new", (_req, res) => {
    res.render("pages/todos/new", {
        titulo: "Nova tarefa",
        values: {},
        errors: [],
    });
});
```

```ejs
<!-- src/views/pages/todos/new.ejs -->
<!doctype html>
<html lang="pt-PT">
    <head>
        <%- include("../../partials/head", { titulo }) %>
    </head>
    <body>
        <%- include("../../partials/header") %>

        <main>
            <h1><%= titulo %></h1>

            <% if (errors.length > 0) { %>
                <section>
                    <% for (const error of errors) { %>
                        <p><%= error.message %></p>
                    <% } %>
                </section>
            <% } %>

            <form action="/todos" method="post">
                <label for="titulo">Título</label>
                <input
                    id="titulo"
                    name="titulo"
                    value="<%= values.titulo || "" %>"
                    required
                >

                <button type="submit">Criar</button>
            </form>
        </main>

        <%- include("../../partials/footer") %>
    </body>
</html>
```

---

### 4.3 Receber o formulário

```js
router.post(
    "/todos",
    asyncHandler(async (req, res) => {
        const titulo = req.body.titulo?.trim();

        if (!titulo) {
            return res.status(422).render("pages/todos/new", {
                titulo: "Nova tarefa",
                values: req.body,
                errors: [{ message: "Título é obrigatório" }],
            });
        }

        await todosService.criar({ titulo });
        res.redirect("/todos");
    })
);
```

---

### 4.4 Erros comuns

- Esquecer `express.urlencoded`.
- Devolver JSON depois de um submit HTML quando queres redirecionar.
- Perder os valores do formulário quando há erro de validação.

### 4.5 Checkpoint

- Porque é que forms precisam de `express.urlencoded`?
- Para que serve `res.redirect("/todos")`?
- Porque é útil reenviar `values` quando há erro?

<a id="sec-5"></a>

## 5. [EXTRA] Segurança e organização

### 5.1 Escaping

Usa `<%= ... %>` para dados vindos de utilizadores:

```ejs
<%= todo.titulo %>
```

Evita:

```ejs
<%- todo.titulo %>
```

Se `todo.titulo` contiver HTML malicioso, `<%- ... %>` pode criar XSS.

---

### 5.2 JSON dentro de `<script>`

Se precisares mesmo de colocar JSON numa página:

```ejs
<script>
    const DATA = <%- JSON.stringify(data).replace(/</g, "\\u003c") %>;
</script>
```

Isto reduz o risco de fechar a tag `<script>` de forma inesperada.

---

### 5.3 CSRF

Formulários `POST` em aplicações com sessão/cookies devem proteger contra CSRF.

Neste percurso, o essencial é reconhecer a regra:

- se o browser envia credenciais automaticamente, pedidos maliciosos também podem tentar usá-las;
- tokens CSRF ajudam o servidor a distinguir formulário legítimo de pedido forjado.

<a id="exercicios"></a>

## Exercícios - Views com EJS

1. Instala `ejs`.
2. Configura `views` e `view engine` no `app.js`.
3. Cria `partials/head.ejs`, `partials/header.ejs` e `partials/footer.ejs`.
4. Cria `pages/home.ejs`.
5. Cria `GET /` para renderizar a home.
6. Cria `GET /todos` para listar tarefas em HTML.
7. Cria `GET /todos/new` com formulário.
8. Cria `POST /todos` para receber o formulário e redirecionar.
9. Faz um erro de propósito: remove `express.urlencoded` e observa `req.body`.
10. Explica por escrito porque `<%= ... %>` é mais seguro para conteúdo vindo do utilizador.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, EJS sem dependências extra obrigatórias, formulários, segurança, checkpoints e exercícios.
- 2025-11-10: criação do capítulo com views EJS, SSR e formulários.

![Footer](../Images/Footer.png)
