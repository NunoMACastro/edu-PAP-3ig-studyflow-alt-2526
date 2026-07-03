# BK-MF8-04 - IA externa segue políticas e filtros próprios.

## Header

- `doc_id`: `GUIA-BK-MF8-04`
- `bk_id`: `BK-MF8-04`
- `macro`: `MF8`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF37`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-05`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`
- `last_updated`: `2026-07-01`

#### Objetivo

Neste BK vais fechar `RNF37`: a IA só pode acrescentar contexto externo limitado quando o aluno dá permissão explícita, quando já existem fontes internas autorizadas e quando a resposta separa claramente citações internas de notas externas.

O resultado esperado é um fluxo completo em `apps/api` e `apps/web`, com endpoint seguro, DTO, schema, service, policy, cliente React, painel, testes negativos e evidence para defesa.

#### Importância

Conhecimento externo em IA é útil, mas perigoso se for misturado com fontes privadas, materiais oficiais ou respostas sem origem clara. Este BK protege três coisas:

- a confiança do aluno, porque a resposta distingue fontes internas de contexto externo;
- a segurança do StudyFlow, porque ownership, sessão e role continuam a ser validados no backend;
- a defesa PAP, porque o comportamento fica demonstrável por testes e outputs observáveis.

Sem este BK, `RF39` fica incompleto na prática e `RNF37` não tem prova técnica suficiente.

#### Scope-in

- Confirmar `BK-MF8-04`, `RNF37`, owner, apoio, sprint, prioridade e handoff nos documentos canónicos.
- Criar uma policy backend pequena e testável para decidir se contexto externo pode ser usado.
- Integrar a policy no service `ExternalKnowledgeAiService`.
- Manter `POST /api/ai/external-knowledge-answers` como endpoint único do fluxo.
- Validar role `STUDENT`, ownership da área de estudo e existência de fontes internas no backend.
- Persistir resposta com `externalUsed`, `internalCitations` e `externalNotes` separados.
- Expor cliente React tipado e painel com loading, vazio, erro e sucesso.
- Testar sucesso, sem permissão externa, sem fontes internas, role errada e provider inválido.
- Recolher evidence sem expor cookies, prompts privados, respostas completas ou dados pessoais.

#### Scope-out

- Alterar requisitos, metadados, owners, sprint, prioridades ou ordem dos BKs.
- Criar outro endpoint para a mesma ação.
- Usar o frontend como fonte de verdade para ownership, role ou permissões.
- Misturar fontes internas privadas com contexto externo.
- Prometer navegação web, RAG, embeddings, OCR, importação automática ou pesquisa online.
- Guardar sessão, segredos, prompts privados ou materiais completos no armazenamento local do browser.
- Registar em logs perguntas completas, respostas completas, cookies, identificadores desnecessários ou materiais privados.
- Alterar a aproximação visual do próximo BK; `BK-MF8-05` tratará esse refinamento.

#### Estado antes e depois

- Estado antes: `BK-MF8-03` deixa explicação adaptada ao nível do aluno pronta, mas o uso de contexto externo ainda precisa de uma barreira própria, testes negativos e UI explícita.
- Estado depois: `BK-MF8-04` entrega uma policy integrada, endpoint seguro, resposta com notas externas separadas, cliente React tipado, painel com estados completos e evidence objetiva para `RNF37`.

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`
- `apps/api/src/modules/external-knowledge-ai/dto/ask-external-knowledge-ai.dto.ts`
- `apps/api/src/modules/external-knowledge-ai/schemas/external-knowledge-ai-answer.schema.ts`
- `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.controller.ts`
- `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.module.ts`
- `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.ts`
- `apps/web/src/features/external-knowledge-ai/ask-external-knowledge-ai.ts`
- `apps/web/src/features/external-knowledge-ai/external-knowledge-ai-panel.tsx`

#### Glossário

- **Conhecimento externo limitado:** contexto geral acrescentado pela IA sem substituir fontes internas autorizadas.
- **Fonte interna:** material processável do StudyFlow, autorizado para o aluno autenticado e usado como base principal da resposta.
- **Citação interna:** excerto curto de uma fonte interna usado para explicar a origem da resposta.
- **Nota externa:** aviso separado que informa se houve contexto externo geral.
- **Policy:** função de domínio que toma uma decisão explícita antes do provider IA ser chamado.
- **Provider IA:** integração isolada que gera texto, sem decidir ownership nem permissões.
- **Ownership:** validação backend que confirma que a área e os materiais pertencem ao aluno autenticado.
- **Role:** perfil do utilizador autenticado; neste fluxo só `STUDENT` pode pedir resposta.
- **Fallback honesto:** erro controlado quando a app não tem fontes suficientes ou o provider falha.
- **Evidence:** prova objetiva de validação, com comando, output e resultado observado, sem dados sensíveis.

#### Conceitos teóricos essenciais

- **Separação de fontes:** as fontes internas são a base factual; o contexto externo é apenas apoio pedagógico curto e marcado.
- **Autorização no backend:** o frontend pode mostrar uma checkbox, mas não decide se o aluno pode ler a área ou usar materiais.
- **Validação por DTO:** `studyAreaId`, `question` e `allowExternalKnowledge` são validados antes de chegar ao service.
- **Policy testável:** uma função pequena permite provar as regras de `RNF37` sem depender de rede, UI ou base de dados.
- **Provider isolado:** a IA é chamada depois das validações, para evitar custo, fuga de dados e respostas sem fontes.
- **Persistência mínima:** a resposta guarda o essencial para histórico e defesa, mantendo citações internas e notas externas separadas.
- **UI honesta:** a interface deve mostrar loading, vazio, erro e sucesso sem prometer que contexto externo é fonte oficial.
- **Privacidade e RGPD:** perguntas, respostas, fontes, prompts e identificadores de aluno são dados sensíveis e não devem aparecer completos em logs ou evidence.

#### Arquitetura do BK

