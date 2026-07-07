/**
 * Testa o comportamento de IA coletiva do grupo e documenta os cenários de aceitação automatizados.
 */
import { UnprocessableEntityException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { StudyGroupAiService } from "./study-group-ai.service.js";

const groupId = "507f1f77bcf86cd799439013";

describe("StudyGroupAiService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    it("responde usando apenas partilhas autorizadas do grupo", async () => {
        const {
            aiConsentsService,
            aiModelPoliciesService,
            aiProvider,
            aiQuotasService,
            answerModel,
            roomSharesService,
            service,
            studyGroupsService,
        } = makeService();

        await expect(
            service.ask(student, groupId, {
                question: "O que dizem as notas?",
                sourceShareIds: ["507f1f77bcf86cd799439014"],
            }),
        ).resolves.toMatchObject({
            groupId,
            question: "O que dizem as notas?",
            sources: [{ title: "Nota coletiva" }],
        });
        expect(studyGroupsService.ensureMember).toHaveBeenCalledWith(
            student.id,
            groupId,
        );
        expect(roomSharesService.findUsableSharesForRoom).toHaveBeenCalledWith(
            student.id,
            groupId,
            ["507f1f77bcf86cd799439014"],
        );
        expect(answerModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                question: "O que dizem as notas?",
                answer: "Resposta coletiva gerada pelo provider.",
                sources: [{ shareId: "507f1f77bcf86cd799439014", title: "Nota coletiva" }],
            }),
        );
        expect(aiProvider.generateStudyTool).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "EXPLANATION",
                prompt: expect.stringContaining("fontes partilhadas autorizadas"),
                options: { model: "gpt-test", timeoutMs: 5000 },
            }),
        );
        expect(aiConsentsService.assertGranted).toHaveBeenCalledWith(
            student.id,
            "GROUP_AI",
        );
        expect(aiModelPoliciesService.resolveForUse).toHaveBeenCalledWith("GROUP_AI");
        expect(aiQuotasService.reserveUsage).toHaveBeenCalledWith({
            scope: "GROUP",
            targetId: groupId,
            purpose: "GROUP_AI",
            units: 1,
        });
    });

    it("bloqueia quando o grupo não tem fontes processáveis", async () => {
        const { roomSharesService, service } = makeService();
        roomSharesService.findUsableSharesForRoom.mockResolvedValueOnce([]);

        await expect(
            service.ask(student, groupId, {
                question: "Explica.",
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
});

/**
 * Cria fixture ou estrutura auxiliar de IA coletiva do grupo para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const answerModel = {
        create: jest.fn().mockImplementation(async (input) => ({
            _id: "507f1f77bcf86cd799439099",
            ...input,
            /**
             * Transforma o apoio de teste para IA de grupos de estudo, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({ createdAt: new Date("2026-06-15T10:00:00Z") }),
        })),
    };
    const studyGroupsService = {
        ensureMember: jest.fn().mockResolvedValue({ _id: groupId }),
    };
    const roomSharesService = {
        findUsableSharesForRoom: jest.fn().mockResolvedValue([
            {
                shareId: "507f1f77bcf86cd799439014",
                title: "Nota coletiva",
                contentText: "A nota diz que devemos rever os exemplos resolvidos.",
            },
        ]),
    };
    const aiProvider = {
        generateStudyTool: jest
            .fn()
            .mockResolvedValue({ answer: "Resposta coletiva gerada pelo provider." }),
    };
    const aiConsentsService = {
        assertGranted: jest.fn().mockResolvedValue(undefined),
    };
    const aiModelPoliciesService = {
        resolveForUse: jest.fn().mockResolvedValue({
            enabled: true,
            model: "gpt-test",
            timeoutMs: 5000,
            maxSourceCount: 10,
        }),
    };
    const aiQuotasService = {
        reserveUsage: jest.fn().mockResolvedValue({ usedUnits: 1 }),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };
    const service = new StudyGroupAiService(
        answerModel as never,
        studyGroupsService as never,
        roomSharesService as never,
        aiProvider as never,
        aiConsentsService as never,
        aiModelPoliciesService as never,
        aiQuotasService as never,
        auditLogService as never,
    );
    return {
        auditLogService,
        aiConsentsService,
        aiModelPoliciesService,
        aiProvider,
        aiQuotasService,
        answerModel,
        roomSharesService,
        service,
        studyGroupsService,
    };
}
