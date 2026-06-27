# ANEXO-BK-SPRINT-OWNER

## Header
- `doc_id`: `ANEXO-BK-SPRINT-OWNER`
- `path`: `docs/planificacao/backlogs/ANEXO-BK-SPRINT-OWNER.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-05-31`

## Objetivo
Rastreabilidade operacional `BK -> Sprint -> Owner` com contrato `Core/Reforco`.

## Mapeamento canónico
| bk_id | macro | sprint | owner | apoio | prioridade | core_or_reforco | rf_rnf | dependencias | guia_path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF0-01 | MF0 | S01 | Natalia | Guilherme | P0 | Reforco | RF01 | - | docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-do-aluno-email-password-ou-sso-escolar.md |
| BK-MF0-02 | MF0 | S01 | Natalia | Guilherme | P0 | Reforco | RF02 | - | docs/planificacao/guias-bk/MF0/BK-MF0-02-login-seguro-com-cookies-httponly.md |
| BK-MF0-03 | MF0 | S01 | Guilherme | Natalia | P1 | Core | RF03 | BK-MF0-02 | docs/planificacao/guias-bk/MF0/BK-MF0-03-perfil-editavel-nome-ano-curso-turma.md |
| BK-MF0-04 | MF0 | S01 | Natalia | Guilherme | P0 | Reforco | RF04 | BK-MF0-03 | docs/planificacao/guias-bk/MF0/BK-MF0-04-o-aluno-pode-estudar-sem-turma.md |
| BK-MF0-05 | MF0 | S01 | Guilherme | Natalia | P1 | Core | RF05 | BK-MF0-03 | docs/planificacao/guias-bk/MF0/BK-MF0-05-o-aluno-pode-criar-rotinas-e-objetivos-de-estudo.md |
| BK-MF0-06 | MF0 | S01 | Kaua | Guilherme | P1 | Core | RF06 | BK-MF0-03 | docs/planificacao/guias-bk/MF0/BK-MF0-06-o-aluno-pode-consultar-historico-de-estudo.md |
| BK-MF0-07 | MF0 | S01 | Guilherme | Guilherme | P0 | Reforco | RF07 | BK-MF0-03 | docs/planificacao/guias-bk/MF0/BK-MF0-07-criar-areas-de-estudo-auto-disciplina-independente.md |
| BK-MF0-08 | MF0 | S01 | Kaua | Guilherme | P0 | Reforco | RF08 | BK-MF0-07 | docs/planificacao/guias-bk/MF0/BK-MF0-08-submeter-materiais-pdf-docx-urls-topicos.md |
| BK-MF0-09 | MF0 | S02 | Guilherme | Natalia | P1 | Core | RF09 | BK-MF0-07 | docs/planificacao/guias-bk/MF0/BK-MF0-09-associar-estilo-tom-das-aulas-voz-da-ia.md |
| BK-MF0-10 | MF0 | S01 | Daniel | Guilherme | P0 | Reforco | RF10 | BK-MF0-08 | docs/planificacao/guias-bk/MF0/BK-MF0-10-criar-perfil-ia-da-area-de-estudo.md |
| BK-MF0-11 | MF0 | S02 | Natalia | Guilherme | P0 | Reforco | RF11 | BK-MF0-08, BK-MF0-10 | docs/planificacao/guias-bk/MF0/BK-MF0-11-obter-resumos-ia-baseados-nos-materiais-enviados.md |
| BK-MF0-12 | MF0 | S02 | Natalia | Guilherme | P0 | Reforco | RF12 | BK-MF0-11 | docs/planificacao/guias-bk/MF0/BK-MF0-12-obter-explicacoes-cards-e-quizzes-personalizados.md |
| BK-MF1-01 | MF1 | S03 | Natalia | Guilherme | P1 | Core | RF13 | BK-MF0-12 | docs/planificacao/guias-bk/MF1/BK-MF1-01-a-ia-deve-adaptar-explicacoes-ao-ritmo-dificuldades-do-aluno.md |
| BK-MF1-02 | MF1 | S03 | Kaua | Guilherme | P1 | Core | RF14 | BK-MF0-03 | docs/planificacao/guias-bk/MF1/BK-MF1-02-criar-salas-de-estudo-com-outros-alunos-livres-ou-por-disciplina.md |
| BK-MF1-03 | MF1 | S04 | Guilherme | Natalia | P1 | Core | RF15 | BK-MF1-02 | docs/planificacao/guias-bk/MF1/BK-MF1-03-partilhar-materiais-e-apontamentos-na-sala.md |
| BK-MF1-04 | MF1 | S03 | Daniel | Kaua | P2 | Core | RF16 | BK-MF1-02, BK-MF1-03 | docs/planificacao/guias-bk/MF1/BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md |
| BK-MF1-07 | MF1 | S03 | Guilherme | Natalia | P0 | Reforco | RF19 | - | docs/planificacao/guias-bk/MF1/BK-MF1-07-criar-turmas.md |
| BK-MF1-08 | MF1 | S03 | Natalia | Guilherme | P0 | Reforco | RF20 | BK-MF1-07 | docs/planificacao/guias-bk/MF1/BK-MF1-08-criar-disciplinas-e-associa-las-as-turmas.md |
| BK-MF1-09 | MF1 | S03 | Kaua | Natalia | P0 | Reforco | RF21 | BK-MF1-08 | docs/planificacao/guias-bk/MF1/BK-MF1-09-submeter-materiais-da-disciplina-versao-oficial.md |
| BK-MF1-10 | MF1 | S03 | Natalia | Guilherme | P1 | Core | RF22 | BK-MF1-09 | docs/planificacao/guias-bk/MF1/BK-MF1-10-configurar-voz-da-ia-docente.md |
| BK-MF1-11 | MF1 | S03 | Natalia | Guilherme | P0 | Reforco | RF23 | BK-MF1-10 | docs/planificacao/guias-bk/MF1/BK-MF1-11-o-aluno-inscrito-numa-turma-recebe-versao-limitada-da-ia.md |
| BK-MF1-12 | MF1 | S03 | Kaua | Guilherme | P1 | Core | RF24 | BK-MF1-07 | docs/planificacao/guias-bk/MF1/BK-MF1-12-professores-podem-enviar-avisos-e-publicacoes.md |
| BK-MF2-01 | MF2 | S05 | Guilherme | Natalia | P2 | Core | RF25 | BK-MF1-07 | docs/planificacao/guias-bk/MF2/BK-MF2-01-professores-podem-criar-salas-de-estudo-guiado.md |
| BK-MF2-02 | MF2 | S05 | Guilherme | Natalia | P1 | Core | RF26 | BK-MF1-07 | docs/planificacao/guias-bk/MF2/BK-MF2-02-professores-podem-criar-projetos-para-a-turma.md |
| BK-MF2-03 | MF2 | S05 | Natalia | Guilherme | P1 | Core | RF27 | BK-MF2-02 | docs/planificacao/guias-bk/MF2/BK-MF2-03-a-ia-deve-ajudar-o-aluno-a-elaborar-projetos-de-forma-gradual.md |
| BK-MF2-04 | MF2 | S05 | Guilherme | Natalia | P0 | Reforco | RF28 | BK-MF1-08 | docs/planificacao/guias-bk/MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md |
| BK-MF2-05 | MF2 | S05 | Kaua | Guilherme | P1 | Core | RF29 | BK-MF1-09 | docs/planificacao/guias-bk/MF2/BK-MF2-05-rever-e-aprovar-conteudo-gerado-pela-ia-resumos-quizzes.md |
| BK-MF2-06 | MF2 | S04 | Guilherme | Natalia | P1 | Core | RF30 | BK-MF1-12 | docs/planificacao/guias-bk/MF2/BK-MF2-06-painel-com-progresso-dificuldades-e-metricas-da-turma.md |
| BK-MF2-07 | MF2 | S05 | Natalia | Guilherme | P0 | Reforco | RF31 | BK-MF0-08, BK-MF1-09 | docs/planificacao/guias-bk/MF2/BK-MF2-07-indexacao-automatica-de-pdfs-docx-e-urls.md |
| BK-MF2-08 | MF2 | S05 | Kaua | Natalia | P0 | Reforco | RF32 | BK-MF2-07 | docs/planificacao/guias-bk/MF2/BK-MF2-08-extrair-topicos-seccoes-estrutura-e-referencias.md |
| BK-MF2-09 | MF2 | S05 | Natalia | Guilherme | P1 | Core | RF33 | BK-MF2-07 | docs/planificacao/guias-bk/MF2/BK-MF2-09-manter-versoes-dos-materiais.md |
| BK-MF2-10 | MF2 | S05 | Daniel | Guilherme | P0 | Reforco | RF34 | BK-MF2-07 | docs/planificacao/guias-bk/MF2/BK-MF2-10-separar-materiais-entre-aluno-professor-e-turma.md |
| BK-MF2-11 | MF2 | S04 | Guilherme | Natalia | P0 | Reforco | RF35 | BK-MF0-10 | docs/planificacao/guias-bk/MF2/BK-MF2-11-assistente-ia-privado-por-area-de-estudo.md |
| BK-MF2-12 | MF2 | S05 | Natalia | Guilherme | P0 | Reforco | RF36 | BK-MF1-10 | docs/planificacao/guias-bk/MF2/BK-MF2-12-assistente-ia-da-disciplina-turma-com-voz-docente.md |
| BK-MF3-01 | MF3 | S07 | Natalia | Natalia | P0 | Reforco | RF37 | BK-MF2-11 | docs/planificacao/guias-bk/MF3/BK-MF3-01-guardrails-distintos-para-aluno-solo-grupo-e-turma.md |
| BK-MF3-02 | MF3 | S07 | Natalia | Guilherme | P0 | Reforco | RF38 | BK-MF2-07 | docs/planificacao/guias-bk/MF3/BK-MF3-02-ia-nao-pode-inventar-conteudo-citacoes-obrigatorias.md |
| BK-MF3-03 | MF3 | S07 | Kaua | Guilherme | P1 | Core | RF39 | BK-MF2-11 | docs/planificacao/guias-bk/MF3/BK-MF3-03-ia-pode-recorrer-a-conhecimento-externo-limitado-quando-permitido.md |
| BK-MF3-04 | MF3 | S06 | Guilherme | Natalia | P1 | Core | RF40 | BK-MF1-01 | docs/planificacao/guias-bk/MF3/BK-MF3-04-ia-deve-ajustar-explicacoes-ao-perfil-do-aluno.md |
| BK-MF3-05 | MF3 | S06 | Natalia | Guilherme | P1 | Core | RF41 | BK-MF1-02 | docs/planificacao/guias-bk/MF3/BK-MF3-05-criar-grupos-de-estudo.md |
| BK-MF3-06 | MF3 | S06 | Guilherme | Guilherme | P1 | Core | RF42 | BK-MF3-05 | docs/planificacao/guias-bk/MF3/BK-MF3-06-chat-partilha-e-notas-coletivas.md |
| BK-MF3-07 | MF3 | S06 | Guilherme | Guilherme | P2 | Core | RF43 | BK-MF3-05 | docs/planificacao/guias-bk/MF3/BK-MF3-07-agendar-sessoes-de-estudo-coletivo.md |
| BK-MF3-08 | MF3 | S06 | Daniel | Kaua | P2 | Core | RF44 | BK-MF3-05 | docs/planificacao/guias-bk/MF3/BK-MF3-08-ia-coletiva-para-sessoes-de-grupo.md |
| BK-MF3-09 | MF3 | S07 | Guilherme | Natalia | P0 | Reforco | RF45 | BK-MF2-07 | docs/planificacao/guias-bk/MF3/BK-MF3-09-pesquisa-unificada-por-topico-conceito-material.md |
| BK-MF3-10 | MF3 | S07 | Guilherme | Natalia | P1 | Core | RF46 | BK-MF2-07 | docs/planificacao/guias-bk/MF3/BK-MF3-10-navegacao-por-programa-curriculo.md |
| BK-MF3-11 | MF3 | S06 | Natalia | Guilherme | P1 | Core | RF47 | BK-MF0-02 | docs/planificacao/guias-bk/MF3/BK-MF3-11-configurar-preferencias-de-notificacoes-email-push-app-por-contexto.md |
| BK-MF3-12 | MF3 | S06 | Daniel | Kaua | P1 | Core | RF48 | BK-MF0-05 | docs/planificacao/guias-bk/MF3/BK-MF3-12-alertar-alunos-sobre-rotinas-objetivos-e-sessoes-de-estudo-agendadas.md |
| BK-MF4-01 | MF4 | S06 | Kaua | Guilherme | P1 | Core | RF49 | BK-MF1-12 | docs/planificacao/guias-bk/MF4/BK-MF4-01-notificar-grupos-turmas-sobre-novos-materiais-feedback-e-tarefas.md |
| BK-MF4-02 | MF4 | S07 | Guilherme | Natalia | P1 | Core | RF50 | BK-MF2-11 | docs/planificacao/guias-bk/MF4/BK-MF4-02-professores-definem-alertas-de-acompanhamento-ex-aluno-inativo-x-dias.md |
| BK-MF4-03 | MF4 | S07 | Natalia | Guilherme | P1 | Core | RF51 | BK-MF4-02 | docs/planificacao/guias-bk/MF4/BK-MF4-03-administradores-configuram-canais-e-quotas-maximas-de-notificacoes.md |
| BK-MF4-04 | MF4 | S08 | Kaua | Guilherme | P0 | Reforco | RF52 | - | docs/planificacao/guias-bk/MF4/BK-MF4-04-exportar-dados-pessoais.md |
| BK-MF4-05 | MF4 | S08 | Natalia | Guilherme | P0 | Reforco | RF53 | - | docs/planificacao/guias-bk/MF4/BK-MF4-05-eliminar-conta-e-dados.md |
| BK-MF4-06 | MF4 | S08 | Guilherme | Natalia | P0 | Reforco | RF54 | - | docs/planificacao/guias-bk/MF4/BK-MF4-06-gestao-de-consentimentos-para-ia.md |
| BK-MF4-07 | MF4 | S02 | Kaua | Guilherme | P0 | Reforco | RF55 | BK-MF0-04 | docs/planificacao/guias-bk/MF4/BK-MF4-07-gestao-de-utilizadores-e-papeis.md |
| BK-MF4-08 | MF4 | S06 | Natalia | Guilherme | P0 | Reforco | RF56 | BK-MF4-07 | docs/planificacao/guias-bk/MF4/BK-MF4-08-auditoria-completa-materiais-ia-papeis.md |
| BK-MF4-09 | MF4 | S07 | Kaua | Kaua | P1 | Core | RF57 | BK-MF2-11 | docs/planificacao/guias-bk/MF4/BK-MF4-09-configurar-modelos-de-ia-e-limites-de-uso.md |
| BK-MF4-10 | MF4 | S07 | Kaua | Guilherme | P1 | Core | RF58 | BK-MF4-09 | docs/planificacao/guias-bk/MF4/BK-MF4-10-definir-quotas-de-ia-por-aluno-turma-grupo-e-monitorizar-consumo.md |
| BK-MF5-01 | MF5 | S08 | Daniel | Kaua | P1 | Core | RF61 | - | docs/planificacao/guias-bk/MF5/BK-MF5-01-integracao-com-drives-google-onedrive-para-importacao-unidirecional-de-materiais-de-estudo.md |
| BK-MF5-03 | MF5 | S09 | Guilherme | Natalia | P0 | Reforco | RNF01 | - | docs/planificacao/guias-bk/MF5/BK-MF5-03-interface-intuitiva-e-clara-para-alunos-e-professores.md |
| BK-MF5-04 | MF5 | S09 | Kaua | Guilherme | P0 | Reforco | RNF02 | - | docs/planificacao/guias-bk/MF5/BK-MF5-04-layout-responsivo-para-desktop-tablet-mobile.md |
| BK-MF5-05 | MF5 | S09 | Natalia | Guilherme | P0 | Reforco | RNF03 | - | docs/planificacao/guias-bk/MF5/BK-MF5-05-feedback-imediato-em-acoes-guardar-ia-uploads.md |
| BK-MF5-06 | MF5 | S08 | Daniel | Natalia | P1 | Core | RNF04 | - | docs/planificacao/guias-bk/MF5/BK-MF5-06-navegacao-consistente-entre-modulos.md |
| BK-MF5-07 | MF5 | S08 | Natalia | Guilherme | P1 | Core | RNF05 | - | docs/planificacao/guias-bk/MF5/BK-MF5-07-regras-basicas-de-acessibilidade-contraste-labels.md |
| BK-MF5-08 | MF5 | S08 | Guilherme | Natalia | P0 | Reforco | RNF06 | - | docs/planificacao/guias-bk/MF5/BK-MF5-08-validacao-completa-de-formularios-antes-de-submissao.md |
| BK-MF5-09 | MF5 | S10 | Daniel | Kaua | P1 | Core | RNF07 | - | docs/planificacao/guias-bk/MF5/BK-MF5-09-notificacoes-discretas-e-contextualizadas.md |
| BK-MF5-10 | MF5 | S09 | Daniel | Guilherme | P0 | Reforco | RNF08 | - | docs/planificacao/guias-bk/MF5/BK-MF5-10-dashboards-e-estudo-carregam-em-2s.md |
| BK-MF5-11 | MF5 | S08 | Kaua | Guilherme | P1 | Core | RNF09 | - | docs/planificacao/guias-bk/MF5/BK-MF5-11-respostas-da-ia-devem-surgir-em-4s.md |
| BK-MF5-12 | MF5 | S09 | Guilherme | Natalia | P1 | Core | RNF10 | - | docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md |
| BK-MF6-01 | MF6 | S10 | Natalia | Guilherme | P0 | Reforco | RNF11 | - | docs/planificacao/guias-bk/MF6/BK-MF6-01-indexacao-de-documentos-deve-ser-assincrona-e-nao-bloquear-ui.md |
| BK-MF6-02 | MF6 | S10 | Daniel | Guilherme | P1 | Core | RNF12 | - | docs/planificacao/guias-bk/MF6/BK-MF6-02-geracao-de-quizzes-em-background-quando-necessario.md |
| BK-MF6-03 | MF6 | S08 | Natalia | Guilherme | P2 | Core | RNF13 | - | docs/planificacao/guias-bk/MF6/BK-MF6-03-arquitetura-preparada-para-escalar-horizontalmente.md |
| BK-MF6-04 | MF6 | S10 | Guilherme | Natalia | P0 | Reforco | RNF14 | - | docs/planificacao/guias-bk/MF6/BK-MF6-04-https-obrigatorio-tls-1-2.md |
| BK-MF6-05 | MF6 | S10 | Kaua | Guilherme | P0 | Reforco | RNF15 | - | docs/planificacao/guias-bk/MF6/BK-MF6-05-passwords-com-hashing-seguro-bcrypt-argon2.md |
| BK-MF6-06 | MF6 | S10 | Natalia | Guilherme | P0 | Reforco | RNF16 | - | docs/planificacao/guias-bk/MF6/BK-MF6-06-sessoes-com-cookies-httponly-secure-samesite.md |
| BK-MF6-07 | MF6 | S10 | Guilherme | Natalia | P0 | Reforco | RNF17 | - | docs/planificacao/guias-bk/MF6/BK-MF6-07-protecoes-contra-xss-csrf-injection-brute-force.md |
| BK-MF6-08 | MF6 | S10 | Natalia | Guilherme | P0 | Reforco | RNF18 | - | docs/planificacao/guias-bk/MF6/BK-MF6-08-processamento-de-documentos-em-sandbox-seguro.md |
| BK-MF6-09 | MF6 | S09 | Natalia | Guilherme | P0 | Reforco | RNF19 | - | docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md |
| BK-MF6-10 | MF6 | S09 | Natalia | Natalia | P0 | Reforco | RNF20 | - | docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md |
| BK-MF6-11 | MF6 | S10 | Kaua | Kaua | P1 | Core | RNF21 | - | docs/planificacao/guias-bk/MF6/BK-MF6-11-backups-diarios-automaticos.md |
| BK-MF6-12 | MF6 | S09 | Kaua | Guilherme | P1 | Core | RNF22 | - | docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md |
| BK-MF7-01 | MF7 | S11 | Kaua | Guilherme | P0 | Reforco | RNF23 | - | docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md |
| BK-MF7-02 | MF7 | S10 | Guilherme | Natalia | P2 | Core | RNF24 | - | docs/planificacao/guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md |
| BK-MF7-03 | MF7 | S11 | Natalia | Guilherme | P0 | Reforco | RNF25 | - | docs/planificacao/guias-bk/MF7/BK-MF7-03-backend-modular-por-dominios-aluno-professor-ia-materiais.md |
| BK-MF7-04 | MF7 | S11 | Guilherme | Natalia | P0 | Reforco | RNF26 | - | docs/planificacao/guias-bk/MF7/BK-MF7-04-frontend-componentizado-e-reutilizavel.md |
| BK-MF7-05 | MF7 | S06 | Guilherme | Natalia | P1 | Core | RNF27 | - | docs/planificacao/guias-bk/MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md |
| BK-MF7-06 | MF7 | S07 | Natalia | Guilherme | P1 | Core | RNF28 | - | docs/planificacao/guias-bk/MF7/BK-MF7-06-testes-automatizados-para-modulos-criticos.md |
| BK-MF7-07 | MF7 | S12 | Daniel | Kaua | P1 | Core | RNF29 | - | docs/planificacao/guias-bk/MF7/BK-MF7-07-deploy-com-rollback.md |
| BK-MF7-08 | MF7 | S12 | Kaua | Guilherme | P1 | Core | RNF30 | - | docs/planificacao/guias-bk/MF7/BK-MF7-08-endpoint-de-health-check.md |
| BK-MF7-09 | MF7 | S12 | Kaua | Guilherme | P0 | Reforco | RNF31 | - | docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md |
| BK-MF7-10 | MF7 | S12 | Natalia | Guilherme | P0 | Reforco | RNF32 | - | docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md |
| BK-MF7-11 | MF7 | S12 | Guilherme | Natalia | P0 | Reforco | RNF33 | - | docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md |
| BK-MF8-01 | MF8 | S12 | Natalia | Guilherme | P0 | Reforco | RNF34 | - | docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md |
| BK-MF8-02 | MF8 | S11 | Natalia | Guilherme | P0 | Reforco | RNF35 | - | docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md |
| BK-MF8-03 | MF8 | S12 | Daniel | Natalia | P1 | Core | RNF36 | - | docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md |
| BK-MF8-04 | MF8 | S11 | Daniel | Kaua | P0 | Reforco | RNF37 | - | docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md |
| BK-MF8-05 | MF8 | S11 | Guilherme | Natalia | P0 | Reforco | RNF38 | - | docs/planificacao/guias-bk/MF8/BK-MF8-05-compativel-com-chrome-edge-firefox-safari.md |
| BK-MF8-06 | MF8 | S11 | Natalia | Guilherme | P0 | Reforco | RNF39 | - | docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md |
| BK-MF8-07 | MF8 | S12 | Natalia | Guilherme | P1 | Core | RNF40 | - | docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md |
| BK-MF8-08 | MF8 | S11 | Kaua | Guilherme | P2 | Core | RNF41 | - | docs/planificacao/guias-bk/MF8/BK-MF8-08-preparado-para-integracoes-com-drive-ics-lms.md |
| BK-MF8-09 | MF8 | S08 | Natalia | Guilherme | P0 | Reforco | RNF42 | - | docs/planificacao/guias-bk/MF8/BK-MF8-09-interface-em-portugues-portugal.md |
| BK-MF8-10 | MF8 | S07 | Daniel | Kaua | P0 | Reforco | RNF43 | - | docs/planificacao/guias-bk/MF8/BK-MF8-10-datas-no-formato-dd-mm-aaaa.md |
| BK-MF8-11 | MF8 | S06 | Guilherme | Kaua | P2 | Core | RNF44 | - | docs/planificacao/guias-bk/MF8/BK-MF8-11-preparado-para-futura-traducao-i18n.md |

## Changelog
- `2026-04-19`: anexo BK/Sprint/Owner gerado automaticamente.
