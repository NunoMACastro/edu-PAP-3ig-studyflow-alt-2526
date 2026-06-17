# BK-MF3-04 - IA deve ajustar explicações ao perfil do aluno.

## Header

- `doc_id`: `GUIA-BK-MF3-04`
- `bk_id`: `BK-MF3-04`
- `macro`: `MF3`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `DONE`
- `esforco`: `S`
- `dependencias`: `BK-MF1-01`
- `rf_rnf`: `RF40`
- `fase_documental`: `Fase 2`
- `sprint`: `S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-05`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-04-ia-deve-ajustar-explicacoes-ao-perfil-do-aluno.md`
<<<<<<< HEAD
- `last_updated`: `2026-06-14`
=======
- `last_updated`: `2026-06-16`
>>>>>>> 328adf2 (Update: MF4)

#### Objetivo

Neste BK vais implementar explicações adaptadas ao perfil do aluno. O guia parte dos contratos canónicos de RF40, da sequência MF0-MF2 e dos BKs que desbloqueiam este requisito.

#### Importância

Este BK transforma o requisito RF40 numa entrega copiável e testável. A funcionalidade fica no backend, com validação, sessão autenticada e resposta tipada para o frontend. Assim, o aluno percebe o domínio StudyFlow antes de escrever código e não precisa de adivinhar services, DTOs ou endpoints.

#### Scope-in

- Gerar explicação adaptada a uma área do aluno.
- Usar fontes privadas prontas.
- Registar estratégia pedagógica aplicada.

#### Scope-out

- Recalcular perfil do aluno.
- Alterar notas ou métricas da turma.
- Usar materiais oficiais de turma.

#### Estado antes e depois

##### Estado antes

- O fluxo ainda não estava totalmente alinhado com o contrato executável do `real_dev`.
- As rotas, imports, autenticação e testes ainda precisavam de ficar coerentes com a app real.

##### Estado depois

- O BK apresenta endpoint `POST /api/ai/adaptive-explanations`, DTO, backend, frontend, validações e handoff para `BK-MF3-05`.
- O código apresentado valida sessão, ownership ou membership antes de ler ou gravar dados.

##### Decisões de escopo

- Prioridade, owner, dependências, sprint e RF são CANONICO porque vêm de `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`.
- O endpoint `POST /api/ai/adaptive-explanations` é DERIVADO como contrato técnico mínimo para cumprir RF40 sem contrariar os documentos canónicos.
- Usar `SessionGuard` e `AuthenticatedUser` é DERIVADO dos BKs anteriores e obrigatório para manter ownership e membership no backend.
- A resposta do frontend usa `credentials: 'include'` porque a sessão vem de cookie HttpOnly.

#### Pre-requisitos

- `BK-MF1-01` com `AdaptiveLearningService`.
- `BK-MF0-10` com perfil IA da área.
- `BK-MF2-11` com IA privada.

#### Glossário

- **Actor autenticado**: utilizador obtido da sessão segura, nunca do body.
- **DTO**: classe que valida dados de entrada antes de chegarem ao service.
- **Service**: camada que aplica regras de domínio, ownership e membership.
- **Controller**: camada que expõe o endpoint HTTP e delega no service.
- **Schema Mongoose**: contrato de persistência em MongoDB para dados novos do BK.
- **Frontend client**: função tipada que chama a API com cookie de sessão.

#### Conceitos teóricos essenciais

##### Conceitos de domínio StudyFlow

- Perfil do aluno inclui ritmo, dificuldades e estilo de explicação já recolhidos em BK anterior.
- Adaptação muda linguagem e progressão, mas não muda os factos das fontes.
- O backend valida ownership da área antes de ler materiais ou perfil.
- A resposta guarda o motivo pedagógico da adaptação para defesa técnica.

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

- Endpoint: `POST /api/ai/adaptive-explanations`.
- Backend: `real_dev/api/src/modules/adaptive-explanations`.
- Frontend: `real_dev/web/src/features/adaptive-explanations`.
- DTO principal: `AskAdaptiveExplanationDto`.
- Service principal: `AdaptiveExplanationsService`.
- Controller principal: `AdaptiveExplanationsController`.
- Módulo principal: `AdaptiveExplanationsModule`.
- Persistência herdada: `real_dev/api/src/modules/ai/schemas/adaptive-explanation.schema.ts`.
- Handoff: `BK-MF3-05`.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/api/src/modules/adaptive-explanations/dto/ask-adaptive-explanation.dto.ts`
- REVER: `real_dev/api/src/modules/ai/schemas/adaptive-explanation.schema.ts`
- CRIAR: `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.service.ts`
- CRIAR: `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.controller.ts`
- CRIAR: `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.module.ts`
- CRIAR: `real_dev/web/src/features/adaptive-explanations/ask-adaptive-explanation.ts`
- CRIAR: `real_dev/web/src/features/adaptive-explanations/adaptive-explanation-panel.tsx`
- REVER: `real_dev/api/src/app.module.ts` para importar o módulo criado.

