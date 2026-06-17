# Glossario de Termos Tecnicos - PAP (Projeto StudyFlow)

Objetivo: explicar termos tecnicos da documentacao e da planificacao sem linguagem complicada.

## 0) Termos especificos do StudyFlow

### Area de Estudo

- O que e: espaco privado onde o aluno organiza materiais e objetivos.
- No projeto: base para gerar assistente IA personalizado por tema.

### Voz da IA docente

- O que e: estilo pedagogico configurado pelo professor.
- No projeto: ajusta tom, profundidade e formato das explicacoes.

### Guardrails pedagogicos

- O que e: regras que limitam a IA para manter seguranca e rigor academico.
- No projeto: evitam respostas fora de contexto e alucinacoes factuais.

### Co-edicao de apontamentos

- O que e: varios alunos a editar notas em simultaneo com historico.
- No projeto: suporta estudo em grupo e rastreabilidade de contribuicoes.

### Ingestao de materiais

- O que e: processo de importar PDF/DOCX/URL para base de conhecimento.
- No projeto: ativa resumos, quizzes e explicacoes contextualizadas.

### Turma vs Grupo de estudo

- O que e: `turma` e estrutura formal docente; `grupo` e colaboracao livre.
- No projeto: define permissoes, conteudo visivel e politicas de IA.

## 1) Estrutura da documentacao

### BK

- O que e: unidade pequena de trabalho (uma tarefa tecnica rastreavel).
- Para que serve: dividir o projeto em partes controlaveis.
- Exemplo: `BK-MF2-07`.

### Macro (MF0, MF1, ...)

- O que e: conjunto de BK agrupados por tema.
- Para que serve: organizar implementacao por blocos grandes.
- Exemplo: uma macro focada em seguranca ou IA.

### RF (Requisito Funcional)

- O que e: o que o sistema tem de fazer.
- Exemplo: "o utilizador pode criar turma".

### RNF (Requisito Nao Funcional)

- O que e: como o sistema deve funcionar (qualidade, seguranca, performance).
- Exemplo: "resposta em <= 4 segundos".

### Fase documental

- O que e: etapa de maturidade da documentacao.
- Para que serve: indicar nivel de detalhe e rigor esperado.

## 2) Planeamento e gestao

### Backlog

- O que e: lista de trabalho por fazer, ordenada por prioridade.
- Exemplo: `BACKLOG-MVP.md`.

### MVP

- O que e: versao minima do produto que ja entrega valor real.
- Exemplo: login + fluxo principal + evidencias basicas.

### Roadmap

- O que e: plano de evolucao ao longo do tempo.
- Exemplo: macro 0 -> macro 1 -> macro 2.

### Sprint

- O que e: ciclo curto de trabalho (normalmente semanal/quinzenal).
- Exemplo: sprint com foco em BK P0 pendentes.

### KPI

- O que e: indicador numerico para medir progresso/qualidade.
- Exemplo: "% de BK com checklist completa".

### Prioridade (P0, P1, P2)

- P0: critico (Must).
- P1: importante (Should).
- P2: desejavel (Could).

### Estado (TODO, IN_PROGRESS, BLOCKED, DONE)

- TODO: ainda nao iniciado.
- IN_PROGRESS: em execucao.
- BLOCKED: bloqueado por dependencia/problema.
- DONE: concluido.

### Dependencias

- O que e: BK/requisito que precisa estar pronto antes de outro.
- Exemplo: BK-B depende de BK-A.

### Ownership

- O que e: responsabilidade principal por um BK.
- Exemplo: `owner` coordena execucao e fecho.

### Handoff

- O que e: passagem de contexto para quem vai continuar o trabalho.
- Deve incluir: estado, riscos, pendencias, proximos passos.

### Governance

- O que e: conjunto de regras para manter coerencia e qualidade.
- Exemplo: gates obrigatorios + checklist + evidence.

### Scope

- O que e: o que entra no BK atual.
- Objetivo: manter foco.

### Scope-out

- O que e: o que fica explicitamente fora deste BK.
- Objetivo: evitar crescer trabalho sem controlo.

### Gate

