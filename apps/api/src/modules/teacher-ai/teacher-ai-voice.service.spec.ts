/**
 * Testa o comportamento de voz da IA docente e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { TeacherAiVoiceService } from "./teacher-ai-voice.service.js";

const classId = "507f1f77bcf86cd799439014";
const subjectId = "507f1f77bcf86cd799439015";
const teacherId = "507f1f77bcf86cd799439012";

describe("TeacherAiVoiceService", () => {
    const teacher: AuthenticatedUser = {
        id: teacherId,
        email: "professor@example.test",
        role: "TEACHER",
    };
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439013",
        email: "aluno@example.test",
        role: "STUDENT",
    };

    it("cria ou atualiza a voz base da turma com regras normalizadas", async () => {
        const { classVoiceModel, service } = makeService();
        classVoiceModel.findOneAndUpdate.mockReturnValue(
            leanResult({
                _id: "507f1f77bcf86cd799439016",
                classId,
                teacherId,
                tone: "SOCRATIC",
                detailLevel: "DETAILED",
                rules: [
                    "Usar exemplos do quotidiano.",
                    "Não dar a resposta final sem explicar passos.",
                ],
            }),
        );

        await expect(
            service.updateClassTeacherVoice(teacher, classId, {
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
                    "8",
                    "9",
                    "10",
                    "11",
                ],
            }),
        ).resolves.toMatchObject({
            scope: "CLASS",
            source: "CLASS_BASE",
            hasOverride: false,
            classId,
            tone: "SOCRATIC",
            detailLevel: "DETAILED",
            rules: [
                "Usar exemplos do quotidiano.",
                "Não dar a resposta final sem explicar passos.",
            ],
        });
        expect(classVoiceModel.findOneAndUpdate).toHaveBeenCalledWith(
            { classId: expect.any(Types.ObjectId) },
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
                        "7",
                        "8",
                        "9",
                        "10",
                    ],
                },
            }),
            { new: true, upsert: true, runValidators: true },
        );
    });

    it("bloqueia configuração de voz docente por alunos", async () => {
        const { classVoiceModel, classesService, service } = makeService();

        await expect(
            service.updateClassTeacherVoice(student, classId, {
                tone: "CALM",
                detailLevel: "BALANCED",
                rules: [],
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(classesService.findOwnedClass).not.toHaveBeenCalled();
        expect(classVoiceModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("devolve a voz da turma quando a disciplina não tem override", async () => {
        const { classVoiceModel, service, voiceModel } = makeService();
        voiceModel.findOne.mockReturnValue(leanResult(null));
        classVoiceModel.findOne.mockReturnValue(
            leanResult({
                _id: "507f1f77bcf86cd799439017",
                classId,
                teacherId,
                tone: "DIRECT",
                detailLevel: "SHORT",
                rules: ["Ser objetivo."],
            }),
        );

        await expect(service.getTeacherVoice(teacher, subjectId)).resolves.toMatchObject({
            scope: "SUBJECT",
            source: "CLASS_BASE",
            hasOverride: false,
            subjectId,
            classId,
            tone: "DIRECT",
            detailLevel: "SHORT",
            rules: ["Ser objetivo."],
        });
    });

    it("dá prioridade ao override da disciplina sobre a voz da turma", async () => {
        const { classVoiceModel, service, voiceModel } = makeService();
        voiceModel.findOne.mockReturnValue(
            leanResult({
                _id: "507f1f77bcf86cd799439018",
                subjectId,
                classId,
                teacherId,
                tone: "SOCRATIC",
                detailLevel: "DETAILED",
                rules: ["Responder com perguntas orientadoras."],
            }),
        );

        await expect(service.getTeacherVoice(teacher, subjectId)).resolves.toMatchObject({
            scope: "SUBJECT",
            source: "SUBJECT_OVERRIDE",
            hasOverride: true,
            subjectId,
            classId,
            tone: "SOCRATIC",
            detailLevel: "DETAILED",
            rules: ["Responder com perguntas orientadoras."],
        });
        expect(classVoiceModel.findOne).not.toHaveBeenCalled();
    });

    it("remove o override e volta a devolver a voz herdada da turma", async () => {
        const { classVoiceModel, service, voiceModel } = makeService();
        voiceModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
        voiceModel.findOne.mockReturnValue(leanResult(null));
        classVoiceModel.findOne.mockReturnValue(
            leanResult({
                _id: "507f1f77bcf86cd799439019",
                classId,
                teacherId,
                tone: "CALM",
                detailLevel: "BALANCED",
                rules: ["Explicar passo a passo."],
            }),
        );

        await expect(
            service.deleteSubjectTeacherVoice(teacher, subjectId),
        ).resolves.toMatchObject({
            scope: "SUBJECT",
            source: "CLASS_BASE",
            hasOverride: false,
            subjectId,
            classId,
            rules: ["Explicar passo a passo."],
        });
        expect(voiceModel.deleteOne).toHaveBeenCalledWith({
            subjectId: expect.any(Types.ObjectId),
        });
    });

    it("não persiste voz se o professor não for dono da turma", async () => {
        const { classVoiceModel, classesService, service } = makeService();
        classesService.findOwnedClass.mockRejectedValueOnce(
            new Error("CLASS_NOT_FOUND"),
        );

        await expect(
            service.updateClassTeacherVoice(teacher, classId, {
                tone: "DIRECT",
                detailLevel: "SHORT",
                rules: [],
            }),
        ).rejects.toThrow("CLASS_NOT_FOUND");
        expect(classVoiceModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
});

/**
 * Cria fixture ou estrutura auxiliar de voz da IA docente para manter testes e prompts legíveis.
 * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const voiceModel = {
        deleteOne: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
    };
    const classVoiceModel = {
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
    };
    const subjectsService = {
        findOwnedSubject: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
            teacherId,
            name: "Matemática A",
            code: "MAT-A",
        }),
    };
    const classesService = {
        findOwnedClass: jest.fn().mockResolvedValue({
            _id: classId,
            teacherId,
            name: "12A",
            code: "12A",
            schoolYear: "2025/2026",
            studentIds: [],
        }),
    };
    const service = new TeacherAiVoiceService(
        voiceModel as never,
        classVoiceModel as never,
        subjectsService as never,
        classesService as never,
    );
    return {
        classVoiceModel,
        classesService,
        service,
        subjectsService,
        voiceModel,
    };
}

/**
 * Executa a operação lean result no domínio de voz da IA docente com contrato explícito.
 * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
 *
 * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function leanResult(value: unknown) {
    return { lean: jest.fn().mockResolvedValue(value) };
}
