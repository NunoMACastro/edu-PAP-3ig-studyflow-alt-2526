![Header](../Images/Header.png)

# MongoDB (12.º Ano) - 08 · Validação e erros

> **Objetivo deste ficheiro**
>
> - Validar input antes de chegar à base de dados.
> - Distinguir `INVALID_ID`, `NOT_FOUND`, `VALIDATION_ERROR` e `DUPLICATE_KEY`.
> - Mapear erros do MongoDB e do Mongoose para respostas HTTP consistentes.
> - Fechar o módulo com uma checklist de robustez para APIs com MongoDB.

---

## Índice

- [0. Enquadramento do material](#sec-0)
- [1. [ESSENCIAL] Validação antes da base de dados](#sec-1)
- [2. [ESSENCIAL] Regra de IDs: `400` vs `404`](#sec-2)
- [3. [ESSENCIAL] Erros frequentes no MongoDB e Mongoose](#sec-3)
- [4. [ESSENCIAL+] Middleware de erro consistente](#sec-4)
- [5. [EXTRA] Checklist de robustez](#sec-5)
- [Exercícios - Validação e erros](#exercicios)
- [Changelog](#changelog)

---

<a id="sec-0"></a>

## 0. Enquadramento do material

Este capítulo fecha o percurso técnico de MongoDB. Uma API não fica completa só porque consegue gravar dados: também precisa de validar entradas, distinguir causas de erro e responder num formato previsível.

- **Núcleo do tema:** as secções [ESSENCIAL] cobrem validação, IDs e erros frequentes.
- **Aprofundamento:** as secções [ESSENCIAL+] integram estes erros no middleware global.
- **Contexto adicional:** as secções [EXTRA] funcionam como revisão final de robustez.

<a id="sec-1"></a>

## 1. [ESSENCIAL] Validação antes da base de dados

### 1.1 Modelo mental

Validação deve acontecer antes de tentares gravar dados.

```text
request body
  ↓
validação
  ↓
service
  ↓
repository
  ↓
MongoDB
```

MongoDB e Mongoose podem rejeitar dados inválidos, mas a API deve conseguir responder com mensagens claras e controladas.

---

### 1.2 Validação manual para criar tarefa

```js
export function validateCreateTarefa(body) {
    const details = [];

    if (typeof body?.titulo !== "string" || body.titulo.trim().length < 3) {
        details.push({
            field: "titulo",
            message: "Título deve ter pelo menos 3 caracteres",
        });
    }

    if (
        body?.prioridade !== undefined &&
        !["baixa", "normal", "alta"].includes(body.prioridade)
    ) {
        details.push({
            field: "prioridade",
            message: "Prioridade inválida",
        });
    }

    if (body?.feito !== undefined && typeof body.feito !== "boolean") {
        details.push({
            field: "feito",
            message: "Feito deve ser boolean",
        });
    }

    return details;
}
```

Uso:

```js
const details = validateCreateTarefa(req.body);

if (details.length > 0) {
    return res.status(422).json({
        error: {
            code: "VALIDATION_ERROR",
            message: "Dados inválidos",
            details,
        },
    });
}
```

---

### 1.3 Validação de campos permitidos no `PATCH`

```js
const allowed = ["titulo", "feito", "prioridade"];
const received = Object.keys(req.body);
const unknown = received.filter((field) => !allowed.includes(field));

if (unknown.length > 0) {
    return res.status(422).json({
        error: {
            code: "VALIDATION_ERROR",
            message: "Campos não permitidos",
            details: unknown.map((field) => ({
                field,
                message: "Campo não pode ser atualizado",
            })),
        },
    });
}
```

Isto evita updates acidentais em `_id`, `createdAt`, `deletedAt` ou campos internos.

---

### 1.4 Erros comuns

- Confiar apenas na validação do frontend.
- Deixar o MongoDB receber qualquer body.
- Permitir campos inesperados no `PATCH`.

### 1.5 Checkpoint

- Porque é que o backend valida mesmo quando o frontend já validou?
- Que status usamos para validação semântica inválida?
- Porque é importante validar campos permitidos no `PATCH`?

<a id="sec-2"></a>

## 2. [ESSENCIAL] Regra de IDs: `400` vs `404`

### 2.1 A regra

Usa esta distinção:

- ID malformado: `400 INVALID_ID`;
- ID válido, mas sem documento correspondente: `404 NOT_FOUND`.

Exemplos:

```text
/api/v1/tarefas/abc
  -> 400 INVALID_ID

/api/v1/tarefas/665f1f7a0c4b5a7e4f123456
  -> 404 NOT_FOUND se não existir
```

---

### 2.2 Com Node driver

```js
import { ObjectId } from "mongodb";

export function parseObjectId(id) {
    if (!/^[a-f\d]{24}$/i.test(id)) {
        return null;
    }

    return new ObjectId(id);
}
```

---

### 2.3 Com Mongoose

```js
import mongoose from "mongoose";

if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
        error: {
            code: "INVALID_ID",
            message: "ID inválido",
            details: [],
        },
    });
}
```

---

### 2.4 Erros comuns

- Devolver `404` para qualquer ID inválido.
- Deixar `new ObjectId(id)` lançar erro inesperado.
- Tratar ID válido mas inexistente como erro interno.

### 2.5 Checkpoint

- Quando devolves `INVALID_ID`?
- Quando devolves `NOT_FOUND`?
- Porque é que estas duas situações não são iguais?

<a id="sec-3"></a>

## 3. [ESSENCIAL] Erros frequentes no MongoDB e Mongoose

### 3.1 Duplicado

Erro típico:

```text
E11000 duplicate key error
```

Mapeamento:

```text
409 DUPLICATE_KEY
```

Acontece quando um índice `unique` é violado.

---

### 3.2 ValidationError do Mongoose

Mongoose pode lançar:

```text
ValidationError
```

Mapeamento:

```text
422 VALIDATION_ERROR
```

---

### 3.3 CastError do Mongoose

Quando Mongoose tenta converter um ID inválido:

```text
CastError
```

Mapeamento:

```text
400 INVALID_ID
```

Mesmo assim, é melhor validar IDs antes de chegar ao model.

---

### 3.4 Função de mapeamento

```js
export function mapDbError(err) {
    if (err?.code === 11000) {
        return {
            status: 409,
            code: "DUPLICATE_KEY",
            message: "Valor já existente",
            details: [],
        };
    }

    if (err?.name === "ValidationError") {
        return {
            status: 422,
            code: "VALIDATION_ERROR",
            message: "Dados inválidos",
            details: Object.values(err.errors || {}).map((error) => ({
                field: error.path,
                message: error.message,
            })),
        };
    }

    if (err?.name === "CastError") {
        return {
            status: 400,
            code: "INVALID_ID",
            message: "ID inválido",
            details: [],
        };
    }

    return {
        status: 500,
        code: "INTERNAL_ERROR",
        message: "Erro interno",
        details: [],
    };
}
```

---

### 3.5 Checkpoint

- Que erro aparece quando violas um índice único?
- Que status usamos para duplicados?
- Que erro do Mongoose indica validação do schema?

<a id="sec-4"></a>

## 4. [ESSENCIAL+] Middleware de erro consistente

### 4.1 Formato de erro

Todas as respostas de erro devem seguir:

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Dados inválidos",
        "details": []
    }
}
```

Isto ajuda React a tratar erros de forma previsível.

---

### 4.2 Middleware

```js
// src/middlewares/errorHandler.js
import { mapDbError } from "../utils/mapDbError.js";

export function errorHandler(err, _req, res, _next) {
    const mapped = err.statusCode
        ? {
              status: err.statusCode,
              code: err.code || "HTTP_ERROR",
              message: err.message,
              details: err.details || [],
          }
        : mapDbError(err);

    const isProduction = process.env.NODE_ENV === "production";

    const payload = {
        error: {
            code: mapped.code,
            message:
                mapped.status >= 500 && isProduction
                    ? "Erro interno"
                    : mapped.message,
            details: mapped.details,
        },
    };

    if (!isProduction && err.stack) {
        payload.error.stack = err.stack;
    }

    res.status(mapped.status).json(payload);
}
```

---

### 4.3 `HttpError`

```js
export class HttpError extends Error {
    constructor(message, statusCode = 500, options = {}) {
        super(message);
        this.statusCode = statusCode;
        this.code = options.code || "HTTP_ERROR";
        this.details = options.details || [];
    }
}
```

Uso:

```js
throw new HttpError("Tarefa não encontrada", 404, {
    code: "NOT_FOUND",
});
```

---

### 4.4 Erros comuns

- Devolver formatos diferentes em cada controller.
- Mostrar stack trace em produção.
- Transformar erro de validação em `500`.

### 4.5 Checkpoint

- Que formato de erro deve ser sempre usado?
- Porque escondemos stack trace em produção?
- Qual é a vantagem de `HttpError`?

<a id="sec-5"></a>

## 5. [EXTRA] Checklist de robustez

Antes de considerar a API pronta, confirma:

- `.env` está fora do Git.
- `MONGODB_URI` não aparece no frontend.
- IDs inválidos devolvem `400 INVALID_ID`.
- IDs válidos inexistentes devolvem `404 NOT_FOUND`.
- Validação devolve `422 VALIDATION_ERROR`.
- Duplicados devolvem `409 DUPLICATE_KEY`.
- `PATCH` aceita apenas campos permitidos.
- Listagens usam paginação.
- Queries frequentes têm índices adequados.
- Erros internos não expõem detalhes em produção.
- Dados sensíveis não são devolvidos por engano em listagens ou detalhes.
- Filtros aceites pela API estão numa lista explícita.

### 5.1 Testes de integração com MongoDB

Testar uma API com MongoDB significa controlar bem os dados usados no teste.

Modelo mental:

```text
preparar base de dados de teste
  ↓
inserir dados previsíveis
  ↓
chamar endpoint
  ↓
validar resposta
  ↓
limpar coleção
```

Boas regras:

- usa uma base de dados de teste, nunca a de desenvolvimento principal;
- limpa as coleções antes ou depois de cada teste;
- cria poucos documentos, mas com valores pensados para o caso que queres testar;
- testa sucesso e erro: criação válida, validação inválida, duplicado e ID inexistente.

Não precisas de uma dependência nova para perceber este modelo. O essencial é que cada teste comece num estado conhecido e não dependa da ordem de execução dos testes anteriores.

<a id="exercicios"></a>

## Exercícios - Validação e erros

1. Cria `validateCreateTarefa`.
2. Testa `POST` com `titulo` vazio e confirma `422 VALIDATION_ERROR`.
3. Cria validação de campos permitidos no `PATCH`.
4. Testa `PATCH` com campo `_id` e confirma erro de validação.
5. Cria `parseObjectId`.
6. Testa `GET /api/v1/tarefas/abc` e confirma `400 INVALID_ID`.
7. Testa um ObjectId válido mas inexistente e confirma `404 NOT_FOUND`.
8. Cria índice único em `categorias.nome`.
9. Insere duas categorias com o mesmo nome e confirma `409 DUPLICATE_KEY`.
10. Confirma que o formato `{ error: { code, message, details } }` é sempre respeitado.
11. Escreve um plano de teste de integração para `GET /api/v1/tarefas` com base de dados de teste.
12. Explica por que motivo cada teste deve limpar ou recriar os dados de que precisa.

<a id="changelog"></a>

## Changelog

- 2026-05-30: reestruturação do capítulo com validação, códigos de erro, middleware consistente, testes de integração, checkpoints e exercícios.
- 2026-04-17: capítulo criado com validação, mapeamento de erros e contrato de erro.

![Footer](../Images/Footer.png)
