/** Prova apply, idempotência e rollback numa base Mongo isolada. */
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";
import { migrateCollaborationKinds } from "./migrate-collaboration-kinds.js";

jest.setTimeout(120_000);

describe("collaboration kind migration integration", () => {
    it("classifica sem duplicar e reverte apenas o runId", async () => {
        const server = await MongoMemoryServer.create();
        const client = new MongoClient(server.getUri());
        await client.connect();
        try {
            const database = client.db("collaboration-migration");
            const groupId = new ObjectId();
            const roomId = new ObjectId();
            await database.collection("study_rooms").insertMany([
                { _id: groupId, name: "Grupo" },
                { _id: roomId, name: "Sala", disciplineName: "BD" },
            ]);
            await database.collection("studygroupmessages").insertOne({
                groupId,
            });
            await database.collection("room_ai_interactions").insertOne({
                roomId,
            });

            const dryRun = await migrateCollaborationKinds(database, { mode: "DRY_RUN" });
            expect(dryRun).toMatchObject({ status: "DRY_RUN", counts: { total: 2 } });

            await expect(migrateCollaborationKinds(database, {
                mode: "APPLY",
                runId: "test-run",
            })).resolves.toMatchObject({ status: "APPLY", counts: { total: 2 } });
            await expect(migrateCollaborationKinds(database, {
                mode: "APPLY",
                runId: "second-run",
            })).resolves.toMatchObject({ status: "APPLY", counts: { total: 0 } });
            expect(await database.collection("study_rooms").findOne({ _id: groupId })).toMatchObject({ collaborationKind: "STUDY_GROUP" });
            expect(await database.collection("study_rooms").findOne({ _id: roomId })).toMatchObject({ collaborationKind: "STUDY_ROOM" });

            await expect(migrateCollaborationKinds(database, {
                mode: "ROLLBACK",
                runId: "test-run",
            })).resolves.toMatchObject({ status: "ROLLBACK", reverted: 2 });
            expect(await database.collection("study_rooms").countDocuments({ collaborationKind: { $exists: true } })).toBe(0);
        } finally {
            await client.close();
            await server.stop();
        }
    });
});
