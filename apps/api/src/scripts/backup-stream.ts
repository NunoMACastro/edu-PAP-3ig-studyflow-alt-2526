/**
 * Primitivas de streaming partilhadas pelos scripts locais de backup e restore.
 *
 * O formato mantém um cabeçalho curto com versão e IV, seguido do ciphertext e
 * da tag GCM. Nem ficheiros de materiais nem dumps de coleções são carregados
 * integralmente em memória.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { appendFile, lstat, open, readFile, writeFile } from "node:fs/promises";
import { PassThrough, Transform, type Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip, createGzip } from "node:zlib";

export const BACKUP_MAGIC = Buffer.from("SFBAK01\n", "ascii");
export const BACKUP_IV_BYTES = 12;
export const BACKUP_TAG_BYTES = 16;

export type EncryptedStreamResult = {
    encryptedSha256: string;
    plaintextSha256: string;
    plaintextBytes: number;
};

/** Cifra um stream com gzip + AES-256-GCM e cria o destino como `0600`. */
export async function encryptStreamToFile(
    input: Readable,
    filePath: string,
    encryptionKey: Buffer,
): Promise<EncryptedStreamResult> {
    const iv = randomBytes(BACKUP_IV_BYTES);
    const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);
    const plaintextHash = createHash("sha256");
    let plaintextBytes = 0;
    const observePlaintext = new Transform({
        transform(chunk: Buffer, _encoding, callback) {
            plaintextBytes += chunk.byteLength;
            plaintextHash.update(chunk);
            callback(null, chunk);
        },
    });

    await writeFile(filePath, Buffer.concat([BACKUP_MAGIC, iv]), {
        flag: "wx",
        mode: 0o600,
    });
    await pipeline(
        input,
        observePlaintext,
        createGzip(),
        cipher,
        createWriteStream(filePath, { flags: "a", mode: 0o600 }),
    );
    await appendFile(filePath, cipher.getAuthTag());

    return {
        encryptedSha256: await hashFile(filePath),
        plaintextSha256: plaintextHash.digest("hex"),
        plaintextBytes,
    };
}

/**
 * Valida tipo, tamanho e checksum de um payload cifrado antes de o decifrar.
 */
export async function assertEncryptedFile(
    filePath: string,
    expectedSha256: string,
): Promise<void> {
    const metadata = await lstat(filePath);
    if (!metadata.isFile() || metadata.isSymbolicLink()) {
        throw new Error("O payload de backup não é um ficheiro físico regular.");
    }
    if (
        metadata.size <=
        BACKUP_MAGIC.byteLength + BACKUP_IV_BYTES + BACKUP_TAG_BYTES
    ) {
        throw new Error("O payload de backup é demasiado curto.");
    }
    const actualSha256 = await hashFile(filePath);
    if (actualSha256 !== expectedSha256) {
        throw new Error("Checksum inválido num payload de backup.");
    }
}

/**
 * Abre um stream autenticado e descomprimido sem materializar o ficheiro.
 * O consumidor tem de percorrer o stream até EOF para validar a tag GCM.
 */
export async function openDecryptedStream(
    filePath: string,
    encryptionKey: Buffer,
): Promise<Readable> {
    const metadata = await lstat(filePath);
    const handle = await open(filePath, "r");
    try {
        const header = Buffer.alloc(BACKUP_MAGIC.byteLength + BACKUP_IV_BYTES);
        const tag = Buffer.alloc(BACKUP_TAG_BYTES);
        const headerRead = await handle.read(header, 0, header.byteLength, 0);
        const tagRead = await handle.read(
            tag,
            0,
            tag.byteLength,
            metadata.size - BACKUP_TAG_BYTES,
        );
        if (
            headerRead.bytesRead !== header.byteLength ||
            tagRead.bytesRead !== tag.byteLength ||
            !header.subarray(0, BACKUP_MAGIC.byteLength).equals(BACKUP_MAGIC)
        ) {
            throw new Error("Formato de payload de backup inválido.");
        }

        const decipher = createDecipheriv(
            "aes-256-gcm",
            encryptionKey,
            header.subarray(BACKUP_MAGIC.byteLength),
        );
        decipher.setAuthTag(tag);
        const output = new PassThrough();
        void pipeline(
            createReadStream(filePath, {
            start: header.byteLength,
            end: metadata.size - BACKUP_TAG_BYTES - 1,
            }),
            decipher,
            createGunzip(),
            output,
        ).catch((error) => output.destroy(error));
        return output;
    } finally {
        await handle.close();
    }
}

/** Calcula SHA-256 incremental para não duplicar o payload no heap. */
export async function hashFile(filePath: string): Promise<string> {
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(filePath)) {
        hash.update(chunk as Buffer);
    }
    return hash.digest("hex");
}

/** Mantido apenas para testes pequenos de formato; evita exportar a chave. */
export async function readBackupPrefix(filePath: string): Promise<Buffer> {
    return (await readFile(filePath)).subarray(0, BACKUP_MAGIC.byteLength);
}
