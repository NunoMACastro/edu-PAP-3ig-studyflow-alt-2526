# GUIAS-BK-README

## Header
- `doc_id`: `GUIAS-BK-README`
- `path`: `docs/planificacao/guias-bk/README.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-05-31`

## Regra de naming oficial
- Formato obrigatorio: `BK-MF*-**-slug-semantico.md`.
- IDs BK mantidos sem alteracao.

## Contrato de header obrigatorio
- Campos obrigatorios: `bk_id`, `macro`, `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`, `fase_documental`, `sprint`, `core_or_reforco`, `proximo_bk`, `guia_path`, `last_updated`.

## Contrato semântico obrigatório
- O `rf_rnf` do header deve estar refletido nos `Passos`, `Validacao` e `Cenarios negativos recomendados`.
- O `Snippet tecnico aplicavel` deve pertencer ao dominio funcional do BK (nao sao aceites snippets genéricos).
- `Evidence` deve incluir prova do caminho principal e prova de falha controlada.
- Politica de negativos: `P0=>3`, `P1=>2`, `P2=>1`.

## Contratos herdados por MF futuras
- `MF0` fecha a fundação comum: `SessionGuard`, `AuthenticatedUser`, `StudyAreasService`, `MaterialsService`, `AiModule` e `AI_PROVIDER`.
- `BK-MF0-12` é o fecho técnico da fundação de IA: `AiModule` deve preservar `AiAreaProfileService`, `SummariesService`, `StudyToolsService` e exportar `AI_PROVIDER`.
- `MF1` deve acrescentar capacidades sobre estes contratos, não substituir módulos partilhados. `ai.module.ts` e `study-rooms.module.ts` são ficheiros acumulativos.
- Fases futuras devem importar os módulos/serviços herdados e só alterar contratos partilhados quando o BK anterior da cadeia já estiver merged.
- PRs paralelos só são aceitáveis entre cadeias que não editem o mesmo módulo partilhado.

## Indice completo
### MF0
- [BK-MF0-01 - Registo do aluno (email/password ou SSO escolar).](MF0/BK-MF0-01-registo-do-aluno-email-password-ou-sso-escolar.md)
- [BK-MF0-02 - Login seguro com cookies HttpOnly.](MF0/BK-MF0-02-login-seguro-com-cookies-httponly.md)
- [BK-MF0-03 - Perfil editável (nome, ano, curso, turma).](MF0/BK-MF0-03-perfil-editavel-nome-ano-curso-turma.md)
- [BK-MF0-04 - O aluno pode estudar sem turma.](MF0/BK-MF0-04-o-aluno-pode-estudar-sem-turma.md)
- [BK-MF0-05 - O aluno pode criar rotinas e objetivos de estudo.](MF0/BK-MF0-05-o-aluno-pode-criar-rotinas-e-objetivos-de-estudo.md)
- [BK-MF0-06 - O aluno pode consultar histórico de estudo.](MF0/BK-MF0-06-o-aluno-pode-consultar-historico-de-estudo.md)
- [BK-MF0-07 - Criar “Áreas de Estudo” (auto-disciplina independente).](MF0/BK-MF0-07-criar-areas-de-estudo-auto-disciplina-independente.md)
- [BK-MF0-08 - Submeter materiais (PDF, DOCX, URLs, tópicos).](MF0/BK-MF0-08-submeter-materiais-pdf-docx-urls-topicos.md)
- [BK-MF0-09 - Associar estilo/tom das aulas → “voz” da IA.](MF0/BK-MF0-09-associar-estilo-tom-das-aulas-voz-da-ia.md)
- [BK-MF0-10 - Criar perfil IA da Área de Estudo.](MF0/BK-MF0-10-criar-perfil-ia-da-area-de-estudo.md)
- [BK-MF0-11 - Obter resumos IA baseados nos materiais enviados.](MF0/BK-MF0-11-obter-resumos-ia-baseados-nos-materiais-enviados.md)
- [BK-MF0-12 - Obter explicações, cards e quizzes personalizados.](MF0/BK-MF0-12-obter-explicacoes-cards-e-quizzes-personalizados.md)

