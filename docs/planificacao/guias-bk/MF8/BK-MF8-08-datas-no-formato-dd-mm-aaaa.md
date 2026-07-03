# BK-MF8-08 - Datas no formato dd/mm/aaaa.

## Header

- `doc_id`: `GUIA-BK-MF8-08`
- `bk_id`: `BK-MF8-08`
- `macro`: `MF8`
- `owner`: `Daniel`
- `apoio`: `Kaua`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF43`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-09`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `last_updated`: `2026-07-02`

#### Objetivo

Neste BK vais centralizar a formatação das datas visíveis em português de Portugal, no formato `dd/mm/aaaa`, sem alterar os valores ISO que a API guarda e envia. A API continua a tratar datas como dados técnicos; a interface transforma esses dados em texto legível para alunos, professores e banca.

#### Importância

`RNF43` é CANONICO na planificação StudyFlow: as datas visíveis devem aparecer no formato `dd/mm/aaaa`. Esta regra parece pequena, mas protege a coerência da experiência final. Se cada componente formatar datas de maneira diferente, a app parece inacabada e a defesa fica mais frágil.

Este BK também evita um erro técnico comum: formatar datas no backend e quebrar contratos HTTP. O backend deve continuar a devolver datas serializáveis em ISO; a localização acontece na camada de apresentação.

#### Scope-in

- Confirmar metadados canónicos de `BK-MF8-08` em matriz, backlog e contrato de campos.
- Criar `formatDatePt(...)` como helper frontend partilhado.
- Tipar o histórico de estudo no cliente web, removendo `unknown[]` da página de histórico.
- Integrar `formatDatePt(...)` em `StudyHistoryList.tsx`.
- Provar que `HistoryService` preserva `occurredAt` como `Date`/ISO serializável.
- Criar uma validação Playwright focada para data válida, data inválida e renderização `dd/mm/aaaa`.
- Rever superfícies visíveis de data no MVP e marcar o que fica dentro desta entrega.
- Recolher evidence sem cookies, tokens, prompts privados, respostas IA completas ou dados pessoais reais.

#### Scope-out

- Alterar IDs, owners, prioridades, esforço, sprint, RF/RNF, dependências ou ordem dos BKs.
- Criar endpoint novo para localização de datas.
- Formatar datas no backend para `dd/mm/aaaa`.
- Alterar persistência, schemas ou migrations por causa de apresentação.
- Corrigir todas as páginas futuras de i18n; isso fica para `BK-MF8-09`.
- Prometer bibliotecas de tradução, RAG, embeddings, OCR, automação externa ou integrações não previstas.
- Guardar tokens, cookies, prompts privados, respostas IA privadas completas, materiais privados ou dados pessoais em logs/evidence.

#### Estado antes e depois

