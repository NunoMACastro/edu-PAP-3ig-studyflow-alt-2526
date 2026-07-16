![Header](../../Images/Header.png)

# Documentação de Dados

## Entidades

### Tarefa

```json
{ "_id": "...", "titulo": "Estudar", "feito": false, "createdAt": "...", "updatedAt": "...", "userId": "..." }
```

| Campo | Tipo | Obrigatório | Default | Validação | Exemplo |
| --- | --- | --- | --- | --- | --- |
| _id | ObjectId | sim | - | gerado | "..." |
| titulo | string | sim | - | min 3, max 100 | "Estudar" |
| feito | boolean | não | false | - | false |
| userId | ObjectId | opcional* | - | válido | "..." |
| createdAt | date | sim* | - | timestamp | "2026-01-14" |
| updatedAt | date | sim* | - | timestamp | "2026-01-14" |

*Obrigatório se o recurso for por utilizador.

### Utilizador (mínimo)

```json
{ "_id": "...", "nome": "Ana", "email": "ana@escola.pt", "passwordHash": "...", "createdAt": "...", "updatedAt": "..." }
```

| Campo | Tipo | Obrigatório | Default | Validação | Exemplo |
| --- | --- | --- | --- | --- | --- |
| nome | string | sim | - | min 2 | "Ana" |
| email | string | sim | - | formato válido, unique | "ana@escola.pt" |
| passwordHash | string | sim | - | min 60 | "..." |
| createdAt | date | sim | - | timestamp | "2026-01-14" |
| updatedAt | date | sim | - | timestamp | "2026-01-14" |

## Relações

- Tarefa pertence a Utilizador (userId).

## Índices e constraints

- email: unique
- createdAt: index

## Impacto na API

- Campos `unique` geram `409 DUPLICATE_KEY`.
- Falhas de validação geram `422 VALIDATION_ERROR`.

## Notas

- Se mudares campos, atualiza `API.md` e `TESTES.md`.

![Footer](../../Images/Footer.png)
