# BK-MF6-05 - Passwords com hashing seguro (bcrypt/argon2).

## Header

- `doc_id`: `GUIA-BK-MF6-05`
- `bk_id`: `BK-MF6-05`
- `macro`: `MF6`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF15`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-06`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-05-passwords-com-hashing-seguro-bcrypt-argon2.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais transformar a regra de hashing de passwords numa peça própria da autenticação. O registo e o login continuam a usar email/password, mas deixam de chamar `bcrypt` diretamente dentro do `AuthService`.

No fim, a password só existe durante o pedido HTTP, tem máximo de 128 caracteres, a base de dados guarda apenas `passwordHash`, o login compara a password recebida contra o hash guardado e os testes provam que o fluxo não aceita regressões inseguras.

#### Importância

`RNF15` é CANONICO em `docs/RNF.md`: passwords têm de usar hashing seguro com bcrypt ou argon2. A release usa `bcrypt@6.0.0`, com lockfile auditado sem a cadeia vulnerável de `tar`, e isola o seu uso num service backend.

Este BK reforça o que `BK-MF0-01` criou no registo e prepara `BK-MF6-06`, porque cookies de sessão só fazem sentido depois de as credenciais serem validadas de forma segura.

#### Scope-in

- Criar `PasswordHashingService` em `apps/api`.
- Integrar esse service em `AuthService`.
- Registar o service em `AuthModule`.
- Atualizar os testes unitários ligados à autenticação.
- Validar que a password original nunca é guardada, devolvida ou usada como evidence.

#### Scope-out

- Trocar bcrypt por argon2 sem decisão técnica explícita e nova dependência aprovada.
- Implementar recuperação de password, MFA, confirmação de email ou SSO escolar.
- Alterar endpoints de autenticação já criados em MF0.
- Guardar passwords, hashes completos, cookies, sessões ou dados reais em prints de defesa.
- Mover validação de password para o frontend como regra principal.

#### Estado antes e depois

- Estado antes: `AuthService` já regista alunos, valida login e usa `bcrypt` diretamente dentro da classe.
- Estado depois: `AuthService` continua responsável pelo fluxo de autenticação, mas delega hash e comparação para `PasswordHashingService`, que fica testado e registado no módulo.

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
- `docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-do-aluno-email-password-ou-sso-escolar.md`
- `docs/planificacao/guias-bk/MF0/BK-MF0-02-login-seguro-com-cookies-httponly.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-04-https-obrigatorio-tls-1-2.md`
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/auth/auth.module.ts`
- `apps/api/src/modules/auth/auth.service.spec.ts`

#### Glossário

- **Password:** segredo escrito pelo aluno no registo ou login. Deve existir apenas em memória durante o pedido.
- **Hash:** valor derivado da password por uma função lenta e segura. É o valor guardado no campo `passwordHash`.
- **Salt:** valor aleatório usado internamente pelo bcrypt para impedir hashes iguais em passwords iguais.
- **Bcrypt:** biblioteca já instalada no backend StudyFlow para criar e comparar hashes.
- **Custo bcrypt:** número que controla o esforço computacional do hash. Custo maior aumenta segurança, mas também aumenta tempo de resposta.
- **Comparação segura:** validação da password recebida contra o hash guardado, sem revelar se o erro foi no email ou na password.
- **Service injetável:** classe NestJS registada no módulo e recebida por constructor, para evitar dependências escondidas.

#### Conceitos teóricos essenciais

- **Hashing de passwords.** Hashing transforma a password num valor que não deve ser reversível. No fluxo StudyFlow, a password entra no `POST /api/auth/register`, é validada, transformada em `passwordHash` e só esse hash segue para a persistência.
- **Bcrypt e salt.** Bcrypt inclui salt e custo no próprio hash. Isso evita que duas passwords iguais gerem sempre o mesmo valor visível e dificulta ataques por dicionário.
- **Bcrypt vs argon2.** `RNF15` permite bcrypt ou argon2. Como bcrypt já está no projeto, usar bcrypt é `DERIVADO` e evita introduzir dependência nova sem necessidade. Argon2 pode ser uma melhoria futura se a equipa aprovar a troca e atualizar testes/evidence.
- **Separação de responsabilidades.** `AuthService` decide o fluxo de registo/login; `PasswordHashingService` decide como gerar e comparar hashes. Esta separação evita repetir chamadas a `bcrypt` e torna o requisito testável.
- **Erro genérico no login.** O backend não deve dizer se falhou o email ou a password. A mensagem pública continua a ser `Email ou password inválidos.`, reduzindo enumeração de contas.
- **Privacidade e evidence.** A defesa pode mostrar comandos e estados esperados, mas não deve mostrar passwords reais, hashes completos, cookies, sessões ou emails pessoais.
- **Teste unitário de segurança.** Um teste pequeno deve falhar se alguém trocar o hash por texto claro ou remover a comparação segura.

#### Arquitetura do BK

- Endpoints mantidos: `POST /api/auth/register` e `POST /api/auth/login`.
- DTOs mantidos: `RegisterStudentDto` e `LoginDto`.
- Modelo mantido: `User` com `passwordHash`, criado em MF0.
- Service novo: `apps/api/src/modules/auth/password-hashing.service.ts`.
- Service editado: `apps/api/src/modules/auth/auth.service.ts`.
- Módulo editado: `apps/api/src/modules/auth/auth.module.ts`.
- Testes: `password-hashing.service.spec.ts` e ajustes em `auth.service.spec.ts`.
- Regra de segurança: o backend gera hash antes de persistir e compara hash no login; o frontend nunca decide se uma password é válida.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/auth/password-hashing.service.ts`
- EDITAR: `apps/api/src/modules/auth/auth.service.ts`
- EDITAR: `apps/api/src/modules/auth/auth.module.ts`
- CRIAR: `apps/api/src/modules/auth/password-hashing.service.spec.ts`
- EDITAR: `apps/api/src/modules/auth/auth.service.spec.ts`
- REVER: `apps/api/package.json`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e dependências

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK entrega `RNF15` sem alterar endpoints, DTOs ou metadados da matriz.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `apps/api/package.json`
    - LOCALIZAÇÃO: linhas de `RNF15`, linha canónica de `BK-MF6-05` e dependência `bcrypt`.

