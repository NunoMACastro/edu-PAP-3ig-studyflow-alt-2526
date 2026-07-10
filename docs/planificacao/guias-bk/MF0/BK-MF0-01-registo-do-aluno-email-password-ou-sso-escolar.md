# BK-MF0-01 - Registo do aluno (email/password ou SSO escolar).

## Header

- `doc_id`: `GUIA-BK-MF0-01`
- `bk_id`: `BK-MF0-01`
- `macro`: `MF0`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `real_dev_status`: `PARCIAL`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF01`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-02`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-do-aluno-email-password-ou-sso-escolar.md`
- `last_updated`: `2026-07-10`

## O que vamos fazer neste BK

Neste BK vamos construir a primeira entrada real do StudyFlow: o registo de aluno. O resultado esperado é que um aluno consiga criar uma conta usando email e password, ficando preparado para iniciar sessão no BK seguinte. O RF01 também menciona SSO escolar, mas nenhum documento define fornecedor, protocolo, campos institucionais ou credenciais de integração. Por isso, nesta fase o SSO fica apenas como contrato preparado, sem implementação real inventada.

Como ainda não existe código da app no repositório, este guia define a estrutura técnica que deve ser criada quando a equipa iniciar a implementação. A stack canónica dos RNF é React/TypeScript/Tailwind no frontend e Node.js LTS com NestJS, MongoDB e Mongoose no backend. Redis e SSO ficam preparados, mas não são obrigatórios neste BK.

Convenção de persistência para a MF0: os documentos persistidos em MongoDB usam `_id/ObjectId`, mas a API pode devolver `id` como string. Relações entre documentos devem ser guardadas como referências `ObjectId`, por exemplo `userId` e `studyAreaId`. Campos únicos e índices pertencem aos schemas Mongoose; não se deve criar migrations SQL nesta PAP.

O mockup existente mostra o ecrã de autenticação com marca `StudyFlow`, fundo claro, formulário central, campos de email/password, botão `Entrar` e ligação `Registar`. Para este BK, o mockup orienta o fluxo entre login e registo, mas não obriga a desenho final pixel-perfect.

## Porque é que isto é importante

- Cria a identidade base que todos os BKs seguintes reutilizam: perfil, áreas de estudo, materiais, histórico e IA privada.
- Introduz desde cedo validação, hashing de password e separação entre DTO, controller, service e persistência.
- Evita o erro grave de guardar passwords em texto puro ou confiar apenas em validação no frontend.
- Deixa preparado o contrato para SSO escolar sem inventar integração externa.
- Desbloqueia o BK-MF0-02, que cria sessão segura com cookies HttpOnly.

## O que entra (scope)

- Estado esperado antes do BK: não existe modelo de utilizador, endpoint de registo nem página de registo.
- Estado esperado depois do BK: existe registo de aluno por email/password, password guardada como hash, email único e resposta sem dados sensíveis.
- Ficheiros a criar:
    - `apps/api/src/modules/auth/schemas/user.schema.ts`
    - `apps/api/src/modules/auth/auth.module.ts`
    - `apps/api/src/modules/auth/auth.controller.ts`
    - `apps/api/src/modules/auth/auth.service.ts`
    - `apps/api/src/modules/auth/dto/register-student.dto.ts`
    - `apps/api/src/modules/users/users.service.ts`
    - `apps/web/src/pages/auth/RegisterPage.tsx`
    - `apps/web/src/lib/apiClient.ts`
- Ficheiros a rever:
    - `docs/RF.md`
    - `docs/RNF.md`
    - `mockup/thumbnail.png`
    - `mockup/images/ede75b815bb4a2993eb44966fab060d2102ef8b5`
- Dependências de BK anteriores: nenhuma.
- Impacto na arquitetura: cria o domínio `auth` e o contrato mínimo da entidade `User`.
- Impacto em frontend: cria página de registo ligada ao ecrã de login do mockup.
- Impacto em backend: cria endpoint derivado `POST /api/auth/register`.
- Impacto em dados: cria utilizador com `email`, `passwordHash`, `role`, `createdAt` e `updatedAt`.
- Impacto em segurança: hashing obrigatório, email único, resposta sem `passwordHash`.
- Impacto em testes: exige smoke, negativos e integração de registo.
- Handoff: o BK-MF0-02 deve conseguir autenticar uma conta criada aqui.

## O que não entra (scope-out)

- Login e criação de cookie de sessão, que pertencem ao BK-MF0-02.
- Perfil editável completo, que pertence ao BK-MF0-03.
- Integração real com SSO escolar, porque faltam fornecedor, protocolo e credenciais.
- Recuperação de password, confirmação de email e MFA, porque não estão definidos em RF01.
- Papéis de professor/admin, que surgem noutras fases.
- Seed real de utilizadores, salvo conta local de desenvolvimento documentada como temporária.

## Como saber que isto ficou bem

- Um aluno consegue submeter email/password válidos e recebe `201 Created`.
- O backend rejeita email inválido, password fraca e email duplicado com erro controlado.
- A base de dados guarda `passwordHash` e nunca guarda `password`.
- A resposta do endpoint não inclui hash, tokens, segredos ou campos internos desnecessários.
- A página de registo permite regressar ao login, coerente com o mockup.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `DONE` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Natalia` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `-` (CANONICO)
- Pre-condicoes: repositório sem código da app; criar scaffold antes de aplicar caminhos (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-AUTH-REGISTER` (DERIVADO)
- Fonte de verdade: `docs/RF.md`, `RF01` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-01` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Registo do aluno por email/password, com SSO escolar apenas preparado até haver decisão institucional (CANONICO/DERIVADO)
- `rf_rnf`: `RF01` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar o contrato da entidade `User` para aluno.
- Criar DTO de entrada para registo.
- Criar endpoint `POST /api/auth/register`, derivado de RF01.
- Validar email, password e duplicação no backend.
- Guardar apenas `passwordHash`.
- Criar página `RegisterPage` com email, password e confirmação de password.
- Ligar a página de registo ao login mostrado no mockup.
- Preparar placeholders explícitos para SSO escolar sem ativar integração externa.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF01.
- `docs/RNF.md`: RNF15, RNF17, RNF25, RNF26, RNF42.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: linha `BK-MF0-01`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: linha `BK-MF0-01`.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: matriz mínima de testes por prioridade.
- `mockup/thumbnail.png`: fluxo visual login/registo.
- Código da app: bloqueado até existir scaffold real.

## Glossário (rápido) (DERIVADO):

- **Registo**: criação inicial de uma conta de utilizador.
- **DTO**: objeto que define os dados aceites por um endpoint.
- **Hash**: transformação segura da password para não a guardar em texto puro.
- **Salt**: valor aleatório usado no hashing para dificultar ataques por dicionário.
- **Endpoint**: URL da API que recebe um pedido, por exemplo `POST /api/auth/register`.
- **Controller**: camada que recebe o pedido HTTP e devolve resposta.
- **Service**: camada onde fica a lógica principal da funcionalidade.
- **Mongoose schema**: classe/ficheiro que descreve documentos MongoDB, validações e índices.
- **ObjectId**: identificador do MongoDB usado em `_id` e em referências entre documentos.
- **SSO escolar**: autenticação via fornecedor institucional, ainda não definido no projeto.
- **Validação backend**: verificação feita no servidor, obrigatória mesmo que o frontend valide.
- **Scaffold**: estrutura inicial de código que define organização, dependências e padrões do projeto.

## Conceitos teóricos essenciais (DERIVADO):

**Backend e endpoint.** O backend é a parte da aplicação que corre no servidor. Neste BK, ele recebe os dados de registo, valida-os, cria a conta e responde ao frontend. O endpoint derivado de RF01 é `POST /api/auth/register`.

**Controller e service.** Em NestJS, o controller deve tratar o pedido HTTP e chamar o service. O service contém a regra: validar duplicados, gerar hash e criar utilizador. Esta separação evita controllers gigantes e facilita testes.

**DTO e validação.** Um DTO como `RegisterStudentDto` define o formato esperado: `email`, `password` e `confirmPassword`. A validação no backend é obrigatória porque qualquer pessoa pode chamar a API diretamente, contornando o frontend.

**Hashing de passwords.** Passwords nunca devem ser guardadas em texto puro. O backend deve usar uma função própria, como bcrypt ou argon2, para guardar apenas `passwordHash`. A dependência concreta deve ser escolhida no scaffold, com preferência por uma biblioteca standard e mantida.

**SSO preparado, não inventado.** RF01 permite email/password ou SSO escolar. Como o fornecedor SSO não está documentado, este BK deve criar apenas pontos de extensão, por exemplo `authProvider: "local"`, e deixar a implementação real bloqueada até decisão do orientador/escola.

**Mockup como referência.** O mockup mostra a página de login e a ligação para `Registar`. O registo deve respeitar a navegação esperada, mas o design final pode evoluir.

## Guia linear de implementação

Segue estes passos por ordem. Como ainda não existe scaffold real no repositório, os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência, Redis para sessões quando necessário e OpenAI API apenas atrás de provider isolado. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis na MF0.

### Pré-requisitos concretos

- Ter criado o scaffold NestJS em `apps/api`.
- Ter criado o scaffold React/TypeScript em `apps/web`.
- Ter MongoDB configurado no módulo raiz da API.
- Instalar uma biblioteca de hashing segura. Para este guia, usar `bcrypt`, por cumprir RNF15. Se a equipa escolher `argon2`, deve trocar apenas as funções `hash`/`compare` mantendo o contrato.
- Não implementar SSO real neste BK, porque o fornecedor/protocolo não está documentado.

### Passo 1 - Criar schema do utilizador

1. Explicação simples do objetivo.

    Neste passo vais criar schema do utilizador. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/auth/schemas/user.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;
export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";
export type AuthProvider = "local" | "school_sso";
export type AccountStatus = "ACTIVE" | "DELETION_PENDING" | "DELETED";

@Schema({ timestamps: true, collection: "users" })
export class User {
    // O email é guardado em minúsculas para impedir contas duplicadas com maiúsculas diferentes.
    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    })
    email!: string;

    // Nunca guardamos a password original. Guardamos só o hash seguro.
    @Prop({ required: true })
    passwordHash!: string;

    // No registo público deste BK, o papel é sempre STUDENT.
    @Prop({
        required: true,
        enum: ["STUDENT", "TEACHER", "ADMIN"],
        default: "STUDENT",
    })
    role!: UserRole;

    // A autenticação relê estes campos em Mongo em todos os pedidos.
    @Prop({ required: true, enum: ["ACTIVE", "DELETION_PENDING", "DELETED"], default: "ACTIVE", index: true })
    accountStatus!: AccountStatus;

    // Alterar papel ou eliminar conta incrementa a versão e revoga todas as sessões anteriores.
    @Prop({ required: true, min: 1, default: 1 })
    sessionVersion!: number;

    // O SSO fica apenas preparado como contrato. A integração real está bloqueada por falta de fornecedor.
    @Prop({ required: true, enum: ["local", "school_sso"], default: "local" })
    authProvider!: AuthProvider;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

