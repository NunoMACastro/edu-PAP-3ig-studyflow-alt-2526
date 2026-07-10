# BK-MF8-11 - Partilha read-only e fork privado de chat IA da sala.

## Header

- `doc_id`: `GUIA-BK-MF8-11`
- `bk_id`: `BK-MF8-11`
- `macro`: `MF8`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-10`
- `rf_rnf`: `RF16, RF42, RNF20`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-12`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais permitir que uma resposta da IA da sala seja partilhada em modo read-only e que qualquer membro da sala possa guardar uma cópia privada dessa resposta. A resposta original continua protegida, o aluno autenticado nunca escolhe outro `studentId`, e o fork fica ligado ao aluno que o criou.

O resultado final é um endpoint `POST /api/study-rooms/:roomId/ai/answers/:answerId/share`, uma listagem `GET /api/study-rooms/:roomId/ai/answers?scope=shared`, botões concretos na página da IA da sala e testes que provam membership, ownership e preservação da resposta original.

#### Importância

`RF16, RF42, RNF20` exige colaboração com IA sem misturar dados de alunos, salas ou turmas. A partilha read-only permite que a turma use uma boa resposta como referência comum, enquanto o fork privado permite que cada aluno continue a estudar com a sua própria cópia.

Este BK também protege a defesa PAP: consegues mostrar comportamento observável, explicar a diferença entre resposta própria e resposta partilhada, demonstrar que o backend valida acesso antes de ler dados, e provar que o fork não altera o original.

#### Scope-in

- Reutilizar `RoomAiInteraction` como entidade persistida para resposta privada, resposta partilhada e fork privado.
- Acrescentar `visibility`, `sharedAt` e `forkedFromInteractionId` ao schema da interação IA da sala.
- Criar `ShareRoomAiAnswerDto` com modo `READ_ONLY` ou `PRIVATE_FORK`.
- Criar `RoomAiSharingService` com validação de sessão, membership, ownership e sala.
- Expor `GET /api/study-rooms/:roomId/ai/answers?scope=shared`.
- Expor `POST /api/study-rooms/:roomId/ai/answers/:answerId/share`.
- Criar funções frontend tipadas para listar respostas partilhadas e executar partilha/fork.
- Atualizar `RoomAiPage` com estados de loading, erro, vazio, sucesso, partilha read-only e cópia privada.
- Criar testes para resposta própria, resposta de outro aluno, aluno fora da sala, fork privado e preservação do original.

#### Scope-out

- Alterar IDs, owner, apoio, prioridade, esforço, sprint, RF/RNF, dependência ou ordem dos BKs.
- Criar chat em tempo real, comentários, reações, ranking ou votação de respostas IA.
- Permitir edição da resposta original depois de partilhada.
- Permitir que o frontend envie `studentId`, role, membership ou ownership.
- Chamar o provider de IA para criar o fork privado.
- Expor prompts completos, dados privados de outro aluno, tokens, cookies, emails ou informação pessoal em logs ou evidence.
- Mover regras de autorização do backend para a UI.

#### Estado antes e depois

- Estado antes: o `BK-MF8-10` deixa o histórico privado da IA da sala disponível através de `GET /api/study-rooms/:roomId/ai/answers?scope=mine`; cada aluno vê apenas as suas próprias respostas.
- Estado depois: o `BK-MF8-11` acrescenta partilha read-only e fork privado sobre respostas já persistidas, mantendo o histórico privado protegido e deixando o `BK-MF8-12` livre para avançar para mini-testes oficiais.

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
- `docs/planificacao/backlogs/ANEXO-RF-PARA-BKS.md`
- `docs/planificacao/backlogs/ANEXO-RNF-PARA-BKS.md`
- `docs/planificacao/backlogs/ANEXO-CORE-DUAL-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`

#### Glossário

- **Resposta privada:** interação IA criada por um aluno e visível apenas no histórico desse aluno.
- **Resposta partilhada:** interação IA marcada como `SHARED`, visível aos membros da sala em modo read-only.
- **Read-only:** modo em que outros membros conseguem ler a resposta, mas não conseguem alterar o documento original.
- **Fork privado:** nova interação IA criada para o aluno autenticado, com o mesmo conteúdo da resposta partilhada e referência para a origem.
- **Membership:** regra backend que confirma que o aluno pertence à sala antes de ler respostas IA da sala.
- **Ownership:** regra backend que confirma que a resposta pertence ao aluno quando ele tenta partilhar a sua própria resposta.
- **Sessão segura:** origem do `actor.id`; o frontend nunca decide o dono de uma resposta.
- **Evidence:** prova objetiva de execução, com comandos, resultados e screenshots sem dados sensíveis.

#### Conceitos teóricos essenciais

- **Partilha controlada:** a app disponibiliza uma resposta a outros membros sem abrir permissão para editar o original.
- **Fork privado:** cópia persistida para outro aluno estudar de forma autónoma; a cópia pertence ao aluno autenticado.
- **Defesa em profundidade:** controller, service, schema, cliente API e UI colaboram, mas a autorização fica no backend.
- **Modelo acumulativo:** o schema existente `RoomAiInteraction` já guarda sala, aluno, pergunta e resposta; este BK acrescenta estado de visibilidade em vez de criar uma entidade paralela.
- **Provider externo:** não é chamado neste BK, porque partilhar e criar fork reutilizam respostas já persistidas.
- **Erro controlado:** o backend devolve exceções explícitas para IDs inválidos, resposta inexistente, falta de acesso ou modo inválido.
- **Contrato frontend:** a UI mostra ações disponíveis, mas não decide permissões; se o backend rejeitar, a UI mostra a mensagem de erro.

#### Arquitetura do BK

