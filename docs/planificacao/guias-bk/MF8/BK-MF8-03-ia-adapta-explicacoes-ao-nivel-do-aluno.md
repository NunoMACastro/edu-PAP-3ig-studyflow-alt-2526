# BK-MF8-03 - IA adapta explicações ao nível do aluno.

## Header

- `doc_id`: `GUIA-BK-MF8-03`
- `bk_id`: `BK-MF8-03`
- `macro`: `MF8`
- `owner`: `Daniel`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF36`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-04`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`
- `last_updated`: `2026-07-02`

#### Objetivo

Neste BK vais fechar o contrato de explicações adaptadas ao nível do aluno. O objetivo é garantir que a IA usa o perfil pedagógico privado da área de estudo, respeita materiais processáveis autorizados e devolve uma explicação adequada ao ritmo, nível, dificuldades e estilo preferido do aluno autenticado. Nas salas de estudo, a mesma regra de `RNF36` aplica-se pela via leve do `StudentProfile.year`: a IA da sala adapta linguagem e detalhe ao ano escolar do aluno que pergunta, sem usar idade exata.

#### Importância

`RNF36` é CANONICO na planificação StudyFlow: a IA deve adaptar explicações ao nível do aluno. Esta adaptação não pode ser apenas uma frase no prompt; tem de nascer de dados autorizados no backend, passar por validação real e chegar ao frontend com estados claros para o aluno.

Este BK também evita um risco técnico importante: criar outra enumeração de nível ou outra policy paralela quebraria o contrato já entregue em fases anteriores. O contrato correto usa `LearningProfile`, `LearningPace`, `LearningLevel`, `AdaptiveLearningService` e o endpoint público `POST /api/ai/adaptive-explanations` para a explicação individual. Para a IA da sala, o contrato correto reutiliza `StudentProfile.year`, `StudentProfileService` e `RoomAiService`, mantendo a resposta limitada às fontes da sala.

#### Scope-in

- Confirmar metadados canónicos de `BK-MF8-03` em matriz, backlog, contrato de campos, views e plano de sprints.
- Reutilizar o perfil pedagógico existente da área privada do aluno: `pace`, `level`, `difficulties` e `preferredExplanationStyle`.
- Garantir que `level` usa apenas `BEGINNER`, `INTERMEDIATE` ou `ADVANCED`, e que `pace` usa apenas `SLOW`, `BALANCED` ou `FAST`.
- Ensinar a fachada `POST /api/ai/adaptive-explanations`, que recebe sessão autenticada, valida role de aluno e delega para `AdaptiveLearningService`.
- Ensinar que `POST /api/study-rooms/:roomId/ai/answers` adapta a forma da resposta ao ano escolar do aluno que pergunta, resolvido no backend por `StudentProfile.year`.
- Ensinar o cliente React e o painel de explicação adaptada com loading, vazio, erro e sucesso.
- Ensinar testes focados para role não aluno, ausência de fontes, perfil ausente com defaults seguros, perfil aplicado ao prompt e provider inválido.
- Preservar privacidade: `userId` vem sempre da sessão, a área é validada por ownership no backend e a evidence não inclui prompts completos nem materiais privados.

#### Scope-out

- Alterar IDs, owner, apoio, prioridade, esforço, sprint, RF/RNF, dependências ou ordem dos BKs.
- Criar outra enum ou outra policy paralela de nível pedagógico.
- Aceitar `studentId`, `userId`, `role`, `pace` ou `level` vindos do frontend para decidir o perfil usado na geração.
- Aceitar idade exata ou ano escolar enviados no body da IA da sala.
- Criar outro endpoint para a mesma ação quando `POST /api/ai/adaptive-explanations` já existe como contrato público deste fluxo.
- Prometer RAG, embeddings, OCR, chunking semântico, tradução completa ou automação externa.
- Guardar prompts privados, respostas completas, materiais integrais, cookies, chaves ou dados pessoais em logs ou evidence.
- Fazer o frontend decidir ownership, role ou acesso a materiais.

#### Estado antes e depois

- Estado antes: a aplicação já tinha perfil pedagógico por área, fontes autorizadas e uma fachada de explicações adaptadas, mas o fecho de MF8 ainda precisava de alinhar o guia com esses contratos reais e provar que não havia enumerações paralelas.
- Estado depois: o guia entrega um caminho único e implementável para `RNF36`, com backend, frontend, testes, validação, negativos e handoff alinhados com `LearningProfile`, `AdaptiveLearningService` e `BK-MF8-04`.

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
- `docs/planificacao/guias-bk/MF1/BK-MF1-01-a-ia-deve-adaptar-explicacoes-ao-ritmo-dificuldades-do-aluno.md`
- `docs/planificacao/guias-bk/MF3/BK-MF3-01-guardrails-distintos-para-aluno-solo-grupo-e-turma.md`
- `docs/planificacao/guias-bk/MF3/BK-MF3-04-ia-deve-ajustar-explicacoes-ao-perfil-do-aluno.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`

#### Glossário

- **Perfil pedagógico:** dados da área de estudo que orientam ritmo, nível, dificuldades e estilo da explicação.
- **Ano escolar da IA da sala:** valor `StudentProfile.year` usado apenas para adaptar linguagem, exemplos e profundidade na sala.
- **`LearningPace`:** ritmo de explicação, limitado a `SLOW`, `BALANCED` ou `FAST`.
- **`LearningLevel`:** nível pedagógico, limitado a `BEGINNER`, `INTERMEDIATE` ou `ADVANCED`.
- **Área de estudo privada:** espaço de estudo pertencente ao aluno autenticado; o backend valida ownership antes de ler ou gerar dados.
- **Fonte processável:** material com texto pronto para sustentar a resposta IA.
- **Fachada HTTP:** controller específico que expõe um contrato simples e delega regras complexas para services já existentes.
- **Provider IA:** adaptação isolada para chamar o modelo, sempre depois de validação de perfil, fontes e permissões.
- **Fallback honesto:** erro controlado quando faltam fontes ou o provider devolve uma resposta inválida.
- **Evidence:** prova objetiva de execução sem expor conteúdo privado.

#### Conceitos teóricos essenciais

- **Personalização pedagógica.** É a adaptação da explicação ao aluno autenticado. Vem do perfil da área de estudo, entra no prompt validado e sai como uma resposta escrita num nível adequado. Evita que todos os alunos recebam a mesma explicação, mesmo quando têm dificuldades diferentes.
- **Duas superfícies de adaptação.** A explicação individual usa `LearningProfile` por área de estudo. A IA da sala usa `StudentProfile.year` do aluno que pergunta. As duas superfícies cumprem `RNF36`, mas não misturam dados: a sala continua limitada a `RoomShare` autorizado e o ano escolar só muda a forma da explicação.
- **Perfil por área.** O perfil não é global porque o mesmo aluno pode ser avançado em Matemática e iniciante em Física. Por isso, `LearningProfile` junta `userId` e `studyAreaId` e mantém o ownership no backend.
- **DTO.** O DTO define o que o frontend pode enviar. Neste BK, o frontend só envia `studyAreaId` e `question`; não envia nível, ritmo nem identidade do aluno.
- **Controller.** O controller recebe HTTP, exige sessão com `SessionGuard` e passa a decisão para o service. Evita colocar regras de domínio no transporte.
- **Service.** O service valida role, chama o contrato já existente e mantém a ordem segura: sessão, ownership, fontes, provider, validação, persistência e histórico.
- **Schema/model.** `LearningProfile` e `AdaptiveExplanation` guardam o perfil e a resposta gerada. Estes dados pertencem ao aluno e à área de estudo.
- **Provider isolado.** A chamada ao modelo não está espalhada pela aplicação. O service envia um prompt com fontes autorizadas e valida a resposta antes de persistir.
- **Frontend React.** O painel chama a API com `credentials: "include"`, mostra loading, vazio, erro e sucesso, e nunca decide permissões.
- **Privacidade e RGPD.** A evidence pode dizer que o teste passou, mas não deve copiar prompts completos, respostas privadas nem materiais integrais.
- **Teste negativo.** Um teste negativo prova que a aplicação falha de forma segura: professor bloqueado, área sem fontes, provider inválido ou sessão ausente.

#### Arquitetura do BK

- Requisito CANONICO: `RNF36 - IA adapta explicações ao nível do aluno`.
- Metadados CANONICO: `BK-MF8-03`, owner `Daniel`, apoio `Natalia`, prioridade `P1`, esforço `S`, sprint `S12`, core e próximo BK `BK-MF8-04`.
- Endpoint principal: `POST /api/ai/adaptive-explanations`.
- Endpoint complementar de sala: `POST /api/study-rooms/:roomId/ai/answers`.
- Backend:
  - `AskMf3AdaptiveExplanationDto` valida `studyAreaId` e `question`.
  - `AdaptiveExplanationsController` aplica `SessionGuard`.
  - `AdaptiveExplanationsService` bloqueia utilizadores que não sejam alunos.
  - `AdaptiveLearningService` valida ownership, perfil, fontes, provider e persistência.
  - `RoomAiService` valida membership, fontes da sala, perfil do aluno autenticado e provider.
  - `resolveRoomAiPedagogicalContext(...)` converte `StudentProfile.year` em contexto `PRIMARY`, `LOWER_SECONDARY`, `UPPER_SECONDARY`, `HIGHER_EDUCATION` ou `UNKNOWN`.
- Frontend:
  - `askMf3AdaptiveExplanation(...)` chama o endpoint com helper que mantém cookies HttpOnly.
  - `AdaptiveExplanationPanel` recolhe área e pergunta, mostra estados e apresenta resposta.
  - `RoomAiPage` continua a enviar apenas pergunta e fontes; o ano escolar vem sempre da sessão no backend.
- Testes:
  - role não aluno;
  - área sem fontes processáveis;
  - perfil ausente com defaults seguros;
  - perfil existente aplicado ao prompt;
  - provider com fontes inválidas.
  - IA da sala com `4.º ano`, ensino superior e fallback `UNKNOWN`.
- Decisão DERIVADO: manter a fachada `/api/ai/adaptive-explanations` como contrato simples para MF8, reutilizando a implementação mais completa entregue em MF1/MF3.
- Decisão DERIVADO: quando o perfil não existe, usar defaults seguros `BALANCED` e `INTERMEDIATE`, porque são valores conservadores e já existem no service.
- Decisão DERIVADO: na IA da sala, usar `StudentProfile.year` em vez de idade exata, porque o ano escolar minimiza dados pessoais e é mais adequado para personalização pedagógica.

#### Ficheiros a criar/editar/rever

- REVER: `apps/api/src/modules/ai/schemas/learning-profile.schema.ts`
- REVER: `apps/api/src/modules/ai/dto/update-learning-profile.dto.ts`
- REVER: `apps/api/src/modules/ai/adaptive-learning.service.ts`
- EDITAR: `apps/api/src/modules/adaptive-explanations/dto/ask-adaptive-explanation.dto.ts`
- EDITAR: `apps/api/src/modules/adaptive-explanations/adaptive-explanations.service.ts`
- EDITAR: `apps/api/src/modules/adaptive-explanations/adaptive-explanations.controller.ts`
- EDITAR: `apps/api/src/modules/adaptive-explanations/adaptive-explanations.module.ts`
- EDITAR: `apps/api/src/modules/adaptive-explanations/adaptive-explanations.service.spec.ts`
- EDITAR: `apps/api/src/modules/ai/adaptive-learning.service.spec.ts`
- EDITAR: `apps/web/src/features/adaptive-explanations/ask-adaptive-explanation.ts`
- EDITAR: `apps/web/src/features/adaptive-explanations/adaptive-explanation-panel.tsx`
- REVER: `apps/web/src/features/mf3/request-mf3-json.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que o BK entrega `RNF36` sem alterar metadados, sem criar outro domínio e sem duplicar o perfil pedagógico.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: linhas onde surgem `BK-MF8-03` e `RNF36`.

