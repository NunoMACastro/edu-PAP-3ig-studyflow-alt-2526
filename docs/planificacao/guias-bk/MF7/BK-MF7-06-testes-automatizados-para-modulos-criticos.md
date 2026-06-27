# BK-MF7-06 - Testes automatizados para módulos críticos.

## Header

- `doc_id`: `GUIA-BK-MF7-06`
- `bk_id`: `BK-MF7-06`
- `macro`: `MF7`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF28`
- `fase_documental`: `Fase 3`
- `sprint`: `S07`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-07`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-06-testes-automatizados-para-modulos-criticos.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais criar uma matriz de testes críticos e uma suite de contrato para IA com fontes. O resultado observável é um teste automatizado que prova um caminho principal com citações e dois cenários negativos: ausência de fontes citáveis e resposta inválida do provider IA.

No fim, a equipa consegue demonstrar `RNF28` com código, validação e evidence, sem depender de decisões escondidas nem de memória oral.

#### Importância

`RNF28` garante que os fluxos críticos não dependem só de testes manuais. Em StudyFlow, os módulos críticos incluem autenticação, materiais privados, IA com fontes, turmas/disciplinas, quotas e operação.

Este BK é incremental: consome o mapa técnico de `BK-MF7-05`, reutiliza contratos de MF6 e entrega uma peça pequena, testável e explicável para o deploy com rollback de `BK-MF7-07`.

#### Scope-in

- Implementar ou documentar o contrato de qualidade automatizada para módulos críticos.
- Usar caminhos públicos em `apps/api`, `apps/web` e `docs`.
- Validar um caminho principal e dois cenários negativos por ser um BK `P1`.
- Preservar autenticação, autorização, ownership, membership, quotas e guardrails já definidos quando o fluxo tocar dados privados ou IA.
- Produzir evidence com expected/observed, sem guardar dados privados.

#### Scope-out

- Criar requisitos novos fora de `RNF28`.
- Alterar IDs BK, owner, prioridade, sprint, esforço ou sequência canónica.
- Criar integrações externas de monitorização, LMS, Drive, OCR, embeddings ou automações avançadas sem contrato documental.
- Guardar segredos, cookies, prompts privados, respostas IA completas ou materiais privados em logs, screenshots ou documentos de evidence.
- Mover regras de segurança para o frontend.

#### Estado antes e depois

- Estado antes: MF6 deixa segurança, recuperação, guardrails e isolamento de IA preparados, e `BK-MF7-05` entrega um mapa técnico mínimo para escolher módulos críticos. Ainda falta uma prova automatizada explícita que cubra caminho principal e negativos P1 num módulo crítico.
- Estado depois: a app passa a ter `source-grounded-ai.contract.spec.ts` com caminho principal, negativo de ausência de fontes e negativo de resposta inválida do provider, preparando o gate de deploy em `BK-MF7-07`.

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
- `docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-07-deploy-com-rollback.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`

#### Glossário

- **StudyFlow:** plataforma de estudo com áreas privadas, turmas, materiais e IA pedagógica.
- **Aluno autenticado:** utilizador identificado por sessão HttpOnly no backend.
- **Professor:** utilizador que gere turmas, disciplinas, materiais oficiais e limites pedagógicos.
- **Fonte processável:** texto extraído e autorizado que pode sustentar uma resposta IA.
- **Citação:** referência curta com `sourceLabel`, `locator` e excerto limitado, usada para explicar de onde veio uma resposta IA.
- **Provider IA:** integração isolada que recebe um prompt autorizado e devolve JSON validado pelo service.
- **Evidence:** prova objetiva de funcionamento e falha controlada, usada em PR e defesa PAP.
- **Qualidade automatizada:** conjunto de testes, comandos e evidence que prova contratos críticos sem depender apenas de revisão manual.

#### Conceitos teóricos essenciais