#### Tutorial técnico linear



### Passo 1 - Definir o DTO validado

1. Objetivo funcional do passo no contexto da app.
   Garantir que o endpoint recebe dados claros e rejeita input inválido antes do service.
2. Ficheiros envolvidos:
   - CRIAR: `real_dev/api/src/modules/adaptive-explanations/dto/ask-adaptive-explanation.dto.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria o DTO com validações declarativas e nomes iguais ao payload documentado neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/adaptive-explanations/dto/ask-adaptive-explanation.dto.ts
import { IsMongoId, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Pedido MF3 para explicação adaptada ao perfil do aluno.
 */
export class AskMf3AdaptiveExplanationDto {
    /**
     * Área de estudo privada do aluno.
     */
    @IsMongoId()
    studyAreaId!: string;

    /**
     * Pergunta que deve respeitar o perfil de aprendizagem já existente.
     */
    @IsString()
    @MinLength(5)
    @MaxLength(1200)
    question!: string;
}
```

5. Explicação do código.
   O DTO define o contrato de entrada. Cada campo tem JSDoc para explicar de onde vem e que erro evita. As validações devolvem `400 Bad Request` antes de qualquer leitura de dados.
6. Validação do passo.
   Envia para `POST /api/ai/adaptive-explanations` um body vazio e confirma que a validação devolve `400`.
7. Cenário negativo/erro esperado.
   Não aceites IDs de aluno no body. O utilizador vem da sessão autenticada.

### Passo 2 - Reutilizar a persistência herdada da MF1

1. Objetivo funcional do passo no contexto da app.
   Confirmar que a MF3 reutiliza a persistência já entregue pela IA adaptativa, sem criar um segundo modelo para o mesmo conceito.
2. Ficheiros envolvidos:
   - REVER: `real_dev/api/src/modules/ai/schemas/adaptive-explanation.schema.ts`
   - LOCALIZAÇÃO: `schema herdado de MF1`
3. Instruções do que fazer.
   Revê o schema já existente e confirma que o novo endpoint MF3 usa o service herdado em vez de duplicar persistência.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/ai/schemas/adaptive-explanation.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AdaptiveExplanationDocument = HydratedDocument<AdaptiveExplanation>;

/**
 * Interação IA adaptativa guardada como evidência do BK-MF1-01.
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
AdaptiveExplanationSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });
```

5. Explicação do código.
   Este schema já pertence ao contrato da IA adaptativa. A MF3 deve reutilizá-lo através de `AdaptiveLearningService`, porque criar outro schema para a mesma explicação dividiria o histórico do aluno e aumentaria o risco de dados inconsistentes.
6. Validação do passo.
   Confirma que `AdaptiveExplanationsService` injeta `AdaptiveLearningService` e não injeta um modelo Mongoose novo deste módulo.
7. Cenário negativo/erro esperado.
   Não cries outro modelo `AdaptiveExplanation` dentro de `real_dev/api/src/modules/adaptive-explanations`; isso duplicaria o contrato herdado e confundiria BKs seguintes.

### Passo 3 - Implementar o service de aplicação

1. Objetivo funcional do passo no contexto da app.
   Concentrar regras de negócio, ownership, membership, erros e efeitos de persistência num ponto testável.
2. Ficheiros envolvidos:
   - CRIAR: `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.service.ts`
   - LOCALIZAÇÃO: `classe completa do service`
3. Instruções do que fazer.
   Cria o service e injeta apenas módulos herdados ou ficheiros criados neste BK.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AdaptiveLearningService } from "../ai/adaptive-learning.service.js";
import { AskMf3AdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto.js";

/**
 * Fachada MF3 para explicações adaptadas.
 *
 * O comportamento principal já foi entregue pela MF1; este service cria o
 * contrato pedido em MF3 sem duplicar validação de fontes, perfil ou persistência.
 */
