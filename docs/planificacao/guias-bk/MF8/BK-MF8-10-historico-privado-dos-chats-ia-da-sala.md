# BK-MF8-10 - Histórico privado dos chats IA da sala.

## Header

- `doc_id`: `GUIA-BK-MF8-10`
- `bk_id`: `BK-MF8-10`
- `macro`: `MF8`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-04`
- `rf_rnf`: `RF16, RF42, RNF20, RNF23`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-11`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar a leitura privada das respostas da IA da sala. O aluno autenticado deve conseguir ver apenas as interações que ele próprio criou numa sala onde é membro, sem receber mensagens de outros alunos nem de outras salas.

O resultado final é um endpoint `GET /api/study-rooms/:roomId/ai/answers?scope=mine`, uma função cliente tipada, uma área de interface com vazio, loading, erro e sucesso, e testes que provam a fronteira de privacidade.

Qualquer nova resposta usa a finalidade `ROOM_AI` através de `GovernedAiExecutionService`. Esta finalidade começa desativada, não cria consentimentos automáticos e só a fachada pode executar a integração externa.

#### Importância

`RF16` e `RF42` pedem IA partilhada, chat, partilha e notas coletivas. `RNF20` obriga a que a IA não aceda a dados de outras turmas ou alunos. `RNF23` pede rastreabilidade por logs estruturados sem expor dados sensíveis.

Este BK é importante porque cria a ponte entre perguntar à IA da sala e reutilizar respostas privadas no BK seguinte. Sem este contrato, a partilha read-only e o fork privado de `BK-MF8-11` ficariam apoiados numa base incompleta.

#### Scope-in

- Confirmar metadados canónicos de `BK-MF8-10` em matriz, backlog e contrato de campos.
- Reutilizar `RoomAiInteraction` como fonte do histórico privado da IA da sala.
- Implementar leitura por `roomId` e `studentId` depois de `ensureMember(...)`.
- Expor `GET /api/study-rooms/:roomId/ai/answers?scope=mine` protegido por sessão.
- Criar cliente frontend tipado para listar o histórico privado.
- Atualizar `RoomAiPage` com estados de loading, vazio, erro e sucesso.
- Criar testes para não membro, sala diferente, aluno diferente e ausência de chamada ao provider de IA.

#### Scope-out

- Alterar IDs, owners, prioridades, esforço, sprint, RF/RNF, dependências ou ordem dos BKs.
- Criar requisitos novos fora de `RF16, RF42, RNF20, RNF23`.
- Criar um novo model para histórico quando `RoomAiInteraction` já guarda pergunta, resposta, sala e aluno.
- Permitir que o frontend envie `studentId` para decidir que histórico pode ler.
- Guardar cookies, prompts privados, respostas completas ou dados pessoais em evidence pública.
- Mover validações de membership, ownership ou autorização para a UI.
- Implementar partilha read-only ou fork privado; isso pertence ao `BK-MF8-11`.

#### Estado antes e depois

- Estado antes: a app já tem `POST /api/study-rooms/:roomId/ai/answers`, `RoomAiService.askRoomAi(...)`, `RoomAiInteraction` e uma página que mostra a resposta acabada de gerar.
- Estado depois: a app passa a ter leitura privada das interações já guardadas, com filtro backend por sessão e sala, endpoint autenticado, cliente tipado, UI com estados completos e testes de privacidade.

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
- `docs/planificacao/guias-bk/MF1/BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`

#### Glossário

- **StudyFlow:** plataforma de estudo com áreas privadas, salas, turmas, professores, materiais e IA pedagógica.
- **Aluno autenticado:** utilizador identificado no backend por sessão segura; o seu `userId` nunca vem do body nem da query string.
- **IA da sala:** fluxo que responde a perguntas usando apenas fontes autorizadas e partilhadas no contexto de uma sala.
- **Interação IA:** documento `RoomAiInteraction` com sala, aluno, pergunta, resposta, fontes usadas e datas de criação.
- **Histórico privado:** lista de interações da IA visível apenas ao aluno que as criou.
- **Membership:** regra backend que confirma que o utilizador pertence à sala antes de ler dados dessa sala.
- **Provider de IA:** integração externa chamada para gerar respostas; este BK lê persistência e não deve chamar esse provider.
- **Evidence:** prova objetiva de execução, com comandos, outputs ou capturas sem dados sensíveis.

#### Conceitos teóricos essenciais

