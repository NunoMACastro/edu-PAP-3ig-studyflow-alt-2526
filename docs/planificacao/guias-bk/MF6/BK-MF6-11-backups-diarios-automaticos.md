# BK-MF6-11 - Backups diários automáticos.

## Header

- `doc_id`: `GUIA-BK-MF6-11`
- `bk_id`: `BK-MF6-11`
- `macro`: `MF6`
- `owner`: `Kaua`
- `apoio`: `Kaua`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF21`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-12`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-11-backups-diarios-automaticos.md`
- `last_updated`: `2026-06-23`

#### Objetivo

Neste BK vais criar um backup diário automático da base MongoDB da StudyFlow, com comando backend, contrato de agendamento, retenção limitada e evidence sem segredos.

No fim, a equipa consegue executar `backup:daily`, validar uma execução sem dados sensíveis e deixar um agendamento diário preparado para o ambiente de deploy.

#### Importância

`RNF21` é canónico nos requisitos não funcionais e existe para reduzir risco de perda de dados. A StudyFlow já guarda utilizadores, materiais, áreas de estudo, salas, turmas, jobs de indexação e dados de IA; por isso, um backup diário precisa de ser verificável e seguro, não apenas uma nota operacional.

Este BK prepara `BK-MF6-12` porque o próximo passo trata recuperação após falhas. Um recovery honesto começa por ter uma cópia recente, privada e validada dos dados.

#### Scope-in

- Criar um script TypeScript em `apps/api` para exportar coleções MongoDB para ficheiros comprimidos.
- Adicionar scripts npm para execução diária e ensaio controlado.
- Criar um contrato de agendamento diário com hora, comando e destino de logs.
- Criar testes unitários com cenário principal e pelo menos 2 negativos.
- Manter segredos fora de argumentos de processo, logs e evidence.
- Usar apenas caminhos públicos de aluno: `apps/api` e `apps/web`.

#### Scope-out

- Alterar RF/RNF, owner, sprint, prioridade ou dependências canónicas.
- Criar endpoints públicos para descarregar backups.
- Guardar backups dentro do repositório ou expor ficheiros de backup no frontend.
- Adicionar dependências npm sem aprovação e justificação técnica.
- Fazer restore completo de produção; este BK entrega criação e verificação do backup.
- Resolver logs estruturados de MF7; este BK apenas deixa eventos e evidence consumíveis pelo próximo módulo.

#### Estado antes e depois

- Estado antes: a API tem scripts TypeScript compilados por `nest build`, mas não tem `backup:daily` nem contrato de backup diário.
- Estado depois: a API tem um script TypeScript compilável, testável e agendável; a evidence mostra sucesso, falha controlada e ausência de segredos no output.

#### Pre-requisitos

- `README.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md`
- `apps/api/package.json`
- `apps/api/tsconfig.json`

#### Glossário

- **Backup diário:** cópia criada todos os dias, com comando e agenda repetíveis.
- **Retenção:** número de dias em que as cópias antigas ficam guardadas antes de limpeza.
- **Evidence:** prova objetiva para PR e defesa, sem credenciais, dados pessoais ou conteúdo privado.
- **Dry run:** ensaio seguro que valida configuração sem abrir ligação à base de dados.
- **Manifest:** ficheiro JSON com metadados do backup, como data, coleções exportadas e número de documentos.
- **Agendamento:** regra externa que chama o comando todos os dias no ambiente onde a API corre.

#### Conceitos teóricos essenciais

- **Backups não são logs:** logs ajudam a diagnosticar; backups permitem recuperar dados. Não se deve guardar documentos de aluno na evidence.
- **Segredos não entram em argumentos de processo:** comandos com URI completa podem aparecer em ferramentas do sistema operativo. Por isso, o script lê `MONGODB_URI` por ambiente e não a imprime.
- **Agendamento é parte do requisito:** um comando manual ajuda, mas `RNF21` pede backup diário automático. O BK inclui um ficheiro de cron como contrato mínimo de execução diária.
- **Retenção evita crescimento infinito:** sem limpeza, backups acumulam dados sensíveis e ocupam disco sem controlo.
- **Build TypeScript protege o aluno:** como `apps/api/tsconfig.json` inclui `src/**/*.ts`, o script deve ser `.ts` para ser validado por `npm --prefix apps/api run build`.

#### Arquitetura do BK

- Endpoint(s): não cria endpoint público.
- Modelo/schema: reutiliza as coleções existentes da base MongoDB.
- Script principal: `apps/api/src/scripts/backup-database.ts`.
- Configuração operacional: `apps/api/ops/backup-daily.cron`.
- Package script: `backup:daily` compila a API e executa `dist/scripts/backup-database.js`.
- Segurança: a URI fica apenas em variável de ambiente; logs e manifest não incluem credenciais nem documentos.
- Testes: `apps/api/src/scripts/backup-database.spec.ts` cobre sucesso, ausência de URI, retenção inválida e dry run.
- Handoff para o próximo BK: `BK-MF6-12` pode usar os erros controlados e o manifest para pensar em recovery.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/scripts/backup-database.ts`
- CRIAR: `apps/api/src/scripts/backup-database.spec.ts`
- CRIAR: `apps/api/ops/backup-daily.cron`
- EDITAR: `apps/api/package.json`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `apps/api/tsconfig.json`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF6-11` entrega `RNF21` sem alterar IDs, owner, sprint, prioridade ou sequência da matriz.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`

