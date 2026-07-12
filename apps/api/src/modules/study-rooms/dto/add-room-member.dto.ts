/**
 * Define contratos de dados usados nas entradas e saídas de salas de estudo.
 */
import { IsEmail } from "class-validator";

/**
 * Pedido para adicionar um aluno existente à sala.
 */
export class AddRoomMemberDto {
    @IsEmail()
    email!: string;
}
