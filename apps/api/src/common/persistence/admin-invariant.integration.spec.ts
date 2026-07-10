/**
 * Integração real do invariant de administradores sobre Mongo replica set.
 * Não usa a base configurada no `.env` nem abre portas HTTP.
 */
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { createConnection, type Connection } from "mongoose";
import { AdminUsersService } from "../../modules/admin-users/admin-users.service.js";
import {
    UserRoleChange,
    UserRoleChangeSchema,
} from "../../modules/admin-users/schemas/user-role-change.schema.js";
import { User, UserSchema } from "../../modules/auth/schemas/user.schema.js";

jest.setTimeout(60_000);

describe("invariant transacional do último administrador", () => {
    let replicaSet: MongoMemoryReplSet;
    let connection: Connection;

    beforeAll(async () => {
        replicaSet = await MongoMemoryReplSet.create({
            replSet: {
                count: 1,
                name: "studyflow-admin-invariant-rs",
                storageEngine: "wiredTiger",
            },
        });
        connection = await createConnection(
            replicaSet.getUri("studyflow_test"),
        ).asPromise();
        connection.model(User.name, UserSchema);
        connection.model(UserRoleChange.name, UserRoleChangeSchema);
    });

    afterAll(async () => {
        await connection?.close();
        await replicaSet?.stop();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
    });

    it("serializa duas despromoções e preserva exatamente um admin", async () => {
        const { service, userModel } = await makeService();
        const [first, second] = await userModel.create([
            makeAdmin("admin.one@studyflow.test"),
            makeAdmin("admin.two@studyflow.test"),
        ]);

        const outcomes = await Promise.allSettled([
            service.changeRole(toActor(first), String(first._id), {
                role: "TEACHER",
                reason: "Teste concorrente um",
            }),
            service.changeRole(toActor(second), String(second._id), {
                role: "TEACHER",
                reason: "Teste concorrente dois",
            }),
        ]);

        expect(outcomes.filter((result) => result.status === "fulfilled")).toHaveLength(1);
        expect(outcomes.filter((result) => result.status === "rejected")).toHaveLength(1);
        await expect(
            userModel.countDocuments({ role: "ADMIN", accountStatus: "ACTIVE" }),
        ).resolves.toBe(1);
    });

    it("faz rollback da role e do histórico quando a auditoria falha", async () => {
        const { roleChangeModel, service, userModel } = await makeService(true);
        const [actor, target] = await userModel.create([
            makeAdmin("admin.rollback@studyflow.test"),
            {
                ...makeAdmin("teacher.rollback@studyflow.test"),
                role: "TEACHER",
            },
        ]);

        await expect(
            service.changeRole(toActor(actor), String(target._id), {
                role: "ADMIN",
                reason: "Fault injection da auditoria",
            }),
        ).rejects.toThrow("AUDIT_FAULT_INJECTION");

        await expect(userModel.findById(target._id).lean()).resolves.toMatchObject({
            role: "TEACHER",
            sessionVersion: 0,
        });
        await expect(roleChangeModel.countDocuments({})).resolves.toBe(0);
    });

    it("não conta um admin com eliminação pendente como salvaguarda ativa", async () => {
        const { service, userModel } = await makeService();
        const [pending, active] = await userModel.create([
            makeAdmin("admin.pending@studyflow.test"),
            makeAdmin("admin.active@studyflow.test"),
        ]);
        await userModel.updateOne(
            { _id: pending._id },
            { $set: { accountStatus: "DELETION_PENDING" } },
        );

        await expect(
            service.changeRole(toActor(active), String(active._id), {
                role: "TEACHER",
                reason: "Não pode remover o único admin ativo",
            }),
        ).rejects.toMatchObject({
            response: expect.objectContaining({ code: "LAST_ADMIN_REQUIRED" }),
        });
        await expect(userModel.findById(active._id).lean()).resolves.toMatchObject({
            role: "ADMIN",
            accountStatus: "ACTIVE",
        });
    });

    async function makeService(failAudit = false) {
        const userModel = connection.model(User.name);
        const roleChangeModel = connection.model(UserRoleChange.name);
        await Promise.all([userModel.createIndexes(), roleChangeModel.createIndexes()]);
        const auditLogService = {
            record: jest.fn(async () => {
                if (failAudit) throw new Error("AUDIT_FAULT_INJECTION");
            }),
        };
        return {
            userModel,
            roleChangeModel,
            service: new AdminUsersService(
                userModel as never,
                roleChangeModel as never,
                auditLogService as never,
                connection,
            ),
        };
    }
});

function makeAdmin(email: string) {
    return {
        email,
        passwordHash: "integration-only-not-a-real-hash",
        role: "ADMIN" as const,
        authProvider: "local" as const,
        accountStatus: "ACTIVE" as const,
        sessionVersion: 0,
        roleInvariantVersion: 0,
    };
}

function toActor(user: { _id: unknown; email: string }) {
    return {
        id: String(user._id),
        email: user.email,
        role: "ADMIN" as const,
    };
}
