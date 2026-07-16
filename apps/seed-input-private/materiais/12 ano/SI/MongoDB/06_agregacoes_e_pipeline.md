![Header](../Images/Header.png)

# MongoDB (12.º Ano) - 06 · Agregações e pipeline

> **Objetivo deste ficheiro**
>
> - Perceber o que é um pipeline de agregação.
> - Usar etapas como `$match`, `$group`, `$project`, `$sort`, `$limit` e `$unwind`.
> - Criar respostas úteis para estatísticas e dashboards.
> - Decidir quando agregar na base de dados em vez de processar tudo no frontend.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] O que é um pipeline](#sec-1)
- [2. [ESSENCIAL] Etapas mais usadas](#sec-2)
- [3. [ESSENCIAL] Estatísticas de tarefas](#sec-3)
- [4. [ESSENCIAL+] Agregar por tags e por período](#sec-4)
- [5. [EXTRA] Performance e limites](#sec-5)
- [Exercícios - Agregações e pipeline](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo usa MongoDB para transformar dados antes de chegarem ao backend. Agregações são úteis quando queres totais, agrupamentos, rankings ou dados preparados para gráficos.

- **Núcleo do tema:** as secções [ESSENCIAL] apresentam pipeline e etapas base.
- **Aprofundamento:** as secções [ESSENCIAL+] aplicam agregações a arrays e datas.
- **Contexto adicional:** as secções [EXTRA] ajudam a evitar pipelines caros sem necessidade.

<a id="sec-1"></a>

## 1. [ESSENCIAL] O que é um pipeline

### 1.1 Modelo mental

Um pipeline é uma sequência de etapas.

Cada etapa recebe documentos, transforma-os e passa resultado à etapa seguinte.

```text
documentos originais
  ↓ $match
documentos filtrados
  ↓ $group
grupos calculados
  ↓ $project
formato final
```

---

### 1.2 Exemplo mínimo

```js
const rows = await db.collection("tarefas").aggregate([
    { $match: { deletedAt: { $exists: false } } },
    { $group: { _id: "$feito", total: { $sum: 1 } } },
]).toArray();
```

Resultado possível:

```json
[
    { "_id": false, "total": 12 },
    { "_id": true, "total": 8 }
]
```

---

### 1.3 Quando usar agregação

Usa agregação quando queres:

- somas;
- contagens;
- médias;
- agrupamentos;
- rankings;
- dados prontos para dashboard.

Evita carregar milhares de documentos para o Node só para contar no JavaScript.

---

### 1.4 Erros comuns

- Fazer no frontend contas que a base de dados pode fazer melhor.
- Criar pipeline enorme antes de perceber o resultado de cada etapa.
- Esquecer `$match` cedo e processar documentos a mais.

### 1.5 Checkpoint

- O que é uma etapa de pipeline?
- Para que serve `$group`?
- Porque é útil filtrar com `$match` cedo?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Etapas mais usadas

### 2.1 `$match`

Filtra documentos.

```js
{ $match: { feito: false, deletedAt: { $exists: false } } }
```

---

### 2.2 `$group`

Agrupa documentos e calcula valores.

```js
{
    $group: {
        _id: "$prioridade",
        total: { $sum: 1 }
    }
}
```

---

### 2.3 `$project`

Escolhe e transforma campos.

```js
{
    $project: {
        _id: 0,
        prioridade: "$_id",
        total: 1
    }
}
```

---

### 2.4 `$sort` e `$limit`

Ordena e limita resultados.

```js
{ $sort: { total: -1 } },
{ $limit: 5 }
```

---

### 2.5 `$unwind`

Transforma cada item de um array num documento temporário.

```js
{ $unwind: "$tags" }
```

Se uma tarefa tem três tags, passa a contar como três linhas temporárias no pipeline.

---

### 2.6 Checkpoint

- Que etapa usas para filtrar?
- Que etapa usas para escolher campos finais?
- Para que serve `$unwind`?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Estatísticas de tarefas

### 3.1 Total por estado `feito`

```js
const rows = await db.collection("tarefas").aggregate([
    { $match: { deletedAt: { $exists: false } } },
    { $group: { _id: "$feito", total: { $sum: 1 } } },
    { $project: { _id: 0, feito: "$_id", total: 1 } },
    { $sort: { feito: 1 } },
]).toArray();
```

Resultado:

```json
[
    { "feito": false, "total": 12 },
    { "feito": true, "total": 8 }
]
```

---

### 3.2 Total por prioridade

```js
const rows = await db.collection("tarefas").aggregate([
    { $match: { deletedAt: { $exists: false } } },
    { $group: { _id: "$prioridade", total: { $sum: 1 } } },
    { $project: { _id: 0, prioridade: "$_id", total: 1 } },
    { $sort: { total: -1 } },
]).toArray();
```

---

### 3.3 Endpoint Express

```js
export const estatisticas = asyncHandler(async (_req, res) => {
    const db = getDb();

    const porPrioridade = await db.collection("tarefas").aggregate([
        { $match: { deletedAt: { $exists: false } } },
        { $group: { _id: "$prioridade", total: { $sum: 1 } } },
        { $project: { _id: 0, prioridade: "$_id", total: 1 } },
        { $sort: { total: -1 } },
    ]).toArray();

    res.json({ porPrioridade });
});
```

---

### 3.4 Erros comuns

- Devolver `_id` técnico quando a resposta podia ter `prioridade`.
- Esquecer `deletedAt` no `$match`.
- Ordenar antes de agrupar quando a ordenação só interessa no resultado final.

### 3.5 Checkpoint

- Porque usamos `$project` depois de `$group`?
- Que campo usamos para remover tarefas apagadas logicamente?
- Que etapa ordena o resultado final?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Agregar por tags e por período

### 4.1 Top tags

```js
const topTags = await db.collection("tarefas").aggregate([
    { $match: { deletedAt: { $exists: false } } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", total: { $sum: 1 } } },
    { $project: { _id: 0, tag: "$_id", total: 1 } },
    { $sort: { total: -1 } },
    { $limit: 5 },
]).toArray();
```

Se `tags` é array, `$unwind` é o passo que permite contar cada tag individualmente.

---

### 4.2 Evolução mensal

```js
const porMes = await db.collection("tarefas").aggregate([
    { $match: { deletedAt: { $exists: false } } },
    {
        $group: {
            _id: {
                ano: { $year: "$createdAt" },
                mes: { $month: "$createdAt" },
            },
            total: { $sum: 1 },
        },
    },
    {
        $project: {
            _id: 0,
            ano: "$_id.ano",
            mes: "$_id.mes",
            total: 1,
        },
    },
    { $sort: { ano: 1, mes: 1 } },
]).toArray();
```

Resultado possível:

```json
[
    { "ano": 2026, "mes": 4, "total": 7 },
    { "ano": 2026, "mes": 5, "total": 12 }
]
```

---

### 4.3 Checkpoint

- Porque usamos `$unwind` antes de agrupar tags?
- Que operadores extraem ano e mês?
- Que formato seria fácil de desenhar num gráfico?

<a id="sec-5"></a>

## 5. [EXTRA] Performance e limites

### 5.1 Regras práticas

- Usa `$match` cedo.
- Cria índices para campos filtrados antes do pipeline.
- Não faças dashboards pesados em cada refresh se os dados forem grandes.
- Evita pipelines difíceis de ler quando uma query simples chega.

---

### 5.2 Agregação não substitui modelação

Se precisas de pipelines enormes para qualquer ecrã básico, talvez o modelo de documentos esteja a dificultar as leituras.

Antes de complicar o pipeline, confirma:

- os dados estão no sítio certo?
- há índices adequados?
- a resposta precisa mesmo de todos os cálculos agora?

<a id="exercicios"></a>

## Exercícios - Agregações e pipeline

1. Cria uma agregação com total de tarefas por `feito`.
2. Formata o resultado com `$project` para remover `_id`.
3. Cria total de tarefas por `prioridade`.
4. Cria top 5 `tags` usando `$unwind`.
5. Cria evolução mensal com `$year` e `$month`.
6. Adiciona sempre `$match` para ignorar `deletedAt`.
7. Cria um endpoint `GET /api/v1/tarefas/stats`.
8. Devolve `{ porPrioridade, topTags, porMes }`.
9. Explica por escrito quando uma agregação é melhor do que calcular no React.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com modelo mental de pipeline, exemplos incrementais, checkpoints e exercícios.
- 2026-04-17: capítulo criado com pipeline base e casos práticos.

![Footer](../Images/Footer.png)
