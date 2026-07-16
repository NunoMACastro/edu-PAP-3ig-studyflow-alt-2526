![Header](../Images/Header.png)

# Node.js (12.º Ano) - 03 · HTTP nativo vs Express

> **Objetivo deste ficheiro**
>
> - Perceber como o Node.js consegue responder a pedidos HTTP sem frameworks.
> - Comparar o módulo nativo `node:http` com Express.
> - Entender porque Express simplifica rotas, body parsing, middlewares e erros.
> - Preparar a passagem para uma API Express organizada.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] O que acontece num pedido HTTP](#sec-1)
- [2. [ESSENCIAL] Servidor com `node:http`](#sec-2)
- [3. [ESSENCIAL] O mesmo endpoint com Express](#sec-3)
- [4. [ESSENCIAL+] Comparação prática](#sec-4)
- [5. [EXTRA] Quando usar HTTP nativo](#sec-5)
- [Exercícios - HTTP nativo vs Express](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo mostra a diferença entre controlar HTTP manualmente e usar Express. O objetivo não é evitar Express, mas perceber que ele resolve problemas reais do módulo HTTP nativo.

- **Núcleo do tema:** as secções [ESSENCIAL] mostram o ciclo pedido/resposta.
- **Aprofundamento:** as secções [ESSENCIAL+] comparam responsabilidades.
- **Contexto adicional:** as secções [EXTRA] indicam casos em que o módulo nativo ainda faz sentido.

<a id="sec-1"></a>

## 1. [ESSENCIAL] O que acontece num pedido HTTP

### 1.1 Modelo mental

Um servidor HTTP fica à espera de pedidos.

Quando recebe um pedido, precisa de decidir:

- qual é o método (`GET`, `POST`, `PATCH`, `DELETE`);
- qual é a URL (`/`, `/api/health`, `/api/v1/todos`);
- se existe body;
- que status devolver;
- que headers devolver;
- que conteúdo enviar na resposta.

Fluxo:

```text
pedido HTTP
  ↓
servidor lê método, URL, headers e body
  ↓
servidor executa lógica
  ↓
resposta HTTP com status, headers e body
```

---

### 1.2 Exemplo de resposta HTTP

Uma resposta JSON típica tem:

- status `200`;
- header `Content-Type: application/json`;
- body em JSON.

```json
{
    "status": "ok"
}
```

---

### 1.3 Erros comuns

- Confundir URL com método HTTP.
- Devolver JSON sem header adequado.
- Esquecer que o body de um pedido chega em partes no HTTP nativo.

### 1.4 Checkpoint

- Que informação existe num pedido HTTP?
- Para que serve o status HTTP?
- Porque é que o servidor precisa de olhar para a URL e para o método?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Servidor com `node:http`

### 2.1 Exemplo mínimo

```js
// server-http.js
import http from "node:http";

const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Olá HTTP nativo");
        return;
    }

    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "Rota não encontrada" }));
});

server.listen(3000, () => {
    console.log("Servidor em http://localhost:3000");
});
```

Executa:

```bash
node server-http.js
```

Abre:

```text
http://localhost:3000
```

---

### 2.2 Endpoint JSON

```js
if (req.method === "GET" && req.url === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok", ts: Date.now() }));
    return;
}
```

Repara no trabalho manual:

- verificar método;
- verificar URL;
- escrever headers;
- converter objeto para JSON;
- terminar a resposta com `res.end`.

---

### 2.3 Ler body manualmente

No HTTP nativo, o body chega em pedaços:

```js
async function lerBody(req) {
    let body = "";

    for await (const chunk of req) {
        body += chunk;
    }

    return JSON.parse(body || "{}");
}
```

Isto é importante para perceber o valor de `express.json()`.

---

### 2.4 Erros comuns

- Esquecer `return` depois de enviar uma resposta.
- Chamar `res.end()` duas vezes.
- Assumir que o body já está disponível como objeto.

### 2.5 Checkpoint

- Que função cria um servidor HTTP nativo?
- Porque é que `JSON.stringify` é necessário antes de enviar JSON?
- O que torna a leitura do body mais trabalhosa no HTTP nativo?

<a id="sec-3"></a>

## 3. [ESSENCIAL] O mesmo endpoint com Express

### 3.1 Instalar Express

```bash
npm i express
```

Com `"type": "module"` no `package.json`, podes usar imports modernos.

---

### 3.2 Servidor Express mínimo

```js
// server-express.js
import express from "express";

const app = express();

app.get("/", (_req, res) => {
    res.type("text").send("Olá Express");
});

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", ts: Date.now() });
});

app.use((_req, res) => {
    res.status(404).json({ error: "Rota não encontrada" });
});

app.listen(3000, () => {
    console.log("Servidor em http://localhost:3000");
});
```

Express simplifica:

- rotas com `app.get`;
- respostas JSON com `res.json`;
- status com `res.status`;
- middlewares com `app.use`.

---

### 3.3 Ler JSON com Express

```js
app.use(express.json());

app.post("/api/v1/todos", (req, res) => {
    const { titulo } = req.body;

    if (!titulo?.trim()) {
        return res.status(422).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "Título é obrigatório",
                details: [{ field: "titulo", message: "Obrigatório" }],
            },
        });
    }

    res.status(201).json({ id: crypto.randomUUID(), titulo });
});
```

O middleware `express.json()` transforma o body JSON em `req.body`.

---

### 3.4 Erros comuns

- Esquecer `app.use(express.json())` antes das rotas `POST`.
- Usar `res.send` para tudo e perder clareza em respostas JSON.
- Colocar o handler de 404 antes das rotas reais.

### 3.5 Checkpoint

- O que faz `express.json()`?
- Qual é a diferença entre `res.json()` e `res.status(201).json()`?
- Porque é que a ordem dos middlewares importa?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Comparação prática

| Tema | HTTP nativo | Express |
| --- | --- | --- |
| Rotas | `if` com método e URL | `app.get`, `app.post`, `Router` |
| JSON de resposta | `JSON.stringify` manual | `res.json()` |
| Body JSON | leitura manual de chunks | `express.json()` |
| Middlewares | tens de montar o fluxo | padrão central do framework |
| Erros | repetição por rota | handler central |
| Escalabilidade do código | fica verboso depressa | organiza melhor projetos médios |

Express não torna HTTP "mágico". Express organiza trabalho repetitivo.

---

### 4.1 Checkpoint

- Que tarefas Express automatiza?
- Em que ponto o HTTP nativo começa a ficar verboso?
- Porque é que usar Express pode reduzir bugs repetidos?

<a id="sec-5"></a>

## 5. [EXTRA] Quando usar HTTP nativo

HTTP nativo continua a fazer sentido quando:

- queres criar um exemplo muito pequeno;
- estás a estudar os detalhes do protocolo;
- precisas de controlo muito direto;
- não queres nenhuma dependência externa.

Para o restante percurso, Express é a escolha principal porque permite focar em rotas, validação, erros, persistência e testes.

<a id="exercicios"></a>

## Exercícios - HTTP nativo vs Express

1. Cria `server-http.js` com uma rota `/`.
2. Adiciona `/api/health` no servidor HTTP nativo.
3. Faz a mesma rota `/api/health` com Express.
4. Compara o número de linhas e responsabilidades nos dois ficheiros.
5. Adiciona uma rota inexistente e confirma que devolve 404.
6. Cria `POST /api/v1/todos` em Express com `express.json()`.
7. Faz um erro de propósito: remove `express.json()` e observa o valor de `req.body`.
8. Explica por escrito três problemas que Express resolve.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, comparação progressiva, checkpoints e exercícios.
- 2025-11-10: criação do capítulo com ciclo pedido/resposta e comparação inicial entre HTTP nativo e Express.

![Footer](../Images/Footer.png)
