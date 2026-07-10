# BK-MF3-09 - Pesquisa unificada por tópico/conceito/material.

## Header

- `doc_id`: `GUIA-BK-MF3-09`
- `bk_id`: `BK-MF3-09`
- `macro`: `MF3`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-07`
- `rf_rnf`: `RF45`
- `fase_documental`: `Fase 2`
- `sprint`: `S07`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-10`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-09-pesquisa-unificada-por-topico-conceito-material.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar pesquisa unificada com origem e permissões. O guia parte dos contratos canónicos de RF45, da sequência MF0-MF2 e dos BKs que desbloqueiam este requisito.

#### Importância

Este BK transforma o requisito RF45 numa entrega copiável e testável. A funcionalidade fica no backend, com validação, sessão autenticada e resposta tipada para o frontend. Assim, o aluno percebe o domínio StudyFlow antes de escrever código e não precisa de adivinhar services, DTOs ou endpoints.

#### Scope-in

- Pesquisar em materiais indexados autorizados.
- Devolver origem e excerto.
- Registar query para auditoria técnica.

#### Scope-out

- Ranking semântico avançado.
- Pesquisa fora de fontes autorizadas.
- Sugestões automáticas de IA.

#### Estado antes e depois

##### Estado antes

- O fluxo ainda não estava totalmente alinhado com o contrato executável do `real_dev`.
- As rotas, imports, autenticação e testes ainda precisavam de ficar coerentes com a app real.

##### Estado depois

- O BK apresenta endpoint `POST /api/search`, DTO, backend, frontend, validações e handoff para `BK-MF3-10`.
- O código apresentado valida sessão, ownership ou membership antes de ler ou gravar dados.

##### Decisões de escopo

- Prioridade, owner, dependências, sprint e RF são CANONICO porque vêm de `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`.
- O endpoint `POST /api/search` é DERIVADO como contrato técnico mínimo para cumprir RF45 sem contrariar os documentos canónicos.
- Usar `SessionGuard` e `AuthenticatedUser` é DERIVADO dos BKs anteriores e obrigatório para manter ownership e membership no backend.
- A resposta do frontend usa `credentials: 'include'` porque a sessão vem de cookie HttpOnly.

#### Pre-requisitos

- `BK-MF2-07` com indexação e chunks.
- `BK-MF2-10` com separação entre aluno, professor e turma.

#### Glossário

- **Actor autenticado**: utilizador obtido da sessão segura, nunca do body.
- **DTO**: classe que valida dados de entrada antes de chegarem ao service.
- **Service**: camada que aplica regras de domínio, ownership e membership.
- **Controller**: camada que expõe o endpoint HTTP e delega no service.
- **Schema Mongoose**: contrato de persistência em MongoDB para dados novos do BK.
- **Frontend client**: função tipada que chama a API com cookie de sessão.

#### Conceitos teóricos essenciais

##### Conceitos de domínio StudyFlow

- Pesquisa unificada encontra resultados por tópico, conceito ou material.
- O backend só pesquisa jobs autorizados através de `MaterialIndexService.findDoneJob`.
- Cada resultado inclui origem, locator e excerto para o aluno saber de onde veio.
- A pesquisa não substitui IA; ela mostra fontes e prepara navegação curricular.

##### Conceitos backend

- O controller recebe HTTP, mas não decide permissões.
- O service valida sessão, ownership ou membership antes de tocar em dados sensíveis.
- O DTO protege o service contra campos vazios, tipos errados e payloads demasiado grandes.
- O módulo NestJS liga controller, service, schemas e módulos herdados.

##### Conceitos frontend

- O componente React separa input, loading, erro, sucesso e vazio.
- O cliente API é tipado para alinhar payload e resposta.
- `credentials: 'include'` envia o cookie HttpOnly sem guardar tokens no browser.

##### Conceitos de segurança

- O frontend nunca envia `userId` como fonte de verdade.
- O backend valida membership ou ownership com services herdados.
- Erros negativos são controlados com `400`, `401`, `403`, `404`, `422` ou `503`, conforme a causa.

#### Arquitetura do BK

