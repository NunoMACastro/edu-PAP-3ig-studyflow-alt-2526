# BK-MF8-02 - IA não pode inventar informação factual.

## Header

- `doc_id`: `GUIA-BK-MF8-02`
- `bk_id`: `BK-MF8-02`
- `macro`: `MF8`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF35`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-03`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais fechar o contrato de anti-alucinação factual da IA: a aplicação só pode devolver uma resposta factual quando existem fontes processáveis, autorizadas e citáveis. Se não houver fontes suficientes, a resposta deve falhar com fallback honesto em vez de parecer correta.

O trabalho é incremental. Vais reaproveitar o módulo de respostas com fontes, garantir que cada `sourceJobId` é validado no backend, limitar excertos públicos, bloquear respostas sem fontes e mostrar esse comportamento na interface sem expor materiais privados.

#### Importância

`RNF35` é CANONICO na planificação StudyFlow: a IA não pode inventar informação factual. Isto é crítico para a defesa PAP porque uma plataforma de estudo só é confiável quando o aluno consegue perceber de onde veio a resposta.

Este BK também reforça `RNF20`, `RNF31`, `RNF32` e `RNF33`: a IA usa apenas fontes autorizadas, não mistura dados de alunos/turmas/salas, respeita perfis já validados e segue limites de IA antes de chamar qualquer provider externo.

#### Scope-in

- Confirmar metadados canónicos de `BK-MF8-02` em matriz, backlog e contrato de campos.
- Implementar normalização de citações públicas no backend.
- Implementar DTO, schema, controller, module e service para `POST /api/ai/source-grounded-answers`.
- Validar cada `sourceJobId` com ownership/membership no backend antes de construir o prompt.
- Bloquear resposta quando não existem fontes processáveis citáveis.
- Chamar consentimento, política de modelo e quota antes do provider.
- Mostrar na UI loading, erro, sucesso e citações públicas limitadas.
- Criar testes para caminho feliz, ausência de fontes, fonte proibida e provider inválido.
- Recolher evidence sem prompts privados, respostas completas sensíveis, cookies, tokens ou materiais integrais.

#### Scope-out

- Alterar IDs, owners, prioridades, esforço, sprint, RF/RNF, dependências ou ordem dos BKs.
- Criar requisitos novos fora de `RNF35`.
- Criar mecanismos avançados de recuperação sem contrato desta fase.
- Deixar o frontend decidir ownership, membership, role ou permissão.
- Guardar tokens, cookies, prompts privados, respostas IA privadas completas, materiais integrais ou dados pessoais em logs/evidence.
- Criar outro endpoint para a mesma responsabilidade de `POST /api/ai/source-grounded-answers`.
- Duplicar policies, models ou services quando o módulo `source-grounded-ai` já concentra esta responsabilidade.

#### Estado antes e depois

- Estado antes: a aplicação já tem contratos de IA com guardrails, perfis, limites docentes e fontes explicáveis, mas ainda falta fechar o requisito que impede respostas factuais sem fontes citáveis.
- Estado depois: `BK-MF8-02` deixa um fluxo completo de resposta factual com fontes obrigatórias: DTO validado, citações públicas normalizadas, service com autorização por fonte, provider isolado, UI com fallback honesto e testes de negativos críticos.

#### Pre-requisitos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`

#### Glossário

- **Resposta factual:** resposta que afirma dados sobre uma matéria, fonte ou conteúdo estudado.
- **Fonte processável:** texto extraído de material autorizado que pode sustentar uma resposta da IA.
- **Job de indexação:** registo técnico que guarda o estado e os chunks extraídos de um material.
- **Chunk:** excerto pequeno de texto com origem e localização, usado para citar sem expor o material completo.
- **Citação pública:** parte segura da fonte mostrada ao aluno: nome, localização e excerto limitado.
- **Fallback honesto:** erro controlado que diz que faltam fontes, sem inventar conteúdo.
- **Provider IA:** integração isolada que gera texto depois de o backend validar fontes, consentimento, política e quota.
- **Ownership:** confirmação backend de que o recurso pertence ao utilizador correto.
- **Membership:** confirmação backend de pertença a sala, grupo, turma ou disciplina antes de ler dados.
- **Evidence:** prova objetiva de execução, com comando, output ou request/response sem dados sensíveis.

#### Conceitos teóricos essenciais

- **Anti-alucinação factual:** é a regra de domínio deste BK. Vem de `RNF35`, entra no backend como bloqueio sem fontes e segue para `BK-MF8-03` como base segura para personalização.
- **DTO:** define a forma permitida do pedido HTTP. Neste BK, impede perguntas demasiado curtas/longas e exige `sourceJobIds` válidos.
- **Controller:** recebe `POST /api/ai/source-grounded-answers`, usa sessão real e passa o pedido ao service. Evita colocar regras de domínio no transporte HTTP.
- **Service:** concentra autorização, seleção de chunks, prompt, quota, provider e persistência. Evita que a UI ou o controller decidam acesso a fontes.
- **Schema/model:** guarda a resposta, pergunta e citações já autorizadas. Evita perder rastreabilidade da resposta factual.
- **Citação limitada:** mostra origem suficiente para defesa e confiança, sem devolver o material completo ao frontend.
- **Consentimento/política/quota:** governança de IA que deve acontecer antes do provider. Evita chamadas não autorizadas, fora de política ou acima da quota.
- **Frontend com `credentials: "include"`:** preserva sessão por cookie HttpOnly. Evita tokens no browser e mantém o backend como autoridade.
- **Teste negativo:** prova que a app falha de forma segura quando não há fontes, quando a fonte é proibida ou quando o provider devolve resposta inválida.
- **Privacidade e RGPD:** prompts, materiais privados, respostas completas e identificadores desnecessários não devem aparecer em logs/evidence.

#### Arquitetura do BK

- Requisito canónico: `RNF35`.
- Endpoint principal: `POST /api/ai/source-grounded-answers`.
- Método HTTP: `POST`.
- Payload: `{ sourceJobIds: string[]; question: string }`.
- DTO: `AskSourceGroundedAiDto`.
- Schema/model: `SourceGroundedAiAnswer` e `SourceGroundedCitation`.
- Controller: `SourceGroundedAiController`.
- Service: `SourceGroundedAiService`.
- Policy reutilizada: `normalizePublicCitation(...)`.
- Frontend: `askSourceGroundedAi(...)` e `SourceGroundedAiPanel`.
- Decisão CANONICO: o BK entrega `RNF35` sem alterar metadados de matriz/backlog.
- Decisões DERIVADO:
  - reutilizar `NO_INDEXED_SOURCES` como erro observável quando não há fontes citáveis;
  - usar `SOURCE_GROUNDED_AI` como finalidade de consentimento, política e quota;
  - limitar excertos públicos a 420 caracteres para provar origem sem expor o material completo.