- Requisito canónico: `RF16, RF42, RNF20`.
- Endpoint de listagem partilhada: `GET /api/study-rooms/:roomId/ai/answers?scope=shared`.
- Endpoint de operação: `POST /api/study-rooms/:roomId/ai/answers/:answerId/share`.
- DTO: `ShareRoomAiAnswerDto` com `mode: "READ_ONLY" | "PRIVATE_FORK"`.
- Persistência: `RoomAiInteraction` recebe `visibility`, `sharedAt` e `forkedFromInteractionId`.
- Service: `RoomAiSharingService` valida ObjectIds, membership, ownership e visibilidade antes de escrever.
- Controller: `RoomAiController` continua a servir `GET` e `POST` no recurso de respostas IA da sala.
- Frontend: `apiClient.ts` expõe funções tipadas e `RoomAiPage` mostra resposta própria, respostas partilhadas e ações.
- Testes: suite dedicada ao service de partilha, sem provider de IA.
- Decisão CANONICO: manter metadados da matriz, backlog, sprint e contrato de campos.
- Decisões DERIVADO:
  - `READ_ONLY` altera a própria resposta do aluno para `visibility: "SHARED"`.
  - `PRIVATE_FORK` cria uma nova interação com `visibility: "PRIVATE"` e `studentId` do aluno autenticado.
  - `forkedFromInteractionId` liga a cópia à resposta partilhada original.
  - `GET ?scope=shared` lista apenas respostas marcadas como `SHARED` da sala.
- Handoff: `BK-MF8-12`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts`
- EDITAR: `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
- CRIAR: `apps/api/src/modules/study-rooms/room-ai-sharing.service.ts`
- EDITAR: `apps/api/src/modules/study-rooms/room-ai.controller.ts`
- EDITAR: `apps/api/src/modules/study-rooms/study-rooms.module.ts`
- CRIAR: `apps/api/src/modules/study-rooms/room-ai-sharing.service.spec.ts`
- EDITAR: `apps/web/src/lib/apiClient.ts`
- EDITAR: `apps/web/src/pages/student/RoomAiPage.tsx`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF8-11` entrega `RF16, RF42, RNF20` sem alterar campos canónicos e sem antecipar os mini-testes oficiais do `BK-MF8-12`.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/ANEXO-CORE-DUAL-BK.md`

3. Instruções do que fazer.

Confirma e regista no PR:

- `BK-MF8-11` pertence à `MF8`;
- owner `Natalia` e apoio `Guilherme`;
- prioridade `P1`, esforço `M`, sprint `S12`;
- dependência `BK-MF8-10` e próximo BK `BK-MF8-12`;
- requisitos `RF16, RF42, RNF20`;
- classificação `CORE-HIBRIDO`, porque a partilha controlada aumenta colaboração sem misturar contexto pessoal.

Não edites os documentos canónicos neste BK. Se houver divergência, pára e regista bloqueio.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não existe código neste passo. A validação documental impede drift: a implementação só deve começar depois de confirmar que o BK continua alinhado com matriz, backlog, contrato de campos e requisitos.

6. Validação do passo.

Resultado esperado: os documentos canónicos apontam todos para `BK-MF8-11`, `RF16, RF42, RNF20`, `S12`, `BK-MF8-10` e `BK-MF8-12`.

7. Cenário negativo/erro esperado.

Se matriz, backlog ou contrato tiverem valores incompatíveis, não escolhas um valor por intuição. Regista `BLOQUEADO_POR_CONTRATO` na evidence do BK.

### Passo 2 - Preparar DTO e persistência da partilha

1. Objetivo funcional do passo no contexto da app.

Criar o contrato de entrada da operação e preparar o schema para representar resposta privada, resposta partilhada e fork privado.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts`
    - EDITAR: `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`

3. Instruções do que fazer.

Cria o DTO com dois modos permitidos. Depois edita o schema existente, acrescentando campos de visibilidade e referência de fork. Mantém os campos atuais porque `BK-MF8-10` e `askRoomAi(...)` já dependem deles.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts
/**
 * Define contratos de dados usados nas entradas e saídas de salas de estudo.
 */
import { IsIn } from "class-validator";

export const roomAiShareModes = ["READ_ONLY", "PRIVATE_FORK"] as const;

export type RoomAiShareMode = (typeof roomAiShareModes)[number];

/**
 * Pedido para partilhar uma resposta IA da sala ou criar um fork privado.
 */
export class ShareRoomAiAnswerDto {
    @IsIn(roomAiShareModes)
    mode!: RoomAiShareMode;
}

/**
 * Normaliza o modo recebido antes de o service tocar na persistência.
 *
 * @param mode Valor recebido no body HTTP.
 * @returns Modo validado e seguro para a operação.
 */
export function parseRoomAiShareMode(mode: string): RoomAiShareMode {
    if (mode === "READ_ONLY" || mode === "PRIVATE_FORK") {
        return mode;
    }

    throw new Error("INVALID_ROOM_AI_SHARE_MODE");
}
```

```ts
// apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts
/**
 * Define o modelo persistido de salas de estudo usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type RoomAiVisibility = "PRIVATE" | "SHARED";

/**
 * Documento Mongoose de salas de estudo, usado apenas dentro da camada de persistência.
 */
export type RoomAiInteractionDocument = HydratedDocument<RoomAiInteraction>;

/**
 * Interação IA da sala, guardada com as fontes usadas.
 */
@Schema({ timestamps: true, collection: "room_ai_interactions" })
export class RoomAiInteraction {
    @Prop({ type: Types.ObjectId, ref: "StudyRoom", required: true, index: true })
    roomId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    question!: string;

    @Prop({ required: true, trim: true, maxlength: 8000 })
    answer!: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "RoomShare" }], default: [] })
    sourceShareIds!: Types.ObjectId[];

    @Prop({
        required: true,
        enum: ["PRIVATE", "SHARED"],
        default: "PRIVATE",
        index: true,
    })
    visibility!: RoomAiVisibility;

    @Prop({ type: Date })
    sharedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: "RoomAiInteraction" })
    forkedFromInteractionId?: Types.ObjectId;
}

export const RoomAiInteractionSchema =
    SchemaFactory.createForClass(RoomAiInteraction);

RoomAiInteractionSchema.index({ roomId: 1, createdAt: -1 });
RoomAiInteractionSchema.index({ roomId: 1, studentId: 1, createdAt: -1 });
RoomAiInteractionSchema.index({ roomId: 1, visibility: 1, createdAt: -1 });
```

5. Explicação do código.

`ShareRoomAiAnswerDto` limita o body a dois modos. O decorator `@IsIn(...)` funciona com o `ValidationPipe` global da API e o `parseRoomAiShareMode(...)` dá ao service uma segunda barreira explícita.

No schema, `visibility` separa respostas privadas de respostas partilhadas. `sharedAt` permite mostrar quando uma resposta ficou visível na sala. `forkedFromInteractionId` preserva rastreabilidade entre a cópia privada e a resposta partilhada original.

6. Validação do passo.