- **Privacidade por origem da sessão:** o backend usa `request.user.id` para decidir o dono do histórico. O frontend nunca escolhe outro aluno.
- **Autorização antes da leitura:** `ensureMember(actor.id, roomId)` corre antes da query Mongoose para impedir leituras de salas onde o aluno não pertence.
- **Query mínima:** o filtro usa `roomId` e `studentId`, ordena por data descendente e limita o número de resultados para manter a resposta previsível.
- **DTO vs query simples:** este endpoint não precisa de body; o único parâmetro opcional é `scope=mine`, usado para tornar o contrato público claro.
- **Separação de responsabilidades:** controller recebe HTTP, service valida e lê dados, função de mapeamento escolhe o shape público, UI apresenta estados.
- **Não chamar IA para ler histórico:** listar respostas já guardadas não deve gastar provider externo nem produzir uma nova resposta.
- **Teste negativo:** deve provar que falhas de membership, sala diferente e aluno diferente não devolvem dados indevidos.

#### Arquitetura do BK

- Requisito canónico: `RF16, RF42, RNF20, RNF23`.
- Endpoint principal: `GET /api/study-rooms/:roomId/ai/answers?scope=mine`.
- Backend: `RoomAiController` delega para `RoomAiService.listMyRoomAiHistory(...)`.
- Persistência: `RoomAiInteraction` guarda as interações já criadas pelo `POST` da IA da sala.
- Filtro obrigatório: `{ roomId: new Types.ObjectId(roomId), studentId: new Types.ObjectId(actor.id) }`.
- Frontend: `listMyRoomAiHistory(...)` em `apiClient.ts` e painel de histórico em `RoomAiPage.tsx`.
- Testes: suite focada no service para provar membership, filtro privado e ausência de provider.
- Handoff: `BK-MF8-11` pode reutilizar os IDs privados devolvidos por este endpoint para iniciar partilha controlada.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/study-rooms/room-ai-history.ts`
- EDITAR: `apps/api/src/modules/study-rooms/room-ai.service.ts`
- EDITAR: `apps/api/src/modules/study-rooms/room-ai.controller.ts`
- CRIAR: `apps/api/src/modules/study-rooms/room-ai-history.spec.ts`
- EDITAR: `apps/web/src/lib/apiClient.ts`
- EDITAR: `apps/web/src/pages/student/RoomAiPage.tsx`
- REVER: `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF8-10` entrega o histórico privado dos chats IA da sala sem alterar os metadados canónicos nem antecipar o trabalho de `BK-MF8-11`.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - LOCALIZAÇÃO: linhas de `BK-MF8-10` e requisitos `RF16, RF42, RNF20, RNF23`.

3. Instruções do que fazer.

Confirma que os documentos canónicos mantêm estes valores: owner `Guilherme`, apoio `Natalia`, prioridade `P1`, esforço `M`, sprint `S12`, dependência `BK-MF1-04` e próximo BK `BK-MF8-11`.

Depois confirma que a app já tem o fluxo anterior de pergunta à IA da sala: `RoomAiInteraction`, `RoomAiService.askRoomAi(...)`, `RoomAiController.@Post()` e `RoomAiPage`.

4. Código completo, correto e integrado com a app final.

Não há código para escrever neste passo. A validação é documental e serve para impedir alterações fora do contrato do BK.

5. Explicação do código.

Como este passo não altera ficheiros de produto, não existe código para explicar. O ponto técnico é confirmar fronteiras: este BK lê interações privadas existentes; não cria partilha, fork, novo provider nem novo model.

6. Validação do passo.

Resultado esperado: os documentos canónicos continuam alinhados com `BK-MF8-10`, `RF16, RF42, RNF20, RNF23`, `S12`, `BK-MF1-04` e `BK-MF8-11`.

7. Cenário negativo/erro esperado.

Se matriz, backlog e contrato tiverem valores incompatíveis, para a implementação e regista o bloqueio no evidence da tarefa. Não escolhas novos metadados por tentativa.

### Passo 2 - Criar mapeamento público do histórico privado

1. Objetivo funcional do passo no contexto da app.

Criar uma função pequena que transforma documentos `RoomAiInteraction` na resposta pública do histórico privado, removendo qualquer campo que a UI não precisa de receber.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/study-rooms/room-ai-history.ts`
    - REVER: `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
    - LOCALIZAÇÃO: ficheiro completo novo.

3. Instruções do que fazer.

Cria `room-ai-history.ts` ao lado do service da IA da sala. Este ficheiro não consulta a base de dados; apenas recebe documentos já filtrados pelo service e devolve um shape seguro para a API.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * Define o contrato público do histórico privado da IA da sala.
 */
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { RoomAiInteractionDocument } from "./schemas/room-ai-interaction.schema.js";

type RoomAiInteractionWithTimestamps = RoomAiInteractionDocument & {
    createdAt?: Date;
};

export type RoomAiHistoryItem = {
    _id: string;
    roomId: string;
    question: string;
    answer: string;
    createdAt?: Date;
};

/**
 * Converte interações persistidas numa resposta privada para o aluno autenticado.
 *
 * @param actor Aluno autenticado vindo da sessão segura.
 * @param roomId Identificador da sala validada pelo service.
 * @param rows Documentos devolvidos pela query privada do histórico.
 * @returns Lista pronta para expor no endpoint público.
 */
export function toPrivateRoomAiHistory(
    actor: AuthenticatedUser,
    roomId: string,
    rows: RoomAiInteractionDocument[],
): RoomAiHistoryItem[] {
    if (!Types.ObjectId.isValid(roomId) || !Types.ObjectId.isValid(actor.id)) {
        return [];
    }

    return rows
        .filter((row) => {
            // A função mantém uma defesa adicional para não expor dados se a query mudar no futuro.
            const sameRoom = String(row.roomId) === roomId;
            const sameStudent = String(row.studentId) === actor.id;
            return sameRoom && sameStudent;
        })
        .map((row) => {
            const timedRow = row as RoomAiInteractionWithTimestamps;
            return {
                // A resposta pública evita sourceShareIds para não revelar mais contexto do que a lista precisa.
                _id: String(row._id),
                roomId,
                question: row.question,
                answer: row.answer,
                createdAt: timedRow.createdAt,
            };
        });
}
```

