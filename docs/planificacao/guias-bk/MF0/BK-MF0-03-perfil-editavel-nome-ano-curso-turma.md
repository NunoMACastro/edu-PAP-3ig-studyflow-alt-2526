# BK-MF0-03 - Perfil editável (nome, ano, curso, turma).

## Header

- `doc_id`: `GUIA-BK-MF0-03`
- `bk_id`: `BK-MF0-03`
- `macro`: `MF0`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `DONE`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-02`
- `rf_rnf`: `RF03`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF0-04`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-03-perfil-editavel-nome-ano-curso-turma.md`
- `last_updated`: `2026-07-10`

## O que vamos fazer neste BK

Neste BK vamos permitir que o aluno autenticado consulte e edite o seu perfil com `nome`, `ano`, `curso` e `turma`. O perfil fica ligado ao `User` criado no registo e acedido através da sessão segura criada no login.

O campo `turma` deve ser opcional nesta fase, porque o RF04 exige que o aluno possa estudar sem turma. Isto é uma decisão importante de continuidade: não se deve bloquear a entrada do aluno na app por ainda não estar inscrito numa turma.

Como ainda não existe código, os caminhos indicados são uma proposta técnica compatível com a stack recomendada. O mockup só cobre autenticação, por isso os ecrãs de perfil devem usar placeholders simples e linguagem em português de Portugal.

## Porque é que isto é importante

- Dá contexto pessoal mínimo aos BKs seguintes.
- Prepara o estudo sem turma ao tornar `turma` opcional.
- Cria a primeira rota protegida reutilizando `SessionGuard`.
- Ensina a diferença entre identidade de conta e dados editáveis de perfil.
- Reduz risco de manipulação ao impedir que o aluno edite `role`, `id` ou dados de sessão.

## O que entra (scope)

- Estado esperado antes do BK: login funcional ou contrato de sessão definido no BK-MF0-02.
- Estado esperado depois do BK: aluno autenticado consegue ver e atualizar o próprio perfil.
- Ficheiros previstos neste BK:
    - `apps/api/src/modules/students/schemas/student-profile.schema.ts`
    - `apps/api/src/modules/students/student-profile.controller.ts`
    - `apps/api/src/modules/students/student-profile.service.ts`
    - `apps/api/src/modules/students/dto/update-student-profile.dto.ts`
    - `apps/web/src/pages/student/ProfilePage.tsx`
    - `apps/web/src/hooks/useSession.ts`
- Ficheiros a rever: `docs/RF.md`, `docs/RNF.md`, `BK-MF0-02`.
- Dependências de BK anteriores: `BK-MF0-02`, para obter o utilizador autenticado.
- Impacto na arquitetura: cria domínio `students` separado de `auth`.
- Impacto em frontend: cria formulário protegido de perfil.
- Impacto em backend: cria endpoints derivados `GET /api/students/me/profile` e `PATCH /api/students/me/profile`.
- Impacto em dados: cria `StudentProfile` ligado a `User`.
- Impacto em segurança: aluno só edita o próprio perfil.
- Impacto em testes: requer teste de rota protegida e validação de campos.
- Handoff: BK-MF0-04 deve usar `profile.turma` como opcional.

## O que não entra (scope-out)

- Criar turmas reais ou inscrição em turma, que ficam para MF1.
- Permitir editar email/password, porque pertence a auth/account settings futuros.
- Permitir editar role ou permissões.
- Criar dados académicos avançados, métricas ou preferências de IA.

## Como saber que isto ficou bem

- Aluno autenticado vê o próprio perfil.
- Atualização válida guarda `nome`, `ano`, `curso` e `turma` opcional.
- Pedido sem sessão devolve `401`.
- Tentativa de alterar `role` ou `userId` é ignorada ou rejeitada.
- Interface mostra estado de erro e sucesso sem perder dados do formulário.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P1` (CANONICO)
- Estado: `DONE` (CANONICO)
- Esforco: `S` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Guilherme` (CANONICO)
- Apoio: `Natalia` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-02` (CANONICO)
- Pre-condicoes: sessão segura ou contrato de sessão preparado (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Core` (CANONICO)
- Flow ID: `FLOW-MF0-STUDENT-PROFILE`
- Fonte de verdade: `docs/RF.md`, `RF03` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-03` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Perfil editável do aluno com turma opcional (CANONICO/DERIVADO)
- `rf_rnf`: `RF03` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelo `StudentProfile`.
- Criar DTO de atualização.
- Criar endpoints protegidos de leitura e atualização.
- Criar formulário de perfil no frontend.
- Garantir que `turma` é opcional.
- Bloquear edição de campos sensíveis.
- Preparar contrato para estudo individual sem turma.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF03 e RF04.
- `docs/RNF.md`: RNF06, RNF25, RNF26, RNF42.
- `BK-MF0-02`: sessão, cookie e `SessionGuard`.
- `BACKLOG-MVP.md`: linha `BK-MF0-03`.
- `MF-VIEWS.md`: sequência da MF0.
- Mockup: apenas para padrão visual geral de autenticação, sem ecrã de perfil.

## Glossário (rápido) (DERIVADO):

- **Perfil**: dados editáveis do aluno, diferentes da conta de autenticação.
- **Rota protegida**: endpoint que exige sessão válida.
- **`request.user`**: utilizador autenticado anexado pelo guard.
- **Campo opcional**: dado que pode ficar vazio sem bloquear o fluxo.
- **DTO de update**: contrato dos campos que podem ser alterados.
- **Mass assignment**: risco de aceitar campos que o utilizador não devia editar.
- **Estado local**: dados temporários do formulário no React.

## Conceitos teóricos essenciais (DERIVADO):

**Conta vs perfil.** A conta identifica o utilizador para login. O perfil descreve o aluno dentro da app. Separar estes conceitos evita que alterações simples ao perfil mexam em credenciais ou permissões.

**Rota protegida.** Este BK reutiliza `SessionGuard`: sem sessão, a API devolve `401`; com sessão válida, usa `request.user.id` para ler ou atualizar apenas o perfil do próprio aluno.

**Mass assignment.** Se o backend aceitar qualquer campo enviado pelo frontend, um atacante pode tentar alterar `role` ou `userId`. Por isso, o DTO deve aceitar só `name`, `year`, `course` e `className`.

**Validação no backend e frontend.** O frontend ajuda o aluno a corrigir erros rapidamente, mas a segurança está no backend. O backend valida mesmo quando a UI já validou.

## Guia linear de implementação

Segue estes passos por ordem. Como ainda não existe scaffold real no repositório, os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência, Redis para sessões quando necessário e OpenAI API apenas atrás de provider isolado. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis na MF0.

### Pré-requisitos concretos

- BK-MF0-01 implementado com `User`.
- BK-MF0-02 implementado com `SessionGuard`.
- `AuthModule` importado no módulo raiz ou no módulo que expõe `StudentsModule`.
- Turma continua opcional para não bloquear RF04.

### Passo 1 - Criar schema StudentProfile

1. Explicação simples do objetivo.

    Neste passo vais criar schema StudentProfile. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/students/schemas/student-profile.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudentProfileDocument = HydratedDocument<StudentProfile>;

@Schema({ timestamps: true, collection: "student_profiles" })
export class StudentProfile {
    // Cada perfil pertence a exatamente um User. Isto impede duplicados por aluno.
    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
    })
    userId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 120 })
    name!: string;

    @Prop({ trim: true, maxlength: 30 })
    year?: string;

    @Prop({ trim: true, maxlength: 120 })
    course?: string;

    // Turma é opcional para cumprir RF04: o aluno pode estudar sem turma.
    @Prop({ trim: true, maxlength: 80 })
    className?: string | null;
}