Resultado esperado: o DTO compila, o schema mantém os campos antigos e as novas interações criadas por `askRoomAi(...)` ficam privadas por defeito.

7. Cenário negativo/erro esperado.

Se o body trouxer outro modo, o DTO falha na validação HTTP e o service também rejeita o valor antes de escrever na base de dados.

### Passo 3 - Criar RoomAiSharingService

1. Objetivo funcional do passo no contexto da app.

Concentrar no backend as regras de listar respostas partilhadas, partilhar resposta própria e criar fork privado.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/study-rooms/room-ai-sharing.service.ts`

3. Instruções do que fazer.

Cria o service abaixo. A ordem das validações é importante: valida IDs, confirma membership da sala e só depois lê a resposta IA. O frontend nunca envia o dono da operação.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-rooms/room-ai-sharing.service.ts
/**
 * Implementa partilha read-only e fork privado de respostas IA da sala.
 */
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    parseRoomAiShareMode,
    RoomAiShareMode,
    ShareRoomAiAnswerDto,
} from "./dto/share-room-ai-answer.dto.js";
import {
    RoomAiInteraction,
    RoomAiInteractionDocument,
    RoomAiVisibility,
} from "./schemas/room-ai-interaction.schema.js";
import { StudyRoomsService } from "./study-rooms.service.js";

type RoomAiPersisted = {
    _id: Types.ObjectId;
    roomId: Types.ObjectId;
    studentId: Types.ObjectId;
    question: string;
    answer: string;
    sourceShareIds: Types.ObjectId[];
    visibility: RoomAiVisibility;
    sharedAt?: Date;
    forkedFromInteractionId?: Types.ObjectId;
    createdAt?: Date;
};

export type RoomAiAnswerReuseView = {
    _id: string;
    roomId: string;
    studentId: string;
    question: string;
    answer: string;
    sourceShareIds: string[];
    visibility: RoomAiVisibility;
    sharedAt?: Date;
    forkedFromInteractionId?: string;
    createdAt?: Date;
};

export type RoomAiShareResult = {
    mode: RoomAiShareMode;
    answer: RoomAiAnswerReuseView;
    createdPrivateCopy: boolean;
};

/**
 * Serviço dedicado às operações de reutilização segura de respostas IA da sala.
 */
@Injectable()
export class RoomAiSharingService {
    /**
     * Recebe dependências por injeção para manter a classe testável.
     *
     * @param interactionModel Modelo Mongoose das interações IA da sala.
     * @param studyRoomsService Service que valida membership da sala.
     */
    constructor(
        @InjectModel(RoomAiInteraction.name)
        private readonly interactionModel: Model<RoomAiInteractionDocument>,
        private readonly studyRoomsService: StudyRoomsService,
    ) {}

    /**
     * Lista respostas marcadas como partilhadas na sala.
     *
     * @param actor Aluno autenticado vindo da sessão segura.
     * @param roomId Identificador da sala.
     * @returns Respostas partilhadas em modo read-only.
     */
    async listSharedAnswers(
        actor: AuthenticatedUser,
        roomId: string,
    ): Promise<RoomAiAnswerReuseView[]> {
        const roomObjectId = this.toObjectId(
            roomId,
            "INVALID_ROOM_ID",
            "A sala indicada não é válida.",
        );

        await this.studyRoomsService.ensureMember(actor.id, roomId);

        const rows = await this.interactionModel
            .find({ roomId: roomObjectId, visibility: "SHARED" })
            .sort({ createdAt: -1 })
            .limit(30)
            .lean<RoomAiPersisted[]>()
            .exec();

        return rows.map((row) => this.toAnswerView(row));
    }

    /**
     * Executa partilha read-only ou fork privado para uma resposta IA da sala.
     *
     * @param actor Aluno autenticado vindo da sessão segura.
     * @param roomId Identificador da sala.
     * @param answerId Identificador da resposta IA.
     * @param input Modo da operação.
     * @returns Resultado público da operação, sem campos internos de Mongoose.
     */
    async shareOrForkAnswer(
        actor: AuthenticatedUser,
        roomId: string,
        answerId: string,
        input: ShareRoomAiAnswerDto,
    ): Promise<RoomAiShareResult> {
        const mode = this.parseMode(input.mode);
        const roomObjectId = this.toObjectId(
            roomId,
            "INVALID_ROOM_ID",
            "A sala indicada não é válida.",
        );
        const answerObjectId = this.toObjectId(
            answerId,
            "INVALID_ROOM_AI_ANSWER_ID",
            "A resposta IA indicada não é válida.",
        );
        const actorObjectId = this.toObjectId(
            actor.id,
            "INVALID_ACTOR_ID",
            "A sessão atual não é válida.",
        );

        await this.studyRoomsService.ensureMember(actor.id, roomId);

        if (mode === "READ_ONLY") {
            return this.shareOwnAnswer(roomObjectId, answerObjectId, actorObjectId);
        }

        return this.createPrivateFork(roomObjectId, answerObjectId, actorObjectId);
    }

    /**
     * Marca uma resposta própria como partilhada em read-only.
     *
     * @param roomObjectId Sala já validada.
     * @param answerObjectId Resposta já validada.
     * @param actorObjectId Aluno autenticado já validado.
     * @returns Resultado público da partilha.
     */
    private async shareOwnAnswer(
        roomObjectId: Types.ObjectId,
        answerObjectId: Types.ObjectId,
        actorObjectId: Types.ObjectId,
    ): Promise<RoomAiShareResult> {
        const answer = await this.interactionModel
            .findOne({
                _id: answerObjectId,
                roomId: roomObjectId,
                studentId: actorObjectId,
            })
            .exec();

        if (!answer) {
            throw this.answerNotFound();
        }

        answer.visibility = "SHARED";
        answer.sharedAt = answer.sharedAt ?? new Date();
        await answer.save();

        return {
            mode: "READ_ONLY",
            answer: this.toAnswerView(answer.toObject() as RoomAiPersisted),
            createdPrivateCopy: false,
        };
    }

    /**
     * Cria uma cópia privada a partir de uma resposta já partilhada.
     *
     * @param roomObjectId Sala já validada.
     * @param answerObjectId Resposta já validada.
     * @param actorObjectId Aluno autenticado já validado.
     * @returns Resultado público do fork privado.
     */
    private async createPrivateFork(
        roomObjectId: Types.ObjectId,
        answerObjectId: Types.ObjectId,
        actorObjectId: Types.ObjectId,
    ): Promise<RoomAiShareResult> {
        const original = await this.interactionModel
            .findOne({
                _id: answerObjectId,
                roomId: roomObjectId,
                visibility: "SHARED",
            })
            .lean<RoomAiPersisted>()
            .exec();

        if (!original) {
            throw this.answerNotFound();
        }

        const fork = await this.interactionModel.create({
            roomId: roomObjectId,
            studentId: actorObjectId,
            question: original.question,
            answer: original.answer,
            sourceShareIds: original.sourceShareIds,
            visibility: "PRIVATE",
            forkedFromInteractionId: original._id,
        });

        return {
            mode: "PRIVATE_FORK",
            answer: this.toAnswerView(fork.toObject() as RoomAiPersisted),
            createdPrivateCopy: true,
        };
    }

    /**
     * Converte string para ObjectId com erro HTTP explícito.
     *
     * @param value Valor recebido do pedido ou da sessão.
     * @param code Código estável para a UI e testes.
     * @param message Mensagem pública em PT-PT.
     * @returns ObjectId validado.
     */
    private toObjectId(value: string, code: string, message: string): Types.ObjectId {
        if (!Types.ObjectId.isValid(value)) {
            throw new BadRequestException({ code, message });
        }

        return new Types.ObjectId(value);
    }

    /**
     * Converte o modo textual para o union type usado no domínio.
     *
     * @param mode Modo recebido no body.
     * @returns Modo seguro para a operação.
     */
    private parseMode(mode: string): RoomAiShareMode {
        try {
            return parseRoomAiShareMode(mode);
        } catch {
            throw new BadRequestException({
                code: "INVALID_ROOM_AI_SHARE_MODE",
                message: "Escolhe READ_ONLY ou PRIVATE_FORK.",
            });
        }
    }

    /**
     * Mapeia o documento persistido para resposta pública.
     *
     * @param answer Interação persistida já autorizada pelo service.
     * @returns Vista pública da resposta IA.
     */
    private toAnswerView(answer: RoomAiPersisted): RoomAiAnswerReuseView {
        return {
            _id: String(answer._id),
            roomId: String(answer.roomId),
            studentId: String(answer.studentId),
            question: answer.question,
            answer: answer.answer,
            sourceShareIds: answer.sourceShareIds.map((sourceId) => String(sourceId)),
            visibility: answer.visibility,
            sharedAt: answer.sharedAt,
            forkedFromInteractionId: answer.forkedFromInteractionId
                ? String(answer.forkedFromInteractionId)
                : undefined,
            createdAt: answer.createdAt,
        };
    }

    /**
     * Evita revelar se a resposta existe fora da sala ou pertence a outro aluno.
     *
     * @returns Exceção pública e estável.
     */
    private answerNotFound(): NotFoundException {
        return new NotFoundException({
            code: "ROOM_AI_ANSWER_NOT_FOUND",
            message: "Resposta IA não encontrada nesta sala.",
        });
    }
}
```