- Handoff: `BK-MF8-03` pode assumir resposta factual com fontes obrigatórias e sem acesso cruzado.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/src/modules/source-grounded-ai/citation-policy.ts`
- EDITAR: `apps/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`
- EDITAR: `apps/api/src/modules/source-grounded-ai/schemas/source-grounded-ai-answer.schema.ts`
- EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`
- EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts`
- EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- EDITAR: `apps/api/src/modules/source-grounded-ai/citation-policy.spec.ts`
- EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- REVER: `apps/api/src/modules/material-index/material-index.service.ts`
- REVER: `apps/api/src/modules/ai-consents/ai-consents.service.ts`
- REVER: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
- REVER: `apps/api/src/modules/ai-quotas/ai-quotas.service.ts`
- EDITAR: `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
- EDITAR: `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- REVER: `apps/web/src/features/mf3/request-mf3-json.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF8-02` entrega `RNF35` sem alterar metadados canónicos nem duplicar responsabilidades de outros BKs.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - LOCALIZAÇÃO: linha de `RNF35` e linha canónica de `BK-MF8-02`.

3. Instruções do que fazer.

Confirma e regista no PR:

- `CANONICO`: título `IA não pode inventar informação factual.`
- `CANONICO`: owner `Natalia`, apoio `Guilherme`, prioridade `P0`, esforço `M`, sprint `S11`, dependências `-`, próximo BK `BK-MF8-03`.
- `CANONICO`: requisito `RNF35`.
- `DERIVADO`: o erro funcional para falta de fontes será `NO_INDEXED_SOURCES`.
- `DERIVADO`: a finalidade de governança IA será `SOURCE_GROUNDED_AI`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e evita drift antes de editar ficheiros.

5. Explicação do código.

Não existe código neste passo. A entrega aqui é decidir a fronteira correta: este BK fecha factualidade com fontes; não cria pesquisa semântica avançada, não altera owners e não cria outro endpoint.

6. Validação do passo.

Resultado esperado: `BK-MF8-02` continua alinhado com `RNF35`, `P0`, `S11`, `Reforco` e `BK-MF8-03`.

7. Cenário negativo/erro esperado.

Se matriz, backlog e contrato divergirem, não escolhas um valor por preferência. Regista `BLOQUEADO_POR_CONTRATO` no relatório da MF8.


### Passo 2 - Mapear contratos existentes

1. Objetivo funcional do passo no contexto da app.

Identificar os contratos que este BK consome para não duplicar módulos, endpoints ou regras de segurança.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/app.module.ts`
    - REVER: `apps/api/src/common/guards/session.guard.ts`
    - REVER: `apps/api/src/modules/material-index/material-index.service.ts`
    - REVER: `apps/api/src/modules/ai-consents/ai-consents.service.ts`
    - REVER: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
    - REVER: `apps/api/src/modules/ai-quotas/ai-quotas.service.ts`
    - REVER: `apps/web/src/features/mf3/request-mf3-json.ts`
    - LOCALIZAÇÃO: `findReadableDoneJob(...)`, `assertGranted(...)`, `resolveForUse(...)`, `reserveUsage(...)` e `requestMf3Json(...)`.

3. Instruções do que fazer.

Confirma que:

- `SessionGuard` autentica o pedido HTTP.
- `MaterialIndexService.findReadableDoneJob(actor, jobId)` valida ownership/membership e estado `DONE`.
- `AiConsentsService.assertGranted(...)` valida consentimento IA.
- `AiModelPoliciesService.resolveForUse(...)` resolve política ativa.
- `AiQuotasService.reserveUsage(...)` reserva quota antes do provider.
- `requestMf3Json(...)` chama o backend com `credentials: "include"`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é leitura técnica e prepara a integração.

5. Explicação do código.

Não existe código neste passo porque ainda estás a confirmar dependências. O ponto importante é não confiar em `userId`, `sourceJobIds` ou permissões enviados pela UI: o backend valida tudo antes de construir o prompt.

6. Validação do passo.

Resultado esperado: lista fechada de contratos a consumir, sem endpoint duplicado e sem ficheiros inventados.

7. Cenário negativo/erro esperado.

Se encontrares uma chamada a provider antes de validar fontes, consentimento, política e quota, corrige a ordem no passo 4.


### Passo 3 - Normalizar citações, DTO e modelo

1. Objetivo funcional do passo no contexto da app.

Garantir que o backend recebe payload válido, normaliza citações públicas e persiste apenas dados necessários para rastreabilidade.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/source-grounded-ai/citation-policy.ts`
    - EDITAR: `apps/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`
    - EDITAR: `apps/api/src/modules/source-grounded-ai/schemas/source-grounded-ai-answer.schema.ts`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Cria ou substitui os ficheiros abaixo. Mantém os nomes exatamente iguais, porque o service e os testes vão importar estes contratos.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/source-grounded-ai/citation-policy.ts
export type PublicCitation = {
    sourceJobId: string;
    materialId: string;
    sourceLabel: string;
    locator: string;
    excerpt: string;
};

const PUBLIC_EXCERPT_MAX_LENGTH = 420;

/**
 * Normaliza citações públicas para respostas de IA com fontes.
 *
 * @param citation Citação candidata criada depois de validar a fonte.
 * @returns Citação segura para persistência e resposta pública.
 * @throws Error quando falta nome, localização ou excerto verificável.
 */
export function normalizePublicCitation(citation: PublicCitation): PublicCitation {
    const sourceLabel = citation.sourceLabel.trim();
    const locator = citation.locator.trim();
    const excerpt = citation.excerpt.trim();

    // Sem nome de fonte, o aluno não consegue verificar a origem da resposta.
    if (!sourceLabel) {
        throw new Error("A citação precisa de nome de fonte.");
    }

    if (!locator) {
        throw new Error("A citação precisa de página, secção ou chunk.");
    }

    if (!excerpt) {
        throw new Error("A citação precisa de excerto verificável.");
    }

    // O excerto prova a origem sem devolver o material completo ao frontend.
    return {
        ...citation,
        sourceLabel,
        locator,
        excerpt: excerpt.slice(0, PUBLIC_EXCERPT_MAX_LENGTH),
    };
}
```