3. Instruções do que fazer.

Confirma que os documentos mantêm estes valores: `BK-MF8-03`, `RNF36`, owner `Daniel`, apoio `Natalia`, prioridade `P1`, esforço `S`, sprint `S12`, dependências `-`, core e próximo BK `BK-MF8-04`.

Regista `CANONICO` para esses metadados. Regista `DERIVADO` apenas para a decisão técnica de reutilizar a fachada `/api/ai/adaptive-explanations` e os defaults seguros de perfil.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e fixa as fronteiras antes de mexer em ficheiros técnicos.

5. Explicação do código.

Não há código porque o objetivo é evitar drift. Se os metadados mudarem sem evidência canónica, o aluno pode implementar um requisito certo com owner, sprint ou próximo BK errados.

6. Validação do passo.

Resultado esperado: matriz, backlog, contrato, views, sprints e README dos guias apontam para o mesmo `BK-MF8-03` e para `RNF36`.

7. Cenário negativo/erro esperado.

Se encontrares valores incompatíveis, para a implementação e regista `BLOQUEADO_POR_CONTRATO` no relatório da MF8. Não escolhas manualmente o valor que parece mais provável.


### Passo 2 - Fixar o contrato de perfil pedagógico existente

1. Objetivo funcional do passo no contexto da app.