3. Instruções do que fazer.

Confirma que `RNF15` pede hashing seguro com bcrypt/argon2, que `BK-MF6-05` aponta para `BK-MF6-06` e que `bcrypt` já aparece em `apps/api/package.json`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de confirmação documental e técnica antes de editar.

5. Explicação do código.

Não há código porque ainda estás a confirmar o contrato. Esta leitura evita uma troca desnecessária para argon2 e impede que o BK altere requisitos ou endpoints fora do seu escopo.

6. Validação do passo.

O contrato fica correto se confirmares: `RNF15`, `P0`, `S10`, `Reforco`, `proximo_bk: BK-MF6-06` e dependência `bcrypt` instalada.

7. Cenário negativo/erro esperado.

Se `bcrypt` não existir no `package.json`, não avances como se estivesse tudo pronto. Regista a falta, justifica a dependência necessária e pede aprovação antes de alterar dependências.

### Passo 2 - Mapear o fluxo atual de autenticação

1. Objetivo funcional do passo no contexto da app.

Perceber onde a password entra, onde é transformada em hash e onde é comparada no login.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/auth/auth.service.ts`
    - REVER: `apps/api/src/modules/auth/auth.module.ts`
    - REVER: `apps/api/src/modules/auth/auth.service.spec.ts`
    - LOCALIZAÇÃO: métodos `registerStudent`, `validateLogin`, constructor de `AuthService` e providers de `AuthModule`.

3. Instruções do que fazer.

Lê o fluxo atual antes de criares ficheiros novos. O objetivo é substituir chamadas diretas a `bcrypt.hash` e `bcrypt.compare`, não criar novos endpoints nem duplicar `AuthService`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de leitura e planeamento técnico.

5. Explicação do código.

Não há código porque o trabalho aqui é perceber o contrato existente. O registo foi criado em `BK-MF0-01` e o login em `BK-MF0-02`; este BK melhora a implementação sem mudar o contrato HTTP.

6. Validação do passo.

Confirma que `AuthService` tem `registerStudent` e `validateLogin`, que `AuthModule` regista `AuthService` e que os testes instanciam `AuthService` manualmente.

7. Cenário negativo/erro esperado.

Se criares outro controller ou outro endpoint para registo/login, estarás a duplicar o contrato. A correção é voltar ao fluxo existente e alterar apenas a camada de hashing.

### Passo 3 - Criar PasswordHashingService

1. Objetivo funcional do passo no contexto da app.

Criar um service único para gerar e comparar hashes de passwords locais.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/auth/password-hashing.service.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. Mantém o custo num `const` para que a decisão fique visível, testável e fácil de rever no futuro.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/auth/password-hashing.service.ts
/**
 * Centraliza hashing e comparação de passwords locais.
 */
import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";

const PASSWORD_HASH_ROUNDS = 12;

/**
 * Service responsável por transformar passwords em hashes seguros e comparar
 * credenciais no login local.
 */
@Injectable()
export class PasswordHashingService {
    /**
     * Gera um hash bcrypt para uma password recebida pelo backend.
     *
     * @param password Password em texto claro recebida apenas durante o pedido.
     * @returns Hash seguro para guardar no campo `passwordHash`.
     */
    hash(password: string): Promise<string> {
        // A password nunca é registada em logs; só o hash segue para persistência.
        return bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
    }

    /**
     * Compara uma password de login com o hash guardado na base de dados.
     *
     * @param password Password recebida no login.
     * @param passwordHash Hash persistido no utilizador.
     * @returns `true` quando a password corresponde ao hash.
     */
    compare(password: string, passwordHash: string): Promise<boolean> {
        // A comparação fica neste service para manter registo e login com a mesma política.
        return bcrypt.compare(password, passwordHash);
    }
}
```