5. Explicação do código.

`listSharedAnswers(...)` valida a sala e chama `ensureMember(...)` antes de listar respostas partilhadas. Assim, um aluno fora da sala não descobre respostas nem confirma a existência da sala por leitura direta.

`shareOwnAnswer(...)` exige `studentId` igual ao aluno autenticado. Isto impede que um aluno partilhe a resposta privada de outro aluno. `createPrivateFork(...)` só aceita respostas já marcadas como `SHARED` e cria uma nova interação com `studentId` do aluno autenticado.

O service não chama `aiProvider`. A operação reutiliza resposta persistida, por isso o custo externo e o risco de resposta diferente são evitados.

6. Validação do passo.

Resultado esperado: `RoomAiSharingService` compila, injeta `RoomAiInteraction`, valida membership e devolve objetos públicos sem depender da UI para regras de acesso.

7. Cenário negativo/erro esperado.

Se um aluno tentar partilhar uma resposta que não é sua, a query de ownership não encontra documento e devolve `ROOM_AI_ANSWER_NOT_FOUND`. A mensagem não confirma que a resposta existe para outro aluno.

### Passo 4 - Ligar controller e módulo

1. Objetivo funcional do passo no contexto da app.

Expor as rotas HTTP autenticadas e registar o novo service no módulo de salas de estudo.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/study-rooms/room-ai.controller.ts`
    - EDITAR: `apps/api/src/modules/study-rooms/study-rooms.module.ts`

3. Instruções do que fazer.

Atualiza o controller mantendo o `POST` de perguntas à IA. O `GET` passa a suportar `scope=mine` vindo do `BK-MF8-10` e `scope=shared` deste BK. Depois regista `RoomAiSharingService` nos providers do módulo.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-rooms/room-ai.controller.ts
/**
 * Expõe os endpoints HTTP de salas de estudo e delega regras de negócio para o service.
 */
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskRoomAiDto } from "./dto/ask-room-ai.dto.js";
import { ShareRoomAiAnswerDto } from "./dto/share-room-ai-answer.dto.js";
import { RoomAiService } from "./room-ai.service.js";
import { RoomAiSharingService } from "./room-ai-sharing.service.js";

/**
 * Controller da IA partilhada da sala.
 */
@Controller("api/study-rooms/:roomId/ai/answers")
@UseGuards(SessionGuard)
export class RoomAiController {
    /**
     * Recebe dependências por injeção para manter a classe testável.
     *
     * @param roomAiService Service da geração e histórico privado da IA da sala.
     * @param roomAiSharingService Service da partilha e fork privado.
     */
    constructor(
        private readonly roomAiService: RoomAiService,
        private readonly roomAiSharingService: RoomAiSharingService,
    ) {}

    /**
     * Lista respostas IA da sala dentro do scope pedido.
     *
     * @param request Pedido autenticado com o utilizador da sessão.
     * @param roomId Identificador da sala.
     * @param scope Scope público: `mine` para histórico privado ou `shared` para partilha.
     * @returns Lista autorizada de respostas IA.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Query("scope") scope = "mine",
    ) {
        if (scope === "shared") {
            return this.roomAiSharingService.listSharedAnswers(request.user!, roomId);
        }

        if (scope !== "mine") {
            throw new BadRequestException({
                code: "INVALID_ROOM_AI_SCOPE",
                message: "Escolhe mine ou shared.",
            });
        }

        return this.roomAiService.listMyRoomAiHistory(request.user!, roomId);
    }

    /**
     * Orquestra uma pergunta de IA em salas de estudo.
     *
     * @param request Pedido autenticado com o utilizador da sessão.
     * @param roomId Identificador da sala.
     * @param body Dados da pergunta.
     * @returns Resposta IA validada.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() body: AskRoomAiDto,
    ) {
        return this.roomAiService.askRoomAi(request.user!, roomId, body);
    }

    /**
     * Partilha uma resposta própria ou cria uma cópia privada de resposta partilhada.
     *
     * @param request Pedido autenticado com o utilizador da sessão.
     * @param roomId Identificador da sala.
     * @param answerId Identificador da resposta IA.
     * @param body Modo de reutilização da resposta.
     * @returns Resultado público da operação.
     */
    @Post(":answerId/share")
    share(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Param("answerId") answerId: string,
        @Body() body: ShareRoomAiAnswerDto,
    ) {
        return this.roomAiSharingService.shareOrForkAnswer(
            request.user!,
            roomId,
            answerId,
            body,
        );
    }
}
```

