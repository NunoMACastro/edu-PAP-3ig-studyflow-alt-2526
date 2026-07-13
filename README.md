# StudyFlow

## Metadados
- Nome da app: StudyFlow
- Ano letivo: 2025/2026
- Turma: 12º IG
- Nome dos alunos: Natália, Daniel, Guilherme, Kaua
- Orientador: Nuno Castro e Cláudia Marques

## 1. Visão Geral Extensa da Aplicação
O StudyFlow é uma plataforma inteligente de aprendizagem que combina estudo individual, aprendizagem colaborativa e acompanhamento docente com suporte de IA. O projeto foi desenhado para reproduzir o funcionamento real de uma turma, sem perder personalização por aluno. Em vez de uma única IA genérica, o StudyFlow trabalha com contextos distintos, com regras próprias de conteúdo, permissões e comportamento pedagógico.

No contexto da PAP, o StudyFlow é uma aplicação orientada a impacto educativo: ajuda a organizar estudo, melhorar compreensão de conteúdos e criar continuidade entre materiais do professor, trabalho individual e sessões em grupo. A dimensão técnica do projeto está diretamente ligada à dimensão pedagógica.

## 2. Problema que Resolve e Proposta de Valor
O estudo digital em contexto escolar sofre com três problemas recorrentes: fragmentação de materiais, falta de adaptação ao aluno e fraca continuidade entre sala de aula e estudo autónomo. O StudyFlow resolve isso com:

- modo individual de IA por aluno/área de estudo;
- modo turma/disciplina com “voz docente” (estilo pedagógico do professor);
- modo coletivo para grupos de estudo;
- ingestão estruturada de materiais escolares para suporte factual das respostas.

A proposta de valor é oferecer uma experiência única que respeita contexto pedagógico, melhora desempenho do aluno e mantém controlo docente sobre limites da IA.

## 3. Público-Alvo e Stakeholders
- alunos que estudam individualmente e em contexto de turma;
- professores que querem estender a sua prática pedagógica para fora da aula;
- turmas/grupos de estudo com necessidade de colaboração estruturada;
- escola e coordenação pedagógica, interessadas em métricas de progresso e governança;
- equipa técnica responsável por IA, segurança e operação.

## 4. Funcionalidades Principais por Domínio Funcional
### 4.1 Modo individual (obrigatório)
- criação de áreas de estudo pessoais;
- upload de materiais e geração de resumos/explicações/quizzes;
- assistente privado por área com histórico de contexto e progresso.

### 4.2 Modo turma/disciplina com voz docente (obrigatório)
- assistente de disciplina com base em materiais oficiais;
- “voz docente” no MVP como adaptação de estilo pedagógico, linguagem e rigor do professor;
- limites de atuação definidos por regras da turma e conteúdos autorizados.

### 4.3 Modo coletivo de estudo (obrigatório)
- sessões de grupo com IA coletiva;
- chat/notas/partilha em escopo de grupo;
- apoio à resolução de dúvidas com referências ao material disponível.

### 4.4 Gestão de materiais e integrações
- ingestão e indexação de PDFs, DOCX e URLs;
- separação de materiais por contexto (aluno, grupo, turma);
- integração Drive em MVP controlado como importação unidirecional para estudo.

### 4.5 Guardrails e qualidade de resposta
- citações obrigatórias e controlo anti-hallucinação;
- isolamento entre turmas e entre dados de alunos;
- controlo de modelos e limites operacionais por contexto.

### 4.6 Notificações e automações (escopo simplificado)
- notificações essenciais de rotina/sessão/material novo;
- simplificação intencional de preferências/canais avançados no MVP;
- automação mínima necessária para valor pedagógico imediato.

Fontes funcionais canónicas: [docs/RF.md](docs/RF.md), [docs/planificacao/backlogs/BACKLOG-MVP.md](docs/planificacao/backlogs/BACKLOG-MVP.md).

## 5. Arquitetura/Stack Recomendada (Alto Nível)
- frontend modular em React/TypeScript/Tailwind para perfis de aluno, professor e administração;
- backend Node.js com NestJS, organizado por domínios (identidade, materiais, IA, turma, notificações);
- persistência principal em MongoDB via Mongoose ODM, com Redis para cache e sessões;
- pipeline de indexação e recuperação documental para respostas fundamentadas;
- camada de guardrails para políticas por contexto;
- observabilidade de uso, desempenho e segurança.

