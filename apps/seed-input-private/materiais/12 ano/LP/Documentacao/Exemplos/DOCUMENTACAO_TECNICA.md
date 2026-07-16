![Header](../../Images/Header.png)

# Documentação Técnica

## Objetivo

- Descrever arquitetura, camadas e responsabilidades.
- Registar fluxos críticos e decisões técnicas.

## Arquitetura

```text
Request -> Route -> Controller -> Service -> Repository/DB -> Response
```

### Regra base (quem chama quem)

Controller → Service → Repository/DB. O controller não fala diretamente com a BD.

## Estrutura de pastas

```text
src/
  routes/
  controllers/
  services/
  repositories/
  models/
  middlewares/
  utils/
```

## Fluxos críticos (exemplo mínimo)

### Criar tarefa

1. POST /api/tarefas
2. Controller valida input
3. Service aplica regras
4. Repository grava na BD

Sucesso (201):
```json
{ "_id": "...", "titulo": "Estudar", "feito": false, "createdAt": "...", "updatedAt": "..." }
```

Erro (422):
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Título obrigatório", "details": ["titulo"] } }
```

### Paginação

1. GET /api/tarefas?page=1&limit=20
2. Response com { items, page, limit, total }

## Integrações externas

- [SERVICO_EXTERNO_1]
- [SERVICO_EXTERNO_2]

## Decisões técnicas (ADR)

```text
Título: [DECISAO]
Contexto: [CONTEXTO]
Decisão: [DECISAO_TOMADA]
Consequências: [IMPACTO]
```

![Footer](../../Images/Footer.png)
