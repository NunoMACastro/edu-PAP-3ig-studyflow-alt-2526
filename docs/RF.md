# Study Flow - Requisitos Funcionais (RF)

> Estrutura centrada no utilizador e nos principais intervenientes do ecossistema escolar.

## Índice

1. [Aluno - Estudo Individual](#1-aluno-estudo-individual)
2. [Aluno - Áreas de Estudo e IA Privada](#2-aluno-áreas-de-estudo-e-ia-privada)
3. [Aluno - Estudo em Grupo e Salas Partilhadas](#3-aluno-estudo-em-grupo-e-salas-partilhadas)
4. [Professor - Turmas, Disciplinas e IA Docente](#4-professor-turmas-disciplinas-e-ia-docente)
5. [Professor - Projetos, Testes e Curadoria](#5-professor-projetos-testes-e-curadoria)
6. [Sistema - Ingestão de Materiais e Base de Conhecimento](#6-sistema-ingestão-de-materiais-e-base-de-conhecimento)
7. [Sistema - IA (Assistentes, Guardrails, Perfis)](#7-sistema-ia-assistentes-guardrails-perfis)
8. [Comunidade - Grupos, Salas e Co-Estudo](#8-comunidade-grupos-salas-e-co-estudo)
9. [Pesquisa e Navegação](#9-pesquisa-e-navegação)
10. [Notificações e Acompanhamento](#10-notificações-e-acompanhamento)
11. [Privacidade e RGPD](#11-privacidade-e-rgpd)
12. [Administração e Operação](#12-administração-e-operação)
13. [Integrações](#13-integrações)
14. [Critérios de Aceitação](#critérios-de-aceitação-agrupados-por-funcionalidade)
15. [Sugestão de MVP organizado por fases e RF](#sugestão-de-mvp-organizado-por-fases-e-rf)
16. [Créditos](#créditos)
17. [Licença](#licença)
18. [Changelog](#changelog)

-   [Voltar ao início](../README.md)

---

## Requisitos Funcionais

### 1. Aluno - Estudo Individual

| Código | Requisito                                         | Atores | Prioridade | Dependências |
| ------ | ------------------------------------------------- | ------ | ---------- | ------------ |
| RF01   | Registo do aluno (email/password ou SSO escolar). | Aluno  | Must       | -            |
| RF02   | Login seguro com cookies HttpOnly.                | Aluno  | Must       | -            |
| RF03   | Perfil editável (nome, ano, curso, turma).        | Aluno  | Should     | RF02         |
| RF04   | O aluno pode estudar sem turma.                   | Aluno  | Must       | RF03         |
| RF05   | O aluno pode criar rotinas e objetivos de estudo. | Aluno  | Should     | RF03         |
| RF06   | O aluno pode consultar histórico de estudo.       | Aluno  | Should     | RF03         |

---

### 2. Aluno - Áreas de Estudo e IA Privada

| Código | Requisito                                                     | Atores         | Prioridade | Dependências |
| ------ | ------------------------------------------------------------- | -------------- | ---------- | ------------ |
| RF07   | Criar “Áreas de Estudo” (auto-disciplina independente).       | Aluno          | Must       | RF03         |
| RF08   | Submeter materiais (PDF, DOCX, URLs, tópicos).                | Aluno          | Must       | RF07         |
| RF09   | Associar estilo/tom das aulas → “voz” da IA.                  | Aluno          | Should     | RF07         |
| RF10   | Criar perfil IA da Área de Estudo.                            | Sistema, Aluno | Must       | RF08         |
| RF11   | Obter resumos IA baseados nos materiais enviados.             | Aluno          | Must       | RF08, RF10   |
| RF12   | Obter explicações, cards e quizzes personalizados.            | Aluno          | Must       | RF11         |
| RF13   | A IA deve adaptar explicações ao ritmo/dificuldades do aluno. | Sistema        | Should     | RF11         |

---

### 3. Aluno - Estudo em Grupo e Salas Partilhadas

| Código | Requisito                                                           | Atores  | Prioridade | Dependências |
| ------ | ------------------------------------------------------------------- | ------- | ---------- | ------------ |
| RF14   | Criar salas de estudo com outros alunos (livres ou por disciplina). | Aluno   | Should     | RF03         |
| RF15   | Partilhar materiais e apontamentos na sala.                         | Aluno   | Should     | RF14         |
| RF16   | IA partilhada da sala (mistura das áreas dos membros).              | Sistema | Could      | RF14         |

---

### 4. Professor - Turmas, Disciplinas e IA Docente

| Código | Requisito                                                 | Atores    | Prioridade | Dependências |
| ------ | --------------------------------------------------------- | --------- | ---------- | ------------ |
| RF19   | Criar turmas.                                             | Professor | Must       | -            |
| RF20   | Criar disciplinas e associá-las às turmas.                | Professor | Must       | RF19         |
| RF21   | Submeter materiais da disciplina (versão oficial).        | Professor | Must       | RF20         |
| RF22   | Configurar “voz da IA” docente.                           | Professor | Should     | RF21         |
| RF23   | O aluno inscrito numa turma recebe versão limitada da IA. | Sistema   | Must       | RF22         |
| RF24   | Professores podem enviar avisos e publicações.            | Professor | Should     | RF19         |
| RF25   | Professores podem criar salas de estudo guiado.           | Professor | Could      | RF19         |

---

### 5. Professor - Projetos, Testes e Curadoria

| Código | Requisito                                                      | Atores    | Prioridade | Dep. |
| ------ | -------------------------------------------------------------- | --------- | ---------- | ---- |
| RF26   | Professores podem criar projetos para a turma.                 | Professor | Should     | RF19 |
| RF27   | A IA deve ajudar o aluno a elaborar projetos de forma gradual. | IA, Aluno | Should     | RF26 |
| RF28   | Criar testes/mini-testes oficiais.                             | Professor | Must       | RF20 |
| RF29   | Rever e aprovar conteúdo gerado pela IA (resumos/quizzes).     | Professor | Should     | RF21 |
| RF30   | Painel com progresso, dificuldades e métricas da turma.        | Professor | Should     | RF24 |

---

### 6. Sistema - Ingestão de Materiais e Base de Conhecimento

| Código | Requisito                                               | Atores  | Prioridade | Dependências |
| ------ | ------------------------------------------------------- | ------- | ---------- | ------------ |
| RF31   | Indexação automática de PDFs, DOCX e URLs.              | Sistema | Must       | RF08, RF21   |
| RF32   | Extrair tópicos, secções, estrutura e referências.      | Sistema | Must       | RF31         |
| RF33   | Manter versões dos materiais.                           | Sistema | Should     | RF31         |
| RF34   | Separar materiais entre “aluno”, “professor” e “turma”. | Sistema | Must       | RF31         |

---

### 7. Sistema - IA (Assistentes, Guardrails, Perfis)

| Código | Requisito                                                            | Atores  | Prioridade | Dep. |
| ------ | -------------------------------------------------------------------- | ------- | ---------- | ---- |
| RF35   | Assistente IA privado por Área de Estudo.                            | Sistema | Must       | RF10 |
| RF36   | Assistente IA da disciplina/turma com voz docente.                   | Sistema | Must       | RF22 |
| RF37   | Guardrails distintos para aluno solo, grupo e turma.                 | Sistema | Must       | RF35 |
| RF38   | IA não pode inventar conteúdo (citações obrigatórias).               | Sistema | Must       | RF31 |
| RF39   | IA pode recorrer a conhecimento externo (limitado) quando permitido. | Sistema | Should     | RF35 |
| RF40   | IA deve ajustar explicações ao perfil do aluno.                      | Sistema | Should     | RF13 |

---

### 8. Comunidade - Grupos, Salas e Co-Estudo

| Código | Requisito                           | Atores           | Prioridade | Dep. |
| ------ | ----------------------------------- | ---------------- | ---------- | ---- |
| RF41   | Criar grupos de estudo.             | Aluno            | Should     | RF14 |
| RF42   | Chat, partilha e notas coletivas.   | Aluno            | Should     | RF41 |
| RF43   | Agendar sessões de estudo coletivo. | Aluno, Professor | Could      | RF41 |
| RF44   | IA coletiva para sessões de grupo.  | Sistema          | Could      | RF41 |

---

### 9. Pesquisa e Navegação

| Código | Requisito                                        | Atores | Prioridade | Dep. |
| ------ | ------------------------------------------------ | ------ | ---------- | ---- |
| RF45   | Pesquisa unificada por tópico/conceito/material. | Todos  | Must       | RF31 |
| RF46   | Navegação por programa/currículo.                | Todos  | Should     | RF31 |

---

### 10. Notificações e Acompanhamento

| Código | Requisito                                                                  | Atores    | Prioridade | Dep. |
| ------ | -------------------------------------------------------------------------- | --------- | ---------- | ---- |
| RF47   | Configurar preferências de notificações (email, push, app) por contexto.   | Todos     | Should     | RF02 |
| RF48   | Alertar alunos sobre rotinas, objetivos e sessões de estudo agendadas.     | Sistema   | Should     | RF05 |
| RF49   | Notificar grupos/turmas sobre novos materiais, feedback e tarefas.         | Sistema   | Should     | RF24 |
| RF50   | Professores definem alertas de acompanhamento (ex.: aluno inativo X dias). | Professor | Should     | RF35 |
| RF51   | Administradores configuram canais e quotas máximas de notificações.        | Admin     | Should     | RF50 |

---

### 11. Privacidade e RGPD

| Código | Requisito                         | Atores | Prioridade | Dep. |
| ------ | --------------------------------- | ------ | ---------- | ---- |
| RF52   | Exportar dados pessoais.          | Todos  | Must       | -    |
| RF53   | Eliminar conta e dados.           | Todos  | Must       | -    |
| RF54   | Gestão de consentimentos para IA. | Todos  | Must       | -    |

---

### 12. Administração e Operação

| Código | Requisito                                                             | Atores | Prioridade | Dep  |
| ------ | --------------------------------------------------------------------- | ------ | ---------- | ---- |
| RF55   | Gestão de utilizadores e papéis.                                      | Admin  | Must       | RF04 |
| RF56   | Auditoria completa (materiais, IA, papéis).                           | Admin  | Must       | RF55 |
| RF57   | Configurar modelos de IA e limites de uso.                            | Admin  | Should     | RF35 |
| RF58   | Definir **quotas de IA** por aluno/turma/grupo e monitorizar consumo. | Admin  | Should     | RF57 |

---

### 13. Integrações

| Código | Requisito                                                              | Atores           | Prioridade |
| ------ | ---------------------------------------------------------------------- | ---------------- | ---------- |
| RF61   | Integração com Drives (Google/OneDrive) para importação unidirecional de materiais de estudo. | Professor, Aluno | Should     |

---

## Critérios de Aceitação (Agrupados por Funcionalidade)

### A) Resumos com IA (RF11, RF35, RF36, RF38)

-   Resumo deve indicar página/secção de origem.
-   Não pode incluir conteúdo não existente nos ficheiros fornecidos.
-   Quando a voz do professor está ativa, o resumo deve refletir o tom docente.

### B) Quizzes e Testes (RF12, RF28, RF29)

-   Perguntas MCQ devem ter 1 resposta correta e 3 distratores.
-   Explicações precisam de referência ao material.
-   O sistema guarda desempenho por tópico e disciplina.

### C) Estudo em Grupo e Salas (RF14–RF16, RF41–RF44)

-   Apenas membros podem ver materiais da sala.
-   IA da sala deve respeitar guardrails de grupo.
-   Sessões coletivas devem registar participação e histórico.

### D) Projetos e Acompanhamento (RF26–RF27)

-   IA deve dividir projetos em passos sequenciais.
-   Professores podem validar entregas e verificar evolução.

### E) Turmas e Disciplinas (RF19–RF25)

-   Apenas alunos inscritos têm acesso ao conteúdo oficial.
-   A IA docente usa exclusivamente materiais aprovados.

### F) Materiais e Indexação (RF08, RF21, RF31–RF34)

-   Sistemas devem extrair texto, estrutura e tópicos do documento.
-   Versionamento deve permitir reversão.

## Sugestão de MVP organizado por fases e RF

-   **Fase 1 - Estudo Individual:** RF01–RF13, focando áreas privadas, ingestão de materiais e assistente IA pessoal.
-   **Fase 2 - Professores e Turmas:** RF14–RF16 e RF19–RF39, adicionando gestão docente, projetos/testes e painéis de progresso.
-   **Fase 3 - Comunidade e Notificações:** RF40–RF51, cobrindo grupos, salas colaborativas e alertas inteligentes.
-   **Fase 4 - Operação e Integrações:** RF52–RF58 e RF61, com privacidade, administração avançada, quotas de IA e integrações externas.

## Créditos

-   Projeto: StudyFlow
-   Equipa: Natália, Daniel, Guilherme, Kaua
-   Orientador: Nuno Castro e Cláudia Marques

---

## Licença

Projeto académico destinado exclusivamente a fins educativos.

---

## Changelog

-   **2024-04-27** - Reorganização do RF.md para o formato padrão com secções de MVP, créditos, licença e changelog.
-   **2026-04-17** - Ajuste de escopo MVP StudyFlow com remoção de funcionalidades cortadas e simplificação da integração Drive.