- Estado antes: `BK-MF8-07` deixa a exportação de artefactos fechada, mas as datas visíveis ainda podem aparecer formatadas inline em várias superfícies, sem helper partilhado e sem prova clara de que a API preserva ISO.
- Estado depois: `BK-MF8-08` entrega um helper frontend reutilizável, remove `unknown[]` do histórico, mostra a integração completa em `StudyHistoryList.tsx`, prova no backend que `occurredAt` continua técnico e deixa validação Playwright focada para `dd/mm/aaaa`.

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `apps/api/src/modules/study/dto/study-event.dto.ts`
- `apps/api/src/modules/study/history.service.ts`
- `apps/api/src/modules/study/history.service.spec.ts`
- `apps/api/src/modules/study/schemas/study-event.schema.ts`
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/components/study/StudyHistoryList.tsx`
- `apps/web/src/pages/student/StudyHistoryPage.tsx`
- `apps/web/src/pages/student/RoutinesPage.tsx`
- `apps/web/playwright.config.ts`

#### Glossário

- **Data ISO:** representação técnica e interoperável de data, como `2026-01-01T10:00:00.000Z`.
- **Data localizada:** data mostrada ao utilizador no formato esperado pela língua e contexto, aqui `dd/mm/aaaa`.
- **Contrato HTTP:** formato que frontend e backend combinam entre si; neste BK continua a usar datas técnicas, não texto localizado.
- **Helper frontend:** função pequena e reutilizável que evita repetir a mesma regra em vários componentes.
- **Histórico de estudo:** lista privada de eventos do aluno autenticado, criada em fases anteriores.
- **Evidence:** prova objetiva de execução, sem dados sensíveis, que pode ser usada em PR e defesa.
- **Handoff:** contrato que este BK deixa pronto para o BK seguinte.

#### Conceitos teóricos essenciais

- **Localização de datas:** é a adaptação da data para o formato visível ao utilizador. Vem de `RNF43`, entra neste BK como helper frontend e segue para `BK-MF8-09` como base de preparação i18n.
- **Separação entre dado e apresentação:** a API devolve um valor técnico estável; a UI decide como o mostrar. Isto evita que outro consumidor da API receba `01/01/2026` quando precisa de ISO para ordenar, comparar ou serializar.
- **DTO de histórico:** descreve o evento devolvido pela API. O campo `occurredAt` continua a representar uma data técnica; o frontend tipa esse campo como `string` porque recebe JSON.
- **Componente React:** recebe props tipadas e renderiza UI previsível. Aqui, `StudyHistoryList` deixa de fazer cast local e passa a receber `StudyHistoryEvent[]`.
- **Teste backend:** prova que a regra técnica não foi quebrada. Neste BK, o Jest confirma que `HistoryService` preserva a data como `Date` e permite ISO.
- **Teste Playwright:** valida comportamento visível e função frontend sem instalar runner novo. A app já usa Playwright no frontend, por isso este BK aproveita a ferramenta existente.
- **Privacidade:** datas de histórico pertencem ao aluno autenticado. O BK não altera ownership; apenas garante que a data já autorizada é mostrada de forma coerente.

#### Arquitetura do BK

- Requisito canónico: `RNF43`.
- Endpoint/contrato principal: `GET /api/study/history`; sem endpoint novo.
- Backend: manter `occurredAt` como `Date`/ISO serializável em `HistoryService`.
- Frontend:
  - `apps/web/src/lib/format-date-pt.ts` centraliza a formatação.
  - `apps/web/src/lib/apiClient.ts` expõe `StudyHistoryEvent` e `listStudyHistory(): Promise<StudyHistoryEvent[]>`.
  - `apps/web/src/pages/student/StudyHistoryPage.tsx` deixa de guardar `unknown[]`.
  - `apps/web/src/components/study/StudyHistoryList.tsx` usa `formatDatePt(...)`.
- Testes:
  - Jest no backend para preservação ISO.
  - Playwright no frontend para helper, fallback e renderização `dd/mm/aaaa`.
- Superfícies visíveis mínimas desta entrega:
  - `StudyHistoryList.tsx`: dentro do BK, porque mostra `occurredAt`.
  - `RoutinesPage.tsx`: rever e registar como candidato a reutilização do helper se a página já estiver no PR do aluno.
  - `study-alerts.service.ts`: fora da alteração principal, porque é backend e já devolve texto de alerta; não deve passar a formatar contratos HTTP deste BK.
- Decisão CANONICO: manter `BK-MF8-08`, `RNF43`, owner `Daniel`, apoio `Kaua`, prioridade `P0`, esforço `M`, sprint `S12`, dependências `-`, próximo BK `BK-MF8-09`.
- Decisões DERIVADO:
  - formatar apenas na UI para não quebrar persistência nem contratos HTTP;
  - usar `Europe/Lisbon` na apresentação controlada;
  - validar frontend com Playwright porque o `apps/web` já tem Playwright e não tem runner unitário próprio.
- Handoff: `BK-MF8-09` pode reutilizar a separação entre chaves/mensagens visíveis e dados técnicos.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/lib/format-date-pt.ts`
- CRIAR: `apps/web/tests/e2e/mf8-date-format.spec.ts`
- EDITAR: `apps/web/src/lib/apiClient.ts`
- EDITAR: `apps/web/src/components/study/StudyHistoryList.tsx`
- EDITAR: `apps/web/src/pages/student/StudyHistoryPage.tsx`
- EDITAR: `apps/api/src/modules/study/history.service.spec.ts`
- REVER: `apps/api/src/modules/study/dto/study-event.dto.ts`
- REVER: `apps/api/src/modules/study/history.service.ts`
- REVER: `apps/api/src/modules/study/schemas/study-event.schema.ts`
- REVER: `apps/web/src/pages/student/RoutinesPage.tsx`
- REVER: `apps/api/src/modules/study-alerts/study-alerts.service.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF8-08` entrega `RNF43` sem alterar a ordem dos BKs nem criar requisito novo.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: linha de `RNF43` e linha de `BK-MF8-08`.