```ts
// apps/api/src/modules/study-rooms/study-rooms.module.ts
/**
 * Regista providers, controllers e schemas necessários ao módulo de salas de estudo.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { User, UserSchema } from "../auth/schemas/user.schema.js";
import { Material, MaterialSchema } from "../materials/schemas/material.schema.js";
import { RoomAiController } from "./room-ai.controller.js";
import { RoomAiService } from "./room-ai.service.js";
import { RoomAiSharingService } from "./room-ai-sharing.service.js";
import { RoomSharesController } from "./room-shares.controller.js";
import { RoomSharesService } from "./room-shares.service.js";
import {
    RoomAiInteraction,
    RoomAiInteractionSchema,
} from "./schemas/room-ai-interaction.schema.js";
import { RoomShare, RoomShareSchema } from "./schemas/room-share.schema.js";
import { StudyRoom, StudyRoomSchema } from "./schemas/study-room.schema.js";
import { StudyRoomsController } from "./study-rooms.controller.js";
import { StudyRoomsService } from "./study-rooms.service.js";

/**
 * Módulo acumulativo de salas de estudo.
 */
@Module({
    imports: [
        AuthModule,
        AiModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Material.name, schema: MaterialSchema },
            { name: StudyRoom.name, schema: StudyRoomSchema },
            { name: RoomShare.name, schema: RoomShareSchema },
            { name: RoomAiInteraction.name, schema: RoomAiInteractionSchema },
        ]),
    ],
    controllers: [StudyRoomsController, RoomSharesController, RoomAiController],
    providers: [
        StudyRoomsService,
        RoomSharesService,
        RoomAiService,
        RoomAiSharingService,
    ],
    exports: [StudyRoomsService, RoomSharesService],
})
export class StudyRoomsModule {}
```

5. Explicação do código.

O controller mantém uma única família de rotas para respostas IA da sala. `GET ?scope=mine` continua a usar o histórico privado do BK anterior. `GET ?scope=shared` usa o novo service deste BK. `POST :answerId/share` recebe o modo e delega toda a autorização para o backend.

O módulo precisa de registar `RoomAiSharingService`, porque o controller não deve criar services manualmente. A injeção mantém o padrão NestJS usado no resto da app.

6. Validação do passo.

Resultado esperado: o controller compila, `scope=mine` continua funcional, `scope=shared` lista respostas partilhadas e a rota `POST :answerId/share` chega ao service novo.

7. Cenário negativo/erro esperado.

Se a query vier com `scope=all`, o controller devolve `INVALID_ROOM_AI_SCOPE`. A app não deve criar uma listagem global de respostas IA da sala.

### Passo 5 - Ligar cliente API e RoomAiPage

1. Objetivo funcional do passo no contexto da app.

Permitir que o aluno partilhe a sua última resposta e guarde cópia privada de respostas partilhadas diretamente na página da IA da sala.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/lib/apiClient.ts`
    - EDITAR: `apps/web/src/pages/student/RoomAiPage.tsx`

3. Instruções do que fazer.

No cliente API, acrescenta os tipos e funções perto de `RoomAiAnswer` e `askRoomAi(...)`. Depois substitui a página `RoomAiPage` pelo ficheiro completo abaixo. Mantém o helper `requestJson(...)`; ele já centraliza cookies HttpOnly e cabeçalho CSRF.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/apiClient.ts
/**
 * Modos permitidos para reutilizar uma resposta IA da sala.
 */
export type RoomAiShareMode = "READ_ONLY" | "PRIVATE_FORK";

/**
 * Resposta IA partilhada ou cópia privada criada a partir de uma resposta partilhada.
 */
export type RoomAiSharedAnswer = {
    _id: string;
    roomId: string;
    studentId: string;
    question: string;
    answer: string;
    sourceShareIds: string[];
    visibility: "PRIVATE" | "SHARED";
    sharedAt?: string;
    forkedFromInteractionId?: string;
    createdAt?: string;
};

/**
 * Resultado da operação de partilha ou fork privado.
 */
export type RoomAiShareResult = {
    mode: RoomAiShareMode;
    answer: RoomAiSharedAnswer;
    createdPrivateCopy: boolean;
};

/**
 * Lista respostas IA partilhadas em read-only na sala.
 *
 * @param roomId Identificador da sala.
 * @returns Respostas partilhadas visíveis para membros da sala.
 */
export function listSharedRoomAiAnswers(roomId: string): Promise<RoomAiSharedAnswer[]> {
    return requestJson<RoomAiSharedAnswer[]>(
        `/api/study-rooms/${roomId}/ai/answers?scope=shared`,
    );
}

/**
 * Partilha uma resposta própria ou cria uma cópia privada de uma resposta partilhada.
 *
 * @param roomId Identificador da sala.
 * @param answerId Identificador da resposta IA.
 * @param input Modo da operação.
 * @returns Resultado público devolvido pela API.
 */
export function shareRoomAiAnswer(
    roomId: string,
    answerId: string,
    input: { mode: RoomAiShareMode },
): Promise<RoomAiShareResult> {
    return requestJson<RoomAiShareResult>(
        `/api/study-rooms/${roomId}/ai/answers/${answerId}/share`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}
```

