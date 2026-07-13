/**
 * Define contratos de dados usados nas entradas e saídas de auth.
 */
import { IsEmail, IsString, MaxLength } from "class-validator";

/**
 * Dados aceites no login local por email/password.
 */
export class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MaxLength(128)
    password!: string;
}