5. Explicação do código.

`RoomAiHistoryItem` é o contrato que o frontend vai receber. Ele inclui apenas identificador, sala, pergunta, resposta e data de criação.

A função `toPrivateRoomAiHistory(...)` recebe o aluno autenticado, a sala e os documentos vindos do service. Mesmo que a query já filtre por aluno e sala, a função volta a confirmar `roomId` e `studentId`. Esta dupla verificação é útil porque a regra protege dados privados e custa pouco manter.

6. Validação do passo.

Resultado esperado: o ficheiro compila, exporta `RoomAiHistoryItem` e `toPrivateRoomAiHistory(...)`, e não cria dependência circular com `RoomAiService`.

7. Cenário negativo/erro esperado.

Se `roomId` ou `actor.id` não forem ObjectIds válidos, a função devolve lista vazia. O erro HTTP fica no service, porque é o service que conhece o contexto da operação.

### Passo 3 - Adicionar leitura privada ao RoomAiService

1. Objetivo funcional do passo no contexto da app.

Adicionar a operação de service que valida membership, lê apenas as interações do aluno autenticado e devolve o histórico privado.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/study-rooms/room-ai.service.ts`
    - LOCALIZAÇÃO: ficheiro completo, mantendo `askRoomAi(...)` e acrescentando `listMyRoomAiHistory(...)`.

3. Instruções do que fazer.

Atualiza os imports do service para incluir `BadRequestException` e a função criada no passo anterior. Depois acrescenta `listMyRoomAiHistory(...)` antes de `askRoomAi(...)`.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * Implementa as regras de negócio de salas de estudo e concentra validações do domínio.
 */
import {
    BadRequestException,
    GatewayTimeoutException,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
import { AskRoomAiDto } from "./dto/ask-room-ai.dto.js";
import { buildRoomAiPrompt } from "./prompts/room-ai.prompt.js";
import { RoomAiHistoryItem, toPrivateRoomAiHistory } from "./room-ai-history.js";
import { RoomSharesService, RoomShareSource } from "./room-shares.service.js";
import { RoomAiInteraction, RoomAiInteractionDocument } from "./schemas/room-ai-interaction.schema.js";
import { StudyRoomsService } from "./study-rooms.service.js";

type RoomAiResult = { answer: string; sourceShareIds: string[] };

/**
 * Serviço da IA partilhada da sala.
 */
@Injectable()
export class RoomAiService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param interactionModel Modelo Mongoose injetado para ler e persistir interações IA da sala.
     * @param governedAiExecutionService Fachada única de execução IA.
     * @param studyRoomsService Service injetado para reutilizar regras de membership da sala.
     * @param roomSharesService Service injetado para reutilizar regras de partilhas da sala.
     */
    constructor(
        @InjectModel(RoomAiInteraction.name)
        private readonly interactionModel: Model<RoomAiInteractionDocument>,
        private readonly governedAiExecutionService: GovernedAiExecutionService,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly roomSharesService: RoomSharesService,
    ) {}

    /**
     * Lista apenas as interações IA da sala criadas pelo aluno autenticado.
     *
     * @param actor Utilizador autenticado vindo da sessão; define o dono do histórico.
     * @param roomId Identificador da sala; exige membership antes de qualquer leitura.
     * @returns Histórico privado ordenado da interação mais recente para a mais antiga.
     */
    async listMyRoomAiHistory(
        actor: AuthenticatedUser,
        roomId: string,
    ): Promise<RoomAiHistoryItem[]> {
        if (!Types.ObjectId.isValid(roomId)) {
            throw new BadRequestException({
                code: "INVALID_ROOM_ID",
                message: "A sala indicada não é válida.",
            });
        }

        await this.studyRoomsService.ensureMember(actor.id, roomId);

        const rows = await this.interactionModel
            .find({
                // O filtro usa o aluno da sessão e impede que a UI escolha outro histórico.
                roomId: new Types.ObjectId(roomId),
                studentId: new Types.ObjectId(actor.id),
            })
            .sort({ createdAt: -1 })
            // O limite protege a API contra respostas demasiado grandes numa página de sala.
            .limit(30)
            .exec();

        return toPrivateRoomAiHistory(actor, roomId, rows);
    }

    /**
     * Orquestra uma pergunta de IA em salas de estudo, limitando contexto e validando a resposta antes de a devolver.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param roomId Identificador da sala; exige membership antes de expor partilhas, mensagens ou respostas IA.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Resposta validada, limitada às fontes e pronta para persistência ou apresentação.
     */
    async askRoomAi(actor: AuthenticatedUser, roomId: string, input: AskRoomAiDto) {
        await this.studyRoomsService.ensureMember(actor.id, roomId);
        const sources = await this.roomSharesService.findUsableSharesForRoom(
            actor.id,
            roomId,
            input.sourceIds,
        );

        if (sources.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_ROOM_AI_SOURCES",
                message: "Esta sala ainda não tem fontes processáveis para IA.",
            });
        }

        try {
            const result = await this.governedAiExecutionService.execute({
                actor,
                purpose: "ROOM_AI",
                context: { roomId },
                prompt: buildRoomAiPrompt({
                    question: input.question.trim(),
                    sources,
                }),
            });
            this.validateResult(result, sources);

            const interaction = await this.interactionModel.create({
                roomId: new Types.ObjectId(roomId),
                studentId: new Types.ObjectId(actor.id),
                question: input.question.trim(),
                answer: result.answer.trim(),
                sourceShareIds: result.sourceShareIds.map(
                    (sourceId) => new Types.ObjectId(sourceId),
                ),
            });

            const created = interaction.toObject() as { createdAt?: Date };
            return {
                _id: String(interaction._id),
                roomId,
                question: interaction.question,
                answer: interaction.answer,
                sources: sources.filter((source) =>
                    result.sourceShareIds.includes(source.shareId),
                ),
                createdAt: created.createdAt,
            };
        } catch (error) {
            if (
                error instanceof GatewayTimeoutException ||
                error instanceof ServiceUnavailableException ||
                error instanceof UnprocessableEntityException
            ) {
                throw error;
            }
            throw new ServiceUnavailableException({
                code: "AI_EXECUTION_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
    }

    /**
     * Confirma que os dados de salas de estudo cumprem o contrato antes de serem persistidos ou apresentados.
     *
     * @param result Resultado devolvido pelo provider de IA.
     * @param sources Fontes já autorizadas que limitam a resposta e evitam acesso a dados fora do contexto.
     */
    private validateResult(result: RoomAiResult, sources: RoomShareSource[]): void {
        const allowedIds = new Set(sources.map((source) => source.shareId));
        if (
            typeof result.answer !== "string" ||
            result.answer.trim().length === 0 ||
            !Array.isArray(result.sourceShareIds) ||
            result.sourceShareIds.length === 0 ||
            result.sourceShareIds.some((sourceId) => !allowedIds.has(sourceId))
        ) {
            throw new ServiceUnavailableException({
                code: "AI_INVALID_ROOM_ANSWER",
                message: "A IA devolveu uma resposta inválida para a sala.",
            });
        }
    }
}
```

