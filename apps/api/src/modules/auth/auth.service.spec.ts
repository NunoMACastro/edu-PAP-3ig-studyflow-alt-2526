/**
 * Testa o comportamento de auth e documenta os cenários de aceitação automatizados.
 */
import {
    BadRequestException,
    ConflictException,
    UnauthorizedException,
    ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { RegisterStudentDto } from "./dto/register-student.dto.js";

/**
 * Teste unitário mínimo previsto pelo BK-MF0-01.
 *
 * Mantém o caso crítico: email duplicado não pode criar nova conta. O teste
 * usa mocks diretos para não depender de MongoDB durante a validação unitária.
 */
describe("AuthService", () => {
    /**
     * Confirma que o service rejeita duplicados antes de tentar criar conta.
     */
    it("rejeita email duplicado no registo", async () => {
        const usersService = {
            findByEmail: jest.fn().mockResolvedValue({ id: "existing" }),
            createStudent: jest.fn(),
            toPublicUser: jest.fn(),
        };
        const { service } = makeAuthService(usersService);

        await expect(
            service.registerStudent({
                email: "aluno@example.com",
                password: "password-segura",
                confirmPassword: "password-segura",
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    /**
     * Confirma que email inválido usa o código canónico do BK-MF0-01.
     */
    it("rejeita email inválido com código público", async () => {
        const usersService = {
            findByEmail: jest.fn(),
            createStudent: jest.fn(),
            toPublicUser: jest.fn(),
        };
        const { service, passwordHashingService } = makeAuthService(usersService);

        await expect(
            service.registerStudent({
                email: "email-invalido",
                password: "password-segura",
                confirmPassword: "password-segura",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "INVALID_EMAIL",
            },
        });
        expect(usersService.findByEmail).not.toHaveBeenCalled();
        expect(usersService.createStudent).not.toHaveBeenCalled();
        expect(passwordHashingService.hash).not.toHaveBeenCalled();
    });

    /**
     * Confirma que uma corrida no índice único também devolve erro controlado.
     */
    it("mapeia duplicado Mongo no create para conflito público", async () => {
        const usersService = {
            findByEmail: jest.fn().mockResolvedValue(null),
            createStudent: jest.fn().mockRejectedValue({ code: 11000 }),
            toPublicUser: jest.fn(),
        };
        const { service } = makeAuthService(usersService);

        await expect(
            service.registerStudent({
                email: "aluno@example.com",
                password: "password-segura",
                confirmPassword: "password-segura",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "EMAIL_ALREADY_REGISTERED",
            },
        });
        expect(usersService.toPublicUser).not.toHaveBeenCalled();
    });

    /**
     * Confirma que passwords fracas são rejeitadas antes de persistir.
     */
    it("rejeita password fraca no registo", async () => {
        const usersService = {
            findByEmail: jest.fn(),
            createStudent: jest.fn(),
            toPublicUser: jest.fn(),
        };
        const { service, passwordHashingService } = makeAuthService(usersService);

        await expect(
            service.registerStudent({
                email: "aluno@example.com",
                password: "curta",
                confirmPassword: "curta",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "WEAK_PASSWORD",
            },
        });
        expect(usersService.findByEmail).not.toHaveBeenCalled();
        expect(usersService.createStudent).not.toHaveBeenCalled();
        expect(passwordHashingService.hash).not.toHaveBeenCalled();
    });

    /**
     * Confirma que valores não-textuais de password não chegam ao bcrypt.
     */
    it("rejeita password não textual com código público", async () => {
        const usersService = {
            findByEmail: jest.fn(),
            createStudent: jest.fn(),
            toPublicUser: jest.fn(),
        };
        const { service, passwordHashingService } = makeAuthService(usersService);

        await expect(
            service.registerStudent({
                email: "aluno@example.com",
                password: 1234567890 as unknown as string,
                confirmPassword: 1234567890 as unknown as string,
            }),
        ).rejects.toMatchObject({
            response: {
                code: "WEAK_PASSWORD",
            },
        });
        expect(usersService.findByEmail).not.toHaveBeenCalled();
        expect(usersService.createStudent).not.toHaveBeenCalled();
        expect(passwordHashingService.hash).not.toHaveBeenCalled();
    });

    /**
     * Confirma que o login falha com mensagem genérica.
     */
    it("rejeita credenciais inválidas sem revelar o campo errado", async () => {
        const usersService = {
            findByEmail: jest.fn().mockResolvedValue({
                email: "aluno@example.com",
                passwordHash: "hash-existente",
            }),
            toPublicUser: jest.fn(),
        };
        const { service, passwordHashingService } = makeAuthService(usersService);
        passwordHashingService.compare.mockResolvedValue(false);

        await expect(
            service.validateLogin({
                email: "aluno@example.com",
                password: "password-errada",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "INVALID_CREDENTIALS",
                message: "Email ou password inválidos.",
            },
        });
        await expect(
            service.validateLogin({
                email: "aluno@example.com",
                password: "password-errada",
            }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
        expect(passwordHashingService.compare).toHaveBeenCalledWith(
            "password-errada",
            "hash-existente",
        );
    });

    /**
     * Confirma que campos fora do DTO público são bloqueados pelo pipe global.
     */
    it("rejeita campos extra no DTO de registo", async () => {
        const pipe = new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        });

        await expect(
            pipe.transform(
                {
                    email: "aluno@example.com",
                    password: "password-segura",
                    confirmPassword: "password-segura",
                    role: "ADMIN",
                    passwordHash: "hash-forjado",
                },
                {
                    type: "body",
                    metatype: RegisterStudentDto,
                },
            ),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});

/**
 * Cria AuthService com hashing mockado para manter estes testes unitários.
 *
 * @param usersService Mock parcial do service de users.
 * @returns Service e mock de hashing para validações de segurança.
 */
function makeAuthService(usersService: object) {
    const passwordHashingService = {
        hash: jest.fn().mockResolvedValue("hash-bcrypt-seguro"),
        compare: jest.fn().mockResolvedValue(true),
    };
    const service = new AuthService(
        usersService as never,
        passwordHashingService as never,
    );
    return { service, passwordHashingService };
}