@Injectable()
export class AdaptiveExplanationsService {
    constructor(private readonly adaptiveLearningService: AdaptiveLearningService) {}

    /**
     * Gera uma explicação com o perfil de aprendizagem do aluno.
     *
     * @param actor Aluno autenticado.
     * @param input Área e pergunta.
     * @returns Explicação produzida pelo contrato herdado.
     */
    async ask(actor: AuthenticatedUser, input: AskMf3AdaptiveExplanationDto) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
        return this.adaptiveLearningService.askAdaptiveExplanation(
            actor.id,
            input.studyAreaId,
            { question: input.question },
        );
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
   Ligar `POST /api/ai/adaptive-explanations` ao service sem colocar regras sensíveis no controller.
2. Ficheiros envolvidos:
   - CRIAR: `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.controller.ts`
   - LOCALIZAÇÃO: `classe completa do controller`
3. Instruções do que fazer.
   Cria o controller com `SessionGuard`, `@Req() request: AuthenticatedRequest` e delegação direta para o service.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.controller.ts
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AdaptiveExplanationsService } from "./adaptive-explanations.service.js";
import { AskMf3AdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto.js";

/**
 * Endpoint MF3 de explicações adaptadas ao perfil do aluno.
 */
@Controller("api/ai/adaptive-explanations")
@UseGuards(SessionGuard)
export class AdaptiveExplanationsController {
    constructor(private readonly adaptiveExplanationsService: AdaptiveExplanationsService) {}

    /**
     * Delegação para o contrato acumulado de aprendizagem adaptativa.
     *
     * @param request Pedido autenticado.
     * @param body Área e pergunta.
     * @returns Explicação adaptada.
     */
    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Body() body: AskMf3AdaptiveExplanationDto,
    ) {
        return this.adaptiveExplanationsService.ask(request.user!, body);
    }
}
```

5. Explicação do código.
   O controller transforma HTTP em chamada de aplicação. A autorização continua no service para que testes unitários cubram o comportamento sem depender de HTTP.
6. Validação do passo.
   Faz um pedido sem cookie para `POST /api/ai/adaptive-explanations` e confirma `401 Unauthorized`.
7. Cenário negativo/erro esperado.
   Não leias `userId` do body ou da query string; o `SessionGuard` deve anexar o utilizador ao `request` autenticado.

### Passo 5 - Publicar o módulo NestJS

1. Objetivo funcional do passo no contexto da app.
   Permitir que a aplicação carregue controller, service, schema e dependências num módulo coeso.
2. Ficheiros envolvidos:
   - CRIAR: `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.module.ts`
   - EDITAR: `real_dev/api/src/app.module.ts`
   - LOCALIZAÇÃO: `módulo completo e lista de imports do AppModule`
3. Instruções do que fazer.
   Cria o módulo e adiciona `AdaptiveExplanationsModule` à lista de imports do AppModule, preservando os módulos existentes.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.module.ts
import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { AdaptiveExplanationsController } from "./adaptive-explanations.controller.js";
import { AdaptiveExplanationsService } from "./adaptive-explanations.service.js";

/**
 * Módulo MF3 que expõe o endpoint recomendado para explicações adaptadas.
 */
@Module({
    imports: [AuthModule, AiModule],
    controllers: [AdaptiveExplanationsController],
    providers: [AdaptiveExplanationsService],
})
export class AdaptiveExplanationsModule {}
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
   - CRIAR: `real_dev/web/src/features/adaptive-explanations/ask-adaptive-explanation.ts`
   - LOCALIZAÇÃO: `ficheiro completo`
3. Instruções do que fazer.
   Cria uma função de API com payload e resposta tipados.
4. Código completo, correto e integrado com a app final.

```ts
// real_dev/web/src/features/adaptive-explanations/ask-adaptive-explanation.ts
import { AdaptiveExplanation } from "../../lib/apiClient.js";
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Pede explicação adaptada ao perfil do aluno.
 *
 * @param input Área e pergunta.
 * @returns Explicação adaptada.
 */