- **Teste de contrato:** prova que entradas, saídas, erros e efeitos laterais continuam estáveis. Neste BK, o contrato é: uma resposta IA só pode ser persistida quando há fontes citáveis e resposta válida do provider.
- **Módulo crítico:** área cuja falha compromete segurança, privacidade, dados pedagógicos ou defesa PAP. IA com fontes é crítica porque mistura materiais de estudo, resposta pedagógica e risco de alucinação.
- **Caminho principal:** cenário em que a app recebe fontes autorizadas, chama o provider IA, persiste a resposta e devolve citações. Sem este teste, o BK só provaria falhas.
- **Cenário negativo:** teste que confirma falha controlada. Aqui existem dois negativos P1: sem fontes citáveis e provider com resposta inválida.
- **Fonte processável:** excerto textual já extraído e autorizado pelo `MaterialIndexService`. O service de IA não deve inventar fontes nem consultar materiais diretamente.
- **Autorização e ownership:** o teste usa `MaterialIndexService.findReadableDoneJob` porque esse service já concentra a validação de leitura do job. Isto evita duplicar regras e impede acesso cruzado a materiais.
- **Provider isolado:** o teste injeta o provider por `AI_PROVIDER`, sem chamar serviços externos. Assim, a suite é determinística e não depende de chaves, rede ou custo.
- **Privacidade e RGPD:** a evidence deve usar dados fictícios controlados. Não se guardam cookies, passwords, prompts privados completos, materiais reais nem respostas privadas de alunos.
- **Evidence de PR:** prova curta com comando, expected, observed, negativos e risco restante. Ela prepara o gate de deploy do próximo BK.

#### Arquitetura do BK

- Endpoint(s): o contrato protege `POST /api/ai/source-grounded-answers`, mas o teste atua no service para evitar servidor HTTP e manter a prova determinística.
- Modelo/schema: usa `SourceGroundedAiAnswer` e `SourceGroundedCitation`.
- DTO: consome `AskSourceGroundedAiDto` através do método `SourceGroundedAiService.ask`.
- Service(s): `SourceGroundedAiService` e `MaterialIndexService`.
- Controller/route: não altera controller; `SourceGroundedAiController` continua protegido por `SessionGuard`.
- Guard/middleware: reutiliza sessão autenticada e validação de leitura já concentrada no backend.
- Provider IA: usa `AI_PROVIDER` injetado com mock determinístico.
- Segurança/autorização: o teste confirma que o provider não é chamado sem fontes citáveis e que respostas inválidas não são persistidas.
- Testes: Jest unitário/contrato com um caminho principal e dois negativos.
- Handoff para o próximo BK: `BK-MF7-07` exige testes verdes antes de deploy.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts`
- REVER: `apps/api/jest.config.cjs`
- REVER: `apps/api/package.json`
- REVER: `docs/technical/STUDYFLOW-TECHNICAL-MAP.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF7-06` entrega `RNF28` sem alterar ID, owner, prioridade, sprint ou sequência.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- LOCALIZAÇÃO: linhas canónicas do requisito e da matriz.

3. Instruções do que fazer.

Lê `RNF28` em `docs/RNF.md`, confirma a linha `BK-MF7-06` na matriz e regista as decisões seguintes:
- `CANONICO`: `RNF28` exige testes automatizados para módulos críticos.
- `DERIVADO`: priorizar IA com fontes por risco pedagógico, privacidade e anti-alucinação.
- `DERIVADO`: para prioridade `P1`, exigir um caminho principal e dois negativos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fixa o contrato. A implementação só começa depois de confirmar o requisito, o domínio e o BK seguinte.

6. Validação do passo.

Resultado esperado: `BK-MF7-06` continua ligado a `RNF28`, `prioridade: P1`, `sprint: S07` e `proximo_bk: BK-MF7-07`.

7. Cenário negativo/erro esperado.

Se a matriz, backlog e guia tiverem valores diferentes, não avances; regista o drift no relatório de PR.

### Passo 2 - Mapear contratos existentes

1. Objetivo funcional do passo no contexto da app.

Localizar os ficheiros que este BK consome para não duplicar regras de qualidade automatizada, IA com fontes ou autorização.

2. Ficheiros envolvidos:
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`
- REVER: `apps/api/src/modules/material-index/material-index.service.ts`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md`
- LOCALIZAÇÃO: módulos e services já criados nas macrofases anteriores.

3. Instruções do que fazer.

Confirma que a MF6 já entregou segurança, recovery, guardrails e isolamento de IA. Este BK não substitui `SessionGuard`, ownership, membership, quotas ou guardrails; usa essas peças onde existirem.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o objetivo é evitar duplicação. O aluno deve saber que cada ficheiro novo encaixa num contrato anterior.

6. Validação do passo.

Resultado esperado: lista curta de ficheiros existentes e decisão clara sobre o ponto exato de criação do teste.

7. Cenário negativo/erro esperado.

Se a solução criar outro endpoint, outro schema ou outro service para a mesma responsabilidade, rejeita a abordagem e testa o service existente.

### Passo 3 - Criar o contrato automatizado principal

1. Objetivo funcional do passo no contexto da app.

Construir a suite que torna `RNF28` implementável: um caminho principal e dois negativos P1 para IA com fontes.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts`
- LOCALIZAÇÃO: ficheiro completo `apps/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts`.