3. Instruções do que fazer.

Confirma que `RNF21` corresponde a backups diários automáticos e que a linha canónica mantém `P1`, `S10`, `Core` e `proximo_bk: BK-MF6-12`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fixa o contrato. A implementação técnica só deve começar depois de confirmar que o BK não mudou de requisito.

6. Validação do passo.

Regista na tua nota de PR: `RNF21 confirmado; BK-MF6-11 continua P1/S10/Core e entrega para BK-MF6-12`.

7. Cenário negativo/erro esperado.

Se encontrares divergência entre matriz, backlog e contrato de campos, para a implementação e corrige primeiro a fonte canónica numa tarefa própria.

### Passo 2 - Definir estratégia segura de backup

1. Objetivo funcional do passo no contexto da app.

Escolher uma solução que faça backup real sem expor URI ou credenciais no processo, no terminal ou na evidence.

2. Ficheiros envolvidos:
- REVER: `apps/api/package.json`
- REVER: `apps/api/tsconfig.json`
- CRIAR: `apps/api/src/scripts/backup-database.ts`

3. Instruções do que fazer.

Usa Mongoose, que já existe nas dependências da API, para abrir ligação com `MONGODB_URI` lida do ambiente. Exporta cada coleção para um ficheiro `.jsonl.gz` dentro de uma pasta privada. Não uses argumentos de linha de comandos para passar a URI.

4. Código completo, correto e integrado com a app final.

O código completo fica no passo 3.

5. Explicação do código.

A estratégia evita depender de uma ferramenta externa instalada no servidor e permite que `nest build` valide o script. Os backups ficam comprimidos, separados por coleção e acompanhados de manifest.

6. Validação do passo.

Confirma que não vais criar endpoint HTTP para backups e que `STUDYFLOW_BACKUP_DIR` aponta para uma pasta privada fora de `apps/web`.

7. Cenário negativo/erro esperado.

Se alguém sugerir guardar backup em `public`, `static`, `uploads` servidos pela web ou dentro do repositório, rejeita a opção porque expõe dados sensíveis.

### Passo 3 - Criar script principal de backup

1. Objetivo funcional do passo no contexto da app.