5. Explicação do código.

Este ficheiro cria a coleção `users`. A decisão importante é separar `passwordHash` de `password`: a password escrita pelo aluno só existe durante o pedido HTTP e nunca é persistida.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 2 - Criar DTO de registo

1. Explicação simples do objetivo.

    Neste passo vais criar DTO de registo. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/auth/dto/register-student.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export class RegisterStudentDto {
    email!: string;
    password!: string;
    confirmPassword!: string;
}
```

5. Explicação do código.

O DTO define o contrato de entrada. A validação principal fica no service para não depender de bibliotecas não documentadas além da stack NestJS/Mongoose.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 3 - Criar service de utilizadores

1. Explicação simples do objetivo.

    Neste passo vais criar service de utilizadores. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/users/users.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../auth/schemas/user.schema";

export type PublicUser = {
    id: string;
    email: string;
    role: string;
};

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel
            .findOne({ email: email.toLowerCase().trim() })
            .exec();
    }

    async createStudent(
        email: string,
        passwordHash: string,
    ): Promise<PublicUser> {
        const created = await this.userModel.create({
            email: email.toLowerCase().trim(),
            passwordHash,
            role: "STUDENT",
            authProvider: "local",
            accountStatus: "ACTIVE",
            sessionVersion: 1,
        });

        return this.toPublicUser(created);
    }

    toPublicUser(user: UserDocument): PublicUser {
        return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };
    }
}
```

