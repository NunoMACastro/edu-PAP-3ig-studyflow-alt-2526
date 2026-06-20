/**
 * Testa o comportamento de auth e documenta os cenários de aceitação automatizados.
 */
import {
    BadRequestException,
    ConflictException,
    UnauthorizedException,
    ValidationPipe,
} from "@nestjs/common";
import bcrypt from "bcrypt";
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
        const service = new AuthService(usersService as never);

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
        const service = new AuthService(usersService as never);

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
        const service = new AuthService(usersService as never);

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
        const service = new AuthService(usersService as never);

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
        const service = new AuthService(usersService as never);

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
    });

    /**
     * Confirma que o login falha com mensagem genérica.
     */
    it("rejeita credenciais inválidas sem revelar o campo errado", async () => {
        const passwordHash = await bcrypt.hash("password-correta", 4);
        const usersService = {
            findByEmail: jest.fn().mockResolvedValue({
                email: "aluno@example.com",
                passwordHash,
            }),
            toPublicUser: jest.fn(),
        };
        const service = new AuthService(usersService as never);

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
