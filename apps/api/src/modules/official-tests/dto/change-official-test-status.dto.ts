/**
 * Define o contrato de transição do ciclo de vida de um teste oficial.
 */
import { IsIn } from "class-validator";

/**
 * Estados de destino aceites pelo endpoint de transição.
 *
 * A validação da sequência DRAFT -> PUBLISHED -> CLOSED pertence ao service,
 * porque depende do estado persistido e não apenas do formato do payload.
 */
export class ChangeOfficialTestStatusDto {
    @IsIn(["PUBLISHED", "CLOSED"])
    status!: "PUBLISHED" | "CLOSED";
}
