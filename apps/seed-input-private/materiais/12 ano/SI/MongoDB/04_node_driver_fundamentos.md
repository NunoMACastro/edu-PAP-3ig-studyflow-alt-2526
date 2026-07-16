![Header](../Images/Header.png)

# MongoDB (12.º Ano) - 04 · Node driver: fundamentos

> **Objetivo deste ficheiro**
>
> - Usar o driver oficial `mongodb` num backend Node/Express.
> - Criar uma ligação reutilizável à base de dados.
> - Implementar um repository MongoDB para tarefas.
> - Manter controllers limpos e contratos JSON consistentes.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Driver oficial e estrutura mínima](#sec-1)
- [2. [ESSENCIAL] Ligação reutilizável](#sec-2)
- [3. [ESSENCIAL] Repository com CRUD e paginação](#sec-3)
- [4. [ESSENCIAL+] Controller e service por cima do repository](#sec-4)
- [5. [EXTRA] `ObjectId` e transformação de resposta](#sec-5)
- [Exercícios - Node driver](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo liga MongoDB ao backend Node/Express usando o driver oficial. É a abordagem mais direta: escreves queries MongoDB quase sem abstração.

- **Núcleo do tema:** as secções [ESSENCIAL] cobrem ligação, repository e operações base.
- **Aprofundamento:** as secções [ESSENCIAL+] mostram como encaixar o repository na arquitetura Express.
- **Contexto adicional:** as secções [EXTRA] tratam conversão de IDs e resposta para o frontend.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Driver oficial e estrutura mínima

### 1.1 Instalar

```bash
npm i mongodb
```

Esta dependência é necessária para o backend falar com MongoDB.

---

### 1.2 Estrutura recomendada

```text
src/
  app.js
  server.js
  db/
    mongo.js
  routes/
    tarefas.router.js
  controllers/
    tarefas.controller.js
  services/
    tarefas.service.js
  repositories/
    tarefas.repo.mongo.js
  utils/
    HttpError.js
```

Esta estrutura segue a mesma ideia do módulo Node:

```text
route -> controller -> service -> repository -> MongoDB
```

---

### 1.3 Modelo mental

O driver oficial dá-te acesso direto a:

- `client.db("nome")`;
- `db.collection("tarefas")`;
- `insertOne`;
- `find`;
- `updateOne`;
- `deleteOne`;
- `aggregate`.

Tu controlas mais detalhes. Em troca, também tens de validar e organizar mais coisas à mão.

---

### 1.4 Erros comuns

- Criar uma ligação nova em cada request.
- Misturar queries MongoDB diretamente nos controllers.
- Espalhar nomes de coleções por vários ficheiros.

### 1.5 Checkpoint

- Que dependência instala o driver oficial?
- Que camada deve falar diretamente com `db.collection(...)`?
- Porque é má ideia abrir uma ligação nova por pedido?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Ligação reutilizável

### 2.1 `src/db/mongo.js`

```js
// src/db/mongo.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "escola";

if (!uri) {
    throw new Error("MONGODB_URI em falta");
}

const client = new MongoClient(uri);
let db;

export async function connectMongo() {
    if (db) {
        return db;
    }

    await client.connect();
    db = client.db(dbName);
    return db;
}

export function getDb() {
    if (!db) {
        throw new Error("MongoDB ainda não está ligado");
    }

    return db;
}

export async function closeMongo() {
    await client.close();
    db = undefined;
}
```

---

### 2.2 Arrancar no `server.js`

```js
// src/server.js
import { app } from "./app.js";
import { connectMongo } from "./db/mongo.js";

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";

try {
    await connectMongo();

    app.listen(PORT, HOST, () => {
        console.log(`API em http://${HOST}:${PORT}`);
    });
} catch (err) {
    console.error("Falha ao arrancar:", err.message);
    process.exitCode = 1;
}
```

Assim a API só abre a porta depois de confirmar a ligação à base de dados.

---

### 2.3 Erros comuns

- Chamar `getDb()` antes de `connectMongo()`.
- Não tratar falha de ligação no arranque.
- Guardar `client` ou `db` em variáveis globais espalhadas por vários ficheiros.

### 2.4 Checkpoint

- Porque é que `connectMongo()` devolve a mesma ligação se já existir?
- O que acontece quando `getDb()` é chamado cedo demais?
- Porque é que a API deve falhar cedo se MongoDB não liga?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Repository com CRUD e paginação

### 3.1 Helper para validar `ObjectId`

```js
// src/repositories/tarefas.repo.mongo.js
import { ObjectId } from "mongodb";

function toObjectId(id) {
    if (!/^[a-f\d]{24}$/i.test(id)) {
        return null;
    }

    return new ObjectId(id);
}
```

Esta validação é mais restrita do que aceitar qualquer string que o driver consiga converter.

---

### 3.2 Repository completo

```js
// src/repositories/tarefas.repo.mongo.js
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongo.js";

const COLLECTION = "tarefas";

function collection() {
    return getDb().collection(COLLECTION);
}

function toObjectId(id) {
    if (!/^[a-f\d]{24}$/i.test(id)) {
        return null;
    }

    return new ObjectId(id);
}

export async function listar({ page = 1, limit = 20, q = "", feito } = {}) {
    const filter = { deletedAt: { $exists: false } };

    if (q) {
        filter.titulo = { $regex: q, $options: "i" };
    }

    if (typeof feito === "boolean") {
        filter.feito = feito;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        collection()
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray(),
        collection().countDocuments(filter),
    ]);

    return { items, page, limit, total };
}

export async function obter(id) {
    const _id = toObjectId(id);

    if (!_id) {
        return { kind: "invalid-id" };
    }

    const item = await collection().findOne({
        _id,
        deletedAt: { $exists: false },
    });

    return item ? { kind: "found", item } : { kind: "not-found" };
}

export async function criar({ titulo, prioridade = "normal" }) {
    const now = new Date();
    const doc = {
        titulo,
        feito: false,
        prioridade,
        createdAt: now,
        updatedAt: now,
    };

    const result = await collection().insertOne(doc);
    return { ...doc, _id: result.insertedId };
}

export async function atualizar(id, patch) {
    const _id = toObjectId(id);

    if (!_id) {
        return { kind: "invalid-id" };
    }

    const allowed = {};

    if (typeof patch.titulo === "string") {
        allowed.titulo = patch.titulo.trim();
    }

    if (typeof patch.feito === "boolean") {
        allowed.feito = patch.feito;
    }

    if (typeof patch.prioridade === "string") {
        allowed.prioridade = patch.prioridade;
    }

    const item = await collection().findOneAndUpdate(
        { _id, deletedAt: { $exists: false } },
        { $set: { ...allowed, updatedAt: new Date() } },
        { returnDocument: "after" }
    );

    return item ? { kind: "updated", item } : { kind: "not-found" };
}

export async function remover(id) {
    const _id = toObjectId(id);

    if (!_id) {
        return { kind: "invalid-id" };
    }

    const result = await collection().updateOne(
        { _id, deletedAt: { $exists: false } },
        { $set: { deletedAt: new Date(), updatedAt: new Date() } }
    );

    return result.matchedCount === 1
        ? { kind: "removed" }
        : { kind: "not-found" };
}
```

---

### 3.3 Porque devolver `kind`

O repository não deve conhecer HTTP.

Por isso, em vez de devolver `res.status(400)`, devolve um resultado de domínio:

```js
{ kind: "invalid-id" }
{ kind: "not-found" }
{ kind: "found", item }
```

O service ou controller transforma isso em `400`, `404` ou `200`.

---

### 3.4 Erros comuns

- Converter `id` para `new ObjectId(id)` sem validar.
- Permitir que `patch` altere `_id` ou `createdAt`.
- Devolver `res` diretamente dentro do repository.

### 3.5 Checkpoint

- Porque é que o repository não deve devolver status HTTP?
- Que campos são permitidos no patch?
- Qual é a diferença entre `invalid-id` e `not-found`?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Controller e service por cima do repository

### 4.1 Service

```js
// src/services/tarefas.service.js
import { HttpError } from "../utils/HttpError.js";
import * as repo from "../repositories/tarefas.repo.mongo.js";

export async function listar(filtros) {
    return repo.listar(filtros);
}

export async function obter(id) {
    const result = await repo.obter(id);

    if (result.kind === "invalid-id") {
        throw new HttpError("ID inválido", 400, { code: "INVALID_ID" });
    }

    if (result.kind === "not-found") {
        throw new HttpError("Tarefa não encontrada", 404, {
            code: "NOT_FOUND",
        });
    }

    return result.item;
}

export async function criar(input) {
    const titulo = typeof input.titulo === "string" ? input.titulo.trim() : "";

    if (titulo.length < 3) {
        throw new HttpError("Título deve ter pelo menos 3 caracteres", 422, {
            code: "VALIDATION_ERROR",
            details: [{ field: "titulo", message: "Mínimo 3 caracteres" }],
        });
    }

    return repo.criar({
        titulo,
        prioridade: input.prioridade || "normal",
    });
}
```

---

### 4.2 Controller

```js
// src/controllers/tarefas.controller.js
import * as tarefasService from "../services/tarefas.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listar = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const feito =
        req.query.feito === "true"
            ? true
            : req.query.feito === "false"
              ? false
              : undefined;

    const data = await tarefasService.listar({ page, limit, q, feito });
    res.json(data);
});

