![Header](../Images/Header.png)

# Node.js (12.º Ano) - 05 · Estrutura MVC leve e camadas

> **Objetivo deste ficheiro**
>
> - Organizar uma API Express por responsabilidades.
> - Perceber o fluxo `route -> controller -> service -> repository`.
> - Evitar ficheiros gigantes e lógica misturada.
> - Preparar a estrutura usada nos capítulos de validação, erros, persistência e testes.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Porque a estrutura importa](#sec-1)
- [2. [ESSENCIAL] Responsabilidades por camada](#sec-2)
- [3. [ESSENCIAL] Estrutura de pastas](#sec-3)
- [4. [ESSENCIAL+] Fluxo de dados completo](#sec-4)
- [5. [EXTRA] Convenções de nomes](#sec-5)
- [Exercícios - Estrutura MVC leve](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo aparece depois do Express básico porque a necessidade de organização fica mais clara quando já existem algumas rotas.

- **Núcleo do tema:** as secções [ESSENCIAL] definem camadas e responsabilidades.
- **Aprofundamento:** as secções [ESSENCIAL+] mostram o fluxo completo de um pedido.
- **Contexto adicional:** as secções [EXTRA] ajudam a manter nomes consistentes.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Porque a estrutura importa

### 1.1 O problema

Este estilo funciona em projetos muito pequenos:

```js
app.post("/api/v1/todos", async (req, res) => {
    // valida body
    // lê ficheiro
    // cria objeto
    // escreve ficheiro
    // decide status
    // responde
});
```

Mas quando a aplicação cresce, a rota começa a saber coisas a mais:

- detalhes HTTP;
- validação;
- regras de negócio;
- acesso a dados;
- formato de erro.

O resultado é código difícil de testar e alterar.

---

### 1.2 Modelo mental

Cada camada deve ter uma responsabilidade principal:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
```

O pedido desce pelas camadas. A resposta volta no sentido contrário.

---

### 1.3 Erros comuns

- Colocar regras de negócio diretamente nas rotas.
- Ler ficheiros ou base de dados dentro do controller.
- Criar camadas sem saber o que cada uma resolve.

### 1.4 Checkpoint

- Que problema aparece quando tudo fica dentro da rota?
- Qual é a vantagem de separar regras de negócio do HTTP?
- Que camada deve saber como ler um ficheiro JSON?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Responsabilidades por camada

### 2.1 Route

A route liga URL e método HTTP a um controller.

```js
router.get("/", todosController.listar);
router.post("/", todosController.criar);
```

A route deve ter pouca lógica.

---

### 2.2 Controller

O controller conhece `req` e `res`.

Responsabilidades típicas:

- ler `req.params`, `req.query` e `req.body`;
- chamar services;
- escolher status HTTP;
- devolver JSON.

```js
export async function listar(_req, res) {
    const todos = await todosService.listar();
    res.json(todos);
}
```

---

### 2.3 Service

O service guarda regras de negócio.

Exemplos:

- normalizar título;
- impedir criação sem dados válidos;
- decidir se um recurso existe;
- combinar dados de vários repositories.

```js
export async function criar(input) {
    const titulo = input.titulo.trim();

    return todosRepository.criar({
        titulo,
        concluido: false,
    });
}
```

---

### 2.4 Repository

O repository sabe como os dados são guardados.

Hoje pode ser JSON:

```js
export async function listar() {
    return lerJSON(caminhoTodos, []);
}
```

Mais tarde pode ser uma base de dados. A ideia é trocar o repository sem reescrever controllers e routes.

---

### 2.5 Checkpoint

- Que camada conhece `req` e `res`?
- Que camada contém regras de negócio?
- Que camada mudaria se trocasses JSON por MongoDB?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Estrutura de pastas

### 3.1 Estrutura recomendada

```text
src/
  app.js
  server.js
  routes/
    todos.router.js
  controllers/
    todos.controller.js
  services/
    todos.service.js
  repositories/
    todos.repo.file.js
  middlewares/
    errors.js
    validate.js
  schemas/
    todo.schemas.js
  utils/
    asyncHandler.js
    config.js
    jsonFile.js
  data/
    todos.json
  public/
tests/
```

---

### 3.2 O que já existe e o que vem depois

| Capítulo | Peças principais |
| --- | --- |
| 04 | `app.js`, `server.js`, endpoints simples |
| 05 | organização por camadas |
| 06 | routes, controllers e validação |
| 07 | erros e `asyncHandler` |
| 08 | repository em JSON |
| 11 | testes com Supertest/Vitest |

---

### 3.3 Erros comuns

- Criar uma pasta `helpers` para tudo e perder clareza.
- Chamar `models` a ficheiros que não são modelos de dados.
- Ter nomes diferentes para o mesmo conceito, como `todo`, `task` e `tarefa` no mesmo projeto.

### 3.4 Checkpoint

- Onde colocarias `asyncHandler.js`?
- Onde colocarias `todo.schemas.js`?
- Porque é que `todos.repo.file.js` inclui `.file` no nome?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Fluxo de dados completo

### 4.1 Exemplo: listar tarefas

```text
GET /api/v1/todos
  ↓
routes/todos.router.js
  ↓
controllers/todos.controller.js
  ↓
services/todos.service.js
  ↓
repositories/todos.repo.file.js
  ↓
data/todos.json
```

Resposta:

```json
[
    {
        "id": "1",
        "titulo": "Estudar camadas",
        "concluido": false
    }
]
```

---

### 4.2 Exemplo de código por camada

```js
// src/routes/todos.router.js
router.get("/", todosController.listar);
```

```js
// src/controllers/todos.controller.js
export async function listar(_req, res) {
    const todos = await todosService.listar();
    res.json(todos);
}
```

```js
// src/services/todos.service.js
export function listar() {
    return todosRepository.listar();
}
```

```js
// src/repositories/todos.repo.file.js
export async function listar() {
    return lerJSON(caminhoTodos, []);
}
```

Cada camada chama a próxima. Nenhuma precisa de conhecer detalhes que pertencem a outra.

---

### 4.3 Checkpoint

- Escreve o fluxo completo de `POST /api/v1/todos`.
- Em que camada validarias um `id` vindo da URL?
- Em que camada normalizarias um título com `trim()`?

<a id="sec-5"></a>

## 5. [EXTRA] Convenções de nomes

Boas convenções reduzem ruído:

- `todos.router.js` para rotas;
- `todos.controller.js` para controladores;
- `todos.service.js` para regras de negócio;
- `todos.repo.file.js` para repository em ficheiro;
- `todo.schemas.js` para schemas de validação;
- funções com verbos: `listar`, `obter`, `criar`, `atualizar`, `remover`.

Evita misturar português e inglês no mesmo conceito de domínio. Se o recurso se chama `todos`, mantém `todos` em todos os ficheiros.

<a id="exercicios"></a>

## Exercícios - Estrutura MVC leve

1. Cria a estrutura de pastas da secção 3.
2. Move a rota `GET /api/v1/todos` para `routes/todos.router.js`.
3. Cria `controllers/todos.controller.js` com a função `listar`.
4. Cria `services/todos.service.js` com a função `listar`.
5. Cria `repositories/todos.repo.file.js` com uma função `listar` que devolve uma lista em memória.
6. Liga o router no `app.js` com `app.use("/api/v1/todos", todosRouter)`.
7. Desenha o fluxo de `GET /api/v1/todos` no teu caderno ou README.
8. Identifica uma coisa que não deve ficar dentro do controller.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, fluxo por camadas, checkpoints e exercícios.
- 2025-11-10: criação do capítulo com estrutura MVC leve e checklist de responsabilidades.

![Footer](../Images/Footer.png)