3. Instruções do que fazer.

Cria o ficheiro com o código abaixo. Mantém nomes, imports e mensagens em português de Portugal. Não guardes dados sensíveis, não chames a rede e não deixes decisões de segurança para o frontend.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts
import {
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider.js";
import {
    MaterialIndexJobView,
    MaterialIndexService,
} from "../material-index/material-index.service.js";
import { MaterialTextChunk } from "../material-index/schemas/material-index-job.schema.js";
import {
    SourceGroundedAiAnswer,
    SourceGroundedCitation,
} from "./schemas/source-grounded-ai-answer.schema.js";
import { SourceGroundedAiService } from "./source-grounded-ai.service.js";

type PersistInput = {
    actorId: Types.ObjectId;
    sourceJobIds: Types.ObjectId[];
    question: string;
    answer: string;
    citations: SourceGroundedCitation[];
};

type PersistedAnswer = PersistInput & {
    _id: Types.ObjectId;
    toObject(): { createdAt: Date };
};

type SourceGroundedContractContext = {
    moduleRef: TestingModule;
    service: SourceGroundedAiService;
    answerModel: {
        create: jest.Mock<Promise<PersistedAnswer>, [PersistInput]>;
    };
    materialIndexService: {
        findReadableDoneJob: jest.Mock<
            Promise<MaterialIndexJobView>,
            [AuthenticatedUser, string]
        >;
    };
    aiProvider: {
        generateStudyTool: jest.Mock<
            Promise<Record<string, unknown>>,
            [Parameters<AiProvider["generateStudyTool"]>[0]]
        >;
    };
};

describe("SourceGroundedAiService contrato crítico", () => {
    const student: AuthenticatedUser = {
        id: "64f000000000000000000003",
        role: "STUDENT",
        email: "aluno@escola.pt",
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("persiste resposta com citações quando existem fontes autorizadas", async () => {
        const context = await makeContractContext({
            chunks: [
                {
                    order: 1,
                    text: "As derivadas medem a taxa de variação instantânea.",
                    sourceLabel: "Manual de Matemática",
                    locator: "p. 12",
                },
            ],
            providerAnswer: "As derivadas medem a taxa de variação instantânea.",
        });

        try {
            const result = await context.service.ask(student, {
                question: "Explica o que são derivadas.",
                sourceJobIds: ["64f000000000000000000001"],
            });

            expect(result).toMatchObject({
                question: "Explica o que são derivadas.",
                answer: "As derivadas medem a taxa de variação instantânea.",
                citations: [
                    {
                        sourceJobId: "64f000000000000000000001",
                        materialId: "64f000000000000000000002",
                        sourceLabel: "Manual de Matemática",
                        locator: "p. 12",
                    },
                ],
            });
            expect(context.materialIndexService.findReadableDoneJob).toHaveBeenCalledWith(
                student,
                "64f000000000000000000001",
            );
            expect(context.aiProvider.generateStudyTool).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "EXPLANATION",
                    prompt: expect.stringContaining("Fontes autorizadas"),
                }),
            );
            expect(context.answerModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    question: "Explica o que são derivadas.",
                    citations: expect.arrayContaining([
                        expect.objectContaining({
                            sourceLabel: "Manual de Matemática",
                        }),
                    ]),
                }),
            );
        } finally {
            await context.moduleRef.close();
        }
    });

    it("bloqueia resposta quando não há fontes citáveis", async () => {
        const context = await makeContractContext({ chunks: [] });

        try {
            await expect(
                context.service.ask(student, {
                    question: "Explica a matéria.",
                    sourceJobIds: ["64f000000000000000000001"],
                }),
            ).rejects.toBeInstanceOf(UnprocessableEntityException);

            // Sem fontes, a IA não pode inventar uma resposta factual para o aluno.
            expect(context.aiProvider.generateStudyTool).not.toHaveBeenCalled();
            expect(context.answerModel.create).not.toHaveBeenCalled();
        } finally {
            await context.moduleRef.close();
        }
    });

    it("rejeita resposta inválida do provider e não persiste conteúdo inseguro", async () => {
        const context = await makeContractContext({
            chunks: [
                {
                    order: 1,
                    text: "A fotossíntese transforma luz em energia química.",
                    sourceLabel: "Manual de Biologia",
                    locator: "secção 3",
                },
            ],
            providerAnswer: "",
        });

        try {
            await expect(
                context.service.ask(student, {
                    question: "Resume a fotossíntese.",
                    sourceJobIds: ["64f000000000000000000001"],
                }),
            ).rejects.toBeInstanceOf(ServiceUnavailableException);

            // Respostas vazias ou malformadas não devem entrar no histórico do aluno.
            expect(context.answerModel.create).not.toHaveBeenCalled();
        } finally {
            await context.moduleRef.close();
        }
    });
});

