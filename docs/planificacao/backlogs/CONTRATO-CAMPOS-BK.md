# CONTRATO-CAMPOS-BK

## Header
- `doc_id`: `CONTRATO-CAMPOS-BK`
- `path`: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-07-10`

## Objetivo
Formalizar o contrato de campos BK para eliminar drift entre matriz, backlog, guias e sprints.

## Campos obrigatorios
- `bk_id`: identificador canónico.
- `macro`: macro funcional `MF0..MF8`.
- `owner`: responsavel principal.
- `prioridade`: `P0|P1|P2`.
- `dependencias`: lista de BK predecessores.
- `rf_rnf`: requisitos cobertos.
- `sprint`: janela de sprints de execucao.
- `core_or_reforco`: `P0=>Reforco`, `P1/P2=>Core`.
- `proximo_bk`: recomendacao de handoff.
- `guia_path`: caminho canónico do guia BK.
- `estado`: progresso pedagógico `TODO|DONE`.
- `real_dev_status`: estado independente da implementação de referência:
  `VALIDADO|IMPLEMENTADO_NAO_VALIDADO|PARCIAL|MITIGADO_POR_ESCOPO|BLOQUEADO_OPERADOR|NAO_IMPLEMENTADO|NAO_APLICAVEL`.

## Regras de consistencia
1. `bk_id` existe em matriz, backlog e guia.
2. `owner/prioridade/dependencias/rf_rnf/sprint/core_or_reforco` iguais entre matriz e backlog.
3. `guia_path` aponta para ficheiro existente.
4. Alteracao de contrato exige regeneracao dos anexos no mesmo commit.
5. `estado` nunca é usado para inferir `real_dev_status`, nem o inverso.
6. Todo `real_dev_status` tem evidence, risco residual e condição de reabertura em
   `../ESTADO-REFERENCIA-REAL_DEV.md`; `VALIDADO` exige evidence ligada ao manifesto corrente.

## Tabela canónica de campos
| bk_id | macro | owner | prioridade | dependencias | rf_rnf | sprint | core_or_reforco | proximo_bk | guia_path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF0-01 | MF0 | Natalia | P0 | - | RF01 | S01 | Reforco | BK-MF0-02 | docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-do-aluno-email-password-ou-sso-escolar.md |
| BK-MF0-02 | MF0 | Natalia | P0 | - | RF02 | S01 | Reforco | BK-MF0-03 | docs/planificacao/guias-bk/MF0/BK-MF0-02-login-seguro-com-cookies-httponly.md |
| BK-MF0-03 | MF0 | Guilherme | P1 | BK-MF0-02 | RF03 | S01 | Core | BK-MF0-04 | docs/planificacao/guias-bk/MF0/BK-MF0-03-perfil-editavel-nome-ano-curso-turma.md |
| BK-MF0-04 | MF0 | Natalia | P0 | BK-MF0-03 | RF04 | S01 | Reforco | BK-MF0-05 | docs/planificacao/guias-bk/MF0/BK-MF0-04-o-aluno-pode-estudar-sem-turma.md |
| BK-MF0-05 | MF0 | Guilherme | P1 | BK-MF0-03 | RF05 | S01 | Core | BK-MF0-06 | docs/planificacao/guias-bk/MF0/BK-MF0-05-o-aluno-pode-criar-rotinas-e-objetivos-de-estudo.md |
| BK-MF0-06 | MF0 | Kaua | P1 | BK-MF0-03 | RF06 | S01 | Core | BK-MF0-07 | docs/planificacao/guias-bk/MF0/BK-MF0-06-o-aluno-pode-consultar-historico-de-estudo.md |
| BK-MF0-07 | MF0 | Guilherme | P0 | BK-MF0-03 | RF07 | S01 | Reforco | BK-MF0-08 | docs/planificacao/guias-bk/MF0/BK-MF0-07-criar-areas-de-estudo-auto-disciplina-independente.md |
| BK-MF0-08 | MF0 | Kaua | P0 | BK-MF0-07 | RF08 | S01 | Reforco | BK-MF0-09 | docs/planificacao/guias-bk/MF0/BK-MF0-08-submeter-materiais-pdf-docx-urls-topicos.md |
| BK-MF0-09 | MF0 | Guilherme | P1 | BK-MF0-07 | RF09 | S02 | Core | BK-MF0-10 | docs/planificacao/guias-bk/MF0/BK-MF0-09-associar-estilo-tom-das-aulas-voz-da-ia.md |
| BK-MF0-10 | MF0 | Daniel | P0 | BK-MF0-08 | RF10 | S01 | Reforco | BK-MF0-11 | docs/planificacao/guias-bk/MF0/BK-MF0-10-criar-perfil-ia-da-area-de-estudo.md |
| BK-MF0-11 | MF0 | Natalia | P0 | BK-MF0-08, BK-MF0-10 | RF11 | S02 | Reforco | BK-MF0-12 | docs/planificacao/guias-bk/MF0/BK-MF0-11-obter-resumos-ia-baseados-nos-materiais-enviados.md |
| BK-MF0-12 | MF0 | Natalia | P0 | BK-MF0-11 | RF12 | S02 | Reforco | BK-MF1-01 | docs/planificacao/guias-bk/MF0/BK-MF0-12-obter-explicacoes-cards-e-quizzes-personalizados.md |
| BK-MF1-01 | MF1 | Natalia | P1 | BK-MF0-12 | RF13 | S03 | Core | BK-MF1-02 | docs/planificacao/guias-bk/MF1/BK-MF1-01-a-ia-deve-adaptar-explicacoes-ao-ritmo-dificuldades-do-aluno.md |
| BK-MF1-02 | MF1 | Kaua | P1 | BK-MF0-03 | RF14 | S03 | Core | BK-MF1-03 | docs/planificacao/guias-bk/MF1/BK-MF1-02-criar-salas-de-estudo-com-outros-alunos-livres-ou-por-disciplina.md |
| BK-MF1-03 | MF1 | Guilherme | P1 | BK-MF1-02 | RF15 | S04 | Core | BK-MF1-04 | docs/planificacao/guias-bk/MF1/BK-MF1-03-partilhar-materiais-e-apontamentos-na-sala.md |
| BK-MF1-04 | MF1 | Daniel | P2 | BK-MF1-02, BK-MF1-03 | RF16 | S03 | Core | BK-MF1-07 | docs/planificacao/guias-bk/MF1/BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md |
| BK-MF1-07 | MF1 | Guilherme | P0 | - | RF19 | S03 | Reforco | BK-MF1-08 | docs/planificacao/guias-bk/MF1/BK-MF1-07-criar-turmas.md |
| BK-MF1-08 | MF1 | Natalia | P0 | BK-MF1-07 | RF20 | S03 | Reforco | BK-MF1-09 | docs/planificacao/guias-bk/MF1/BK-MF1-08-criar-disciplinas-e-associa-las-as-turmas.md |
| BK-MF1-09 | MF1 | Kaua | P0 | BK-MF1-08 | RF21 | S03 | Reforco | BK-MF1-10 | docs/planificacao/guias-bk/MF1/BK-MF1-09-submeter-materiais-da-disciplina-versao-oficial.md |
| BK-MF1-10 | MF1 | Natalia | P1 | BK-MF1-09 | RF22 | S03 | Core | BK-MF1-11 | docs/planificacao/guias-bk/MF1/BK-MF1-10-configurar-voz-da-ia-docente.md |
| BK-MF1-11 | MF1 | Natalia | P0 | BK-MF1-10 | RF23 | S03 | Reforco | BK-MF1-12 | docs/planificacao/guias-bk/MF1/BK-MF1-11-o-aluno-inscrito-numa-turma-recebe-versao-limitada-da-ia.md |
| BK-MF1-12 | MF1 | Kaua | P1 | BK-MF1-07 | RF24 | S03 | Core | BK-MF2-01 | docs/planificacao/guias-bk/MF1/BK-MF1-12-professores-podem-enviar-avisos-e-publicacoes.md |
| BK-MF2-01 | MF2 | Guilherme | P2 | BK-MF1-07 | RF25 | S05 | Core | BK-MF2-02 | docs/planificacao/guias-bk/MF2/BK-MF2-01-professores-podem-criar-salas-de-estudo-guiado.md |
| BK-MF2-02 | MF2 | Guilherme | P1 | BK-MF1-07 | RF26 | S05 | Core | BK-MF2-03 | docs/planificacao/guias-bk/MF2/BK-MF2-02-professores-podem-criar-projetos-para-a-turma.md |
| BK-MF2-03 | MF2 | Natalia | P1 | BK-MF2-02 | RF27 | S05 | Core | BK-MF2-04 | docs/planificacao/guias-bk/MF2/BK-MF2-03-a-ia-deve-ajudar-o-aluno-a-elaborar-projetos-de-forma-gradual.md |
| BK-MF2-04 | MF2 | Guilherme | P0 | BK-MF1-08 | RF28 | S05 | Reforco | BK-MF2-05 | docs/planificacao/guias-bk/MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md |
| BK-MF2-05 | MF2 | Kaua | P1 | BK-MF1-09 | RF29 | S05 | Core | BK-MF2-06 | docs/planificacao/guias-bk/MF2/BK-MF2-05-rever-e-aprovar-conteudo-gerado-pela-ia-resumos-quizzes.md |
| BK-MF2-06 | MF2 | Guilherme | P1 | BK-MF1-12 | RF30 | S04 | Core | BK-MF2-07 | docs/planificacao/guias-bk/MF2/BK-MF2-06-painel-com-progresso-dificuldades-e-metricas-da-turma.md |
| BK-MF2-07 | MF2 | Natalia | P0 | BK-MF0-08, BK-MF1-09 | RF31 | S05 | Reforco | BK-MF2-08 | docs/planificacao/guias-bk/MF2/BK-MF2-07-indexacao-automatica-de-pdfs-docx-e-urls.md |
| BK-MF2-08 | MF2 | Kaua | P0 | BK-MF2-07 | RF32 | S05 | Reforco | BK-MF2-09 | docs/planificacao/guias-bk/MF2/BK-MF2-08-extrair-topicos-seccoes-estrutura-e-referencias.md |
| BK-MF2-09 | MF2 | Natalia | P1 | BK-MF2-07 | RF33 | S05 | Core | BK-MF2-10 | docs/planificacao/guias-bk/MF2/BK-MF2-09-manter-versoes-dos-materiais.md |
| BK-MF2-10 | MF2 | Daniel | P0 | BK-MF2-07 | RF34 | S05 | Reforco | BK-MF2-11 | docs/planificacao/guias-bk/MF2/BK-MF2-10-separar-materiais-entre-aluno-professor-e-turma.md |
| BK-MF2-11 | MF2 | Guilherme | P0 | BK-MF0-10 | RF35 | S04 | Reforco | BK-MF2-12 | docs/planificacao/guias-bk/MF2/BK-MF2-11-assistente-ia-privado-por-area-de-estudo.md |
| BK-MF2-12 | MF2 | Natalia | P0 | BK-MF1-10 | RF36 | S05 | Reforco | BK-MF3-01 | docs/planificacao/guias-bk/MF2/BK-MF2-12-assistente-ia-da-disciplina-turma-com-voz-docente.md |
| BK-MF3-01 | MF3 | Natalia | P0 | BK-MF2-11 | RF37 | S07 | Reforco | BK-MF3-02 | docs/planificacao/guias-bk/MF3/BK-MF3-01-guardrails-distintos-para-aluno-solo-grupo-e-turma.md |
| BK-MF3-02 | MF3 | Natalia | P0 | BK-MF2-07 | RF38 | S07 | Reforco | BK-MF3-03 | docs/planificacao/guias-bk/MF3/BK-MF3-02-ia-nao-pode-inventar-conteudo-citacoes-obrigatorias.md |
| BK-MF3-03 | MF3 | Kaua | P1 | BK-MF2-11 | RF39 | S07 | Core | BK-MF3-04 | docs/planificacao/guias-bk/MF3/BK-MF3-03-ia-pode-recorrer-a-conhecimento-externo-limitado-quando-permitido.md |
| BK-MF3-04 | MF3 | Guilherme | P1 | BK-MF1-01 | RF40 | S06 | Core | BK-MF3-05 | docs/planificacao/guias-bk/MF3/BK-MF3-04-ia-deve-ajustar-explicacoes-ao-perfil-do-aluno.md |
| BK-MF3-05 | MF3 | Natalia | P1 | BK-MF1-02 | RF41 | S06 | Core | BK-MF3-06 | docs/planificacao/guias-bk/MF3/BK-MF3-05-criar-grupos-de-estudo.md |
| BK-MF3-06 | MF3 | Guilherme | P1 | BK-MF3-05 | RF42 | S06 | Core | BK-MF3-07 | docs/planificacao/guias-bk/MF3/BK-MF3-06-chat-partilha-e-notas-coletivas.md |
| BK-MF3-07 | MF3 | Guilherme | P2 | BK-MF3-05 | RF43 | S06 | Core | BK-MF3-08 | docs/planificacao/guias-bk/MF3/BK-MF3-07-agendar-sessoes-de-estudo-coletivo.md |
| BK-MF3-08 | MF3 | Daniel | P2 | BK-MF3-05 | RF44 | S06 | Core | BK-MF3-09 | docs/planificacao/guias-bk/MF3/BK-MF3-08-ia-coletiva-para-sessoes-de-grupo.md |
| BK-MF3-09 | MF3 | Guilherme | P0 | BK-MF2-07 | RF45 | S07 | Reforco | BK-MF3-10 | docs/planificacao/guias-bk/MF3/BK-MF3-09-pesquisa-unificada-por-topico-conceito-material.md |
| BK-MF3-10 | MF3 | Guilherme | P1 | BK-MF2-07 | RF46 | S07 | Core | BK-MF3-11 | docs/planificacao/guias-bk/MF3/BK-MF3-10-navegacao-por-programa-curriculo.md |
| BK-MF3-11 | MF3 | Natalia | P1 | BK-MF0-02 | RF47 | S06 | Core | BK-MF3-12 | docs/planificacao/guias-bk/MF3/BK-MF3-11-configurar-preferencias-de-notificacoes-email-push-app-por-contexto.md |
| BK-MF3-12 | MF3 | Daniel | P1 | BK-MF0-05 | RF48 | S06 | Core | BK-MF4-01 | docs/planificacao/guias-bk/MF3/BK-MF3-12-alertar-alunos-sobre-rotinas-objetivos-e-sessoes-de-estudo-agendadas.md |
| BK-MF4-01 | MF4 | Kaua | P1 | BK-MF1-12 | RF49 | S06 | Core | BK-MF4-02 | docs/planificacao/guias-bk/MF4/BK-MF4-01-notificar-grupos-turmas-sobre-novos-materiais-feedback-e-tarefas.md |
| BK-MF4-02 | MF4 | Guilherme | P1 | BK-MF2-11 | RF50 | S07 | Core | BK-MF4-03 | docs/planificacao/guias-bk/MF4/BK-MF4-02-professores-definem-alertas-de-acompanhamento-ex-aluno-inativo-x-dias.md |
| BK-MF4-03 | MF4 | Natalia | P1 | BK-MF4-02 | RF51 | S07 | Core | BK-MF4-04 | docs/planificacao/guias-bk/MF4/BK-MF4-03-administradores-configuram-canais-e-quotas-maximas-de-notificacoes.md |
| BK-MF4-04 | MF4 | Kaua | P0 | - | RF52 | S08 | Reforco | BK-MF4-05 | docs/planificacao/guias-bk/MF4/BK-MF4-04-exportar-dados-pessoais.md |
| BK-MF4-05 | MF4 | Daniel | P0 | - | RF53 | S08 | Reforco | BK-MF4-06 | docs/planificacao/guias-bk/MF4/BK-MF4-05-eliminar-conta-e-dados.md |
| BK-MF4-06 | MF4 | Guilherme | P0 | - | RF54 | S08 | Reforco | BK-MF4-07 | docs/planificacao/guias-bk/MF4/BK-MF4-06-gestao-de-consentimentos-para-ia.md |
| BK-MF4-07 | MF4 | Kaua | P0 | BK-MF0-04 | RF55 | S02 | Reforco | BK-MF4-08 | docs/planificacao/guias-bk/MF4/BK-MF4-07-gestao-de-utilizadores-e-papeis.md |
| BK-MF4-08 | MF4 | Natalia | P0 | BK-MF4-07 | RF56 | S06 | Reforco | BK-MF4-09 | docs/planificacao/guias-bk/MF4/BK-MF4-08-auditoria-completa-materiais-ia-papeis.md |
| BK-MF4-09 | MF4 | Kaua | P1 | BK-MF2-11 | RF57 | S07 | Core | BK-MF4-10 | docs/planificacao/guias-bk/MF4/BK-MF4-09-configurar-modelos-de-ia-e-limites-de-uso.md |
| BK-MF4-10 | MF4 | Natalia | P1 | BK-MF4-09 | RF58 | S08 | Core | BK-MF5-01 | docs/planificacao/guias-bk/MF4/BK-MF4-10-definir-quotas-de-ia-por-aluno-turma-grupo-e-monitorizar-consumo.md |
| BK-MF5-01 | MF5 | Daniel | P1 | - | RF61 | S09 | Core | BK-MF5-03 | docs/planificacao/guias-bk/MF5/BK-MF5-01-integracao-com-drives-google-onedrive-para-importacao-unidirecional-de-materiais-de-estudo.md |
| BK-MF5-03 | MF5 | Guilherme | P0 | - | RNF01 | S09 | Reforco | BK-MF5-04 | docs/planificacao/guias-bk/MF5/BK-MF5-03-interface-intuitiva-e-clara-para-alunos-e-professores.md |
| BK-MF5-04 | MF5 | Kaua | P0 | - | RNF02 | S09 | Reforco | BK-MF5-05 | docs/planificacao/guias-bk/MF5/BK-MF5-04-layout-responsivo-para-desktop-tablet-mobile.md |
| BK-MF5-05 | MF5 | Natalia | P0 | - | RNF03 | S09 | Reforco | BK-MF5-06 | docs/planificacao/guias-bk/MF5/BK-MF5-05-feedback-imediato-em-acoes-guardar-ia-uploads.md |
| BK-MF5-06 | MF5 | Kaua | P1 | - | RNF04 | S08 | Core | BK-MF5-07 | docs/planificacao/guias-bk/MF5/BK-MF5-06-navegacao-consistente-entre-modulos.md |
| BK-MF5-07 | MF5 | Natalia | P1 | - | RNF05 | S08 | Core | BK-MF5-08 | docs/planificacao/guias-bk/MF5/BK-MF5-07-regras-basicas-de-acessibilidade-contraste-labels.md |
| BK-MF5-08 | MF5 | Guilherme | P0 | - | RNF06 | S08 | Reforco | BK-MF5-09 | docs/planificacao/guias-bk/MF5/BK-MF5-08-validacao-completa-de-formularios-antes-de-submissao.md |
| BK-MF5-09 | MF5 | Daniel | P1 | - | RNF07 | S11 | Core | BK-MF5-10 | docs/planificacao/guias-bk/MF5/BK-MF5-09-notificacoes-discretas-e-contextualizadas.md |
| BK-MF5-10 | MF5 | Guilherme | P0 | - | RNF08 | S09 | Reforco | BK-MF5-11 | docs/planificacao/guias-bk/MF5/BK-MF5-10-dashboards-e-estudo-carregam-em-2s.md |
| BK-MF5-11 | MF5 | Kaua | P1 | - | RNF09 | S07 | Core | BK-MF5-12 | docs/planificacao/guias-bk/MF5/BK-MF5-11-respostas-da-ia-devem-surgir-em-4s.md |
| BK-MF5-12 | MF5 | Guilherme | P1 | - | RNF10 | S10 | Core | BK-MF6-01 | docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md |
| BK-MF6-01 | MF6 | Natalia | P0 | - | RNF11 | S10 | Reforco | BK-MF6-02 | docs/planificacao/guias-bk/MF6/BK-MF6-01-indexacao-de-documentos-deve-ser-assincrona-e-nao-bloquear-ui.md |
| BK-MF6-02 | MF6 | Daniel | P1 | - | RNF12 | S11 | Core | BK-MF6-03 | docs/planificacao/guias-bk/MF6/BK-MF6-02-geracao-de-quizzes-em-background-quando-necessario.md |
| BK-MF6-03 | MF6 | Natalia | P2 | - | RNF13 | S08 | Core | BK-MF6-04 | docs/planificacao/guias-bk/MF6/BK-MF6-03-arquitetura-preparada-para-escalar-horizontalmente.md |
| BK-MF6-04 | MF6 | Guilherme | P0 | - | RNF14 | S10 | Reforco | BK-MF6-05 | docs/planificacao/guias-bk/MF6/BK-MF6-04-https-obrigatorio-tls-1-2.md |
| BK-MF6-05 | MF6 | Kaua | P0 | - | RNF15 | S10 | Reforco | BK-MF6-06 | docs/planificacao/guias-bk/MF6/BK-MF6-05-passwords-com-hashing-seguro-bcrypt-argon2.md |
| BK-MF6-06 | MF6 | Natalia | P0 | - | RNF16 | S10 | Reforco | BK-MF6-07 | docs/planificacao/guias-bk/MF6/BK-MF6-06-sessoes-com-cookies-httponly-secure-samesite.md |
| BK-MF6-07 | MF6 | Daniel | P0 | - | RNF17 | S10 | Reforco | BK-MF6-08 | docs/planificacao/guias-bk/MF6/BK-MF6-07-protecoes-contra-xss-csrf-injection-brute-force.md |
| BK-MF6-08 | MF6 | Natalia | P0 | - | RNF18 | S10 | Reforco | BK-MF6-09 | docs/planificacao/guias-bk/MF6/BK-MF6-08-processamento-de-documentos-em-sandbox-seguro.md |
| BK-MF6-09 | MF6 | Natalia | P0 | - | RNF19 | S09 | Reforco | BK-MF6-10 | docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md |
| BK-MF6-10 | MF6 | Natalia | P0 | - | RNF20 | S09 | Reforco | BK-MF6-11 | docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md |
| BK-MF6-11 | MF6 | Kaua | P1 | - | RNF21 | S10 | Core | BK-MF6-12 | docs/planificacao/guias-bk/MF6/BK-MF6-11-backups-diarios-automaticos.md |
| BK-MF6-12 | MF6 | Kaua | P1 | - | RNF22 | S09 | Core | BK-MF7-01 | docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md |
| BK-MF7-01 | MF7 | Kaua | P0 | - | RNF23 | S11 | Reforco | BK-MF7-02 | docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md |
| BK-MF7-02 | MF7 | Guilherme | P2 | - | RNF24 | S10 | Core | BK-MF7-03 | docs/planificacao/guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md |
| BK-MF7-03 | MF7 | Natalia | P0 | - | RNF25 | S11 | Reforco | BK-MF7-04 | docs/planificacao/guias-bk/MF7/BK-MF7-03-backend-modular-por-dominios-aluno-professor-ia-materiais.md |
| BK-MF7-04 | MF7 | Guilherme | P0 | - | RNF26 | S11 | Reforco | BK-MF7-05 | docs/planificacao/guias-bk/MF7/BK-MF7-04-frontend-componentizado-e-reutilizavel.md |
| BK-MF7-05 | MF7 | Guilherme | P1 | - | RNF27 | S06 | Core | BK-MF7-06 | docs/planificacao/guias-bk/MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md |
| BK-MF7-06 | MF7 | Natalia | P1 | - | RNF28 | S07 | Core | BK-MF7-07 | docs/planificacao/guias-bk/MF7/BK-MF7-06-testes-automatizados-para-modulos-criticos.md |
| BK-MF7-07 | MF7 | Daniel | P1 | - | RNF29 | S12 | Core | BK-MF7-08 | docs/planificacao/guias-bk/MF7/BK-MF7-07-deploy-com-rollback.md |
| BK-MF7-08 | MF7 | Kaua | P1 | - | RNF30 | S12 | Core | BK-MF7-09 | docs/planificacao/guias-bk/MF7/BK-MF7-08-endpoint-de-health-check.md |
| BK-MF7-09 | MF7 | Kaua | P0 | - | RNF31 | S12 | Reforco | BK-MF7-10 | docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md |
| BK-MF7-10 | MF7 | Natalia | P0 | - | RNF32 | S12 | Reforco | BK-MF7-11 | docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md |
| BK-MF7-11 | MF7 | Guilherme | P0 | - | RNF33 | S12 | Reforco | BK-MF8-01 | docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md |
| BK-MF8-01 | MF8 | Natalia | P0 | - | RNF34 | S12 | Reforco | BK-MF8-02 | docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md |
| BK-MF8-02 | MF8 | Natalia | P0 | - | RNF35 | S11 | Reforco | BK-MF8-03 | docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md |
| BK-MF8-03 | MF8 | Daniel | P1 | - | RNF36 | S12 | Core | BK-MF8-04 | docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md |
| BK-MF8-04 | MF8 | Kaua | P0 | - | RNF37 | S11 | Reforco | BK-MF8-05 | docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md |
| BK-MF8-05 | MF8 | Guilherme | P0 | - | RNF38 | S12 | Reforco | BK-MF8-06 | docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md |
| BK-MF8-06 | MF8 | Kaua | P0 | - | RNF39 | S12 | Reforco | BK-MF8-07 | docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md |
| BK-MF8-07 | MF8 | Kaua | P1 | - | RNF40 | S12 | Core | BK-MF8-08 | docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md |
| BK-MF8-08 | MF8 | Daniel | P0 | - | RNF43 | S12 | Reforco | BK-MF8-09 | docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md |
| BK-MF8-09 | MF8 | Kaua | P2 | - | RNF44 | S12 | Core | BK-MF8-10 | docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md |
| BK-MF8-10 | MF8 | Guilherme | P1 | BK-MF1-04 | RF16, RF42, RNF20, RNF23 | S12 | Core | BK-MF8-11 | docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md |
| BK-MF8-11 | MF8 | Natalia | P1 | BK-MF8-10 | RF16, RF42, RNF20 | S12 | Core | BK-MF8-12 | docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md |
| BK-MF8-12 | MF8 | Guilherme | P0 | BK-MF2-04 | RF28 | S12 | Reforco | BK-MF8-13 | docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md |
| BK-MF8-13 | MF8 | Natalia | P1 | BK-MF8-12 | RF28, RF30 | S12 | Core | BK-MF8-14 | docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md |
| BK-MF8-14 | MF8 | Daniel | P1 | BK-MF0-12 | RF12 | S12 | Core | BK-MF8-15 | docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md |
| BK-MF8-15 | MF8 | Natalia | P0 | BK-MF8-14 | RNF41 | S12 | Reforco | BK-MF8-16 | docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md |
| BK-MF8-16 | MF8 | Guilherme | P0 | BK-MF8-15 | RNF42 | S12 | Reforco | BK-MF8-17 | docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md |
| BK-MF8-17 | MF8 | Daniel | P0 | BK-MF8-16 | RNF45 | S12 | Reforco | - | docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md |
## Changelog
- `2026-06-30`: contrato atualizado com owners MF8 redistribuidos para carga equilibrada.
- `2026-04-19`: contrato de campos BK criado para governanca canónica StudyFlow.