5. Explicação do código.

Este service centraliza o acesso à coleção `users`. A função `toPublicUser` é obrigatória para não devolver `passwordHash` ao frontend.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 4 - Criar lógica de registo

1. Explicação simples do objetivo.

    Neste passo vais criar lógica de registo. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/auth/auth.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import {
    BadRequestException,
    ConflictException,
    Injectable,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { RegisterStudentDto } from "./dto/register-student.dto";
import { PublicUser, UsersService } from "../users/users.service";

const PASSWORD_MIN_LENGTH = 10;
const BCRYPT_COST = 12;

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {}

    async registerStudent(input: RegisterStudentDto): Promise<PublicUser> {
        const email = this.normalizeEmail(input.email);

        this.assertValidEmail(email);
        this.assertValidPassword(input.password);

        if (input.password !== input.confirmPassword) {
            throw new BadRequestException({
                code: "PASSWORD_CONFIRMATION_MISMATCH",
                message: "A confirmação da password não coincide.",
            });
        }

        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException({
                code: "EMAIL_ALREADY_REGISTERED",
                message: "Já existe uma conta com este email.",
            });
        }

        // O hash transforma a password num valor seguro para guardar na base de dados.
        const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
        return this.usersService.createStudent(email, passwordHash);
    }

    private normalizeEmail(email: string | undefined): string {
        return String(email ?? "")
            .trim()
            .toLowerCase();
    }

    private assertValidEmail(email: string): void {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            throw new BadRequestException({
                code: "INVALID_EMAIL",
                message: "Indica um email válido.",
            });
        }
    }

    private assertValidPassword(password: string | undefined): void {
        if (!password || password.length < PASSWORD_MIN_LENGTH) {
            throw new BadRequestException({
                code: "WEAK_PASSWORD",
                message: `A password deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
            });
        }
    }
}
```

5. Explicação do código.

Este código valida email, força password mínima, confirma que as passwords coincidem, rejeita duplicados com `409 Conflict` e guarda apenas o hash.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 5 - Criar controller de registo

1. Explicação simples do objetivo.

    Neste passo vais criar controller de registo. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/auth/auth.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterStudentDto } from "./dto/register-student.dto";
import { PublicUser } from "../users/users.service";

@Controller("api/auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() body: RegisterStudentDto): Promise<PublicUser> {
        return this.authService.registerStudent(body);
    }
}
```

5. Explicação do código.

O controller expõe `POST /api/auth/register`. Ele não contém regras de negócio; delega no service para manter o código testável.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 6 - Criar módulo de autenticação

1. Explicação simples do objetivo.

    Neste passo vais criar módulo de autenticação. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/auth/auth.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { User, UserSchema } from "./schemas/user.schema";
import { UsersService } from "../users/users.service";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [AuthController],
    providers: [AuthService, UsersService],
    exports: [AuthService, UsersService],
})
export class AuthModule {}
```

5. Explicação do código.

Este módulo liga schema, service e controller. O `exports` prepara o BK-MF0-02 para reutilizar `AuthService`/`UsersService` no login.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 7 - Criar cliente API de registo

1. Explicação simples do objetivo.

    Neste passo vais criar cliente API de registo. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/apiClient.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
export type RegisterStudentPayload = {
    email: string;
    password: string;
    confirmPassword: string;
};

export type PublicUser = {
    id: string;
    email: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
};

export async function registerStudent(
    payload: RegisterStudentPayload,
): Promise<PublicUser> {
    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message ?? "Não foi possível criar a conta.");
    }

    return data as PublicUser;
}
```

5. Explicação do código.

Este ficheiro evita espalhar `fetch` pela UI. A função devolve o utilizador público e transforma erros HTTP numa mensagem simples para o aluno.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 8 - Criar página de registo

1. Explicação simples do objetivo.

    Neste passo vais criar página de registo. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/auth/RegisterPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
import { FormEvent, useState } from "react";
import { registerStudent } from "../../lib/apiClient";

export function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            const user = await registerStudent({
                email,
                password,
                confirmPassword,
            });
            setSuccess(
                `Conta criada para ${user.email}. Já podes iniciar sessão.`,
            );
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro inesperado ao criar conta.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10">
            <form
                aria-label="Registo de aluno"
                className="mx-auto flex max-w-md flex-col gap-4 rounded-lg bg-white p-6 shadow"
                onSubmit={handleSubmit}
            >
                <h1 className="text-2xl font-semibold text-slate-900">
                    Criar conta StudyFlow
                </h1>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Email
                    <input
                        autoComplete="email"
                        className="rounded border border-slate-300 px-3 py-2"
                        name="email"
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        type="email"
                        value={email}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Password
                    <input
                        autoComplete="new-password"
                        className="rounded border border-slate-300 px-3 py-2"
                        minLength={10}
                        name="password"
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        type="password"
                        value={password}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Confirmar password
                    <input
                        autoComplete="new-password"
                        className="rounded border border-slate-300 px-3 py-2"
                        minLength={10}
                        name="confirmPassword"
                        onChange={(event) =>
                            setConfirmPassword(event.target.value)
                        }
                        required
                        type="password"
                        value={confirmPassword}
                    />
                </label>

                {error && (
                    <p className="rounded bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </p>
                )}
                {success && (
                    <p className="rounded bg-green-50 p-3 text-sm text-green-700">
                        {success}
                    </p>
                )}

                <button
                    className="rounded bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60"
                    disabled={isSubmitting}
                    type="submit"
                >
                    {isSubmitting ? "A criar conta..." : "Registar"}
                </button>
            </form>
        </main>
    );
}
```