Garantir que o BK usa o perfil pedagógico real da StudyFlow e não cria uma policy paralela com valores incompatíveis.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/ai/schemas/learning-profile.schema.ts`
    - REVER: `apps/api/src/modules/ai/dto/update-learning-profile.dto.ts`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Confirma que `LearningPace` e `LearningLevel` existem nestes valores exatos. Se o ficheiro estiver diferente, alinha-o com o contrato abaixo. Não cries campos nem ficheiros paralelos para decidir o nível pedagógico.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai/schemas/learning-profile.schema.ts
/**
 * Define o modelo persistido do perfil pedagógico usado pela IA adaptativa.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose do perfil de aprendizagem.
 */
export type LearningProfileDocument = HydratedDocument<LearningProfile>;

/**
 * Ritmo autorizado para ajustar a explicação sem aceitar texto livre vindo do frontend.
 */
export type LearningPace = "SLOW" | "BALANCED" | "FAST";

/**
 * Nível pedagógico autorizado para ajustar a profundidade da explicação.
 */
export type LearningLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

/**
 * Perfil de aprendizagem por área de estudo.
 *
 * Este contrato guarda preferências pedagógicas privadas do aluno. O par
 * userId + studyAreaId impede que uma área de outro aluno seja usada por engano.
 */
@Schema({ timestamps: true, collection: "learning_profiles" })
export class LearningProfile {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: "StudyArea",
        required: true,
        index: true,
    })
    studyAreaId!: Types.ObjectId;

    @Prop({
        required: true,
        enum: ["SLOW", "BALANCED", "FAST"],
        default: "BALANCED",
    })
    pace!: LearningPace;

    @Prop({
        required: true,
        enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
        default: "INTERMEDIATE",
    })
    level!: LearningLevel;

    @Prop({
        type: [String],
        default: [],
        validate: {
            validator: (values: string[]) =>
                values.every((value) => value.trim().length <= 120),
            message: "Cada dificuldade deve ter no máximo 120 caracteres.",
        },
    })
    difficulties!: string[];

    @Prop({ trim: true, maxlength: 200, default: "" })
    preferredExplanationStyle!: string;
}

export const LearningProfileSchema = SchemaFactory.createForClass(LearningProfile);
LearningProfileSchema.index({ userId: 1, studyAreaId: 1 }, { unique: true });
```

```ts
// apps/api/src/modules/ai/dto/update-learning-profile.dto.ts
/**
 * Define os dados editáveis do perfil pedagógico.
 */
import {
    ArrayMaxSize,
    IsArray,
    IsIn,
    IsOptional,
    IsString,
    MaxLength,
} from "class-validator";

/**
 * Payload usado quando o aluno ajusta ritmo, nível e preferências da IA.
 */
export class UpdateLearningProfileDto {
    @IsOptional()
    @IsIn(["SLOW", "BALANCED", "FAST"])
    pace?: "SLOW" | "BALANCED" | "FAST";

    @IsOptional()
    @IsIn(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
    level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(8)
    @IsString({ each: true })
    @MaxLength(120, { each: true })
    difficulties?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(200)
    preferredExplanationStyle?: string;
}
```

5. Explicação do código.

O schema guarda o perfil por aluno e área de estudo. O `userId` não vem do frontend; é usado pelo service depois de a sessão estar autenticada. O `studyAreaId` identifica a área privada e a combinação dos dois campos tem índice único para evitar dois perfis concorrentes para a mesma área.

As enums evitam valores livres como `"normal"`, `"baixo"` ou `"básico"`. O contrato correto é `BEGINNER`, `INTERMEDIATE`, `ADVANCED` para o nível, e `SLOW`, `BALANCED`, `FAST` para o ritmo. O DTO aplica a mesma lista antes de os dados chegarem ao service.

6. Validação do passo.

Resultado esperado: o guia usa apenas o contrato `LearningLevel` e `LearningPace` do schema real. O TypeScript consegue importar estes tipos sem criar ficheiros paralelos.

7. Cenário negativo/erro esperado.

Tenta enviar valores fora das enums documentadas no payload de atualização do perfil. O esperado é validação `400 Bad Request`, sem persistir valores fora do contrato.


### Passo 3 - Validar a fachada backend de explicações adaptadas

1. Objetivo funcional do passo no contexto da app.