Explicação do código.

Este ficheiro transforma uma fonte interna num contrato público seguro. Ele existe neste BK porque `RNF35` não fica cumprido se a IA responder sem origem verificável. A função recebe uma citação candidata já autorizada pelo service, remove espaços, bloqueia campos vazios e limita o excerto a 420 caracteres.

O erro evitado é duplo: impedir respostas sem fonte e impedir que o frontend receba páginas inteiras ou material privado completo. O aluno pode adaptar o limite de caracteres se a equipa justificar na defesa, mas não deve remover as validações de `sourceLabel`, `locator` e `excerpt`.

```ts
// apps/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsMongoId,
    IsString,
    MaxLength,
    MinLength,
} from "class-validator";

/**
 * Pedido para resposta baseada exclusivamente em jobs de indexação autorizados.
 */
export class AskSourceGroundedAiDto {
    /**
     * Jobs `DONE` produzidos pela indexação de materiais.
     */
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(8)
    @IsMongoId({ each: true })
    sourceJobIds!: string[];

    /**
     * Pergunta do aluno ou professor sobre a fonte indexada.
     */
    @IsString()
    @MinLength(5)
    @MaxLength(800)
    question!: string;
}
```

Explicação do código.

O DTO valida o pedido antes de chegar ao service. `sourceJobIds` tem de ser uma lista não vazia de Mongo IDs, com limite máximo para não criar prompts enormes. `question` tem tamanho mínimo e máximo para evitar chamadas sem contexto ou prompts demasiado longos.

O DTO não recebe `userId`. Isto é uma regra de segurança: a identidade vem da sessão autenticada, não do body enviado pelo frontend.

```ts
// apps/api/src/modules/source-grounded-ai/schemas/source-grounded-ai-answer.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de IA com fontes obrigatórias usado dentro da persistência.
 */
export type SourceGroundedAiAnswerDocument =
    HydratedDocument<SourceGroundedAiAnswer>;

/**
 * Citação pública associada a uma resposta factual.
 */
@Schema({ _id: false })
export class SourceGroundedCitation {
    @Prop({ required: true })
    sourceJobId!: string;

    @Prop({ required: true })
    materialId!: string;

    @Prop({ required: true })
    sourceLabel!: string;

    @Prop({ required: true })
    locator!: string;

    @Prop({ required: true })
    excerpt!: string;
}

export const SourceGroundedCitationSchema =
    SchemaFactory.createForClass(SourceGroundedCitation);

/**
 * Resposta fundamentada em fontes internas processadas.
 */
@Schema({ timestamps: true })
export class SourceGroundedAiAnswer {
    _id!: { toString(): string };

    // O actorId permite rastrear a resposta sem depender de dados enviados pelo frontend.
    @Prop({ required: true, type: Types.ObjectId, index: true })
    actorId!: Types.ObjectId;

    @Prop({ required: true, type: [Types.ObjectId], index: true })
    sourceJobIds!: Types.ObjectId[];

    @Prop({ required: true })
    question!: string;

    @Prop({ required: true })
    answer!: string;

    // As citações ficam persistidas para auditoria pedagógica e defesa do resultado.
    @Prop({ required: true, type: [SourceGroundedCitationSchema] })
    citations!: SourceGroundedCitation[];
}

export const SourceGroundedAiAnswerSchema = SchemaFactory.createForClass(
    SourceGroundedAiAnswer,
);
```

Explicação do código.

O schema guarda a pergunta, a resposta e as citações usadas. `actorId` vem do utilizador autenticado e permite filtrar histórico sem aceitar identidade no body. `sourceJobIds` cria rastreabilidade até aos materiais processados. `citations` guarda só a parte pública e limitada da fonte.

Isto evita dois erros comuns: perder a prova de onde veio a resposta e persistir excertos sem estrutura. Também prepara auditoria posterior sem guardar cookies, tokens ou materiais completos.

5. Explicação do código.

Os três blocos criam a base de dados e validação do fluxo: DTO para input, policy para citações e schema para persistência. Juntos, transformam `RNF35` em contrato técnico verificável.

6. Validação do passo.

Resultado esperado:

- `AskSourceGroundedAiDto` rejeita listas vazias, IDs inválidos e perguntas demasiado curtas.
- `normalizePublicCitation(...)` rejeita citações sem fonte, localização ou excerto.
- `SourceGroundedAiAnswer` guarda `actorId`, `sourceJobIds`, `question`, `answer` e `citations`.

7. Cenário negativo/erro esperado.

Envia `sourceJobIds: []` ou uma citação com `excerpt: " "`. O backend deve falhar antes de construir prompt ou chamar provider.


### Passo 4 - Integrar backend e contrato HTTP

1. Objetivo funcional do passo no contexto da app.

Ligar `POST /api/ai/source-grounded-answers` ao service que valida fontes, governança IA, provider e persistência.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`
    - EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts`
    - EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
    - REVER: `apps/api/src/app.module.ts`
    - LOCALIZAÇÃO: ficheiros completos e import do módulo no `AppModule`.

3. Instruções do que fazer.

Cria ou substitui os ficheiros abaixo. Depois confirma que `SourceGroundedAiModule` está importado no `AppModule`. O controller deve ficar fino; a regra de domínio fica no service.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskSourceGroundedAiDto } from "./dto/ask-source-grounded-ai.dto.js";
import { SourceGroundedAiService } from "./source-grounded-ai.service.js";

/**
 * Endpoint de respostas com citações obrigatórias.
 */
@Controller("api/ai/source-grounded-answers")
@UseGuards(SessionGuard)
export class SourceGroundedAiController {
    /**
     * Recebe dependências por injeção para manter a classe testável.
     *
     * @param sourceGroundedService Service que aplica regras de domínio e segurança.
     */
    constructor(private readonly sourceGroundedService: SourceGroundedAiService) {}

