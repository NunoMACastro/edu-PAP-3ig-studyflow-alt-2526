![Header](../../Images/Header.png)

# Documentação de Testes

## Tipos de testes (curto)

- Unitários: validam funções isoladas.
- Integração: validam rotas + BD (padrão do kit).

## Comandos

```bash
npm run test
npm run test:watch
npm run test -- --coverage
```

> Confirma os scripts no `package.json`.

## Requisitos

- `.env.test` configurado
- Base de dados de teste: [NOME_DB_TESTE]
- Seed opcional: [SCRIPT_SEED]

## Testes críticos (mínimo)

- GET /api/tarefas devolve 200 e envelope correto
- POST /api/tarefas inválido -> 422 + contrato de erro
- GET /api/tarefas/:id inválido -> 400 INVALID_ID
- GET /api/tarefas/:id inexistente -> 404 NOT_FOUND
- DELETE /api/tarefas/:id -> 204

## Critério de aceitação

- Todos passam localmente com BD de teste isolada.
- O GET de lista devolve `items`, `page`, `limit`, `total`.

## Output esperado

```text
 PASS  tests/tarefas.test.js
  ✓ GET /api/tarefas devolve 200
  ✓ POST /api/tarefas devolve 201
```

## Validação manual

- GET /api/tarefas devolve { items, page, limit, total }
- POST /api/tarefas sem título -> 422
- Frontend mostra erro

![Footer](../../Images/Footer.png)