/**
 * Cria o contexto de teste com dependências injetadas pelo NestJS.
 *
 * @param options.chunks Chunks textuais já autorizados pelo MaterialIndexService.
 * @param options.providerAnswer Resposta devolvida pelo provider IA isolado.
 * @returns Service e mocks tipados para validar caminho principal e negativos.
 */
async function makeContractContext(options: {
    chunks: MaterialTextChunk[];
    providerAnswer?: string;
}): Promise<SourceGroundedContractContext> {
    const answerModel = {
        create: jest
            .fn<Promise<PersistedAnswer>, [PersistInput]>()
            .mockImplementation(async (input) => makePersistedAnswer(input)),
    };
    const materialIndexService = {
        findReadableDoneJob: jest
            .fn<Promise<MaterialIndexJobView>, [AuthenticatedUser, string]>()
            .mockResolvedValue(makeIndexedJob(options.chunks)),
    };
    const aiProvider = {
        generateStudyTool: jest
            .fn<
                Promise<Record<string, unknown>>,
                [Parameters<AiProvider["generateStudyTool"]>[0]]
            >()
            .mockResolvedValue({ answer: options.providerAnswer ?? "Resposta citada." }),
    };

    const moduleRef = await Test.createTestingModule({
        providers: [
            SourceGroundedAiService,
            {
                provide: getModelToken(SourceGroundedAiAnswer.name),
                useValue: answerModel,
            },
            { provide: MaterialIndexService, useValue: materialIndexService },
            { provide: AI_PROVIDER, useValue: aiProvider },
        ],
    }).compile();

    return {
        moduleRef,
        service: moduleRef.get(SourceGroundedAiService),
        answerModel,
        materialIndexService,
        aiProvider,
    };
}

/**
 * Cria um job de indexação autorizado para testar a fronteira entre fontes existentes e ausência de fontes.
 *
 * @param chunks Chunks textuais processáveis que o service pode citar.
 * @returns Job público no formato devolvido por MaterialIndexService.findReadableDoneJob.
 */
function makeIndexedJob(chunks: MaterialTextChunk[]): MaterialIndexJobView {
    return {
        _id: "64f000000000000000000001",
        scope: "PRIVATE_AREA",
        materialId: "64f000000000000000000002",
        userId: "64f000000000000000000003",
        status: "DONE",
        extractedTextChunks: chunks,
    };
}

/**
 * Simula o documento persistido pelo Mongoose sem abrir uma base de dados real.
 *
 * @param input Dados que o service tentou persistir depois de validar fontes e provider.
 * @returns Documento mínimo com campos usados por SourceGroundedAiService.ask.
 */
function makePersistedAnswer(input: PersistInput): PersistedAnswer {
    return {
        _id: new Types.ObjectId("64f000000000000000000099"),
        ...input,
        toObject: () => ({ createdAt: new Date("2026-06-26T09:00:00.000Z") }),
    };
}
```

5. Explicação do código.

O código implementa o contrato principal de `BK-MF7-06`. O primeiro teste prova o caminho principal: o service recebe uma fonte autorizada, chama o provider IA, persiste a resposta e devolve uma citação com `sourceLabel` e `locator`. Isto cumpre `RNF28` porque não valida apenas a existência do ficheiro; valida comportamento real do módulo crítico.

O segundo teste cobre o negativo de ausência de fontes. Quando `MaterialIndexService` devolve um job sem chunks, o service lança `UnprocessableEntityException`, não chama o provider IA e não persiste resposta. Esta proteção evita alucinação e exposição de resposta não fundamentada.

O terceiro teste cobre o negativo de provider inválido. Mesmo com fonte autorizada, uma resposta vazia é rejeitada com `ServiceUnavailableException` e não é guardada no histórico. Assim, o BK cobre dois erros diferentes: falta de fonte antes do provider e output inválido depois do provider.

Os helpers têm JSDoc porque fazem parte do contrato didático do teste. `makeContractContext` usa o container de testes do NestJS para injetar dependências como na app real, sem arrancar servidor HTTP, sem ligar a MongoDB e sem depender de chaves externas.

6. Validação do passo.

Executa uma leitura técnica do ficheiro e confirma que não há imports inexistentes, dados privados em logs, casts inseguros, payloads sem tipo, decisões de autorização feitas no frontend ou chamadas externas.

7. Cenário negativo/erro esperado.

Se removeres a validação sem fontes, a suite deve falhar porque o provider passaria a ser chamado. Se removeres a validação de resposta inválida, a suite deve falhar porque `answerModel.create` passaria a receber conteúdo inseguro.

### Passo 4 - Integrar com a aplicação

1. Objetivo funcional do passo no contexto da app.

Ligar o contrato principal ao ponto correto da app sem duplicar módulos.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts`
- REVER: `apps/api/jest.config.cjs`
- REVER: `apps/api/package.json`
- LOCALIZAÇÃO: suite `SourceGroundedAiService contrato crítico`, executada pelo Jest configurado em `apps/api/jest.config.cjs`.