5. Explicação do código.

Este ficheiro entrega a peça central de `RNF15`. O método `hash` recebe a password apenas enquanto o pedido está a ser processado e devolve um hash bcrypt. O método `compare` recebe a password de login e o `passwordHash` persistido, devolvendo apenas `true` ou `false`.

O custo `12` é `DERIVADO`: é suficientemente claro para a PAP, usa a dependência já instalada e evita introduzir outra biblioteca. Se a equipa trocar para argon2 no futuro, a alteração fica concentrada neste ficheiro.

6. Validação do passo.

Depois de criar o ficheiro, confirma que o import `bcrypt` resolve e que o ficheiro exporta `PasswordHashingService`.

7. Cenário negativo/erro esperado.

Se alguém tentar devolver a password original ou registar a password em logs, a revisão deve bloquear a alteração. A password nunca deve aparecer em output de teste, PR ou defesa.

### Passo 4 - Integrar PasswordHashingService no AuthService

1. Objetivo funcional do passo no contexto da app.

Substituir chamadas diretas a `bcrypt` por chamadas ao service novo, preservando validações e mensagens públicas.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/auth/auth.service.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Substitui o conteúdo de `auth.service.ts` pela versão abaixo. A alteração importante está no constructor e nos métodos `registerStudent` e `validateLogin`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/auth/auth.service.ts
/**
 * Implementa as regras de negócio de auth e concentra validações do domínio.
 */