- Endpoint: `POST /api/search`.
- Backend: `apps/api/src/modules/unified-search`.
- Frontend: `apps/web/src/features/unified-search`.
- DTO principal: `UnifiedSearchDto`.
- Service principal: `UnifiedSearchService`.
- Controller principal: `UnifiedSearchController`.
- Módulo principal: `UnifiedSearchModule`.
- Handoff: `BK-MF3-10`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/unified-search/dto/unified-search.dto.ts`
- CRIAR: `apps/api/src/modules/unified-search/schemas/unified-search-log.schema.ts`
- CRIAR: `apps/api/src/modules/unified-search/unified-search.service.ts`
- CRIAR: `apps/api/src/modules/unified-search/unified-search.controller.ts`
- CRIAR: `apps/api/src/modules/unified-search/unified-search.module.ts`
- CRIAR: `apps/web/src/features/unified-search/run-unified-search.ts`
- CRIAR: `apps/web/src/features/unified-search/unified-search-panel.tsx`
- REVER: `apps/api/src/app.module.ts` para importar o módulo criado.

#### Tutorial técnico linear



### Passo 1 - Definir o DTO validado

1. Objetivo funcional do passo no contexto da app.
   Garantir que o endpoint recebe dados claros e rejeita input inválido antes do service.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/unified-search/dto/unified-search.dto.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o DTO com validações declarativas e nomes iguais ao payload documentado neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/unified-search/dto/unified-search.dto.ts
import {
    ArrayMinSize,
    IsArray,
    IsMongoId,
    IsString,
    MaxLength,
    MinLength,
} from "class-validator";

/**
 * Pesquisa textual sobre jobs de indexação autorizados.
 */
export class UnifiedSearchDto {
    /**
     * Termo, tópico ou conceito pesquisado.
     */
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    query!: string;

    /**
     * Jobs `DONE` onde o utilizador já tem autorização.
     */
    @IsArray()
    @ArrayMinSize(1)
    @IsMongoId({ each: true })
    jobIds!: string[];
}
```

5. Explicação do código.
   O DTO define o contrato de entrada. Cada campo tem JSDoc para explicar de onde vem e que erro evita. As validações devolvem `400 Bad Request` antes de qualquer leitura de dados.
6. Validação do passo.
   Envia para `POST /api/search` um body vazio e confirma que a validação devolve `400`.
7. Cenário negativo/erro esperado.
   Não aceites IDs de aluno no body. O utilizador vem da sessão autenticada.

### Passo 2 - Criar o schema de persistência

1. Objetivo funcional do passo no contexto da app.
   Guardar dados mínimos do fluxo para histórico, defesa e integração com BKs seguintes.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/unified-search/schemas/unified-search-log.schema.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o schema Mongoose do resultado produzido por este BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/unified-search/schemas/unified-search-log.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UnifiedSearchLogDocument = HydratedDocument<UnifiedSearchLog>;

/**
 * Log mínimo de pesquisa para auditoria técnica.
 */
@Schema({ timestamps: true })
export class UnifiedSearchLog {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    actorId!: Types.ObjectId;

    @Prop({ required: true })
    query!: string;

    @Prop({ required: true, type: [Types.ObjectId] })
    jobIds!: Types.ObjectId[];

    @Prop({ required: true })
    resultCount!: number;
}

export const UnifiedSearchLogSchema =
    SchemaFactory.createForClass(UnifiedSearchLog);
```

5. Explicação do código.
   O schema evita respostas soltas: a app guarda quem executou o fluxo, que dados foram usados e que resultado foi devolvido. Isto permite testes e continuidade.
6. Validação do passo.
   Arranca a API depois do módulo e confirma que o schema é registado pelo NestJS.
7. Cenário negativo/erro esperado.
   Não guardes segredos, tokens ou dados de outros contextos neste documento.

### Passo 3 - Implementar o service de aplicação

1. Objetivo funcional do passo no contexto da app.
   Concentrar regras de negócio, ownership, membership, erros e efeitos de persistência num ponto testável.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/unified-search/unified-search.service.ts`
   - LOCALIZAÇÃO: `classe completa do service`
3. Instruções do que fazer.
   Cria o service e injeta apenas módulos herdados ou ficheiros criados neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/unified-search/unified-search.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    MaterialIndexJobView,
    MaterialIndexService,
} from "../material-index/material-index.service.js";
import { MaterialTextChunk } from "../material-index/schemas/material-index-job.schema.js";
import { UnifiedSearchDto } from "./dto/unified-search.dto.js";
import {
    UnifiedSearchLog,
    UnifiedSearchLogDocument,
} from "./schemas/unified-search-log.schema.js";

export type UnifiedSearchResult = {
    jobId: string;
    materialId: string;
    sourceLabel: string;
    locator: string;
    excerpt: string;
};

export type UnifiedSearchResponse = {
    query: string;
    results: UnifiedSearchResult[];
};

/**
 * Serviço de pesquisa unificada sobre fontes já autorizadas.
 */
@Injectable()
export class UnifiedSearchService {
    constructor(
        @InjectModel(UnifiedSearchLog.name)
        private readonly logModel: Model<UnifiedSearchLogDocument>,
        private readonly materialIndexService: MaterialIndexService,
    ) {}