Criar o script executável que produz o backup, escreve manifest e limpa backups antigos conforme a retenção definida.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/scripts/backup-database.ts`
- LOCALIZAÇÃO: ficheiro completo, com imports, exports, CLI e funções testáveis.

3. Instruções do que fazer.

Cria o ficheiro abaixo. Mantém as funções exportadas porque o teste do passo 5 usa essas funções sem precisar de uma base real.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/scripts/backup-database.ts
import { createWriteStream } from "node:fs";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { pathToFileURL } from "node:url";
import { createGzip } from "node:zlib";
import mongoose from "mongoose";

const DEFAULT_BACKUP_ROOT = "./backups";
const DEFAULT_RETENTION_DAYS = 7;
const MAX_RETENTION_DAYS = 90;

type BackupDocument = Record<string, unknown>;

export type BackupCollectionReader = {
    collectionName: string;
    countDocuments(filter?: object): Promise<number>;
    find(filter?: object): AsyncIterable<BackupDocument>;
};

export type BackupConnection = {
    db?: {
        collections(): Promise<BackupCollectionReader[]>;
    };
    close(): Promise<void>;
};

export type BackupSummary = {
    ok: true;
    dryRun: boolean;
    backupId: string;
    outputDir: string;
    collections: number;
    documents: number;
    retentionDays: number;
};

type DailyBackupOptions = {
    mongoUri?: string;
    backupRoot?: string;
    retentionDays?: string | number;
    now?: Date;
    dryRun?: boolean;
    createConnection?: (mongoUri: string) => Promise<BackupConnection>;
};

type NormalisedBackupOptions = {
    mongoUri: string;
    backupRoot: string;
    retentionDays: number;
    now: Date;
    dryRun: boolean;
    createConnection: (mongoUri: string) => Promise<BackupConnection>;
};

/**
 * Normaliza a configuração do backup antes de abrir ligação à base de dados.
 *
 * @param options Valores vindos do ambiente, CLI ou teste unitário.
 * @returns Configuração segura para executar ou ensaiar o backup diário.
 */
export function normaliseBackupOptions(
    options: DailyBackupOptions,
): NormalisedBackupOptions {
    const dryRun = options.dryRun ?? false;
    const mongoUri = options.mongoUri?.trim();
    if (!dryRun && !mongoUri) {
        throw new Error("MONGODB_URI é obrigatória para executar backup diário.");
    }
    if (mongoUri && !mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
        throw new Error("MONGODB_URI deve usar protocolo MongoDB válido.");
    }

    const retentionDays = Number(options.retentionDays ?? DEFAULT_RETENTION_DAYS);
    if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > MAX_RETENTION_DAYS) {
        throw new Error(`STUDYFLOW_BACKUP_RETENTION_DAYS deve ficar entre 1 e ${MAX_RETENTION_DAYS}.`);
    }

    const backupRoot = resolve(options.backupRoot ?? DEFAULT_BACKUP_ROOT);
    if (backupRoot === "/" || backupRoot === resolve(tmpdir())) {
        throw new Error("STUDYFLOW_BACKUP_DIR deve apontar para uma pasta dedicada.");
    }

    return {
        mongoUri: mongoUri ?? "mongodb://dry-run.invalid/studyflow",
        backupRoot,
        retentionDays,
        now: options.now ?? new Date(),
        dryRun,
        createConnection: options.createConnection ?? createMongooseConnection,
    };
}

/**
 * Executa o backup diário e devolve apenas metadados seguros para evidence.
 *
 * @param options Configuração recebida do CLI, ambiente ou teste.
 * @returns Resumo sem URI, credenciais nem documentos exportados.
 */
export async function createDailyBackup(options: DailyBackupOptions): Promise<BackupSummary> {
    const config = normaliseBackupOptions(options);
    const backupId = buildBackupId(config.now);
    const outputDir = join(config.backupRoot, backupId);
    await mkdir(outputDir, { recursive: true, mode: 0o700 });

    if (config.dryRun) {
        const summary = {
            ok: true,
            dryRun: true,
            backupId,
            outputDir,
            collections: 0,
            documents: 0,
            retentionDays: config.retentionDays,
        } satisfies BackupSummary;
        await writeManifest(outputDir, summary);
        return summary;
    }

    const connection = await config.createConnection(config.mongoUri);
    try {
        const collections = await connection.db?.collections();
        if (!collections) {
            throw new Error("Ligação MongoDB sem acesso a coleções.");
        }

        let documentCount = 0;
        for (const collection of collections) {
            const count = await collection.countDocuments({});
            documentCount += count;
            await writeCollectionBackup(collection, join(outputDir, `${collection.collectionName}.jsonl.gz`));
        }

        const summary = {
            ok: true,
            dryRun: false,
            backupId,
            outputDir,
            collections: collections.length,
            documents: documentCount,
            retentionDays: config.retentionDays,
        } satisfies BackupSummary;
        await writeManifest(outputDir, summary);
        await removeExpiredBackups(config.backupRoot, config.now, config.retentionDays);
        return summary;
    } finally {
        await connection.close();
    }
}

/**
 * Abre a ligação Mongoose usada pelo script real.
 *
 * @param mongoUri URI lida do ambiente e nunca impressa no output.
 * @returns Ligação compatível com as funções de backup.
 */
async function createMongooseConnection(mongoUri: string): Promise<BackupConnection> {
    return mongoose.createConnection(mongoUri).asPromise() as Promise<BackupConnection>;
}

/**
 * Escreve uma coleção como JSON por linha e comprime o ficheiro no próprio fluxo.
 *
 * @param collection Coleção MongoDB a exportar.
 * @param filePath Caminho final do ficheiro comprimido.
 */
async function writeCollectionBackup(collection: BackupCollectionReader, filePath: string): Promise<void> {
    async function* documentsAsLines() {
        for await (const document of collection.find({})) {
            yield `${JSON.stringify(document)}\n`;
        }
    }

    await pipeline(
        Readable.from(documentsAsLines()),
        createGzip(),
        createWriteStream(filePath, { mode: 0o600 }),
    );
}

/**
 * Escreve manifest sem incluir URI, documentos ou dados pessoais.
 *
 * @param outputDir Diretório do backup atual.
 * @param summary Resumo seguro da execução.
 */
async function writeManifest(outputDir: string, summary: BackupSummary): Promise<void> {
    await writeFile(
        join(outputDir, "manifest.json"),
        `${JSON.stringify(summary, null, 2)}\n`,
        { mode: 0o600 },
    );
}

/**
 * Remove pastas antigas dentro da raiz de backup para cumprir a retenção.
 *
 * @param backupRoot Pasta dedicada aos backups.
 * @param now Data de referência da execução.
 * @param retentionDays Número de dias a manter.
 */
async function removeExpiredBackups(backupRoot: string, now: Date, retentionDays: number): Promise<void> {
    const cutoff = now.getTime() - retentionDays * 24 * 60 * 60 * 1000;
    const entries = await readdir(backupRoot, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const target = join(backupRoot, entry.name);
        const info = await stat(target);
        if (info.mtime.getTime() < cutoff) {
            await rm(target, { recursive: true, force: true });
        }
    }
}

/**
 * Cria um identificador ordenável e seguro para o diretório diário.
 *
 * @param now Data da execução.
 * @returns Identificador sem caracteres problemáticos para sistemas de ficheiros.
 */
function buildBackupId(now: Date): string {
    return `daily-${now.toISOString().replace(/[:.]/g, "-")}`;
}

/**
 * Executa o script por CLI e só imprime resumo seguro.
 */
async function runFromCli(): Promise<void> {
    try {
        const summary = await createDailyBackup({
            mongoUri: process.env.MONGODB_URI,
            backupRoot: process.env.STUDYFLOW_BACKUP_DIR,
            retentionDays: process.env.STUDYFLOW_BACKUP_RETENTION_DAYS,
            dryRun: process.argv.includes("--dry-run"),
        });
        console.log(JSON.stringify(summary));
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha desconhecida no backup diário.";
        console.error(JSON.stringify({ ok: false, error: message }));
        process.exitCode = 1;
    }
}

const executedFileUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === executedFileUrl) {
    void runFromCli();
}
```

