![Header](../Images/Header.png)

# MongoDB (12.º Ano) - 03 · CRUD básico e operadores

> **Objetivo deste ficheiro**
>
> - Dominar operações CRUD base em MongoDB.
> - Usar filtros, projeções e operadores de atualização com segurança.
> - Implementar paginação, pesquisa simples e contagem total.
> - Evitar updates perigosos e queries demasiado abertas.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Criar e ler documentos](#sec-1)
- [2. [ESSENCIAL] Atualizar com segurança](#sec-2)
- [3. [ESSENCIAL] Remover: hard delete e soft delete](#sec-3)
- [4. [ESSENCIAL+] Filtros, projeções e paginação](#sec-4)
- [5. [EXTRA] Operadores frequentes](#sec-5)
- [Exercícios - CRUD básico e operadores](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo usa operações diretas sobre coleções. A prioridade é perceber o comportamento de MongoDB antes de integrar tudo num repository Express.

- **Núcleo do tema:** as secções [ESSENCIAL] cobrem criar, ler, atualizar e remover.
- **Aprofundamento:** as secções [ESSENCIAL+] juntam filtros, projeções e paginação.
- **Contexto adicional:** as secções [EXTRA] apresentam operadores que aparecem em APIs reais.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Criar e ler documentos

### 1.1 Modelo mental

CRUD significa:

- **Create:** criar documentos;
- **Read:** ler documentos;
- **Update:** atualizar documentos;
- **Delete:** remover documentos.

Em MongoDB, estas operações acontecem numa coleção:

```js
const col = db.collection("tarefas");
```

---

### 1.2 Criar um documento

```js
const now = new Date();

const result = await col.insertOne({
    titulo: "Estudar CRUD",
    feito: false,
    prioridade: "normal",
    tags: ["mongodb"],
    createdAt: now,
    updatedAt: now,
});

console.log(result.insertedId);
```

`insertedId` é o `_id` criado pelo MongoDB.

---

### 1.3 Ler vários documentos

```js
const items = await col
    .find({ feito: false })
    .sort({ createdAt: -1 })
    .toArray();
```

`find()` devolve um cursor. `toArray()` transforma o resultado numa lista.

---

### 1.4 Ler um documento por filtro

```js
const tarefa = await col.findOne({ titulo: "Estudar CRUD" });
```

Se não encontrar nada, devolve `null`.

---

### 1.5 Projeção

Projeção escolhe que campos vêm na resposta:

```js
const items = await col
    .find({ feito: false })
    .project({ titulo: 1, feito: 1, prioridade: 1 })
    .toArray();
```

Isto reduz dados desnecessários enviados para a API.

---

### 1.6 Erros comuns

- Inserir documentos sem campos mínimos, como `createdAt`.
- Fazer `find({})` sem limite numa coleção grande.
- Enviar para o frontend campos que não são necessários.

### 1.7 Checkpoint

- O que devolve `insertOne`?
- Qual é a diferença entre `find` e `findOne`?
- Para que serve `project`?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Atualizar com segurança

### 2.1 Atualização parcial com `$set`

```js
await col.updateOne(
    { _id: tarefaId },
    {
        $set: {
            feito: true,
            updatedAt: new Date(),
        },
    }
);
```

`$set` altera apenas os campos indicados.

---

### 2.2 Evitar substituir o documento inteiro

Perigoso:

```js
await col.replaceOne(
    { _id: tarefaId },
    { feito: true }
);
```

Isto substituiria o documento por um objeto com apenas `feito`.

Mais seguro:

```js
await col.updateOne(
    { _id: tarefaId },
    { $set: { feito: true, updatedAt: new Date() } }
);
```

---

### 2.3 Atualizar vários documentos

```js
await col.updateMany(
    { prioridade: { $exists: false } },
    { $set: { prioridade: "normal", updatedAt: new Date() } }
);
```

Usa `updateMany` com cuidado: o filtro deve ser claro.

---

### 2.4 Campos permitidos no `PATCH`

Não faças isto:

```js
const update = { $set: req.body };
```

Permite apenas campos esperados:

```js
const allowed = {};

if (typeof req.body.titulo === "string") {
    allowed.titulo = req.body.titulo.trim();
}

if (typeof req.body.feito === "boolean") {
    allowed.feito = req.body.feito;
}

allowed.updatedAt = new Date();
```

Assim evitas que alguém altere `_id`, `createdAt` ou campos internos.

---

### 2.5 Erros comuns

- Usar `replaceOne` quando querias `updateOne`.
- Passar `req.body` inteiro para `$set`.
- Fazer `updateMany` com filtro demasiado aberto.

### 2.6 Checkpoint

- Porque é que `$set` é mais seguro para `PATCH`?
- Que campos não devem poder ser alterados pelo body?
- Quando faz sentido usar `updateMany`?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Remover: hard delete e soft delete

### 3.1 Hard delete

Hard delete remove o documento:

```js
await col.deleteOne({ _id: tarefaId });
```

Faz sentido quando:

- não precisas de histórico;
- o dado pode desaparecer mesmo;
- não há dependências importantes.

---

### 3.2 Soft delete

Soft delete marca o documento como removido:

```js
await col.updateOne(
    { _id: tarefaId },
    {
        $set: {
            deletedAt: new Date(),
            updatedAt: new Date(),
        },
    }
);
```

Depois, as listas filtram documentos ativos:

```js
const filter = { deletedAt: { $exists: false } };
```

---

### 3.3 Erros comuns

- Fazer hard delete quando precisavas de histórico.
- Esquecer de filtrar `deletedAt` nas listagens.
- Misturar `ativo: false` e `deletedAt` sem uma regra consistente.

### 3.4 Checkpoint

- Qual é a diferença entre hard delete e soft delete?
- Que filtro remove documentos apagados logicamente da lista?
- Quando `deleteOne` pode ser suficiente?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Filtros, projeções e paginação

### 4.1 Query com filtros

```js
const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
const feito = req.query.feito;
const prioridade = req.query.prioridade;

const filter = {
    deletedAt: { $exists: false },
};

if (q) {
    filter.titulo = { $regex: q, $options: "i" };
}

if (feito === "true" || feito === "false") {
    filter.feito = feito === "true";
}

if (["baixa", "normal", "alta"].includes(prioridade)) {
    filter.prioridade = prioridade;
}
```

Pesquisa com `$regex` é simples, mas deve ser usada com limites e índices quando os dados crescem.
Não construas filtros diretamente a partir de `req.query` inteiro. Escolhe explicitamente os campos aceites para evitar queries inesperadas.

---

### 4.2 Paginação

```js
const page = Math.max(1, Number(req.query.page || 1));
const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
const skip = (page - 1) * limit;

const [items, total] = await Promise.all([
    col
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .project({ titulo: 1, feito: 1, prioridade: 1, createdAt: 1 })
        .toArray(),
    col.countDocuments(filter),
]);

res.json({ items, page, limit, total });
```

O contrato `{ items, page, limit, total }` ajuda o frontend a desenhar paginação.
A projeção (`project`) também é uma decisão de segurança: a API devolve apenas os campos necessários, em vez de expor o documento completo.

---

### 4.3 Erros comuns

- Aceitar `limit=100000`.
- Fazer pesquisa sem limite de resultados.
- Esquecer `total`, obrigando o frontend a adivinhar se há mais páginas.
- Passar filtros desconhecidos diretamente de `req.query` para MongoDB.
- Devolver campos internos ou sensíveis por falta de projeção.

### 4.4 Checkpoint

- Porque limitamos `limit` a um máximo?
- Para que serve `skip`?
- Porque é útil devolver `total`?
- Porque é perigoso aceitar qualquer filtro vindo da query string?

<a id="sec-5"></a>

## 5. [EXTRA] Operadores frequentes

| Operador | Uso |
| --- | --- |
| `$in` | campo dentro de uma lista de valores |
| `$nin` | campo fora de uma lista |
| `$gte` / `$lte` | intervalos de datas ou números |
| `$exists` | campo existe ou não |
| `$or` | pelo menos uma condição verdadeira |
| `$and` | todas as condições verdadeiras |
| `$regex` | pesquisa textual simples |

Exemplo:

```js
const filter = {
    deletedAt: { $exists: false },
    $or: [
        { prioridade: "alta" },
        { prazo: { $lte: new Date("2026-06-01") } },
    ],
};
```

<a id="exercicios"></a>

## Exercícios - CRUD básico e operadores

1. Insere três tarefas na coleção `tarefas`.
2. Lista apenas tarefas com `feito: false`.
3. Usa projeção para devolver apenas `titulo`, `feito` e `prioridade`.
4. Atualiza uma tarefa com `$set`.
5. Faz um erro de propósito: usa `replaceOne` com um documento incompleto e observa o risco num ambiente de teste.
6. Implementa soft delete com `deletedAt`.
7. Cria uma query com `q`, `feito`, `page` e `limit`.
8. Devolve `{ items, page, limit, total }`.
9. Usa `$in` para filtrar tarefas por prioridades permitidas.
10. Explica por escrito por que motivo não deves passar `req.body` inteiro para `$set`.
11. Explica por escrito por que motivo não deves passar `req.query` inteiro para `find`.
12. Garante que a listagem usa projeção e não devolve campos desnecessários.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com exemplos incrementais, segurança em updates, paginação, checkpoints e exercícios.
- 2026-04-17: capítulo criado com CRUD, filtros e operadores essenciais.

![Footer](../Images/Footer.png)