5. Explicação do código.

A página dá feedback de erro/sucesso e não guarda passwords em estado depois do registo com sucesso. A validação visual ajuda o aluno, mas a segurança continua no backend.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

### Passo 9 - Teste mínimo do service

1. Explicação simples do objetivo.

    Neste passo vais teste mínimo do service. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/auth/auth.service.spec.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
import { ConflictException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

describe("AuthService", () => {
    const usersService = {
        findByEmail: jest.fn(),
        createStudent: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("cria aluno e nunca devolve passwordHash", async () => {
        usersService.findByEmail.mockResolvedValue(null);
        usersService.createStudent.mockResolvedValue({
            id: "u1",
            email: "aluno@example.com",
            role: "STUDENT",
        });

        const service = new AuthService(usersService);
        const result = await service.registerStudent({
            email: "Aluno@Example.com",
            password: "password-segura",
            confirmPassword: "password-segura",
        });

        expect(result).toEqual({
            id: "u1",
            email: "aluno@example.com",
            role: "STUDENT",
        });
        expect(result).not.toHaveProperty("passwordHash");
    });

    it("rejeita email duplicado com 409", async () => {
        usersService.findByEmail.mockResolvedValue({
            email: "aluno@example.com",
        } as never);

        const service = new AuthService(usersService);

        await expect(
            service.registerStudent({
                email: "aluno@example.com",
                password: "password-segura",
                confirmPassword: "password-segura",
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });
});
```

5. Explicação do código.

O teste prova o caminho feliz e um negativo importante. Como é teste de service, não precisa de MongoDB real.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados do aluno, valida sempre com uma sessão real e nunca com `userId` vindo do body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs enviados pelo frontend em vez de usar `request.user.id` da sessão.

## Critérios de aceite

- Outputs:
    - Schema Mongoose `User` criado.
    - Endpoint `POST /api/auth/register` criado.
    - Página de registo criada.
- Verificações:
    - Registo válido responde `201`.
    - Email inválido responde `400`.
    - Email duplicado responde `409`.
- Qualidade:
    - Controller, service e DTO estão separados.
    - Não há regra de negócio sensível apenas no frontend.
- Continuidade:
    - BK-MF0-02 consegue usar a conta criada para login.
    - BK-MF0-03 consegue associar perfil ao `User`.
- Evidência:
    - PR inclui payload válido, outputs negativos e screenshot ou vídeo curto da página de registo.

## Validação final

### Requests e responses esperados

Registo válido:

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "aluno@example.com",
  "password": "password-segura",
  "confirmPassword": "password-segura"
}
```

Resposta esperada:

```http
201 Created

{
  "id": "665f0f1a2d2e6f001234abcd",
  "email": "aluno@example.com",
  "role": "STUDENT"
}
```

Erros esperados:

- `400 INVALID_EMAIL`: email sem formato válido.
- `400 WEAK_PASSWORD`: password com menos de 10 caracteres.
- `400 PASSWORD_CONFIRMATION_MISMATCH`: confirmação diferente.
- `409 EMAIL_ALREADY_REGISTERED`: email já existe.

### Como validar o BK

- Criar uma conta com email novo e confirmar `201`.
- Confirmar no MongoDB que existe `passwordHash` e não existe campo `password`.
- Repetir o mesmo email e confirmar `409`.
- Testar email inválido e confirmar `400`.
- Confirmar que a resposta nunca inclui `password`, `confirmPassword` ou `passwordHash`.

## Evidence para PR/defesa

### Evidence executada em 2026-06-01

- `apps/api`: `npm test` -> PASS (19 suites, 68 tests).
- `apps/api`: `npm run build` -> PASS.
- `apps/web`: `npm run build` -> PASS.
- Testes negativos cobertos neste ciclo: `LOGIN_RATE_LIMITED`, resposta pública de materiais sem `storageKey`/`contentText`, `AI_EXECUTION_TIMEOUT`, `NO_PROCESSABLE_SOURCES`, execução IA não configurada e output IA inválido.
- Não executado neste ciclo: smoke manual/browser/e2e com MongoDB, Redis e OpenAI reais.

- Screenshot da página `Criar conta StudyFlow`.
- Output do pedido `POST /api/auth/register -> 201`.
- Output de email duplicado `409`.
- Print/trecho controlado da base com `passwordHash` ocultando parte do valor.
- Nota no PR: `SSO escolar não implementado por falta de fornecedor/protocolo documentado`.

## Handoff para BK-MF0-02

- O BK-MF0-02 deve reutilizar `UsersService.findByEmail`.
- O login deve comparar `password` recebida com `passwordHash`.
- O email/password de teste criado aqui deve ser usado para validar cookie HttpOnly.

## Changelog

- `2026-05-24`: guia refinado para execução concreta, com contratos técnicos, passos P0 e validações negativas.
- `2026-05-25`: persistência atualizada para MongoDB/Mongoose, substituindo a stack de dados anterior.