### MF1
- [BK-MF1-01 - A IA deve adaptar explicações ao ritmo/dificuldades do aluno.](MF1/BK-MF1-01-a-ia-deve-adaptar-explicacoes-ao-ritmo-dificuldades-do-aluno.md)
- [BK-MF1-02 - Criar salas de estudo com outros alunos (livres ou por disciplina).](MF1/BK-MF1-02-criar-salas-de-estudo-com-outros-alunos-livres-ou-por-disciplina.md)
- [BK-MF1-03 - Partilhar materiais e apontamentos na sala.](MF1/BK-MF1-03-partilhar-materiais-e-apontamentos-na-sala.md)
- [BK-MF1-04 - IA partilhada da sala (mistura das áreas dos membros).](MF1/BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md)
- [BK-MF1-07 - Criar turmas.](MF1/BK-MF1-07-criar-turmas.md)
- [BK-MF1-08 - Criar disciplinas e associá-las às turmas.](MF1/BK-MF1-08-criar-disciplinas-e-associa-las-as-turmas.md)
- [BK-MF1-09 - Submeter materiais da disciplina (versão oficial).](MF1/BK-MF1-09-submeter-materiais-da-disciplina-versao-oficial.md)
- [BK-MF1-10 - Configurar “voz da IA” docente.](MF1/BK-MF1-10-configurar-voz-da-ia-docente.md)
- [BK-MF1-11 - O aluno inscrito numa turma recebe versão limitada da IA.](MF1/BK-MF1-11-o-aluno-inscrito-numa-turma-recebe-versao-limitada-da-ia.md)
- [BK-MF1-12 - Professores podem enviar avisos e publicações.](MF1/BK-MF1-12-professores-podem-enviar-avisos-e-publicacoes.md)

### MF2
- [BK-MF2-01 - Professores podem criar salas de estudo guiado.](MF2/BK-MF2-01-professores-podem-criar-salas-de-estudo-guiado.md)
- [BK-MF2-02 - Professores podem criar projetos para a turma.](MF2/BK-MF2-02-professores-podem-criar-projetos-para-a-turma.md)
- [BK-MF2-03 - A IA deve ajudar o aluno a elaborar projetos de forma gradual.](MF2/BK-MF2-03-a-ia-deve-ajudar-o-aluno-a-elaborar-projetos-de-forma-gradual.md)
- [BK-MF2-04 - Criar testes/mini-testes oficiais.](MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md)
- [BK-MF2-05 - Rever e aprovar conteúdo gerado pela IA (resumos/quizzes).](MF2/BK-MF2-05-rever-e-aprovar-conteudo-gerado-pela-ia-resumos-quizzes.md)
- [BK-MF2-06 - Painel com progresso, dificuldades e métricas da turma.](MF2/BK-MF2-06-painel-com-progresso-dificuldades-e-metricas-da-turma.md)
- [BK-MF2-07 - Indexação automática de PDFs, DOCX e URLs.](MF2/BK-MF2-07-indexacao-automatica-de-pdfs-docx-e-urls.md)
- [BK-MF2-08 - Extrair tópicos, secções, estrutura e referências.](MF2/BK-MF2-08-extrair-topicos-seccoes-estrutura-e-referencias.md)
- [BK-MF2-09 - Manter versões dos materiais.](MF2/BK-MF2-09-manter-versoes-dos-materiais.md)
- [BK-MF2-10 - Separar materiais entre “aluno”, “professor” e “turma”.](MF2/BK-MF2-10-separar-materiais-entre-aluno-professor-e-turma.md)
- [BK-MF2-11 - Assistente IA privado por Área de Estudo.](MF2/BK-MF2-11-assistente-ia-privado-por-area-de-estudo.md)
- [BK-MF2-12 - Assistente IA da disciplina/turma com voz docente.](MF2/BK-MF2-12-assistente-ia-da-disciplina-turma-com-voz-docente.md)

### MF3
- [BK-MF3-01 - Guardrails distintos para aluno solo, grupo e turma.](MF3/BK-MF3-01-guardrails-distintos-para-aluno-solo-grupo-e-turma.md)
- [BK-MF3-02 - IA não pode inventar conteúdo (citações obrigatórias).](MF3/BK-MF3-02-ia-nao-pode-inventar-conteudo-citacoes-obrigatorias.md)
- [BK-MF3-03 - IA pode recorrer a conhecimento externo (limitado) quando permitido.](MF3/BK-MF3-03-ia-pode-recorrer-a-conhecimento-externo-limitado-quando-permitido.md)
- [BK-MF3-04 - IA deve ajustar explicações ao perfil do aluno.](MF3/BK-MF3-04-ia-deve-ajustar-explicacoes-ao-perfil-do-aluno.md)
- [BK-MF3-05 - Criar grupos de estudo.](MF3/BK-MF3-05-criar-grupos-de-estudo.md)
- [BK-MF3-06 - Chat, partilha e notas coletivas.](MF3/BK-MF3-06-chat-partilha-e-notas-coletivas.md)
- [BK-MF3-07 - Agendar sessões de estudo coletivo.](MF3/BK-MF3-07-agendar-sessoes-de-estudo-coletivo.md)
- [BK-MF3-08 - IA coletiva para sessões de grupo.](MF3/BK-MF3-08-ia-coletiva-para-sessoes-de-grupo.md)
- [BK-MF3-09 - Pesquisa unificada por tópico/conceito/material.](MF3/BK-MF3-09-pesquisa-unificada-por-topico-conceito-material.md)
- [BK-MF3-10 - Navegação por programa/currículo.](MF3/BK-MF3-10-navegacao-por-programa-curriculo.md)
- [BK-MF3-11 - Configurar preferências de notificações (email, push, app) por contexto.](MF3/BK-MF3-11-configurar-preferencias-de-notificacoes-email-push-app-por-contexto.md)
- [BK-MF3-12 - Alertar alunos sobre rotinas, objetivos e sessões de estudo agendadas.](MF3/BK-MF3-12-alertar-alunos-sobre-rotinas-objetivos-e-sessoes-de-estudo-agendadas.md)

