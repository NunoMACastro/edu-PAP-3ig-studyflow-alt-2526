# Study Flow - Requisitos Não Funcionais (RNF)

## Índice

1. [Usabilidade e Acessibilidade](#1-usabilidade-e-acessibilidade)
2. [Performance e Escalabilidade](#2-performance-e-escalabilidade)
3. [Segurança e Proteção de Dados](#3-segurança-e-proteção-de-dados)
4. [Fiabilidade, Backups e Continuidade](#4-fiabilidade-backups-e-continuidade)
5. [Manutenção, Organização e Qualidade](#5-manutenção-organização-e-qualidade)
6. [IA - Ética, Controlo e Explicabilidade](#6-ia-ética-controlo-e-explicabilidade)
7. [Compatibilidade, Formatos e Fecho de Produto](#7-compatibilidade-formatos-e-fecho-de-produto)
8. [Localização e Preparação Futura](#8-localização-e-preparação-futura)
9. [Stack Tecnológica Recomendada](#9-stack-tecnológica-recomendada)
10. [Licença](#licença)
11. [Changelog](#changelog)

-   [Voltar ao início](../README.md)

---

<a id="1-usabilidade-e-acessibilidade"></a>
## 1. Usabilidade e Acessibilidade

| Código | Requisito                                              | Tipo           | Prioridade |
| ------ | ------------------------------------------------------ | -------------- | ---------- |
| RNF01  | Interface intuitiva e clara para alunos e professores. | UX             | Must       |
| RNF02  | Layout responsivo para desktop/tablet/mobile.          | UX             | Must       |
| RNF03  | Feedback imediato em ações (guardar, IA, uploads).     | UX             | Must       |
| RNF04  | Navegação consistente entre módulos.                   | UX             | Should     |
| RNF05  | Regras básicas de acessibilidade (contraste, labels).  | Acessibilidade | Should     |
| RNF06  | Validação completa de formulários antes de submissão.  | UX             | Must       |
| RNF07  | Notificações discretas e contextualizadas.             | UX             | Should     |

---

<a id="2-performance-e-escalabilidade"></a>
## 2. Performance e Escalabilidade

| Código | Requisito                                                      | Tipo           | Prioridade |
| ------ | -------------------------------------------------------------- | -------------- | ---------- |
| RNF08  | Dashboards e estudo carregam em ≤ 2s.                          | Performance    | Must       |
| RNF09  | Respostas da IA devem surgir em ≤ 4s.                          | Performance    | Should     |
| RNF10  | Suportar ≥ 200 utilizadores simultâneos por escola.            | Escalabilidade | Should     |
| RNF11  | Indexação de documentos deve ser assíncrona e não bloquear UI. | Performance    | Must       |
| RNF12  | Geração de quizzes em background quando necessário.            | Performance    | Should     |
| RNF13  | Arquitetura preparada para escalar horizontalmente.            | Escalabilidade | Could      |

---

<a id="3-segurança-e-proteção-de-dados"></a>
## 3. Segurança e Proteção de Dados

| Código | Requisito                                           | Tipo         | Prioridade |
| ------ | --------------------------------------------------- | ------------ | ---------- |
| RNF14  | HTTPS obrigatório (TLS 1.2+).                       | Segurança    | Must       |
| RNF15  | Passwords com hashing seguro (bcrypt/argon2).       | Segurança    | Must       |
| RNF16  | Sessões com cookies HttpOnly + Secure + SameSite.   | Segurança    | Must       |
| RNF17  | Proteções contra XSS, CSRF, Injection, brute force. | Segurança    | Must       |
| RNF18  | Processamento de documentos em sandbox seguro.      | Segurança    | Must       |
| RNF19  | Guardrails obrigatórios na IA.                      | Segurança IA | Must       |
| RNF20  | IA não acede a dados de outras turmas ou alunos.    | Privacidade  | Must       |

---

<a id="4-fiabilidade-backups-e-continuidade"></a>
## 4. Fiabilidade, Backups e Continuidade

| Código | Requisito                             | Tipo        | Prioridade |
| ------ | ------------------------------------- | ----------- | ---------- |
| RNF21  | Backups diários automáticos.          | Fiabilidade | Should     |
| RNF22  | Auto-recovery após falhas.            | Fiabilidade | Should     |
| RNF23  | Logs estruturados de eventos e erros. | Operação    | Must       |
| RNF24  | Downtime máximo aceitável < 1h/mês.   | Fiabilidade | Could      |

---

<a id="5-manutenção-organização-e-qualidade"></a>
## 5. Manutenção, Organização e Qualidade

| Código | Requisito                                                       | Tipo       | Prioridade |
| ------ | --------------------------------------------------------------- | ---------- | ---------- |
| RNF25  | Backend modular por domínios (aluno, professor, IA, materiais). | Manutenção | Must       |
| RNF26  | Frontend componentizado e reutilizável.                         | Manutenção | Must       |
| RNF27  | Documentação técnica mínima (modelos, fluxos, endpoints).       | Manutenção | Should     |
| RNF28  | Testes automatizados para módulos críticos.                     | Qualidade  | Should     |
| RNF29  | Deploy com rollback.                                            | Operação   | Should     |
| RNF30  | Endpoint de health-check.                                       | Operação   | Should     |
| RNF41  | Verificação dos testes atuais e criação dos testes em falta.    | Qualidade  | Must       |
| RNF42  | Execução final da bateria de testes e recolha de evidence.      | Qualidade  | Must       |
| RNF45  | Correção dos erros encontrados nos testes e revalidação final.  | Qualidade  | Must       |

---

<a id="6-ia-ética-controlo-e-explicabilidade"></a>
## 6. IA - Ética, Controlo e Explicabilidade

| Código | Requisito                                               | Tipo            | Prioridade |
| ------ | ------------------------------------------------------- | --------------- | ---------- |
| RNF31  | IA explica fontes dos conteúdos (páginas/secções).      | Explicabilidade | Must       |
| RNF32  | IA respeita perfis distintos (aluno, sala, turma, disciplina, professor). | Segurança IA    | Must       |
| RNF33  | IA segue limites definidos pelo professor, incluindo voz base da turma e overrides de disciplina. | Ética           | Must       |
| RNF34  | IA evita enviesamentos e respostas inseguras.           | Ética           | Must       |
| RNF35  | IA não pode inventar informação factual.                | Ética           | Must       |
| RNF36  | IA adapta explicações ao nível do aluno, incluindo perfil pedagógico individual e ano escolar nas respostas da IA da sala. | Personalização  | Should     |
| RNF37  | IA externa segue políticas e filtros próprios.          | Segurança IA    | Must       |

---

Nota RNF32/RNF33: a voz docente não pode atravessar para áreas privadas, salas livres de alunos ou IA de sala colaborativa. A herança permitida fica limitada a turma, disciplina e salas guiadas docentes com disciplina associada.

<a id="7-compatibilidade-formatos-e-fecho-de-produto"></a>
## 7. Compatibilidade, Formatos e Fecho de Produto

| Código | Requisito                                     | Tipo            | Prioridade |
| ------ | --------------------------------------------- | --------------- | ---------- |
| RNF38  | Aproximação da UI real à UI definida no mockup. | UX final      | Must       |
| RNF39  | Suporte a importação UTF-8 e PT-PT.           | Compatibilidade | Must       |
| RNF40  | Exportação de resumos/quizzes em PDF/MD.      | Compatibilidade | Should     |

> Compatibilidade completa multi-browser e integrações Drive/ICS/LMS ficam como melhoria pós-MVP, porque a defesa PAP será feita em ambiente e browser controlados.

---

<a id="8-localização-e-preparação-futura"></a>
## 8. Localização e Preparação Futura

| Código | Requisito                            | Tipo        | Prioridade |
| ------ | ------------------------------------ | ----------- | ---------- |
| RNF43  | Datas no formato dd/mm/aaaa.         | Localização | Must       |
| RNF44  | Preparado para futura tradução i18n. | Localização | Could      |

---

<a id="9-stack-tecnológica-recomendada"></a>
## 9. Stack Tecnológica Recomendada

### Frontend

-   React ou Next.js
-   TypeScript
-   Tailwind CSS
-   Zustand / Context API
-   TanStack Query

### Backend

-   Node.js LTS
-   NestJS
-   Mongoose ODM
-   Autenticação por cookies

### Base de Dados

-   MongoDB
-   Redis para cache e sessões

### IA

-   OpenAI API (modelos GPT)
-   Serviço interno de personalização
-   Indexação via Python/Node

---

<a id="licença"></a>
## Licença

Projeto académico orientado a fins educativos.

---

<a id="changelog"></a>
## Changelog

-   **2024-06-15** - Versão inicial dos Requisitos Não Funcionais (RNF) e Stack Tecnológica Recomendada.