A implementação de referência endurecida fixa Node `24.11.1` e npm `11.6.2`, funciona apenas
em `local-pap`, single-instance e loopback. O seu estado não é inferido deste plano de produto:
consultar [o ledger de remediação](docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md)
e [o estado independente dos BK](docs/planificacao/ESTADO-REFERENCIA-REAL_DEV.md). Não existe
declaração de prontidão para produção.

## 6. Arranque Local da Aplicação (`apps/`)

### 6.1 Pré-requisitos

- Node.js `24.11.1` e npm `11.6.2`;
- MongoDB Atlas ou MongoDB local configurado como replica set `studyflow-rs`;
- Redis local disponível em `127.0.0.1`.

O backend e o frontend têm dependências e ficheiros `package-lock.json` próprios. Por isso, os
comandos de instalação devem ser executados separadamente em cada pasta.

### 6.2 Backend (`apps/api`)

Na primeira execução, abrir um terminal na raiz do repositório e preparar o ambiente:

```bash
cd apps/api
npm ci
cp -n .env.example .env
```

Editar `apps/api/.env` e preencher, pelo menos, a ligação ao MongoDB (`MONGODB_URI`), a ligação
ao Redis (`REDIS_URL`) e um caminho local com permissões de escrita (`MATERIALS_STORAGE_DIR`).
Quando forem usadas funcionalidades reais de IA, preencher também `OPENAI_API_KEY`. Nunca
adicionar o ficheiro `.env` ao Git.

Depois, mantendo o terminal em `apps/api`, arrancar a API em modo de desenvolvimento:

```bash
npm run start:dev
```

A API fica disponível em `http://127.0.0.1:3000` por omissão.

### 6.3 Frontend (`apps/web`)

Num segundo terminal, executar:

```bash
cd apps/web
npm ci
npm run dev
```

O frontend fica disponível em `http://127.0.0.1:5173` e encaminha os pedidos `/api/*` para
`http://127.0.0.1:3000`. Para usar uma API noutro endereço, copiar `apps/web/.env.example` para
`apps/web/.env` e alterar `VITE_API_PROXY_TARGET`.

Para trabalhar com a aplicação completa, manter os dois terminais em execução.

## 7. Escopo MVP vs Pós-PAP

### MVP (incluído)

- dois modos obrigatórios plenamente ativos: individual e turma/disciplina;
- modo coletivo funcional para sessões de grupo;
- voz docente como adaptação de estilo pedagógico (sem exigência de clonagem tímbrica);
- Drive em integração controlada de importação para estudo;
- notificações essenciais e automações mínimas;
- guardrails e isolamento de dados como condição de qualidade.

### Pós-PAP (adiado)

- clonagem de voz de alta fidelidade tímbrica;
- automações avançadas multicanal com quotas detalhadas;
- integrações institucionais amplas (SSO completo, calendários avançados);
- funcionalidades colaborativas de maior complexidade operacional.

## 8. Requisitos Não Funcionais Críticos

- segurança de sessão, proteção de dados e separação de contextos;
- desempenho consistente na consulta e resposta de IA;
- fiabilidade operacional com logs e recuperação;
- explicabilidade de respostas com referência a fontes;
- documentação e rastreabilidade alinhadas com backlog e sprints.

Fonte canónica RNF: [docs/RNF.md](docs/RNF.md).

## 9. Roadmap Resumido por Fases

1. fundação de conta, áreas de estudo e assistente individual;
2. ativação de turmas/disciplina e voz docente;
3. sessões coletivas, integrações essenciais e notificações simplificadas;
4. reforço operacional, governança e preparação de defesa.

## 10. Créditos, Licença e Changelog

### Créditos

- Projeto: StudyFlow
- Tipo: PAP - Curso Profissional de Informática de Gestão
- Ano letivo: 2025/2026
- Equipa: Natália, Daniel, Guilherme, Kaua
- Orientador: Nuno Castro e Cláudia Marques

### Licença

Projeto académico para fins educativos.

### Changelog

- 2026-07-13: adicionadas instruções para arrancar o backend e o frontend a partir de `apps/`.
- 2026-04-17: README reescrito integralmente com estrutura canónica e explicitação dos 2 modos obrigatórios de IA + modo coletivo.