5. Explicação do código.

O script lê configuração por ambiente, valida retenção, cria uma pasta privada, exporta cada coleção para `.jsonl.gz`, escreve um `manifest.json` sem segredos e apaga backups antigos. A opção `--dry-run` permite confirmar configuração e permissões de escrita sem abrir MongoDB.

6. Validação do passo.

Executa `npm --prefix apps/api run build`. O build deve compilar `apps/api/src/scripts/backup-database.ts` para `apps/api/dist/scripts/backup-database.js`.

7. Cenário negativo/erro esperado.

Executa o comando sem `MONGODB_URI`. O erro esperado é JSON controlado com `ok: false` e uma mensagem a indicar que a variável é obrigatória, sem mostrar URI, password ou documentos.

### Passo 4 - Integrar scripts e agendamento diário

1. Objetivo funcional do passo no contexto da app.

Ligar o script ao `package.json` e deixar o contrato de agendamento diário pronto para deploy.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/package.json`
- CRIAR: `apps/api/ops/backup-daily.cron`

3. Instruções do que fazer.

Adiciona os scripts npm dentro de `scripts` e cria o ficheiro de cron. Mantém `nest build` antes de executar o ficheiro em `dist`, porque o projeto usa TypeScript em `src`.

4. Código completo, correto e integrado com a app final.

```json
{
  "scripts": {
    "backup:daily": "nest build && node dist/scripts/backup-database.js",
    "backup:daily:dry-run": "nest build && node dist/scripts/backup-database.js --dry-run"
  }
}
```

```cron
# apps/api/ops/backup-daily.cron
# Executa todos os dias às 02:15 no servidor que aloja a API.
# O ficheiro de ambiente do deploy deve definir MONGODB_URI, STUDYFLOW_BACKUP_DIR e STUDYFLOW_BACKUP_RETENTION_DAYS.
15 2 * * * cd /srv/studyflow && npm --prefix apps/api run backup:daily >> /var/log/studyflow-backup.log 2>&1
```

5. Explicação do código.

`backup:daily` é o comando real do requisito. `backup:daily:dry-run` serve para confirmar permissões, diretório e compilação. O cron torna o backup diário automático e deixa explícita a hora, o comando e o destino do log operacional.

6. Validação do passo.

Executa `STUDYFLOW_BACKUP_DIR="./tmp/backups" npm --prefix apps/api run backup:daily:dry-run`. O output deve ser JSON com `ok: true`, `dryRun: true` e sem dados da base.

7. Cenário negativo/erro esperado.

Se o cron apontar para um diretório de aplicação errado ou para uma pasta pública, corrige antes de considerar o BK concluído.

### Passo 5 - Adicionar teste e negativos obrigatórios

1. Objetivo funcional do passo no contexto da app.

Criar provas automatizadas para impedir regressão no backup diário.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/scripts/backup-database.spec.ts`

