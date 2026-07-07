/**
 * Testa o comportamento de salas de estudo e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { RoomSharesService } from "./room-shares.service.js";

const roomId = "507f1f77bcf86cd799439014";
const shareId = "507f1f77bcf86cd799439015";
const materialId = "507f1f77bcf86cd799439016";

describe("RoomSharesService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };

    it("marca URL sem texto copiado como não usável pela IA", async () => {
        const { shareModel, service } = makeService();
        shareModel.create.mockResolvedValue({
            /**
             * Transforma o apoio de teste para salas de estudo, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: shareId,
                roomId,
                authorStudentId: student.id,
                type: "URL",
                title: "Artigo",
                url: "https://example.test/artigo",
                usableByAi: false,
            }),
        });

        await expect(
            service.createShare(student, roomId, {
                type: "URL",
                title: " Artigo ",
                url: "https://example.test/artigo",
            }),
        ).resolves.toMatchObject({
            type: "URL",
            usableByAi: false,
        });
        expect(shareModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                url: "https://example.test/artigo",
                textContent: undefined,
                usableByAi: false,
            }),
        );
    });

    it("não persiste texto copiado quando URL recebe apenas whitespace", async () => {
        const { shareModel, service } = makeService();
        shareModel.create.mockResolvedValue({
            /**
             * Transforma o apoio de teste para salas de estudo, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: shareId,
                roomId,
                authorStudentId: student.id,
                type: "URL",
                title: "Artigo",
                url: "https://example.test/artigo",
                usableByAi: false,
            }),
        });

        await expect(
            service.createShare(student, roomId, {
                type: "URL",
                title: "Artigo",
                url: "https://example.test/artigo",
                copiedText: "     ",
            }),
        ).resolves.toMatchObject({
            type: "URL",
            usableByAi: false,
        });
        expect(shareModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                textContent: undefined,
                usableByAi: false,
            }),
        );
    });

    it("rejeita apontamentos sem conteúdo útil com 400", async () => {
        const { shareModel, service } = makeService();

        await expect(
            service.createShare(student, roomId, {
                type: "NOTE",
                title: "Apontamentos",
                textContent: "     ",
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(shareModel.create).not.toHaveBeenCalled();
    });

    it("usa apenas materiais próprios como referência para IA da sala", async () => {
        const { materialsService, shareModel, service } = makeService();
        materialsService.findOwnedMaterialReference.mockResolvedValue({
            _id: materialId,
            title: "Resumo",
            status: "READY",
            contentText: "Texto pronto.",
        });
        shareModel.create.mockResolvedValue({
            /**
             * Transforma o apoio de teste para salas de estudo, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: shareId,
                roomId,
                authorStudentId: student.id,
                type: "MATERIAL_REF",
                title: "Resumo",
                materialId,
                materialTitle: "Resumo",
                textContent: "Texto pronto.",
                usableByAi: true,
            }),
        });

        await expect(
            service.createShare(student, roomId, {
                type: "MATERIAL_REF",
                title: "Resumo",
                materialId,
            }),
        ).resolves.toMatchObject({
            materialId,
            usableByAi: true,
        });
        expect(materialsService.findOwnedMaterialReference).toHaveBeenCalledWith(
            student.id,
            materialId,
        );
    });

    it("rejeita referência a material inexistente ou de outro aluno", async () => {
        const { materialsService, shareModel, service } = makeService();
        materialsService.findOwnedMaterialReference.mockRejectedValue(
            new NotFoundException(),
        );

        await expect(
            service.createShare(student, roomId, {
                type: "MATERIAL_REF",
                title: "Resumo",
                materialId,
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(shareModel.create).not.toHaveBeenCalled();
    });

    it("lista apenas fontes usáveis e autorizadas para a IA", async () => {
        const { shareModel, service } = makeService();
        shareModel.find.mockReturnValue(
            sortLeanResult([
                {
                    _id: shareId,
                    roomId,
                    title: "Apontamentos",
                    textContent: "Texto partilhado.",
                },
            ]),
        );

        await expect(
            service.findUsableSharesForRoom(student.id, roomId, [shareId]),
        ).resolves.toEqual([
            {
                shareId,
                title: "Apontamentos",
                contentText: "Texto partilhado.",
            },
        ]);
        expect(shareModel.find).toHaveBeenCalledWith({
            roomId: expect.any(Types.ObjectId),
            usableByAi: true,
            textContent: { $exists: true, $ne: "" },
            _id: { $in: [expect.any(Types.ObjectId)] },
        });
    });
});

/**
 * Cria fixture ou estrutura auxiliar de salas de estudo para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const shareModel = {
        create: jest.fn(),
        find: jest.fn(),
    };
    const materialsService = {
        findOwnedMaterialReference: jest.fn(),
    };
    const studyRoomsService = {
        ensureMember: jest.fn().mockResolvedValue(undefined),
    };
    const service = new RoomSharesService(
        shareModel as never,
        materialsService as never,
        studyRoomsService as never,
    );
    return { materialsService, service, shareModel, studyRoomsService };
}

/**
 * Executa a operação lean result no domínio de salas de estudo com contrato explícito.
 *
 * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function leanResult(value: unknown) {
    return { lean: jest.fn().mockResolvedValue(value) };
}

/**
 * Executa a operação sort lean result no domínio de salas de estudo com contrato explícito.
 *
 * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function sortLeanResult(value: unknown) {
    return { sort: jest.fn().mockReturnValue(leanResult(value)) };
}