    /**
     * Cria uma resposta limitada aos jobs de indexação autorizados.
     *
     * @param request Pedido autenticado com utilizador resolvido pela sessão.
     * @param body Jobs e pergunta validados pelo DTO.
     * @returns Resposta factual com citações públicas.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Body() body: AskSourceGroundedAiDto,
    ) {
        // O user vem da sessão para impedir que o frontend peça respostas por outro aluno.
        return this.sourceGroundedService.ask(request.user!, body);
    }
}
```

Explicação do código.

O controller expõe o endpoint `POST /api/ai/source-grounded-answers` e usa `SessionGuard`. Ele não valida ownership, fontes ou provider, porque essas decisões pertencem ao service. Isto evita duplicação e impede que regras sensíveis fiquem espalhadas.

```ts
// apps/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module.js";
import { AiConsentsModule } from "../ai-consents/ai-consents.module.js";
import { AiModelPoliciesModule } from "../ai-model-policies/ai-model-policies.module.js";
import { AiQuotasModule } from "../ai-quotas/ai-quotas.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialIndexModule } from "../material-index/material-index.module.js";
import {
    SourceGroundedAiAnswer,
    SourceGroundedAiAnswerSchema,
} from "./schemas/source-grounded-ai-answer.schema.js";
import { SourceGroundedAiController } from "./source-grounded-ai.controller.js";
import { SourceGroundedAiService } from "./source-grounded-ai.service.js";

/**
 * Módulo de respostas IA com citações internas obrigatórias.
 */
@Module({
    imports: [
        AuthModule,
        AiModule,
        AiConsentsModule,
        AiModelPoliciesModule,
        AiQuotasModule,
        MaterialIndexModule,
        // O schema fica registado no módulo para persistir respostas com rastreabilidade.
        MongooseModule.forFeature([
            {
                name: SourceGroundedAiAnswer.name,
                schema: SourceGroundedAiAnswerSchema,
            },
        ]),
    ],
    controllers: [SourceGroundedAiController],
    providers: [SourceGroundedAiService],
    exports: [SourceGroundedAiService],
})
export class SourceGroundedAiModule {}
```

Explicação do código.

O módulo junta autenticação, materiais, a fachada governada e o schema. O fluxo de domínio nunca injeta nem exporta a integração externa.

```ts
// apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts
import {
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
import { resolveAiBudgetMs } from "../ai/utils/with-ai-response-budget.js";
import { AiConsentsService } from "../ai-consents/ai-consents.service.js";
import {
    AiModelPoliciesService,
    assertPromptWithinLimit,
    type ResolvedAiModelPolicy,
} from "../ai-model-policies/ai-model-policies.service.js";
import { AiQuotasService } from "../ai-quotas/ai-quotas.service.js";
import {
    MaterialIndexJobView,
    MaterialIndexService,
    type MaterialTextChunk,
} from "../material-index/material-index.service.js";
import { normalizePublicCitation } from "./citation-policy.js";
import { AskSourceGroundedAiDto } from "./dto/ask-source-grounded-ai.dto.js";
import {
    SourceGroundedAiAnswer,
    SourceGroundedAiAnswerDocument,
    SourceGroundedCitation,
} from "./schemas/source-grounded-ai-answer.schema.js";

const SOURCE_GROUNDED_AI_PURPOSE = "SOURCE_GROUNDED_AI";

/**
 * Vista pública de IA com fontes obrigatórias, sem detalhes internos de Mongoose.
 */
export type SourceGroundedAiAnswerView = {
    _id: string;
    sourceJobIds: string[];
    question: string;
    answer: string;
    citations: SourceGroundedCitation[];
    createdAt?: Date;
};

/**
 * Serviço de respostas com citações obrigatórias.
 */
@Injectable()
export class SourceGroundedAiService {
    /**
     * Recebe dependências por injeção para manter a classe testável.
     *
     * @param answerModel Modelo Mongoose de respostas fundamentadas.
     * @param materialIndexService Service que valida fontes processáveis autorizadas.
     * @param aiConsentsService Service de consentimento IA.
     * @param aiModelPoliciesService Service de políticas de modelo IA.
     * @param aiQuotasService Service de quotas IA.
     * @param governedAiExecutionService Fachada única de execução IA.
     */
    constructor(
        @InjectModel(SourceGroundedAiAnswer.name)
        private readonly answerModel: Model<SourceGroundedAiAnswerDocument>,
        private readonly materialIndexService: MaterialIndexService,
        private readonly aiConsentsService: AiConsentsService,
        private readonly aiModelPoliciesService: AiModelPoliciesService,
        private readonly aiQuotasService: AiQuotasService,
        private readonly governedAiExecutionService: GovernedAiExecutionService,
    ) {}

    /**
     * Responde com base exclusiva nos jobs de indexação autorizados.
     *
     * @param actor Utilizador autenticado.
     * @param input Pergunta e jobs alvo.
     * @returns Resposta persistida com citações.
     * @throws UnprocessableEntityException quando não há fontes citáveis.
     * @throws ServiceUnavailableException quando o provider falha ou devolve output inválido.
     */
    async ask(
        actor: AuthenticatedUser,
        input: AskSourceGroundedAiDto,
    ): Promise<SourceGroundedAiAnswerView> {
        // Cada job é autorizado individualmente porque a lista pode misturar materiais privados e oficiais.
        const jobs = await Promise.all(
            input.sourceJobIds.map((jobId) =>
                this.materialIndexService.findReadableDoneJob(actor, jobId),
            ),
        );
        const citations = jobs.flatMap((job) =>
            this.selectChunks(job, input.question).map((chunk) =>
                this.toCitation(job, chunk),
            ),
        );

        if (citations.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_INDEXED_SOURCES",
                message: "Os materiais ainda não têm fontes processáveis para citar.",
            });
        }

        await this.aiConsentsService.assertGranted(
            actor.id,
            SOURCE_GROUNDED_AI_PURPOSE,
        );
        const policy = await this.aiModelPoliciesService.resolveForUse(
            SOURCE_GROUNDED_AI_PURPOSE,
        );
        const limitedCitations = citations.slice(0, policy.maxSourceCount);
        const prompt = this.buildPrompt(input.question, limitedCitations);
        assertPromptWithinLimit(prompt, policy);
        await this.aiQuotasService.reserveUsage({
            scope: "USER",
            targetId: actor.id,
            purpose: SOURCE_GROUNDED_AI_PURPOSE,
            units: this.estimateUsageUnits(prompt),
        });

        const answer = await this.generateAnswer(actor, prompt, policy);

        // Persistir citações junto da resposta permite auditoria posterior sem guardar materiais completos.
        const document = await this.answerModel.create({
            actorId: new Types.ObjectId(actor.id),
            sourceJobIds: input.sourceJobIds.map((jobId) => new Types.ObjectId(jobId)),
            question: input.question.trim(),
            answer,
            citations: limitedCitations,
        });
        const created = document.toObject() as { createdAt?: Date };
        return {
            _id: String(document._id),
            sourceJobIds: input.sourceJobIds,
            question: document.question,
            answer: document.answer,
            citations: document.citations,
            createdAt: created.createdAt,
        };
    }

