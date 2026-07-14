/**
 * Define confirmação forte para eliminação de conta.
 */
import { IsString, Equals } from "class-validator";

/**
 * Payload da operação irreversível no domínio aplicacional.
 */
export class DeleteAccountDto {
    @IsString()
    @Equals("ELIMINAR A MINHA CONTA")
    confirmation!: string;
}
