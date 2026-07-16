![Header](../Images/Header.png)

# Node.js (12.º Ano) - 08 · Persistência em ficheiro JSON

> **Objetivo deste ficheiro**
>
> - Guardar dados num ficheiro JSON usando `fs/promises`.
> - Implementar um repository para `todos`.
> - Separar persistência de regras de negócio.
> - Reconhecer limites de ficheiros JSON em APIs reais.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Porque começar com JSON](#sec-1)
- [2. [ESSENCIAL] Utilitário para ler e escrever JSON](#sec-2)
- [3. [ESSENCIAL] Repository de `todos`](#sec-3)
- [4. [ESSENCIAL+] Service por cima do repository](#sec-4)
- [5. [EXTRA] Limitações desta abordagem](#sec-5)
- [Exercícios - Persistência em JSON](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo adiciona persistência simples ao projeto. Em vez de perder dados ao reiniciar o servidor, a API passa a guardar tarefas num ficheiro JSON.

- **Núcleo do tema:** as secções [ESSENCIAL] criam leitura, escrita e repository.
- **Aprofundamento:** as secções [ESSENCIAL+] ligam repository e service.
- **Contexto adicional:** as secções [EXTRA] mostram quando JSON deixa de chegar.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Porque começar com JSON

### 1.1 Modelo mental

Antes de usar uma base de dados, um ficheiro JSON permite ver o ciclo completo:

```text
pedido HTTP
  ↓
controller
  ↓
service
  ↓
repository
  ↓
ficheiro JSON
```

Vantagens:

- é fácil abrir e ver os dados;
- não exige instalar base de dados;
- permite praticar `async/await`;
- prepara a troca futura para MongoDB, PostgreSQL ou outra base de dados.

---

### 1.2 Estrutura do ficheiro

```json
[
    {
        "id": "d6b6b347-7f27-4a20-a0de-9dfc50dfdc0f",
        "titulo": "Estudar persistência",
        "concluido": false,
        "criadoEm": 1710000000000
    }
]
```

---

### 1.3 Erros comuns

- Tratar JSON como texto e usar `appendFile`.
- Esquecer que o ficheiro pode ainda não existir.
- Misturar lógica de ficheiros diretamente no controller.

### 1.4 Checkpoint

- Porque é que JSON é um bom primeiro passo?
- Que camada deve saber onde está o ficheiro?
- O que acontece aos dados se usares apenas memória?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Utilitário para ler e escrever JSON

### 2.1 `jsonFile.js`

```js
// src/utils/jsonFile.js
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Lê dados JSON de um ficheiro.
 *
 * @param {string} caminho
 * @param {unknown} fallback
 * @returns {Promise<unknown>}
 */
export async function lerJSON(caminho, fallback = null) {
    try {
        const texto = await fs.readFile(caminho, "utf8");
        return JSON.parse(texto);
    } catch (err) {
        if (err.code === "ENOENT") {
            return fallback;
        }

        throw err;
    }
}

/**
 * Escreve dados JSON num ficheiro.
 *
 * @param {string} caminho
 * @param {unknown} dados
 * @returns {Promise<void>}
 */
export async function escreverJSON(caminho, dados) {
    await fs.mkdir(path.dirname(caminho), { recursive: true });

    const temporario = `${caminho}.tmp`;
    const conteudo = JSON.stringify(dados, null, 2);

    await fs.writeFile(temporario, conteudo, "utf8");
    await fs.rename(temporario, caminho);
}
```

---

### 2.2 Porque usar `.tmp`

O fluxo:

```text
escrever ficheiro temporário
  ↓
renomear para ficheiro final
```

Se a escrita falhar, o ficheiro principal tem menor probabilidade de ficar incompleto.

---

### 2.3 Erros comuns

- Não criar a pasta antes de escrever.
- Usar `JSON.stringify(dados)` sem indentação e tornar o ficheiro difícil de ler.
- Apanhar todos os erros e devolver fallback, escondendo problemas reais.

### 2.4 Checkpoint

- Para que serve o fallback em `lerJSON`?
- Porque é que só tratamos `ENOENT` como caso esperado?
- Qual é a vantagem de escrever com indentação?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Repository de `todos`

### 3.1 Caminho do ficheiro

```js
// src/repositories/todos.repo.file.js
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const caminhoTodos = path.join(__dirname, "..", "data", "todos.json");
```

---

### 3.2 Repository completo

```js
// src/repositories/todos.repo.file.js
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lerJSON, escreverJSON } from "../utils/jsonFile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const caminhoTodos = path.join(__dirname, "..", "data", "todos.json");

async function lerTodos() {
    return lerJSON(caminhoTodos, []);
}

async function gravarTodos(todos) {
    await escreverJSON(caminhoTodos, todos);
}

export async function listar() {
    return lerTodos();
}

export async function obter(id) {
    const todos = await lerTodos();
    return todos.find((todo) => todo.id === id) || null;
}

export async function criar({ titulo, concluido = false }) {
    const todos = await lerTodos();

    const novo = {
        id: crypto.randomUUID(),
        titulo,
        concluido,
        criadoEm: Date.now(),
    };

    todos.push(novo);
    await gravarTodos(todos);

    return novo;
}

export async function atualizar(id, patch) {
    const todos = await lerTodos();
    const index = todos.findIndex((todo) => todo.id === id);

    if (index === -1) {
        return null;
    }

    const { id: _id, criadoEm: _criadoEm, ...safePatch } = patch;

    todos[index] = {
        ...todos[index],
        ...safePatch,
        atualizadoEm: Date.now(),
    };

    await gravarTodos(todos);
    return todos[index];
}

export async function remover(id) {
    const todos = await lerTodos();
    const filtrados = todos.filter((todo) => todo.id !== id);

    if (filtrados.length === todos.length) {
        return false;
    }

    await gravarTodos(filtrados);
    return true;
}
```

---

### 3.3 Erros comuns

- Alterar `patch.id` e permitir trocar o ID de uma tarefa.
- Não tratar o caso em que `findIndex` devolve `-1`.
- Esquecer `await` antes de gravar o ficheiro.

### 3.4 Checkpoint

- Porque é que `obter` devolve `null` quando não encontra?
- Porque é que `remover` devolve boolean?
- Que função gera o ID?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Service por cima do repository

### 4.1 Service simples

```js
// src/services/todos.service.js
import { HttpError } from "../utils/HttpError.js";
import * as todosRepository from "../repositories/todos.repo.file.js";

export function listar() {
    return todosRepository.listar();
}

export async function obter(id) {
    const todo = await todosRepository.obter(id);

    if (!todo) {
        throw new HttpError("Tarefa não encontrada", 404, {
            code: "NOT_FOUND",
        });
    }

    return todo;
}

export async function criar(input) {
    const titulo = typeof input.titulo === "string" ? input.titulo.trim() : "";

    if (!titulo) {
        throw new HttpError("Título é obrigatório", 422, {
            code: "VALIDATION_ERROR",
            details: [{ field: "titulo", message: "Obrigatório" }],
        });
    }

    return todosRepository.criar({
        titulo,
        concluido:
            typeof input.concluido === "boolean" ? input.concluido : false,
    });
}

export async function atualizar(id, patch) {
    const todo = await todosRepository.atualizar(id, patch);

    if (!todo) {
        throw new HttpError("Tarefa não encontrada", 404, {
            code: "NOT_FOUND",
        });
    }

    return todo;
}

export async function remover(id) {
    const removido = await todosRepository.remover(id);

    if (!removido) {
        throw new HttpError("Tarefa não encontrada", 404, {
            code: "NOT_FOUND",
        });
    }

    return true;
}
```

O service decide regras. O repository guarda e lê dados.

---

### 4.2 Checkpoint

- Porque é que validação de regra pode ficar no service?
- Porque é que o repository não precisa de conhecer HTTP?
- Que parte mudaria se trocasses JSON por base de dados?

<a id="sec-5"></a>

## 5. [EXTRA] Limitações desta abordagem

Ficheiros JSON são bons para começar, mas têm limites:

- dois pedidos simultâneos podem sobrescrever alterações;
- não há índices para pesquisar depressa;
- não há transações;
- ficheiros grandes tornam leitura/escrita mais lenta;
- não há controlo de utilizadores ou permissões ao nível dos dados.

Quando estes problemas começarem a importar, faz sentido trocar o repository por uma base de dados.

<a id="exercicios"></a>

## Exercícios - Persistência em JSON

1. Cria `src/utils/jsonFile.js`.
2. Cria `src/data/todos.json` com uma lista vazia `[]`.
3. Cria `src/repositories/todos.repo.file.js`.
4. Implementa `listar` e `obter`.
5. Implementa `criar` com `crypto.randomUUID()`.
6. Implementa `atualizar`.
7. Implementa `remover`.
8. Liga o repository ao service.
9. Testa `POST /api/v1/todos` e confirma que o ficheiro JSON muda.
10. Reinicia o servidor e confirma que os dados continuam no ficheiro.
11. (EXTRA) Impede que `patch` altere o campo `id`.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, utilitário JSON, repository, service, checkpoints e exercícios.
- 2025-11-10: criação do capítulo com persistência em ficheiro JSON.

![Footer](../Images/Footer.png)