```tsx
// apps/web/src/pages/student/RoomAiPage.tsx
/**
 * Implementa uma página React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
    askRoomAi,
    listSharedRoomAiAnswers,
    RoomAiAnswer,
    RoomAiSharedAnswer,
    shareRoomAiAnswer,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type RoomAiPageProps = {
    roomId: string;
};

/**
 * Página da IA partilhada da sala.
 */
export function RoomAiPage({ roomId }: RoomAiPageProps) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<RoomAiAnswer | null>(null);
    const [sharedAnswers, setSharedAnswers] = useState<RoomAiSharedAnswer[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [sharedError, setSharedError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sharedLoading, setSharedLoading] = useState(false);
    const [sharingAnswerId, setSharingAnswerId] = useState<string | null>(null);

    /**
     * Carrega respostas partilhadas da sala depois de a API validar membership.
     */
    const loadSharedAnswers = useCallback(async (): Promise<void> => {
        setSharedLoading(true);
        setSharedError(null);
        try {
            setSharedAnswers(await listSharedRoomAiAnswers(roomId));
        } catch (caught) {
            setSharedError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível carregar respostas partilhadas.",
            );
        } finally {
            setSharedLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        void loadSharedAnswers();
    }, [loadSharedAnswers]);

    /**
     * Trata a pergunta do aluno à IA da sala.
     *
     * @param event Evento do formulário.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setNotice(null);
        try {
            setAnswer(await askRoomAi(roomId, { question }));
            setQuestion("");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao perguntar.");
        } finally {
            setLoading(false);
        }
    }

    /**
     * Partilha a última resposta própria em modo read-only.
     */
    async function handleShareCurrentAnswer(): Promise<void> {
        if (!answer) return;

        setSharingAnswerId(answer._id);
        setError(null);
        setNotice(null);
        try {
            await shareRoomAiAnswer(roomId, answer._id, { mode: "READ_ONLY" });
            setNotice("Resposta partilhada em modo read-only.");
            await loadSharedAnswers();
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível partilhar a resposta.",
            );
        } finally {
            setSharingAnswerId(null);
        }
    }

    /**
     * Guarda uma cópia privada de uma resposta partilhada.
     *
     * @param sharedAnswer Resposta partilhada escolhida pelo aluno.
     */
    async function handleCreatePrivateFork(
        sharedAnswer: RoomAiSharedAnswer,
    ): Promise<void> {
        setSharingAnswerId(sharedAnswer._id);
        setSharedError(null);
        setNotice(null);
        try {
            await shareRoomAiAnswer(roomId, sharedAnswer._id, {
                mode: "PRIVATE_FORK",
            });
            setNotice("Cópia privada guardada no teu histórico.");
        } catch (caught) {
            setSharedError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível guardar a cópia privada.",
            );
        } finally {
            setSharingAnswerId(null);
        }
    }

    return (
        <section className="space-y-4">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">IA da sala</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}
                <label className="text-sm font-medium text-slate-700" htmlFor="room-ai-question">
                    Pergunta para a IA da sala
                </label>
                <textarea
                    id="room-ai-question"
                    rows={4}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                />
                <button className="sf-button-primary" disabled={loading || question.trim().length < 4}>
                    {loading ? "A perguntar..." : "Perguntar"}
                </button>
            </form>

            {answer ? (
                <article className="sf-panel space-y-3">
                    <h2 className="font-semibold">Resposta</h2>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {answer.answer}
                    </p>
                    <p className="text-sm text-slate-600">
                        Fontes usadas: {answer.sources.map((source) => source.title).join(", ")}
                    </p>
                    <button
                        className="sf-button-secondary"
                        disabled={sharingAnswerId === answer._id}
                        onClick={() => void handleShareCurrentAnswer()}
                        type="button"
                    >
                        {sharingAnswerId === answer._id
                            ? "A partilhar..."
                            : "Partilhar read-only"}
                    </button>
                </article>
            ) : null}

            <section className="sf-panel space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="font-semibold">Respostas partilhadas</h2>
                    <button
                        className="sf-button-secondary"
                        disabled={sharedLoading}
                        onClick={() => void loadSharedAnswers()}
                        type="button"
                    >
                        Atualizar
                    </button>
                </div>
                {sharedError ? <p className="sf-error">{sharedError}</p> : null}
                {sharedLoading ? <p className="text-sm text-slate-600">A carregar...</p> : null}
                {!sharedLoading && sharedAnswers.length === 0 ? (
                    <p className="text-sm text-slate-600">
                        Ainda não há respostas partilhadas nesta sala.
                    </p>
                ) : null}
                <div className="space-y-3">
                    {sharedAnswers.map((sharedAnswer) => (
                        <article className="rounded border border-slate-200 p-3" key={sharedAnswer._id}>
                            <p className="text-sm font-medium text-slate-800">
                                {sharedAnswer.question}
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                                {sharedAnswer.answer}
                            </p>
                            <button
                                className="sf-button-secondary mt-3"
                                disabled={sharingAnswerId === sharedAnswer._id}
                                onClick={() => void handleCreatePrivateFork(sharedAnswer)}
                                type="button"
                            >
                                {sharingAnswerId === sharedAnswer._id
                                    ? "A guardar..."
                                    : "Guardar cópia privada"}
                            </button>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
}
```

5. Explicação do código.

O cliente API cria contratos explícitos para listagem partilhada e operação de partilha/fork. A UI apenas chama funções tipadas e mostra estados; não envia `studentId` nem decide se o aluno pode partilhar uma resposta.

`RoomAiPage` carrega respostas partilhadas ao abrir, permite partilhar a última resposta criada pelo aluno e permite guardar cópia privada de respostas partilhadas. Depois de partilhar, a página recarrega a listagem a partir do backend.

O `label` ligado ao `textarea` dá nome acessível ao campo de pergunta. Isto permite que leitores de ecrã identifiquem o objetivo do campo e evita uma UI funcional mas difícil de usar por alunos com tecnologias de apoio.

6. Validação do passo.

Resultado esperado: a página continua a permitir perguntas à IA, o campo de pergunta tem label acessível, mostra botão `Partilhar read-only` na resposta própria e mostra botão `Guardar cópia privada` em cada resposta partilhada.

7. Cenário negativo/erro esperado.

Se o backend devolver erro por falta de membership, ownership ou modo inválido, a página mostra a mensagem devolvida e não altera permissões localmente.

### Passo 6 - Criar testes do service de partilha

1. Objetivo funcional do passo no contexto da app.