- O que e: condicao obrigatoria para fechar um BK/fase.
- Exemplo: sem teste negativo validado, BK nao fecha.

### Stakeholder

- O que e: pessoa/grupo interessado no resultado.
- Exemplo: alunos, professores, orientadores, escola.

## 3) Validacao, testes e entrega

### Smoke test

- O que e: teste rapido ao fluxo principal para ver se nao "partiu".
- Nao substitui testes completos.
- Exemplo: login + abrir dashboard sem erro bloqueante.

### Teste negativo

- O que e: teste de erro/limite.
- Para que serve: provar robustez e controlo de falhas.
- Exemplo: input invalido devolve erro claro.

### Checklist

- O que e: lista objetiva de verificacoes antes de fechar BK.
- Normalmente: smoke, negativos, tecnico.

### Criterios de aceite

- O que e: condicoes mensuraveis para considerar "entregue".
- Exemplo: "funcao X responde em <= 2s".

### Evidence

- O que e: prova concreta da entrega.
- Tipico: `pr`, `proof`, `neg`.

### `pr`

- O que e: referencia do Pull Request/commit.
- Funcao: rastrear o que mudou.

### `proof`

- O que e: prova funcional/tecnica do resultado.
- Exemplo: screenshot, log, output de teste.

### `neg`

- O que e: prova de teste negativo executado.
- Exemplo: tentativa invalida + resposta esperada.

### Regressao

- O que e: algo que funcionava e deixou de funcionar.
- Exemplo: corrigir upload e quebrar pesquisa.

### Artefacto

- O que e: output concreto do trabalho.
- Exemplo: relatorio, log, screenshot, diff, teste.

### Baseline

- O que e: estado de referencia para comparar antes/depois.
- Exemplo: latencia media antes da otimização.

## 4) Arquitetura e desenvolvimento

### Stack tecnologica

- O que e: conjunto de tecnologias do projeto.
- Exemplo: frontend + backend + BD + IA.

### MongoDB

- O que e: base de dados NoSQL orientada a documentos.
- Exemplo: guardar utilizadores, materiais e artefactos IA em colecoes.

### Mongoose

- O que e: ODM para usar MongoDB em Node.js com schemas, validacao e modelos.
- Exemplo: definir `UserSchema` e usar `UserModel` no backend NestJS.

### ODM

- O que e: camada que liga objetos do codigo a documentos da base de dados.
- Exemplo: Mongoose cria modelos para ler e gravar documentos MongoDB.

### Colecao

- O que e: conjunto de documentos MongoDB do mesmo tipo funcional.
- Exemplo: colecao `users`.

### Documento

- O que e: registo individual guardado em MongoDB, normalmente em formato semelhante a JSON.
- Exemplo: documento de um aluno com `_id`, `email` e `passwordHash`.

### ObjectId

- O que e: identificador usado pelo MongoDB para documentos.
- Exemplo: `userId` referencia o `_id` do utilizador.

### Frontend

- O que e: parte visual usada pelo utilizador.
- Exemplo: paginas, botoes, formularios.

### Backend

- O que e: parte de servidor e regras de negocio.
- Exemplo: autenticacao, validacoes, integracoes.

### UI

- O que e: interface visual (aparencia e componentes).

### UX

- O que e: experiencia de uso (facilidade, clareza, fluidez).

### API

- O que e: interface de comunicacao entre sistemas.
- Exemplo: frontend pede dados ao backend.

### Endpoint

- O que e: "ponto" especifico da API (URL + metodo).
- Exemplo: `GET /materiais`.

### Payload

- O que e: dados enviados/recebidos numa chamada.
- Exemplo: JSON com campos do formulario.

### DTO

- O que e: estrutura/formato esperado para trocar dados.
- Objetivo: validar e padronizar input/output.

### Pipeline

- O que e: cadeia automatica de passos (build, teste, deploy).

### CI (Continuous Integration)

- O que e: integrar codigo frequentemente com verificacoes automaticas.

### CD (Continuous Delivery/Deployment)

- O que e: entregar/publicar versoes com automacao.

### Deploy

- O que e: publicar nova versao da aplicacao.

