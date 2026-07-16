![Header](../Images/Header.png)

# Node.js (12.º Ano) - 00B · Setup de projeto

> **Objetivo deste ficheiro**
>
> - Criar uma estrutura inicial para uma API Node.js moderna.
> - Configurar `package.json`, scripts, `.gitignore` e pastas base.
> - Usar ES Modules por defeito.
> - Distinguir dependências de produção, dependências de desenvolvimento e dependências opcionais.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Criar o projeto](#sec-1)
- [2. [ESSENCIAL] Scripts, `.gitignore` e `.env`](#sec-2)
- [3. [ESSENCIAL] Estrutura base de pastas](#sec-3)
- [4. [ESSENCIAL+] Dependências: o que entra e porquê](#sec-4)
- [5. [EXTRA] Hábitos de arranque de projeto](#sec-5)
- [Exercícios - Setup de projeto](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo prepara o projeto que será usado nos capítulos seguintes. A ideia é começar simples, mas já com uma estrutura que aguenta crescimento.

- **Núcleo do tema:** as secções [ESSENCIAL] criam o projeto mínimo para trabalhar com Node.js e Express.
- **Aprofundamento:** as secções [ESSENCIAL+] explicam as decisões de dependências.
- **Contexto adicional:** as secções [EXTRA] reúnem hábitos que evitam problemas recorrentes.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Criar o projeto

### 1.1 Comandos iniciais

Numa pasta de trabalho, cria o projeto:

```bash
mkdir api-aula
cd api-aula
npm init -y
npm pkg set type=module
```

O comando `npm init -y` cria o `package.json`.

O comando `npm pkg set type=module` ativa ES Modules em ficheiros `.js`, permitindo usar:

```js
import express from "express";
export const appName = "API Aula";
```

Em vez de CommonJS:

```js
const express = require("express");
module.exports = {};
```

Neste percurso usamos ES Modules.

---

### 1.2 Instalar a base da API

```bash
npm i express cors helmet morgan compression
```

Estas dependências são usadas em produção:

| Pacote | Papel |
| --- | --- |
| `express` | Criar rotas, middlewares e respostas HTTP |
| `cors` | Controlar que origens podem chamar a API |
| `helmet` | Adicionar headers de segurança |
| `morgan` | Registar pedidos HTTP durante o desenvolvimento |
| `compression` | Comprimir respostas HTTP |

---

### 1.3 Dependências de desenvolvimento

```bash
npm i -D vitest supertest eslint prettier
```

Estas dependências ajudam durante o desenvolvimento:

| Pacote | Papel |
| --- | --- |
| `vitest` | Executar testes |
| `supertest` | Testar endpoints Express sem abrir uma porta real |
| `eslint` | Detetar problemas de código |
| `prettier` | Formatar o código de forma consistente |

Se ainda não vais escrever testes neste momento, podes instalar `vitest` e `supertest` apenas no capítulo 11.

---

### 1.4 Erros comuns

- Esquecer `"type": "module"` e depois receber `Cannot use import statement outside a module`.
- Instalar ferramentas de desenvolvimento sem `-D`.
- Criar o projeto dentro de outra pasta errada e depois não encontrar o `package.json`.

### 1.5 Checkpoint

- Para que serve o `package.json`?
- O que muda quando defines `"type": "module"`?
- Qual é a diferença entre `dependencies` e `devDependencies`?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Scripts, `.gitignore` e `.env`

### 2.1 Scripts úteis

Atualiza o `package.json`:

```json
{
    "name": "api-aula",
    "type": "module",
    "scripts": {
        "dev": "node --env-file=.env --watch src/server.js",
        "start": "node src/server.js",
        "test": "vitest --run",
        "test:watch": "vitest",
        "lint": "eslint .",
        "format": "prettier -w ."
    }
}
```

O script `dev` usa duas funcionalidades úteis do Node.js moderno:

- `--env-file=.env` carrega variáveis de ambiente a partir do ficheiro `.env`;
- `--watch` reinicia o processo quando guardas alterações.

Se a tua versão de Node.js não suportar uma destas opções, podes usar `nodemon` como alternativa:

```bash
npm i -D nodemon
```

```json
{
    "scripts": {
        "dev": "nodemon --watch src --ext js --exec \"node --env-file=.env src/server.js\""
    }
}
```

---

### 2.2 `.gitignore`

Cria `.gitignore`:

```gitignore
node_modules
.env
coverage
dist
```

O ficheiro `.env` não deve ir para Git, porque pode conter segredos, URLs internas ou chaves de API.

---

### 2.3 `.env` e `.env.example`

Cria `.env` local:

```env
PORT=3000
HOST=127.0.0.1
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=false
LOG_LEVEL=debug
```

Cria também `.env.example`:

```env
PORT=3000
HOST=127.0.0.1
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=false
LOG_LEVEL=debug
```

O `.env.example` pode ir para Git porque não contém segredos reais. Serve como lista das variáveis necessárias.

---

### 2.4 Erros comuns

- Versionar `.env` por engano.
- Escrever `PORT="3000"` e esquecer que `process.env.PORT` continua a ser string.
- Alterar `.env` e esquecer de reiniciar o servidor quando o processo não está em modo watch.

### 2.5 Checkpoint

- Porque é que `.env` deve ficar fora do Git?
- Para que serve `.env.example`?
- O que faz o script `npm run dev`?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Estrutura base de pastas

### 3.1 Estrutura recomendada

```text
src/
  app.js
  server.js
  routes/
  controllers/
  services/
  repositories/
  middlewares/
  schemas/
  utils/
  data/
  public/
tests/
```

Responsabilidades:

| Pasta/Ficheiro | Responsabilidade |
| --- | --- |
| `src/app.js` | Criar e configurar a aplicação Express |
| `src/server.js` | Arrancar o servidor com `listen` |
| `routes/` | Ligar URLs a controladores |
| `controllers/` | Ler `req`, chamar serviços e responder |
| `services/` | Guardar regras de negócio |
| `repositories/` | Ler e escrever dados |
| `middlewares/` | Funções Express reutilizáveis |
| `schemas/` | Validação e contratos de dados |
| `utils/` | Funções auxiliares pequenas |
| `data/` | Ficheiros JSON usados nos exemplos |
| `public/` | CSS, imagens e ficheiros estáticos |
| `tests/` | Testes automáticos |

---

### 3.2 Criar pastas

```bash
mkdir -p src/routes src/controllers src/services src/repositories
mkdir -p src/middlewares src/schemas src/utils src/data src/public tests
```

Cria também os primeiros ficheiros:

```bash
touch src/app.js src/server.js
```

---

### 3.3 Porque separar `app.js` e `server.js`

`app.js` configura o Express.

`server.js` abre a porta.

Esta separação facilita testes:

```js
import request from "supertest";
import { app } from "../src/app.js";

const res = await request(app).get("/api/health");
```

O teste consegue chamar a app sem ocupar uma porta como `3000`.

---

### 3.4 Erros comuns

- Colocar tudo em `server.js` e dificultar testes.
- Misturar acesso a ficheiros diretamente dentro da rota.
- Criar pastas antes de saber a responsabilidade de cada uma.

### 3.5 Checkpoint

- Qual é a responsabilidade de `app.js`?
- Qual é a responsabilidade de `server.js`?
- Onde colocarias uma função que lê `todos.json`?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Dependências: o que entra e porquê

### 4.1 Dependências opcionais neste percurso

Algumas bibliotecas aparecem apenas quando o capítulo precisa delas:

| Capítulo | Dependência | Justificação |
| --- | --- | --- |
| 06 | `zod` | Validar bodies, params e query strings com schemas |
| 09 | `express-rate-limit` | Reduzir abuso de pedidos repetidos |
| 11 | `vitest`, `supertest` | Testar endpoints Express |
| 12 | `ejs` | Gerar HTML no servidor |

Não é necessário instalar tudo no primeiro minuto. Instala quando o projeto chega ao problema que a dependência resolve.

---

### 4.2 Regra prática

Antes de instalar uma dependência, pergunta:

- O Node.js ou o Express já resolvem isto bem?
- A dependência reduz código repetido ou aumenta segurança?
- A dependência é conhecida, mantida e adequada ao problema?
- O custo de a aprender compensa neste projeto?

---

### 4.3 Checkpoint

- Porque é que `zod` não precisa de ser instalado se fizeres validação manual?
- Porque é que `express-rate-limit` faz sentido numa API pública?
- Que dependências são necessárias para testar endpoints?

<a id="sec-5"></a>

## 5. [EXTRA] Hábitos de arranque de projeto

- Faz mudanças pequenas e corre o projeto com frequência.
- Mantém os scripts do `package.json` simples.
- Não comites `node_modules`.
- Guarda segredos apenas em variáveis de ambiente.
- Usa nomes de pastas em inglês técnico quando representam padrões comuns: `routes`, `controllers`, `services`.
- Prefere `async/await` quando trabalhas com Promises.

<a id="exercicios"></a>

## Exercícios - Setup de projeto

1. Cria um projeto `api-aula` com `npm init -y`.
2. Ativa ES Modules com `npm pkg set type=module`.
3. Instala `express`, `cors`, `helmet`, `morgan` e `compression`.
4. Cria os scripts `dev`, `start`, `test`, `lint` e `format`.
5. Cria `.gitignore` e confirma que inclui `.env` e `node_modules`.
6. Cria `.env` e `.env.example`.
7. Cria a estrutura de pastas dentro de `src/`.
8. Explica por escrito porque `app.js` e `server.js` ficam separados.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, enquadramento, progressão, checkpoints e exercícios.
- 2025-11-10: criação do setup inicial com dependências, scripts e estrutura base.

![Footer](../Images/Footer.png)
