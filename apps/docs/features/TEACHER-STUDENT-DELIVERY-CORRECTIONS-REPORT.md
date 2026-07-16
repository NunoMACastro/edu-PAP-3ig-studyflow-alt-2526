# Correções de paridade professor → aluno

## Resultado

Implementação concluída de forma aditiva e retrocompatível. A entrega docente passa a ter destinos explícitos e estados coerentes no lado do aluno, mantendo os endpoints legacy, a experiência de staff, a governação da IA e os dados existentes.

Não foram adicionadas dependências e não foi executada qualquer migração destrutiva ou aplicação sobre uma base real.

## Alterações implementadas

### Identidade dos contextos colaborativos

- `StudyRoom` recebeu `collaborationKind`, `collaborationKindSource` e `collaborationMigrationRunId` opcionais.
- Novos grupos persistem `STUDY_GROUP`; novas salas persistem `STUDY_ROOM`.
- Listagens, membership e adaptadores do Assistente revalidam o tipo esperado.
- Um endpoint de grupo já não aceita uma sala, nem o inverso.
- O seletor do Assistente deixou de projetar a mesma entidade como grupo e sala.
- A leitura pré-migração mantém um fallback compatível no backend; a UI já não classifica entidades por `disciplineName`.
- Conversas legacy cujo adaptador deixe de corresponder perdem autorização de escrita e permanecem consultáveis segundo a política existente de acesso revogado.

### Migração colaborativa

Foram adicionados:

```text
npm run migrate:collaboration-kinds:dry-run
npm run migrate:collaboration-kinds
npm run migrate:collaboration-kinds:rollback -- <runId>
```

O runner:

- é dry-run por defeito;
- aplica a ordem de evidência definida no plano;
- assinala ambiguidades sem ler perguntas, mensagens ou outros conteúdos livres;
- escreve em batches de 500;
- é retomável e idempotente;
- reverte apenas documentos `LEGACY_INFERRED` associados ao `runId` indicado;
- não move nem apaga mensagens, sessões, partilhas, respostas ou conversas.

Validação numa base Mongo isolada:

| Operação | Resultado |
|---|---:|
| Dry-run | 2 entidades previstas |
| Apply | 1 grupo + 1 sala |
| Segundo apply | 0 entidades novas |
| Rollback do runId | 2 entidades revertidas |
| Ambiguidades da fixture | 0 |

O dry-run e apply sobre dados reais não foram executados nesta implementação. Devem ser feitos apenas durante rollout, depois de snapshot e revisão humana das ambiguidades.

### Projetos

- Foi criado `StudentClassProjectState` com progresso privado `NOT_STARTED`, `IN_PROGRESS` ou `COMPLETED` e índice único por aluno/projeto.
- Ausência de documento continua a significar `NOT_STARTED`.
- A listagem do aluno inclui `myProgress`, `completedAt` e `readOnly`.
- Foram adicionados detalhe seguro e atualização do progresso.
- O aluno pode iniciar, concluir e reabrir o projeto; não foram introduzidas entregas, avaliação ou feedback.
- Projetos concluídos deixam de aparecer em Hoje.
- O plano IA carrega agora título, enunciado, prazo e breadcrumb do projeto e respeita arquivo read-only.

### Chat da disciplina

- Foi criado `StudentSubjectChatReadState`, com índice único por aluno/disciplina.
- Foram adicionados o endpoint bulk de não lidas e o endpoint idempotente de marcação de leitura.
- Só mensagens docentes posteriores ao cursor contam como não lidas.
- A UI carrega primeiro o histórico REST; só tenta o WebSocket quando a disciplina aceita escrita.
- Chat arquivado apresenta histórico e remove o composer sem mostrar um erro de ligação.
- Os contadores aparecem na tab, na visão geral e em Hoje, desaparecendo depois da leitura.
- Não foram criadas notificações por mensagem.

### Conteúdos aprovados e Praticar

- `AiContentReview` recebeu origem aditiva `TEACHER_AUTHORED`; documentos legacy são projetados com essa origem.
- A UI docente passou de “Revisões IA” para “Conteúdos aprovados”/“Conteúdo docente”, sem alterar os aliases e endpoints internos existentes.
- Foi criada a landing canónica `/app/disciplinas/:subjectId/praticar`, separando mini-testes oficiais de conteúdos docentes.
- Foi criada `/conteudos-aprovados`; `/conteudos-ia` continua válido através de redirect.
- O aluno vê “Criado e aprovado pelo professor”. Comentários internos continuam privados.
- Resumos arquivados são consultáveis; quizzes e tentativas históricas permanecem visíveis sem permitir nova submissão.

### Turmas, salas guiadas e Em grupo

- Estudar permite alternar entre turmas Ativas e Arquivo através do URL.
- A notificação de arquivo abre diretamente a vista de arquivo.
- As vistas `professor`, `grupos` e `salas` em Em grupo são reais e usam a identidade persistida.
- “Com o professor” usa a listagem completa existente, incluindo Abertas/Histórico e paginação.
- O detalhe de sala guiada devolve `assistantAvailability` com uma razão segura.
- A CTA do Assistente só aparece quando sala, política local e fontes permitem uma pergunta.

### Materiais e versões

- Foi adicionado `OFFICIAL_MATERIAL_UPDATED`.
- Criar/restaurar uma versão oficial atualiza texto, estado, versão ativa, revisão e metadata pública na mesma transação.
- A notificação é criada através da outbox idempotente com contexto `LEARNING_CONTENT` e destino construído no backend.
- O aluno recebe apenas número da revisão, data e resumo escrito pelo professor.
- O detalhe ganhou breadcrumb, regresso, “Atualizado em…” e resumo de alteração.
- A área de Materiais liga ao contrato autorizado “Fontes utilizadas pela IA”.
- Chunks, jobs, snapshots e mecanismos de restauro não são expostos.

