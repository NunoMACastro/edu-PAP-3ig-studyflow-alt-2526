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

A API e a aplicação web encontram-se, respetivamente, em `apps/api` e `apps/web`. Devem ser
mantidas em execução em dois terminais separados.

### 6.1 Pré-requisitos

Antes do primeiro arranque, instalar e configurar:

- Node.js `24.11.1`;
- npm `11.6.2`;
- uma instância MongoDB Atlas ou um MongoDB local com o replica set `studyflow-rs`;
- Redis local em loopback (`127.0.0.1`), usando uma base dedicada entre `1` e `15`.

Confirmar as versões de Node.js e npm:

```bash
node --version
npm --version
```

### 6.2 Primeira instalação

Abrir um terminal na raiz do repositório, entrar na pasta `apps` e instalar as dependências
registadas nos lockfiles:

```bash
cd apps
npm --prefix api ci
npm --prefix web ci
```

Criar o ficheiro de ambiente da API sem substituir um `.env` que já exista:

```bash
cp -n api/.env.example api/.env
```

No Windows PowerShell, usar o equivalente:

```powershell
if (-not (Test-Path api\.env)) {
  Copy-Item api\.env.example api\.env
}
```

Editar `apps/api/.env` e confirmar, pelo menos, estes valores:

- `MONGODB_URI`: ligação real ao MongoDB Atlas ou ao replica set local;
- `REDIS_URL`: por omissão, `redis://127.0.0.1:6379/1`;
- `MATERIALS_STORAGE_DIR`: diretório local e privado para os materiais;
- `OPENAI_API_KEY`: opcional no arranque, mas necessária para funcionalidades que usem IA real.

O ficheiro `.env` pode conter segredos e não deve ser adicionado ao Git. Antes de continuar,
garantir que MongoDB e Redis estão iniciados e acessíveis através dos endereços configurados.

### 6.3 Iniciar o backend/API

No primeiro terminal, dentro de `apps`, executar:

```bash
npm --prefix api run start:dev
```

A API fica disponível em `http://127.0.0.1:3000`. Para confirmar o seu estado:

```text
http://127.0.0.1:3000/api/health/live
http://127.0.0.1:3000/api/health/ready
```

O endpoint `live` confirma que o processo está ativo. O endpoint `ready` confirma também que
as dependências necessárias estão operacionais.

### 6.4 Iniciar o frontend

Abrir um segundo terminal na raiz do repositório e executar:

```bash
cd apps
npm --prefix web run dev
```

Abrir `http://127.0.0.1:5173` no browser. Durante o desenvolvimento, o Vite encaminha os
pedidos `/api` e `/socket.io` para a API em `http://127.0.0.1:3000`.

O frontend não precisa de um `.env` no arranque normal. Se a API usar outro endereço, criar
`apps/web/.env` a partir de `apps/web/.env.example` e alterar `VITE_API_PROXY_TARGET`.

### 6.5 Arranques seguintes

Depois da primeira instalação, basta garantir que MongoDB e Redis estão ativos e executar os
dois processos em terminais separados.

Terminal 1 — API:

```bash
cd apps
npm --prefix api run start:dev
```

Terminal 2 — frontend:

```bash
cd apps
npm --prefix web run dev
```

Só é necessário repetir `npm ci` quando for feita uma instalação limpa ou quando o respetivo
`package-lock.json` for alterado. Para parar qualquer um dos processos, premir `Ctrl+C` no
terminal correspondente.

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

- 2026-07-16: expandido o passo a passo de instalação e arranque local da API e do frontend em `apps/`.
- 2026-07-13: adicionadas instruções para arrancar o backend e o frontend a partir de `apps/`.
- 2026-04-17: README reescrito integralmente com estrutura canónica e explicitação dos 2 modos obrigatórios de IA + modo coletivo.