5. Explicação do código.

`listMyRoomAiHistory(...)` começa por validar `roomId`. Depois chama `ensureMember(...)`, porque pertencer à sala é condição obrigatória antes de ler qualquer interação.

A query usa `roomId` e `studentId` da sessão. A leitura de histórico não invoca a fachada porque usa dados já persistidos.

6. Validação do passo.

Resultado esperado: `RoomAiService` continua a suportar o `POST` existente e passa a expor `listMyRoomAiHistory(...)`. Uma chamada válida devolve no máximo 30 itens do aluno autenticado, ordenados por `createdAt` descendente.

7. Cenário negativo/erro esperado.

Se `roomId` for inválido, a API deve devolver `400`. Se o aluno não pertencer à sala, `ensureMember(...)` deve interromper a leitura antes da query.

### Passo 4 - Expor o endpoint GET no controller

1. Objetivo funcional do passo no contexto da app.

Expor a rota autenticada que permite à UI pedir o histórico privado da IA da sala.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/study-rooms/room-ai.controller.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Acrescenta `Get` aos imports de `@nestjs/common` e cria o método `listMine(...)` no mesmo controller que já recebe o `POST` da IA da sala.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * Expõe os endpoints HTTP de salas de estudo e delega regras de negócio para o service.
 */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskRoomAiDto } from "./dto/ask-room-ai.dto.js";
import { RoomAiService } from "./room-ai.service.js";