    /**
     * Pesquisa em chunks autorizados e devolve origem de cada resultado.
     *
     * @param actor Utilizador autenticado.
     * @param input Query e jobs alvo.
     * @returns Resultados com excertos.
     */
    async search(
        actor: AuthenticatedUser,
        input: UnifiedSearchDto,
    ): Promise<UnifiedSearchResponse> {
        const jobs = await Promise.all(
            input.jobIds.map((jobId) =>
                this.materialIndexService.findReadableDoneJob(actor, jobId),
            ),
        );
        const results = jobs.flatMap((job) => this.searchJob(job, input.query));
        await this.logModel.create({
            actorId: new Types.ObjectId(actor.id),
            query: input.query.trim(),
            jobIds: input.jobIds.map((jobId) => new Types.ObjectId(jobId)),
            resultCount: results.length,
        });
        return { query: input.query.trim(), results };
    }

    /**
     * Pesquisa textual simples num job autorizado.
     *
     * @param job Job validado.
     * @param query Texto pesquisado.
     * @returns Resultados do job.
     */
    private searchJob(
        job: MaterialIndexJobView,
        query: string,
    ): UnifiedSearchResult[] {
        const normalizedQuery = query.trim().toLowerCase();
        return job.extractedTextChunks
            .filter((chunk) => this.matches(chunk, normalizedQuery))
            .slice(0, 10)
            .map((chunk) => ({
                jobId: job._id,
                materialId: job.materialId,
                sourceLabel: chunk.sourceLabel,
                locator: chunk.locator,
                excerpt: this.excerpt(chunk.text, normalizedQuery),
            }));
    }

    /**
     * Valida se um chunk contém a pesquisa ou um dos seus termos úteis.
     *
     * @param chunk Chunk indexado.
     * @param query Pesquisa normalizada.
     * @returns `true` quando há correspondência.
     */
    private matches(chunk: MaterialTextChunk, query: string): boolean {
        const text = chunk.text.toLowerCase();
        if (text.includes(query)) return true;
        return query
            .split(/\W+/)
            .filter((term) => term.length >= 4)
            .some((term) => text.includes(term));
    }

    /**
     * Gera excerto curto em torno da primeira ocorrência encontrada.
     *
     * @param text Texto do chunk.
     * @param query Pesquisa normalizada.
     * @returns Excerto público.
     */
    private excerpt(text: string, query: string): string {
        const lower = text.toLowerCase();
        const index = lower.indexOf(query);
        const start = index >= 0 ? Math.max(0, index - 80) : 0;
        return text.slice(start, start + 360).trim();
    }
}
```

5. Explicação do código.
   O service recebe o actor autenticado, valida o contexto com services de BKs anteriores e só depois lê, grava ou chama IA. Isto impede que a UI contorne regras de segurança.
6. Validação do passo.
   Cria testes unitários para sessão válida, contexto proibido e dados insuficientes.
7. Cenário negativo/erro esperado.
   Não faças consultas diretas por ID sem validar owner ou membership.

### Passo 4 - Expor o endpoint no controller

1. Objetivo funcional do passo no contexto da app.
   Ligar `POST /api/search` ao service sem colocar regras sensíveis no controller.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/unified-search/unified-search.controller.ts`
   - LOCALIZAÇÃO: `classe completa do controller`
3. Instruções do que fazer.
   Cria o controller com `SessionGuard`, `@Req() request: AuthenticatedRequest` e delegação direta para o service.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/unified-search/unified-search.controller.ts
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UnifiedSearchDto } from "./dto/unified-search.dto.js";
import { UnifiedSearchService } from "./unified-search.service.js";

/**
 * Endpoint de pesquisa unificada.
 */
@Controller("api/search")
@UseGuards(SessionGuard)
export class UnifiedSearchController {
    constructor(private readonly searchService: UnifiedSearchService) {}