export const criar = asyncHandler(async (req, res) => {
    const item = await tarefasService.criar(req.body);
    res.status(201).json(item);
});
```

---

### 4.3 Checkpoint

- Que camada converte `invalid-id` em status HTTP?
- Porque é que o controller lê `req.query`?
- Onde fica a validação do título?

<a id="sec-5"></a>

## 5. [EXTRA] `ObjectId` e transformação de resposta

### 5.1 `_id` como string

MongoDB devolve `_id` como `ObjectId`. Para JSON, podes transformar:

```js
function toTarefaResponse(doc) {
    return {
        id: doc._id.toString(),
        titulo: doc.titulo,
        feito: doc.feito,
        prioridade: doc.prioridade,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
```

Esta transformação deixa o contrato mais simples para o frontend.

---

### 5.2 Quando transformar

Podes transformar:

- no repository, se queres esconder MongoDB das camadas acima;
- no service, se queres manter o repository mais próximo da base de dados;
- no controller, se a transformação for apenas formato de resposta.

Escolhe uma opção e mantém consistência.

<a id="exercicios"></a>

## Exercícios - Node driver

1. Instala `mongodb`.
2. Cria `src/db/mongo.js` com `connectMongo`, `getDb` e `closeMongo`.
3. Atualiza `server.js` para ligar ao MongoDB antes de abrir a porta.
4. Cria `tarefas.repo.mongo.js`.
5. Implementa `listar` com paginação.
6. Implementa `obter` com validação de `ObjectId`.
7. Implementa `criar`.
8. Implementa `atualizar` com lista de campos permitidos.
9. Implementa `remover` com soft delete.
10. Cria service e controller para `GET /api/v1/tarefas` e `POST /api/v1/tarefas`.
11. Faz um erro de propósito: envia um `id` inválido e confirma `400 INVALID_ID`.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com ligação reutilizável, repository completo, resultados por `kind`, checkpoints e exercícios.
- 2026-04-17: capítulo criado com integração Node driver e estrutura de API.

![Footer](../Images/Footer.png)