Expor o contrato `POST /api/ai/adaptive-explanations` sem duplicar a lógica de IA adaptativa já entregue em fases anteriores.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/adaptive-explanations/dto/ask-adaptive-explanation.dto.ts`
    - EDITAR: `apps/api/src/modules/adaptive-explanations/adaptive-explanations.service.ts`
    - EDITAR: `apps/api/src/modules/adaptive-explanations/adaptive-explanations.controller.ts`
    - EDITAR: `apps/api/src/modules/adaptive-explanations/adaptive-explanations.module.ts`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Garante que o DTO só aceita `studyAreaId` e `question`. Depois mantém o controller fino e coloca a regra de role no service. A fachada deve chamar `AdaptiveLearningService.askAdaptiveExplanation(...)`, que já trata ownership da área, fontes processáveis, prompt, provider e persistência.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/adaptive-explanations/dto/ask-adaptive-explanation.dto.ts
/**
 * Define o payload público de uma explicação adaptada.
 */
import { IsMongoId, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Pedido para gerar explicação adaptada ao perfil da área do aluno.
 */
export class AskMf3AdaptiveExplanationDto {
    /**
     * Área de estudo privada. O backend confirma ownership antes de gerar resposta.
     */
    @IsMongoId()
    studyAreaId!: string;

    /**
     * Pergunta do aluno. O nível e o ritmo vêm do perfil guardado, não deste body.
     */
    @IsString()
    @MinLength(5)
    @MaxLength(1200)
    question!: string;
}
```

```ts
// apps/api/src/modules/adaptive-explanations/adaptive-explanations.service.ts
/**
 * Implementa a fachada de explicações adaptadas e concentra a regra de role.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AdaptiveLearningService } from "../ai/adaptive-learning.service.js";
import { AskMf3AdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto.js";

/**
 * Service de explicações adaptadas para o endpoint público da MF8.
 */
@Injectable()
export class AdaptiveExplanationsService {
    /**
     * @param adaptiveLearningService Service que valida área, perfil, fontes e provider.
     */
    constructor(private readonly adaptiveLearningService: AdaptiveLearningService) {}

    /**
     * Gera uma explicação adaptada para o aluno autenticado.
     *
     * @param actor Utilizador autenticado pela sessão.
     * @param input Área privada e pergunta do aluno.
     * @returns Explicação adaptada persistida pelo contrato de IA.
     */
    async ask(actor: AuthenticatedUser, input: AskMf3AdaptiveExplanationDto) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }

        // O userId vem da sessão; isto impede que o frontend peça explicações como outro aluno.
        return this.adaptiveLearningService.askAdaptiveExplanation(
            actor.id,
            input.studyAreaId,
            { question: input.question },
        );
    }
}
```

```ts
// apps/api/src/modules/adaptive-explanations/adaptive-explanations.controller.ts
/**
 * Expõe o endpoint HTTP de explicações adaptadas.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AdaptiveExplanationsService } from "./adaptive-explanations.service.js";
import { AskMf3AdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto.js";

/**
 * Controller do endpoint `POST /api/ai/adaptive-explanations`.
 */
@Controller("api/ai/adaptive-explanations")
@UseGuards(SessionGuard)
export class AdaptiveExplanationsController {
    /**
     * @param adaptiveExplanationsService Service que aplica regras de domínio.
     */
    constructor(private readonly adaptiveExplanationsService: AdaptiveExplanationsService) {}

    /**
     * Recebe o pedido autenticado e delega a decisão no service.
     *
     * @param request Pedido com utilizador resolvido pela sessão.
     * @param body Payload validado pelo DTO.
     * @returns Explicação adaptada.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Body() body: AskMf3AdaptiveExplanationDto,
    ) {
        // O controller não calcula permissões; mantém transporte separado do domínio.
        return this.adaptiveExplanationsService.ask(request.user!, body);
    }
}
```

```ts
// apps/api/src/modules/adaptive-explanations/adaptive-explanations.module.ts
/**
 * Regista a fachada de explicações adaptadas.
 */
import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { AdaptiveExplanationsController } from "./adaptive-explanations.controller.js";
import { AdaptiveExplanationsService } from "./adaptive-explanations.service.js";

/**
 * Módulo que liga autenticação, IA e endpoint público de explicações adaptadas.
 */
@Module({
    imports: [AuthModule, AiModule],
    controllers: [AdaptiveExplanationsController],
    providers: [AdaptiveExplanationsService],
})
export class AdaptiveExplanationsModule {}
```

5. Explicação do código.

O DTO limita o input a uma área e uma pergunta. Isto evita que o frontend envie `userId`, `level`, `pace` ou role. O controller usa `SessionGuard`, por isso a identidade vem da sessão segura. O service bloqueia utilizadores que não sejam alunos e delega a geração no `AdaptiveLearningService`.

Esta separação é importante: o controller sabe lidar com HTTP, mas não decide ownership. O service de IA adaptativa valida a área do aluno, carrega o perfil, recolhe fontes processáveis, cria o prompt com o perfil e valida o provider antes de guardar a resposta.

6. Validação do passo.

Resultado esperado: `POST /api/ai/adaptive-explanations` aceita `{ "studyAreaId": "...", "question": "..." }`, usa a sessão do browser e devolve uma explicação quando há perfil e fontes válidas.

7. Cenário negativo/erro esperado.

Envia o pedido com um utilizador `TEACHER`. O esperado é `403 Forbidden` com `code: "STUDENT_ROLE_REQUIRED"`. Envia sem sessão. O esperado é bloqueio pelo `SessionGuard`.


### Passo 4 - Confirmar geração com perfil, fontes e fallback honesto

1. Objetivo funcional do passo no contexto da app.