3. Instruções do que fazer.

Confirma estes valores e não os alteres:

- `bk_id`: `BK-MF8-08`
- `rf_rnf`: `RNF43`
- `owner`: `Daniel`
- `apoio`: `Kaua`
- `prioridade`: `P0`
- `esforco`: `M`
- `sprint`: `S12`
- `dependencias`: `-`
- `proximo_bk`: `BK-MF8-09`

Regista como `DERIVADO` apenas as decisões técnicas de apresentação: frontend formata, backend preserva ISO, Playwright valida a UI.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e fixa fronteiras antes de mexer em ficheiros.

5. Explicação do código.

Não há código porque a entrega deste passo é a confirmação do contrato. Isto evita que o aluno transforme `RNF43` numa alteração global de backend ou numa mudança de dados persistidos.

6. Validação do passo.

Resultado esperado: matriz, backlog e contrato de campos continuam alinhados com `RNF43`, `S12` e `BK-MF8-09`.

7. Cenário negativo/erro esperado.

Se algum documento canónico apontar para outro RNF, sprint ou owner, pára a correção e regista `BLOQUEADO_POR_CONTRATO` no relatório da MF8.


### Passo 2 - Inventariar superfícies de data

1. Objetivo funcional do passo no contexto da app.

Mapear onde a app já mostra datas para corrigir a superfície mínima sem criar alterações fora do escopo.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/components/study/StudyHistoryList.tsx`
    - REVER: `apps/web/src/pages/student/StudyHistoryPage.tsx`
    - REVER: `apps/web/src/pages/student/RoutinesPage.tsx`
    - REVER: `apps/api/src/modules/study-alerts/study-alerts.service.ts`
    - REVER: `apps/api/src/modules/study/history.service.ts`
    - LOCALIZAÇÃO: funções que usam `occurredAt`, `targetDate`, `toLocaleDateString` ou `Intl.DateTimeFormat`.

3. Instruções do que fazer.

Cria este inventário no teu PR:

- `StudyHistoryList.tsx`: corrigir neste BK, porque mostra `occurredAt` do histórico.
- `StudyHistoryPage.tsx`: corrigir neste BK, porque passa os eventos para a lista.
- `apiClient.ts`: corrigir neste BK, porque hoje `listStudyHistory()` devolve lista sem tipo específico.
- `RoutinesPage.tsx`: rever; pode reutilizar `formatDatePt(...)` se a alteração ficar no mesmo PR sem aumentar risco.
- `study-alerts.service.ts`: rever; não mudar para `dd/mm/aaaa` no contrato HTTP deste BK se isso transformar dados técnicos em texto.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é analítico: fecha o inventário antes da implementação.

5. Explicação do código.

Não há código porque o objetivo é impedir alterações aleatórias. O aluno precisa de saber qual superfície é obrigatória e qual fica apenas registada para evolução.

6. Validação do passo.

Resultado esperado: o PR menciona as superfícies revistas e justifica por que `StudyHistoryList.tsx` é a integração obrigatória deste BK.

7. Cenário negativo/erro esperado.

Se encontrares uma página crítica da defesa a mostrar data em formato diferente, adiciona-a ao PR ou marca risco residual no relatório. Não alteres ficheiros fora do escopo sem autorização.


### Passo 3 - Criar helper partilhado de datas

1. Objetivo funcional do passo no contexto da app.

Criar a unidade técnica que transforma datas técnicas em `dd/mm/aaaa` para texto visível.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/format-date-pt.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. Não importes bibliotecas novas; `Intl.DateTimeFormat` já existe no browser moderno e no Node usado pelos testes.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/format-date-pt.ts
const PT_DATE_FORMATTER = new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Lisbon",
});

/**
 * Formata uma data técnica para apresentação curta em português de Portugal.
 *
 * @param value Data ISO, `Date` ou valor vazio vindo de um contrato já autorizado.
 * @returns Data em `dd/mm/aaaa`, `Data indisponível` ou `Data inválida`.
 */
export function formatDatePt(value: string | Date | null | undefined): string {
    if (value === null || value === undefined || value === "") {
        return "Data indisponível";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Data inválida";
    }

    // A API continua a transportar ISO; esta função só altera a apresentação visível.
    // Centralizar o formatter impede pequenas diferenças entre páginas da mesma app.
    return PT_DATE_FORMATTER.format(date);
}
```

