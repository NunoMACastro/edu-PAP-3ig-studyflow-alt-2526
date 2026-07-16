# Materiais Markdown — contrato funcional e técnico

## Âmbito

Esta integração acrescenta GFM seguro aos materiais já existentes, sem criar um
repositório paralelo para turmas ou salas. A fonte canónica é sempre
`markdownSource`; `contentText` e `textContent` são apenas projeções efémeras ou
snapshots autorizados para consumidores de IA.

Contextos suportados:

| Contexto | Autor | Persistência | Visibilidade | IA |
| --- | --- | --- | --- | --- |
| Área privada | Aluno | `Material.markdownSource` | Proprietário | Imediata, apenas na área |
| Disciplina | Professor | `OfficialMaterial.markdownSource` | Rascunho privado; alunos após publicação | Só em `PROCESSED` |
| Sala livre | Aluno | Snapshot em `RoomShare.textContent` | Membros | Snapshot da revisão partilhada |
| Sala guiada | Professor | Referência em `materialIds` | Turma autorizada | Revisão publicada mais recente |

Não há autosave, MDX, HTML raw, Mermaid, LaTeX, embeds, anexos internos nem
histórico/restauro da fonte Markdown. O controlo de concorrência usa
`contentRevision` e `expectedRevision`.

## Estados e revisões

- Markdown privado nasce `READY`, com revisão `1`.
- Markdown oficial nasce `DRAFT`, com revisão `1`, sem notificação e sem acesso
  de alunos ou IA.
- A primeira publicação muda `DRAFT` para `PROCESSED`, define `publishedAt` e
  gera `OFFICIAL_MATERIAL_PUBLISHED` com chave idempotente por material.
- Uma gravação posterior mantém `PROCESSED`, incrementa a revisão e gera
  `OFFICIAL_MATERIAL_UPDATED` com chave material + revisão.
- Repetir a publicação da mesma revisão já publicada não grava nem notifica.
- Markdown é texto pronto: os endpoints de indexação recusam-no com
  `MARKDOWN_INDEX_NOT_REQUIRED`, e a UI não apresenta jobs ou versões.

## Validação canónica

A API usa `unified`, `remark-parse`, `remark-gfm` e `unist-util-visit`. O parser
é carregado apenas quando há Markdown e valida a árvore real, evitando decisões
de segurança baseadas em expressões regulares.

Limites e normalização:

- apenas `.md`; `.mdx` e `.markdown` não são aceites;
- upload bruto até 128 KiB;
- fonte até 20 000 caracteres Unicode e pelo menos 10 visíveis;
- UTF-8 estrito, sem NUL ou controlos proibidos;
- remoção de BOM, normalização NFC, fins de linha LF e uma quebra final;
- `sizeBytes` calculado depois da normalização;
- MIME de upload permitido: `text/markdown`, `text/x-markdown`, `text/plain` ou
  `application/octet-stream`, sempre combinado com extensão `.md`.

O subconjunto GFM aceita headings, listas, tarefas, tabelas, blockquotes, links,
código inline e code fences. HTML raw é rejeitado; HTML dentro de code fences é
texto inerte. Links permitem HTTP, HTTPS, `mailto:`, fragmentos e caminhos
relativos seguros. Imagens só podem declarar HTTP(S), mas o frontend converte-as
sempre num link textual e nunca cria `<img>`.

Códigos públicos estáveis:

- `MARKDOWN_INVALID_UTF8`
- `MARKDOWN_TOO_LARGE`
- `MARKDOWN_RAW_HTML_NOT_ALLOWED`
- `MARKDOWN_UNSAFE_URL`
- `MARKDOWN_EMPTY`
- `MATERIAL_REVISION_CONFLICT`

## API

Todos os endpoints reutilizam sessão, CSRF, ownership/membership e validação
global de DTOs. Uma tentativa de ler um recurso alheio recebe a mesma resposta
de recurso inexistente.

### Área privada

| Método | Endpoint | Função |
| --- | --- | --- |
| `POST` | `/api/study-areas/:studyAreaId/materials` | Criar pelo editor com `type=MARKDOWN` |
| `POST` | `/api/study-areas/:studyAreaId/materials/file` | Upload `.md` editável |
| `GET` | `/api/study-areas/:studyAreaId/materials/:materialId` | Detalhe autorizado |
| `PATCH` | `/api/study-areas/:studyAreaId/materials/:materialId/markdown` | Guardar com `expectedRevision` |
| `GET` | `/api/study-areas/:studyAreaId/materials/:materialId/download` | Descarregar fonte canónica |

### Disciplina oficial

