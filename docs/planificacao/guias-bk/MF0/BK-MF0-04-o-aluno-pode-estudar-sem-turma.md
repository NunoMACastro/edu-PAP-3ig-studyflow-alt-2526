# BK-MF0-04 - O aluno pode estudar sem turma.

## Header

- `doc_id`: `GUIA-BK-MF0-04`
- `bk_id`: `BK-MF0-04`
- `macro`: `MF0`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `RF04`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-05`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-04-o-aluno-pode-estudar-sem-turma.md`
- `last_updated`: `2026-07-10`

## O que vamos fazer neste BK

Neste BK vamos garantir que o StudyFlow funciona para um aluno que ainda não pertence a nenhuma turma. A app deve permitir entrada no espaço individual, consulta do painel base e acesso às funcionalidades pessoais que serão construídas nos BKs seguintes.

O contrato técnico principal é simples: `className` ou `turmaId` não pode ser obrigatório para usar o modo individual. Se a implementação futura criar turmas reais, esse dado deve ser uma referência opcional por `ObjectId`, não uma pré-condição para estudar.

Como não há mockup para o dashboard do aluno, este BK deve criar uma interface funcional e simples, sem inventar identidade visual final. O mockup de login só orienta consistência de marca e navegação.

## Porque é que isto é importante

- Cumpre RF04 e evita bloquear alunos fora de turma.
- Define a fronteira entre modo individual e modo turma.
- Prepara rotas pessoais para rotinas, histórico, áreas e materiais.
- Evita uma dependência prematura de turmas, que só surgem em MF1.
- Reforça privacidade: aluno solo não deve ver dados de turmas ou colegas.

## O que entra (scope)

- Estado esperado antes do BK: aluno autenticado com perfil editável do BK-MF0-03.
- Estado esperado depois do BK: aluno sem turma acede a `/app/estudo` e vê estado inicial do modo individual.
- Ficheiros previstos neste BK:
    - `apps/api/src/modules/study/solo-study.controller.ts`
    - `apps/api/src/modules/study/solo-study.service.ts`
    - `apps/api/src/modules/study/dto/solo-study-state.dto.ts`
    - `apps/web/src/pages/student/SoloStudyDashboard.tsx`
    - `apps/web/src/routes/protectedRoutes.tsx`
    - `apps/web/src/components/layout/AppShell.tsx`
- Ficheiros a rever: `BK-MF0-02`, `BK-MF0-03`, `docs/RF.md`.
- Dependências de BK anteriores: usa sessão do BK-MF0-02 e perfil do BK-MF0-03.
- Impacto na arquitetura: cria domínio `study` para o modo individual.
- Impacto em frontend: cria primeira página protegida pós-login.
- Impacto em backend: cria endpoint derivado `GET /api/study/solo`.
- Impacto em dados: não cria dependência obrigatória de turma.
- Impacto em segurança: bloqueia acesso sem sessão e não mistura contextos de turma.
- Impacto em testes: exige smoke de aluno com `className` vazio.
- Handoff: BK-MF0-05 adiciona rotinas ao painel individual.

## O que não entra (scope-out)

- Criar áreas de estudo, que pertence ao BK-MF0-07.
- Criar turmas, disciplinas ou inscrição, que pertencem a MF1.
- Criar IA, resumos ou quizzes, que pertencem aos BKs MF0-10 a MF0-12.
- Criar métricas avançadas de progresso, que aparecem em fases posteriores.

## Como saber que isto ficou bem