Confirmar que a fachada chama o contrato que realmente adapta a explicação e bloqueia respostas sem fontes.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/ai/adaptive-learning.service.ts`
    - REVER: `apps/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts`
    - REVER: `apps/api/src/modules/ai/schemas/adaptive-explanation.schema.ts`
    - LOCALIZAÇÃO: métodos `getLearningProfile`, `updateLearningProfile`, `askAdaptiveExplanation`, `validateResult` e prompt adaptativo.

3. Instruções do que fazer.

Não recries o service neste BK. Revê estes pontos no ficheiro existente:

- `getLearningProfile(...)` valida a área e devolve defaults seguros se o perfil ainda não existir.
- `updateLearningProfile(...)` persiste `pace`, `level`, `difficulties` e `preferredExplanationStyle`.
- `askAdaptiveExplanation(...)` valida ownership, recolhe fontes processáveis e chama o provider.
- `validateResult(...)` rejeita respostas vazias ou fontes fora dos materiais autorizados.
- `buildAdaptiveExplanationPrompt(...)` inclui ritmo, nível, dificuldades, estilo e fontes.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts
/**
 * Constrói prompts de IA mantendo o contexto pedagógico separado da lógica de serviço.
 */
import { AiSource } from "../providers/ai-provider.js";
import {
    LearningLevel,
    LearningPace,
} from "../schemas/learning-profile.schema.js";

/**
 * Dados validados que entram no prompt adaptativo.
 */
type BuildAdaptiveExplanationPromptInput = {
    areaName: string;
    question: string;
    pace: LearningPace;
    level: LearningLevel;
    difficulties: string[];
    preferredExplanationStyle?: string;
    sources: AiSource[];
};

/**
 * Constrói o prompt para uma explicação adaptada ao perfil do aluno.
 *
 * @param input Contexto validado pelo backend.
 * @returns Prompt com contrato JSON explícito para o provider.
 */
export function buildAdaptiveExplanationPrompt(
    input: BuildAdaptiveExplanationPromptInput,
): string {
    const sources = input.sources
        .map(
            (source, index) =>
                `Fonte ${index + 1} (${source.materialId}) - ${source.title}\n${source.contentText}`,
        )
        .join("\n\n");

    // O prompt recebe apenas fontes autorizadas; o provider não pode procurar dados fora deste contexto.
    return [
        "És um assistente pedagógico da StudyFlow em português de Portugal.",
        "Responde apenas com base nas fontes autorizadas abaixo.",
        "Adapta a explicação ao perfil do aluno, sem inventar factos fora das fontes.",
        `Área de estudo: ${input.areaName}`,
        `Ritmo: ${input.pace}`,
        `Nível: ${input.level}`,
        `Dificuldades declaradas: ${input.difficulties.length > 0 ? input.difficulties.join(", ") : "Não indicadas"}`,
        `Estilo preferido de explicação: ${input.preferredExplanationStyle?.trim() || "Não indicado"}`,
        `Pergunta do aluno: ${input.question}`,
        "Fontes autorizadas:",
        sources,
        "Devolve apenas JSON válido com esta forma:",
        `{"answer":"texto","suggestedNextSteps":["passo 1"],"sourceMaterialIds":["id"]}`,
    ].join("\n\n");
}
```

```ts
// apps/api/src/modules/ai/schemas/adaptive-explanation.schema.ts
/**
 * Define o modelo persistido das explicações adaptadas.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de uma explicação adaptada.
 */
export type AdaptiveExplanationDocument = HydratedDocument<AdaptiveExplanation>;

/**
 * Explicação gerada para uma área privada do aluno.
 */
@Schema({ timestamps: true, collection: "adaptive_explanations" })
export class AdaptiveExplanation {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: "StudyArea",
        required: true,
        index: true,
    })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    question!: string;

    @Prop({ required: true, trim: true, maxlength: 8000 })
    answer!: string;

    @Prop({ type: [String], default: [] })
    suggestedNextSteps!: string[];

    @Prop({ type: [{ type: Types.ObjectId, ref: "Material" }], default: [] })
    sourceMaterialIds!: Types.ObjectId[];
}

export const AdaptiveExplanationSchema =
    SchemaFactory.createForClass(AdaptiveExplanation);

// Este índice torna eficiente listar histórico por aluno e área sem misturar contextos.
AdaptiveExplanationSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });
```

5. Explicação do código.

O prompt recebe o perfil já validado pelo backend e as fontes já filtradas por ownership. O provider só vê o que pode usar: área, pergunta, ritmo, nível, dificuldades, estilo e fontes autorizadas.

O schema guarda a explicação com `userId` e `studyAreaId`, permitindo histórico privado por área. `sourceMaterialIds` regista as fontes usadas, mas não copia o conteúdo integral dos materiais para evidence.

6. Validação do passo.

Resultado esperado: uma área sem materiais processáveis devolve `422` com `NO_PROCESSABLE_SOURCES`; uma resposta do provider com fonte não autorizada devolve erro controlado e não persiste resposta.

7. Cenário negativo/erro esperado.

Força o provider a devolver `sourceMaterialIds` que não existem nas fontes autorizadas. O esperado é `ServiceUnavailableException` com `AI_PROVIDER_INVALID_ADAPTIVE_EXPLANATION`, sem `explanationModel.create(...)` e sem evento de histórico.


### Passo 5 - Ligar cliente React e painel da interface

1. Objetivo funcional do passo no contexto da app.

Permitir que o aluno peça uma explicação adaptada e veja estados claros sem o frontend decidir permissões.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/features/adaptive-explanations/ask-adaptive-explanation.ts`
    - EDITAR: `apps/web/src/features/adaptive-explanations/adaptive-explanation-panel.tsx`
    - REVER: `apps/web/src/features/mf3/request-mf3-json.ts`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Usa `requestMf3Json(...)`, porque esse helper já envia `credentials: "include"` e cabeçalho CSRF. O painel deve ter labels, loading, erro, vazio e sucesso. Não guardes sessão, token, prompt privado ou resposta completa fora do estado necessário ao ecrã.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/adaptive-explanations/ask-adaptive-explanation.ts
/**
 * Cliente frontend para pedir explicações adaptadas.
 */
import { AdaptiveExplanation } from "../../lib/apiClient.js";
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Payload permitido pelo endpoint público de explicações adaptadas.
 */
export type AskMf3AdaptiveExplanationInput = {
    studyAreaId: string;
    question: string;
};

/**
 * Pede uma explicação adaptada ao perfil pedagógico da área.
 *
 * @param input Área privada e pergunta do aluno.
 * @returns Explicação adaptada devolvida pelo backend.
 */
export function askMf3AdaptiveExplanation(
    input: AskMf3AdaptiveExplanationInput,
): Promise<AdaptiveExplanation> {
    return requestMf3Json<AdaptiveExplanation>("/api/ai/adaptive-explanations", {
        method: "POST",
        // O frontend envia apenas a área e a pergunta; o perfil vem do backend.
        body: JSON.stringify(input),
    });
}
```

