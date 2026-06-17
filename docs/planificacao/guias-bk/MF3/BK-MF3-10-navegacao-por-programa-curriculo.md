# BK-MF3-10 - Navegação por programa/currículo.

## Header

- `doc_id`: `GUIA-BK-MF3-10`
- `bk_id`: `BK-MF3-10`
- `macro`: `MF3`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF2-07`
- `rf_rnf`: `RF46`
- `fase_documental`: `Fase 2`
- `sprint`: `S07`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-11`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-10-navegacao-por-programa-curriculo.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais implementar navegação por estrutura curricular extraída. O guia parte dos contratos canónicos de RF46, da sequência MF0-MF2 e dos BKs que desbloqueiam este requisito.

#### Importância

Este BK transforma o requisito RF46 numa entrega copiável e testável. A funcionalidade fica no backend, com validação, sessão autenticada e resposta tipada para o frontend. Assim, o aluno percebe o domínio StudyFlow antes de escrever código e não precisa de adivinhar services, DTOs ou endpoints.

#### Scope-in

- Carregar estrutura navegável de um material.
- Mostrar tópicos, secções e referências.
- Guardar consulta para análise técnica.

#### Scope-out

- Gerar programa oficial novo.
- Editar currículo da escola.
- Criar sugestões IA.

#### Estado antes e depois

##### Estado antes

- O fluxo ainda não estava totalmente alinhado com o contrato executável do `real_dev`.
- As rotas, imports, autenticação e testes ainda precisavam de ficar coerentes com a app real.

##### Estado depois

- O BK apresenta endpoint `POST /api/curriculum/navigation`, DTO, backend, frontend, validações e handoff para `BK-MF3-11`.
- O código apresentado valida sessão, ownership ou membership antes de ler ou gravar dados.

##### Decisões de escopo

- Prioridade, owner, dependências, sprint e RF são CANONICO porque vêm de `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`.
- O endpoint `POST /api/curriculum/navigation` é DERIVADO como contrato técnico mínimo para cumprir RF46 sem contrariar os documentos canónicos.
- Usar `SessionGuard` e `AuthenticatedUser` é DERIVADO dos BKs anteriores e obrigatório para manter ownership e membership no backend.
- A resposta do frontend usa `credentials: 'include'` porque a sessão vem de cookie HttpOnly.

#### Pre-requisitos

- `BK-MF2-07` com job indexado.
- `BK-MF2-08` com `MaterialStructureService.get`.

#### Glossário

- **Actor autenticado**: utilizador obtido da sessão segura, nunca do body.
- **DTO**: classe que valida dados de entrada antes de chegarem ao service.
- **Service**: camada que aplica regras de domínio, ownership e membership.
- **Controller**: camada que expõe o endpoint HTTP e delega no service.
- **Schema Mongoose**: contrato de persistência em MongoDB para dados novos do BK.
- **Frontend client**: função tipada que chama a API com cookie de sessão.

#### Conceitos teóricos essenciais

##### Conceitos de domínio StudyFlow

- Estrutura curricular vem dos tópicos e secções extraídos em BK-MF2-08.
- Navegação organiza o material para estudo sequencial.
- O backend valida o job antes de mostrar a estrutura.
- Sem estrutura extraída, a resposta deve explicar que o material ainda precisa desse passo.

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

- Endpoint: `POST /api/curriculum/navigation`.
- Backend: `real_dev/api/src/modules/curriculum-navigation`.
- Frontend: `real_dev/web/src/features/curriculum-navigation`.
- DTO principal: `CurriculumNavigationDto`.
- Service principal: `CurriculumNavigationService`.
- Controller principal: `CurriculumNavigationController`.
- Módulo principal: `CurriculumNavigationModule`.
- Handoff: `BK-MF3-11`.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/api/src/modules/curriculum-navigation/dto/curriculum-navigation.dto.ts`
- CRIAR: `real_dev/api/src/modules/curriculum-navigation/schemas/curriculum-navigation-log.schema.ts`
- CRIAR: `real_dev/api/src/modules/curriculum-navigation/curriculum-navigation.service.ts`
- CRIAR: `real_dev/api/src/modules/curriculum-navigation/curriculum-navigation.controller.ts`
- CRIAR: `real_dev/api/src/modules/curriculum-navigation/curriculum-navigation.module.ts`
- CRIAR: `real_dev/web/src/features/curriculum-navigation/load-curriculum-navigation.ts`
- CRIAR: `real_dev/web/src/features/curriculum-navigation/curriculum-navigation-panel.tsx`
- REVER: `real_dev/api/src/app.module.ts` para importar o módulo criado.

#### Tutorial técnico linear



### Passo 1 - Definir o DTO validado

1. Objetivo funcional do passo no contexto da app.
   Garantir que o endpoint recebe dados claros e rejeita input inválido antes do service.
2. Ficheiros envolvidos:
   - CRIAR: `real_dev/api/src/modules/curriculum-navigation/dto/curriculum-navigation.dto.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o DTO com validações declarativas e nomes iguais ao payload documentado neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/curriculum-navigation/dto/curriculum-navigation.dto.ts