- Requisito canónico: `RNF37 - IA externa segue políticas e filtros próprios`.
- Requisito relacionado: `RF39 - IA pode recorrer a conhecimento externo (limitado) quando permitido`.
- Endpoint: `POST /api/ai/external-knowledge-answers`.
- Guard: `SessionGuard`.
- DTO: `AskExternalKnowledgeAiDto`.
- Policy: `resolveExternalAiPolicy(...)`.
- Service: `ExternalKnowledgeAiService`.
- Schema: `ExternalKnowledgeAiAnswer` e `ExternalKnowledgeInternalCitation`.
- Cliente frontend: `askExternalKnowledgeAi(...)`.
- Componente frontend: `ExternalKnowledgeAiPanel`.
- Decisão CANONICO: contexto externo não substitui fontes internas.
- Decisão DERIVADO: a policy devolve `externalAllowed`, `reason` e `externalNotes` para manter a decisão visível em testes e persistência.
- Handoff: `BK-MF8-05` pode refinar UI sabendo que o contrato de dados já está fechado.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/external-knowledge-ai/external-ai-policy.ts`
- CRIAR: `apps/api/src/modules/external-knowledge-ai/external-ai-policy.spec.ts`
- EDITAR: `apps/api/src/modules/external-knowledge-ai/dto/ask-external-knowledge-ai.dto.ts`
- EDITAR: `apps/api/src/modules/external-knowledge-ai/schemas/external-knowledge-ai-answer.schema.ts`
- EDITAR: `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.controller.ts`
- EDITAR: `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.module.ts`
- EDITAR: `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.ts`
- EDITAR: `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.spec.ts`
- EDITAR: `apps/web/src/features/external-knowledge-ai/ask-external-knowledge-ai.ts`
- EDITAR: `apps/web/src/features/external-knowledge-ai/external-knowledge-ai-panel.tsx`
- REVER: `apps/web/src/features/mf3/request-mf3-json.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF8-04` entrega `RNF37` sem alterar requisitos, IDs ou ordem da macrofase.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - LOCALIZAÇÃO: linhas de `BK-MF8-04`, `RNF37` e `RF39`.

3. Instruções do que fazer.

Confirma que os documentos canónicos dizem:

- `BK-MF8-04`
- owner `Kaua`
- apoio `Guilherme`
- prioridade `P0`
- esforço `M`
- sprint `S11`
- requisito `RNF37`
- próximo BK `BK-MF8-05`

Depois confirma que `RF39` já permite conhecimento externo limitado quando permitido. Esta relação é importante: `RF39` diz a funcionalidade, `RNF37` define a proteção.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não existe código porque este passo fixa o contrato documental. A validação evita que o aluno implemente uma regra correta tecnicamente, mas fora do requisito real. Se algum documento canónico divergir, a decisão segura é parar e registar `BLOQUEADO_POR_CONTRATO` no relatório da MF.

6. Validação do passo.

Resultado esperado: todos os metadados continuam iguais nos documentos canónicos e o BK mantém `RNF37`.

7. Cenário negativo/erro esperado.

Se encontrares outro owner, sprint ou requisito para o mesmo BK, não escolhas por preferência. Regista o bloqueio e pede decisão antes de editar código.

### Passo 2 - Mapear contratos existentes de backend e frontend

1. Objetivo funcional do passo no contexto da app.

Identificar os contratos já usados por `apps/api` e `apps/web`, para evitar endpoint duplicado ou entidade paralela.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/external-knowledge-ai/dto/ask-external-knowledge-ai.dto.ts`
    - REVER: `apps/api/src/modules/external-knowledge-ai/schemas/external-knowledge-ai-answer.schema.ts`
    - REVER: `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.controller.ts`
    - REVER: `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.module.ts`
    - REVER: `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.ts`
    - REVER: `apps/web/src/features/external-knowledge-ai/ask-external-knowledge-ai.ts`
    - REVER: `apps/web/src/features/external-knowledge-ai/external-knowledge-ai-panel.tsx`
    - LOCALIZAÇÃO: módulo `external-knowledge-ai` e feature React com o mesmo nome.

3. Instruções do que fazer.

Antes de escrever, confirma estas responsabilidades:

- o controller só recebe HTTP e delega;
- o DTO valida entrada;
- o service valida role, ownership, fontes e provider;
- o schema guarda resposta e metadados mínimos;
- o cliente React chama o endpoint único;
- o painel mostra estados de utilização;
- os testes provam regra positiva e negativos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não existe código porque este passo é leitura técnica. O valor está em impedir duplicação: se o endpoint `POST /api/ai/external-knowledge-answers` já existe, o aluno deve reforçar o fluxo existente e não criar outro caminho com o mesmo objetivo.

6. Validação do passo.

Resultado esperado: lista fechada de ficheiros a criar, editar e rever, sem imports para ficheiros inexistentes e sem segundo endpoint para a mesma ação.

7. Cenário negativo/erro esperado.

Se encontrares dois nomes para o mesmo conceito, mantém o nome já usado no módulo `external-knowledge-ai` e regista a decisão como `DERIVADO`.

### Passo 3 - Criar a policy de IA externa limitada

1. Objetivo funcional do passo no contexto da app.

Criar a regra pequena e testável que decide se o contexto externo pode entrar na resposta.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/external-knowledge-ai/external-ai-policy.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. A policy não deve conhecer HTTP, Mongoose, React nem provider IA. Ela recebe apenas os dados mínimos para decidir e devolve uma decisão explícita.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/external-knowledge-ai/external-ai-policy.ts
/**
 * Entrada mínima para decidir se a resposta pode receber contexto externo.
 */
export type ExternalAiPolicyInput = {
    allowExternalKnowledge: boolean;
    internalSourceCount: number;
};

/**
 * Resultado da policy usado pelo service antes de chamar o provider IA.
 */
export type ExternalAiPolicyDecision = {
    externalAllowed: boolean;
    reason: string;
    externalNotes: string[];
};

/**
 * Decide se o contexto externo limitado pode ser usado numa resposta StudyFlow.
 *
 * @param input Permissão explícita do aluno e número de fontes internas autorizadas.
 * @returns Decisão que separa resposta interna, nota externa e motivo observável em testes.
 */