export const StudentProfileSchema =
    SchemaFactory.createForClass(StudentProfile);
```

5. Explicação do código.

O campo `className` não é obrigatório. Esta decisão é essencial para o BK-MF0-04.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 2 - Criar DTO de atualização

1. Explicação simples do objetivo.

    Neste passo vais criar DTO de atualização. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/students/dto/update-student-profile.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export class UpdateStudentProfileDto {
    name?: string;
    year?: string;
    course?: string;
    className?: string | null;
}
```

5. Explicação do código.

O DTO só inclui campos editáveis. `role`, `email`, `userId` e permissões ficam fora para evitar mass assignment.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 3 - Criar service de perfil

1. Explicação simples do objetivo.

    Neste passo vais criar service de perfil. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/students/student-profile.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateStudentProfileDto } from "./dto/update-student-profile.dto";
import {
    StudentProfile,
    StudentProfileDocument,
} from "./schemas/student-profile.schema";

const ALLOWED_FIELDS = ["name", "year", "course", "className"];

@Injectable()
export class StudentProfileService {
    constructor(
        @InjectModel(StudentProfile.name)
        private readonly profileModel: Model<StudentProfileDocument>,
    ) {}

    async getMyProfile(userId: string) {
        return this.profileModel
            .findOne({ userId: new Types.ObjectId(userId) })
            .lean()
            .exec();
    }