/**
 * Controller da IA partilhada da sala.
 */
@Controller("api/study-rooms/:roomId/ai/answers")
@UseGuards(SessionGuard)
export class RoomAiController {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param roomAiService Service injetado para reutilizar regras de sala ai sem duplicar validações.
     */
    constructor(private readonly roomAiService: RoomAiService) {}

    /**
     * Lista as respostas privadas da IA da sala criadas pelo aluno autenticado.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user`.
     * @param roomId Identificador da sala; exige membership no service antes da leitura.
     * @returns Histórico privado da IA da sala.
     */
    @Get()
    listMine(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
    ) {
        return this.roomAiService.listMyRoomAiHistory(request.user!, roomId);
    }

    /**
     * Orquestra uma pergunta de IA em salas de estudo, limitando contexto e validando a resposta antes de a devolver.
     *
     * @param request Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.
     * @param roomId Identificador da sala; exige membership antes de expor partilhas, mensagens ou respostas IA.
     * @param body Payload validado pelo DTO do endpoint antes de chegar ao service.
     * @returns Resposta validada, limitada às fontes e pronta para persistência ou apresentação.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() body: AskRoomAiDto,
    ) {
        return this.roomAiService.askRoomAi(request.user!, roomId, body);
    }
}
```

5. Explicação do código.

O controller continua fino: recebe o pedido, recolhe `roomId` da rota e usa `request.user` definido pelo `SessionGuard`. Toda a regra de privacidade permanece no service.

O endpoint é o mesmo recurso do `POST`, mas com método `GET`. A query `scope=mine` pode ser enviada pelo cliente para tornar a intenção explícita; o backend mantém a regra principal no `actor.id`.

6. Validação do passo.

Resultado esperado: `GET /api/study-rooms/:roomId/ai/answers?scope=mine` chama `RoomAiService.listMyRoomAiHistory(...)` e exige sessão, tal como o `POST`.

7. Cenário negativo/erro esperado.

Sem sessão válida, `SessionGuard` deve bloquear o pedido. Com sessão válida mas sem membership na sala, o service deve devolver erro de autorização antes de qualquer leitura.

### Passo 5 - Ligar cliente API e RoomAiPage

1. Objetivo funcional do passo no contexto da app.

Permitir que a UI carregue o histórico privado, mostre estados completos e atualize a lista depois de uma nova pergunta à IA da sala.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/lib/apiClient.ts`
    - EDITAR: `apps/web/src/pages/student/RoomAiPage.tsx`
    - LOCALIZAÇÃO: zona dos tipos `RoomAiAnswer` e função `askRoomAi(...)`; componente `RoomAiPage`.

3. Instruções do que fazer.

No cliente API, adiciona o tipo `RoomAiHistoryItem` e a função `listMyRoomAiHistory(...)` perto de `RoomAiAnswer` e `askRoomAi(...)`.

Na página, carrega o histórico ao montar o componente, mostra erro próprio para histórico e volta a carregar a lista depois de `askRoomAi(...)` criar uma nova interação.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * Resposta da IA da sala baseada nas partilhas autorizadas.
 */
export type RoomAiAnswer = {
    _id: string;
    roomId: string;
    question: string;
    answer: string;
    sources: { shareId: string; title: string; contentText: string }[];
    createdAt?: string;
};

/**
 * Item privado do histórico da IA da sala.
 */
export type RoomAiHistoryItem = {
    _id: string;
    roomId: string;
    question: string;
    answer: string;
    createdAt?: string;
};

/**
 * Pergunta à IA da sala usando apenas partilhas autorizadas como contexto.
 *
 * @param roomId Identificador da sala; o backend valida membership antes de expor dados.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Resposta da IA da sala com fontes usadas.
 */
export function askRoomAi(
    roomId: string,
    input: { question: string; sourceIds?: string[] },
): Promise<RoomAiAnswer> {
    return requestJson<RoomAiAnswer>(`/api/study-rooms/${roomId}/ai/answers`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Lista o histórico privado da IA da sala para o aluno autenticado.
 *
 * @param roomId Identificador da sala; o backend valida membership e dono do histórico.
 * @returns Interações privadas ordenadas da mais recente para a mais antiga.
 */
export function listMyRoomAiHistory(roomId: string): Promise<RoomAiHistoryItem[]> {
    return requestJson<RoomAiHistoryItem[]>(
        `/api/study-rooms/${roomId}/ai/answers?scope=mine`,
    );
}
```

```tsx
/**
 * Implementa uma página React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    askRoomAi,
    listMyRoomAiHistory,
    RoomAiAnswer,
    RoomAiHistoryItem,
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
    const [history, setHistory] = useState<RoomAiHistoryItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    /**
     * Carrega o histórico privado da IA da sala para o aluno autenticado.
     */
    async function loadHistory(): Promise<void> {
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            const nextHistory = await listMyRoomAiHistory(roomId);
            setHistory(nextHistory);
        } catch (caught) {
            setHistoryError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível carregar o histórico privado.",
            );
        } finally {
            setHistoryLoading(false);
        }
    }