5. Explicação do código.

O ficheiro cria um formatter único para o frontend. Existe neste BK porque `RNF43` pede datas visíveis em `dd/mm/aaaa`, mas a API não deve passar a devolver texto localizado. A função recebe `string`, `Date`, `null` ou `undefined`, valida se existe valor, valida se a data é real e só depois devolve a data formatada.

O comentário dentro do código marca a invariante mais importante: ISO continua a ser contrato técnico; `dd/mm/aaaa` é apresentação. Isto evita bugs em ordenação, filtros, persistência e integração com outros consumidores da API.

6. Validação do passo.

Resultado esperado: `formatDatePt("2026-01-01T10:00:00.000Z")` devolve `01/01/2026`; `formatDatePt("abc")` devolve `Data inválida`; `formatDatePt(undefined)` devolve `Data indisponível`.

7. Cenário negativo/erro esperado.

Se alguém trocar o helper para devolver o valor original em caso inválido, o utilizador pode ver texto técnico confuso. Mantém uma mensagem PT-PT clara para fallback.


### Passo 4 - Tipar cliente e preservar ISO no backend

1. Objetivo funcional do passo no contexto da app.

Garantir que o frontend consome histórico com tipo explícito e que o backend continua a devolver uma data técnica serializável.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/lib/apiClient.ts`
    - EDITAR: `apps/api/src/modules/study/history.service.spec.ts`
    - REVER: `apps/api/src/modules/study/history.service.ts`
    - REVER: `apps/api/src/modules/study/dto/study-event.dto.ts`
    - LOCALIZAÇÃO: tipo `StudyHistoryEvent`, função `listStudyHistory` e suite `HistoryService`.

3. Instruções do que fazer.

No cliente web, adiciona o tipo `StudyHistoryEvent` e altera `listStudyHistory()` para devolver `Promise<StudyHistoryEvent[]>`. No backend, acrescenta uma prova ao teste de histórico para confirmar que `occurredAt` continua como `Date` e pode ser serializado para ISO.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/apiClient.ts
/**
 * Evento de histórico devolvido pela API de estudo.
 *
 * `occurredAt` chega ao browser como string ISO porque atravessa JSON.
 */
export type StudyHistoryEvent = {
    id: string;
    type:
        | "ROUTINE_CREATED"
        | "ROUTINE_ARCHIVED"
        | "GOAL_CREATED"
        | "GOAL_UPDATED"
        | "GOAL_ARCHIVED"
        | "STUDY_AREA_CREATED"
        | "MATERIAL_SUBMITTED"
        | "AI_PROFILE_CREATED"
        | "SUMMARY_GENERATED"
        | "STUDY_TOOL_GENERATED"
        | "ADAPTIVE_EXPLANATION_GENERATED"
        | "QUIZ_ATTEMPT_RECORDED";
    title: string;
    description?: string;
    occurredAt?: string;
};

/**
 * Lista eventos recentes de estudo do aluno autenticado.
 *
 * @returns Histórico privado do aluno com datas ISO serializadas.
 */
export function listStudyHistory(): Promise<StudyHistoryEvent[]> {
    // O requestJson já usa credentials include; o frontend não envia userId manualmente.
    return requestJson<StudyHistoryEvent[]>("/api/study/history");
}
```