### MF4
- [BK-MF4-01 - Notificar grupos/turmas sobre novos materiais, feedback e tarefas.](MF4/BK-MF4-01-notificar-grupos-turmas-sobre-novos-materiais-feedback-e-tarefas.md)
- [BK-MF4-02 - Professores definem alertas de acompanhamento (ex.: aluno inativo X dias).](MF4/BK-MF4-02-professores-definem-alertas-de-acompanhamento-ex-aluno-inativo-x-dias.md)
- [BK-MF4-03 - Administradores configuram canais e quotas máximas de notificações.](MF4/BK-MF4-03-administradores-configuram-canais-e-quotas-maximas-de-notificacoes.md)
- [BK-MF4-04 - Exportar dados pessoais.](MF4/BK-MF4-04-exportar-dados-pessoais.md)
- [BK-MF4-05 - Eliminar conta e dados.](MF4/BK-MF4-05-eliminar-conta-e-dados.md)
- [BK-MF4-06 - Gestão de consentimentos para IA.](MF4/BK-MF4-06-gestao-de-consentimentos-para-ia.md)
- [BK-MF4-07 - Gestão de utilizadores e papéis.](MF4/BK-MF4-07-gestao-de-utilizadores-e-papeis.md)
- [BK-MF4-08 - Auditoria completa (materiais, IA, papéis).](MF4/BK-MF4-08-auditoria-completa-materiais-ia-papeis.md)
- [BK-MF4-09 - Configurar modelos de IA e limites de uso.](MF4/BK-MF4-09-configurar-modelos-de-ia-e-limites-de-uso.md)
- [BK-MF4-10 - Definir quotas de IA por aluno/turma/grupo e monitorizar consumo.](MF4/BK-MF4-10-definir-quotas-de-ia-por-aluno-turma-grupo-e-monitorizar-consumo.md)

### MF5
- [BK-MF5-01 - Integração com Drives (Google/OneDrive) para importação unidirecional de materiais de estudo.](MF5/BK-MF5-01-integracao-com-drives-google-onedrive-para-importacao-unidirecional-de-materiais-de-estudo.md)
- [BK-MF5-03 - Interface intuitiva e clara para alunos e professores.](MF5/BK-MF5-03-interface-intuitiva-e-clara-para-alunos-e-professores.md)
- [BK-MF5-04 - Layout responsivo para desktop/tablet/mobile.](MF5/BK-MF5-04-layout-responsivo-para-desktop-tablet-mobile.md)
- [BK-MF5-05 - Feedback imediato em ações (guardar, IA, uploads).](MF5/BK-MF5-05-feedback-imediato-em-acoes-guardar-ia-uploads.md)
- [BK-MF5-06 - Navegação consistente entre módulos.](MF5/BK-MF5-06-navegacao-consistente-entre-modulos.md)
- [BK-MF5-07 - Regras básicas de acessibilidade (contraste, labels).](MF5/BK-MF5-07-regras-basicas-de-acessibilidade-contraste-labels.md)
- [BK-MF5-08 - Validação completa de formulários antes de submissão.](MF5/BK-MF5-08-validacao-completa-de-formularios-antes-de-submissao.md)
- [BK-MF5-09 - Notificações discretas e contextualizadas.](MF5/BK-MF5-09-notificacoes-discretas-e-contextualizadas.md)
- [BK-MF5-10 - Dashboards e estudo carregam em ≤ 2s.](MF5/BK-MF5-10-dashboards-e-estudo-carregam-em-2s.md)
- [BK-MF5-11 - Respostas da IA devem surgir em ≤ 4s.](MF5/BK-MF5-11-respostas-da-ia-devem-surgir-em-4s.md)
- [BK-MF5-12 - Suportar ≥ 200 utilizadores simultâneos por escola.](MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md)

