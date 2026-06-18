// apps/api/src/modules/admin-users/dto/change-user-role.dto.ts
import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";
import { UserRole } from "../../auth/schemas/user.schema.js";

/**
 * Pedido administrativo para alterar papel de um utilizador.
 */
export class ChangeUserRoleDto {
    /** Role final permitida pelo schema real de auth. */
    @IsEnum(["STUDENT", "TEACHER", "ADMIN"])
    nextRole!: UserRole;

    @IsString()
    @MinLength(5)
    @MaxLength(300)
    reason!: string;
}