3. Instruções do que fazer.

Cria o teste abaixo. Ele usa uma ligação dupla de teste em memória, por isso valida a regra do script sem precisar de MongoDB local.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/scripts/backup-database.spec.ts
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
    createDailyBackup,
    normaliseBackupOptions,
    type BackupCollectionReader,
    type BackupConnection,
} from "./backup-database.js";

function collectionWithDocuments(
    collectionName: string,
    documents: Array<Record<string, unknown>>,
): BackupCollectionReader {
    return {
        collectionName,
        countDocuments: async () => documents.length,
        find: () => ({
            // O iterador em memória substitui o cursor MongoDB sem exigir uma base real no teste unitário.
            async *[Symbol.asyncIterator]() {
                for (const document of documents) {
                    yield document;
                }
            },
        }),
    };
}

describe("backup diário da StudyFlow", () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), "studyflow-backup-"));
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it("cria manifest seguro com contagem de coleções e documentos", async () => {
        const close = jest.fn(async () => undefined);
        const connection: BackupConnection = {
            db: {
                collections: async () => [
                    collectionWithDocuments("materials", [{ title: "Resumo" }]),
                    collectionWithDocuments("users", [{ email: "aluno@example.test" }]),
                ],
            },
            close,
        };

        const summary = await createDailyBackup({
            mongoUri: "mongodb://127.0.0.1:27017/studyflow",
            backupRoot: tempDir,
            now: new Date("2026-06-23T02:15:00.000Z"),
            createConnection: async () => connection,
        });

        const manifest = await readFile(join(summary.outputDir, "manifest.json"), "utf8");

        // O manifest pode provar contagens, mas nunca deve guardar URI, password ou documentos exportados.
        expect(summary.collections).toBe(2);
        expect(summary.documents).toBe(2);
        expect(manifest).not.toContain("mongodb://");
        expect(close).toHaveBeenCalledTimes(1);
    });

    it("falha sem URI no modo real", () => {
        // Sem URI configurada, o backup real deve falhar cedo para evitar execução contra destino ambíguo.
        expect(() => normaliseBackupOptions({ backupRoot: tempDir })).toThrow("MONGODB_URI");
    });

    it("falha com retenção inválida", () => {
        expect(() =>
            normaliseBackupOptions({
                mongoUri: "mongodb://127.0.0.1:27017/studyflow",
                backupRoot: tempDir,
                retentionDays: 0,
            }),
        ).toThrow("STUDYFLOW_BACKUP_RETENTION_DAYS");
    });

    it("permite dry run sem abrir ligação MongoDB", async () => {
        const createConnection = jest.fn(async () => {
            throw new Error("não deveria abrir MongoDB em dry run");
        });

        // O dry run valida configuração local sem tocar em dados reais nem abrir ligação externa.
        const summary = await createDailyBackup({
            backupRoot: tempDir,
            dryRun: true,
            createConnection,
        });

        expect(summary.dryRun).toBe(true);
        expect(createConnection).not.toHaveBeenCalled();
    });
});
```

5. Explicação do código.

O primeiro teste prova o caminho principal e confirma que o manifest não contém URI. Os três testes seguintes cobrem negativos obrigatórios: falta de URI, retenção inválida e garantia de que dry run não liga à base.

6. Validação do passo.

Executa `npm --prefix apps/api run test:unit -- backup-database.spec.ts`.

7. Cenário negativo/erro esperado.

Remove temporariamente `mongoUri` no teste principal e confirma que a falha continua explícita. Não guardes output com documentos reais na evidence.

### Passo 6 - Preparar evidence técnica e pedagógica

1. Objetivo funcional do passo no contexto da app.

Guardar prova suficiente para PR, apresentação e defesa PAP.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-11-backups-diarios-automaticos.md`
- REVER: `apps/api/src/scripts/backup-database.ts`
- REVER: `apps/api/ops/backup-daily.cron`