```ts
// apps/api/src/modules/study/history.service.spec.ts
/**
 * Testa o comportamento de study e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { Types } from "mongoose";
import { HistoryQueryDto } from "./dto/history-query.dto.js";
import { StudyEventDto, StudyEventType } from "./dto/study-event.dto.js";
import { HistoryService } from "./history.service.js";

type StudyHistoryFixture = {
    _id: Types.ObjectId;
    type: StudyEventType;
    title: string;
    description?: string;
    occurredAt: Date;
};

describe("HistoryService", () => {
    const userId = "507f1f77bcf86cd799439012";

    /**
     * Cria um modelo Mongoose controlado para testar o service sem base de dados real.
     *
     * @param events Eventos devolvidos pela query `lean`.
     * @returns Modelo mínimo e spies usados nas asserções.
     */
    function makeModel(events: StudyHistoryFixture[] = []) {
        const lean = jest.fn().mockResolvedValue(events);
        const limit = jest.fn().mockReturnValue({ lean });
        const sort = jest.fn().mockReturnValue({ limit });
        const find = jest.fn().mockReturnValue({ sort });
        return { model: { find }, find, sort, limit, lean };
    }

    it("usa limite default 50 quando não é passado limit", async () => {
        const event: StudyHistoryFixture = {
            _id: new Types.ObjectId(),
            type: "ROUTINE_CREATED",
            title: "Rotina criada",
            description: "Matemática",
            occurredAt: new Date("2026-01-01T10:00:00.000Z"),
        };
        const { model, limit } = makeModel([event]);
        const service = new HistoryService(model as never);

        await expect(service.listMyEvents(userId)).resolves.toEqual([
            {
                id: String(event._id),
                type: event.type,
                title: event.title,
                description: event.description,
                occurredAt: event.occurredAt,
            },
        ]);
        expect(limit).toHaveBeenCalledWith(50);
    });

    it("preserva occurredAt como data técnica serializável para ISO", async () => {
        const occurredAt = new Date("2026-01-01T10:00:00.000Z");
        const event: StudyHistoryFixture = {
            _id: new Types.ObjectId(),
            type: "STUDY_AREA_CREATED",
            title: "Área criada",
            occurredAt,
        };
        const { model } = makeModel([event]);
        const service = new HistoryService(model as never);

        const [result] = await service.listMyEvents(userId);

        // O backend preserva a data técnica; a UI decide como a apresentar.
        expect(result).toMatchObject<Partial<StudyEventDto>>({
            title: "Área criada",
            occurredAt,
        });
        expect(result?.occurredAt.toISOString()).toBe("2026-01-01T10:00:00.000Z");
    });

    it("aplica o limit validado recebido pelo controller", async () => {
        const { model, limit } = makeModel();
        const service = new HistoryService(model as never);

        await service.listMyEvents(userId, 30);

        expect(limit).toHaveBeenCalledWith(30);
    });

    it("valida query limit como inteiro entre 1 e 50", async () => {
        const pipe = new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        });

        await expect(
            pipe.transform(
                { limit: "30" },
                { type: "query", metatype: HistoryQueryDto },
            ),
        ).resolves.toMatchObject({ limit: 30 });
        await expect(
            pipe.transform(
                { limit: "51" },
                { type: "query", metatype: HistoryQueryDto },
            ),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
```

5. Explicação do código.

O tipo `StudyHistoryEvent` remove a lista sem forma definida do cliente web. Isto ajuda `StudyHistoryPage` e `StudyHistoryList` a saberem que `occurredAt` chega como string ISO e deve ser formatado só na UI.

O teste backend prova a outra metade do contrato: `HistoryService` mantém `occurredAt` como data técnica. A serialização para ISO continua possível, por isso filtros, ordenação e consumidores da API não ficam dependentes de texto localizado.

6. Validação do passo.

Executa no backend:

```bash
npm --prefix apps/api run test -- history.service.spec.ts
```

Resultado esperado: a suite passa e o teste `preserva occurredAt como data técnica serializável para ISO` confirma `2026-01-01T10:00:00.000Z`.

7. Cenário negativo/erro esperado.

Se o service devolver `01/01/2026` no campo `occurredAt`, o teste deve falhar. Esse erro significa que a camada errada ficou responsável pela localização.


### Passo 5 - Integrar histórico de estudo na UI

1. Objetivo funcional do passo no contexto da app.

Mostrar datas em `dd/mm/aaaa` na lista de histórico sem casts locais nem formatação inline.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/pages/student/StudyHistoryPage.tsx`
    - EDITAR: `apps/web/src/components/study/StudyHistoryList.tsx`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Substitui a página e o componente pelas versões abaixo. A página fica responsável por carregar dados tipados; a lista fica responsável por renderizar cada evento com `formatDatePt(...)`.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/student/StudyHistoryPage.tsx
/**
 * Implementa a página de histórico do aluno com dados tipados.
 */
import { useEffect, useState } from "react";
import { StudyHistoryList } from "../../components/study/StudyHistoryList.js";
import { listStudyHistory, type StudyHistoryEvent } from "../../lib/apiClient.js";

/**
 * Página do histórico de estudo.
 *
 * @returns Histórico pessoal do aluno autenticado.
 */
export function StudyHistoryPage() {
    const [events, setEvents] = useState<StudyHistoryEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadHistory(): Promise<void> {
            try {
                // O pedido usa a sessão HttpOnly existente; a página não envia userId.
                setEvents(await listStudyHistory());
            } catch (caught) {
                setError(caught instanceof Error ? caught.message : "Não foi possível carregar o histórico.");
            } finally {
                setLoading(false);
            }
        }

        void loadHistory();
    }, []);

    if (loading) {
        return <p className="text-sm text-slate-600">A carregar histórico...</p>;
    }

    return (
        <section className="sf-panel space-y-4">
            <h1 className="text-xl font-bold">Histórico</h1>
            {error ? <p className="sf-error">{error}</p> : null}
            <StudyHistoryList events={events} />
        </section>
    );
}
```

