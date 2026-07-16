![Header](../../Images/Header.png)

# Documentação da API

## Base URL

- Dev: [BASE_URL_DEV]
- Prod: [BASE_URL_PROD]

## Autenticação

- Método preferido: cookie httpOnly com JWT.
- Alternativa: Bearer token.

**JWT (header):** `Authorization: Bearer <token>`
**Cookies:** `credentials: include`

## Contrato de erro

```json
{ "error": { "code": "SOME_CODE", "message": "Mensagem", "details": [] } }
```

## Regras padrão

- Listas devolvem envelope `{ items, page, limit, total }`.
- DELETE devolve `204` (sem body).
- PATCH devolve objeto atualizado.
- Timestamps: `createdAt` e `updatedAt`.

## Regras de erro por ID

- ID malformado: `400 INVALID_ID`.
- ID válido mas inexistente: `404 NOT_FOUND`.

## Convenção de auth por recurso

- Se o recurso for por utilizador, então `/api/*` exige auth.
- Se o recurso for público, marcar `Autenticação: Não` e tornar `userId` opcional no modelo.

## Query params padrão

| Param | Tipo | Default | Descrição |
| --- | --- | --- | --- |
| page | number | 1 | Página (>= 1) |
| limit | number | 20 | Itens por página (1..100) |
| q | string | - | Pesquisa por título |
| feito | boolean | - | Filtrar por estado |
| sort | string | createdAt | Campo de ordenação |
| order | string | desc | asc/desc |

## Template por endpoint (preencher)

**Método + path:** [GET/POST/PATCH/DELETE] `/api/[recurso]`

**Autenticação:** [Sim/Não] ([Cookie/Bearer])

**Query params:** [TABELA OU LISTA]

**Body (schema mínimo):**
```json
{ "campo": "valor" }
```

**Resposta (sucesso):**
```json
{ "exemplo": "..." }
```

**Erros possíveis:**
- 400 INVALID_ID
- 401 NOT_AUTHENTICATED
- 403 FORBIDDEN
- 404 NOT_FOUND
- 409 DUPLICATE_KEY
- 422 VALIDATION_ERROR

**Exemplo curl:**
```bash
curl -X [METHOD] [URL]
```

## Exemplo mínimo (lista)

```text
GET /api/tarefas
200 OK
{
  "items": [ { "_id": "...", "titulo": "Estudar", "feito": false } ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

Nota: a resposta usa sempre envelope, mesmo sem query params.

## Exemplo mínimo (criar)

```text
POST /api/tarefas
Body: { "titulo": "Rever React" }

201 Created
{ "_id": "...", "titulo": "Rever React", "feito": false, "createdAt": "...", "updatedAt": "..." }
```

## PATCH /api/tarefas/:id (body permitido)

- titulo (string não vazia)
- feito (boolean)

## Status codes

- 200 OK
- 201 Created
- 204 No Content
- 400 INVALID_ID
- 401 NOT_AUTHENTICATED
- 403 FORBIDDEN
- 404 NOT_FOUND
- 409 DUPLICATE_KEY
- 422 VALIDATION_ERROR
- 500 INTERNAL_ERROR

![Footer](../../Images/Footer.png)