    useEffect(() => {
        void loadHistory();
    }, [roomId]);

    /**
     * Trata a ação do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a ação.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const nextAnswer = await askRoomAi(roomId, { question });
            setAnswer(nextAnswer);
            setQuestion("");
            // Depois do POST, a lista volta ao backend para refletir a persistência real.
            await loadHistory();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao perguntar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="space-y-4">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">IA da sala</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <textarea
                    rows={4}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                />
                <button
                    className="sf-button-primary"
                    disabled={loading || question.trim().length < 4}
                >
                    {loading ? "A perguntar..." : "Perguntar"}
                </button>
            </form>

            {answer ? (
                <article className="sf-panel space-y-3">
                    <h2 className="font-semibold">Resposta</h2>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{answer.answer}</p>
                    <p className="text-sm text-slate-600">
                        Fontes usadas: {answer.sources.map((source) => source.title).join(", ")}
                    </p>
                </article>
            ) : null}

            <section className="sf-panel space-y-3">
                <h2 className="font-semibold">O meu histórico privado</h2>
                {historyLoading ? <p className="text-sm text-slate-600">A carregar...</p> : null}
                {historyError ? <p className="sf-error">{historyError}</p> : null}
                {!historyLoading && !historyError && history.length === 0 ? (
                    <p className="text-sm text-slate-600">
                        Ainda não fizeste perguntas à IA desta sala.
                    </p>
                ) : null}
                <div className="space-y-3">
                    {history.map((item) => (
                        <article key={item._id} className="rounded border border-slate-200 p-3">
                            <p className="text-xs text-slate-500">
                                {item.createdAt
                                    ? new Date(item.createdAt).toLocaleString("pt-PT")
                                    : "Sem data"}
                            </p>
                            <h3 className="mt-2 text-sm font-semibold">{item.question}</h3>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                                {item.answer}
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
}
```

5. Explicação do código.

`listMyRoomAiHistory(...)` usa o mesmo `requestJson(...)` da app. Esse helper já centraliza cookies HttpOnly e cabeçalho CSRF, por isso a função nova não guarda credenciais no frontend.

`RoomAiPage` separa `error` de `historyError`, porque perguntar à IA e carregar histórico são operações diferentes. Depois de uma pergunta com sucesso, a página chama `loadHistory()` para confirmar a lista vinda do backend, em vez de inventar localmente um item.

6. Validação do passo.

Resultado esperado: ao abrir a página, a lista privada carrega. Se estiver vazia, aparece mensagem de vazio. Depois de uma pergunta válida, a resposta atual aparece e o histórico passa a incluir essa interação.

7. Cenário negativo/erro esperado.

Se o backend devolver erro de autorização ou sessão expirada, a UI mostra erro controlado. A página não tenta trocar `studentId`, não usa storage do browser para autorização e não mostra dados de outros alunos.

### Passo 6 - Criar testes do histórico privado

1. Objetivo funcional do passo no contexto da app.

Provar que a leitura do histórico respeita membership, filtra por aluno e sala, e não chama o provider de IA.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/study-rooms/room-ai-history.spec.ts`
    - REVER: `apps/api/src/modules/study-rooms/room-ai.service.spec.ts`
    - LOCALIZAÇÃO: ficheiro completo novo.

3. Instruções do que fazer.

Cria uma suite separada para o histórico privado. Mantém a suite antiga do `askRoomAi(...)` como está, porque ela testa geração de resposta e fontes autorizadas.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * Testa a leitura privada do histórico da IA da sala.
 */
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { RoomAiService } from "./room-ai.service.js";

const roomId = "507f1f77bcf86cd799439014";
const otherRoomId = "507f1f77bcf86cd799439099";
const studentId = "507f1f77bcf86cd799439012";
const otherStudentId = "507f1f77bcf86cd799439013";

const student: AuthenticatedUser = {
    id: studentId,
    email: "aluno@example.test",
    role: "STUDENT",
};

describe("RoomAiService history", () => {
    it("devolve apenas histórico da sala e do aluno autenticado", async () => {
        const { historyQuery, interactionModel, service } = makeService();
        historyQuery.exec.mockResolvedValue([
            makeInteractionDocument({
                id: "507f1f77bcf86cd799439111",
                roomId,
                studentId,
                question: "O que estudámos?",
                answer: "Estudámos equações.",
            }),
            makeInteractionDocument({
                id: "507f1f77bcf86cd799439112",
                roomId,
                studentId: otherStudentId,
                question: "Pergunta de outro aluno",
                answer: "Resposta privada de outro aluno.",
            }),
        ]);

        const result = await service.listMyRoomAiHistory(student, roomId);

        expect(interactionModel.find).toHaveBeenCalledWith({
            roomId: new Types.ObjectId(roomId),
            studentId: new Types.ObjectId(studentId),
        });
        expect(historyQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(historyQuery.limit).toHaveBeenCalledWith(30);
        expect(result).toEqual([
            {
                _id: "507f1f77bcf86cd799439111",
                roomId,
                question: "O que estudámos?",
                answer: "Estudámos equações.",
                createdAt: new Date("2026-07-02T10:00:00.000Z"),
            },
        ]);
    });

    it("rejeita aluno que não pertence à sala antes da query", async () => {
        const { historyQuery, interactionModel, service, studyRoomsService } = makeService();
        studyRoomsService.ensureMember.mockRejectedValue(
            new ForbiddenException({
                code: "ROOM_MEMBERSHIP_REQUIRED",
                message: "Não pertences a esta sala.",
            }),
        );

        await expect(service.listMyRoomAiHistory(student, roomId)).rejects.toBeInstanceOf(
            ForbiddenException,
        );
        expect(interactionModel.find).not.toHaveBeenCalled();
        expect(historyQuery.exec).not.toHaveBeenCalled();
    });

    it("rejeita identificador de sala inválido", async () => {
        const { interactionModel, service, studyRoomsService } = makeService();

        await expect(service.listMyRoomAiHistory(student, "sala-invalida")).rejects.toBeInstanceOf(
            BadRequestException,
        );
        expect(studyRoomsService.ensureMember).not.toHaveBeenCalled();
        expect(interactionModel.find).not.toHaveBeenCalled();
    });

    it("não devolve interações de outra sala mesmo que uma fixture venha misturada", async () => {
        const { historyQuery, service } = makeService();
        historyQuery.exec.mockResolvedValue([
            makeInteractionDocument({
                id: "507f1f77bcf86cd799439121",
                roomId: otherRoomId,
                studentId,
                question: "Pergunta noutra sala",
                answer: "Resposta privada noutra sala.",
            }),
        ]);

        await expect(service.listMyRoomAiHistory(student, roomId)).resolves.toEqual([]);
    });

    it("não chama o provider de IA para listar histórico", async () => {
        const { governedAiExecutionService, historyQuery, service } = makeService();
        historyQuery.exec.mockResolvedValue([]);

        await service.listMyRoomAiHistory(student, roomId);

        expect(governedAiExecutionService.execute).not.toHaveBeenCalled();
    });
});

/**
 * Cria uma instância testável do service com dependências substituídas por mocks.
 *
 * @returns Service e mocks necessários para verificar o comportamento do histórico.
 */
function makeService() {
    const historyQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn(),
    };
    const interactionModel = {
        create: jest.fn(),
        find: jest.fn().mockReturnValue(historyQuery),
    };
    const governedAiExecutionService = {
        execute: jest.fn(),
    };
    const studyRoomsService = {
        ensureMember: jest.fn().mockResolvedValue(undefined),
    };
    const roomSharesService = {
        findUsableSharesForRoom: jest.fn(),
    };
    const service = new RoomAiService(
        interactionModel as never,
        governedAiExecutionService as never,
        studyRoomsService as never,
        roomSharesService as never,
    );

    return {
        governedAiExecutionService,
        historyQuery,
        interactionModel,
        roomSharesService,
        service,
        studyRoomsService,
    };
}

/**
 * Cria um documento Mongoose mínimo para testar o mapeamento do histórico.
 *
 * @param input Dados essenciais da interação IA.
 * @returns Objeto com o contrato consumido por `RoomAiService`.
 */
function makeInteractionDocument(input: {
    id: string;
    roomId: string;
    studentId: string;
    question: string;
    answer: string;
}) {
    return {
        _id: new Types.ObjectId(input.id),
        roomId: new Types.ObjectId(input.roomId),
        studentId: new Types.ObjectId(input.studentId),
        question: input.question,
        answer: input.answer,
        sourceShareIds: [],
        createdAt: new Date("2026-07-02T10:00:00.000Z"),
    };
}
```

5. Explicação do código.

A primeira prova verifica a query exata por `roomId` e `studentId`. A fixture mistura uma interação de outro aluno para confirmar que o mapeamento não a devolve.

Os testes seguintes cobrem as falhas importantes: não membro, sala inválida, sala diferente e ausência de chamada ao provider. Isto protege a regra central de `RNF20`.

6. Validação do passo.

Resultado esperado: a suite passa e documenta que o histórico privado não depende de IA externa, não lê salas inválidas e não atravessa alunos.

7. Cenário negativo/erro esperado.

Se removeres `ensureMember(...)` ou trocares `studentId: new Types.ObjectId(actor.id)` por um valor vindo do frontend, pelo menos um teste deve falhar.

### Passo 7 - Validar fluxo completo e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Validar que o contrato está pronto para `BK-MF8-11` consumir respostas privadas da IA da sala sem assumir dados de outros alunos.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/study-rooms/room-ai-history.ts`
    - REVER: `apps/api/src/modules/study-rooms/room-ai.service.ts`
    - REVER: `apps/api/src/modules/study-rooms/room-ai.controller.ts`
    - REVER: `apps/api/src/modules/study-rooms/room-ai-history.spec.ts`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - REVER: `apps/web/src/pages/student/RoomAiPage.tsx`
    - LOCALIZAÇÃO: comandos e evidence do PR.

3. Instruções do que fazer.

Executa validações locais de backend e frontend. Se algum comando falhar por configuração local, guarda o comando, o erro e a conclusão técnica sem esconder a falha.

Comandos recomendados:

```bash
npm --prefix apps/api test -- room-ai-history
npm --prefix apps/web run lint
```

4. Código completo, correto e integrado com a app final.

Não há novo código neste passo. A validação confirma que o código dos passos anteriores está integrado.

5. Explicação do código.

O contrato final fica assim: o `POST` cria uma interação da IA da sala e o `GET` lista apenas as interações do aluno autenticado naquela sala. O BK seguinte pode usar o `_id` devolvido pelo histórico como ponto de partida para partilha controlada, mas a partilha ainda não existe neste BK.

6. Validação do passo.

Resultado esperado:

- `GET /api/study-rooms/:roomId/ai/answers?scope=mine` devolve `[]` para aluno sem histórico.
- O mesmo endpoint devolve itens do aluno autenticado quando existem interações.
- Uma sala onde o aluno não é membro falha antes da query.
- A UI mostra loading, vazio, erro e sucesso.
- Os testes provam que o provider de IA não é chamado durante a listagem.

7. Cenário negativo/erro esperado.

Se um aluno conseguir ver pergunta ou resposta criada por outro aluno, o BK não está concluído. Corrige primeiro o service e os testes antes de avançar para `BK-MF8-11`.

#### Critérios de aceite

- O guia mantém metadados canónicos de `BK-MF8-10` sem alterar matriz, backlog ou contrato de campos.
- `apps/api/src/modules/study-rooms/room-ai-history.ts` define o contrato público do histórico privado.
- `RoomAiService.listMyRoomAiHistory(...)` valida `roomId`, chama `ensureMember(...)`, filtra por `roomId` e `studentId`, ordena por data e limita a resposta.
- `RoomAiController` expõe `GET /api/study-rooms/:roomId/ai/answers?scope=mine` com `SessionGuard`.
- `apps/web/src/lib/apiClient.ts` expõe `RoomAiHistoryItem` e `listMyRoomAiHistory(...)`.
- `RoomAiPage` mostra histórico privado com loading, vazio, erro e sucesso.
- `room-ai-history.spec.ts` cobre aluno fora da sala, aluno diferente, sala diferente, sala inválida e ausência de chamada ao provider.
- Nenhum dado privado de outro aluno é devolvido, mostrado na UI ou usado em evidence pública.

#### Validação final

Executa, no mínimo:

```bash
npm --prefix apps/api test -- room-ai-history
npm --prefix apps/web run lint
```

Checklist manual:

- Abrir a página da IA da sala autenticado como aluno membro.
- Confirmar estado vazio quando ainda não existem perguntas.
- Fazer uma pergunta válida com fontes processáveis.
- Confirmar que a resposta aparece e que o histórico é atualizado.
- Entrar com outro aluno da mesma sala e confirmar que a pergunta anterior não aparece.
- Tentar aceder a uma sala sem membership e confirmar erro controlado.

#### Evidence para PR/defesa

Inclui no PR:

- comando e resultado da suite `room-ai-history`;
- comando e resultado de lint frontend;
- captura ou descrição curta dos estados vazio, loading, erro e sucesso;
- exemplo de resposta `GET` com dados fictícios e sem informações pessoais;
- nota de segurança: `studentId` vem da sessão no backend e nunca do frontend;
- nota de continuidade: `BK-MF8-11` pode usar o `_id` privado para iniciar partilha controlada.

#### Handoff

`BK-MF8-11` pode assumir que existe uma lista privada de interações da IA da sala, devolvida por `GET /api/study-rooms/:roomId/ai/answers?scope=mine`, contendo apenas respostas criadas pelo aluno autenticado.

O próximo BK deve continuar a proteger a fronteira entre resposta própria, resposta partilhada em modo read-only e fork privado. Não deve transformar este histórico privado numa lista global da sala.

#### Changelog

- 2026-07-02: Guia corrigido para incluir função de mapeamento, service, controller, cliente frontend, página React, testes executáveis, validação e handoff explícito para `BK-MF8-11`.