Provar que a partilha e o fork respeitam membership, ownership, visibilidade e preservação do original.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/study-rooms/room-ai-sharing.service.spec.ts`

3. Instruções do que fazer.

Cria a suite abaixo. Ela testa o service diretamente porque as regras sensíveis estão no backend, antes da UI e antes de qualquer chamada externa.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/study-rooms/room-ai-sharing.service.spec.ts
/**
 * Testa partilha read-only e fork privado de respostas IA da sala.
 */
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { RoomAiSharingService } from "./room-ai-sharing.service.js";
import { RoomAiVisibility } from "./schemas/room-ai-interaction.schema.js";

const roomId = "507f1f77bcf86cd799439014";
const answerId = "507f1f77bcf86cd799439015";
const studentId = "507f1f77bcf86cd799439012";
const otherStudentId = "507f1f77bcf86cd799439013";

describe("RoomAiSharingService", () => {
    const student: AuthenticatedUser = {
        id: studentId,
        email: "aluno@example.test",
        role: "STUDENT",
    };

    it("partilha resposta própria em read-only e preserva o conteúdo", async () => {
        const { interactionModel, service } = makeService();
        const ownAnswer = makeInteractionDocument({
            _id: answerId,
            roomId,
            studentId,
            visibility: "PRIVATE",
        });
        interactionModel.findOne.mockReturnValueOnce(makeQuery(ownAnswer));

        const result = await service.shareOrForkAnswer(student, roomId, answerId, {
            mode: "READ_ONLY",
        });

        expect(result.mode).toBe("READ_ONLY");
        expect(result.createdPrivateCopy).toBe(false);
        expect(result.answer.answer).toBe("Resposta validada da sala.");
        expect(ownAnswer.visibility).toBe("SHARED");
        expect(ownAnswer.sharedAt).toBeInstanceOf(Date);
        expect(ownAnswer.save).toHaveBeenCalledTimes(1);
    });

    it("bloqueia partilha de resposta que não pertence ao aluno autenticado", async () => {
        const { interactionModel, service } = makeService();
        interactionModel.findOne.mockReturnValueOnce(makeQuery(null));

        await expect(
            service.shareOrForkAnswer(student, roomId, answerId, {
                mode: "READ_ONLY",
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("bloqueia aluno fora da sala antes de ler a resposta", async () => {
        const { interactionModel, service, studyRoomsService } = makeService();
        studyRoomsService.ensureMember.mockRejectedValueOnce(
            new ForbiddenException({
                code: "ROOM_ACCESS_DENIED",
                message: "Não tens acesso a esta sala.",
            }),
        );

        await expect(
            service.shareOrForkAnswer(student, roomId, answerId, {
                mode: "READ_ONLY",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(interactionModel.findOne).not.toHaveBeenCalled();
    });

    it("cria fork privado de resposta partilhada sem alterar o original", async () => {
        const { interactionModel, service } = makeService();
        const original = makeInteractionPlain({
            _id: answerId,
            roomId,
            studentId: otherStudentId,
            visibility: "SHARED",
        });
        const fork = makeInteractionDocument({
            _id: "507f1f77bcf86cd799439099",
            roomId,
            studentId,
            visibility: "PRIVATE",
            forkedFromInteractionId: answerId,
        });

        interactionModel.findOne.mockReturnValueOnce(makeLeanQuery(original));
        interactionModel.create.mockResolvedValueOnce(fork);

        const result = await service.shareOrForkAnswer(student, roomId, answerId, {
            mode: "PRIVATE_FORK",
        });

        expect(result.mode).toBe("PRIVATE_FORK");
        expect(result.createdPrivateCopy).toBe(true);
        expect(result.answer.studentId).toBe(studentId);
        expect(result.answer.visibility).toBe("PRIVATE");
        expect(result.answer.forkedFromInteractionId).toBe(answerId);
        expect(interactionModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                studentId: new Types.ObjectId(studentId),
                visibility: "PRIVATE",
                forkedFromInteractionId: new Types.ObjectId(answerId),
            }),
        );
        expect(fork.save).not.toHaveBeenCalled();
    });

    it("rejeita fork de resposta que não está partilhada na sala", async () => {
        const { interactionModel, service } = makeService();
        interactionModel.findOne.mockReturnValueOnce(makeLeanQuery(null));

        await expect(
            service.shareOrForkAnswer(student, roomId, answerId, {
                mode: "PRIVATE_FORK",
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(interactionModel.create).not.toHaveBeenCalled();
    });
});

/**
 * Cria service e dependências falsas para testar regras de domínio.
 *
 * @returns Service e dependências observáveis.
 */
function makeService() {
    const interactionModel = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
    };
    const studyRoomsService = {
        ensureMember: jest.fn().mockResolvedValue(undefined),
    };
    const service = new RoomAiSharingService(
        interactionModel as never,
        studyRoomsService as never,
    );

    return { interactionModel, service, studyRoomsService };
}

/**
 * Cria uma query com `exec`, igual ao padrão usado no service.
 *
 * @param value Valor resolvido pela query.
 * @returns Query mínima para testes unitários.
 */
function makeQuery<T>(value: T) {
    return {
        exec: jest.fn().mockResolvedValue(value),
    };
}

/**
 * Cria uma query com `lean().exec()`.
 *
 * @param value Valor resolvido pela query.
 * @returns Query mínima para testes unitários.
 */
function makeLeanQuery<T>(value: T) {
    return {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(value),
    };
}

/**
 * Cria documento Mongoose mínimo para testes.
 *
 * @param input Campos variáveis do documento.
 * @returns Documento com save e toObject observáveis.
 */
function makeInteractionDocument(input: {
    _id: string;
    roomId: string;
    studentId: string;
    visibility: RoomAiVisibility;
    forkedFromInteractionId?: string;
}) {
    const plain = makeInteractionPlain(input);
    const document = {
        ...plain,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn(() => plain),
    };

    return document;
}

/**
 * Cria objeto persistido mínimo para simular resposta IA autorizada.
 *
 * @param input Campos variáveis do objeto.
 * @returns Objeto persistido usado por service e testes.
 */
function makeInteractionPlain(input: {
    _id: string;
    roomId: string;
    studentId: string;
    visibility: RoomAiVisibility;
    forkedFromInteractionId?: string;
}) {
    return {
        _id: new Types.ObjectId(input._id),
        roomId: new Types.ObjectId(input.roomId),
        studentId: new Types.ObjectId(input.studentId),
        question: "Como resumir a matéria?",
        answer: "Resposta validada da sala.",
        sourceShareIds: [new Types.ObjectId("507f1f77bcf86cd799439016")],
        visibility: input.visibility,
        sharedAt: input.visibility === "SHARED" ? new Date("2026-07-02T10:00:00Z") : undefined,
        forkedFromInteractionId: input.forkedFromInteractionId
            ? new Types.ObjectId(input.forkedFromInteractionId)
            : undefined,
        createdAt: new Date("2026-07-02T09:00:00Z"),
    };
}
```