    /**
     * Escolhe os chunks mais relevantes por correspondência textual simples.
     *
     * @param job Job autorizado e concluído.
     * @param question Pergunta do utilizador.
     * @returns Até três chunks para citar.
     */
    private selectChunks(
        job: MaterialIndexJobView,
        question: string,
    ): MaterialTextChunk[] {
        // A seleção lexical é explicável para alunos e não introduz recuperação externa.
        const terms = question
            .toLowerCase()
            .split(/\W+/)
            .filter((term) => term.length >= 4);
        const scored = job.extractedTextChunks.map((chunk) => ({
            chunk,
            score: terms.reduce(
                (total, term) =>
                    total + (chunk.text.toLowerCase().includes(term) ? 1 : 0),
                0,
            ),
        }));

        const matches = scored
            .filter((item) => item.score > 0)
            .sort((left, right) => right.score - left.score)
            .map((item) => item.chunk);

        return (matches.length > 0 ? matches : job.extractedTextChunks).slice(0, 3);
    }

    /**
     * Converte um chunk interno numa citação pública.
     *
     * @param job Job autorizado.
     * @param chunk Chunk indexado.
     * @returns Citação com origem legível e excerto limitado.
     */
    private toCitation(
        job: MaterialIndexJobView,
        chunk: MaterialTextChunk,
    ): SourceGroundedCitation {
        // A autorização já aconteceu em findReadableDoneJob(...); aqui só normalizamos a parte pública.
        return normalizePublicCitation({
            sourceJobId: job._id,
            materialId: job.materialId,
            sourceLabel: chunk.sourceLabel,
            locator: chunk.locator,
            excerpt: chunk.text,
        });
    }

    /**
     * Constrói o prompt final com fontes já autorizadas e limitadas por política.
     *
     * @param question Pergunta original.
     * @param citations Citações autorizadas.
     * @returns Prompt final a validar antes da reserva de quota e chamada externa.
     */
    private buildPrompt(
        question: string,
        citations: SourceGroundedCitation[],
    ): string {
        return [
            "Responde em português de Portugal e só usa factos suportados pelas fontes.",
            "Não acrescentes conhecimento externo nem conteúdo não citado.",
            "Pergunta:",
            question.trim(),
            "Fontes autorizadas:",
            citations
                .map(
                    (citation, index) =>
                        `Fonte ${index + 1} (${citation.sourceJobId}, ${citation.locator}): ${citation.excerpt}`,
                )
                .join("\n"),
            "Devolve JSON com a chave answer.",
        ].join("\n");
    }

    /**
     * Estima unidades de quota de forma simples e previsível.
     *
     * @param prompt Prompt final já limitado por política.
     * @returns Número mínimo de unidades a reservar.
     */
    private estimateUsageUnits(prompt: string): number {
        return Math.max(1, Math.ceil(prompt.length / 1000));
    }

    /**
     * Delega o prompt e contexto autorizados na fachada governada.
     *
     * @param prompt Prompt final já validado por consentimento, política e quota.
     * @param policy Política efetiva resolvida para a finalidade SOURCE_GROUNDED_AI.
     * @returns Resposta validada.
     */
    private async generateAnswer(
        actor: AuthenticatedUser,
        prompt: string,
        policy: ResolvedAiModelPolicy,
    ): Promise<string> {
        const result = await this.governedAiExecutionService.execute({
            actor,
            purpose: SOURCE_GROUNDED_AI_PURPOSE,
            prompt,
            requestedTimeoutMs: resolveAiBudgetMs(policy.timeoutMs),
        });
        return result.answer;
    }
}
```

Explicação do código.

O service valida fontes e citações antes de delegar. A fachada reaplica autorização/consentimento/policy, limites, guardrails, reserva atómica de quota, integração externa, validação de output e audit seguro.

A ordem é intencional: ownership/membership e fontes antecedem a fachada. O service nunca aceita `userId` da UI.

5. Explicação do código.

Os blocos deste passo transformam o contrato HTTP em comportamento real. O endpoint existe, o controller chama um service existente, o service usa schema/model, os erros têm códigos observáveis e a persistência guarda citações auditáveis.

6. Validação do passo.

Resultado esperado:

- `POST /api/ai/source-grounded-answers` responde com citações quando existem chunks autorizados.
- Sem chunks citáveis, devolve erro `NO_INDEXED_SOURCES`.
- Com fonte proibida, não chama provider nem persiste resposta.
- Com provider inválido, não persiste conteúdo inseguro.

7. Cenário negativo/erro esperado.

Tenta pedir uma resposta com um `sourceJobId` de outro aluno. `findReadableDoneJob(...)` deve bloquear antes de construir prompt, antes de quota e antes do provider.


### Passo 5 - Integrar frontend e fallback honesto

1. Objetivo funcional do passo no contexto da app.

Mostrar ao aluno respostas com citações e fallback honesto quando faltam fontes ou a sessão não permite acesso.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
    - EDITAR: `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
    - REVER: `apps/web/src/features/mf3/request-mf3-json.ts`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Cria ou substitui os ficheiros abaixo. O cliente deve ser tipado e o componente deve cobrir loading, erro, sucesso e lista de citações.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Contrato de IA com fontes obrigatórias que documenta a resposta esperada.
 */
export type SourceGroundedAnswer = {
    _id: string;
    sourceJobIds: string[];
    question: string;
    answer: string;
    citations: {
        sourceJobId: string;
        materialId: string;
        sourceLabel: string;
        locator: string;
        excerpt: string;
    }[];
    createdAt?: string;
};

/**
 * Pede resposta fundamentada em fontes indexadas.
 *
 * @param input Jobs autorizados e pergunta.
 * @returns Resposta com citações.
 */