- Um aluno com perfil sem turma entra no dashboard individual.
- A API devolve estado individual sem exigir `turmaId`.
- A UI mostra estado vazio útil: sem áreas, sem rotinas, sem materiais.
- As chamadas protegidas sem sessão devolvem `401`.
- Não há dados de turma, professor ou colegas nesta página.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `DONE` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Natalia` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-03` (CANONICO)
- Pre-condicoes: perfil pode existir com turma vazia (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-SOLO-STUDY`
- Fonte de verdade: `docs/RF.md`, `RF04` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-04` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Modo de estudo individual acessível sem turma (CANONICO)
- `rf_rnf`: `RF04` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar contrato de estado do modo individual.
- Criar endpoint `GET /api/study/solo`.
- Criar dashboard individual protegido.
- Mostrar empty states para áreas, rotinas e materiais.
- Garantir que turma é opcional.
- Separar dados pessoais de dados de turma.
- Preparar pontos de entrada para BK-MF0-05, BK-MF0-06 e BK-MF0-07.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF03, RF04, RF05, RF06, RF07.
- `docs/RNF.md`: RNF01, RNF02, RNF04, RNF20, RNF25, RNF26.
- BK-MF0-02: `SessionGuard`.
- BK-MF0-03: `StudentProfile`.
- `MF-VIEWS.md`: sequência MF0.
- Mockup: só referência de marca, sem ecrã de dashboard.

## Glossário (rápido) (DERIVADO):

- **Modo individual**: uso da app sem turma, professor ou colegas.
- **Empty state**: mensagem/estado quando ainda não há dados.
- **Dashboard**: ecrã inicial com atalhos e resumo do estado.
- **Contexto**: conjunto de dados usado para decidir o que o aluno pode ver.
- **Turma opcional**: perfil pode não ter turma associada.
- **Rota protegida**: página/API que exige autenticação.
- **Isolamento de dados**: garantir que aluno só vê dados do seu contexto.

## Conceitos teóricos essenciais (DERIVADO):

**Separação de contextos.** StudyFlow terá contexto individual, grupo e turma. Neste BK só existe contexto individual. Isto evita misturar dados de turmas antes de esse módulo existir.

**Empty states.** Um ecrã vazio não deve parecer erro. Se o aluno ainda não criou rotinas, áreas ou materiais, a UI deve mostrar mensagens simples e botões para as ações futuras.

**Autorização por sessão.** O endpoint usa o `userId` da sessão. O aluno não passa `userId` no URL, porque isso poderia permitir tentativa de acesso a dados de outros alunos.

**Design extensível.** Mesmo sem mockup para dashboard, a estrutura deve ter componentes reaproveitáveis: `AppShell`, cards simples e links para funcionalidades futuras.

## Guia linear de implementação

Segue estes passos por ordem. Como ainda não existe scaffold real no repositório, os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência, Redis para sessões quando necessário e OpenAI API apenas atrás de provider isolado. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis na MF0.

### Pré-requisitos concretos

- BK-MF0-02 com `SessionGuard`.
- BK-MF0-03 com `StudentProfileService`.
- Perfil pode ter `className: null`.
- Não existem ainda turmas oficiais; qualquer `classId`/`turmaId` é fora de escopo.

### Passo 1 - Criar DTO de estado individual

1. Explicação simples do objetivo.

    Neste passo vais criar DTO de estado individual. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study/dto/solo-study-state.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export type SoloStudyStateDto = {
    studentName: string;
    hasClass: boolean;
    className: string | null;
    studyAreasCount: number;
    routinesCount: number;
    materialsCount: number;
};
```

5. Explicação do código.

Este DTO é o contrato entre backend e dashboard. `hasClass: false` é um resultado válido.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 2 - Criar service do modo individual

1. Explicação simples do objetivo.

    Neste passo vais criar service do modo individual. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study/solo-study.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Injectable } from "@nestjs/common";
import { StudentProfileService } from "../students/student-profile.service";
import { SoloStudyStateDto } from "./dto/solo-study-state.dto";

@Injectable()
export class SoloStudyService {
    constructor(private readonly profileService: StudentProfileService) {}

    async getSoloStudyState(userId: string): Promise<SoloStudyStateDto> {
        const profile = await this.profileService.getMyProfile(userId);

        return {
            studentName: profile?.name ?? "Aluno",
            hasClass: Boolean(profile?.className),
            className: profile?.className ?? null,
            // Estes contadores começam a zero e serão ligados aos BKs seguintes.
            studyAreasCount: 0,
            routinesCount: 0,
            materialsCount: 0,
        };
    }
}
```

5. Explicação do código.

O service não procura turmas. Ele constrói um estado inicial útil mesmo para alunos sem turma ou sem dados.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 3 - Criar controller protegido

1. Explicação simples do objetivo.

    Neste passo vais criar controller protegido. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study/solo-study.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { SoloStudyService } from "./solo-study.service";

@Controller("api/study/solo")
@UseGuards(SessionGuard)
export class SoloStudyController {
    constructor(private readonly soloStudyService: SoloStudyService) {}

    @Get()
    async getSoloStudy(@Req() request: AuthenticatedRequest) {
        return this.soloStudyService.getSoloStudyState(request.user!.id);
    }
}
```

5. Explicação do código.

O endpoint usa apenas a sessão. Se alguém tentar enviar `userId` por query/body, isso é ignorado porque o controller não lê esses dados.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 4 - Criar módulo Study

1. Explicação simples do objetivo.

    Neste passo vais criar módulo Study. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study/study.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { StudentsModule } from "../students/students.module";
import { SoloStudyController } from "./solo-study.controller";
import { SoloStudyService } from "./solo-study.service";

@Module({
    imports: [AuthModule, StudentsModule],
    controllers: [SoloStudyController],
    providers: [SoloStudyService],
    exports: [SoloStudyService],
})
export class StudyModule {}
```

5. Explicação do código.

O módulo importa `StudentsModule` para consultar perfil, mas não importa nenhum módulo de turmas.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 5 - Editar cliente API

1. Explicação simples do objetivo.

    Neste passo vais editar cliente API. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/web/src/lib/apiClient.ts`
- LOCALIZAÇÃO: no fim do ficheiro.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export type SoloStudyState = {
    studentName: string;
    hasClass: boolean;
    className: string | null;
    studyAreasCount: number;
    routinesCount: number;
    materialsCount: number;
};

export async function getSoloStudyState(): Promise<SoloStudyState> {
    const response = await fetch("/api/study/solo", { credentials: "include" });
    if (response.status === 401)
        throw new Error("Inicia sessão para aceder ao teu estudo.");
    if (!response.ok)
        throw new Error("Não foi possível carregar o estudo individual.");
    return (await response.json()) as SoloStudyState;
}
```

5. Explicação do código.

Esta função carrega o estado do dashboard individual usando o cookie HttpOnly.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 6 - Criar AppShell

1. Explicação simples do objetivo.

    Neste passo vais criar AppShell. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/components/layout/AppShell.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b bg-white px-4 py-3">
                <strong className="text-slate-900">StudyFlow</strong>
            </header>
            <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
        </div>
    );
}
```

5. Explicação do código.

O layout é simples porque não há mockup final do dashboard. Ele cria uma base reutilizável sem inventar navegação avançada.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 7 - Criar dashboard individual

1. Explicação simples do objetivo.

    Neste passo vais criar dashboard individual. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/student/SoloStudyDashboard.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { getSoloStudyState, SoloStudyState } from "../../lib/apiClient";

export function SoloStudyDashboard() {
    const [state, setState] = useState<SoloStudyState | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getSoloStudyState()
            .then(setState)
            .catch((err) =>
                setError(
                    err instanceof Error
                        ? err.message
                        : "Erro ao carregar dashboard.",
                ),
            );
    }, []);

    if (error) {
        return (
            <AppShell>
                <p className="rounded bg-red-50 p-3 text-red-700">{error}</p>
            </AppShell>
        );
    }

    if (!state) {
        return (
            <AppShell>
                <p>A carregar o teu espaço de estudo...</p>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <h1 className="text-2xl font-semibold text-slate-900">
                O teu estudo
            </h1>
            <p className="mt-2 text-slate-600">
                {state.hasClass
                    ? `Turma: ${state.className}`
                    : "Podes estudar mesmo sem turma associada."}
            </p>
            <section className="mt-6 grid gap-4 md:grid-cols-3">
                <article className="rounded border bg-white p-4">
                    <h2 className="font-semibold">Áreas de estudo</h2>
                    <p>{state.studyAreasCount} criadas</p>
                </article>
                <article className="rounded border bg-white p-4">
                    <h2 className="font-semibold">Rotinas</h2>
                    <p>{state.routinesCount} ativas</p>
                </article>
                <article className="rounded border bg-white p-4">
                    <h2 className="font-semibold">Materiais</h2>
                    <p>{state.materialsCount} submetidos</p>
                </article>
            </section>
        </AppShell>
    );
}
```