export function askMf3AdaptiveExplanation(input: {
    studyAreaId: string;
    question: string;
}): Promise<AdaptiveExplanation> {
    return requestMf3Json<AdaptiveExplanation>("/api/ai/adaptive-explanations", {
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
   - CRIAR: `real_dev/web/src/features/adaptive-explanations/adaptive-explanation-panel.tsx`
   - LOCALIZAÇÃO: `componente completo`
3. Instruções do que fazer.
   Cria o componente com formulário, loading, erro, vazio e sucesso.
4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/features/adaptive-explanations/adaptive-explanation-panel.tsx
import { FormEvent, useState } from "react";
import { AdaptiveExplanation } from "../../lib/apiClient.js";
import { askMf3AdaptiveExplanation } from "./ask-adaptive-explanation.js";

/**
 * Painel MF3 de explicações adaptadas ao perfil.
 *
 * @returns Formulário e explicação gerada.
 */
export function AdaptiveExplanationPanel() {
    const [studyAreaId, setStudyAreaId] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<AdaptiveExplanation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            setAnswer(await askMf3AdaptiveExplanation({ studyAreaId, question }));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao responder.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Explicação adaptada</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Área
                    <input value={studyAreaId} onChange={(event) => setStudyAreaId(event.target.value)} />
                </label>
                <label className="block">
                    Pergunta
                    <textarea rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={loading || question.trim().length < 5}>
                    {loading ? "A responder..." : "Responder"}
                </button>
            </form>
            {answer ? (
                <div className="space-y-2 text-sm">
                    <p className="whitespace-pre-line text-slate-800">{answer.answer}</p>
                    {answer.suggestedNextSteps.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-5">
                            {answer.suggestedNextSteps.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : null}
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

- Pedido válido para `POST /api/ai/adaptive-explanations` devolve `201 Created` com explicação adaptada e citações.
- Pedido sem sessão devolve `401 Unauthorized`.
- Pedido com dados inválidos devolve `400 Bad Request`.
- Pedido sem ownership, membership ou fonte autorizada devolve `403 Forbidden`, `404 Not Found` ou `422 Unprocessable Entity`.
- O frontend mostra loading, erro, vazio e sucesso sem guardar tokens.

##### Critérios de aceite mensuráveis

- O guia usa linguagem pedagógica final e evita referências a processos internos de revisão.
- Todos os passos têm os pontos 1 a 7 e localização concreta.
- O endpoint `POST /api/ai/adaptive-explanations` está alinhado entre controller e cliente frontend.
- O backend valida sessão antes de usar dados do actor.
- O service valida ownership ou membership com services herdados.
- O código TypeScript/TSX tem JSDoc nas declarações relevantes.
- O handoff para `BK-MF3-05` fica claro.

#### Validação final

##### Smoke test

```bash
curl -i -X POST http://localhost:3000/api/ai/adaptive-explanations \
  -H 'Content-Type: application/json' \
  -d '{ "studyAreaId": "area_123", "question": "Explica derivadas ao meu ritmo." }'
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
- Referência ao requisito `RF40` e ao próximo BK `BK-MF3-05`.

#### Handoff

- Este BK entrega `AdaptiveExplanationsModule`, `AdaptiveExplanationsService`, `AdaptiveExplanationsController` e cliente frontend tipado.
- O próximo BK é `BK-MF3-05`.
- A equipa deve partir dos nomes exactos deste guia para evitar drift de imports.
- Se algum service herdado tiver assinatura diferente na implementação real, ajusta a chamada no PR e regista a diferença no relatório técnico.

#### Changelog

- `2026-06-16`: contratos de autenticação, rotas, imports e caminhos alinhados com `real_dev`.
- `2026-06-13`: versão pedagógica inicial com tutorial linear e código integrado por passo.