export function askSourceGroundedAi(input: {
    sourceJobIds: string[];
    question: string;
}): Promise<SourceGroundedAnswer> {
    // requestMf3Json usa credentials include, por isso a sessão fica em cookie HttpOnly.
    return requestMf3Json<SourceGroundedAnswer>(
        "/api/ai/source-grounded-answers",
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}
```

Explicação do código.

O cliente tipa a resposta do backend e chama o endpoint real. Ele não decide permissões nem altera IDs; apenas envia `sourceJobIds` e `question`. A sessão é mantida pelo helper existente, evitando guardar credenciais no browser.

```tsx
// apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx
import { FormEvent, useState } from "react";
import {
    askSourceGroundedAi,
    SourceGroundedAnswer,
} from "./ask-source-grounded-ai.js";

/**
 * Painel de resposta com citações obrigatórias.
 *
 * @returns Formulário e resposta fundamentada.
 */
export function SourceGroundedAiPanel() {
    const [sourceJobIds, setSourceJobIds] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<SourceGroundedAnswer | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Trata a ação do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a ação.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setAnswer(null);

        try {
            // A UI envia apenas IDs e pergunta; o backend decide se as fontes são legíveis.
            setAnswer(
                await askSourceGroundedAi({
                    sourceJobIds: sourceJobIds
                        .split(",")
                        .map((sourceJobId) => sourceJobId.trim())
                        .filter(Boolean),
                    question,
                }),
            );
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível obter uma resposta com fontes.",
            );
        } finally {
            setLoading(false);
        }
    }

    const canSubmit =
        !loading &&
        sourceJobIds
            .split(",")
            .map((sourceJobId) => sourceJobId.trim())
            .filter(Boolean).length > 0 &&
        question.trim().length >= 5;

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Resposta com fontes</h2>

            {error ? (
                <p className="sf-error" role="alert">
                    {error}
                </p>
            ) : null}

            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Jobs de indexação
                    <input
                        aria-describedby="source-grounded-jobs-help"
                        value={sourceJobIds}
                        onChange={(event) => setSourceJobIds(event.target.value)}
                    />
                </label>
                <p id="source-grounded-jobs-help" className="text-xs text-slate-600">
                    Separa vários IDs por vírgula.
                </p>

                <label className="block">
                    Pergunta
                    <textarea
                        rows={3}
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                    />
                </label>

                <button className="sf-button-primary" disabled={!canSubmit}>
                    {loading ? "A responder..." : "Responder com fontes"}
                </button>
            </form>

            {!answer && !error && !loading ? (
                <p className="text-sm text-slate-600">
                    Escolhe fontes processáveis antes de pedir uma resposta factual.
                </p>
            ) : null}

            {answer ? (
                <div className="space-y-3 text-sm">
                    <p className="whitespace-pre-line text-slate-800">{answer.answer}</p>
                    {answer.citations.map((citation) => (
                        <article
                            className="rounded-md border border-slate-200 p-3"
                            key={`${citation.sourceJobId}-${citation.locator}`}
                        >
                            <p className="font-medium text-slate-900">
                                {citation.sourceLabel} · {citation.locator}
                            </p>
                            {/* O excerto vem limitado do backend para explicar a origem sem expor o material completo. */}
                            <p className="mt-1 text-slate-700">{citation.excerpt}</p>
                        </article>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
```

Explicação do código.

O componente ensina o fluxo completo no frontend: estado local para input, loading, erro e resposta; submissão assíncrona; disabled state; mensagem de fallback; e apresentação das citações. A UI não tenta decidir se o utilizador pode ler uma fonte. Essa decisão fica no backend.

O erro evitado é mostrar uma resposta factual sem origem ou esconder a razão da falha. A mensagem de fallback ajuda o aluno a perceber que precisa de fontes processáveis, não de uma resposta inventada. O componente também evita tokens e dados sensíveis no browser.

5. Explicação do código.

O frontend fica como consumidor do contrato backend. O cliente tipado garante que UI e API concordam sobre `answer` e `citations`; o painel mostra apenas excertos já limitados pelo backend.

6. Validação do passo.

Resultado esperado:

- Com fontes válidas, a UI mostra resposta e lista de citações.
- Sem fontes ou com sessão inválida, a UI mostra erro compreensível.
- O pedido usa cookies de sessão através de `requestMf3Json(...)`.

7. Cenário negativo/erro esperado.

Simula um `sourceJobId` sem permissão. A UI deve mostrar erro, sem tentar filtrar permissões localmente e sem mostrar conteúdo parcial.


### Passo 6 - Criar testes e negativos

1. Objetivo funcional do passo no contexto da app.

Provar que o requisito factual falha com segurança e passa apenas com fontes autorizadas.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/source-grounded-ai/citation-policy.spec.ts`
    - EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
    - REVER: `apps/api/package.json`
    - LOCALIZAÇÃO: suites Jest completas.

3. Instruções do que fazer.

Cria ou substitui as suites abaixo. Usa dependências simuladas apenas nos testes, sem rede real e sem materiais privados reais.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/source-grounded-ai/citation-policy.spec.ts
import { normalizePublicCitation } from "./citation-policy.js";

describe("normalizePublicCitation", () => {
    it("normaliza campos públicos e limita o excerto", () => {
        const result = normalizePublicCitation({
            sourceJobId: "job-1",
            materialId: "mat-1",
            sourceLabel: " PDF de Matemática ",
            locator: " página 2 ",
            excerpt: "x".repeat(500),
        });

        // O caminho principal prova rastreabilidade sem devolver a página inteira.
        expect(result).toEqual({
            sourceJobId: "job-1",
            materialId: "mat-1",
            sourceLabel: "PDF de Matemática",
            locator: "página 2",
            excerpt: "x".repeat(420),
        });
    });

    it("recusa citação sem nome de fonte", () => {
        expect(() =>
            normalizePublicCitation({
                sourceJobId: "job-1",
                materialId: "mat-1",
                sourceLabel: " ",
                locator: "página 2",
                excerpt: "Limites laterais",
            }),
        ).toThrow("A citação precisa de nome de fonte.");
    });

    it("recusa citação sem localização verificável", () => {
        expect(() =>
            normalizePublicCitation({
                sourceJobId: "job-1",
                materialId: "mat-1",
                sourceLabel: "PDF de Matemática",
                locator: "",
                excerpt: "Limites laterais",
            }),
        ).toThrow("A citação precisa de página, secção ou chunk.");
    });

    it("recusa citação sem excerto verificável", () => {
        // Sem excerto verificável, a UI não consegue mostrar ao aluno de onde veio a resposta.
        expect(() =>
            normalizePublicCitation({
                sourceJobId: "job-1",
                materialId: "mat-1",
                sourceLabel: "PDF de Matemática",
                locator: "página 2",
                excerpt: " ",
            }),
        ).toThrow("A citação precisa de excerto verificável.");
    });
});
```

Explicação do código.

Esta suite testa a policy isolada. O caminho feliz confirma normalização e limite do excerto. Os negativos confirmam que uma citação sem fonte, localização ou excerto não passa. Isto prova a regra mais pequena de `RNF35` sem provider, base de dados ou rede.

```ts
// apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts
import {
    ForbiddenException,
    HttpException,
    HttpStatus,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SourceGroundedAiService } from "./source-grounded-ai.service.js";

describe("SourceGroundedAiService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    const jobId = "507f1f77bcf86cd799439013";
    const materialId = "507f1f77bcf86cd799439014";

    it("cria resposta com citações de chunks autorizados depois de aplicar governança IA", async () => {
        const {
            aiConsentsService,
            aiModelPoliciesService,
            governedAiExecutionService,
            aiQuotasService,
            answerModel,
            materialIndexService,
            service,
        } = makeService();

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "O que são derivadas?",
            }),
        ).resolves.toMatchObject({
            sourceJobIds: [jobId],
            citations: [
                {
                    sourceJobId: jobId,
                    materialId,
                    sourceLabel: "Derivadas",
                    locator: "secção 1",
                },
            ],
        });
        expect(materialIndexService.findReadableDoneJob).toHaveBeenCalledWith(
            student,
            jobId,
        );
        expect(aiConsentsService.assertGranted).toHaveBeenCalledWith(
            student.id,
            "SOURCE_GROUNDED_AI",
        );
        expect(aiModelPoliciesService.resolveForUse).toHaveBeenCalledWith(
            "SOURCE_GROUNDED_AI",
        );
        expect(aiQuotasService.reserveUsage).toHaveBeenCalledWith(
            expect.objectContaining({
                scope: "USER",
                targetId: student.id,
                purpose: "SOURCE_GROUNDED_AI",
                units: expect.any(Number),
            }),
        );
        expect(answerModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                question: "O que são derivadas?",
                answer: "Resposta gerada pelo provider.",
                citations: expect.any(Array),
            }),
        );
        expect(governedAiExecutionService.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                purpose: "SOURCE_GROUNDED_AI",
                prompt: expect.stringContaining("Fontes autorizadas"),
            }),
        );
    });

    it("bloqueia quando o job não tem chunks citáveis", async () => {
        const { governedAiExecutionService, answerModel, materialIndexService, service } =
            makeService();
        materialIndexService.findReadableDoneJob.mockResolvedValueOnce({
            _id: jobId,
            materialId,
            extractedTextChunks: [],
        });

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Explica o tema.",
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);

        // Sem fontes, a IA não pode inventar resposta nem persistir histórico enganador.
        expect(governedAiExecutionService.execute).not.toHaveBeenCalled();
        expect(answerModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia fonte proibida antes da fachada", async () => {
        const { governedAiExecutionService, answerModel, materialIndexService, service } =
            makeService();
        materialIndexService.findReadableDoneJob.mockRejectedValueOnce(
            new Error("MATERIAL_INDEX_ACCESS_DENIED"),
        );

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Explica esta fonte.",
            }),
        ).rejects.toThrow("MATERIAL_INDEX_ACCESS_DENIED");

        // A autorização de leitura acontece antes da fachada.
        expect(governedAiExecutionService.execute).not.toHaveBeenCalled();
        expect(answerModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia consentimento recusado antes de política, quota e provider", async () => {
        const {
            aiConsentsService,
            aiModelPoliciesService,
            governedAiExecutionService,
            aiQuotasService,
            answerModel,
            service,
        } = makeService();
        aiConsentsService.assertGranted.mockRejectedValueOnce(
            new ForbiddenException({
                code: "AI_CONSENT_REQUIRED",
                message: "O consentimento para IA não está ativo.",
            }),
        );

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Explica esta fonte.",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(aiModelPoliciesService.resolveForUse).not.toHaveBeenCalled();
        expect(aiQuotasService.reserveUsage).not.toHaveBeenCalled();
        expect(governedAiExecutionService.execute).not.toHaveBeenCalled();
        expect(answerModel.create).not.toHaveBeenCalled();
    });

    it("não persiste quando a fachada rejeita output inválido", async () => {
        const { governedAiExecutionService, answerModel, service } = makeService();
        governedAiExecutionService.execute.mockRejectedValueOnce(
            new ServiceUnavailableException({ code: "AI_INVALID_OUTPUT" }),
        );

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Resume a fotossíntese.",
            }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);

        // Respostas vazias não entram no histórico porque poderiam parecer factos válidos.
        expect(answerModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia quota excedida antes da fachada", async () => {
        const { governedAiExecutionService, aiQuotasService, answerModel, service } =
            makeService();
        aiQuotasService.reserveUsage.mockRejectedValueOnce(
            new HttpException(
                {
                    code: "AI_QUOTA_EXCEEDED",
                    message: "A quota mensal de IA foi excedida.",
                },
                HttpStatus.TOO_MANY_REQUESTS,
            ),
        );

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Explica esta fonte.",
            }),
        ).rejects.toBeInstanceOf(HttpException);

        expect(governedAiExecutionService.execute).not.toHaveBeenCalled();
        expect(answerModel.create).not.toHaveBeenCalled();
    });
});

