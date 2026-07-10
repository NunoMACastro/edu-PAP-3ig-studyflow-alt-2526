# MF-VIEWS

## Header
- `doc_id`: `MF-VIEWS`
- `path`: `docs/planificacao/backlogs/MF-VIEWS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-07-10`

## Criterio de pronto pedagogico por macro
- 100% BK com guia canónico completo e snippet tecnico aplicavel.
- Minimo de passos por BK: `P0=>8`, `P1/P2=>6`.
- Minimo de negativos por BK: `P0=>3`, `P1/P2=>2`.

## Sequencia macro
MF0 -> MF1 -> MF2 -> MF3 -> MF4 -> MF5 -> MF6 -> MF7 -> MF8

## MF0 - Fundacoes de plataforma
### Sequencia por macro
BK-MF0-01, BK-MF0-02, BK-MF0-03, BK-MF0-04, BK-MF0-05, BK-MF0-06, BK-MF0-07, BK-MF0-08, BK-MF0-09, BK-MF0-10, BK-MF0-11, BK-MF0-12

### Guias disponiveis
- [BK-MF0-01 - Registo do aluno (email/password ou SSO escolar).](../guias-bk/MF0/BK-MF0-01-registo-do-aluno-email-password-ou-sso-escolar.md)
- [BK-MF0-02 - Login seguro com cookies HttpOnly.](../guias-bk/MF0/BK-MF0-02-login-seguro-com-cookies-httponly.md)
- [BK-MF0-03 - Perfil editável (nome, ano, curso, turma).](../guias-bk/MF0/BK-MF0-03-perfil-editavel-nome-ano-curso-turma.md)
- [BK-MF0-04 - O aluno pode estudar sem turma.](../guias-bk/MF0/BK-MF0-04-o-aluno-pode-estudar-sem-turma.md)
- [BK-MF0-05 - O aluno pode criar rotinas e objetivos de estudo.](../guias-bk/MF0/BK-MF0-05-o-aluno-pode-criar-rotinas-e-objetivos-de-estudo.md)
- [BK-MF0-06 - O aluno pode consultar histórico de estudo.](../guias-bk/MF0/BK-MF0-06-o-aluno-pode-consultar-historico-de-estudo.md)
- [BK-MF0-07 - Criar “Áreas de Estudo” (auto-disciplina independente).](../guias-bk/MF0/BK-MF0-07-criar-areas-de-estudo-auto-disciplina-independente.md)
- [BK-MF0-08 - Submeter materiais (PDF, DOCX, URLs, tópicos).](../guias-bk/MF0/BK-MF0-08-submeter-materiais-pdf-docx-urls-topicos.md)
- [BK-MF0-09 - Associar estilo/tom das aulas → “voz” da IA.](../guias-bk/MF0/BK-MF0-09-associar-estilo-tom-das-aulas-voz-da-ia.md)
- [BK-MF0-10 - Criar perfil IA da Área de Estudo.](../guias-bk/MF0/BK-MF0-10-criar-perfil-ia-da-area-de-estudo.md)
- [BK-MF0-11 - Obter resumos IA baseados nos materiais enviados.](../guias-bk/MF0/BK-MF0-11-obter-resumos-ia-baseados-nos-materiais-enviados.md)
- [BK-MF0-12 - Obter explicações, cards e quizzes personalizados.](../guias-bk/MF0/BK-MF0-12-obter-explicacoes-cards-e-quizzes-personalizados.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade `P0->P1->P2` mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (`pr/proof/neg`) e atualizar estado documental.
5. Fechar macro apenas com criterios de pronto cumpridos.
6. Considerar `BK-MF0-12` o fecho técnico de IA: `AiModule` preserva os serviços de domínio e
   encaminha todas as execuções pelo `GovernedAiExecutionService`; o provider não é exportado
   para fluxos de produção.

### Pronto da macro
- Todos os BK da macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.
- Contratos herdáveis explícitos: sessão v2, `SessionGuard`, `StudyAreasService`,
  `MaterialsService`, `AiModule` e `GovernedAiExecutionService`.

## MF1 - Nucleo funcional I
### Sequencia por macro
BK-MF1-01, BK-MF1-02, BK-MF1-03, BK-MF1-04, BK-MF1-07, BK-MF1-08, BK-MF1-09, BK-MF1-10, BK-MF1-11, BK-MF1-12

### Guias disponiveis
- [BK-MF1-01 - A IA deve adaptar explicações ao ritmo/dificuldades do aluno.](../guias-bk/MF1/BK-MF1-01-a-ia-deve-adaptar-explicacoes-ao-ritmo-dificuldades-do-aluno.md)
- [BK-MF1-02 - Criar salas de estudo com outros alunos (livres ou por disciplina).](../guias-bk/MF1/BK-MF1-02-criar-salas-de-estudo-com-outros-alunos-livres-ou-por-disciplina.md)
- [BK-MF1-03 - Partilhar materiais e apontamentos na sala.](../guias-bk/MF1/BK-MF1-03-partilhar-materiais-e-apontamentos-na-sala.md)
- [BK-MF1-04 - IA partilhada da sala (mistura das áreas dos membros).](../guias-bk/MF1/BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md)
- [BK-MF1-07 - Criar turmas.](../guias-bk/MF1/BK-MF1-07-criar-turmas.md)
- [BK-MF1-08 - Criar disciplinas e associá-las às turmas.](../guias-bk/MF1/BK-MF1-08-criar-disciplinas-e-associa-las-as-turmas.md)
- [BK-MF1-09 - Submeter materiais da disciplina (versão oficial).](../guias-bk/MF1/BK-MF1-09-submeter-materiais-da-disciplina-versao-oficial.md)
- [BK-MF1-10 - Configurar voz da IA docente por turma, com override opcional por disciplina.](../guias-bk/MF1/BK-MF1-10-configurar-voz-da-ia-docente.md)
- [BK-MF1-11 - O aluno inscrito numa turma recebe versão limitada da IA.](../guias-bk/MF1/BK-MF1-11-o-aluno-inscrito-numa-turma-recebe-versao-limitada-da-ia.md)
- [BK-MF1-12 - Professores podem enviar avisos e publicações.](../guias-bk/MF1/BK-MF1-12-professores-podem-enviar-avisos-e-publicacoes.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK pela ordem canónica de PRs: `BK-MF1-01`, `BK-MF1-02`, `BK-MF1-03`, `BK-MF1-04`, `BK-MF1-07`, `BK-MF1-08`, `BK-MF1-09`, `BK-MF1-10`, `BK-MF1-11`, `BK-MF1-12`.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (`pr/proof/neg`) e atualizar estado documental.
5. Fechar macro apenas com criterios de pronto cumpridos.
6. Abrir cada PR apenas depois do BK anterior da mesma cadeia estar merged.
7. Evitar PRs paralelos em módulos partilhados: `ai.module.ts` acumula MF0 -> `BK-MF1-01`; `study-rooms.module.ts` acumula `BK-MF1-02` -> `BK-MF1-03` -> `BK-MF1-04`.
8. Manter `BK-MF1-12` depois de `BK-MF1-11` na sequência macro, apesar de a dependência técnica direta vir de `BK-MF1-07`.

### Pronto da macro
- Todos os BK da macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.
- `BK-MF1-01` depende de `BK-MF0-12` e preserva `StudyToolsService` sem injetar diretamente o
  provider.
- `BK-MF1-04` depende de `BK-MF1-02` e `BK-MF1-03`.
- `BK-MF1-11` importa `AiModule` final em vez de redefinir provider.

## MF2 - Nucleo funcional II
### Sequencia por macro
BK-MF2-01, BK-MF2-02, BK-MF2-03, BK-MF2-04, BK-MF2-05, BK-MF2-06, BK-MF2-07, BK-MF2-08, BK-MF2-09, BK-MF2-10, BK-MF2-11, BK-MF2-12

### Guias disponiveis
- [BK-MF2-01 - Professores podem criar salas de estudo guiado com disciplina opcional.](../guias-bk/MF2/BK-MF2-01-professores-podem-criar-salas-de-estudo-guiado.md)
- [BK-MF2-02 - Professores podem criar projetos para a turma.](../guias-bk/MF2/BK-MF2-02-professores-podem-criar-projetos-para-a-turma.md)
- [BK-MF2-03 - A IA deve ajudar o aluno a elaborar projetos de forma gradual.](../guias-bk/MF2/BK-MF2-03-a-ia-deve-ajudar-o-aluno-a-elaborar-projetos-de-forma-gradual.md)
- [BK-MF2-04 - Criar testes/mini-testes oficiais.](../guias-bk/MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md)
- [BK-MF2-05 - Rever e aprovar conteúdo gerado pela IA (resumos/quizzes).](../guias-bk/MF2/BK-MF2-05-rever-e-aprovar-conteudo-gerado-pela-ia-resumos-quizzes.md)
- [BK-MF2-06 - Painel com progresso, dificuldades e métricas da turma.](../guias-bk/MF2/BK-MF2-06-painel-com-progresso-dificuldades-e-metricas-da-turma.md)
- [BK-MF2-07 - Indexação automática de PDFs, DOCX e URLs.](../guias-bk/MF2/BK-MF2-07-indexacao-automatica-de-pdfs-docx-e-urls.md)
- [BK-MF2-08 - Extrair tópicos, secções, estrutura e referências.](../guias-bk/MF2/BK-MF2-08-extrair-topicos-seccoes-estrutura-e-referencias.md)
- [BK-MF2-09 - Manter versões dos materiais.](../guias-bk/MF2/BK-MF2-09-manter-versoes-dos-materiais.md)
- [BK-MF2-10 - Separar materiais entre “aluno”, “professor” e “turma”.](../guias-bk/MF2/BK-MF2-10-separar-materiais-entre-aluno-professor-e-turma.md)
- [BK-MF2-11 - Assistente IA privado por Área de Estudo.](../guias-bk/MF2/BK-MF2-11-assistente-ia-privado-por-area-de-estudo.md)
- [BK-MF2-12 - Assistente IA da disciplina/turma com voz docente herdada.](../guias-bk/MF2/BK-MF2-12-assistente-ia-da-disciplina-turma-com-voz-docente.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade `P0->P1->P2` mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (`pr/proof/neg`) e atualizar estado documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK da macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF3 - Capacidades de produto I
### Sequencia por macro
BK-MF3-01, BK-MF3-02, BK-MF3-03, BK-MF3-04, BK-MF3-05, BK-MF3-06, BK-MF3-07, BK-MF3-08, BK-MF3-09, BK-MF3-10, BK-MF3-11, BK-MF3-12

### Guias disponiveis
- [BK-MF3-01 - Guardrails distintos para aluno solo, grupo e turma.](../guias-bk/MF3/BK-MF3-01-guardrails-distintos-para-aluno-solo-grupo-e-turma.md)
- [BK-MF3-02 - IA não pode inventar conteúdo (citações obrigatórias).](../guias-bk/MF3/BK-MF3-02-ia-nao-pode-inventar-conteudo-citacoes-obrigatorias.md)
- [BK-MF3-03 - IA pode recorrer a conhecimento externo (limitado) quando permitido.](../guias-bk/MF3/BK-MF3-03-ia-pode-recorrer-a-conhecimento-externo-limitado-quando-permitido.md)
- [BK-MF3-04 - IA deve ajustar explicações ao perfil do aluno.](../guias-bk/MF3/BK-MF3-04-ia-deve-ajustar-explicacoes-ao-perfil-do-aluno.md)
- [BK-MF3-05 - Criar grupos de estudo.](../guias-bk/MF3/BK-MF3-05-criar-grupos-de-estudo.md)
- [BK-MF3-06 - Chat, partilha e notas coletivas.](../guias-bk/MF3/BK-MF3-06-chat-partilha-e-notas-coletivas.md)
- [BK-MF3-07 - Agendar sessões de estudo coletivo.](../guias-bk/MF3/BK-MF3-07-agendar-sessoes-de-estudo-coletivo.md)
- [BK-MF3-08 - IA coletiva para sessões de grupo.](../guias-bk/MF3/BK-MF3-08-ia-coletiva-para-sessoes-de-grupo.md)
- [BK-MF3-09 - Pesquisa unificada por tópico/conceito/material.](../guias-bk/MF3/BK-MF3-09-pesquisa-unificada-por-topico-conceito-material.md)
- [BK-MF3-10 - Navegação por programa/currículo.](../guias-bk/MF3/BK-MF3-10-navegacao-por-programa-curriculo.md)
- [BK-MF3-11 - Configurar preferências de notificações (email, push, app) por contexto.](../guias-bk/MF3/BK-MF3-11-configurar-preferencias-de-notificacoes-email-push-app-por-contexto.md)
- [BK-MF3-12 - Alertar alunos sobre rotinas, objetivos e sessões de estudo agendadas.](../guias-bk/MF3/BK-MF3-12-alertar-alunos-sobre-rotinas-objetivos-e-sessoes-de-estudo-agendadas.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade `P0->P1->P2` mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (`pr/proof/neg`) e atualizar estado documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK da macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF4 - Capacidades de produto II
### Sequencia por macro
BK-MF4-01, BK-MF4-02, BK-MF4-03, BK-MF4-04, BK-MF4-05, BK-MF4-06, BK-MF4-07, BK-MF4-08, BK-MF4-09, BK-MF4-10

### Guias disponiveis
- [BK-MF4-01 - Notificar grupos/turmas sobre novos materiais, feedback e tarefas.](../guias-bk/MF4/BK-MF4-01-notificar-grupos-turmas-sobre-novos-materiais-feedback-e-tarefas.md)
- [BK-MF4-02 - Professores definem alertas de acompanhamento (ex.: aluno inativo X dias).](../guias-bk/MF4/BK-MF4-02-professores-definem-alertas-de-acompanhamento-ex-aluno-inativo-x-dias.md)
- [BK-MF4-03 - Administradores configuram canais e quotas máximas de notificações.](../guias-bk/MF4/BK-MF4-03-administradores-configuram-canais-e-quotas-maximas-de-notificacoes.md)
- [BK-MF4-04 - Exportar dados pessoais.](../guias-bk/MF4/BK-MF4-04-exportar-dados-pessoais.md)
- [BK-MF4-05 - Eliminar conta e dados.](../guias-bk/MF4/BK-MF4-05-eliminar-conta-e-dados.md)
- [BK-MF4-06 - Gestão de consentimentos para IA.](../guias-bk/MF4/BK-MF4-06-gestao-de-consentimentos-para-ia.md)
- [BK-MF4-07 - Gestão de utilizadores e papéis.](../guias-bk/MF4/BK-MF4-07-gestao-de-utilizadores-e-papeis.md)
- [BK-MF4-08 - Auditoria completa (materiais, IA, papéis).](../guias-bk/MF4/BK-MF4-08-auditoria-completa-materiais-ia-papeis.md)
- [BK-MF4-09 - Configurar modelos de IA e limites de uso.](../guias-bk/MF4/BK-MF4-09-configurar-modelos-de-ia-e-limites-de-uso.md)
- [BK-MF4-10 - Definir quotas de IA por aluno/turma/grupo e monitorizar consumo.](../guias-bk/MF4/BK-MF4-10-definir-quotas-de-ia-por-aluno-turma-grupo-e-monitorizar-consumo.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade `P0->P1->P2` mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (`pr/proof/neg`) e atualizar estado documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK da macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF5 - Operacao e UX transversal
### Sequencia por macro
BK-MF5-01, BK-MF5-03, BK-MF5-04, BK-MF5-05, BK-MF5-06, BK-MF5-07, BK-MF5-08, BK-MF5-09, BK-MF5-10, BK-MF5-11, BK-MF5-12

### Guias disponiveis
- [BK-MF5-01 - Integração com Drives (Google/OneDrive) para importação unidirecional de materiais de estudo.](../guias-bk/MF5/BK-MF5-01-integracao-com-drives-google-onedrive-para-importacao-unidirecional-de-materiais-de-estudo.md)
- [BK-MF5-03 - Interface intuitiva e clara para alunos e professores.](../guias-bk/MF5/BK-MF5-03-interface-intuitiva-e-clara-para-alunos-e-professores.md)
- [BK-MF5-04 - Layout responsivo para desktop/tablet/mobile.](../guias-bk/MF5/BK-MF5-04-layout-responsivo-para-desktop-tablet-mobile.md)
- [BK-MF5-05 - Feedback imediato em ações (guardar, IA, uploads).](../guias-bk/MF5/BK-MF5-05-feedback-imediato-em-acoes-guardar-ia-uploads.md)
- [BK-MF5-06 - Navegação consistente entre módulos.](../guias-bk/MF5/BK-MF5-06-navegacao-consistente-entre-modulos.md)
- [BK-MF5-07 - Regras básicas de acessibilidade (contraste, labels).](../guias-bk/MF5/BK-MF5-07-regras-basicas-de-acessibilidade-contraste-labels.md)
- [BK-MF5-08 - Validação completa de formulários antes de submissão.](../guias-bk/MF5/BK-MF5-08-validacao-completa-de-formularios-antes-de-submissao.md)
- [BK-MF5-09 - Notificações discretas e contextualizadas.](../guias-bk/MF5/BK-MF5-09-notificacoes-discretas-e-contextualizadas.md)
- [BK-MF5-10 - Dashboards e estudo carregam em ≤ 2s.](../guias-bk/MF5/BK-MF5-10-dashboards-e-estudo-carregam-em-2s.md)
- [BK-MF5-11 - Respostas da IA devem surgir em ≤ 4s.](../guias-bk/MF5/BK-MF5-11-respostas-da-ia-devem-surgir-em-4s.md)
- [BK-MF5-12 - Suportar ≥ 200 utilizadores simultâneos por escola.](../guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade `P0->P1->P2` mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (`pr/proof/neg`) e atualizar estado documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK da macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF6 - Qualidade, seguranca e performance
### Sequencia por macro
BK-MF6-01, BK-MF6-02, BK-MF6-03, BK-MF6-04, BK-MF6-05, BK-MF6-06, BK-MF6-07, BK-MF6-08, BK-MF6-09, BK-MF6-10, BK-MF6-11, BK-MF6-12

### Guias disponiveis
- [BK-MF6-01 - Indexação de documentos deve ser assíncrona e não bloquear UI.](../guias-bk/MF6/BK-MF6-01-indexacao-de-documentos-deve-ser-assincrona-e-nao-bloquear-ui.md)
- [BK-MF6-02 - Geração de quizzes em background quando necessário.](../guias-bk/MF6/BK-MF6-02-geracao-de-quizzes-em-background-quando-necessario.md)
- [BK-MF6-03 - Arquitetura preparada para escalar horizontalmente.](../guias-bk/MF6/BK-MF6-03-arquitetura-preparada-para-escalar-horizontalmente.md)
- [BK-MF6-04 - HTTPS obrigatório (TLS 1.2+).](../guias-bk/MF6/BK-MF6-04-https-obrigatorio-tls-1-2.md)
- [BK-MF6-05 - Passwords com hashing seguro (bcrypt/argon2).](../guias-bk/MF6/BK-MF6-05-passwords-com-hashing-seguro-bcrypt-argon2.md)
- [BK-MF6-06 - Sessões com cookies HttpOnly + Secure + SameSite.](../guias-bk/MF6/BK-MF6-06-sessoes-com-cookies-httponly-secure-samesite.md)
- [BK-MF6-07 - Proteções contra XSS, CSRF, Injection, brute force.](../guias-bk/MF6/BK-MF6-07-protecoes-contra-xss-csrf-injection-brute-force.md)
- [BK-MF6-08 - Processamento de documentos em sandbox seguro.](../guias-bk/MF6/BK-MF6-08-processamento-de-documentos-em-sandbox-seguro.md)
- [BK-MF6-09 - Guardrails obrigatórios na IA.](../guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md)
- [BK-MF6-10 - IA não acede a dados de outras turmas ou alunos.](../guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md)
- [BK-MF6-11 - Backups diários automáticos.](../guias-bk/MF6/BK-MF6-11-backups-diarios-automaticos.md)
- [BK-MF6-12 - Auto-recovery após falhas.](../guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade `P0->P1->P2` mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (`pr/proof/neg`) e atualizar estado documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK da macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF7 - Operacao, modularidade e compliance
### Sequencia por macro
BK-MF7-01, BK-MF7-02, BK-MF7-03, BK-MF7-04, BK-MF7-05, BK-MF7-06, BK-MF7-07, BK-MF7-08, BK-MF7-09, BK-MF7-10, BK-MF7-11

### Guias disponiveis
- [BK-MF7-01 - Logs estruturados de eventos e erros.](../guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md)
- [BK-MF7-02 - Downtime máximo aceitável < 1h/mês.](../guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md)
- [BK-MF7-03 - Backend modular por domínios (aluno, professor, IA, materiais).](../guias-bk/MF7/BK-MF7-03-backend-modular-por-dominios-aluno-professor-ia-materiais.md)
- [BK-MF7-04 - Frontend componentizado e reutilizável.](../guias-bk/MF7/BK-MF7-04-frontend-componentizado-e-reutilizavel.md)
- [BK-MF7-05 - Documentação técnica mínima (modelos, fluxos, endpoints).](../guias-bk/MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md)
- [BK-MF7-06 - Testes automatizados para módulos críticos.](../guias-bk/MF7/BK-MF7-06-testes-automatizados-para-modulos-criticos.md)
- [BK-MF7-07 - Deploy com rollback.](../guias-bk/MF7/BK-MF7-07-deploy-com-rollback.md)
- [BK-MF7-08 - Endpoint de health-check.](../guias-bk/MF7/BK-MF7-08-endpoint-de-health-check.md)
- [BK-MF7-09 - IA explica fontes dos conteúdos (páginas/secções).](../guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md)
- [BK-MF7-10 - IA respeita perfis distintos (aluno, sala, turma, disciplina, professor).](../guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md)
- [BK-MF7-11 - IA segue limites definidos pelo professor, incluindo voz herdada.](../guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade `P0->P1->P2` mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (`pr/proof/neg`) e atualizar estado documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK da macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF8 - Fecho de produto, qualidade da IA e validação final
### Sequencia por macro
BK-MF8-01, BK-MF8-02, BK-MF8-03, BK-MF8-04, BK-MF8-05, BK-MF8-06, BK-MF8-07, BK-MF8-08, BK-MF8-09, BK-MF8-10, BK-MF8-11, BK-MF8-12, BK-MF8-13, BK-MF8-14, BK-MF8-15, BK-MF8-16, BK-MF8-17

### Guias disponiveis
- [BK-MF8-01 - IA evita enviesamentos e respostas inseguras.](../guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md)
- [BK-MF8-02 - IA não pode inventar informação factual.](../guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md)
- [BK-MF8-03 - IA adapta explicações ao nível do aluno.](../guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md)
- [BK-MF8-04 - IA externa segue políticas e filtros próprios.](../guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md)
- [BK-MF8-05 - Aproximação da UI à UI do mockup.](../guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md)
- [BK-MF8-06 - Suporte a importação UTF-8 e PT-PT.](../guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md)
- [BK-MF8-07 - Exportação de resumos/quizzes em PDF/MD.](../guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md)
- [BK-MF8-08 - Datas no formato dd/mm/aaaa.](../guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md)
- [BK-MF8-09 - Preparado para futura tradução i18n.](../guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md)
- [BK-MF8-10 - Histórico privado dos chats IA da sala.](../guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md)
- [BK-MF8-11 - Partilha read-only e fork privado de chat IA da sala.](../guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md)
- [BK-MF8-12 - Realização de mini-testes oficiais por aluno.](../guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md)
- [BK-MF8-13 - Rankings dos mini-testes oficiais.](../guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md)
- [BK-MF8-14 - Flashcards em modo de exercício e revisão.](../guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md)
- [BK-MF8-15 - Verificação dos testes atuais e criação dos testes em falta.](../guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md)
- [BK-MF8-16 - Execução final de testes.](../guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md)
- [BK-MF8-17 - Correção de erros.](../guias-bk/MF8/BK-MF8-17-correcao-de-erros.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade `P0->P1->P2` mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (`pr/proof/neg`) e atualizar estado documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK da macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.
## Changelog
- `2026-04-19`: MF views sincronizadas com naming slug e contrato canónico de pronto pedagogico.

<!-- REAL_DEV_STATUS:BEGIN -->
## Vista do estado independente de `real_dev`

Esta vista é gerada a partir da mesma política usada nos headers, matriz e backlog.
`estado` continua a representar apenas o progresso dos alunos.

| BK | MF | real_dev_status |
| --- | --- | --- |
| BK-MF0-01 | MF0 | PARCIAL |
| BK-MF0-02 | MF0 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF0-03 | MF0 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF0-04 | MF0 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF0-05 | MF0 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF0-06 | MF0 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF0-07 | MF0 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF0-08 | MF0 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF0-09 | MF0 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF0-10 | MF0 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF0-11 | MF0 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF0-12 | MF0 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF1-01 | MF1 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF1-02 | MF1 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF1-03 | MF1 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF1-04 | MF1 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF1-07 | MF1 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF1-08 | MF1 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF1-09 | MF1 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF1-10 | MF1 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF1-11 | MF1 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF1-12 | MF1 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF2-01 | MF2 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF2-02 | MF2 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF2-03 | MF2 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF2-04 | MF2 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF2-05 | MF2 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF2-06 | MF2 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF2-07 | MF2 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF2-08 | MF2 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF2-09 | MF2 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF2-10 | MF2 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF2-11 | MF2 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF2-12 | MF2 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF3-01 | MF3 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF3-02 | MF3 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF3-03 | MF3 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF3-04 | MF3 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF3-05 | MF3 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF3-06 | MF3 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF3-07 | MF3 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF3-08 | MF3 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF3-09 | MF3 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF3-10 | MF3 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF3-11 | MF3 | PARCIAL |
| BK-MF3-12 | MF3 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF4-01 | MF4 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF4-02 | MF4 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF4-03 | MF4 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF4-04 | MF4 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF4-05 | MF4 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF4-06 | MF4 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF4-07 | MF4 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF4-08 | MF4 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF4-09 | MF4 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF4-10 | MF4 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF5-01 | MF5 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF5-03 | MF5 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF5-04 | MF5 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF5-05 | MF5 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF5-06 | MF5 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF5-07 | MF5 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF5-08 | MF5 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF5-09 | MF5 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF5-10 | MF5 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF5-11 | MF5 | PARCIAL |
| BK-MF5-12 | MF5 | PARCIAL |
| BK-MF6-01 | MF6 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF6-02 | MF6 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF6-03 | MF6 | MITIGADO_POR_ESCOPO |
| BK-MF6-04 | MF6 | MITIGADO_POR_ESCOPO |
| BK-MF6-05 | MF6 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF6-06 | MF6 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF6-07 | MF6 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF6-08 | MF6 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF6-09 | MF6 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF6-10 | MF6 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF6-11 | MF6 | BLOQUEADO_OPERADOR |
| BK-MF6-12 | MF6 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF7-01 | MF7 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF7-02 | MF7 | MITIGADO_POR_ESCOPO |
| BK-MF7-03 | MF7 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF7-04 | MF7 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF7-05 | MF7 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF7-06 | MF7 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF7-07 | MF7 | BLOQUEADO_OPERADOR |
| BK-MF7-08 | MF7 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF7-09 | MF7 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF7-10 | MF7 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF7-11 | MF7 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-01 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-02 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-03 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-04 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-05 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-06 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-07 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-08 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-09 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-10 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-11 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-12 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-13 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-14 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-15 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
| BK-MF8-16 | MF8 | BLOQUEADO_OPERADOR |
| BK-MF8-17 | MF8 | IMPLEMENTADO_NAO_VALIDADO |
<!-- REAL_DEV_STATUS:END -->
