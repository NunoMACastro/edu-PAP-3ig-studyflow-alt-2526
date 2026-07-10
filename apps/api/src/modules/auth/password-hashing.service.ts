/**
 * Centraliza hashing e comparação de passwords locais.
 */
import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";

const PASSWORD_HASH_ROUNDS = 12;

/**
 * Service responsável por transformar passwords em hashes seguros.
 */
@Injectable()
export class PasswordHashingService {
    /**
     * Gera um hash bcrypt para uma password recebida pelo backend.
     *
     * @param password Password em texto claro recebida apenas durante o pedido.
     * @returns Hash seguro para guardar no campo `passwordHash`.
     */
    hash(password: string): Promise<string> {
        // A password nunca é registada em logs; só o hash segue para persistência.
        return bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
    }

    /**
     * Compara uma password de login com o hash guardado.
     *
     * @param password Password recebida no login.
     * @param passwordHash Hash persistido no utilizador.
     * @returns `true` quando a password corresponde ao hash.
     */
    compare(password: string, passwordHash: string): Promise<boolean> {
        // A comparação fica aqui para manter registo e login com a mesma política.
        return bcrypt.compare(password, passwordHash);
    }
}