export function resolveExternalAiPolicy(
    input: ExternalAiPolicyInput,
): ExternalAiPolicyDecision {
    if (input.internalSourceCount <= 0) {
        return {
            externalAllowed: false,
            reason: "Sem fontes internas processáveis.",
            externalNotes: [],
        };
    }

    // Contexto externo nunca substitui as fontes internas autorizadas pelo StudyFlow.
    if (!input.allowExternalKnowledge) {
        return {
            externalAllowed: false,
            reason: "O aluno não permitiu contexto externo.",
            externalNotes: [],
        };
    }

    // A nota visível impede que a UI apresente contexto externo como citação interna.
    return {
        externalAllowed: true,
        reason: "Contexto externo limitado permitido.",
        externalNotes: [
            "Nota externa limitada: a resposta pode acrescentar enquadramento pedagógico geral, separado das fontes internas.",
        ],
    };
}
```

Explicação do código

Este ficheiro transforma `RNF37` numa regra isolada. A função recebe só dois dados: se o aluno permitiu contexto externo e quantas fontes internas autorizadas existem. A saída é uma decisão explícita: permite ou não permite contexto externo, explica o motivo e devolve notas externas quando há permissão.

A policy existe para evitar que a decisão fique espalhada por controller, service e UI. Ela não valida ownership nem role; isso continua no service, porque depende da sessão autenticada e das consultas aos módulos de áreas e materiais. O aluno pode adaptar o texto da nota externa, mas não deve alterar a regra principal: sem fonte interna ou sem permissão explícita, `externalAllowed` tem de ser `false`.

5. Explicação do código.

A explicação principal está imediatamente após o bloco. Na arquitetura completa, esta função é consumida pelo service no passo 5 e testada no passo 7. A validação acontece antes do provider para evitar custo, fuga de dados e respostas sem base interna. O erro comum evitado é tratar conhecimento externo como fonte factual principal.

6. Validação do passo.

Resultado esperado: o ficheiro exporta `resolveExternalAiPolicy`, `ExternalAiPolicyInput` e `ExternalAiPolicyDecision`, sem dependências de NestJS, Mongoose ou React.

7. Cenário negativo/erro esperado.

Com `internalSourceCount: 0`, a decisão deve bloquear contexto externo mesmo que `allowExternalKnowledge` seja `true`.

### Passo 4 - Consolidar DTO, schema, controller e module

1. Objetivo funcional do passo no contexto da app.

Garantir que entrada HTTP, persistência e registo do módulo ficam completos antes de integrar o service.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/external-knowledge-ai/dto/ask-external-knowledge-ai.dto.ts`
    - EDITAR: `apps/api/src/modules/external-knowledge-ai/schemas/external-knowledge-ai-answer.schema.ts`
    - EDITAR: `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.controller.ts`
    - EDITAR: `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.module.ts`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Confirma ou ajusta os quatro ficheiros abaixo. O controller continua fino, o DTO valida input, o schema separa citações internas de notas externas, e o module regista dependências reais.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/external-knowledge-ai/dto/ask-external-knowledge-ai.dto.ts
/**
 * Define o payload aceite pelo endpoint de IA com conhecimento externo limitado.
 */