    async updateMyProfile(userId: string, input: UpdateStudentProfileDto) {
        this.assertNoForbiddenFields(input);
        const update = this.cleanProfileInput(input);

        if (!update.name) {
            throw new BadRequestException({
                code: "PROFILE_NAME_REQUIRED",
                message: "Indica o teu nome.",
            });
        }

        return this.profileModel
            .findOneAndUpdate(
                { userId: new Types.ObjectId(userId) },
                { $set: update },
                { new: true, upsert: true, runValidators: true },
            )
            .lean()
            .exec();
    }

    private assertNoForbiddenFields(input: Record<string, unknown>): void {
        const forbidden = Object.keys(input).filter(
            (key) => !ALLOWED_FIELDS.includes(key),
        );
        if (forbidden.length > 0) {
            throw new BadRequestException({
                code: "FORBIDDEN_PROFILE_FIELD",
                message: `Campo não editável: ${forbidden[0]}.`,
            });
        }
    }

    private cleanProfileInput(
        input: UpdateStudentProfileDto,
    ): UpdateStudentProfileDto {
        return {
            name: input.name?.trim(),
            year: input.year?.trim(),
            course: input.course?.trim(),
            className: input.className ? input.className.trim() : null,
        };
    }
}
```

5. Explicação do código.

O service cria ou atualiza o perfil do próprio aluno. O filtro usa `userId` da sessão, por isso o aluno não consegue editar o perfil de outra pessoa.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 4 - Criar controller protegido

1. Explicação simples do objetivo.

    Neste passo vais criar controller protegido. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/students/student-profile.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { UpdateStudentProfileDto } from "./dto/update-student-profile.dto";
import { StudentProfileService } from "./student-profile.service";

@Controller("api/students/me/profile")
@UseGuards(SessionGuard)
export class StudentProfileController {
    constructor(private readonly profileService: StudentProfileService) {}

    @Get()
    async getProfile(@Req() request: AuthenticatedRequest) {
        return this.profileService.getMyProfile(request.user!.id);
    }

    @Patch()
    async updateProfile(
        @Req() request: AuthenticatedRequest,
        @Body() body: UpdateStudentProfileDto,
    ) {
        return this.profileService.updateMyProfile(request.user!.id, body);
    }
}
```

5. Explicação do código.

O controller aplica `SessionGuard` uma vez na classe inteira. Sem sessão, os dois endpoints devolvem `401`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 5 - Criar módulo students

1. Explicação simples do objetivo.

    Neste passo vais criar módulo students. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/students/students.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import {
    StudentProfile,
    StudentProfileSchema,
} from "./schemas/student-profile.schema";
import { StudentProfileController } from "./student-profile.controller";
import { StudentProfileService } from "./student-profile.service";

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: StudentProfile.name, schema: StudentProfileSchema },
        ]),
    ],
    controllers: [StudentProfileController],
    providers: [StudentProfileService],
    exports: [StudentProfileService],
})
export class StudentsModule {}
```

5. Explicação do código.

O módulo importa `AuthModule` para conseguir usar `SessionGuard`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 6 - Editar cliente API

1. Explicação simples do objetivo.

    Neste passo vais editar cliente API. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/web/src/lib/apiClient.ts`
- LOCALIZAÇÃO: no fim do ficheiro.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export type StudentProfile = {
    id?: string;
    name: string;
    year?: string;
    course?: string;
    className?: string | null;
};

export async function getMyProfile(): Promise<StudentProfile | null> {
    const response = await fetch("/api/students/me/profile", {
        credentials: "include",
    });
    if (response.status === 401)
        throw new Error("Inicia sessão para editar o perfil.");
    if (!response.ok) throw new Error("Não foi possível carregar o perfil.");
    return (await response.json()) as StudentProfile | null;
}