```tsx
// apps/web/src/features/adaptive-explanations/adaptive-explanation-panel.tsx
/**
 * Painel React para explicações adaptadas ao perfil do aluno.
 */
import { FormEvent, useState } from "react";
import { AdaptiveExplanation } from "../../lib/apiClient.js";
import { askMf3AdaptiveExplanation } from "./ask-adaptive-explanation.js";

/**
 * Formulário simples para pedir e apresentar uma explicação adaptada.
 *
 * @returns Componente com estados de vazio, loading, erro e sucesso.
 */
export function AdaptiveExplanationPanel() {
    const [studyAreaId, setStudyAreaId] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<AdaptiveExplanation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit = studyAreaId.trim().length === 24 && question.trim().length >= 5;

    /**
     * Envia o pedido ao backend e atualiza apenas estado visual.
     *
     * @param event Evento de submissão do formulário.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (!canSubmit) {
            setError("Escolhe uma área válida e escreve uma pergunta com pelo menos 5 caracteres.");
            return;
        }

        setLoading(true);
        setError(null);
        setAnswer(null);

        try {
            // A autorização fica no backend; a UI só recolhe input e mostra o resultado.
            setAnswer(
                await askMf3AdaptiveExplanation({
                    studyAreaId: studyAreaId.trim(),
                    question: question.trim(),
                }),
            );
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível gerar a explicação adaptada.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4" aria-labelledby="adaptive-explanation-title">
            <header>
                <h2 id="adaptive-explanation-title" className="text-lg font-semibold">
                    Explicação adaptada
                </h2>
                <p className="text-sm text-slate-600">
                    A resposta usa o perfil pedagógico guardado para esta área.
                </p>
            </header>

            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block text-sm font-medium" htmlFor="adaptive-study-area-id">
                    Área de estudo
                </label>
                <input
                    id="adaptive-study-area-id"
                    className="sf-input"
                    value={studyAreaId}
                    onChange={(event) => setStudyAreaId(event.target.value)}
                    placeholder="ID da área de estudo"
                />

                <label className="block text-sm font-medium" htmlFor="adaptive-question">
                    Pergunta
                </label>
                <textarea
                    id="adaptive-question"
                    className="sf-input min-h-28"
                    rows={4}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Escreve a dúvida que queres esclarecer."
                />

                <button className="sf-button-primary" disabled={loading || !canSubmit}>
                    {loading ? "A adaptar explicação..." : "Gerar explicação"}
                </button>
            </form>

            {error ? <p className="sf-error" role="alert">{error}</p> : null}

            {!answer && !loading && !error ? (
                <p className="text-sm text-slate-600">
                    Ainda não existe uma explicação nesta sessão.
                </p>
            ) : null}

            {answer ? (
                <article className="space-y-3 rounded border border-slate-200 p-4">
                    <p className="whitespace-pre-line text-sm text-slate-800">{answer.answer}</p>
                    {answer.suggestedNextSteps.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                            {answer.suggestedNextSteps.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ul>
                    ) : null}
                </article>
            ) : null}
        </section>
    );
}
```

5. Explicação do código.

O cliente envia só `studyAreaId` e `question` para o endpoint público. `requestMf3Json(...)` mantém cookies HttpOnly no pedido sem expor a sessão no JavaScript. O painel gere estado local apenas para a interação atual.

O botão fica desativado quando a área não parece um ObjectId ou a pergunta é curta demais. Isto melhora a experiência, mas não substitui validação backend. O backend continua a validar DTO, sessão, role, ownership e fontes.

6. Validação do passo.

Resultado esperado: com área e pergunta válidas, o painel mostra loading e depois resposta. Sem sessão, sem área válida ou sem fontes, a UI mostra uma mensagem de erro compreensível.

7. Cenário negativo/erro esperado.

Simula sessão expirada. O esperado é o helper receber erro HTTP, o painel mostrar mensagem e não tentar decidir localmente se o aluno tem acesso.


### Passo 6 - Criar testes focados e negativos

1. Objetivo funcional do passo no contexto da app.

Provar que `RNF36` funciona no caminho feliz e falha de forma segura nos negativos relevantes.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/adaptive-explanations/adaptive-explanations.service.spec.ts`
    - EDITAR: `apps/api/src/modules/ai/adaptive-learning.service.spec.ts`
    - LOCALIZAÇÃO: ficheiros completos ou suites equivalentes.

3. Instruções do que fazer.

Mantém testes sem rede real. Usa mocks controlados para provider, models e services. Prova estes casos:

- aluno autenticado delega para `AdaptiveLearningService`;
- professor é bloqueado;
- área sem fontes não chama provider;
- perfil ausente usa defaults seguros;
- perfil existente entra no prompt;
- provider com fonte proibida não persiste resposta.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/adaptive-explanations/adaptive-explanations.service.spec.ts
/**
 * Testa a fachada de explicações adaptadas.
 */
import { ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AdaptiveLearningService } from "../ai/adaptive-learning.service.js";
import { AdaptiveExplanationsService } from "./adaptive-explanations.service.js";

describe("AdaptiveExplanationsService", () => {
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

    it("delegada no contrato de IA adaptativa com o aluno autenticado", async () => {
        const { adaptiveLearningService, service } = makeService();

        await expect(
            service.ask(student, {
                studyAreaId,
                question: "Explica derivadas devagar.",
            }),
        ).resolves.toMatchObject({ answer: "Explicação adaptada." });

        // Este assert prova que o userId usado vem da sessão autenticada.
        expect(adaptiveLearningService.askAdaptiveExplanation).toHaveBeenCalledWith(
            student.id,
            studyAreaId,
            { question: "Explica derivadas devagar." },
        );
    });

    it("bloqueia utilizadores que não sejam alunos", async () => {
        const { service } = makeService();

        await expect(
            service.ask(teacher, {
                studyAreaId,
                question: "Explica funções.",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });
});

/**
 * Cria uma fachada com o service de IA adaptativa isolado.
 *
 * @returns Service testado e mock injetado.
 */
function makeService() {
    const adaptiveLearningService = {
        askAdaptiveExplanation: jest.fn().mockResolvedValue({
            answer: "Explicação adaptada.",
            suggestedNextSteps: ["Resolver um exercício guiado."],
            sourceMaterialIds: ["507f1f77bcf86cd799439015"],
        }),
    };
    const service = new AdaptiveExplanationsService(
        adaptiveLearningService as unknown as AdaptiveLearningService,
    );
    return { adaptiveLearningService, service };
}
```