### Rollback

- O que e: voltar para versao anterior estavel apos falha.

### Health-check

- O que e: verificacao simples se o servico esta vivo.
- Exemplo: endpoint `/health`.

### Observabilidade

- O que e: capacidade de perceber estado do sistema por sinais tecnicos.
- Base: logs + metricas + alertas.

### Logs estruturados

- O que e: registos com campos claros (`request_id`, `ator`, `resultado`).

### Metricas

- O que e: valores numericos de comportamento do sistema.
- Exemplo: tempo de resposta, taxa de erro.

### Alertas

- O que e: avisos automaticos quando algo sai do limite.

## 5) Performance e operacao

### Performance

- O que e: rapidez e eficiencia do sistema.

### Latencia

- O que e: tempo entre pedido e resposta.

### Escalabilidade

- O que e: capacidade de aguentar aumento de utilizadores/carga.

### Assincrono / Background

- O que e: tarefa feita "por tras" sem bloquear o utilizador.

### Downtime

- O que e: tempo em que o sistema esta indisponivel.

### Backup

- O que e: copia de seguranca para recuperar dados.

### Auto-recovery

- O que e: recuperacao automatica apos falha.

## 6) Seguranca e privacidade

### RGPD

- O que e: regulamento europeu de protecao de dados pessoais.

### Consentimento

- O que e: permissao explicita para tratar dados.

### SSO

- O que e: autenticar uma vez e usar varios sistemas.

### OAuth

- O que e: protocolo de autorizacao segura entre servicos.

### SAML

- O que e: padrao de autenticacao muito usado em escolas/organizacoes.

### HTTP

- O que e: protocolo base de comunicacao web.

### HTTPS

- O que e: HTTP com cifragem.

### TLS

- O que e: tecnologia de cifragem usada no HTTPS.

### Hashing

- O que e: transformar password em valor irreversivel para guardar com seguranca.

### bcrypt / argon2

- O que e: algoritmos de hashing seguros para passwords.

### XSS

- O que e: injetar script malicioso numa pagina web.

### CSRF

- O que e: forcar pedidos indevidos a partir de sessao autenticada.

### Injection

- O que e: inserir comandos maliciosos em inputs.

### Brute force

- O que e: tentativas repetidas de adivinhar credenciais.

### Sandbox

- O que e: ambiente isolado para processar conteudos de risco.

### Auditoria

- O que e: historico verificavel de acoes importantes.

## 7) IA, dados e integracoes

### Guardrails

- O que e: limites/regras para comportamento seguro da IA.

### Explicabilidade

- O que e: capacidade da IA justificar resposta com criterio/fonte.

### Fonte/Citacao

- O que e: origem da informacao usada na resposta.

### Quotas de IA

- O que e: limites de uso de IA por utilizador/turma/grupo.

### Indexacao

- O que e: transformar documentos em dados pesquisaveis.

### Versionamento

- O que e: guardar historico de versoes de conteudo.

### Cache

- O que e: armazenamento temporario para acelerar respostas.

### Sessao

- O que e: estado do utilizador autenticado entre pedidos.

### UTF-8

- O que e: codificacao de texto padrao para suportar acentos e varios idiomas.

### i18n

- O que e: internacionalizacao (preparar app para multiplos idiomas).

### ICS

- O que e: formato padrao de calendario.

### LMS

- O que e: Learning Management System (plataforma de aprendizagem).

### PDF / DOCX / MD

- O que e: formatos de ficheiro usados em upload/exportacao/documentacao.

## 8) Guia rapido para fechar um BK corretamente

1. Confirmar `dependencias`, `scope` e `RF/RNF`.
2. Implementar fluxo principal com foco no BK.
3. Executar `smoke test` e testes negativos.
4. Validar checklist e criterios de aceite.
5. Registar evidence (`pr`, `proof`, `neg`).
6. Fazer handoff claro para o proximo BK.

---

Documento contextualizado para o dominio do StudyFlow (aprendizagem e acompanhamento academico).
Se quiseres, no passo seguinte eu transformo isto numa versao "resumo de 1 pagina" para revisao da turma e defesa.
