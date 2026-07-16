![Header](../Images/Header.png)

# MongoDB (12.º Ano) - 07 · Queries e indexação

> **Objetivo deste ficheiro**
>
> - Criar queries previsíveis para paginação, filtros e pesquisa simples.
> - Perceber o que são índices e porque melhoram consultas frequentes.
> - Criar índices adequados aos padrões reais da API.
> - Usar `explain` para comparar custo antes e depois de um índice.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Query de paginação e filtros](#sec-1)
- [2. [ESSENCIAL] Índices: o que são e porque importam](#sec-2)
- [3. [ESSENCIAL] Índices úteis para o módulo](#sec-3)
- [4. [ESSENCIAL+] Sort, índices compostos e custo](#sec-4)
- [5. [EXTRA] `explain` e leitura rápida](#sec-5)
- [Exercícios - Queries e indexação](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo melhora queries para quando a coleção deixa de ter meia dúzia de documentos. A partir daqui, já não basta "funcionar": também interessa limitar resultados, filtrar bem e criar índices nos campos certos.

- **Núcleo do tema:** as secções [ESSENCIAL] cobrem query paginada e índices.
- **Aprofundamento:** as secções [ESSENCIAL+] mostram índices compostos e ordenação.
- **Contexto adicional:** as secções [EXTRA] introduzem `explain` como ferramenta de diagnóstico.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Query de paginação e filtros

### 1.1 Modelo mental

Uma lista de API raramente deve devolver tudo.

Normalmente precisa de:

- página atual;
- limite por página;
- filtros;
- pesquisa;
- ordenação;
- total.

Contrato:

```json
{
    "items": [],
    "page": 1,
    "limit": 20,
    "total": 0
}
```

---

### 1.2 Query completa

```js
const page = Math.max(1, Number(req.query.page || 1));
const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
const feito = req.query.feito;

const filter = {
    deletedAt: { $exists: false },
};

if (q) {
    filter.titulo = { $regex: q, $options: "i" };
}

if (feito === "true" || feito === "false") {
    filter.feito = feito === "true";
}

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

---

### 1.3 Cuidados com pesquisa simples

`$regex` com texto livre pode ficar caro em coleções grandes.

Para este percurso, usa com:

- `limit`;
- filtros;
- índices quando possível;
- campos controlados.

Para pesquisa textual avançada, MongoDB tem opções próprias como text indexes ou Atlas Search, mas ficam fora do essencial deste módulo.

Se `q` vier diretamente do utilizador, mantém limites curtos e evita combinar pesquisa livre com listas sem paginação. Pesquisa textual parece simples, mas pode transformar-se numa query cara quando a coleção cresce.

---

### 1.4 Erros comuns

- Devolver listas sem paginação.
- Aceitar `limit` sem máximo.
- Usar `$regex` em tudo sem perceber o custo.
- Criar índices antes de perceber que filtros e ordenações a API realmente usa.

### 1.5 Checkpoint

- Porque é que uma API não deve devolver todos os documentos de uma vez?
- Para que serve `total`?
- Porque limitamos o valor máximo de `limit`?
- Porque é que índices devem seguir padrões reais de acesso?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Índices: o que são e porque importam

### 2.1 Modelo mental

Um índice em MongoDB é parecido com o índice de um livro.

Sem índice:

```text
MongoDB percorre muitos documentos até encontrar o que interessa.
```

Com índice adequado:

```text
MongoDB usa uma estrutura auxiliar para chegar mais depressa aos candidatos.
```

---

### 2.2 Exemplo simples

Se procuras muitas vezes por `feito`:

```js
await col.createIndex({ feito: 1 });
```

Se ordenas muitas vezes por `createdAt`:

```js
await col.createIndex({ createdAt: -1 });
```

---

### 2.3 Índices também têm custo

Índices melhoram leituras, mas:

- ocupam espaço;
- tornam escritas ligeiramente mais caras;
- precisam de ser escolhidos com base nas queries reais.

Não cries índice para todos os campos "só por acaso".

---

### 2.4 Erros comuns

- Criar índices sem saber que queries existem.
- Criar índices duplicados.
- Esperar que um índice resolva uma query mal desenhada.

### 2.5 Checkpoint

- Para que serve um índice?
- Qual é o custo de ter índices?
- Porque é que os índices devem seguir padrões de acesso reais?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Índices úteis para o módulo

### 3.1 Ordenação por criação

```js
await col.createIndex({ createdAt: -1 });
```

Útil para:

```js
col.find(filter).sort({ createdAt: -1 });
```

---

### 3.2 Filtro por estado e ordenação

```js
await col.createIndex({ feito: 1, createdAt: -1 });
```

Útil para:

```js
col.find({ feito: false }).sort({ createdAt: -1 });
```

O campo de igualdade (`feito`) vem antes do campo de ordenação (`createdAt`).

---

### 3.3 Índice único

Para impedir categorias duplicadas:

```js
await db.collection("categorias").createIndex(
    { nome: 1 },
    { unique: true }
);
```

Se tentares inserir outra categoria com o mesmo `nome`, MongoDB lança erro `11000 duplicate key`.

---

### 3.4 Onde criar índices

Em projetos pequenos, podes ter um script:

```js
// src/scripts/create-indexes.js
import { connectMongo, getDb, closeMongo } from "../db/mongo.js";

await connectMongo();

const db = getDb();
await db.collection("tarefas").createIndex({ createdAt: -1 });
await db.collection("tarefas").createIndex({ feito: 1, createdAt: -1 });
await db.collection("categorias").createIndex({ nome: 1 }, { unique: true });

await closeMongo();
```

---

### 3.5 Checkpoint

- Que índice ajuda `find({ feito: false }).sort({ createdAt: -1 })`?
- Para que serve um índice `unique`?
- Porque pode fazer sentido criar índices num script separado?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Sort, índices compostos e custo

### 4.1 Índice composto

Um índice composto tem mais do que um campo:

```js
await col.createIndex({ feito: 1, prioridade: 1, createdAt: -1 });
```

Pode ajudar queries como:

```js
col
    .find({ feito: false, prioridade: "alta" })
    .sort({ createdAt: -1 });
```

---

### 4.2 Ordem dos campos

Regra prática:

1. campos de igualdade;
2. campos de ordenação;
3. campos de intervalo, quando existirem.

Exemplo:

```js
await col.createIndex({ feito: 1, createdAt: -1 });
```

---

### 4.3 Erros comuns

- Criar `{ createdAt: -1, feito: 1 }` quando a query filtra por `feito` e ordena por `createdAt`.
- Ordenar por um campo sem índice numa coleção grande.
- Criar índices compostos para queries que quase nunca acontecem.

### 4.4 Checkpoint

- O que é um índice composto?
- Porque a ordem dos campos importa?
- Que campos vêm primeiro quando há igualdade e ordenação?

<a id="sec-5"></a>

## 5. [EXTRA] `explain` e leitura rápida

### 5.1 Usar `explain`

```js
const plan = await col
    .find({ feito: false })
    .sort({ createdAt: -1 })
    .explain("executionStats");

console.log(plan.executionStats.totalDocsExamined);
console.log(plan.executionStats.totalKeysExamined);
```

Compara:

1. antes de criar índice;
2. depois de criar índice.

---

### 5.2 O que observar

- `totalDocsExamined`: documentos examinados.
- `totalKeysExamined`: entradas de índice examinadas.
- `executionTimeMillis`: tempo de execução.

Em exemplos pequenos, a diferença pode ser pequena. O valor está em aprender a ler o plano antes de chegar a problemas reais.

<a id="exercicios"></a>

## Exercícios - Queries e indexação

1. Implementa query com `page`, `limit`, `q` e `feito`.
2. Garante que `limit` tem máximo de `100`.
3. Devolve `{ items, page, limit, total }`.
4. Cria índice `{ createdAt: -1 }`.
5. Cria índice `{ feito: 1, createdAt: -1 }`.
6. Cria índice único em `categorias.nome`.
7. Tenta inserir duas categorias com o mesmo `nome` e observa o erro.
8. Usa `explain("executionStats")` antes e depois de criar índice.
9. Escreve uma conclusão curta sobre `totalDocsExamined`.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com modelo mental de índices, exemplos de query, `explain`, checkpoints e exercícios.
- 2026-04-17: capítulo criado com queries práticas e fundamentos de indexação.

![Footer](../Images/Footer.png)