| Método | Endpoint | Função |
| --- | --- | --- |
| `POST` | `/api/teacher/subjects/:subjectId/materials` | Criar rascunho pelo editor |
| `POST` | `/api/teacher/subjects/:subjectId/materials/file` | Upload `.md` como rascunho |
| `GET` | `/api/teacher/subjects/:subjectId/materials/:materialId` | Detalhe docente, incluindo rascunho |
| `PATCH` | `/api/teacher/subjects/:subjectId/materials/:materialId/markdown` | Guardar revisão |
| `POST` | `/api/teacher/subjects/:subjectId/materials/:materialId/publish` | Primeira publicação |
| `GET` | `/api/student/subjects/:subjectId/materials/:materialId` | Detalhe publicado do aluno |
| `GET` | `/api/official-materials/:materialId/download` | Download protegido |

### Sala livre

`POST /api/study-rooms/:roomId/shares` mantém o contrato `MATERIAL_REF`. Para
Markdown, a API copia título, fonte e revisão para a partilha. Alterações futuras
no material privado não alteram o snapshot. Membros descarregam-no em
`GET /api/study-rooms/:roomId/shares/:shareId/download`.

As listagens devolvem apenas metadados, estado, revisão, tamanho e datas. A fonte
completa só é devolvida por detalhes autorizados e por detalhes de sala que já
validaram o contexto.

## Downloads

Todos os downloads Markdown usam UTF-8, LF, sem BOM e:

- `Content-Type: text/markdown; charset=utf-8`
- `Content-Disposition: attachment` com filename sanitizado `.md`
- `Cache-Control: private, no-store`
- `X-Content-Type-Options: nosniff`

O professor pode descarregar o próprio rascunho. O aluno só obtém um Markdown
oficial publicado. Numa sala livre é entregue o snapshot, nunca o original.

## Frontend

`MarkdownViewer` usa `react-markdown`, `remark-gfm`, `skipHtml` e componentes
React fechados, sem `dangerouslySetInnerHTML`. Tabelas e code blocks têm scroll
horizontal; tarefas são read-only; links externos usam `noopener noreferrer`.

`MarkdownEditor` é um `textarea` controlado com:

- fonte e preview lado a lado em desktop;
- tabs Editar/Pré-visualizar em mobile;
- toolbar para heading, negrito, itálico, lista, tarefa, citação, ligação,
  código e tabela;
- contadores de caracteres/bytes;
- gravação explícita e `Ctrl/Cmd+S`;
- aviso de alterações ao fechar/recarregar ou seguir uma ligação;
- foco acessível no erro e recuperação de conflito sem perder o texto local.

O upload e o editor convergem no mesmo detalhe editável. O fluxo de sala guiada
pode abrir diretamente a criação Markdown e regressar ao seletor através de um
`returnTo` limitado a paths internos docentes.

## IA e isolamento

Os loaders comuns projetam a fonte canónica:

- `MaterialsService.listReadyTextSources` para a área privada;
- `OfficialMaterialsService.listProcessedForSubject` para disciplina/turma;
- `RoomSharesService.findUsableSharesForRoom` para snapshots de sala;
- `OfficialMaterialsService.listByIds` para referências vivas de sala guiada.

Materiais são serializados como JSON não confiável nos prompts. Títulos e
conteúdo nunca são instruções a executar e não podem alterar sistema, permissões,
voz ou contrato de output. A fachada governada aplica `maxSourceCount`, preserva
a ordem, reserva 256 caracteres, atribui pelo menos 500 caracteres por fonte
quando possível, distribui o restante e acrescenta um marcador de truncagem. Só
as fontes efetivamente incluídas podem ser citadas. O documento integral continua
disponível na visualização e download.

## Auditoria, RGPD e operação

Auditoria e outbox guardam apenas IDs, tipo, estado, revisão, resultado e tamanho;
nunca título ou `markdownSource`. O registry de dados pessoais inclui a fonte no
export/delete normal de `Material`, mantém a anonimização oficial existente e
remove conteúdo e `materialContentRevision` ao tombstonar `RoomShare`. A versão
do registry é `2026-07-14.1`.

Backups MongoDB incluem naturalmente as fontes. O release de API e web deve ser
coordenado porque ambos precisam de reconhecer `MARKDOWN` e `DRAFT`.

## Gates de validação

Executar a partir de cada package:

```bash
cd real_dev/api
npm run test:markdown
npm test -- --runInBand
npm run build

cd ../web
npm test
npm run build:budget
```

Os testes específicos cobrem normalização, UTF-8, HTML raw, URLs, limites,
estados/revisões, notificações, snapshot de sala, budget de prompts, renderer sem
imagens/HTML executável, toolbar e shortcut de gravação.