5. Explicação do código.

O dashboard mostra empty states úteis. Ele não pede turma obrigatória e prepara espaço para BK-MF0-05, BK-MF0-07 e BK-MF0-08.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 8 - Criar rota protegida

1. Explicação simples do objetivo.

    Neste passo vais criar rota protegida. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/routes/protectedRoutes.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
import { ReactNode } from "react";
import { useSession } from "../hooks/useSession";

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useSession();

    if (isLoading) return <p>A validar sessão...</p>;
    if (!isAuthenticated) {
        window.location.assign("/login");
        return null;
    }

    return <>{children}</>;
}
```

5. Explicação do código.

Esta proteção é frontend apenas para experiência de navegação. A segurança real continua no backend com `SessionGuard`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

## Critérios de aceite

- Outputs:
    - Endpoint `GET /api/study/solo`.
    - Dashboard individual protegido.
    - Estado vazio para aluno novo.
- Verificações:
    - Aluno sem turma recebe `200`.
    - Sem sessão recebe `401`.
- Qualidade:
    - Não há dependência prematura de turmas.
    - Componentes preparam rotinas, histórico e áreas.
- Continuidade:
    - BK-MF0-05 reutiliza dashboard para rotinas.
    - BK-MF0-07 reutiliza contexto individual para áreas de estudo.
- Evidência:
    - Screenshot do dashboard vazio e output do teste com `hasClass: false`.

## Validação final

### Requests e responses esperados

```http
GET /api/study/solo
Cookie: sf_sid=<válido>
```

```http
200 OK