5. Explicação do código.

A suite prova as regras principais do BK. A primeira verificação confirma que o aluno só partilha a própria resposta e que o conteúdo se mantém. A segunda confirma que resposta de outro aluno não é exposta. A terceira confirma que membership é verificada antes da leitura. A quarta confirma que o fork cria uma nova interação privada e não altera o original. A quinta impede criar fork de uma resposta que ainda não foi partilhada.

Os testes usam `jest.fn()` para isolar persistência e membership. Isto é aceitável porque o objetivo aqui é testar o service, não abrir ligação a MongoDB.

6. Validação do passo.

Resultado esperado: a suite passa e documenta os negativos de segurança do BK.

7. Cenário negativo/erro esperado.

Se `ensureMember(...)` falhar, `findOne(...)` não deve ser chamado. Esta prova garante que o service não lê resposta IA antes de validar acesso à sala.

### Passo 7 - Validar fluxo, evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Validar o contrato completo e preparar evidence segura para PR e defesa.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts`
    - REVER: `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
    - REVER: `apps/api/src/modules/study-rooms/room-ai-sharing.service.ts`
    - REVER: `apps/api/src/modules/study-rooms/room-ai.controller.ts`
    - REVER: `apps/api/src/modules/study-rooms/study-rooms.module.ts`
    - REVER: `apps/api/src/modules/study-rooms/room-ai-sharing.service.spec.ts`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - REVER: `apps/web/src/pages/student/RoomAiPage.tsx`

3. Instruções do que fazer.

Executa a validação local depois de aplicar os ficheiros. Guarda no PR apenas evidence sem dados pessoais: comandos, resultado dos testes, screenshot da UI com dados fictícios e uma nota sobre a diferença entre resposta partilhada e fork privado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não existe código neste passo. A validação final confirma que as peças criadas nos passos anteriores funcionam em conjunto e que o handoff para o próximo BK não depende de comportamento não provado.

6. Validação do passo.

Resultado esperado:

- `POST /api/study-rooms/:roomId/ai/answers/:answerId/share` com `READ_ONLY` marca resposta própria como `SHARED`;
- `GET /api/study-rooms/:roomId/ai/answers?scope=shared` lista a resposta partilhada para membros da sala;
- `POST /api/study-rooms/:roomId/ai/answers/:answerId/share` com `PRIVATE_FORK` cria cópia privada;
- aluno fora da sala recebe erro controlado;
- aluno não consegue partilhar resposta privada de outro aluno;
- o provider de IA não é chamado por partilha nem por fork.

7. Cenário negativo/erro esperado.

Se algum teste falhar por acesso cruzado entre alunos, reverte apenas a alteração relacionada com autorização e corrige o service antes de continuar. Não resolvas esse tipo de falha na UI.

#### Critérios de aceite

- O header mantém `BK-MF8-11`, `MF8`, `Natalia`, `Guilherme`, `P1`, `M`, `BK-MF8-10`, `RF16, RF42, RNF20`, `S12`, `Core` e `BK-MF8-12`.
- `RoomAiInteraction` tem `visibility`, `sharedAt` e `forkedFromInteractionId`.
- Respostas novas continuam privadas por defeito.
- `READ_ONLY` só partilha resposta do aluno autenticado.
- `PRIVATE_FORK` só parte de resposta `SHARED` da mesma sala.
- Fork privado cria nova interação com `studentId` vindo da sessão.
- O original não é alterado durante o fork privado.
- Aluno fora da sala não consegue listar, partilhar nem criar fork.
- O frontend não envia `studentId`, role, membership ou ownership.
- A UI mostra loading, vazio, erro e sucesso para respostas partilhadas.
- O campo de pergunta da IA da sala tem label acessível ligado ao `textarea`.
- A suite `room-ai-sharing.service.spec.ts` cobre caminho feliz e negativos de segurança.

#### Validação final

Executa os comandos a partir da raiz do projeto:

```bash
npm --prefix apps/api test -- room-ai-sharing.service.spec.ts
npm --prefix apps/api test -- room-ai.service.spec.ts
npm --prefix apps/web run build
```

Depois confirma manualmente:

- criar uma resposta IA da sala;
- clicar em `Partilhar read-only`;
- abrir a sala com outro membro;
- ver a resposta na lista partilhada;
- clicar em `Guardar cópia privada`;
- confirmar que a cópia aparece no histórico privado do aluno que executou a ação;
- tentar a mesma rota com aluno fora da sala e confirmar erro controlado.

#### Evidence para PR/defesa

- Comandos de teste executados e resultado.
- Screenshot da resposta própria com botão `Partilhar read-only`.
- Screenshot da lista `Respostas partilhadas`.
- Screenshot ou registo controlado do fork privado criado.
- Exemplo de pedido `POST /api/study-rooms/:roomId/ai/answers/:answerId/share` com `mode: "READ_ONLY"`, usando IDs fictícios.
- Exemplo de pedido com `mode: "PRIVATE_FORK"`, usando IDs fictícios.
- Nota curta: "A partilha torna a resposta visível em read-only; o fork cria uma nova interação privada e não altera o original."
- Nota curta: "O provider de IA não é chamado por partilha nem por fork."

#### Handoff

O `BK-MF8-12` pode assumir que a IA da sala já tem:

- histórico privado por aluno;
- respostas partilhadas em modo read-only;
- fork privado de respostas partilhadas;
- validação backend de membership e ownership;
- UI com ações concretas e mensagens de erro controladas.

O próximo BK deve avançar para mini-testes oficiais por aluno sem reutilizar a partilha de respostas IA como fonte de permissões. A fronteira de privacidade da sala continua a pertencer ao backend.

#### Changelog

- 2026-07-02: Guia corrigido para incluir persistência, DTO, service, controller, módulo, cliente API, UI, testes reais e validação final da partilha read-only e do fork privado.