```tsx
// apps/web/src/components/study/StudyHistoryList.tsx
/**
 * Renderiza eventos de histórico de estudo com datas localizadas.
 */
import type { StudyHistoryEvent } from "../../lib/apiClient.js";
import { formatDatePt } from "../../lib/format-date-pt.js";

type StudyHistoryListProps = {
    events: StudyHistoryEvent[];
};

/**
 * Lista eventos de histórico de estudo.
 *
 * @param props Eventos carregados da API para o aluno autenticado.
 * @returns Lista visual do histórico.
 */
export function StudyHistoryList({ events }: StudyHistoryListProps) {
    if (events.length === 0) {
        return <p className="text-sm text-slate-600">Ainda não há eventos.</p>;
    }

    return (
        <ul className="space-y-3">
            {events.map((event) => (
                <li className="rounded-md border border-slate-200 p-3" key={event.id}>
                    <p className="font-medium">{event.title}</p>
                    {event.description ? (
                        <p className="text-sm text-slate-600">{event.description}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-500">
                        {/* A data chega em ISO e só é localizada no último momento, junto da UI. */}
                        {formatDatePt(event.occurredAt)}
                    </p>
                </li>
            ))}
        </ul>
    );
}
```

5. Explicação do código.

`StudyHistoryPage` deixa de usar `unknown[]` e passa a guardar `StudyHistoryEvent[]`. Isto torna o contrato explícito e impede casts locais. A página também passa a mostrar `loading` e `error`, que são estados esperados numa UI real.

`StudyHistoryList` recebe eventos já tipados, usa `event.id` como `key` e chama `formatDatePt(event.occurredAt)`. A data continua a vir da API em ISO; só o texto mostrado ao utilizador muda. O comentário dentro do JSX explica a fronteira entre dado técnico e apresentação.

6. Validação do passo.

Resultado esperado: o histórico carrega, mostra "Ainda não há eventos." quando a lista está vazia e mostra datas como `01/01/2026` quando há `occurredAt`.

7. Cenário negativo/erro esperado.

Se `occurredAt` vier ausente, a UI mostra `Data indisponível`. Se vier inválido, mostra `Data inválida`. Não deves esconder estes casos com string vazia, porque a defesa precisa de comportamento observável.


### Passo 6 - Criar validação Playwright de data visível

1. Objetivo funcional do passo no contexto da app.

Validar a regra frontend sem adicionar Vitest ou outro runner ao `apps/web`.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/tests/e2e/mf8-date-format.spec.ts`
    - REVER: `apps/web/playwright.config.ts`
    - LOCALIZAÇÃO: ficheiro completo de teste.

3. Instruções do que fazer.

Cria um teste Playwright focado no helper. O teste importa a função real, confirma data válida, fallback inválido e renderização num elemento da página.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/tests/e2e/mf8-date-format.spec.ts
import { expect, test } from "@playwright/test";
import { formatDatePt } from "../../src/lib/format-date-pt.js";

test("MF8 datas: formata datas visíveis em dd/mm/aaaa", async ({ page }) => {
    const formatted = formatDatePt("2026-01-01T10:00:00.000Z");

    expect(formatted).toBe("01/01/2026");
    expect(formatDatePt("data-invalida")).toBe("Data inválida");
    expect(formatDatePt(undefined)).toBe("Data indisponível");

    await page.setContent(`
        <main>
            <p data-testid="study-date">${formatted}</p>
        </main>
    `);

    // A prova visual usa o mesmo texto que o utilizador vê na interface.
    await expect(page.getByTestId("study-date")).toHaveText("01/01/2026");
});
```

5. Explicação do código.

