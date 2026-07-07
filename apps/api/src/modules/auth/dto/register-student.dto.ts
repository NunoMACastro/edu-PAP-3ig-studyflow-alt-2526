/**
 * Define contratos de dados usados nas entradas e saídas de auth.
 */
import { Allow } from "class-validator";

/**
 * Dados aceites no registo público de aluno.
 *
 * Apenas estes campos entram no BK-MF0-01. Campos como `role`, `id` ou
 * `authProvider` nunca devem vir do frontend no registo público.
 */
export class RegisterStudentDto {
    @Allow()
    email!: string;

    @Allow()
    password!: string;

    @Allow()
    confirmPassword!: string;
}