3. Instruções do que fazer.

Não importes este ficheiro em nenhum módulo runtime. O ponto de integração é a descoberta automática de testes do Jest: coloca o ficheiro junto de `source-grounded-ai.service.ts` para que `npm --prefix apps/api run test:unit -- source-grounded-ai` execute o contrato crítico com os testes existentes do domínio.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo; o código completo do teste foi apresentado no Passo 3 e a integração é feita pela localização do ficheiro e pela configuração Jest.

5. Explicação do código.

O teste fica ao lado do service que valida fontes obrigatórias. Isto evita criar um módulo artificial só para testes e garante que a suite corre no mesmo contexto dos testes unitários da API.

6. Validação do passo.

Resultado esperado: `npm --prefix apps/api run test:unit -- source-grounded-ai` descobre `source-grounded-ai.contract.spec.ts` e confirma caminho principal, ausência de fontes e resposta inválida do provider.

7. Cenário negativo/erro esperado.

Se a integração contornar `SessionGuard`, ownership, membership, quotas ou guardrails já existentes, a alteração deve ser rejeitada.

### Passo 5 - Preparar evidence técnica P1

1. Objetivo funcional do passo no contexto da app.

Transformar a execução da suite em evidence clara para PR e defesa PAP.

2. Ficheiros envolvidos:
- REVER: `apps/api/package.json`
- REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts`
- LOCALIZAÇÃO: scripts `test` e `test:unit`, output Jest e descrição da PR.

3. Instruções do que fazer.

Regista expected/observed para o caminho principal e para os dois negativos. Para `P1`, a evidence mínima deve provar que existe pelo menos uma validação funcional e dois erros controlados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque a evidence é operacional. O valor está em demonstrar que o teste foi executado, que falhou pelos motivos certos quando simulado, e que não dependeu de dados reais nem de serviços externos.

6. Validação do passo.

Tabela mínima de evidence para anexar ao PR ou relatório técnico:

| Caso | Expected | Observed a registar |
| --- | --- | --- |
| Caminho principal | `npm --prefix apps/api run test:unit -- source-grounded-ai` passa com resposta citada. | Output Jest do teste `persiste resposta com citações quando existem fontes autorizadas`. |
| Negativo 1 | Sem chunks, o service lança `UnprocessableEntityException` e não chama o provider. | Output Jest do teste `bloqueia resposta quando não há fontes citáveis`. |
| Negativo 2 | Provider com `answer` vazio lança `ServiceUnavailableException` e não persiste resposta. | Output Jest do teste `rejeita resposta inválida do provider e não persiste conteúdo inseguro`. |
| Privacidade | Evidence não contém credenciais, cookies, materiais privados, prompts privados nem respostas completas da IA. | Confirmação textual no PR. |

7. Cenário negativo/erro esperado.

Se a evidence disser apenas "funciona", sem output, teste, erro esperado ou confirmação de privacidade, não cumpre `RNF28`.

### Passo 6 - Validar por camada

1. Objetivo funcional do passo no contexto da app.

Confirmar que backend, frontend, documentação e evidence estão alinhados.

2. Ficheiros envolvidos:
- REVER: `apps/api/package.json`
- REVER: `apps/web/package.json`
- REVER: `docs/planificacao/guias-bk/MF7`
- LOCALIZAÇÃO: comandos de validação e PR.

3. Instruções do que fazer.

Executa validação por camada e regista observed/expected. Matriz mínima de testes por prioridade: `P0` exige unit, integração e 3 negativos; `P1` exige unit ou integração e 2 negativos; `P2` exige teste focal e 1 negativo. Evidence por camada: backend, frontend, documentação e smoke quando existir endpoint.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque a validação é operacional. O valor está em comparar resultado esperado e observado de forma objetiva.

6. Validação do passo.

Resultados esperados:
- `npm --prefix apps/api run test:unit -- source-grounded-ai`: suite verde com caminho principal e dois negativos.
- `npm --prefix apps/api run build`: sem erros TypeScript/NestJS.
- `bash scripts/validate-planificacao.sh`: planeamento sem drift crítico.
- Pesquisa textual dos BKs MF7: sem linguagem interna, caminhos privados, soluções incompletas ou payloads opacos.

7. Cenário negativo/erro esperado.

Se o build falhar por import criado neste BK, corrige antes de abrir PR. Se falhar por dívida externa, regista o caminho, comando e erro exato.

### Passo 7 - Preparar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF7-06` com prova técnica e instrução clara para `BK-MF7-07`.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-06-testes-automatizados-para-modulos-criticos.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-07-deploy-com-rollback.md`
- LOCALIZAÇÃO: secções finais do guia e descrição da PR.

3. Instruções do que fazer.

No PR, inclui comandos executados, resultado principal, negativos, risco restante e o que o próximo BK passa a poder reutilizar. Como este BK toca IA, inclui prova de fontes/contexto e confirma que a evidence não expõe dados privados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque o foco é comunicação técnica. A equipa deve conseguir defender a decisão sem pedir contexto extra ao professor.

6. Validação do passo.

Resultado esperado: evidence completa com caminho principal, dois negativos P1, build backend, confirmação de privacidade e handoff explícito para `BK-MF7-07`.

7. Cenário negativo/erro esperado.

Se a PR não mostrar que o teste correu e que os dois negativos falham de forma controlada, `BK-MF7-07` não deve avançar para deploy.

#### Critérios de aceite

- `RNF28` fica demonstrável por código, teste/evidence e explicação pedagógica.
- O guia mantém `bk_id`, `macro`, owner, apoio, prioridade, sprint, esforço, `rf_rnf` e `proximo_bk` alinhados com matriz e backlog.
- Cada passo tem objetivo, ficheiros, instruções, código ou justificação sem código, explicação, validação e negativo.
- O código apresentado tem JSDoc nos elementos relevantes e comentários didáticos junto das decisões importantes.
- O contrato P1 inclui um caminho principal e dois negativos.
- Não existe decisão de sessão, ownership, membership, role, quota, fonte IA ou privacidade feita apenas no frontend.
- Não há exposição de cookies, passwords, prompts privados, respostas IA completas, materiais privados ou dados de outro contexto em logs/evidence.
- Os testes não dependem de rede, chaves externas, MongoDB real ou servidor HTTP.

#### Validação final

- Executar pesquisa textual nos BKs MF7 para confirmar ausência de linguagem interna e caminhos privados.
- Executar `git diff --check`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar `npm --prefix apps/api run test:unit -- source-grounded-ai`.
- Executar `npm --prefix apps/api run build`.
- Resultado esperado: comandos verdes ou falha externa registada com caminho, comando e erro observado.

#### Evidence para PR/defesa

- `pr`: referência do PR/commit com resumo de `BK-MF7-06`.
- `proof_tecnico`: output de `npm --prefix apps/api run test:unit -- source-grounded-ai` e `npm --prefix apps/api run build`.
- `proof_negativos`: erro controlado para ausência de fontes e resposta inválida do provider.
- `proof_fontes`: lista fictícia e limitada de `sourceLabel`, `locator` e excerto usado no teste.
- `proof_privacidade`: confirmação de que não há dados pessoais ou privados em logs/evidence.
- `proof_pedagogico`: explicação curta de como `RNF28` melhora a aplicação para alunos, professores ou operação.

#### Handoff

`BK-MF7-07` exige testes verdes antes de deploy.

O próximo BK deve reutilizar esta suite como gate mínimo para o módulo de IA com fontes, sem criar outro contrato para a mesma responsabilidade.

#### Changelog

- `2026-06-26`: contrato de testes automatizados documentado com tutorial técnico linear, código completo, validação, negativos, evidence e caminhos públicos `apps/...`.
- `2026-06-26`: cobertura `P1` corrigida para incluir caminho principal, negativo sem fontes e negativo de resposta inválida do provider IA.