type TestSourceChunk = {
    order: number;
    text: string;
    sourceLabel: string;
    locator: string;
};

/**
 * Cria service com dependências controladas para testar regras sem rede nem base de dados real.
 *
 * @param options.chunks Chunks textuais disponíveis para citação.
 * @param options.policy Ajustes parciais de política IA.
 * @returns Service e dependências observáveis por assertions.
 */
function makeService(options: {
    chunks?: TestSourceChunk[];
    policy?: Partial<{
        model: string;
        timeoutMs: number;
        maxSourceCount: number;
        maxPromptChars: number;
    }>;
} = {}) {
    const answerModel = {
        create: jest.fn().mockImplementation(async (input) => ({
            _id: "507f1f77bcf86cd799439099",
            ...input,
            toObject: () => ({ createdAt: new Date("2026-06-15T10:00:00Z") }),
        })),
    };
    const materialIndexService = {
        findReadableDoneJob: jest.fn().mockResolvedValue({
            _id: "507f1f77bcf86cd799439013",
            materialId: "507f1f77bcf86cd799439014",
            extractedTextChunks: options.chunks ?? [
                {
                    order: 1,
                    text: "As derivadas medem a taxa de variação instantânea.",
                    sourceLabel: "Derivadas",
                    locator: "secção 1",
                },
            ],
        }),
    };
    const aiConsentsService = {
        assertGranted: jest.fn().mockResolvedValue(undefined),
    };
    const aiModelPoliciesService = {
        resolveForUse: jest.fn().mockResolvedValue({
            purpose: "SOURCE_GROUNDED_AI",
            enabled: true,
            provider: "openai",
            model: "gpt-test-source",
            timeoutMs: 3500,
            maxSourceCount: 10,
            maxPromptChars: 12000,
            ...options.policy,
        }),
    };
    const aiQuotasService = {
        reserveUsage: jest.fn().mockResolvedValue({
            scope: "USER",
            targetId: "507f1f77bcf86cd799439012",
            usedUnits: 1,
        }),
    };
    const governedAiExecutionService = {
        execute: jest
            .fn()
            .mockResolvedValue({ answer: "Resposta gerada pelo provider." }),
    };

    // As dependências são substitutos de teste; em runtime real o NestJS injeta providers concretos.
    const service = new SourceGroundedAiService(
        answerModel as never,
        materialIndexService as never,
        aiConsentsService as never,
        aiModelPoliciesService as never,
        aiQuotasService as never,
        governedAiExecutionService as never,
    );

    return {
        aiConsentsService,
        aiModelPoliciesService,
        governedAiExecutionService,
        aiQuotasService,
        answerModel,
        materialIndexService,
        service,
    };
}
```

Explicação do código.

As suites provam citações normalizadas, bloqueio sem fontes/acesso, consentimento e quota antes da fachada e ausência de persistência perante output inválido.

Os testes usam dependências controladas porque o objetivo é provar a ordem de segurança sem rede externa nem base de dados real. Isto é aceitável em testes unitários, mas não substitui a implementação final: o service real continua a receber dependências pelo NestJS.

5. Explicação do código.

O código dos testes transforma critérios de aceite em assertions. O aluno consegue demonstrar caminho feliz e negativos com outputs objetivos, sem expor materiais reais.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api test -- source-grounded-ai
```

