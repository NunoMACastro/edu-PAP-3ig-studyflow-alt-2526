# ANEXO-CORE-DUAL-BK

## Header
- `doc_id`: `ANEXO-CORE-DUAL-BK`
- `path`: `docs/planificacao/backlogs/ANEXO-CORE-DUAL-BK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-19`

## Objetivo
Classificar cada BK no contrato de core dual da StudyFlow e ligar cada item a KPI primario/secundario auditavel.

## Rubrica deterministica
- `CORE-IA`: impacto direto em explicacoes, personalizacao e tutor IA.
- `CORE-COM`: impacto direto em operacao pedagogica de turma/projeto/avaliacao.
- `CORE-HIBRIDO`: impacto simultaneo real nos dois eixos.
- `SUPORTE`: qualidade/operacao/governanca sem impacto funcional core direto.
- Reclassificacao minima (quando aplicada) segue output do solver deterministico em `scripts/solver_reassignments.json`.

## Schema
- Colunas oficiais: `bk_id | classe_core_dual | eixo_primario | kpi_primario | kpi_secundario | justificacao_classe`.
- Classes permitidas: `CORE-IA`, `CORE-COM`, `CORE-HIBRIDO`, `SUPORTE`.

## Mapeamento BK -> Core Dual
| bk_id | classe_core_dual | eixo_primario | kpi_primario | kpi_secundario | justificacao_classe |
| --- | --- | --- | --- | --- | --- |
| BK-MF0-01 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio security_hardening |
| BK-MF0-02 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio security_hardening |
| BK-MF0-03 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF0-04 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF0-05 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF0-06 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF0-07 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF0-08 | CORE-IA | AprendizagemInteligente | taxa_resposta_util | tempo_resposta_p95 | materiais indexados alimentam diretamente a qualidade das respostas |
| BK-MF0-09 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF0-10 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF0-11 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF0-12 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF1-01 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF1-02 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF1-03 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF1-04 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF1-07 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF1-08 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF1-09 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF1-10 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF1-11 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF1-12 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | notificacoes influenciam disciplina de estudo e continuidade |
| BK-MF2-01 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF2-02 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF2-03 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | projetos e avaliacao sao entrega pedagogica central da app |
| BK-MF2-04 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | projetos e avaliacao sao entrega pedagogica central da app |
| BK-MF2-05 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | projetos e avaliacao sao entrega pedagogica central da app |
| BK-MF2-06 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | projetos e avaliacao sao entrega pedagogica central da app |
| BK-MF2-07 | CORE-IA | AprendizagemInteligente | taxa_resposta_util | tempo_resposta_p95 | materiais indexados alimentam diretamente a qualidade das respostas |
| BK-MF2-08 | CORE-IA | AprendizagemInteligente | taxa_resposta_util | tempo_resposta_p95 | materiais indexados alimentam diretamente a qualidade das respostas |
| BK-MF2-09 | CORE-IA | AprendizagemInteligente | taxa_resposta_util | tempo_resposta_p95 | materiais indexados alimentam diretamente a qualidade das respostas |
| BK-MF2-10 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF2-11 | CORE-IA | AprendizagemInteligente | taxa_resposta_util | tempo_resposta_p95 | impacto direto no tutor de IA e personalizacao academica |
| BK-MF2-12 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF3-01 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | colaboracao aumenta engagement e reforca aprendizagem assistida |
| BK-MF3-02 | CORE-IA | AprendizagemInteligente | taxa_resposta_util | tempo_resposta_p95 | impacto direto no tutor de IA e personalizacao academica |
| BK-MF3-03 | CORE-IA | AprendizagemInteligente | taxa_resposta_util | tempo_resposta_p95 | impacto direto no tutor de IA e personalizacao academica |
| BK-MF3-04 | CORE-IA | AprendizagemInteligente | taxa_resposta_util | tempo_resposta_p95 | impacto direto no tutor de IA e personalizacao academica |
| BK-MF3-05 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | colaboracao aumenta engagement e reforca aprendizagem assistida |
| BK-MF3-06 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | colaboracao aumenta engagement e reforca aprendizagem assistida |
| BK-MF3-07 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | colaboracao aumenta engagement e reforca aprendizagem assistida |
| BK-MF3-08 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | colaboracao aumenta engagement e reforca aprendizagem assistida |
| BK-MF3-09 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF3-10 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF3-11 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | notificacoes influenciam disciplina de estudo e continuidade |
| BK-MF3-12 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | notificacoes influenciam disciplina de estudo e continuidade |
| BK-MF4-01 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | notificacoes influenciam disciplina de estudo e continuidade |
| BK-MF4-02 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | notificacoes influenciam disciplina de estudo e continuidade |
| BK-MF4-03 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | governanca operacional sem entrega core direta ao utilizador final |
| BK-MF4-04 | CORE-HIBRIDO | ConfiancaProduto | taxa_consentimento_ativo | taxa_retencao_30d | privacidade reforca confianca e continuidade de uso |
| BK-MF4-05 | CORE-HIBRIDO | ConfiancaProduto | taxa_consentimento_ativo | taxa_retencao_30d | privacidade reforca confianca e continuidade de uso |
| BK-MF4-06 | CORE-HIBRIDO | ConfiancaProduto | taxa_consentimento_ativo | taxa_retencao_30d | privacidade reforca confianca e continuidade de uso |
| BK-MF4-07 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | governanca operacional sem entrega core direta ao utilizador final |
| BK-MF4-08 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | governanca operacional sem entrega core direta ao utilizador final |
| BK-MF4-09 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | governanca operacional sem entrega core direta ao utilizador final |
| BK-MF4-10 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | governanca operacional sem entrega core direta ao utilizador final |
| BK-MF5-01 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | integracoes ampliam utilidade real da app no fluxo de estudo |
| BK-MF5-03 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF5-04 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | qualidade de interface e acessibilidade como habilitador transversal |
| BK-MF5-05 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | qualidade de interface e acessibilidade como habilitador transversal |
| BK-MF5-06 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio ux_accessibility |
| BK-MF5-07 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | qualidade de interface e acessibilidade como habilitador transversal |
| BK-MF5-08 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio ux_accessibility |
| BK-MF5-09 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | notificacoes influenciam disciplina de estudo e continuidade |
| BK-MF5-10 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio performance_scalability |
| BK-MF5-11 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio performance_scalability |
| BK-MF5-12 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio performance_scalability |
| BK-MF6-01 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio performance_scalability |
| BK-MF6-02 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | performance/escalabilidade suportam continuidade, sem feature core isolada |
| BK-MF6-03 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio performance_scalability |
| BK-MF6-04 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio security_hardening |
| BK-MF6-05 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio security_hardening |
| BK-MF6-06 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio security_hardening |
| BK-MF6-07 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio security_hardening |
| BK-MF6-08 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio security_hardening |
| BK-MF6-09 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio security_hardening |
| BK-MF6-10 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio security_hardening |
| BK-MF6-11 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | operacao e continuidade sem output core funcional direto |
| BK-MF6-12 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio reliability_ops |
| BK-MF7-01 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio reliability_ops |
| BK-MF7-02 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | operacao e continuidade sem output core funcional direto |
| BK-MF7-03 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio quality_architecture |
| BK-MF7-04 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio quality_architecture |
| BK-MF7-05 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | modularidade e testes sustentam o produto transversalmente |
| BK-MF7-06 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | modularidade e testes sustentam o produto transversalmente |
| BK-MF7-07 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | operacao e continuidade sem output core funcional direto |
| BK-MF7-08 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | operacao e continuidade sem output core funcional direto |
| BK-MF7-09 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF7-10 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF7-11 | CORE-COM | OperacaoPedagogica | adesao_turma_semana | taxa_tarefas_concluidas | impacto direto na operacao de turma e disciplina |
| BK-MF8-01 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF8-02 | CORE-IA | AprendizagemInteligente | taxa_resposta_util | tempo_resposta_p95 | impacto direto no tutor de IA e personalizacao academica |
| BK-MF8-03 | CORE-IA | AprendizagemInteligente | taxa_resposta_util | tempo_resposta_p95 | impacto direto no tutor de IA e personalizacao academica |
| BK-MF8-04 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | fundacao funcional com impacto simultaneo em aprendizagem e uso recorrente |
| BK-MF8-05 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | compatibilidade multi-browser e requisito transversal de sustentacao |
| BK-MF8-06 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | localizacao e i18n como habilitador operacional da experiencia |
| BK-MF8-07 | CORE-IA | AprendizagemInteligente | taxa_resposta_util | tempo_resposta_p95 | materiais indexados alimentam diretamente a qualidade das respostas |
| BK-MF8-08 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | integracoes ampliam utilidade real da app no fluxo de estudo |
| BK-MF8-09 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | localizacao e i18n como habilitador operacional da experiencia |
| BK-MF8-10 | CORE-HIBRIDO | AprendizagemComEngajamento | tempo_estudo_semana | taxa_retencao_30d | reclassificacao deterministica para core dual no dominio localization |
| BK-MF8-11 | SUPORTE | FundacaoQualidade | taxa_incidentes_criticos | taxa_conformidade_gates | localizacao e i18n como habilitador operacional da experiencia |

## Changelog
- `2026-04-19`: anexo atualizado com rubrica deterministica e coluna `justificacao_classe`.