    /**
     * Pesquisa em jobs autorizados.
     *
     * @param request Pedido autenticado.
     * @param body Query e jobs.
     * @returns Resultados com origem.
     */
    @Post()
    search(@Req() request: AuthenticatedRequest, @Body() body: UnifiedSearchDto) {
        return this.searchService.search(request.user!, body);
    }
}
```

5. Explicação do código.
   O controller transforma HTTP em chamada de aplicação. A autorização continua no service para que testes unitários cubram o comportamento sem depender de HTTP.
6. Validação do passo.
   Faz um pedido sem cookie para `POST /api/search` e confirma `401 Unauthorized`.
7. Cenário negativo/erro esperado.
   Não leias `userId` do body ou da query string; o `SessionGuard` deve anexar o utilizador ao `request` autenticado.

### Passo 5 - Publicar o módulo NestJS

1. Objetivo funcional do passo no contexto da app.
   Permitir que a aplicação carregue controller, service, schema e dependências num módulo coeso.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/unified-search/unified-search.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
   - LOCALIZAÇÃO: `módulo completo e lista de imports do AppModule`
3. Instruções do que fazer.
   Cria o módulo e adiciona `UnifiedSearchModule` à lista de imports do AppModule, preservando os módulos existentes.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/unified-search/unified-search.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialIndexModule } from "../material-index/material-index.module.js";
import {
    UnifiedSearchLog,
    UnifiedSearchLogSchema,
} from "./schemas/unified-search-log.schema.js";
import { UnifiedSearchController } from "./unified-search.controller.js";
import { UnifiedSearchService } from "./unified-search.service.js";

/**
 * Módulo MF3 de pesquisa unificada por fontes indexadas.
 */
@Module({
    imports: [
        AuthModule,
        MaterialIndexModule,
        MongooseModule.forFeature([
            { name: UnifiedSearchLog.name, schema: UnifiedSearchLogSchema },
        ]),
    ],
    controllers: [UnifiedSearchController],
    providers: [UnifiedSearchService],
})
export class UnifiedSearchModule {}
```

5. Explicação do código.
   O módulo explicita dependências. Se algum import falhar, o erro aparece no arranque da API em vez de surgir no meio do fluxo do aluno.
6. Validação do passo.
   Arranca a API e confirma que o módulo resolve todos os providers.
7. Cenário negativo/erro esperado.
   Não declares outro provider de IA nem dupliques módulos herdados.

### Passo 6 - Criar o cliente frontend tipado

1. Objetivo funcional do passo no contexto da app.
   Isolar a chamada HTTP para que o componente não tenha URLs, métodos ou parsing espalhados.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/unified-search/run-unified-search.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria uma função de API com payload e resposta tipados.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/unified-search/run-unified-search.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type UnifiedSearchResult = {
    jobId: string;
    materialId: string;
    sourceLabel: string;
    locator: string;
    excerpt: string;
};

export type UnifiedSearchResponse = {
    query: string;
    results: UnifiedSearchResult[];
};

/**
 * Pesquisa em jobs de indexação autorizados.
 *
 * @param input Query e jobs.
 * @returns Resultados com origem.
 */
export function runUnifiedSearch(input: {
    query: string;
    jobIds: string[];
}): Promise<UnifiedSearchResponse> {
    return requestMf3Json<UnifiedSearchResponse>("/api/search", {
        method: "POST",
        body: JSON.stringify(input),
    });
}
```

5. Explicação do código.
   `credentials: 'include'` envia o cookie de sessão sem guardar tokens no `localStorage`. O erro é lançado para a UI mostrar feedback controlado.
6. Validação do passo.
   Força a API a devolver erro e confirma que o componente recebe uma exceção.
7. Cenário negativo/erro esperado.
   Não uses `localStorage` para tokens de autenticação.

### Passo 7 - Montar a interface mínima

1. Objetivo funcional do passo no contexto da app.
   Dar ao aluno um ecrã simples para testar o endpoint sem ferramentas externas.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/unified-search/unified-search-panel.tsx`
   - LOCALIZAÇÃO: `componente completo`
3. Instruções do que fazer.
   Cria o componente com formulário, loading, erro, vazio e sucesso.
4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/features/unified-search/unified-search-panel.tsx
import { FormEvent, useState } from "react";
import {
    runUnifiedSearch,
    UnifiedSearchResponse,
} from "./run-unified-search.js";

/**
 * Painel de pesquisa unificada.
 *
 * @returns Formulário e resultados.
 */