```ts
// apps/api/src/modules/ai/adaptive-learning.service.spec.ts
/**
 * Testa perfil, fontes e provider das explicações adaptativas.
 */
import { ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { AdaptiveLearningService } from "./adaptive-learning.service.js";

const studentId = "507f1f77bcf86cd799439012";
const studyAreaId = "507f1f77bcf86cd799439014";
const materialId = "507f1f77bcf86cd799439015";

describe("AdaptiveLearningService - RNF36", () => {
    it("não chama a IA quando a área não tem materiais processáveis", async () => {
        const { aiProvider, explanationModel, materialsService, service } = makeService();
        materialsService.listReadyTextSources.mockResolvedValue([]);

        await expect(
            service.askAdaptiveExplanation(studentId, studyAreaId, {
                question: "Explica funções.",
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);

        expect(aiProvider.generateAdaptiveExplanation).not.toHaveBeenCalled();
        expect(explanationModel.create).not.toHaveBeenCalled();
    });

    it("usa defaults seguros quando o perfil ainda não existe", async () => {
        const { aiProvider, explanationModel, profileModel, service } = makeService();
        profileModel.findOne.mockReturnValueOnce(leanResult(null));
        aiProvider.generateAdaptiveExplanation.mockResolvedValue(validProviderResult());
        explanationModel.create.mockResolvedValue(savedExplanation());

        await service.askAdaptiveExplanation(studentId, studyAreaId, {
            question: "Explica funções.",
        });

        // Sem perfil persistido, a explicação usa BALANCED/INTERMEDIATE em vez de inventar nível.
        expect(aiProvider.generateAdaptiveExplanation).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Ritmo: BALANCED"),
        });
        expect(aiProvider.generateAdaptiveExplanation).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Nível: INTERMEDIATE"),
        });
    });

    it("inclui dificuldades e estilo preferido no prompt adaptativo", async () => {
        const { aiProvider, explanationModel, historyService, profileModel, service } =
            makeService();
        profileModel.findOne.mockReturnValueOnce(
            leanResult({
                _id: "507f1f77bcf86cd799439016",
                studyAreaId,
                pace: "SLOW",
                level: "BEGINNER",
                difficulties: ["frações"],
                preferredExplanationStyle: "explicações com analogias",
            }),
        );
        aiProvider.generateAdaptiveExplanation.mockResolvedValue(validProviderResult());
        explanationModel.create.mockResolvedValue(savedExplanation());

        await service.askAdaptiveExplanation(studentId, studyAreaId, {
            question: "Explica funções.",
        });

        // O prompt mostra a adaptação pedagógica sem aceitar estes valores do frontend.
        expect(aiProvider.generateAdaptiveExplanation).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Nível: BEGINNER"),
        });
        expect(aiProvider.generateAdaptiveExplanation).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Dificuldades declaradas: frações"),
        });
        expect(aiProvider.generateAdaptiveExplanation).toHaveBeenCalledWith({
            prompt: expect.stringContaining(
                "Estilo preferido de explicação: explicações com analogias",
            ),
        });
        expect(historyService.recordEvent).toHaveBeenCalled();
    });

    it("não persiste resposta quando o provider devolve fontes não autorizadas", async () => {
        const { aiProvider, explanationModel, historyService, service } = makeService();
        aiProvider.generateAdaptiveExplanation.mockResolvedValue({
            answer: "Uma função relaciona valores.",
            suggestedNextSteps: ["Rever exemplos."],
            sourceMaterialIds: ["507f1f77bcf86cd799439099"],
        });

        await expect(
            service.askAdaptiveExplanation(studentId, studyAreaId, {
                question: "Explica funções.",
            }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);

        expect(explanationModel.create).not.toHaveBeenCalled();
        expect(historyService.recordEvent).not.toHaveBeenCalled();
    });
});

/**
 * Cria o service com dependências isoladas.
 *
 * @returns Service real e mocks controlados.
 */
function makeService() {
    const profileModel = {
        findOne: jest.fn().mockReturnValue(leanResult(null)),
        findOneAndUpdate: jest.fn(),
    };
    const explanationModel = {
        create: jest.fn(),
    };
    const aiProvider = {
        generateAdaptiveExplanation: jest.fn(),
    };
    const materialsService = {
        listReadyTextSources: jest.fn().mockResolvedValue([
            {
                _id: materialId,
                title: "Funções",
                contentText: "Uma função associa elementos de dois conjuntos.",
            },
        ]),
    };
    const areasService = {
        getMyStudyArea: jest.fn().mockResolvedValue({
            _id: studyAreaId,
            name: "Matemática",
        }),
    };
    const historyService = {
        recordEvent: jest.fn(),
    };
    const service = new AdaptiveLearningService(
        profileModel as never,
        explanationModel as never,
        aiProvider as never,
        materialsService as never,
        areasService as never,
        historyService as never,
    );
    return {
        aiProvider,
        areasService,
        explanationModel,
        historyService,
        materialsService,
        profileModel,
        service,
    };
}

/**
 * Simula o resultado de `.lean()` usado pelos models Mongoose.
 *
 * @param value Valor devolvido pela query.
 * @returns Objeto com função lean controlada.
 */
function leanResult(value: unknown) {
    return { lean: jest.fn().mockResolvedValue(value) };
}

/**
 * Devolve uma resposta válida do provider.
 *
 * @returns Resultado compatível com as fontes autorizadas.
 */
function validProviderResult() {
    return {
        answer: "Uma função relaciona valores.",
        suggestedNextSteps: ["Resolver um exercício guiado."],
        sourceMaterialIds: [materialId],
    };
}

/**
 * Devolve uma explicação persistida pelo model.
 *
 * @returns Documento mínimo usado pelo service depois de guardar.
 */
function savedExplanation() {
    return {
        _id: "507f1f77bcf86cd799439017",
        question: "Explica funções.",
        answer: "Uma função relaciona valores.",
        suggestedNextSteps: ["Resolver um exercício guiado."],
        toObject: () => ({ createdAt: new Date("2026-01-01T00:00:00.000Z") }),
    };
}
```