Este teste usa Playwright porque o frontend já o tem configurado. Não cria dependência nova e não depende de dados reais do aluno. Primeiro testa a função diretamente, depois coloca o valor numa página controlada e valida o texto visível.

O teste cobre caminho feliz, data inválida e data ausente. Isto fecha `RNF43` para a unidade partilhada e evita que o PR fique limitado a uma verificação manual.

6. Validação do passo.

Executa:

```bash
STUDYFLOW_E2E_START_SERVERS=false npm --prefix apps/web run test:e2e -- tests/e2e/mf8-date-format.spec.ts
```

Resultado esperado: o teste passa sem arrancar API/web, porque valida apenas o helper e uma renderização controlada.

7. Cenário negativo/erro esperado.

Se o helper devolver `1/1/2026`, `2026-01-01` ou a data original, o teste falha. A falha mostra que a UI ainda não cumpre `dd/mm/aaaa`.


### Passo 7 - Recolher evidence e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF8-08` com prova objetiva e handoff seguro para `BK-MF8-09`.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
    - REVER: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
    - LOCALIZAÇÃO: secções de validação final, evidence e handoff.

3. Instruções do que fazer.

Regista no PR ou evidence:

- comando backend executado;
- comando Playwright executado;
- expected result;
- observed result;
- negativo de data inválida;
- ficheiros alterados;
- confirmação de que a API continua a transportar ISO;
- impacto em `BK-MF8-09`.

Não incluas cookies, tokens, dados pessoais reais, prompts privados, respostas IA completas ou materiais privados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e fecha a rastreabilidade da entrega.

5. Explicação do código.

Não há código neste passo. A entrega é a prova de que a implementação ficou testável, compreensível e pronta para o BK seguinte.

6. Validação do passo.

Resultado esperado: evidence com `PASS` para backend ISO, `PASS` para Playwright de data visível e nota explícita de que `BK-MF8-09` pode partir de uma separação clara entre dados técnicos e texto localizado.

7. Cenário negativo/erro esperado.

Se algum comando falhar por ambiente, regista `BLOQUEADO` com erro observado. Se falhar por contrato ou código, corrige antes de marcar o BK como pronto.

#### Critérios de aceite

- Header e metadados iguais à matriz, backlog e contrato de campos.
- O BK entrega `RNF43` sem alterar requisitos fora do escopo.
- A API continua a devolver datas técnicas/ISO serializáveis.
- O frontend mostra datas visíveis em `dd/mm/aaaa`.
- `StudyHistoryPage` e `StudyHistoryList` deixam de depender de `unknown[]` e casts locais.
- O helper `formatDatePt(...)` cobre data válida, data inválida e data ausente.
- A validação usa ferramentas existentes: Jest no backend e Playwright no frontend.
- Evidence evita dados sensíveis, prompts privados e materiais completos.

#### Validação final

- Executar `npm --prefix apps/api run test -- history.service.spec.ts`.
- Executar `STUDYFLOW_E2E_START_SERVERS=false npm --prefix apps/web run test:e2e -- tests/e2e/mf8-date-format.spec.ts`.
- Executar `npm --prefix apps/web run build`.
- Executar `git diff --check`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`.
- Confirmar que não há caminhos privados em texto destinado aos alunos.

#### Evidence para PR/defesa

- `pr`: `RNF43` entregue com helper frontend, histórico tipado e prova de ISO no backend.
- `proof`: screenshot ou output Playwright com `01/01/2026`.
- `neg`: `Data inválida` e `Data indisponível` validadas no teste.
- `backend`: `HistoryService` preserva `occurredAt.toISOString()`.
- `privacy`: nenhum log/evidence inclui cookies, tokens ou dados privados completos.
- `handoff`: `BK-MF8-09` pode centralizar mensagens sem mexer no contrato técnico das datas.

#### Handoff

O próximo BK é `BK-MF8-09`. Ele pode assumir que `BK-MF8-08` deixou uma função partilhada para datas visíveis, manteve ISO na API e mostrou uma forma concreta de centralizar texto visível sem quebrar contratos técnicos.

#### Changelog

- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com estrutura completa, caminhos públicos, decisões CANONICO/DERIVADO, código integrado, validação por passo, negativos e handoff.
- `2026-07-02`: guia corrigido para fechar integração frontend, prova backend de ISO, validação Playwright e inventário mínimo de superfícies de data.
