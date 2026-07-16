# Documentação privada de `real_dev`

## Objetivo

Este índice encaminha agentes e revisores para a documentação privada da implementação
de referência. `real_dev/` não é a raiz pública de entrega dos alunos.

## Leitura obrigatória por missão

| Missão | Documento | Obrigatoriedade |
| --- | --- | --- |
| UI observável em `real_dev/web` | [Guidelines de UI do frontend](FRONTEND-UI-GUIDELINES.md) | Leitura integral antes de planear, auditar ou implementar |
| Operação local endurecida | [Runbook local](ops/LOCAL-PAP-RUNBOOK.md) | Ler antes de alterar runtime, storage, seed, reset ou dependências locais |
| Deploy e rollback | [Deploy e rollback](ops/DEPLOY-ROLLBACK.md) | Ler antes de alterar gates ou procedimentos operacionais |
| Chat | [Relatório técnico dos chats](features/CHAT-IMPLEMENTATION-REPORT.md) | Referência do estado atual dos dois fluxos de chat |
| IA da sala e ano escolar | [Adaptação pedagógica da IA da sala](features/ROOM-AI-PEDAGOGICAL-ADAPTATION.md) | Referência funcional e de privacidade |
| Materiais Markdown | [Contrato funcional e técnico](features/MARKDOWN-MATERIALS.md) | Estados, APIs, segurança, IA, salas e operação |
| Arquitetura técnica | [Mapa técnico StudyFlow](technical/STUDYFLOW-TECHNICAL-MAP.md) | Artefacto gerado; não editar manualmente |
| Inventário de funções | [Inventário de funções](technical/STUDYFLOW-FUNCTION-INVENTORY.md) | Artefacto gerado; não editar manualmente |
| Paridade professor-aluno | [Relatório de implementação](../../docs/RELATORIO-IMPLEMENTACAO-PARIDADE-PROFESSOR-ALUNO-2026-07-11.md) | Contratos, migração, findings e evidência de validação |

## Regra específica de UI

Qualquer missão que altere apresentação, layout, componentes visuais, formulários,
navegação, estados visíveis, responsividade, acessibilidade ou interação em
`real_dev/web` deve cumprir `FRONTEND-UI-GUIDELINES.md` e terminar com:

```md
UI_GUIDELINES_READ: sim
UI_GUIDELINES_PATH: real_dev/docs/FRONTEND-UI-GUIDELINES.md
UI_COMPLIANCE: PASS | PASS_COM_DESVIOS | BLOQUEADO
UI_DEVIATIONS: nenhuma | descrição da regra afetada e justificação
UI_VALIDATION: testes, build, browser, viewports e acessibilidade executados
```

Esta obrigação não se aplica a `apps/web`. O guia privado não deve ser referenciado em
documentação pública destinada aos alunos.