export function UnifiedSearchPanel() {
    const [query, setQuery] = useState("");
    const [jobIds, setJobIds] = useState("");
    const [response, setResponse] = useState<UnifiedSearchResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            setResponse(
                await runUnifiedSearch({
                    query,
                    jobIds: jobIds.split(",").map((jobId) => jobId.trim()).filter(Boolean),
                }),
            );
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao pesquisar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Pesquisa</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Pesquisa
                    <input value={query} onChange={(event) => setQuery(event.target.value)} />
                </label>
                <label className="block">
                    Jobs
                    <input value={jobIds} onChange={(event) => setJobIds(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={loading || query.trim().length < 2}>
                    {loading ? "A pesquisar..." : "Pesquisar"}
                </button>
            </form>
            {response && response.results.length === 0 ? (
                <p className="text-sm text-slate-600">Sem resultados.</p>
            ) : null}
            <div className="grid gap-2">
                {response?.results.map((result) => (
                    <article className="rounded-md border border-slate-200 p-3 text-sm" key={`${result.jobId}-${result.locator}`}>
                        <strong>{result.sourceLabel}</strong>
                        <p className="text-slate-600">{result.locator}</p>
                        <p className="text-slate-700">{result.excerpt}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
```

5. Explicação do código.
   O componente valida o fluxo real: envia dados pelo cliente tipado, mostra erros e apresenta a resposta sem expor dados sensíveis.
6. Validação do passo.
   Preenche o formulário, submete e confirma que o resultado aparece sem reload da página.
7. Cenário negativo/erro esperado.
   Não escondas erros; feedback silencioso faz o aluno pensar que a app não respondeu.

### Passo 8 - Fechar validação do BK

1. Objetivo funcional do passo no contexto da app.
   Registar o contrato mínimo que a equipa deve cobrir com testes e evidência.
2. Ficheiros envolvidos:
   - REVER: `apps/api/src/modules/mf3-http-contracts.spec.ts`
   - LOCALIZAÇÃO: `teste de contrato MF3 e teste unitário do módulo`
3. Instruções do que fazer.
   Revê os testes Jest já configurados para a MF3 e confirma o cenário deste BK sem adicionar dependências novas.
4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação: usa os testes Jest existentes em `apps/api/src/modules/mf3-http-contracts.spec.ts` e o teste unitário do módulo correspondente, sem adicionar dependências novas.

5. Explicação do código.
   A validação usa Jest e os testes de contrato existentes da MF3 para confirmar rota, autenticação, DTO e cenário negativo sem introduzir dependências HTTP externas.
6. Validação do passo.
   Executa os testes unitários da API e confirma que o ficheiro `apps/api/src/modules/mf3-http-contracts.spec.ts` cobre o endpoint documentado.
7. Cenário negativo/erro esperado.
   Não marques o BK como concluído sem pelo menos um negativo de autenticação/autorização e um negativo de validação.

#### Critérios de aceite

##### Expected results

- Pedido válido para `POST /api/search` devolve `200 OK` com uma lista de resultados autorizados.
- Pedido sem sessão devolve `401 Unauthorized`.
- Pedido com dados inválidos devolve `400 Bad Request`.
- Pedido sem ownership, membership ou fonte autorizada devolve `403 Forbidden`, `404 Not Found` ou `422 Unprocessable Entity`.
- O frontend mostra loading, erro, vazio e sucesso sem guardar tokens.

##### Critérios de aceite mensuráveis

- O guia usa linguagem pedagógica final e evita referências a processos internos de revisão.
- Todos os passos têm os pontos 1 a 7 e localização concreta.
- O endpoint `POST /api/search` está alinhado entre controller e cliente frontend.
- O backend valida sessão antes de usar dados do actor.
- O service valida ownership ou membership com services herdados.
- O código TypeScript/TSX tem JSDoc nas declarações relevantes.
- O handoff para `BK-MF3-10` fica claro.

#### Validação final

##### Smoke test

```bash
curl -i -X POST http://localhost:3000/api/search \
  -H 'Content-Type: application/json' \
  -d '{ "query": "fotossíntese", "sourceJobIds": ["job_123"] }'
```

##### Negativos obrigatórios

- Sem cookie de sessão: `401 Unauthorized`.
- Campo obrigatório em falta: `400 Bad Request`.
- Recurso de outro aluno, grupo ou turma: `403 Forbidden` ou `404 Not Found`.
- Fonte inexistente ou não processável: `422 Unprocessable Entity` nos fluxos que usam fontes.

#### Evidence para PR/defesa

- Output do smoke test com payload válido.
- Output de pelo menos dois cenários negativos.
- Screenshot ou vídeo curto do painel frontend com sucesso e erro.
- Nota no PR com os documentos canónicos consultados e os requisitos cobertos.
- Referência ao requisito `RF45` e ao próximo BK `BK-MF3-10`.

#### Handoff

- Este BK entrega `UnifiedSearchModule`, `UnifiedSearchService`, `UnifiedSearchController` e cliente frontend tipado.
- O próximo BK é `BK-MF3-10`.
- A equipa deve partir dos nomes exactos deste guia para evitar drift de imports.
- Se algum service herdado tiver assinatura diferente na implementação real, ajusta a chamada no PR e regista a diferença no relatório técnico.

#### Changelog

- `2026-06-16`: contratos de autenticação, rotas, imports e caminhos alinhados com `real_dev`.
- `2026-06-13`: versão pedagógica inicial com tutorial linear e código integrado por passo.