3. Instruções do que fazer.

Regista comandos executados, resultado observado, cenário negativo e interpretação curta. Não copies URI completa, documentos de backup, cookies, hashes, prompts privados, respostas IA privadas ou dados pessoais.

4. Código completo, correto e integrado com a app final.

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- backup-database.spec.ts
STUDYFLOW_BACKUP_DIR="./tmp/backups" npm --prefix apps/api run backup:daily:dry-run
npm --prefix apps/api run backup:daily
```

5. Explicação do código.

Os comandos cobrem compilação, testes, ensaio sem MongoDB e execução real. A execução real só deve ser usada num ambiente com `MONGODB_URI` definida de forma segura.

6. Validação do passo.

A evidence deve incluir `ok: true`, número de coleções/documentos, `dryRun` quando for ensaio, e confirmação textual de que o output não contém URI nem documentos.

7. Cenário negativo/erro esperado.

Executa `env -u MONGODB_URI npm --prefix apps/api run backup:daily` num ambiente Unix. O resultado esperado é `ok: false`; se o comando imprimir credenciais ou documentos, o BK não está concluído.

### Passo 7 - Fechar handoff para o próximo BK

1. Objetivo funcional do passo no contexto da app.

Garantir que `BK-MF6-12` consegue usar o backup como base de recuperação após falhas.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-11-backups-diarios-automaticos.md`
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md`

3. Instruções do que fazer.

Regista no PR os exports e comandos entregues: `createDailyBackup`, `normaliseBackupOptions`, `backup:daily`, `backup:daily:dry-run` e `apps/api/ops/backup-daily.cron`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fecha continuidade entre BKs. O próximo BK deve saber que existe uma cópia diária e que falhas de backup são explícitas.

6. Validação do passo.

Confirma que `BK-MF6-12` existe e que o handoff menciona os comandos e riscos residuais.

7. Cenário negativo/erro esperado.

Se a evidence não mostrar execução diária ou dry run, volta aos passos 4 a 6 antes de apresentar o BK como concluído.

#### Critérios de aceite

- `RNF21` tem comando backend verificável em `apps/api`.
- O script é TypeScript e é coberto por `npm --prefix apps/api run build`.
- O backup não coloca URI, credenciais ou documentos no output.
- Existe agendamento diário explícito em `apps/api/ops/backup-daily.cron`.
- Existe teste unitário com cenário principal e pelo menos 2 negativos.
- A retenção é validada e limitada.
- A evidence inclui comando, resultado observado, cenário negativo e interpretação curta.
- O handoff para `BK-MF6-12` lista comandos, exports e riscos residuais.

#### Validação final

- `npm --prefix apps/api run build`
- `npm --prefix apps/api run test:unit -- backup-database.spec.ts`
- `STUDYFLOW_BACKUP_DIR="./tmp/backups" npm --prefix apps/api run backup:daily:dry-run`
- `npm --prefix apps/api run backup:daily` em ambiente com `MONGODB_URI` segura
- Cenário negativo: execução sem `MONGODB_URI`

#### Evidence para PR/defesa

- pr: referência do PR ou commit com o BK implementado.
- proof_tecnico: output do build, teste unitário e dry run.
- proof_negativos: erro controlado sem `MONGODB_URI` e retenção inválida.
- proof_privacidade: confirmação de que output e manifest não incluem URI, credenciais, documentos de aluno ou conteúdo privado.
- proof_agendamento: linha de `apps/api/ops/backup-daily.cron` e hora diária definida.
- proof_handoff: nota curta a explicar como `BK-MF6-12` usa esta base para recovery.

#### Handoff

- Entrega para `BK-MF6-12`: comandos `backup:daily` e `backup:daily:dry-run`, script `createDailyBackup`, manifest seguro e agendamento diário.
- Decisão DERIVADO registada: usar Mongoose já existente para exportar coleções para `.jsonl.gz`, evitando URI em argumentos de processo.
- Risco residual: validar restore manual num ambiente de teste antes de usar como garantia total de recuperação.
- Não há alteração de RF/RNF nem mudança de matriz nesta entrega.

#### Changelog

- `2026-06-23`: guia corrigido para usar script TypeScript compilável, agendamento diário explícito, testes P1 com negativos e evidence sem segredos.