### Voz docente

- Turnos normalizados do Assistente em disciplina e sala guiada passam a incluir apenas `teacherVoiceApplied`.
- A UI apresenta “Resposta orientada pelo professor”.
- Tom, detalhe, regras, identidade docente e prompt continuam privados.
- A indicação deriva do `voiceSource` persistido, pelo que alterações futuras não reescrevem respostas históricas.

### Notificações manuais

- `TASK` e `FOLLOW_UP` aceitam apenas `TODAY`, `CLASS_SUBJECTS`, `CLASS_POSTS` ou `CLASS_PROJECTS`.
- O frontend docente usa um seletor fechado.
- O backend constrói sempre o `targetPath`; não aceita paths arbitrários.
- Payloads sem destino continuam compatíveis e apontam para Hoje.

### Privacidade, seeds e documentação

- Os estados de projeto e leitura do chat foram integrados no personal data registry, exportação e eliminação de conta.
- O teste de cobertura total do registry foi atualizado e executado sobre schemas reais.
- Seeds distinguem grupos e salas nativos, criam progresso de projeto, cursores de leitura e origem docente.
- O mapa técnico e o inventário de funções foram regenerados pelos geradores canónicos.

## Contratos e compatibilidade

- Todos os endpoints anteriores permanecem disponíveis.
- `/conteudos-ia` continua válido.
- `/app/turmas` e restantes redirects anteriores permanecem funcionais.
- Os campos novos de Mongo são opcionais; um rollback de aplicação pode ignorá-los.
- Staff mantém a shell e os fluxos existentes; apenas labels incorretas sobre a origem dos conteúdos foram corrigidas.
- Não foram adicionadas dependências frontend ou backend.

## Validação executada

### API

- `npm test`: **151 suites, 797 testes aprovados**.
- Teste adicional da migração colaborativa isolada: **apply, idempotência e rollback aprovados**.
- Personal data registry real: **2 cenários de integração aprovados**.
- `npm run build`: **PASS**.
- `npm run technical-map:check`: **PASS**.
- `npm run function-inventory:check`: **PASS**.
- `npm run secrets:scan`: **PASS**.

### Web

- `npm test`: **47 ficheiros, 229 testes aprovados**.
- `npm run build:budget`: **PASS**.
- Bundle final: entrada + primeira rota **100,60 KiB gzip**; jornada STUDENT **174,64 KiB gzip**.

### E2E, browsers e acessibilidade

- Suite cross-browser com portas fixas: **59/61 aprovados na passagem global**; os dois restantes eram expectativas E2E com labels antigas.
- Depois de corrigidas as expectativas, os dois percursos foram repetidos e aprovados; o cenário MF2 completo foi novamente executado isoladamente e passou.
- Evidência final acumulada: **61/61 cenários aprovados**.
- Chromium: fluxos completos, incluindo MF1, MF2, Assistente e overhaul do aluno.
- Firefox e WebKit: todos os percursos críticos configurados foram aprovados.
- Axe/WCAG A/AA: cenários configurados aprovados, sem findings `serious` ou `critical`.
- Viewports exercitados pela suite: `320×720`, `375×812`, `768×1024` e `1440×900`.

A primeira tentativa E2E dentro do sandbox falhou por `listen EPERM`. Uma repetição fora do sandbox sem portas fixas revelou um problema preexistente do runner: workers recalculavam portas diferentes. A validação final usou as variáveis de porta explícitas já suportadas pelo projeto.

## Rollout recomendado

1. Criar e verificar snapshot da base.
2. Fazer deploy do backend aditivo.
3. Executar smoke dos endpoints legacy.
4. Executar `migrate:collaboration-kinds:dry-run`.
5. Rever contagens e `ambiguousEntityIds`.
6. Aplicar a migração e guardar o `runId`.
7. Confirmar que cada entidade aparece exatamente uma vez no hub e no Assistente.
8. Fazer deploy do frontend.
9. Validar aluno novo, aluno povoado e aluno com histórico.
10. Monitorizar 404 cruzados, contextos duplicados, unread e outbox.

Rollback:

- reverter o frontend sem remover dados;
- manter campos e índices opcionais durante rollback urgente;
- se necessário, executar `migrate:collaboration-kinds:rollback -- <runId>`;
- nunca executar rollback destrutivo automático.

## Riscos residuais

- A classificação da base real depende da revisão do dry-run; entidades ambíguas são intencionalmente classificadas como grupo e reportadas.
- Restaurar repetidamente a mesma versão reutiliza a chave idempotente dessa restauração; evita spam de notificações e não altera o conteúdo projetado.
- O runner E2E continua a precisar de portas explícitas para uma execução local determinística quando workers reavaliam a configuração.
- Não foi aplicado qualquer script numa base real nesta sessão.

## Fora do âmbito preservado

- Não foram adicionadas entregas ou avaliação de projetos.
- Não foram criadas notificações por mensagem.
- Não foi criada geração IA nova para conteúdos docentes.
- Não foram reveladas regras de voz docente.
- Não foram removidos modelos, endpoints ou rotas legacy.
- Não foram alterados providers, modelos, consentimentos ou quotas de IA.

## Conformidade UI

UI_GUIDELINES_READ: sim

UI_GUIDELINES_PATH: real_dev/docs/FRONTEND-UI-GUIDELINES.md

UI_COMPLIANCE: PASS

UI_DEVIATIONS: nenhuma

UI_VALIDATION: testes unitários e de componentes, build budget, Chromium, Firefox, WebKit, viewports 320×720, 375×812, 768×1024 e 1440×900, e Axe executados
