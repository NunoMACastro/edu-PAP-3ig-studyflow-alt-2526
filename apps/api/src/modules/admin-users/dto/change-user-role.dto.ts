/**
 * Define contratos de alteração de papel por administradores.
 */
import { IsIn, IsString, MaxLength, MinLength } from "class-validator";
import { UserRole } from "../../auth/schemas/user.schema.js";

/**
 * Payload aceite para mudar o papel de um utilizador.
 */
export class ChangeUserRoleDto {
    @IsIn(["STUDENT", "TEACHER", "ADMIN"])
    role!: UserRole;

    @IsString()
    @MinLength(5)
    @MaxLength(300)
    reason!: string;
}
