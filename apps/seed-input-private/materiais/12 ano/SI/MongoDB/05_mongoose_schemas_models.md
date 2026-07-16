![Header](../Images/Header.png)

# MongoDB (12.º Ano) - 05 · Mongoose: schemas e models

> **Objetivo deste ficheiro**
>
> - Perceber o que o Mongoose acrescenta ao driver oficial.
> - Criar schemas, models, defaults, validações e timestamps.
> - Implementar CRUD com Mongoose mantendo contrato de API consistente.
> - Usar referências e `populate` com moderação.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Porque usar Mongoose](#sec-1)
- [2. [ESSENCIAL] Schema e model de tarefa](#sec-2)
- [3. [ESSENCIAL] CRUD com validação](#sec-3)
- [4. [ESSENCIAL+] Referências e `populate`](#sec-4)
- [5. [EXTRA] Hooks, métodos e trade-offs](#sec-5)
- [Exercícios - Mongoose](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo apresenta uma alternativa ao driver oficial. Mongoose é uma camada por cima de MongoDB que organiza schemas, models, validações e relações.

- **Núcleo do tema:** as secções [ESSENCIAL] criam schema, model e CRUD.
- **Aprofundamento:** as secções [ESSENCIAL+] mostram referências entre coleções.
- **Contexto adicional:** as secções [EXTRA] explicam hooks, métodos e custos da abstração.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Porque usar Mongoose

### 1.1 Modelo mental

Com o driver oficial, trabalhas diretamente com coleções:

```js
db.collection("tarefas").insertOne(...)
```

Com Mongoose, trabalhas com models:

```js
Tarefa.create(...)
```

O model representa uma coleção e usa um schema para validar e estruturar documentos.

```text
Schema -> define forma e regras
Model  -> cria API para consultar/gravar
Documento -> instância guardada no MongoDB
```

---

### 1.2 O que Mongoose ajuda a fazer

- Validar campos de forma declarativa.
- Definir defaults.
- Criar timestamps automáticos.
- Usar models com métodos como `find`, `create`, `findByIdAndUpdate`.
- Ligar documentos com referências e `populate`.

---

### 1.3 Trade-off

Mongoose não é "sempre melhor".

| Abordagem | Vantagem | Custo |
| --- | --- | --- |
| Driver oficial | controlo direto e menos abstração | mais código manual |
| Mongoose | schemas e validação integrados | mais uma camada para aprender |

Escolhe consoante o projeto e a equipa.

---

### 1.4 Erros comuns

- Pensar que Mongoose substitui validação de API.
- Usar `populate` em tudo sem medir impacto.
- Esquecer `runValidators: true` em updates.

### 1.5 Checkpoint

- Qual é a diferença entre schema e model?
- Que problema Mongoose resolve bem?
- Porque é que Mongoose não elimina a necessidade de validar inputs?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Schema e model de tarefa

### 2.1 Instalar

```bash
npm i mongoose
```

Esta dependência justifica-se quando queres usar schemas e models em vez de trabalhar diretamente com coleções.

---

### 2.2 Ligação com Mongoose

```js
// src/db/mongoose.js
import mongoose from "mongoose";

export async function connectMongoose() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGODB_URI em falta");
    }

    await mongoose.connect(uri, {
        dbName: process.env.DB_NAME || "escola",
    });
}
```

---

### 2.3 Schema

```js
// src/models/Tarefa.js
import mongoose from "mongoose";

const tarefaSchema = new mongoose.Schema(
    {
        titulo: {
            type: String,
            required: [true, "Título é obrigatório"],
            trim: true,
            minlength: [3, "Título deve ter pelo menos 3 caracteres"],
            maxlength: [120, "Título deve ter no máximo 120 caracteres"],
        },
        feito: {
            type: Boolean,
            default: false,
        },
        prioridade: {
            type: String,
            enum: ["baixa", "normal", "alta"],
            default: "normal",
        },
        tags: {
            type: [String],
            default: [],
        },
        deletedAt: {
            type: Date,
            default: undefined,
        },
    },
    { timestamps: true }
);

export const Tarefa = mongoose.model("Tarefa", tarefaSchema);
```

`timestamps: true` cria `createdAt` e `updatedAt`.

---

### 2.4 Erros comuns

- Criar schema sem `trim` em campos de texto importantes.
- Esquecer limites mínimos/máximos.
- Usar enum no frontend mas não validar no backend.

### 2.5 Checkpoint

- O que faz `timestamps: true`?
- Para que serve `enum`?
- Porque é útil `trim` no schema?

<a id="sec-3"></a>

## 3. [ESSENCIAL] CRUD com validação

### 3.1 Listar

```js
// src/repositories/tarefas.repo.mongoose.js
import { Tarefa } from "../models/Tarefa.js";

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
        Tarefa.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Tarefa.countDocuments(filter),
    ]);

    return { items, page, limit, total };
}
```

---

### 3.2 Criar

```js
export async function criar(data) {
    return Tarefa.create({
        titulo: data.titulo,
        prioridade: data.prioridade,
        tags: data.tags,
    });
}
```

Se `titulo` for inválido, Mongoose lança `ValidationError`.

---

### 3.3 Atualizar

```js
export async function atualizar(id, patch) {
    const allowed = {};

    if (typeof patch.titulo === "string") {
        allowed.titulo = patch.titulo;
    }

    if (typeof patch.feito === "boolean") {
        allowed.feito = patch.feito;
    }

    if (typeof patch.prioridade === "string") {
        allowed.prioridade = patch.prioridade;
    }

    return Tarefa.findByIdAndUpdate(id, allowed, {
        new: true,
        runValidators: true,
    });
}
```

`runValidators: true` é importante: sem isso, alguns updates podem escapar às regras do schema.

---

### 3.4 Remover com soft delete

```js
export async function remover(id) {
    return Tarefa.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
    );
}
```

---

### 3.5 Erros comuns

- Passar `req.body` inteiro para update.
- Esquecer `runValidators: true`.
- Não filtrar `deletedAt` nas listagens.

### 3.6 Checkpoint

- Que método cria um documento com Mongoose?
- Para que serve `new: true` em `findByIdAndUpdate`?
- Porque é perigoso passar `req.body` inteiro?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Referências e `populate`

### 4.1 Model de categoria

```js
// src/models/Categoria.js
import mongoose from "mongoose";

const categoriaSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        cor: {
            type: String,
            default: "#0ea5e9",
        },
    },
    { timestamps: true }
);

export const Categoria = mongoose.model("Categoria", categoriaSchema);
```

---

### 4.2 Referência na tarefa

```js
categoriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categoria",
}
```

---

### 4.3 `populate`

```js
const tarefas = await Tarefa.find({ deletedAt: { $exists: false } })
    .populate("categoriaId", "nome cor")
    .sort({ createdAt: -1 });
```

`populate` substitui o ID por dados da categoria.

Usa apenas quando a resposta precisa mesmo desses dados.

---

### 4.4 Erros comuns

- Fazer `populate` em listas grandes sem paginação.
- Popular documentos completos quando só precisas de `nome`.
- Usar `populate` para esconder uma modelação confusa.

### 4.5 Checkpoint

- O que significa `ref: "Categoria"`?
- Que campos estamos a pedir no `populate("categoriaId", "nome cor")`?
- Porque é que `populate` deve ser usado com moderação?

<a id="sec-5"></a>

## 5. [EXTRA] Hooks, métodos e trade-offs

### 5.1 Hook `pre("save")`

```js
tarefaSchema.pre("save", function () {
    if (this.isModified("titulo")) {
        this.titulo = this.titulo.trim();
    }
});
```

Nem tudo precisa de hook. Se a regra for simples e já existe no schema, evita duplicação.

---

### 5.2 Virtuals

Virtuals são campos calculados que não ficam guardados no MongoDB.

```js
tarefaSchema.virtual("estaAtrasada").get(function () {
    return this.prazo && !this.feito && this.prazo < new Date();
});
```

---

### 5.3 Regra prática

- Usa schema para forma e validação.
- Usa service para regras de negócio.
- Usa hooks só quando a regra pertence claramente ao ciclo de vida do documento.

<a id="exercicios"></a>

## Exercícios - Mongoose

1. Instala `mongoose`.
2. Cria `src/db/mongoose.js` com `connectMongoose`.
3. Cria o model `Tarefa`.
4. Define `titulo`, `feito`, `prioridade`, `tags` e `deletedAt`.
5. Ativa `timestamps`.
6. Implementa `listar` com paginação e filtro `feito`.
7. Implementa `criar`.
8. Implementa `atualizar` com `runValidators: true`.
9. Implementa soft delete.
10. Cria model `Categoria` e adiciona `categoriaId` à tarefa.
11. Usa `populate` para devolver `nome` e `cor` da categoria.
12. Faz um erro de propósito: remove `runValidators` e observa o risco num ambiente de teste.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com modelo mental, schema completo, CRUD, populate, checkpoints e exercícios.
- 2026-04-17: capítulo criado com schemas, models, CRUD e populate.

![Footer](../Images/Footer.png)
