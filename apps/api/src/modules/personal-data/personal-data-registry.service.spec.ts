/**
 * Testes do registry RGPD, incluindo streaming, redaction de terceiros,
 * tombstones, retenção anónima e separação entre transação e filesystem.
 */
import { createHash } from "node:crypto";
import { Types } from "mongoose";
import {
    PERSONAL_DATA_REGISTRY,
    PERSONAL_DATA_RETENTION_DAYS,
    PersonalDataExportDownload,
    PersonalDataRegistryService,
} from "./personal-data-registry.service.js";

const userId = "507f1f77bcf86cd799439010";
const otherUserId = "507f1f77bcf86cd799439099";
const materialId = new Types.ObjectId("507f1f77bcf86cd799439011");
const fileBytes = Buffer.from("dados pessoais do ficheiro");

describe("PersonalDataRegistryService", () => {
    it("falha fechado quando surge um model sem política", () => {
        const fixture = makeFixture();
        fixture.connection.models.UnknownPersonalModel = makeModel(
            "UnknownPersonalModel",
            [],
        );

        expect(() => fixture.service.validateCoverage()).toThrow(
            "registry de dados pessoais está incompleto",
        );
    });

    it("gera attachment por stream sem hashes, internals ou IDs de terceiros", async () => {
        const { service, storageService } = makeFixture();

        const download = await service.createExportDownload(userId);
        const bundle = await readDownload(download);
        const collections = bundle.collections as Record<
            string,
            Array<Record<string, unknown>>
        >;
        const files = bundle.storedFiles as Array<Record<string, unknown>>;

        expect(Object.keys(collections)).toHaveLength(
            PERSONAL_DATA_REGISTRY.length,
        );
        expect(collections.User[0]).toMatchObject({
            _id: "SELF",
            email: "student@example.test",
        });
        expect(collections.User[0]).not.toHaveProperty("passwordHash");
        expect(collections.Material[0]).toMatchObject({ userId: "SELF" });
        expect(collections.Material[0]).not.toHaveProperty("storageKey");
        expect(collections.Material[0]).not.toHaveProperty("storageSha256");
        expect(collections.SchoolClass[0]).toMatchObject({
            studentIds: ["SELF"],
            name: "Turma partilhada",
        });
        expect(collections.SchoolClass[0]).not.toHaveProperty("teacherId");
        expect(collections.UserRoleChange[0]).toMatchObject({ actorId: "SELF" });
        expect(collections.UserRoleChange[0]).not.toHaveProperty("targetUserId");
        expect(collections.UserRoleChange[0]).not.toHaveProperty("reason");
        expect(collections.AuditEvent[0]).not.toHaveProperty("metadata");
        expect(collections.AuditEvent[0]).not.toHaveProperty("resourceId");
        expect(collections.AuditEvent).toHaveLength(2);
        expect(files).toEqual([
            {
                materialReference: String(materialId),
                originalName: "material.pdf",
                mimeType: "application/pdf",
                sizeBytes: fileBytes.byteLength,
                contentBase64: fileBytes.toString("base64"),
            },
        ]);
        expect(JSON.stringify(bundle)).not.toMatch(
            /passwordHash|storageKey|storageSha256|sha256|507f1f77bcf86cd799439099/,
        );
        expect(storageService.read).toHaveBeenCalledTimes(1);
    });

    it("tombstoniza conteúdo partilhado, puxa memberships e anonimiza auditoria com TTL", async () => {
        const { models, retentionModel, service, storageService } = makeFixture();
        const before = Date.now();

        const plan = await service.prepareDeletion(userId);
        const database = await service.applyDeletion(plan, {} as never);

        expect(plan.retentionReference).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        );
        expect(storageService.prepareDelete).toHaveBeenCalledWith(
            userId,
            `users/${userId}/material.pdf`,
        );
        expect(models.User.deleteMany).not.toHaveBeenCalled();
        expect(models.Material.deleteMany).toHaveBeenCalled();
        expect(models.SchoolClass.updateMany).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ $pull: expect.any(Object) }),
            expect.objectContaining({ session: expect.anything() }),
        );
        expect(models.StudyGroupMessage.updateMany).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                $unset: expect.objectContaining({
                    authorStudentId: 1,
                    text: 1,
                }),
                $set: expect.objectContaining({
                    tombstonedAt: expect.any(Date),
                }),
            }),
            expect.objectContaining({ session: expect.anything() }),
        );
        expect(models.StudyRoom.updateOne).toHaveBeenCalledWith(
            { _id: new Types.ObjectId("507f1f77bcf86cd799439022") },
            expect.objectContaining({
                $set: { ownerStudentId: new Types.ObjectId(otherUserId) },
                $pull: expect.any(Object),
            }),
            expect.objectContaining({ session: expect.anything() }),
        );
        expect(models.StudyRoom.deleteMany).toHaveBeenCalledWith(
            {
                _id: {
                    $in: [new Types.ObjectId("507f1f77bcf86cd799439021")],
                },
            },
            expect.objectContaining({ session: expect.anything() }),
        );
        expect(models.RoomShare.deleteMany).toHaveBeenCalledWith(
            {
                roomId: {
                    $in: [new Types.ObjectId("507f1f77bcf86cd799439021")],
                },
            },
            expect.objectContaining({ session: expect.anything() }),
        );
        for (const modelName of [
            "StudyGroupMessage",
            "StudyGroupSession",
            "StudyGroupAiAnswer",
        ]) {
            expect(models[modelName].deleteMany).toHaveBeenCalledWith(
                {
                    groupId: {
                        $in: [new Types.ObjectId("507f1f77bcf86cd799439021")],
                    },
                },
                expect.objectContaining({ session: expect.anything() }),
            );
        }
        expect(models.StudyGroupSession.updateMany).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                $set: expect.objectContaining({
                    createdByStudentId: expect.any(Types.ObjectId),
                }),
            }),
            expect.objectContaining({ session: expect.anything() }),
        );
        expect(models.AuditEvent.updateMany).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                $set: expect.objectContaining({
                    metadata: { anonymized: true },
                    expiresAt: expect.any(Date),
                }),
                $unset: { resourceId: 1 },
            }),
            expect.objectContaining({ session: expect.anything() }),
        );
        expect(
            models.AuditEvent.updateMany.mock.calls[0][1].$set,
        ).not.toHaveProperty("resourceId");
        expect(
            JSON.stringify(models.AuditEvent.updateMany.mock.calls[0][0]),
        ).toContain("resourceId");
        expect(retentionModel.create).toHaveBeenCalledWith(
            [
                expect.objectContaining({
                    receiptReference: plan.retentionReference,
                    affectedCounts: expect.any(Object),
                }),
            ],
            { session: expect.anything() },
        );
        expect(database.retentionExpiresAt.getTime()).toBeGreaterThanOrEqual(
            before + PERSONAL_DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000,
        );

        await expect(service.finalizeDeletion(plan)).resolves.toEqual({
            physicalFilesDeleted: 1,
            physicalFilesPending: 0,
        });
    });

    it("mantém outbox pendente quando o delete físico falha após commit", async () => {
        const { service, storageService } = makeFixture();
        storageService.commitDelete.mockRejectedValueOnce(new Error("disk"));
        const plan = await service.prepareDeletion(userId);

        await expect(service.finalizeDeletion(plan)).resolves.toEqual({
            physicalFilesDeleted: 0,
            physicalFilesPending: 1,
        });
    });
});

