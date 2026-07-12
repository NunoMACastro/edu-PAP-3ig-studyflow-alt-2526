/**
 * Exercita o runner e o marker transacional através de um adapter em memória.
 * O teste não abre sockets e não depende do download de binários MongoDB.
 */
import { mongo, Types } from "mongoose";
import {
    migrateStudentTeacherParity,
    STUDENT_TEACHER_PARITY_MIGRATION_ID,
} from "./migrate-student-teacher-parity.js";

type MemoryDocument = Record<string, unknown>;

class MemoryCollection {
    readonly bulkWrites: unknown[][] = [];

    constructor(readonly documents: MemoryDocument[] = []) {}

    async findOne(filter: MemoryDocument): Promise<MemoryDocument | null> {
        return (
            this.documents.find((document) =>
                Object.entries(filter).every(([key, value]) => document[key] === value),
            ) ?? null
        );
    }

    find(): { toArray: () => Promise<MemoryDocument[]> } {
        return { toArray: async () => [...this.documents] };
    }

    async bulkWrite(operations: unknown[]): Promise<void> {
        this.bulkWrites.push(operations);
    }

    async insertOne(document: MemoryDocument): Promise<void> {
        this.documents.push(document);
    }
}

class MemoryDatabase {
    private readonly collections = new Map<string, MemoryCollection>();

    collection(name: string): MemoryCollection {
        const existing = this.collections.get(name);
        if (existing) return existing;
        const created = new MemoryCollection();
        this.collections.set(name, created);
        return created;
    }
}

describe("student-teacher parity migration runner", () => {
    it("confirma dados e marker na transação e a segunda execução é idempotente", async () => {
        const database = new MemoryDatabase();
        const classId = new Types.ObjectId();
        database.collection("school_classes").documents.push({
            _id: classId,
            teacherId: new Types.ObjectId(),
            studentIds: [],
            createdAt: new Date("2026-07-01T00:00:00.000Z"),
        });
        let transactionCalls = 0;
        let endSessionCalls = 0;
        const session = {
            withTransaction: async (work: () => Promise<void>) => {
                transactionCalls += 1;
                await work();
            },
            endSession: async () => {
                endSessionCalls += 1;
            },
        };
        const client = {
            startSession: () => session,
        };
        const now = new Date("2026-07-11T12:00:00.000Z");

        const first = await migrateStudentTeacherParity(
            database as unknown as mongo.Db,
            client as unknown as mongo.MongoClient,
            { now },
        );
        const second = await migrateStudentTeacherParity(
            database as unknown as mongo.Db,
            client as unknown as mongo.MongoClient,
            { now },
        );

        expect(first.status).toBe("APPLIED");
        expect(first.counts.schoolClassesNormalised).toBe(1);
        expect(second.status).toBe("ALREADY_APPLIED");
        expect(transactionCalls).toBe(2);
        expect(endSessionCalls).toBe(2);
        expect(database.collection("school_classes").bulkWrites).toHaveLength(1);
        expect(database.collection("schema_migrations").documents).toEqual([
            expect.objectContaining({
                _id: STUDENT_TEACHER_PARITY_MIGRATION_ID,
                appliedAt: now,
            }),
        ]);
    });

    it("dry-run lê e planeia sem abrir transação nem persistir marker", async () => {
        const database = new MemoryDatabase();
        const client = {
            startSession: jest.fn(() => {
                throw new Error("não deve abrir sessão");
            }),
        };

        const result = await migrateStudentTeacherParity(
            database as unknown as mongo.Db,
            client as unknown as mongo.MongoClient,
            { dryRun: true },
        );

        expect(result.status).toBe("DRY_RUN");
        expect(client.startSession).not.toHaveBeenCalled();
        expect(database.collection("schema_migrations").documents).toHaveLength(0);
    });
});
