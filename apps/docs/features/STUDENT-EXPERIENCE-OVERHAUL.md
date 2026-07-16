# Overhaul da experiência de aluno

## Estado

- Implementado em `2026-07-12`.
- Âmbito visual limitado a `STUDENT`.
- Professor e administrador conservam a shell e destinos anteriores.
- Sem dependências novas e sem alteração dos schemas funcionais de salas/grupos.

## Arquitetura de informação

| Destino | Rota | Conteúdo |
| --- | --- | --- |
| Hoje | `/app/hoje` | continuidade, prioridades, recentes e onboarding |
| Estudar | `/app/estudar` | turmas/disciplinas e áreas privadas |
| Em grupo | `/app/em-grupo` | salas guiadas, grupos e salas partilhadas |
| Plano | `/app/plano` | agenda, objetivos e histórico |

`StudentShell` mantém os quatro destinos com texto em desktop e usa bottom
navigation com safe area em mobile. Pesquisa, notificações e conta ficam no header.
Perfil, preferências de notificações, privacidade e saída ficam no menu de conta.

As rotas legacy continuam declaradas e encaminham query e hash relevantes. A rota
antiga de Comunidade interpreta `grupo` e abre `/app/grupos/:groupId`.

## Workspaces

- Turma: Disciplinas, Publicações e Projetos.
- Disciplina: Visão geral, Materiais, Praticar, Conversar e Assistente de estudo.
- Área pessoal: Visão geral, Materiais, Praticar, Assistente de estudo e Definições.
- Grupo: Mensagens e notas, Sessões e Assistente de estudo.
- Plano: Agenda, Objetivos e Histórico.

Cards de contexto têm uma ação primária. Definições, fontes e arquivo da área não
competem com a ação de estudar. Os novos workspaces não pedem IDs técnicos conhecidos
pela rota; materiais próprios são escolhidos por nome.

## Backend e privacidade

### Hoje e continuidade

- `GET /api/student/today` agrega prioridades no servidor e constrói `targetPath`.
- `PUT /api/students/me/recent-context` aceita apenas `kind` e `contextId`.
- Ownership ou membership é revalidado em cada gravação e leitura.
- São guardados no máximo cinco contextos distintos.
- Contextos revogados são omitidos e removidos quando `Hoje` é resolvido.
- `StudentRecentContext` integra exportação e eliminação de dados pessoais.

### Disciplina e pesquisa

- `GET /api/student/subjects/:subjectId/overview` devolve identidade minimizada,
  estado de consulta, contagens, material recente e próximo teste seguro.
- `POST /api/student/search` recebe query e contexto sem `jobIds`.
- A API resolve apenas jobs `DONE` autorizados, limita a 50 fontes e 20 resultados e
  devolve rotas construídas no servidor.

### Personalização pedagógica

`GovernedAiExecutionService` aceita `pedagogicalContext: "STUDENT_PROFILE"`. Quando
ativo, lê o perfil autenticado, normaliza o ano para um estágio canónico e acrescenta
apenas orientação de escrita antes de validar o limite final do prompt. O ano e o curso
não são incluídos no prompt final, interações, artefactos ou logs.

Estágios: `PRIMARY`, `LOWER_SECONDARY`, `UPPER_SECONDARY`, `HIGHER_EDUCATION` e
`UNKNOWN`. A interface não muda com o estágio.

## Onboarding

O cartão aparece em Hoje apenas quando o perfil é `null`. Nome é obrigatório; ano e
curso são opcionais. O ano usa 1.º–12.º, Ensino superior e Prefiro não indicar. Valores
legacy permanecem selecionáveis no Perfil até serem alterados. “Agora não” dura apenas
na sessão do browser e é limpo no logout.

## Validação executada

- build da API e build de produção do frontend;
- bundle budget: percurso do aluno `166.90 KiB` gzip, abaixo do limite de `190 KiB`;
- Jest da API: `145` suites e `776` testes;
- Vitest do frontend: `43` ficheiros e `208` testes;
- Playwright: `34` testes Chromium e matriz crítica `9/9` em Firefox e `9/9` em
  WebKit; helpers e percursos legacy atualizados para a shell canónica;
- Axe sem violações `serious` ou `critical` em Hoje, Estudar, Em grupo e Plano;
- validação visual autenticada em desktop e mobile, incluindo `320 px`, sem overflow
  horizontal, com pesquisa contextual, Escape e restituição de foco;
- technical map e function inventory regenerados e validados;
- testes de redirects, personal data registry, prioridades, onboarding e adaptação
  pedagógica.
