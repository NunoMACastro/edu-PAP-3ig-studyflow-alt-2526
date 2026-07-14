import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";
import { migrateStudentAiConversations } from "./migrate-student-ai-conversations.js";

describe("migrateStudentAiConversations", () => {
    let server: MongoMemoryServer | undefined;
    let client: MongoClient | undefined;

    beforeAll(async () => {
        server = await MongoMemoryServer.create();
        client = await MongoClient.connect(server.getUri());
    });

    afterAll(async () => {
        await client?.close();
        await server?.stop();
    });

    it("prova dry-run, aplicação idempotente e rollback sem tocar em dados nativos", async () => {
        const database = client!.db("assistant-migration");
        const studentId = new ObjectId();
        const subjectId = new ObjectId();
        const materialId = new ObjectId();
        await database.collection("subjects").insertOne({ _id: subjectId, name: "Bases de Dados" });
        await database.collection("official_materials").insertOne({ _id: materialId, title: "Guia de normalização" });
        await database.collection("class_ai_interactions").insertMany([
            { _id: new ObjectId(), studentId, subjectId, question: "Q1", answer: "A1", sourceMaterialIds: [materialId], createdAt: new Date("2026-01-01") },
            { _id: new ObjectId(), studentId, subjectId, question: "Q2", answer: "A2", createdAt: new Date("2026-01-02") },
        ]);

        const dryRun = await migrateStudentAiConversations(database, { mode: "DRY_RUN" });
        expect(dryRun.counts).toMatchObject({ students: 1, conversations: 1, interactions: 2 });
        expect(await database.collection("student_ai_conversations").countDocuments()).toBe(0);

        const applied = await migrateStudentAiConversations(database, { mode: "APPLY", runId: "test-run" });
        expect(applied.counts).toMatchObject({ conversations: 1, interactions: 2 });
        expect(await database.collection("student_ai_conversations").countDocuments({ origin: "LEGACY_MIGRATION" })).toBe(1);
        expect(await database.collection("class_ai_interactions").countDocuments({ conversationId: { $type: "objectId" } })).toBe(2);
        expect(await database.collection("class_ai_interactions").findOne({ sourceMaterialIds: materialId })).toMatchObject({
            citationSnapshots: [{ label: "Guia de normalização", kind: "OFFICIAL_MATERIAL" }],
        });

        const second = await migrateStudentAiConversations(database, { mode: "APPLY", runId: "test-run-2" });
        expect(second.counts).toMatchObject({ conversations: 0, interactions: 0 });

        const rollback = await migrateStudentAiConversations(database, { mode: "ROLLBACK", runId: "test-run" });
        expect(rollback.counts).toMatchObject({ conversations: 1, interactions: 2 });
        expect(await database.collection("student_ai_conversations").countDocuments()).toBe(0);
        expect(await database.collection("class_ai_interactions").countDocuments({ conversationId: { $exists: true } })).toBe(0);
    });
});