async function readDownload(
    download: PersonalDataExportDownload,
): Promise<Record<string, unknown>> {
    const chunks: Buffer[] = [];
    for await (const chunk of download.stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    await download.cleanup();
    await download.cleanup();
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<
        string,
        unknown
    >;
}

function makeFixture() {
    const material = {
        _id: materialId,
        userId: new Types.ObjectId(userId),
        title: "Material privado",
        storageKey: `users/${userId}/material.pdf`,
        storageSha256: createHash("sha256").update(fileBytes).digest("hex"),
        originalName: "material.pdf",
        mimeType: "application/pdf",
        sizeBytes: fileBytes.byteLength,
    };
    const rows: Record<string, Array<Record<string, unknown>>> = {
        User: [
            {
                _id: new Types.ObjectId(userId),
                email: "student@example.test",
                passwordHash: "never-export",
                sessionVersion: 7,
            },
        ],
        Material: [material],
        MaterialIndexJob: [],
        StudyRoom: [
            {
                _id: new Types.ObjectId("507f1f77bcf86cd799439021"),
                ownerStudentId: new Types.ObjectId(userId),
                memberIds: [new Types.ObjectId(userId)],
            },
            {
                _id: new Types.ObjectId("507f1f77bcf86cd799439022"),
                ownerStudentId: new Types.ObjectId(userId),
                memberIds: [
                    new Types.ObjectId(userId),
                    new Types.ObjectId(otherUserId),
                ],
            },
        ],
        SchoolClass: [
            {
                _id: new Types.ObjectId(),
                teacherId: new Types.ObjectId(otherUserId),
                studentIds: [
                    new Types.ObjectId(userId),
                    new Types.ObjectId(otherUserId),
                ],
                name: "Turma partilhada",
            },
        ],
        UserRoleChange: [
            {
                actorId: new Types.ObjectId(userId),
                targetUserId: new Types.ObjectId(otherUserId),
                reason: "Inclui dados de terceiro",
            },
        ],
        AuditEvent: [
            {
                actorId: new Types.ObjectId(userId),
                resourceId: otherUserId,
                metadata: { targetUserId: otherUserId },
            },
            {
                actorId: new Types.ObjectId(otherUserId),
                resourceType: "User",
                resourceId: userId,
                metadata: { targetUserId: userId },
            },
        ],
    };
    const models = Object.fromEntries(
        PERSONAL_DATA_REGISTRY.map((rule) => [
            rule.model,
            makeModel(rule.model, rows[rule.model] ?? []),
        ]),
    ) as Record<string, ReturnType<typeof makeModel>>;
    const connection = { models, transaction: jest.fn() };
    const retentionModel = { create: jest.fn().mockResolvedValue([]) };
    const storageService = {
        read: jest.fn().mockResolvedValue(fileBytes),
        prepareDelete: jest.fn().mockResolvedValue({
            operationId: "delete-1",
            ownerId: userId,
            storageKey: `users/${userId}/material.pdf`,
        }),
        commitDelete: jest.fn().mockResolvedValue(undefined),
        cancelDelete: jest.fn().mockResolvedValue(undefined),
    };

    return {
        connection,
        models,
        retentionModel,
        service: new PersonalDataRegistryService(
            connection as never,
            retentionModel as never,
            storageService as never,
        ),
        storageService,
    };
}

function makeModel(modelName: string, rows: Array<Record<string, unknown>>) {
    const makeQuery = () => {
        const query: Record<string, unknown> = {};
        query.select = jest.fn(() => query);
        query.lean = jest.fn(() => query);
        query.cursor = jest.fn(() => ({
            async *[Symbol.asyncIterator]() {
                for (const row of rows) yield row;
            },
        }));
        query.then = (
            resolve: (value: Array<Record<string, unknown>>) => unknown,
            reject: (reason: unknown) => unknown,
        ) => Promise.resolve(rows).then(resolve, reject);
        return query;
    };
    return {
        modelName,
        schema: {
            path: jest.fn((field: string) => ({
                instance:
                    (modelName === "AiGuardrailCheck" && field === "actorId") ||
                    (modelName === "AuditEvent" && field === "resourceId")
                        ? "String"
                        : "ObjectId",
            })),
        },
        find: jest.fn(() => makeQuery()),
        updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };
}
