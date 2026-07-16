![Header](../../Images/Header.png)

# AI_CONTRACTS.md

Fonte: API.md

Contrato de erro (padrão):
{ "error": { "code": "SOME_CODE", "message": "Mensagem", "details": [] } }

Regras:
- Listas devolvem envelope { items, page, limit, total }
- Create/detail devolvem objeto
- DELETE devolve 204
- PATCH devolve objeto atualizado

Exemplo (lista):
```json
{
  "items": [ { "_id": "...", "titulo": "Estudar", "feito": false } ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

Exemplo (erro):
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Título obrigatório", "details": ["titulo"] } }
```

![Footer](../../Images/Footer.png)