5. Explicação do código.

A primeira suite testa a fachada: aluno passa, professor bloqueia. A segunda suite testa a causa real de `RNF36`: sem fontes não há IA, sem perfil há defaults seguros, com perfil o prompt recebe ritmo/nível/dificuldades/estilo e com fonte proibida a resposta não é persistida.

Os mocks evitam rede real e base de dados real, mas ainda verificam chamadas, erros, persistência e histórico. Isto dá evidence objetiva sem expor dados privados.

6. Validação do passo.

Resultado esperado: `npm --prefix apps/api test -- adaptive-explanations` e `npm --prefix apps/api test -- adaptive-learning` passam.

7. Cenário negativo/erro esperado.

Remove a validação de fontes do service e repete a suite. O teste de provider com fonte proibida deve falhar, mostrando que a app passaria a guardar uma resposta insegura.


### Passo 7 - Recolher evidence e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF8-03` com provas objetivas e deixar `BK-MF8-04` pronto para usar o contrato adaptativo sem reescrever perfil, endpoint ou testes.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`
    - REVER: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
    - LOCALIZAÇÃO: secções de validação final, evidence e handoff.

3. Instruções do que fazer.

Regista na evidence:

- comandos executados;
- número de suites e testes que passaram;
- comportamento esperado e observado;
- negativo de role não aluno;
- negativo de área sem fontes;
- negativo de provider com fonte proibida;
- confirmação de ausência de dados sensíveis em logs/evidence;
- impacto para `BK-MF8-04`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é de validação e rastreabilidade, não de implementação.

5. Explicação do código.

Não há código porque a entrega é a prova. A evidence mostra que o guia não ficou apenas teoricamente correto: existe um caminho verificável para demonstrar a adaptação pedagógica e os negativos de segurança.

6. Validação do passo.

Resultado esperado: a evidence mostra comandos, outputs principais e riscos residuais sem copiar materiais, prompts completos, cookies ou dados pessoais.

7. Cenário negativo/erro esperado.

Se algum teste falhar, não marques o BK como concluído. Regista o erro observado e corrige primeiro o contrato que falhou.


#### Critérios de aceite

- Header e metadados iguais à matriz, backlog, contrato de campos, MF views e plano de sprints.
- `RNF36` fica ligado ao contrato real `LearningProfile`, sem enumeração nem ficheiro paralelo para nível pedagógico.
- `POST /api/ai/adaptive-explanations` usa sessão real, `SessionGuard`, role de aluno e delegação para `AdaptiveLearningService`.
- `POST /api/study-rooms/:roomId/ai/answers` usa `StudentProfile.year` resolvido no backend para adaptar a forma da resposta da sala.
- `userId` vem da sessão autenticada e nunca do body.
- `studyAreaId` é validado por ownership dentro do fluxo backend.
- O frontend da IA da sala não envia ano escolar, idade ou nível no body.
- A geração bloqueia quando não há fontes processáveis.
- O provider não consegue persistir resposta com fontes fora das autorizadas.
- O frontend usa cliente tipado, helper com `credentials: "include"`, loading, vazio, erro, sucesso e labels.
- Os testes cobrem caminho feliz e negativos críticos.
- A evidence não expõe prompts privados, respostas completas, materiais integrais, cookies ou dados pessoais.

#### Validação final

- Executar a pesquisa textual obrigatória da prompt nos guias MF8 e confirmar que não há linguagem interna, caminhos privados ou padrões inseguros.
- `npm --prefix apps/api test -- adaptive-explanations`
- `npm --prefix apps/api test -- adaptive-learning`
- `npm --prefix real_dev/api test -- room-ai.service.spec.ts --runInBand`
- `npm --prefix real_dev/api test -- room-ai-pedagogy.spec.ts --runInBand`
- `git diff --check`
- `bash scripts/validate-planificacao.sh`

#### Evidence para PR/defesa

- `pr`: `BK-MF8-03` corrige `RNF36` reutilizando perfil pedagógico real e fachada `POST /api/ai/adaptive-explanations`.
- `proof`: suites `adaptive-explanations` e `adaptive-learning` passam no backend previsto para os alunos.
- `proof_room_ai`: suites `room-ai.service` e `room-ai-pedagogy` provam 4.º ano, ensino superior, fallback sem perfil e fontes obrigatórias.
- `neg`: professor bloqueado, área sem fontes bloqueada e provider com fonte proibida rejeitado.
- `privacy`: evidence sem prompts completos, respostas completas, cookies, chaves ou materiais integrais.
- `handoff`: `BK-MF8-04` pode partir de perfil pedagógico, fontes autorizadas, provider validado e UI de explicação adaptada.

#### Handoff

O próximo BK é `BK-MF8-04`. Ele pode assumir que `BK-MF8-03` deixou duas superfícies coerentes para adaptar explicações ao nível do aluno: `LearningProfile` define ritmo e nível na explicação individual, e `StudentProfile.year` adapta a forma da resposta da IA da sala. Em ambos os casos, o backend resolve o perfil pela sessão e as fontes autorizadas continuam a limitar os factos.

#### Changelog

- `2026-07-01`: guia corrigido para remover contrato paralelo de nível pedagógico, alinhar `RNF36` com `LearningProfile`, acrescentar backend/frontend/testes completos e fechar handoff para `BK-MF8-04`.
- `2026-07-02`: documentada a adaptação da IA da sala ao ano escolar do aluno que pergunta, usando `StudentProfile.year` sem idade exata nem alteração de fontes.