import {
    BadRequestException,
    ConflictException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { isMongoDuplicateKeyError } from "../../common/utils/mongo-error.util.js";
import { PublicUserDto, UsersService } from "../users/users.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { PasswordHashingService } from "./password-hashing.service.js";
import { RegisterStudentDto } from "./dto/register-student.dto.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 10;

/**
 * Service de autenticação; concentra regras de negócio, validações de acesso e conversão para contratos públicos.
 */
@Injectable()
export class AuthService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param usersService Service de utilizadores usado para ler e criar contas.
     * @param passwordHashingService Service que aplica a política RNF15 de hashing.
     */
    constructor(
        private readonly usersService: UsersService,
        private readonly passwordHashingService: PasswordHashingService,
    ) {}

    /**
     * Regista um aluno com email/password.
     *
     * @param input DTO de registo vindo do controller.
     * @returns Utilizador público sem `passwordHash`.
     * @throws BadRequestException quando email/password não cumprem o contrato.
     * @throws ConflictException quando o email já existe.
     */
    async registerStudent(input: RegisterStudentDto): Promise<PublicUserDto> {
        const email = this.normalizeAndValidateEmail(input.email);
        this.validatePasswordPair(input.password, input.confirmPassword);

        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException({
                code: "EMAIL_ALREADY_REGISTERED",
                message: "Já existe uma conta com este email.",
            });
        }

        // O hashing fica isolado para garantir que todos os registos usam a mesma política.
        const passwordHash = await this.passwordHashingService.hash(
            input.password,
        );
        try {
            const user = await this.usersService.createStudent(
                email,
                passwordHash,
            );
            return this.usersService.toPublicUser(user);
        } catch (error) {
            if (isMongoDuplicateKeyError(error)) {
                throw this.emailAlreadyRegistered();
            }
            throw error;
        }
    }

    /**
     * Valida credenciais locais para login.
     *
     * @param input DTO de login com email e password.
     * @returns Utilizador público autenticado.
     * @throws UnauthorizedException com mensagem genérica em falha de login.
     */
    async validateLogin(input: LoginDto): Promise<PublicUserDto> {
        const email = this.normalizeAndValidateEmail(input.email);
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            // A mensagem genérica evita revelar se o email existe.
            throw this.invalidCredentials();
        }

        const passwordMatches = await this.passwordHashingService.compare(
            input.password,
            user.passwordHash,
        );
        if (!passwordMatches) {
            // O erro continua igual para email inexistente e password errada.
            throw this.invalidCredentials();
        }

        return this.usersService.toPublicUser(user);
    }

    /**
     * Normaliza e valida o email.
     *
     * @param email Valor recebido do frontend.
     * @returns Email em minúsculas e sem espaços laterais.
     * @throws BadRequestException quando o email é inválido.
     */
    private normalizeAndValidateEmail(email: string): string {
        const normalized = String(email ?? "").trim().toLowerCase();
        if (!EMAIL_PATTERN.test(normalized)) {
            throw new BadRequestException({
                code: "INVALID_EMAIL",
                message: "Indica um email válido.",
            });
        }
        return normalized;
    }

    /**
     * Valida força mínima e confirmação da password.
     *
     * @param password Password principal recebida do aluno.
     * @param confirmPassword Confirmação enviada pelo formulário.
     * @returns Nada quando a password é aceite.
     * @throws BadRequestException quando a password é fraca ou diferente.
     */
    private validatePasswordPair(
        password: string,
        confirmPassword: string,
    ): void {
        if (
            typeof password !== "string" ||
            typeof confirmPassword !== "string" ||
            password.length < MIN_PASSWORD_LENGTH
        ) {
            throw new BadRequestException({
                code: "WEAK_PASSWORD",
                message: "A password deve ter pelo menos 10 caracteres.",
            });
        }

        if (password !== confirmPassword) {
            throw new BadRequestException({
                code: "PASSWORD_CONFIRMATION_MISMATCH",
                message: "A confirmação da password não coincide.",
            });
        }
    }

    /**
     * Cria um erro de credenciais inválidas sem revelar qual campo falhou.
     *
     * @returns Exceção pronta a lançar.
     */
    private invalidCredentials(): UnauthorizedException {
        return new UnauthorizedException({
            code: "INVALID_CREDENTIALS",
            message: "Email ou password inválidos.",
        });
    }

    /**
     * Cria o erro público para email duplicado.
     *
     * @returns Exceção `ConflictException`.
     */
    private emailAlreadyRegistered(): ConflictException {
        return new ConflictException({
            code: "EMAIL_ALREADY_REGISTERED",
            message: "Já existe uma conta com este email.",
        });
    }
}
```

5. Explicação do código.

O código preserva os contratos de MF0: registo, login, erro de duplicado, erro de password fraca e erro genérico de credenciais inválidas. A diferença é que `AuthService` deixa de conhecer diretamente `bcrypt`; ele apenas chama `PasswordHashingService`.

Os dados que entram são `email`, `password` e `confirmPassword`. Os dados que saem continuam a ser `PublicUserDto`, sem `passwordHash`. A validação de email e força mínima continua no backend. A regra de segurança principal é impedir que o frontend ou um teste manual decidam o hash; a política fica no backend.

6. Validação do passo.

Confirma que `auth.service.ts` já não importa `bcrypt` e que importa `PasswordHashingService` com extensão `.js`.

7. Cenário negativo/erro esperado.

Se removeres `PasswordHashingService` do constructor, o NestJS não consegue injetar a dependência quando o módulo for atualizado. Se mantiveres `bcrypt.hash` diretamente neste ficheiro, a regra de hashing continua duplicada.

### Passo 5 - Registar o service no AuthModule

1. Objetivo funcional do passo no contexto da app.

Garantir que o NestJS consegue criar `AuthService` com a nova dependência.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/auth/auth.module.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Adiciona `PasswordHashingService` aos imports e aos providers do módulo. Mantém os providers existentes.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/auth/auth.module.ts
/**
 * Regista providers, controllers e schemas necessários ao módulo de auth.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Redis } from "ioredis";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { UsersService } from "../users/users.service.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { LoginAttemptsService } from "./login-attempts.service.js";
import { PasswordHashingService } from "./password-hashing.service.js";
import { SessionService, SESSION_REDIS } from "./session.service.js";
import { createInMemorySessionStore } from "./session-store.js";
import { User, UserSchema } from "./schemas/user.schema.js";

/**
 * Módulo de autenticação.
 *
 * Exporta `SessionService`, `SessionGuard` e `UsersService` porque os BKs
 * seguintes precisam de proteger rotas e resolver o utilizador autenticado.
 */
@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        LoginAttemptsService,
        PasswordHashingService,
        UsersService,
        SessionService,
        SessionGuard,
        {
            provide: SESSION_REDIS,
            /**
             * Cria o store usado pelas sessões.
             *
             * @returns Instância `ioredis` ou store volátil exclusivo dos E2E.
             */
            useFactory: () => {
                if (
                    process.env.STUDYFLOW_E2E_IN_MEMORY_REDIS === "true" &&
                    process.env.NODE_ENV !== "production"
                ) {
                    return createInMemorySessionStore();
                }

                // Redis guarda sessões fora do processo Node, preparando escala horizontal.
                return new Redis(
                    process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
                );
            },
        },
    ],
    exports: [
        AuthService,
        PasswordHashingService,
        UsersService,
        SessionService,
        SessionGuard,
    ],
})
export class AuthModule {}
```