import { IsBoolean, IsMongoId, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Pedido enviado pelo aluno para obter resposta com fontes internas e nota externa opcional.
 */
export class AskExternalKnowledgeAiDto {
    /**
     * Área privada que fornece ownership e fontes internas autorizadas.
     */
    // O id é validado no DTO para impedir que o service receba valores que nem podem consultar MongoDB.
    @IsMongoId()
    studyAreaId!: string;

    /**
     * Pergunta do aluno.
     */
    @IsString()
    @MinLength(5)
    @MaxLength(1200)
    question!: string;

    /**
     * Permissão explícita para acrescentar contexto externo geral e separado.
     */
    // A checkbox da UI envia um booleano; strings como "yes" não devem ativar contexto externo.
    @IsBoolean()
    allowExternalKnowledge!: boolean;
}
```

Explicação do código

O DTO define o contrato de entrada do endpoint. `studyAreaId` tem de ser ObjectId, `question` tem tamanho mínimo e máximo, e `allowExternalKnowledge` tem de ser booleano. Isto evita ambiguidades como uma string ativar contexto externo sem intenção clara.

Este ficheiro cumpre `RNF37` porque a permissão externa deixa de ser inferida por texto ou UI; ela passa a ser campo validado. O DTO não decide ownership, porque isso precisa do `userId` da sessão. O aluno pode ajustar limites de tamanho se a equipa aprovar, mas não deve remover `@IsBoolean()` nem aceitar `userId` no body.

```ts
// apps/api/src/modules/external-knowledge-ai/schemas/external-knowledge-ai-answer.schema.ts
/**
 * Define os documentos persistidos de IA com conhecimento externo limitado.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose usado apenas pela camada de persistência.
 */
export type ExternalKnowledgeAiAnswerDocument =
    HydratedDocument<ExternalKnowledgeAiAnswer>;

/**
 * Excerto interno autorizado que sustenta a resposta.
 */
@Schema({ _id: false })
export class ExternalKnowledgeInternalCitation {
    @Prop({ required: true })
    materialId!: string;

    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    excerpt!: string;
}

export const ExternalKnowledgeInternalCitationSchema =
    SchemaFactory.createForClass(ExternalKnowledgeInternalCitation);

/**
 * Resposta persistida com separação entre fonte interna e nota externa.
 */
@Schema({ timestamps: true })
export class ExternalKnowledgeAiAnswer {
    _id!: { toString(): string };

    // Índices por aluno e área ajudam a listar histórico sem varrer respostas de outros alunos.
    @Prop({ required: true, type: Types.ObjectId, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true })
    question!: string;

    @Prop({ required: true })
    answer!: string;

    @Prop({ required: true })
    externalUsed!: boolean;

    // Citações internas e notas externas ficam em campos diferentes para a UI não misturar origens.
    @Prop({ required: true, type: [ExternalKnowledgeInternalCitationSchema] })
    internalCitations!: ExternalKnowledgeInternalCitation[];

    @Prop({ type: [String], default: [] })
    externalNotes!: string[];
}

export const ExternalKnowledgeAiAnswerSchema = SchemaFactory.createForClass(
    ExternalKnowledgeAiAnswer,
);
```

Explicação do código

O schema guarda a resposta e os metadados mínimos para histórico. `studentId` e `studyAreaId` existem para manter o dado ligado ao aluno e à área correta, enquanto `internalCitations` e `externalNotes` ficam separados para respeitar explicabilidade.

O ficheiro usa `Types.ObjectId` na persistência, mas a entrada pública continua a chegar como string validada pelo DTO. A segurança principal é a separação de origens: uma nota externa nunca aparece dentro de `internalCitations`. O aluno não deve guardar materiais completos nem prompts completos neste schema, porque isso aumenta risco de privacidade e torna evidence mais sensível.

```ts
// apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.controller.ts
/**
 * Expõe o endpoint HTTP de IA com conhecimento externo limitado.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskExternalKnowledgeAiDto } from "./dto/ask-external-knowledge-ai.dto.js";
import { ExternalKnowledgeAiService } from "./external-knowledge-ai.service.js";

/**
 * Controller do contrato `POST /api/ai/external-knowledge-answers`.
 */
@Controller("api/ai/external-knowledge-answers")
@UseGuards(SessionGuard)
export class ExternalKnowledgeAiController {
    /**
     * @param externalKnowledgeService Service que contém regras de domínio, ownership e provider.
     */
    constructor(private readonly externalKnowledgeService: ExternalKnowledgeAiService) {}

    /**
     * Cria uma resposta com citações internas e nota externa opcional.
     *
     * @param request Pedido autenticado pelo `SessionGuard`.
     * @param body Dados validados pelo DTO.
     * @returns Resposta persistida e pronta para a UI.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Body() body: AskExternalKnowledgeAiDto,
    ) {
        // O userId vem da sessão; aceitar userId no body permitiria acesso cruzado.
        return this.externalKnowledgeService.ask(request.user!, body);
    }
}
```

Explicação do código

O controller é intencionalmente fino. Ele aplica `SessionGuard`, recebe `request.user` e passa o DTO para o service. A regra crítica é não aceitar identidade do aluno pelo body. A sessão é a origem de verdade para autorização.

Este ficheiro cumpre o contrato HTTP do BK e prepara o frontend para chamar um único endpoint. O aluno pode alterar mensagens no service, mas não deve mover ownership para o controller nem remover o guard. Para testar, envia um pedido sem sessão e confirma que a rota não executa o service.

```ts
// apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.module.ts
/**
 * Regista controllers, providers e schemas do fluxo de conhecimento externo limitado.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { ExternalKnowledgeAiController } from "./external-knowledge-ai.controller.js";
import { ExternalKnowledgeAiService } from "./external-knowledge-ai.service.js";
import {
    ExternalKnowledgeAiAnswer,
    ExternalKnowledgeAiAnswerSchema,
} from "./schemas/external-knowledge-ai-answer.schema.js";

/**
 * Módulo que junta autenticação, materiais, áreas de estudo, IA e persistência.
 */
@Module({
    imports: [
        AuthModule,
        AiModule,
        StudyAreasModule,
        MaterialsModule,
        // O model fica registado no módulo para o service persistir sem criar ligação manual à BD.
        MongooseModule.forFeature([
            {
                name: ExternalKnowledgeAiAnswer.name,
                schema: ExternalKnowledgeAiAnswerSchema,
            },
        ]),
    ],
    controllers: [ExternalKnowledgeAiController],
    // O service é o único ponto de domínio deste endpoint dentro do módulo.
    providers: [ExternalKnowledgeAiService],
})
export class ExternalKnowledgeAiModule {}
```

Explicação do código

O module liga as dependências necessárias: autenticação, provider IA, áreas de estudo, materiais e Mongoose. Sem este registo, o controller poderia existir mas o service não teria as dependências para validar ownership, listar fontes e persistir respostas.

Este ficheiro evita imports soltos e criação manual de services. A validação prática é arrancar a suite do módulo e garantir que Nest consegue resolver `ExternalKnowledgeAiService`. O aluno não deve registar models duplicados nem criar outro módulo para a mesma funcionalidade.

5. Explicação do código.

Os quatro blocos formam a base do contrato HTTP. O DTO protege input, o schema separa origens, o controller mantém a sessão como fonte de identidade, e o module regista as dependências. Esta organização evita três erros comuns: frontend decidir permissões, provider ser chamado antes de validar fontes, e persistência misturar nota externa com citação interna.

6. Validação do passo.

Resultado esperado: a aplicação compila, o endpoint existe uma vez, e o service recebe `request.user` mais `AskExternalKnowledgeAiDto`.

7. Cenário negativo/erro esperado.

Se tentares enviar `userId` no body, o backend deve ignorar esse valor. A identidade usada tem de vir da sessão autenticada.

### Passo 5 - Integrar o service com policy, fontes e provider

1. Objetivo funcional do passo no contexto da app.

Implementar a ordem segura do backend: sessão, role, ownership, fontes internas, policy, provider, persistência e resposta pública.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Atualiza o service para importar `resolveExternalAiPolicy(...)`. A decisão externa deve ser calculada depois de existirem citações internas autorizadas e antes de chamar o provider.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.ts
/**
 * Implementa as regras de negócio de IA com conhecimento externo limitado.
 */
import {
    ForbiddenException,
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider.js";
import { MaterialsService } from "../materials/materials.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { AskExternalKnowledgeAiDto } from "./dto/ask-external-knowledge-ai.dto.js";
import { resolveExternalAiPolicy } from "./external-ai-policy.js";
import {
    ExternalKnowledgeAiAnswer,
    ExternalKnowledgeAiAnswerDocument,
    ExternalKnowledgeInternalCitation,
} from "./schemas/external-knowledge-ai-answer.schema.js";

/**
 * Vista pública devolvida à UI sem detalhes internos de Mongoose.
 */
export type ExternalKnowledgeAiAnswerView = {
    _id: string;
    studyAreaId: string;
    question: string;
    answer: string;
    externalUsed: boolean;
    internalCitations: ExternalKnowledgeInternalCitation[];
    externalNotes: string[];
    createdAt?: Date;
};

/**
 * Serviço responsável por respostas com fontes internas e contexto externo limitado.
 */
@Injectable()
export class ExternalKnowledgeAiService {
    /**
     * @param answerModel Modelo Mongoose usado para persistir respostas.
     * @param studyAreasService Service que valida ownership da área.
     * @param materialsService Service que lista fontes internas processáveis.
     * @param aiProvider Provider isolado usado apenas depois das validações.
     */
    constructor(
        @InjectModel(ExternalKnowledgeAiAnswer.name)
        private readonly answerModel: Model<ExternalKnowledgeAiAnswerDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
        @Inject(AI_PROVIDER)
        private readonly aiProvider: AiProvider,
    ) {}

    /**
     * Cria resposta com citações internas e nota externa opcional.
     *
     * @param actor Utilizador autenticado pela sessão.
     * @param input Payload validado pelo DTO.
     * @returns Resposta persistida e pronta para apresentação.
     * @throws ForbiddenException quando o utilizador não é aluno.
     * @throws UnprocessableEntityException quando não existem fontes internas processáveis.
     * @throws ServiceUnavailableException quando o provider falha ou devolve formato inválido.
     */
    async ask(
        actor: AuthenticatedUser,
        input: AskExternalKnowledgeAiDto,
    ): Promise<ExternalKnowledgeAiAnswerView> {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }

        // Ownership da área vem antes das fontes para impedir acesso cruzado entre alunos.
        const area = await this.studyAreasService.getMyStudyArea(
            actor.id,
            input.studyAreaId,
        );
        const materials = await this.materialsService.listReadyTextSources(
            actor.id,
            input.studyAreaId,
        );

        if (materials.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_INTERNAL_SOURCES",
                message:
                    "Esta área ainda não tem fontes internas processáveis para responder.",
            });
        }

        const citations = materials.slice(0, 3).map((material) => ({
            materialId: String(material._id),
            title: material.title,
            excerpt: (material.contentText ?? "").trim().slice(0, 420),
        }));
        const policy = resolveExternalAiPolicy({
            allowExternalKnowledge: input.allowExternalKnowledge,
            internalSourceCount: citations.length,
        });

        // O provider recebe a decisão final da policy, não o valor bruto vindo da UI.
        const answer = await this.generateAnswer(
            area.name,
            input.question,
            citations,
            policy.externalAllowed,
        );

        const document = await this.answerModel.create({
            studentId: new Types.ObjectId(actor.id),
            studyAreaId: new Types.ObjectId(input.studyAreaId),
            question: input.question.trim(),
            answer,
            externalUsed: policy.externalAllowed,
            internalCitations: citations,
            externalNotes: policy.externalNotes,
        });
        const created = document.toObject() as { createdAt?: Date };

        return {
            _id: String(document._id),
            studyAreaId: input.studyAreaId,
            question: document.question,
            answer: document.answer,
            externalUsed: document.externalUsed,
            internalCitations: document.internalCitations,
            externalNotes: document.externalNotes,
            createdAt: created.createdAt,
        };
    }

    /**
     * Chama o provider IA mantendo fontes internas como verdade principal.
     *
     * @param areaName Nome da área privada do aluno.
     * @param question Pergunta validada do aluno.
     * @param citations Citações internas autorizadas.
     * @param externalAllowed Decisão final da policy.
     * @returns Texto validado devolvido pelo provider.
     */
    private async generateAnswer(
        areaName: string,
        question: string,
        citations: ExternalKnowledgeInternalCitation[],
        externalAllowed: boolean,
    ): Promise<string> {
        const prompt = [
            "Responde em português de Portugal.",
            "Usa as fontes internas autorizadas como verdade principal.",
            externalAllowed
                ? "Podes acrescentar contexto externo curto, geral e separado das fontes internas."
                : "Não uses conhecimento externo.",
            `Área: ${areaName}`,
            "Pergunta:",
            question.trim(),
            "Fontes internas:",
            citations
                .map(
                    (citation, index) =>
                        `Fonte ${index + 1} (${citation.materialId}, ${citation.title}): ${citation.excerpt}`,
                )
                .join("\n"),
            "Devolve JSON com a chave answer.",
        ].join("\n");

        let providerResult: Record<string, unknown>;
        try {
            // A chamada externa fica isolada para ser substituída por fixture nos testes.
            providerResult = await this.aiProvider.generateStudyTool({
                prompt,
                type: "EXPLANATION",
            });
        } catch {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }

        const answer = providerResult.answer;
        if (typeof answer !== "string" || answer.trim().length === 0) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_INVALID_RESPONSE",
                message: "A IA devolveu uma resposta inválida.",
            });
        }

        return answer.trim();
    }
}
```

Explicação do código

O service é a parte central do BK. Ele começa por validar `actor.role`, depois confirma ownership da área usando `StudyAreasService`, lista fontes internas com `MaterialsService`, bloqueia a resposta se não houver fontes, calcula a policy e só então chama o provider IA.

Esta ordem evita dois problemas graves: gerar resposta sem fontes internas e deixar o frontend decidir se contexto externo pode ser usado. O provider recebe `policy.externalAllowed`, não recebe diretamente o valor bruto da checkbox. Assim, se a policy bloquear, o prompt diz para não usar conhecimento externo.

Os dados que entram são `actor` e `AskExternalKnowledgeAiDto`. Os dados que saem são `ExternalKnowledgeAiAnswerView`, com citações internas e notas externas separadas. A persistência usa `studentId` vindo da sessão, não do body. Para testar, usa uma suite unitária com provider isolado e valida `externalUsed`, `externalNotes`, erro sem fontes e erro de role.

5. Explicação do código.

A explicação principal está imediatamente após o bloco. O aluno pode ajustar mensagens públicas e tamanho dos excertos, mas não deve alterar a ordem das validações nem enviar prompts antes de confirmar ownership e fontes. Esta é a fronteira de segurança mais importante do BK.

6. Validação do passo.

Resultado esperado: com aluno, área própria, fontes internas e `allowExternalKnowledge: true`, o service persiste `externalUsed: true` e uma nota externa. Com `allowExternalKnowledge: false`, persiste `externalUsed: false` e `externalNotes: []`.

7. Cenário negativo/erro esperado.

Com role diferente de `STUDENT`, o service devolve `ForbiddenException` com `code: "STUDENT_ROLE_REQUIRED"`. Com zero fontes, devolve `UnprocessableEntityException` com `code: "NO_INTERNAL_SOURCES"`.

### Passo 6 - Integrar cliente React e painel de UI

1. Objetivo funcional do passo no contexto da app.

Permitir que o aluno faça a pergunta, escolha se permite contexto externo limitado e veja uma resposta honesta com estados claros.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/features/external-knowledge-ai/ask-external-knowledge-ai.ts`
    - EDITAR: `apps/web/src/features/external-knowledge-ai/external-knowledge-ai-panel.tsx`
    - REVER: `apps/web/src/features/mf3/request-mf3-json.ts`
    - LOCALIZAÇÃO: feature `external-knowledge-ai`.

3. Instruções do que fazer.

Mantém o cliente tipado e usa o helper JSON existente, que já envia cookies HttpOnly com `credentials: "include"`. No painel, cobre vazio, loading, erro, sucesso, citações internas e notas externas.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/external-knowledge-ai/ask-external-knowledge-ai.ts
/**
 * Cliente frontend para IA com conhecimento externo limitado.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Resposta devolvida pelo backend para apresentação ao aluno.
 */
export type ExternalKnowledgeAnswer = {
    _id: string;
    studyAreaId: string;
    question: string;
    answer: string;
    externalUsed: boolean;
    internalCitations: { materialId: string; title: string; excerpt: string }[];
    externalNotes: string[];
    createdAt?: string;
};

/**
 * Payload enviado pelo painel React.
 */
export type AskExternalKnowledgeAiInput = {
    studyAreaId: string;
    question: string;
    allowExternalKnowledge: boolean;
};

/**
 * Pede uma resposta ao backend mantendo sessão por cookies HttpOnly.
 *
 * @param input Área, pergunta e permissão externa explícita.
 * @returns Resposta com fontes internas e notas externas separadas.
 */
export function askExternalKnowledgeAi(
    input: AskExternalKnowledgeAiInput,
): Promise<ExternalKnowledgeAnswer> {
    // O helper comum adiciona credentials: "include" e header CSRF sem expor a sessão ao JavaScript.
    return requestMf3Json<ExternalKnowledgeAnswer>(
        "/api/ai/external-knowledge-answers",
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}
```

Explicação do código

O cliente tipa a entrada e a resposta do endpoint. Isto impede que o painel trate uma resposta incompleta como válida durante o desenvolvimento. A função não guarda sessão nem token; delega para `requestMf3Json`, que mantém cookies HttpOnly via `credentials: "include"`.

Este ficheiro cumpre a ponte entre backend e frontend. O aluno pode reutilizar o tipo `ExternalKnowledgeAnswer` noutros componentes, mas não deve duplicar a rota nem construir pedidos com identidade manual. Para testar, confirma no browser que o pedido vai para `/api/ai/external-knowledge-answers` e que a resposta tem `internalCitations` e `externalNotes`.

```tsx
// apps/web/src/features/external-knowledge-ai/external-knowledge-ai-panel.tsx
/**
 * Painel React para perguntas com conhecimento externo limitado.
 */
import { FormEvent, useState } from "react";
import {
    askExternalKnowledgeAi,
    ExternalKnowledgeAnswer,
} from "./ask-external-knowledge-ai.js";

/**
 * Interface onde o aluno pede uma resposta com fontes internas e nota externa opcional.
 *
 * @returns Formulário, estados de execução e resultado explicado.
 */
export function ExternalKnowledgeAiPanel() {
    const [studyAreaId, setStudyAreaId] = useState("");
    const [question, setQuestion] = useState("");
    const [allowExternalKnowledge, setAllowExternalKnowledge] = useState(false);
    const [answer, setAnswer] = useState<ExternalKnowledgeAnswer | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const canSubmit = studyAreaId.trim().length > 0 && question.trim().length >= 5 && !loading;

    /**
     * Submete o formulário e sincroniza estados de UI.
     *
     * @param event Evento do formulário.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // A UI envia apenas a intenção; permissões e ownership continuam no backend.
            setAnswer(
                await askExternalKnowledgeAi({
                    studyAreaId: studyAreaId.trim(),
                    question: question.trim(),
                    allowExternalKnowledge,
                }),
            );
        } catch (caught) {
            setAnswer(null);
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível obter resposta da IA.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4" aria-labelledby="external-knowledge-title">
            <header>
                <h2 id="external-knowledge-title" className="text-lg font-semibold">
                    Conhecimento externo limitado
                </h2>
                <p className="text-sm text-slate-600">
                    A resposta usa fontes internas como base e marca qualquer nota externa.
                </p>
            </header>

            {error ? (
                <p className="sf-error" role="alert">
                    {error}
                </p>
            ) : null}

            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block text-sm font-medium" htmlFor="external-study-area">
                    Área de estudo
                </label>
                <input
                    id="external-study-area"
                    className="sf-input"
                    value={studyAreaId}
                    onChange={(event) => setStudyAreaId(event.target.value)}
                    placeholder="Id da área de estudo"
                />

                <label className="block text-sm font-medium" htmlFor="external-question">
                    Pergunta
                </label>
                <textarea
                    id="external-question"
                    className="sf-input min-h-28"
                    rows={4}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Escreve uma pergunta baseada nos teus materiais."
                />

                <label className="flex items-start gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={allowExternalKnowledge}
                        onChange={(event) => setAllowExternalKnowledge(event.target.checked)}
                    />
                    <span>
                        Permitir uma nota externa curta, separada das fontes internas.
                    </span>
                </label>

                <button className="sf-button-primary" type="submit" disabled={!canSubmit}>
                    {loading ? "A responder..." : "Responder"}
                </button>
            </form>

            {!answer && !loading && !error ? (
                <p className="text-sm text-slate-600">
                    Ainda não existe resposta para esta pergunta.
                </p>
            ) : null}

            {answer ? (
                <article className="space-y-3 text-sm" aria-live="polite">
                    <p className="whitespace-pre-line text-slate-800">{answer.answer}</p>
                    <p className="font-medium text-slate-700">
                        {answer.externalUsed ? "Nota externa usada" : "Só fontes internas"}
                    </p>

                    <section aria-labelledby="internal-citations-title">
                        <h3 id="internal-citations-title" className="font-semibold">
                            Fontes internas usadas
                        </h3>
                        <ul className="list-disc space-y-1 pl-5">
                            {answer.internalCitations.map((citation) => (
                                <li key={citation.materialId}>
                                    <strong>{citation.title}</strong>: {citation.excerpt}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {answer.externalNotes.length > 0 ? (
                        <section aria-labelledby="external-notes-title">
                            <h3 id="external-notes-title" className="font-semibold">
                                Notas externas
                            </h3>
                            <ul className="list-disc space-y-1 pl-5">
                                {answer.externalNotes.map((note) => (
                                    <li key={note}>{note}</li>
                                ))}
                            </ul>
                        </section>
                    ) : null}
                </article>
            ) : null}
        </section>
    );
}
```

Explicação do código

O painel cobre os quatro estados necessários: vazio, loading, erro e sucesso. A checkbox envia permissão explícita, mas a UI não decide autorização. O backend continua responsável por sessão, ownership, role e fontes internas.

O componente também torna a origem da resposta visível: mostra citações internas numa secção própria e notas externas noutra. Isto evita confusão entre material do aluno e contexto geral. Acessibilidade mínima aparece em `label`, `htmlFor`, `role="alert"` e `aria-live`. O aluno pode melhorar estilos no próximo BK, mas não deve remover as mensagens que distinguem fontes internas de notas externas.

5. Explicação do código.

A explicação principal está depois de cada bloco. O cliente garante contrato tipado e o painel garante experiência honesta. Para validar, testa pergunta curta, área vazia, sessão expirada, resposta com nota externa e resposta sem nota externa.

6. Validação do passo.

Resultado esperado: o botão só fica disponível com área e pergunta válida, o loading aparece durante o pedido, erros são visíveis, e a resposta mostra `internalCitations` separadas de `externalNotes`.

7. Cenário negativo/erro esperado.

Com sessão expirada, a UI deve mostrar erro compreensível. Ela não deve tentar recuperar sessão por dados guardados no browser nem construir `userId` manualmente.

### Passo 7 - Testar negativos, recolher evidence e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Provar que `RNF37` ficou implementado com testes automatizados e evidence limpa para PR/defesa.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/external-knowledge-ai/external-ai-policy.spec.ts`
    - EDITAR: `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.spec.ts`
    - REVER: `apps/api/package.json`
    - REVER: `apps/web/package.json`
    - LOCALIZAÇÃO: suites Jest do módulo `external-knowledge-ai`.

3. Instruções do que fazer.

Cria uma suite para a policy e reforça a suite do service. Os testes devem cobrir:

- contexto externo permitido;
- contexto externo recusado sem permissão;
- bloqueio sem fontes internas;
- bloqueio de utilizador que não é aluno;
- provider com resposta inválida;
- persistência de `externalNotes` separadas de `internalCitations`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/external-knowledge-ai/external-ai-policy.spec.ts
/**
 * Testa a policy pura de conhecimento externo limitado.
 */
import { resolveExternalAiPolicy } from "./external-ai-policy.js";

describe("resolveExternalAiPolicy", () => {
    it("permite contexto externo apenas com fonte interna e permissão explícita", () => {
        const decision = resolveExternalAiPolicy({
            allowExternalKnowledge: true,
            internalSourceCount: 2,
        });

        // O teste prova a regra de RNF37 sem depender de HTTP, BD ou provider IA.
        expect(decision).toMatchObject({
            externalAllowed: true,
            reason: "Contexto externo limitado permitido.",
        });
        expect(decision.externalNotes).toHaveLength(1);
    });

    it("bloqueia contexto externo quando o aluno não deu permissão", () => {
        const decision = resolveExternalAiPolicy({
            allowExternalKnowledge: false,
            internalSourceCount: 2,
        });

        expect(decision.externalAllowed).toBe(false);
        expect(decision.externalNotes).toEqual([]);
    });

    it("bloqueia contexto externo quando não há fontes internas", () => {
        const decision = resolveExternalAiPolicy({
            allowExternalKnowledge: true,
            internalSourceCount: 0,
        });

        expect(decision.externalAllowed).toBe(false);
        expect(decision.reason).toBe("Sem fontes internas processáveis.");
    });
});
```

Explicação do código

Esta suite testa a regra mais pequena do BK. Como a policy não depende de NestJS, base de dados ou provider, os testes são rápidos e fáceis de explicar na defesa. O primeiro teste prova o caminho feliz; os outros dois provam que permissão explícita e fonte interna são obrigatórias.

O aluno pode acrescentar mais motivos públicos, mas deve manter asserts sobre `externalAllowed` e `externalNotes`. Sem esses asserts, o teste poderia passar sem provar a separação entre fontes internas e notas externas.

```ts
// apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.spec.ts
/**
 * Testa o service de IA com conhecimento externo limitado.
 */
import {
    ForbiddenException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AiProvider } from "../ai/providers/ai-provider.js";
import { MaterialsService } from "../materials/materials.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { ExternalKnowledgeAiService } from "./external-knowledge-ai.service.js";
import { ExternalKnowledgeAiAnswerDocument } from "./schemas/external-knowledge-ai-answer.schema.js";

describe("ExternalKnowledgeAiService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    const teacher: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439013",
        email: "professor@example.test",
        role: "TEACHER",
    };
    const studyAreaId = "507f1f77bcf86cd799439014";

    it("responde com citações internas e nota externa separada quando permitido", async () => {
        const { aiProvider, answerModel, materialsService, service, studyAreasService } =
            makeService();

        await expect(
            service.ask(student, {
                studyAreaId,
                question: "Como estudar limites?",
                allowExternalKnowledge: true,
            }),
        ).resolves.toMatchObject({
            studyAreaId,
            externalUsed: true,
            internalCitations: [expect.objectContaining({ title: "Limites" })],
            externalNotes: [expect.stringContaining("Nota externa limitada")],
        });
        expect(studyAreasService.getMyStudyArea).toHaveBeenCalledWith(
            student.id,
            studyAreaId,
        );
        expect(materialsService.listReadyTextSources).toHaveBeenCalledWith(
            student.id,
            studyAreaId,
        );
        expect(answerModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                answer: "Resposta externa gerada pelo provider.",
                externalUsed: true,
            }),
        );
        expect(aiProvider.generateStudyTool).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "EXPLANATION",
                prompt: expect.stringContaining("Podes acrescentar contexto externo"),
            }),
        );
    });

    it("usa apenas fontes internas quando não há permissão externa", async () => {
        const { aiProvider, answerModel, service } = makeService();

        await expect(
            service.ask(student, {
                studyAreaId,
                question: "Como estudar limites?",
                allowExternalKnowledge: false,
            }),
        ).resolves.toMatchObject({
            externalUsed: false,
            externalNotes: [],
        });
        expect(answerModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                externalUsed: false,
                externalNotes: [],
            }),
        );
        expect(aiProvider.generateStudyTool).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: expect.stringContaining("Não uses conhecimento externo."),
            }),
        );
    });

    it("bloqueia sem fontes internas processáveis", async () => {
        const { aiProvider, materialsService, service } = makeService();
        materialsService.listReadyTextSources.mockResolvedValueOnce([]);

        await expect(
            service.ask(student, {
                studyAreaId,
                question: "Explica o tema.",
                allowExternalKnowledge: true,
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        // O provider não pode ser chamado quando falta a base interna autorizada.
        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
    });

    it("bloqueia utilizadores que não sejam alunos", async () => {
        const { service, studyAreasService } = makeService();

        await expect(
            service.ask(teacher, {
                studyAreaId,
                question: "Explica limites.",
                allowExternalKnowledge: false,
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(studyAreasService.getMyStudyArea).not.toHaveBeenCalled();
    });

    it("devolve erro controlado quando o provider não devolve resposta válida", async () => {
        const { aiProvider, service } = makeService();
        aiProvider.generateStudyTool.mockResolvedValueOnce({ answer: "" });

        await expect(
            service.ask(student, {
                studyAreaId,
                question: "Como estudar limites?",
                allowExternalKnowledge: true,
            }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
});

/**
 * Cria dependências de teste sem rede real, sem base de dados real e sem dados privados.
 *
 * @returns Service e dependências observáveis pelos testes.
 */
function makeService() {
    const answerModel = {
        create: jest.fn().mockImplementation(async (input) => ({
            _id: "507f1f77bcf86cd799439099",
            ...input,
            toObject: () => ({ createdAt: new Date("2026-06-15T10:00:00Z") }),
        })),
    } as unknown as jest.Mocked<Pick<Model<ExternalKnowledgeAiAnswerDocument>, "create">>;
    const studyAreasService = {
        getMyStudyArea: jest.fn().mockResolvedValue({
            _id: "507f1f77bcf86cd799439014",
            name: "Matemática",
        }),
    } as unknown as jest.Mocked<Pick<StudyAreasService, "getMyStudyArea">>;
    const materialsService = {
        listReadyTextSources: jest.fn().mockResolvedValue([
            {
                _id: "507f1f77bcf86cd799439015",
                title: "Limites",
                contentText: "Um limite descreve o valor aproximado de uma função.",
            },
        ]),
    } as unknown as jest.Mocked<Pick<MaterialsService, "listReadyTextSources">>;
    const aiProvider = {
        generateStudyTool: jest
            .fn()
            .mockResolvedValue({ answer: "Resposta externa gerada pelo provider." }),
    } as unknown as jest.Mocked<Pick<AiProvider, "generateStudyTool">>;

    // As conversões mantêm a fixture curta, mas os objetos continuam com os métodos que o service usa.
    const service = new ExternalKnowledgeAiService(
        answerModel as unknown as Model<ExternalKnowledgeAiAnswerDocument>,
        studyAreasService as unknown as StudyAreasService,
        materialsService as unknown as MaterialsService,
        aiProvider as unknown as AiProvider,
    );

    return {
        aiProvider,
        answerModel,
        materialsService,
        service,
        studyAreasService,
    };
}
```

Explicação do código

A suite do service prova o fluxo completo sem rede real nem base de dados real. Os testes verificam ownership chamado com `student.id`, fontes listadas para a área correta, provider chamado só quando existem fontes e persistência com `externalUsed` e `externalNotes` coerentes.

Os negativos são essenciais para `RNF37`: sem fontes internas, o provider não é chamado; com role errada, nem sequer se consulta a área; com provider inválido, a resposta falha de forma controlada. As fixtures usam dados fictícios e não guardam materiais privados completos. O aluno pode acrescentar testes de controller ou UI, mas não deve remover estes negativos mínimos.

5. Explicação do código.

A explicação principal está depois de cada bloco. Esta etapa fecha a parte demonstrável do BK: não basta a funcionalidade existir, ela tem de falhar com controlo nos cenários perigosos. Os comandos recomendados são `npm --prefix apps/api test -- external-knowledge-ai`, `git diff --check` e o validador da planificação.

6. Validação do passo.

Resultado esperado: suite `external-knowledge-ai` passa; a policy fica coberta; o service prova sucesso, permissão recusada, ausência de fontes, role errada e provider inválido.

7. Cenário negativo/erro esperado.

Se algum teste passar sem assert sobre `externalUsed`, `externalNotes`, `code` de erro ou ausência de chamada ao provider, reforça o teste. Um teste que só verifica "não lança erro" não prova `RNF37`.

#### Critérios de aceite

- Metadados continuam iguais na matriz, backlog, contrato de campos e índice de guias.
- `RNF37` fica implementado sem criar requisitos fora do escopo.
- Existe uma policy testável para contexto externo limitado.
- `POST /api/ai/external-knowledge-answers` é o endpoint único do fluxo.
- O backend valida sessão, role `STUDENT`, ownership da área e existência de fontes internas antes do provider.
- O DTO valida `studyAreaId`, `question` e `allowExternalKnowledge`.
- O schema separa `internalCitations` de `externalNotes`.
- O frontend usa cliente tipado e helper com `credentials: "include"`.
- O painel mostra vazio, loading, erro e sucesso.
- A UI distingue fontes internas de notas externas.
- Os testes cobrem sucesso, sem permissão externa, sem fontes internas, role errada e provider inválido.
- Não há tokens, cookies, prompts privados, respostas completas ou materiais integrais em logs ou evidence.
- O handoff para `BK-MF8-05` fica claro.

#### Validação final

Executa:

```bash
npm --prefix apps/api test -- external-knowledge-ai
git diff --check
bash scripts/validate-planificacao.sh
```

Confirma também:

- o guia mantém 16 secções `####`;
- o guia mantém 7 passos `### Passo`;
- não há caminhos privados em texto destinado aos alunos;
- não há notas de processo fora da entrega do BK;
- não há código com `userId` vindo do body;
- não há armazenamento local de sessão, segredos ou dados sensíveis;
- não há provider chamado antes de ownership e fontes internas;
- não há notas externas misturadas com citações internas.

#### Evidence para PR/defesa

Regista evidence objetiva neste formato:

- `command`: comando executado.
- `expected`: comportamento esperado.
- `observed`: output observado.
- `result`: `PASS` ou erro concreto.
- `privacy`: confirmação de que a evidence não contém dados sensíveis.
- `handoff`: impacto para `BK-MF8-05`.

Evidence mínima:

- output de `npm --prefix apps/api test -- external-knowledge-ai`;
- output de `git diff --check`;
- output de `bash scripts/validate-planificacao.sh`;
- screenshot ou descrição da UI com checkbox e resposta separando citações internas de notas externas;
- negativo sem fontes internas com erro `NO_INTERNAL_SOURCES`;
- negativo sem role `STUDENT` com erro `STUDENT_ROLE_REQUIRED`.

#### Handoff

O próximo BK é `BK-MF8-05`. Ele pode assumir que:

- o fluxo de conhecimento externo limitado usa `POST /api/ai/external-knowledge-answers`;
- o backend separa citações internas de notas externas;
- o frontend já tem painel funcional;
- a UI pode ser aproximada ao mockup sem alterar contrato de segurança;
- ownership, role, fontes e provider continuam responsabilidade do backend.

#### Changelog

- `2026-07-01`: guia alinhado com `RNF37`, policy integrada, backend completo, frontend completo, testes negativos e handoff para `BK-MF8-05`.