Resultado esperado: suites de `citation-policy` e `source-grounded-ai.service` passam sem rede real.

7. Cenário negativo/erro esperado.

Se o teste de fonte proibida chamar `execute`, a ordem de segurança está errada e o BK não pode ser fechado.


### Passo 7 - Recolher evidence e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF8-02` com prova objetiva e preparar `BK-MF8-03`.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`
    - REVER: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
    - LOCALIZAÇÃO: secções de validação final, evidence e handoff.

3. Instruções do que fazer.

Regista no PR ou documento de evidence:

- comando executado;
- expected result;
- observed result;
- negativo testado;
- ficheiros alterados;
- risco residual;
- impacto no próximo BK.

Não incluas prompts privados, respostas completas de IA, cookies, tokens, dados pessoais ou materiais integrais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e fecha rastreabilidade.

5. Explicação do código.

Não existe código neste passo. A entrega é evidence defensável: professor e equipa conseguem ver que a resposta factual depende de fontes autorizadas e que os negativos falham antes do provider.

6. Validação do passo.

Resultado esperado: evidence suficiente para defender `RNF35` e handoff claro para `BK-MF8-03`.

7. Cenário negativo/erro esperado.

Se algum comando falhar por ambiente, regista o erro observado como `BLOQUEADO` e não escondas a falha no PR.

#### Critérios de aceite

- Header e metadados iguais à matriz, backlog e contrato de campos.
- `RNF35` fica demonstrável por código, testes e evidence.
- `POST /api/ai/source-grounded-answers` usa sessão real e não aceita `userId` no body.
- Cada `sourceJobId` é validado por `MaterialIndexService.findReadableDoneJob(...)` antes do provider.
- Sem fontes citáveis, o backend devolve `NO_INDEXED_SOURCES`.
- Fonte proibida não chama provider nem persiste resposta.
- Consentimento, política e quota são aplicados antes do provider.
- Citações públicas têm fonte, localização e excerto limitado.
- Frontend usa cliente tipado, `credentials: "include"` através do helper existente e estados loading/erro/sucesso.
- Testes cobrem caminho feliz, ausência de fontes, fonte proibida, consentimento recusado, quota excedida e provider inválido.
- Evidence não expõe dados sensíveis, prompts privados, cookies, tokens ou materiais completos.

#### Validação final

- Executar `npm --prefix apps/api test -- source-grounded-ai`.
- Executar `git diff --check`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`.
- Confirmar que não há caminhos privados em texto destinado aos alunos.
- Confirmar que `BK-MF8-03` pode assumir fontes obrigatórias, citações públicas e fallback honesto.

#### Evidence para PR/defesa

- `pr`: resumo de `RNF35`, endpoint criado/revisto, ficheiros backend/frontend/testes e decisões `CANONICO`/`DERIVADO`.
- `proof`: output de `npm --prefix apps/api test -- source-grounded-ai`.
- `neg`: prova de `NO_INDEXED_SOURCES` e fonte proibida sem chamada ao provider.
- `privacy`: confirmação de que prompts privados, cookies, tokens e materiais completos não aparecem em logs/evidence.
- `handoff`: nota curta para `BK-MF8-03` explicando que respostas factuais já exigem fontes autorizadas.

#### Handoff

O próximo BK é `BK-MF8-03`. Ele pode assumir que `BK-MF8-02` deixou `POST /api/ai/source-grounded-answers` com fontes obrigatórias, citações públicas limitadas, fallback honesto e testes que provam que a IA não responde quando faltam fontes citáveis.

#### Changelog

- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com estrutura completa, caminhos públicos, decisões CANONICO/DERIVADO, validação por passo, negativos e handoff.
- `2026-07-01`: correção focada para tornar o BK implementável sem adivinhação; removida a policy duplicada, alinhado o fluxo com `citation-policy.ts`, `SourceGroundedAiService`, frontend tipado e testes reais.