5. Explicação do código.

`AuthModule` é a fronteira de injeção da autenticação. Sem este provider, o constructor novo de `AuthService` fica correto em TypeScript, mas falha em runtime porque o NestJS não sabe criar `PasswordHashingService`.

Exportar o service não muda endpoints públicos; apenas deixa a política disponível para testes ou módulos internos que precisem de validar contratos de autenticação.

6. Validação do passo.

Executa `npm --prefix apps/api run build`. O build deve passar sem erro de dependency injection ou import em falta.

7. Cenário negativo/erro esperado.

Se o build falhar com mensagem sobre `PasswordHashingService` não resolvido, volta a este ficheiro e confirma que o service está em `providers`.

### Passo 6 - Adicionar testes do hashing e ajustar testes de AuthService

1. Objetivo funcional do passo no contexto da app.

Provar que o hash não é a password original e que os testes existentes continuam a instanciar `AuthService` com a nova dependência.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/auth/password-hashing.service.spec.ts`
    - EDITAR: `apps/api/src/modules/auth/auth.service.spec.ts`
    - LOCALIZAÇÃO: ficheiro completo do teste novo; imports e criação de service no teste existente.

3. Instruções do que fazer.

Cria o teste novo. Depois, em `auth.service.spec.ts`, usa `@nestjs/testing` para criar `AuthService` com `PasswordHashingService` e um mock de `UsersService`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/auth/password-hashing.service.spec.ts
/**
 * Testa a política RNF15 de hashing de passwords locais.
 */
import { PasswordHashingService } from "./password-hashing.service.js";

describe("PasswordHashingService", () => {
    it("gera hash diferente da password e permite comparação válida", async () => {
        const service = new PasswordHashingService();

        const hash = await service.hash("PasswordSegura123");

        // O valor persistido nunca pode ser igual à password escrita pelo aluno.
        expect(hash).not.toBe("PasswordSegura123");
        await expect(
            service.compare("PasswordSegura123", hash),
        ).resolves.toBe(true);
    });

    it("rejeita comparação com password errada", async () => {
        const service = new PasswordHashingService();
        const hash = await service.hash("PasswordSegura123");

        // O negativo garante que o login não aceita uma password diferente.
        await expect(service.compare("OutraPassword123", hash)).resolves.toBe(
            false,
        );
    });
});
```