### MF6
- [BK-MF6-01 - Indexação de documentos deve ser assíncrona e não bloquear UI.](MF6/BK-MF6-01-indexacao-de-documentos-deve-ser-assincrona-e-nao-bloquear-ui.md)
- [BK-MF6-02 - Geração de quizzes em background quando necessário.](MF6/BK-MF6-02-geracao-de-quizzes-em-background-quando-necessario.md)
- [BK-MF6-03 - Arquitetura preparada para escalar horizontalmente.](MF6/BK-MF6-03-arquitetura-preparada-para-escalar-horizontalmente.md)
- [BK-MF6-04 - HTTPS obrigatório (TLS 1.2+).](MF6/BK-MF6-04-https-obrigatorio-tls-1-2.md)
- [BK-MF6-05 - Passwords com hashing seguro (bcrypt/argon2).](MF6/BK-MF6-05-passwords-com-hashing-seguro-bcrypt-argon2.md)
- [BK-MF6-06 - Sessões com cookies HttpOnly + Secure + SameSite.](MF6/BK-MF6-06-sessoes-com-cookies-httponly-secure-samesite.md)
- [BK-MF6-07 - Proteções contra XSS, CSRF, Injection, brute force.](MF6/BK-MF6-07-protecoes-contra-xss-csrf-injection-brute-force.md)
- [BK-MF6-08 - Processamento de documentos em sandbox seguro.](MF6/BK-MF6-08-processamento-de-documentos-em-sandbox-seguro.md)
- [BK-MF6-09 - Guardrails obrigatórios na IA.](MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md)
- [BK-MF6-10 - IA não acede a dados de outras turmas ou alunos.](MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md)
- [BK-MF6-11 - Backups diários automáticos.](MF6/BK-MF6-11-backups-diarios-automaticos.md)
- [BK-MF6-12 - Auto-recovery após falhas.](MF6/BK-MF6-12-auto-recovery-apos-falhas.md)

### MF7
- [BK-MF7-01 - Logs estruturados de eventos e erros.](MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md)
- [BK-MF7-02 - Downtime máximo aceitável < 1h/mês.](MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md)
- [BK-MF7-03 - Backend modular por domínios (aluno, professor, IA, materiais).](MF7/BK-MF7-03-backend-modular-por-dominios-aluno-professor-ia-materiais.md)
- [BK-MF7-04 - Frontend componentizado e reutilizável.](MF7/BK-MF7-04-frontend-componentizado-e-reutilizavel.md)
- [BK-MF7-05 - Documentação técnica mínima (modelos, fluxos, endpoints).](MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md)
- [BK-MF7-06 - Testes automatizados para módulos críticos.](MF7/BK-MF7-06-testes-automatizados-para-modulos-criticos.md)
- [BK-MF7-07 - Deploy com rollback.](MF7/BK-MF7-07-deploy-com-rollback.md)
- [BK-MF7-08 - Endpoint de health-check.](MF7/BK-MF7-08-endpoint-de-health-check.md)
- [BK-MF7-09 - IA explica fontes dos conteúdos (páginas/secções).](MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md)
- [BK-MF7-10 - IA respeita perfis distintos (aluno, turma, professor).](MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md)
- [BK-MF7-11 - IA segue limites definidos pelo professor.](MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md)

### MF8
- [BK-MF8-01 - IA evita enviesamentos e respostas inseguras.](MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md)
- [BK-MF8-02 - IA não pode inventar informação factual.](MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md)
- [BK-MF8-03 - IA adapta explicações ao nível do aluno.](MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md)
- [BK-MF8-04 - IA externa segue políticas e filtros próprios.](MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md)
- [BK-MF8-05 - Compatível com Chrome, Edge, Firefox, Safari.](MF8/BK-MF8-05-compativel-com-chrome-edge-firefox-safari.md)
- [BK-MF8-06 - Suporte a importação UTF-8 e PT-PT.](MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md)
- [BK-MF8-07 - Exportação de resumos/quizzes em PDF/MD.](MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md)
- [BK-MF8-08 - Preparado para integrações com Drive/ICS/LMS.](MF8/BK-MF8-08-preparado-para-integracoes-com-drive-ics-lms.md)
- [BK-MF8-09 - Interface em português (Portugal).](MF8/BK-MF8-09-interface-em-portugues-portugal.md)
- [BK-MF8-10 - Datas no formato dd/mm/aaaa.](MF8/BK-MF8-10-datas-no-formato-dd-mm-aaaa.md)
- [BK-MF8-11 - Preparado para futura tradução i18n.](MF8/BK-MF8-11-preparado-para-futura-traducao-i18n.md)

## Changelog
- `2026-04-19`: indice regenerado com naming semantico e layout canónico.