export async function updateMyProfile(
    payload: StudentProfile,
): Promise<StudentProfile> {
    const response = await fetch("/api/students/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok)
        throw new Error(data?.message ?? "Não foi possível guardar o perfil.");
    return data as StudentProfile;
}
```

5. Explicação do código.

Estas funções mantêm a sessão via cookie e não aceitam `userId`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 7 - Criar página de perfil

1. Explicação simples do objetivo.

    Neste passo vais criar página de perfil. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/student/ProfilePage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
import { FormEvent, useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../../lib/apiClient";

export function ProfilePage() {
    const [name, setName] = useState("");
    const [year, setYear] = useState("");
    const [course, setCourse] = useState("");
    const [className, setClassName] = useState("");
    const [feedback, setFeedback] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMyProfile()
            .then((profile) => {
                if (!profile) return;
                setName(profile.name ?? "");
                setYear(profile.year ?? "");
                setCourse(profile.course ?? "");
                setClassName(profile.className ?? "");
            })
            .catch((err) =>
                setError(
                    err instanceof Error
                        ? err.message
                        : "Erro ao carregar perfil.",
                ),
            );
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setFeedback(null);

        try {
            await updateMyProfile({
                name,
                year,
                course,
                className: className || null,
            });
            setFeedback("Perfil guardado com sucesso.");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Erro ao guardar perfil.",
            );
        }
    }

    return (
        <main className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="text-2xl font-semibold text-slate-900">
                O meu perfil
            </h1>
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-1">
                    Nome
                    <input
                        className="rounded border px-3 py-2"
                        onChange={(event) => setName(event.target.value)}
                        required
                        value={name}
                    />
                </label>
                <label className="flex flex-col gap-1">
                    Ano
                    <input
                        className="rounded border px-3 py-2"
                        onChange={(event) => setYear(event.target.value)}
                        value={year}
                    />
                </label>
                <label className="flex flex-col gap-1">
                    Curso
                    <input
                        className="rounded border px-3 py-2"
                        onChange={(event) => setCourse(event.target.value)}
                        value={course}
                    />
                </label>
                <label className="flex flex-col gap-1">
                    Turma (opcional)
                    <input
                        className="rounded border px-3 py-2"
                        onChange={(event) => setClassName(event.target.value)}
                        value={className}
                    />
                </label>
                {error && (
                    <p className="rounded bg-red-50 p-3 text-red-700">
                        {error}
                    </p>
                )}
                {feedback && (
                    <p className="rounded bg-green-50 p-3 text-green-700">
                        {feedback}
                    </p>
                )}
                <button
                    className="rounded bg-slate-900 px-4 py-2 text-white"
                    type="submit"
                >
                    Guardar perfil
                </button>
            </form>
        </main>
    );
}
```

5. Explicação do código.

A UI mostra `Turma (opcional)` explicitamente para não contradizer RF04.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

## Critérios de aceite

- Outputs:
    - Schema Mongoose `StudentProfile`.
    - Endpoints `GET/PATCH /api/students/me/profile`.
    - Página `ProfilePage`.
- Verificações:
    - Update válido responde `200`.
    - Pedido sem sessão responde `401`.
- Qualidade:
    - Campos sensíveis não são editáveis.
    - `turma` é opcional.
- Continuidade:
    - BK-MF0-04 usa este perfil para permitir estudo sem turma.
- Evidência:
    - PR inclui payload válido, negativo sem sessão e negativo de mass assignment.

## Validação final

### Requests e responses esperados

- `GET /api/students/me/profile -> 200` com perfil ou `null`.
- `PATCH /api/students/me/profile -> 200` com perfil atualizado.
- `401 UNAUTHENTICATED` sem cookie.
- `400 FORBIDDEN_PROFILE_FIELD` se o body tentar enviar `role`, `email` ou `userId`.

### Como validar o BK e cenários negativos

- Guardar perfil sem turma: esperado `200` e `className: null`.
- Pedido sem cookie: esperado `401`.
- Enviar `{ "name": "Aluno", "role": "ADMIN" }`: esperado `400`.
- Confirmar que a UI não bloqueia quando `className` está vazio.

## Evidence para PR/defesa

### Evidence executada em 2026-06-01

- `apps/api`: `npm test` -> PASS (19 suites, 68 tests).
- `apps/api`: `npm run build` -> PASS.
- `apps/web`: `npm run build` -> PASS.
- Testes negativos cobertos neste ciclo: `LOGIN_RATE_LIMITED`, resposta pública de materiais sem `storageKey`/`contentText`, `AI_EXECUTION_TIMEOUT`, `NO_PROCESSABLE_SOURCES`, execução IA não configurada e output IA inválido.
- Não executado neste ciclo: smoke manual/browser/e2e com MongoDB, Redis e OpenAI reais.

- Screenshot do perfil com `Turma (opcional)`.
- Output `PATCH /api/students/me/profile -> 200`.
- Output negativo sem sessão `401`.
- Output negativo com `role` no body `400`.

## Handoff para BK-MF0-04

- BK-MF0-04 deve tratar `className: null` como estado válido.
- O dashboard individual deve usar `request.user.id` e nunca exigir turma.

## Changelog

- `2026-05-24`: guia refinado para perfil protegido, turma opcional e continuidade com estudo individual.
- `2026-05-25`: persistência atualizada para MongoDB/Mongoose com referência `userId`.