import { ArrayMinSize, IsArray, IsMongoId } from "class-validator";

/**
 * Pedido de navegação curricular sobre jobs autorizados.
 */
export class CurriculumNavigationDto {
    /**
     * Jobs indexados usados para construir tópicos e secções.
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
   Envia para `POST /api/curriculum/navigation` um body vazio e confirma que a validação devolve `400`.
7. Cenário negativo/erro esperado.
   Não aceites IDs de aluno no body. O utilizador vem da sessão autenticada.

### Passo 2 - Criar o schema de persistência

1. Objetivo funcional do passo no contexto da app.
   Guardar dados mínimos do fluxo para histórico, defesa e integração com BKs seguintes.
2. Ficheiros envolvidos:
   - CRIAR: `real_dev/api/src/modules/curriculum-navigation/schemas/curriculum-navigation-log.schema.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o schema Mongoose do resultado produzido por este BK.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/curriculum-navigation/schemas/curriculum-navigation-log.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CurriculumNavigationLogDocument =
    HydratedDocument<CurriculumNavigationLog>;

/**
 * Log mínimo de navegação curricular gerada.
 */
@Schema({ timestamps: true })
export class CurriculumNavigationLog {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    actorId!: Types.ObjectId;

    @Prop({ required: true, type: [Types.ObjectId] })
    jobIds!: Types.ObjectId[];

    @Prop({ required: true })
    topicCount!: number;
}

export const CurriculumNavigationLogSchema = SchemaFactory.createForClass(
    CurriculumNavigationLog,
);
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
   - CRIAR: `real_dev/api/src/modules/curriculum-navigation/curriculum-navigation.service.ts`
   - LOCALIZAÇÃO: `classe completa do service`
3. Instruções do que fazer.
   Cria o service e injeta apenas módulos herdados ou ficheiros criados neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/curriculum-navigation/curriculum-navigation.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    MaterialIndexJobView,
    MaterialIndexService,
} from "../material-index/material-index.service.js";
import { CurriculumNavigationDto } from "./dto/curriculum-navigation.dto.js";
import {
    CurriculumNavigationLog,
    CurriculumNavigationLogDocument,
} from "./schemas/curriculum-navigation-log.schema.js";

export type CurriculumSection = {
    title: string;
    locator: string;
    excerpt: string;
};

export type CurriculumTopic = {
    title: string;
    materialId: string;
    sections: CurriculumSection[];
};

export type CurriculumNavigationResponse = {
    topics: CurriculumTopic[];
};

/**
 * Serviço de navegação por programa/currículo derivada de chunks indexados.
 */
@Injectable()
export class CurriculumNavigationService {
    constructor(
        @InjectModel(CurriculumNavigationLog.name)
        private readonly logModel: Model<CurriculumNavigationLogDocument>,
        private readonly materialIndexService: MaterialIndexService,
    ) {}

    /**
     * Cria uma árvore simples de tópicos e secções autorizadas.
     *
     * @param actor Utilizador autenticado.
     * @param input Jobs autorizados.
     * @returns Navegação curricular.
     */
    async load(
        actor: AuthenticatedUser,
        input: CurriculumNavigationDto,
    ): Promise<CurriculumNavigationResponse> {
        const jobs = await Promise.all(
            input.jobIds.map((jobId) =>
                this.materialIndexService.findReadableDoneJob(actor, jobId),
            ),
        );
        const topics = this.buildTopics(jobs);
        await this.logModel.create({
            actorId: new Types.ObjectId(actor.id),
            jobIds: input.jobIds.map((jobId) => new Types.ObjectId(jobId)),
            topicCount: topics.length,
        });
        return { topics };
    }

    /**
     * Agrupa chunks por material para formar tópicos navegáveis.
     *
     * @param jobs Jobs autorizados.
     * @returns Tópicos curriculares.
     */
    private buildTopics(jobs: MaterialIndexJobView[]): CurriculumTopic[] {
        return jobs.map((job) => ({
            title: this.topicTitle(job),
            materialId: job.materialId,
            sections: job.extractedTextChunks.slice(0, 12).map((chunk) => ({
                title: chunk.sourceLabel,
                locator: chunk.locator,
                excerpt: chunk.text.trim().slice(0, 260),
            })),
        }));
    }

