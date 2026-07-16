![Header](../../Images/Header.png)

# AI_TESTING.md

Fonte: TESTES.md

Testes críticos (mínimo):
- GET /api/tarefas devolve envelope correto
- POST /api/tarefas inválido -> 422
- GET /api/tarefas/:id inválido -> 400
- GET /api/tarefas/:id inexistente -> 404
- DELETE /api/tarefas/:id -> 204

Validação manual:
- GET /api/tarefas devolve { items, page, limit, total }
- POST /api/tarefas sem título -> 422
- Status codes corretos + erro no formato padrão

![Footer](../../Images/Footer.png)
