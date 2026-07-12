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
const MAX_PASSWORD_LENGTH = 128;
const MAX_BCRYPT_PASSWORD_BYTES = 72;

/**
 * Service de autenticação; concentra regras de negócio, validações de acesso e conversão para contratos públicos.
 */
@Injectable()
export class AuthService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param usersService Service injetado para reutilizar regras de users sem duplicar validações.
     * @param passwordHashingService Service que concentra a política bcrypt.
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

        const passwordHash = await this.passwordHashingService.hash(input.password);
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
            // A mesma exceção é usada para email inexistente e password errada.
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
            password.length < MIN_PASSWORD_LENGTH ||
            password.length > MAX_PASSWORD_LENGTH ||
            Buffer.byteLength(password, "utf8") > MAX_BCRYPT_PASSWORD_BYTES
        ) {
            throw new BadRequestException({
                code: "WEAK_PASSWORD",
                message:
                    "A password deve ter entre 10 e 128 caracteres e até 72 bytes.",
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
