![Header](../Images/Header.png)

# Node.js (12.º Ano) - 11 · Testes com Supertest e Vitest

> **Objetivo deste ficheiro**
>
> - Perceber porque testar endpoints de uma API.
> - Usar Vitest para escrever testes.
> - Usar Supertest para chamar a app Express sem abrir uma porta real.
> - Testar sucesso, validação e rotas inexistentes.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Porque testar APIs](#sec-1)
- [2. [ESSENCIAL] Setup de Vitest e Supertest](#sec-2)
- [3. [ESSENCIAL] Primeiro teste: healthcheck](#sec-3)
- [4. [ESSENCIAL+] Testar criação e validação](#sec-4)
- [5. [EXTRA] Organização e dados de teste](#sec-5)
- [Exercícios - Testes com Supertest e Vitest](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo verifica automaticamente se a API continua a responder como esperado. Os testes tornam alterações futuras menos arriscadas.

- **Núcleo do tema:** as secções [ESSENCIAL] criam setup e primeiro teste.
- **Aprofundamento:** as secções [ESSENCIAL+] testam validação e criação.
- **Contexto adicional:** as secções [EXTRA] ajudam a lidar com dados de teste.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Porque testar APIs

### 1.1 Modelo mental

Um teste de API faz um pedido e verifica a resposta:

```text
teste
  ↓
Supertest chama app Express
  ↓
rota/controller/service
  ↓
resposta
  ↓
expect verifica status e body
```

Não é preciso abrir `localhost:3000`. O Supertest chama a aplicação Express diretamente.

---

### 1.2 O que um teste protege

Testes ajudam a confirmar:

- se uma rota ainda existe;
- se o status HTTP está correto;
- se o formato JSON não mudou sem querer;
- se validações continuam a funcionar;
- se refactors não partiram comportamento.

---

### 1.3 Erros comuns

- Testar apenas casos felizes.
- Depender de dados deixados por testes anteriores.
- Testar `server.js` em vez de `app.js` e ocupar portas reais.

### 1.4 Checkpoint

- Porque é que Supertest importa `app` e não `server`?
- Que partes de uma resposta podes verificar?
- Porque é importante testar também erros?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Setup de Vitest e Supertest

### 2.1 Instalar

```bash
npm i -D vitest supertest
```

São dependências de desenvolvimento porque não são necessárias para a API correr em produção.

---

### 2.2 Scripts

```json
{
    "scripts": {
        "test": "vitest --run",
        "test:watch": "vitest"
    }
}
```

`npm test` corre uma vez.

`npm run test:watch` fica à espera de alterações.

---

### 2.3 Estrutura

```text
tests/
  health.test.js
  todos.test.js
```

Os ficheiros de teste costumam terminar em `.test.js`.

---

### 2.4 Erros comuns

- Instalar `vitest` sem `-D`.
- Esquecer de exportar `app` em `src/app.js`.
- Chamar `app.listen` dentro dos testes.

### 2.5 Checkpoint

- Porque é que Vitest fica em `devDependencies`?
- Que comando corre os testes uma vez?
- Que nome de ficheiro permite ao Vitest encontrar testes?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Primeiro teste: healthcheck

### 3.1 Teste completo

```js
// tests/health.test.js
import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("health", () => {
    it("GET /api/health devolve ok", async () => {
        const res = await request(app).get("/api/health");

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            status: "ok",
        });
        expect(typeof res.body.ts).toBe("number");
    });
});
```

---

### 3.2 Ler o teste

```js
const res = await request(app).get("/api/health");
```

Esta linha faz um pedido `GET`.

```js
expect(res.status).toBe(200);
```

Esta linha confirma o status.

```js
expect(res.body).toMatchObject({ status: "ok" });
```

Esta linha confirma parte do JSON devolvido.

---

### 3.3 Erros comuns

- Esperar exatamente o objeto todo quando há campos dinâmicos como `ts`.
- Esquecer `await` no pedido.
- Testar uma rota diferente da que existe no `app.js`.

### 3.4 Checkpoint

- O que devolve `request(app).get(...)`?
- Porque usamos `toMatchObject` em vez de comparar o objeto inteiro?
- Que campo dinâmico aparece no healthcheck?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Testar criação e validação

### 4.1 Testar criação válida

```js
// tests/todos.test.js
import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("todos", () => {
    it("cria uma tarefa válida", async () => {
        const res = await request(app)
            .post("/api/v1/todos")
            .send({ titulo: "Estudar testes" });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            titulo: "Estudar testes",
            concluido: false,
        });
        expect(typeof res.body.id).toBe("string");
    });
});
```

---

### 4.2 Testar validação

```js
it("rejeita criação sem título", async () => {
    const res = await request(app).post("/api/v1/todos").send({});

    expect(res.status).toBe(422);
    expect(res.body.error).toMatchObject({
        code: "VALIDATION_ERROR",
    });
});
```

---

### 4.3 Testar rota inexistente

```js
it("devolve 404 para rota inexistente", async () => {
    const res = await request(app).get("/api/rota-que-nao-existe");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({
        code: "ROUTE_NOT_FOUND",
    });
});
```

---

### 4.4 Erros comuns

- Testar só `status` e não verificar o body.
- Usar o mesmo ficheiro JSON real de desenvolvimento e sujar dados.
- Escrever testes dependentes da ordem em que correm.

### 4.5 Checkpoint

- Que status esperas ao criar uma tarefa válida?
- Que status esperas quando falta `titulo`?
- Porque é importante testar uma rota inexistente?

<a id="sec-5"></a>

## 5. [EXTRA] Organização e dados de teste

### 5.1 Dados isolados

Quando usas ficheiros JSON, os testes podem alterar dados reais. Há várias estratégias:

- usar um ficheiro separado para testes;
- limpar o ficheiro antes de cada teste;
- injetar o caminho do ficheiro via configuração;
- trocar o repository por uma versão em memória durante testes.

Para projetos pequenos, um ficheiro de teste separado costuma chegar.

---

### 5.2 `beforeEach`

```js
import fs from "node:fs/promises";
import { beforeEach } from "vitest";

beforeEach(async () => {
    await fs.writeFile("src/data/todos.test.json", "[]", "utf8");
});
```

Esta ideia só funciona bem se o repository estiver configurado para usar `todos.test.json` quando `NODE_ENV=test`.

---

### 5.3 Checkpoint

- Porque é perigoso usar dados reais nos testes?
- Que estratégia escolherias para isolar dados num projeto pequeno?
- Para que serve `beforeEach`?

<a id="exercicios"></a>

## Exercícios - Testes com Supertest e Vitest

1. Instala `vitest` e `supertest` como dependências de desenvolvimento.
2. Cria os scripts `test` e `test:watch`.
3. Cria `tests/health.test.js`.
4. Testa `GET /api/health`.
5. Cria `tests/todos.test.js`.
6. Testa `POST /api/v1/todos` com body válido.
7. Testa `POST /api/v1/todos` sem `titulo`.
8. Testa uma rota inexistente.
9. Faz um erro de propósito: altera o status esperado e observa a falha do teste.
10. (EXTRA) Configura um ficheiro JSON separado para testes.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com objetivos, índice, testes de sucesso/erro, checkpoints e exercícios.
- 2025-11-10: criação do capítulo com Supertest, Vitest e exemplos iniciais.

![Footer](../Images/Footer.png)