    /**
     * Define título estável sem depender de metadados inexistentes.
     *
     * @param job Job de indexação.
     * @returns Título do tópico.
     */
    private topicTitle(job: MaterialIndexJobView): string {
        const firstChunk = job.extractedTextChunks[0];
        return firstChunk?.sourceLabel ?? `Material ${job.materialId}`;
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
   Ligar `POST /api/curriculum/navigation` ao service sem colocar regras sensíveis no controller.
2. Ficheiros envolvidos:
   - CRIAR: `real_dev/api/src/modules/curriculum-navigation/curriculum-navigation.controller.ts`
   - LOCALIZAÇÃO: `classe completa do controller`
3. Instruções do que fazer.
   Cria o controller com `SessionGuard`, `@Req() request: AuthenticatedRequest` e delegação direta para o service.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/curriculum-navigation/curriculum-navigation.controller.ts
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CurriculumNavigationService } from "./curriculum-navigation.service.js";
import { CurriculumNavigationDto } from "./dto/curriculum-navigation.dto.js";

/**
 * Endpoint de navegação por programa/currículo.
 */
@Controller("api/curriculum/navigation")
@UseGuards(SessionGuard)
export class CurriculumNavigationController {
    constructor(private readonly navigationService: CurriculumNavigationService) {}

