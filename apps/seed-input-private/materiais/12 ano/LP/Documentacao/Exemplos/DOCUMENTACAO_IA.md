![Header](../../Images/Header.png)

# Documentação para Agentes de IA

## Objetivo

- Definir contexto, regras e limites para uso de IA.
- Manter consistência entre frontend, backend e dados.

## Fonte de verdade

- API.md (contratos e endpoints)
- DADOS.md (modelos e validações)
- TESTES.md (testes críticos)

AI_CONTRACTS.md e AI_TESTING.md são resumos e devem ser atualizados quando a fonte muda.

## Ficheiros base

- AGENTS.md
- AI_CONTEXT.md
- AI_PROFILES.md
- AI_CONTRACTS.md
- AI_TESTING.md
- AI_LIMITS.md
- AI_CHANGELOG.md

## Contrato de erro

```json
{ "error": { "code": "SOME_CODE", "message": "Mensagem", "details": [] } }
```

## Testes e validação

- npm run test
- Validação manual listada em AI_TESTING.md

## Regra de pedidos

- Se faltar contexto, pedir esclarecimento.
- Declarar suposições quando não houver informação.
- Não inventar endpoints ou campos.

![Footer](../../Images/Footer.png)