{
  "studentName": "Ana Silva",
  "hasClass": false,
  "className": null,
  "studyAreasCount": 0,
  "routinesCount": 0,
  "materialsCount": 0
}
```

Erros esperados:

- `401 UNAUTHENTICATED`: sem cookie ou sessão inválida.
- `200` com `hasClass: false`: aluno sem turma não é erro.

### Como validar o BK e cenários negativos

- Aluno autenticado com `className: null`: esperado `200`.
- Pedido sem cookie: esperado `401`.
- Pedido com `userId` no query: esperado ignorar query e devolver estado do dono da sessão.

## Evidence para PR/defesa

### Evidence executada em 2026-06-01

- `apps/api`: `npm test` -> PASS (19 suites, 68 tests).
- `apps/api`: `npm run build` -> PASS.
- `apps/web`: `npm run build` -> PASS.
- Testes negativos cobertos neste ciclo: `LOGIN_RATE_LIMITED`, resposta pública de materiais sem `storageKey`/`contentText`, `AI_EXECUTION_TIMEOUT`, `NO_PROCESSABLE_SOURCES`, execução IA não configurada e output IA inválido.
- Não executado neste ciclo: smoke manual/browser/e2e com MongoDB, Redis e OpenAI reais.

- Screenshot do dashboard com texto “Podes estudar mesmo sem turma associada.”
- Output `GET /api/study/solo -> 200` com `hasClass: false`.
- Output sem sessão `401`.

## Handoff para BK-MF0-05

- O card `Rotinas` passa de `0` para contador real quando BK-MF0-05 existir.
- O endpoint não deve ganhar dependência de turma nos próximos BKs.

## Changelog

- `2026-05-24`: guia refinado para modo individual sem turma, com endpoint, dashboard e negativos P0.
- `2026-05-25`: linguagem de persistência ajustada para MongoDB/Mongoose e referências opcionais.