```ts
// apps/api/src/modules/auth/auth.service.spec.ts
// Adiciona estes imports junto dos imports do teste existente.
import { Test } from "@nestjs/testing";
import { UsersService } from "../users/users.service.js";
import { PasswordHashingService } from "./password-hashing.service.js";

type UsersServiceMock = {
    findByEmail: jest.Mock;
    createStudent: jest.Mock;
    toPublicUser: jest.Mock;
};

// Usa esta função auxiliar no teste existente para criar AuthService.
async function createAuthService(
    usersService: UsersServiceMock,
): Promise<AuthService> {
    const moduleRef = await Test.createTestingModule({
        providers: [
            AuthService,
            PasswordHashingService,
            {
                provide: UsersService,
                useValue: usersService,
            },
        ],
    }).compile();

    return moduleRef.get(AuthService);
}
```

5. Explicação do código.

O primeiro teste prova diretamente `RNF15`: o resultado de `hash` é diferente da password original e a comparação correta devolve `true`. O segundo teste prova o negativo: uma password errada devolve `false`.

O ajuste em `auth.service.spec.ts` evita que os testes antigos fiquem partidos quando `AuthService` passa a receber duas dependências. Em cada teste antigo, troca a construção manual por `const service = await createAuthService(usersService);`.

6. Validação do passo.

Executa `npm --prefix apps/api run test:unit`. A suite deve passar e incluir os novos testes de `PasswordHashingService`.

7. Cenário negativo/erro esperado.

Se um teste ainda criar `AuthService` manualmente, o TypeScript ou Jest deve indicar que falta uma dependência no constructor. Corrige todas as chamadas para usarem `await createAuthService(usersService)`.

### Passo 7 - Validar evidence e fechar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com evidence segura e preparar `BK-MF6-06`.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-05-passwords-com-hashing-seguro-bcrypt-argon2.md`
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-06-sessoes-com-cookies-httponly-secure-samesite.md`
    - LOCALIZAÇÃO: secções `Validação final`, `Evidence para PR/defesa` e `Handoff`.

3. Instruções do que fazer.

Regista apenas comandos, estado observado e interpretação. Não copies passwords reais, hashes completos, cookies, IDs de sessão, emails pessoais ou dados privados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo organiza validação e handoff.

5. Explicação do código.

Não há código porque a implementação já ficou nos passos anteriores. Aqui confirmas que o trabalho é demonstrável sem transformar a evidence numa fuga de credenciais.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit
```

O resultado esperado é build sem erros e testes verdes, incluindo `PasswordHashingService`.

7. Cenário negativo/erro esperado.

Se a evidence mostrar uma password real ou hash completo, remove essa evidence e repete com valores de teste controlados e ocultação de segredos.

#### Critérios de aceite

- `PasswordHashingService` existe e é usado por `AuthService`.
- `AuthService` já não importa `bcrypt` diretamente.
- `AuthModule` regista `PasswordHashingService`.
- O registo guarda apenas `passwordHash`.
- O login usa comparação contra `passwordHash` e mantém erro genérico.
- Os testes provam hash diferente da password e falha com password errada.
- Nenhuma evidence mostra passwords reais, hashes completos, cookies ou dados pessoais.

#### Validação final

Executa:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit
```

Resultado esperado:

- Build TypeScript/NestJS sem erros.
- Testes unitários passam.
- `password-hashing.service.spec.ts` prova cenário principal e negativo.
- `auth.service.spec.ts` continua a passar depois da nova dependência no constructor.

#### Evidence para PR/defesa

- Comando de build executado e resultado observado.
- Comando de testes executado e número de suites/testes.
- Nota curta: `AuthService` delega hashing para `PasswordHashingService`.
- Prova negativa: password errada devolve comparação `false` e login continua com erro público genérico.
- Confirmação de privacidade: nenhuma password, hash completo, cookie ou sessão foi incluída na evidence.

#### Handoff

- Entrega para `BK-MF6-06`: autenticação local continua em `POST /api/auth/register` e `POST /api/auth/login`, mas o hashing está centralizado e testado.
- `BK-MF6-06` deve assumir que o login só cria sessão depois de `AuthService.validateLogin` devolver um utilizador público válido.
- Decisão `DERIVADO`: manter bcrypt e custo 12 porque a dependência já existe e a troca para argon2 exigiria decisão e validação próprias.
- Risco residual: se a equipa mudar o custo bcrypt, deve repetir build, testes unitários e um teste manual de registo/login.

#### Changelog

- `2026-06-23`: guia corrigido para incluir `PasswordHashingService`, integração completa em `AuthService`, provider em `AuthModule`, testes com imports e handoff para `BK-MF6-06`.
