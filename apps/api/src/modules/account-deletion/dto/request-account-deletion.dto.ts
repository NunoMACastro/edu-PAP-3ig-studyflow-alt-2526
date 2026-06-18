// apps/api/src/modules/account-deletion/dto/request-account-deletion.dto.ts
import { Equals, IsOptional, IsString, MaxLength } from "class-validator";

export const ACCOUNT_DELETION_CONFIRMATION = "ELIMINAR A MINHA CONTA";

/**
 * Pedido de eliminação feito pelo próprio utilizador.
 */
export class RequestAccountDeletionDto {
    /** A frase reduz risco de submissão acidental ou botão escondido. */
    @Equals(ACCOUNT_DELETION_CONFIRMATION)
    confirmation!: string;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    reason?: string;
}