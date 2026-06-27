/**
 * Testa o comportamento de voz da IA docente e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { TeacherAiVoiceService } from "./teacher-ai-voice.service.js";

const subjectId = "507f1f77bcf86cd799439015";
const classId = "507f1f77bcf86cd799439014";

describe("TeacherAiVoiceService", () => {
    const teacher: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "professor@example.test",
        role: "TEACHER",
    };
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439013",
        email: "aluno@example.test",
        role: "STUDENT",
    };

    it("normaliza regras vazias e limita a lista persistida", async () => {
        const { voiceModel, service } = makeService();
        voiceModel.findOneAndUpdate.mockReturnValue(
            leanResult({
                _id: "507f1f77bcf86cd799439016",
                subjectId,
                classId,
                teacherId: teacher.id,
                tone: "SOCRATIC",
                detailLevel: "DETAILED",
                rules: [
                    "Usar exemplos do quotidiano.",
                    "Não dar a resposta final sem explicar passos.",
                ],
            }),
        );

        await expect(
            service.updateTeacherVoice(teacher, subjectId, {
                tone: "SOCRATIC",
                detailLevel: "DETAILED",
                rules: [
                    " Usar exemplos do quotidiano. ",
                    "",
                    "Não dar a resposta final sem explicar passos.",
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                ],
            }),
        ).resolves.toMatchObject({
            tone: "SOCRATIC",
            detailLevel: "DETAILED",
            rules: [
                "Usar exemplos do quotidiano.",
                "Não dar a resposta final sem explicar passos.",
            ],
        });
        expect(voiceModel.findOneAndUpdate).toHaveBeenCalledWith(
            { subjectId: expect.any(Types.ObjectId) },
            expect.objectContaining({
                $set: {
                    tone: "SOCRATIC",
                    detailLevel: "DETAILED",
                    rules: [
                        "Usar exemplos do quotidiano.",
                        "Não dar a resposta final sem explicar passos.",
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                    ],
                },
            }),
            { new: true, upsert: true, runValidators: true },
        );
    });

    it("devolve voz por defeito com regras vazias quando ainda não há configuração", async () => {
        const { voiceModel, service } = makeService();
        voiceModel.findOne.mockReturnValue(leanResult(null));

        await expect(
            service.getTeacherVoice(teacher, subjectId),
        ).resolves.toMatchObject({
            subjectId,
            tone: "CALM",
            detailLevel: "BALANCED",
            rules: [],
        });
    });

    it("bloqueia configuração por alunos", async () => {
        const { subjectsService, voiceModel, service } = makeService();

        await expect(
            service.updateTeacherVoice(student, subjectId, {
                tone: "CALM",
                detailLevel: "BALANCED",
                rules: [],
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(subjectsService.findOwnedSubject).not.toHaveBeenCalled();
        expect(voiceModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
});

/**
 * Cria fixture ou estrutura auxiliar de voz da IA docente para manter testes e prompts legíveis.
 * @returns Valor de voz da IA docente no contrato esperado pelo chamador.
 */
function makeService() {
    const voiceModel = {
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
    };
    const subjectsService = {
        findOwnedSubject: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "Matemática A",
            code: "MAT-A",
        }),
    };
    const service = new TeacherAiVoiceService(
        voiceModel as never,
        subjectsService as never,
    );
    return { service, subjectsService, voiceModel };
}

/**
 * Executa a operação lean result no domínio de voz da IA docente com contrato explícito.
 *
 * @param value Valor bruto recebido antes de normalização, parsing ou validação.
 * @returns Valor de voz da IA docente no contrato esperado pelo chamador.
 */
function leanResult(value: unknown) {
    return { lean: jest.fn().mockResolvedValue(value) };
}