    /**
     * Carrega tópicos e secções a partir de jobs autorizados.
     *
     * @param request Pedido autenticado.
     * @param body Jobs alvo.
     * @returns Navegação curricular.
     */
    @Post()
    load(
        @Req() request: AuthenticatedRequest,
        @Body() body: CurriculumNavigationDto,
    ) {
        return this.navigationService.load(request.user!, body);
    }
}
```

5. Explicação do código.
   O controller transforma HTTP em chamada de aplicação. A autorização continua no service para que testes unitários cubram o comportamento sem depender de HTTP.
6. Validação do passo.
   Faz um pedido sem cookie para `POST /api/curriculum/navigation` e confirma `401 Unauthorized`.
7. Cenário negativo/erro esperado.
   Não leias `userId` do body ou da query string; o `SessionGuard` deve anexar o utilizador ao `request` autenticado.

### Passo 5 - Publicar o módulo NestJS

1. Objetivo funcional do passo no contexto da app.
   Permitir que a aplicação carregue controller, service, schema e dependências num módulo coeso.
2. Ficheiros envolvidos:
   - CRIAR: `real_dev/api/src/modules/curriculum-navigation/curriculum-navigation.module.ts`
   - EDITAR: `real_dev/api/src/app.module.ts`
   - LOCALIZAÇÃO: `módulo completo e lista de imports do AppModule`
3. Instruções do que fazer.
   Cria o módulo e adiciona `CurriculumNavigationModule` à lista de imports do AppModule, preservando os módulos existentes.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/curriculum-navigation/curriculum-navigation.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialIndexModule } from "../material-index/material-index.module.js";
import { CurriculumNavigationController } from "./curriculum-navigation.controller.js";
import { CurriculumNavigationService } from "./curriculum-navigation.service.js";
import {
    CurriculumNavigationLog,
    CurriculumNavigationLogSchema,
} from "./schemas/curriculum-navigation-log.schema.js";

/**
 * Módulo MF3 de navegação curricular.
 */
@Module({
    imports: [
        AuthModule,
        MaterialIndexModule,
        MongooseModule.forFeature([
            {
                name: CurriculumNavigationLog.name,
                schema: CurriculumNavigationLogSchema,
            },
        ]),
    ],
    controllers: [CurriculumNavigationController],
    providers: [CurriculumNavigationService],
})
export class CurriculumNavigationModule {}
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
   - CRIAR: `real_dev/web/src/features/curriculum-navigation/load-curriculum-navigation.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria uma função de API com payload e resposta tipados.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/web/src/features/curriculum-navigation/load-curriculum-navigation.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type CurriculumNavigationResponse = {
    topics: {
        title: string;
        materialId: string;
        sections: { title: string; locator: string; excerpt: string }[];
    }[];
};

/**
 * Carrega tópicos curriculares a partir de jobs autorizados.
 *
 * @param input Jobs indexados.
 * @returns Tópicos e secções.
 */
export function loadCurriculumNavigation(input: {
    jobIds: string[];
}): Promise<CurriculumNavigationResponse> {
    return requestMf3Json<CurriculumNavigationResponse>(
        "/api/curriculum/navigation",
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
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
   - CRIAR: `real_dev/web/src/features/curriculum-navigation/curriculum-navigation-panel.tsx`
   - LOCALIZAÇÃO: `componente completo`
3. Instruções do que fazer.
   Cria o componente com formulário, loading, erro, vazio e sucesso.
4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/features/curriculum-navigation/curriculum-navigation-panel.tsx
import { FormEvent, useState } from "react";
import {
    CurriculumNavigationResponse,
    loadCurriculumNavigation,
} from "./load-curriculum-navigation.js";

/**
 * Painel de navegação curricular.
 *
 * @returns Formulário e tópicos.
 */
export function CurriculumNavigationPanel() {
    const [jobIds, setJobIds] = useState("");
    const [response, setResponse] = useState<CurriculumNavigationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            setResponse(
                await loadCurriculumNavigation({
                    jobIds: jobIds.split(",").map((jobId) => jobId.trim()).filter(Boolean),
                }),
            );
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Currículo</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Jobs
                    <input value={jobIds} onChange={(event) => setJobIds(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={loading || jobIds.trim().length === 0}>
                    {loading ? "A carregar..." : "Carregar"}
                </button>
            </form>
            <div className="grid gap-2">
                {response?.topics.map((topic) => (
                    <article className="rounded-md border border-slate-200 p-3 text-sm" key={topic.materialId}>
                        <strong>{topic.title}</strong>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
                            {topic.sections.map((section) => (
                                <li key={`${topic.materialId}-${section.locator}`}>
                                    {section.title} · {section.locator}
                                </li>
                            ))}
                        </ul>
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
   - REVER: `real_dev/api/src/modules/mf3-http-contracts.spec.ts`
   - LOCALIZAÇÃO: `teste de contrato MF3 e teste unitário do módulo`
3. Instruções do que fazer.
   Revê os testes Jest já configurados para a MF3 e confirma o cenário deste BK sem adicionar dependências novas.
4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação: usa os testes Jest existentes em `real_dev/api/src/modules/mf3-http-contracts.spec.ts` e o teste unitário do módulo correspondente, sem adicionar dependências novas.

5. Explicação do código.
   A validação usa Jest e os testes de contrato existentes da MF3 para confirmar rota, autenticação, DTO e cenário negativo sem introduzir dependências HTTP externas.
6. Validação do passo.
   Executa os testes unitários da API e confirma que o ficheiro `real_dev/api/src/modules/mf3-http-contracts.spec.ts` cobre o endpoint documentado.
7. Cenário negativo/erro esperado.
   Não marques o BK como concluído sem pelo menos um negativo de autenticação/autorização e um negativo de validação.

#### Critérios de aceite

##### Expected results

- Pedido válido para `POST /api/curriculum/navigation` devolve `200 OK` com tópicos e secções autorizadas.
- Pedido sem sessão devolve `401 Unauthorized`.
- Pedido com dados inválidos devolve `400 Bad Request`.
- Pedido sem ownership, membership ou fonte autorizada devolve `403 Forbidden`, `404 Not Found` ou `422 Unprocessable Entity`.
- O frontend mostra loading, erro, vazio e sucesso sem guardar tokens.

##### Critérios de aceite mensuráveis

- O guia usa linguagem pedagógica final e evita referências a processos internos de revisão.
- Todos os passos têm os pontos 1 a 7 e localização concreta.
- O endpoint `POST /api/curriculum/navigation` está alinhado entre controller e cliente frontend.
- O backend valida sessão antes de usar dados do actor.
- O service valida ownership ou membership com services herdados.
- O código TypeScript/TSX tem JSDoc nas declarações relevantes.
- O handoff para `BK-MF3-11` fica claro.

#### Validação final

##### Smoke test

```bash
curl -i -X POST http://localhost:3000/api/curriculum/navigation \
  -H 'Content-Type: application/json' \
  -d '{ "sourceJobId": "job_123" }'
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
- Referência ao requisito `RF46` e ao próximo BK `BK-MF3-11`.

#### Handoff

- Este BK entrega `CurriculumNavigationModule`, `CurriculumNavigationService`, `CurriculumNavigationController` e cliente frontend tipado.
- O próximo BK é `BK-MF3-11`.
- A equipa deve partir dos nomes exactos deste guia para evitar drift de imports.
- Se algum service herdado tiver assinatura diferente na implementação real, ajusta a chamada no PR e regista a diferença no relatório técnico.

#### Changelog

- `2026-06-16`: contratos de autenticação, rotas, imports e caminhos alinhados com `real_dev`.
- `2026-06-13`: versão pedagógica inicial com tutorial linear e código integrado por passo.
