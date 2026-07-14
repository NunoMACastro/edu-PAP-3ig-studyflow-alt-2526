/**
 * Acrescenta a camada rica da demo: PDFs, terceira turma e estados avançados.
 */
import mongoose, { Types } from "mongoose";
import type { Model, Schema } from "mongoose";
import {
    AiContentReview,
    AiContentReviewSchema,
} from "../../modules/ai-content-reviews/schemas/ai-content-review.schema.js";
import {
    ApprovedAiQuizAttempt,
    ApprovedAiQuizAttemptSchema,
} from "../../modules/ai-content-reviews/schemas/approved-ai-quiz-attempt.schema.js";
import {
    AdaptiveExplanation,
    AdaptiveExplanationSchema,
} from "../../modules/ai/schemas/adaptive-explanation.schema.js";
import { User, UserSchema } from "../../modules/auth/schemas/user.schema.js";
import {
    ClassAiInteraction,
    ClassAiInteractionSchema,
} from "../../modules/class-ai/schemas/class-ai-interaction.schema.js";
import {
    ClassLearningActivity,
    ClassLearningActivitySchema,
} from "../../modules/class-learning-activity/schemas/class-learning-activity.schema.js";
import {
    StudentClassActivityState,
    StudentClassActivityStateSchema,
} from "../../modules/class-learning-activity/schemas/student-class-activity-state.schema.js";
import { ClassPost, ClassPostSchema } from "../../modules/class-posts/schemas/class-post.schema.js";
import {
    ClassProgressNote,
    ClassProgressNoteSchema,
} from "../../modules/class-progress/schemas/class-progress-note.schema.js";
import {
    ClassProject,
    ClassProjectSchema,
} from "../../modules/class-projects/schemas/class-project.schema.js";
import { StudentClassProjectState, StudentClassProjectStateSchema } from "../../modules/class-projects/schemas/student-class-project-state.schema.js";
import {
    ClassMembership,
    ClassMembershipSchema,
} from "../../modules/classes/schemas/class-membership.schema.js";
import { SchoolClass, SchoolClassSchema } from "../../modules/classes/schemas/school-class.schema.js";
import {
    FollowUpAlertRule,
    FollowUpAlertRuleSchema,
} from "../../modules/follow-up-alerts/schemas/follow-up-alert-rule.schema.js";
import {
    GuidedStudyRoomParticipation,
    GuidedStudyRoomParticipationSchema,
} from "../../modules/guided-study-rooms/schemas/guided-study-room-participation.schema.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomSchema,
} from "../../modules/guided-study-rooms/schemas/guided-study-room.schema.js";
import { StudentSubjectChatReadState, StudentSubjectChatReadStateSchema } from "../../modules/teacher-student-chat/schemas/student-subject-chat-read-state.schema.js";
import {
    MaterialContext,
    MaterialContextSchema,
} from "../../modules/material-contexts/schemas/material-context.schema.js";
import {
    MaterialIndexJob,
    MaterialIndexJobSchema,
} from "../../modules/material-index/schemas/material-index-job.schema.js";
import {
    MaterialVersion,
    MaterialVersionSchema,
} from "../../modules/material-versions/schemas/material-version.schema.js";
import { Material, MaterialSchema } from "../../modules/materials/schemas/material.schema.js";
import {
    OfficialMaterial,
    OfficialMaterialSchema,
} from "../../modules/official-materials/schemas/official-material.schema.js";
import {
    OfficialTestAttempt,
    OfficialTestAttemptSchema,
} from "../../modules/official-tests/schemas/official-test-attempt.schema.js";
import { OfficialTest, OfficialTestSchema } from "../../modules/official-tests/schemas/official-test.schema.js";
import { ProjectAiPlan, ProjectAiPlanSchema } from "../../modules/project-ai/schemas/project-ai-plan.schema.js";
import {
    RoomAiInteraction,
    RoomAiInteractionSchema,
} from "../../modules/study-rooms/schemas/room-ai-interaction.schema.js";
import { RoomShare, RoomShareSchema } from "../../modules/study-rooms/schemas/room-share.schema.js";
import { StudyRoom, StudyRoomSchema } from "../../modules/study-rooms/schemas/study-room.schema.js";
import { StudyArea, StudyAreaSchema } from "../../modules/study-areas/schemas/study-area.schema.js";
import {
    StudyGroupMessage,
    StudyGroupMessageSchema,
} from "../../modules/study-group-messages/schemas/study-group-message.schema.js";
import {
    StudentStudyGroupChatReadState,
    StudentStudyGroupChatReadStateSchema,
} from "../../modules/study-group-messages/schemas/student-study-group-chat-read-state.schema.js";
import {
    StudyGroupSession,
    StudyGroupSessionSchema,
} from "../../modules/study-group-sessions/schemas/study-group-session.schema.js";
import { Subject, SubjectSchema } from "../../modules/subjects/schemas/subject.schema.js";
import {
    TeacherAiVoice,
    TeacherAiVoiceSchema,
} from "../../modules/teacher-ai/schemas/teacher-ai-voice.schema.js";
import {
    TeacherClassAiVoice,
    TeacherClassAiVoiceSchema,
} from "../../modules/teacher-ai/schemas/teacher-class-ai-voice.schema.js";
import {
    TeacherStudentChatMessage,
    TeacherStudentChatMessageSchema,
} from "../../modules/teacher-student-chat/schemas/teacher-student-chat-message.schema.js";
import {
    TeacherStudentChatThread,
    TeacherStudentChatThreadSchema,
} from "../../modules/teacher-student-chat/schemas/teacher-student-chat-thread.schema.js";
import {
    DemoPdfFixture,
    DemoPdfStorage,
    StoredDemoPdf,
} from "./demo-pdf-storage.js";

type SeedModel = Model<Record<string, unknown>>;
type RichModels = ReturnType<typeof createModels>;
type StoredReference = StoredDemoPdf & { _id: Types.ObjectId };
const DAY_MS = 86_400_000;

const STUDENT_EMAILS = [
    "aluno.dev@studyflow.local",
    "ines.silva@studyflow.local",
    "joao.costa@studyflow.local",
    "maria.ferreira@studyflow.local",
    "tiago.rocha@studyflow.local",
    "beatriz.santos@studyflow.local",
    "diogo.ribeiro@studyflow.local",
    "carolina.lopes@studyflow.local",
    "miguel.alves@studyflow.local",
    "ana.mendes@studyflow.local",
    "francisco.sousa@studyflow.local",
    "matilde.correia@studyflow.local",
    "afonso.pereira@studyflow.local",
    "sofia.gomes@studyflow.local",
    "tomas.cardoso@studyflow.local",
    "larissa.nunes@studyflow.local",
    "rui.monteiro@studyflow.local",
    "eva.baptista@studyflow.local",
] as const;

export type RichDemoSeedSummary = {
    users: number;
    teachers: number;
    students: number;
    classes: number;
    subjects: number;
    officialMaterials: number;
    pdfFiles: number;
    officialTests: number;
    projects: number;
    posts: number;
    guidedRooms: number;
    orphanFiles: number;
};

/** Executa toda a expansão e devolve contagens verificadas. */
export async function seedRichDemoData(input: {
    userIds: Map<string, Types.ObjectId>;
    pdfStorage: DemoPdfStorage;
    fixtures: Map<string, DemoPdfFixture>;
}): Promise<RichDemoSeedSummary> {
    const models = createModels();
    const mainTeacherId = requiredId(input.userIds, "professor.dev@studyflow.local");
    const secondTeacherId = requiredId(input.userIds, "professora.ana@studyflow.local");
    const studentIds = STUDENT_EMAILS.map((email) => requiredId(input.userIds, email));

    const primarySubjects = await models.subject
        .find({ teacherId: mainTeacherId })
        .sort({ name: 1 })
        .lean()
        .exec() as Array<Record<string, unknown>>;
    await seedOfficialPdfCopies(models, input, primarySubjects);
    await seedPrivatePdfCopies(models, input, studentIds);
    const secondary = await seedSecondaryAcademicDomain(
        models,
        input,
        secondTeacherId,
        studentIds.slice(9),
    );
    await seedAdvancedDemoStates(models, studentIds);
    await seedSecondaryCollaboration(models, studentIds.slice(9));
    await seedSecondaryChat(models, secondTeacherId, secondary.classId, secondary.subjectId, studentIds.slice(9));

    return validateRichDemo(models, input.pdfStorage);
}

function createModels() {
    return {
        user: model(User.name, UserSchema),
        schoolClass: model(SchoolClass.name, SchoolClassSchema),
        membership: model(ClassMembership.name, ClassMembershipSchema),
        subject: model(Subject.name, SubjectSchema),
        material: model(Material.name, MaterialSchema),
        officialMaterial: model(OfficialMaterial.name, OfficialMaterialSchema),
        indexJob: model(MaterialIndexJob.name, MaterialIndexJobSchema),
        version: model(MaterialVersion.name, MaterialVersionSchema),
        context: model(MaterialContext.name, MaterialContextSchema),
        officialTest: model(OfficialTest.name, OfficialTestSchema),
        officialAttempt: model(OfficialTestAttempt.name, OfficialTestAttemptSchema),
        classPost: model(ClassPost.name, ClassPostSchema),
        project: model(ClassProject.name, ClassProjectSchema),
        projectState: model(StudentClassProjectState.name, StudentClassProjectStateSchema),
        progressNote: model(ClassProgressNote.name, ClassProgressNoteSchema),
        activity: model(ClassLearningActivity.name, ClassLearningActivitySchema),
        activityState: model(StudentClassActivityState.name, StudentClassActivityStateSchema),
        guidedRoom: model(GuidedStudyRoom.name, GuidedStudyRoomSchema),
        guidedParticipation: model(GuidedStudyRoomParticipation.name, GuidedStudyRoomParticipationSchema),
        studyArea: model(StudyArea.name, StudyAreaSchema),
        studyRoom: model(StudyRoom.name, StudyRoomSchema),
        roomShare: model(RoomShare.name, RoomShareSchema),
        roomAi: model(RoomAiInteraction.name, RoomAiInteractionSchema),
        groupMessage: model(StudyGroupMessage.name, StudyGroupMessageSchema),
        groupChatReadState: model(StudentStudyGroupChatReadState.name, StudentStudyGroupChatReadStateSchema),
        groupSession: model(StudyGroupSession.name, StudyGroupSessionSchema),
        chatThread: model(TeacherStudentChatThread.name, TeacherStudentChatThreadSchema),
        chatMessage: model(TeacherStudentChatMessage.name, TeacherStudentChatMessageSchema),
        chatReadState: model(StudentSubjectChatReadState.name, StudentSubjectChatReadStateSchema),
        review: model(AiContentReview.name, AiContentReviewSchema),
        approvedAttempt: model(ApprovedAiQuizAttempt.name, ApprovedAiQuizAttemptSchema),
        adaptive: model(AdaptiveExplanation.name, AdaptiveExplanationSchema),
        classAi: model(ClassAiInteraction.name, ClassAiInteractionSchema),
        projectAi: model(ProjectAiPlan.name, ProjectAiPlanSchema),
        alertRule: model(FollowUpAlertRule.name, FollowUpAlertRuleSchema),
        teacherVoice: model(TeacherAiVoice.name, TeacherAiVoiceSchema),
        classVoice: model(TeacherClassAiVoice.name, TeacherClassAiVoiceSchema),
    };
}

function model(name: string, schema: Schema): SeedModel {
    return (mongoose.models[name] ?? mongoose.model(name, schema)) as unknown as SeedModel;
}

async function upsert(
    target: SeedModel,
    filter: Record<string, unknown>,
    values: Record<string, unknown>,
): Promise<Types.ObjectId> {
    const document = await target.findOneAndUpdate(
        filter,
        { $set: { ...filter, ...values } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    ).select("_id").exec();
    if (!document) throw new Error(`Falha ao sincronizar ${target.modelName}.`);
    return document._id as Types.ObjectId;
}

async function seedOfficialPdfCopies(
    models: RichModels,
    input: { pdfStorage: DemoPdfStorage; fixtures: Map<string, DemoPdfFixture> },
    subjects: Array<Record<string, unknown>>,
): Promise<void> {
    for (const subject of subjects) {
        const subjectId = subject._id as Types.ObjectId;
        const teacherId = subject.teacherId as Types.ObjectId;
        const classId = subject.classId as Types.ObjectId;
        const fixtures = fixturePair(String(subject.name), input.fixtures);
        const candidates = await models.officialMaterial
            .find({ subjectId, type: "TEXT" })
            .sort({ title: 1 })
            .limit(2)
            .lean()
            .exec() as Array<Record<string, unknown>>;
        if (candidates.length !== 2) {
            throw new Error(`Disciplina ${String(subject.name)} sem dois materiais convertíveis.`);
        }
        for (const [index, candidate] of candidates.entries()) {
            await persistPdfMaterial({
                models,
                storage: input.pdfStorage,
                fixture: fixtures[index],
                target: models.officialMaterial,
                filter: { _id: candidate._id },
                values: {
                    subjectId,
                    classId,
                    teacherId,
                    title: candidate.title,
                    type: "PDF",
                    status: "PROCESSED",
                    contentRevision: 1,
                },
                scope: "OFFICIAL_SUBJECT",
                contextId: subjectId,
                teacherId,
            });
        }
    }
}

async function seedPrivatePdfCopies(
    models: RichModels,
    input: { pdfStorage: DemoPdfStorage; fixtures: Map<string, DemoPdfFixture> },
    studentIds: Types.ObjectId[],
): Promise<void> {
    const fixtures = [...input.fixtures.values()];
    for (const [index, userId] of studentIds.entries()) {
        const area = await models.studyArea.findOne({ userId }).sort({ createdAt: 1 }).lean().exec() as Record<string, unknown> | null;
        if (!area) throw new Error(`Aluno ${userId.toString()} sem área de estudo.`);
        const fixture = fixtures[index % fixtures.length];
        await persistPdfMaterial({
            models,
            storage: input.pdfStorage,
            fixture,
            target: models.material,
            filter: { userId, studyAreaId: area._id, title: `Caderno PDF: ${fixture.title}` },
            values: { type: "PDF", status: "READY" },
            scope: "PRIVATE_AREA",
            contextId: area._id as Types.ObjectId,
            userId,
        });
    }
}

async function persistPdfMaterial(input: {
    models: RichModels;
    storage: DemoPdfStorage;
    fixture: DemoPdfFixture;
    target: SeedModel;
    filter: Record<string, unknown>;
    values: Record<string, unknown>;
    scope: "PRIVATE_AREA" | "OFFICIAL_SUBJECT";
    contextId: Types.ObjectId;
    userId?: Types.ObjectId;
    teacherId?: Types.ObjectId;
}): Promise<StoredReference> {
    const existing = await input.target.findOne(input.filter).select("_id storageKey storageSha256").lean().exec() as Record<string, unknown> | null;
    let stored: StoredDemoPdf;
    if (
        typeof existing?.storageKey === "string" &&
        existing.storageSha256 === input.fixture.sha256
    ) {
        await input.storage.assertStored(existing.storageKey, input.fixture.sha256);
        stored = {
            storageKey: existing.storageKey,
            storageSha256: input.fixture.sha256,
            originalName: input.fixture.filename,
            mimeType: "application/pdf",
            sizeBytes: input.fixture.buffer.byteLength,
        };
    } else {
        stored = await input.storage.store(
            String(input.userId ?? input.teacherId),
            input.fixture,
        );
    }
    const textSnapshot = input.fixture.chunks.map(({ text }) => text).join("\n\n").slice(0, 20_000);
    const materialId = await upsert(input.target, input.filter, {
        ...input.values,
        ...stored,
        ...(input.scope === "PRIVATE_AREA"
            ? { contentText: textSnapshot.slice(0, 10_000) }
            : { textContent: textSnapshot }),
    });
    if (
        typeof existing?.storageKey === "string" &&
        existing.storageKey !== stored.storageKey
    ) {
        await input.storage.remove(existing.storageKey);
    }

    const jobId = await upsert(
        input.models.indexJob,
        { materialId, scope: input.scope, status: "DONE" },
        {
            ...(input.scope === "PRIVATE_AREA"
                ? { studyAreaId: input.contextId, userId: input.userId }
                : { subjectId: input.contextId, teacherId: input.teacherId }),
            extractedTextChunks: input.fixture.chunks,
            attempts: 1,
            maxAttempts: 3,
            availableAt: dateFromNow(-25),
            leaseToken: 1,
            completedAt: dateFromNow(-25),
        },
    );
    const versionId = await upsert(
        input.models.version,
        { materialId, scope: input.scope, versionNumber: 1 },
        {
            jobId,
            ...(input.scope === "PRIVATE_AREA"
                ? { studyAreaId: input.contextId, userId: input.userId }
                : { subjectId: input.contextId, teacherId: input.teacherId }),
            title: input.fixture.title,
            textSnapshot,
            chunksSnapshot: input.fixture.chunks,
            changeSummary: "Versão inicial preparada pela seed de demonstração.",
            active: true,
        },
    );
    await upsert(
        input.models.context,
        { scope: input.scope, contextId: input.contextId, materialId },
        {
            title: input.fixture.title,
            source: input.scope === "PRIVATE_AREA" ? "student" : "teacher",
            studentId: input.userId,
            teacherId: input.teacherId,
        },
    );
    if (input.scope === "OFFICIAL_SUBJECT") {
        await input.target.updateOne(
            { _id: materialId },
            { $set: { status: "PROCESSED", activeVersionId: versionId, contentRevision: 1 } },
            { runValidators: true },
        );
    }
    return { _id: materialId, ...stored };
}

async function seedSecondaryAcademicDomain(
    models: RichModels,
    input: { pdfStorage: DemoPdfStorage; fixtures: Map<string, DemoPdfFixture> },
    teacherId: Types.ObjectId,
    students: Types.ObjectId[],
): Promise<{ classId: Types.ObjectId; subjectId: Types.ObjectId }> {
    const classId = await upsert(models.schoolClass, { teacherId, code: "12PAP" }, {
        name: "12.º PAP", schoolYear: "2025/2026", studentIds: students,
        status: "ACTIVE", archivedAt: null, lifecycleFenceVersion: 0,
    });
    for (const [index, studentId] of students.entries()) {
        await upsert(models.membership, { classId, studentId }, {
            status: "ACTIVE", joinedAt: dateFromNow(-145 + index), joinedBy: teacherId,
            removedAt: null, joinedAtEstimated: false,
        });
    }
    const subjectId = await upsert(models.subject, { classId, name: "Projeto de Aptidão Profissional" }, {
        teacherId, code: "PAP-12", description: "Planeamento, desenvolvimento, evidências e apresentação da PAP.",
        status: "ACTIVE", archivedAt: null, lifecycleFenceVersion: 0,
    });
    const fixtureKeys = ["pap-planeamento", "web-acessivel"];
    const pdfIds: Types.ObjectId[] = [];
    for (const key of fixtureKeys) {
        const fixture = requiredFixture(input.fixtures, key);
        const stored = await persistPdfMaterial({
            models, storage: input.pdfStorage, fixture, target: models.officialMaterial,
            filter: { subjectId, title: `${fixture.title} - dossier oficial` },
            values: { classId, teacherId, type: "PDF", status: "PROCESSED", contentRevision: 1 },
            scope: "OFFICIAL_SUBJECT", contextId: subjectId, teacherId,
        });
        pdfIds.push(stored._id);
    }
    await upsert(models.officialMaterial, { subjectId, title: "Plano de avaliação da PAP" }, {
        classId, teacherId, type: "TEXT", status: "PROCESSED",
        textContent: "Critérios, marcos, evidências esperadas e preparação da apresentação final.", contentRevision: 1,
    });
    await upsert(models.officialMaterial, { subjectId, title: "Referências para documentação técnica" }, {
        classId, teacherId, type: "URL", status: "REFERENCE_ONLY",
        sourceUrl: "https://developer.mozilla.org/pt-BR/docs/Learn", contentRevision: 1,
    });

    const posts = [
        ["Calendário de checkpoints", "Os checkpoints individuais decorrem às quartas-feiras. Atualizem o registo de evidências antes da reunião."],
        ["Estrutura do relatório", "A nova estrutura inclui problema, requisitos, arquitetura, implementação, testes e reflexão crítica."],
        ["Preparação da demonstração", "Validem contas, dados e um percurso alternativo para indisponibilidade de serviços externos."],
        ["Sessão de feedback", "Tragam uma decisão técnica e uma dificuldade concreta para discussão."],
        ["Revisão de acessibilidade", "Confirmem teclado, foco visível, labels e contraste nas páginas principais."],
        ["Entrega intermédia", "A entrega deve incluir aplicação executável, evidências de teste e riscos ainda abertos."],
    ];
    for (const [index, [title, body]] of posts.entries()) {
        await upsert(models.classPost, { classId, title }, {
            teacherId, type: index % 3 === 0 ? "NOTICE" : "POST", body, tombstonedAt: null,
        });
    }
    const projects = [
        ["Entrega técnica da PAP", "Preparar uma versão estável da aplicação, com configuração documentada, dados de demonstração e evidências de validação.", 22, "PUBLISHED"],
        ["Apresentação e defesa", "Construir uma apresentação curta que explique problema, decisões, resultado, limitações e evolução futura do projeto.", 38, "PUBLISHED"],
    ] as const;
    const projectIds: Types.ObjectId[] = [];
    for (const [title, brief, offset, status] of projects) {
        projectIds.push(await upsert(models.project, { classId, title }, {
            teacherId, brief, subjectId, subjectNameSnapshot: "Projeto de Aptidão Profissional",
            subject: "Projeto de Aptidão Profissional", dueDate: dateFromNow(offset), status,
            publishedAt: dateFromNow(-18),
        }));
    }

    const testTitles = [
        "Planeamento e critérios de sucesso",
        "Segurança e proteção de dados",
        "Testes e evidências",
        "Preparação da apresentação final",
    ];
    const testIds: Types.ObjectId[] = [];
    const activityDates = new Map<string, Date[]>();
    for (const [testIndex, title] of testTitles.entries()) {
        const questions = buildQuestions(title);
        const testId = await upsert(models.officialTest, { subjectId, title }, {
            classId, teacherId, description: "Mini-teste de consolidação da PAP.",
            status: testIndex === 0 ? "CLOSED" : "PUBLISHED", questions,
            submissionFenceVersion: students.length,
            closedAt: testIndex === 0 ? dateFromNow(-12) : null,
            closedReason: testIndex === 0 ? "TEACHER" : null,
        });
        testIds.push(testId);
        for (const [studentIndex, studentId] of students.entries()) {
            const selected = questions.map((_, questionIndex) =>
                (studentIndex + questionIndex + testIndex) % 4 === 0 ? 1 : 0,
            );
            const results = questions.map((question, questionIndex) => ({
                questionIndex, selectedOptionIndex: selected[questionIndex],
                correctOptionIndex: question.correctOptionIndex,
                isCorrect: selected[questionIndex] === question.correctOptionIndex,
            }));
            const correctAnswers = results.filter(({ isCorrect }) => isCorrect).length;
            const answeredAt = dateFromNow(-20 + testIndex * 3 + studentIndex / 20);
            await upsert(models.officialAttempt, { studentId, testId, attemptNumber: 1 }, {
                subjectId, classId, attemptKey: `demo-pap-${testIndex}-${studentId}`,
                selectedOptionIndexes: selected, correctAnswers, totalQuestions: questions.length,
                percentage: Math.round(correctAnswers / questions.length * 100), results, answeredAt,
            });
            await upsert(models.activity, { sourceEventKey: `seed:pap-test:${testId}:${studentId}` }, {
                classId, studentId, subjectId, type: "OFFICIAL_TEST_ATTEMPT", occurredAt: answeredAt,
            });
            const dates = activityDates.get(studentId.toString()) ?? [];
            dates.push(answeredAt);
            activityDates.set(studentId.toString(), dates);
        }
    }
    for (const studentId of students) {
        const dates = activityDates.get(studentId.toString()) ?? [dateFromNow(-30)];
        dates.sort((left, right) => left.getTime() - right.getTime());
        await upsert(models.activityState, { classId, studentId }, {
            firstActivityAt: dates[0], lastActivityAt: dates.at(-1),
            lastActivityType: "OFFICIAL_TEST_ATTEMPT", activityCount: dates.length,
        });
    }

    const roomSeeds = [
        ["Clínica de documentação técnica", "Rever arquitetura, decisões e evidências antes da entrega.", 3, true, pdfIds[0], testIds[0]],
        ["Ensaio da demonstração", "Executar o roteiro principal e testar alternativas para falhas externas.", 9, false, pdfIds[1], testIds[3]],
        ["Revisão final entre pares", "Aplicar uma checklist cruzada de qualidade, acessibilidade e clareza.", 16, true, pdfIds[0], testIds[2]],
    ] as const;
    for (const [title, description, offset, aiEnabled, materialId, officialTestId] of roomSeeds) {
        const roomId = await upsert(models.guidedRoom, { classId, title }, {
            subjectId, teacherId, description, materialIds: [materialId.toString()],
            goal: "Sair da sessão com uma melhoria concreta validada.", officialTestId,
            startsAt: dateFromNow(offset), durationMinutes: 75, aiEnabled, status: "OPEN",
        });
        for (const [index, studentId] of students.entries()) {
            const completed = index % 4 !== 3;
            await upsert(models.guidedParticipation, { roomId, studentId }, {
                classId, status: completed ? "COMPLETED" : "VIEWED",
                firstViewedAt: dateFromNow(-7 + index / 20), lastViewedAt: dateFromNow(-4 + index / 20),
                completedAt: completed ? dateFromNow(-4 + index / 20) : null,
            });
        }
    }
    await upsert(models.progressNote, { classId, title: "Estado das entregas da PAP" }, {
        teacherId, note: "A maioria dos alunos já tem um fluxo principal demonstrável. Reforçar evidências, tratamento de falhas e apresentação das decisões.",
        difficultyTags: ["evidências", "resiliência", "comunicação"],
    });
    await upsert(models.progressNote, { classId, title: "Preparação da defesa" }, {
        teacherId, note: "Treinar respostas curtas sobre arquitetura, segurança, limitações e trabalho futuro.",
        difficultyTags: ["apresentação", "decisões técnicas"],
    });
    void projectIds;
    return { classId, subjectId };
}

async function seedAdvancedDemoStates(models: RichModels, studentIds: Types.ObjectId[]): Promise<void> {
    const classes = await models.schoolClass.find({ status: "ACTIVE" }).lean().exec() as Array<Record<string, unknown>>;
    const subjects = await models.subject.find({ status: "ACTIVE" }).lean().exec() as Array<Record<string, unknown>>;
    for (const [index, schoolClass] of classes.entries()) {
        const classId = schoolClass._id as Types.ObjectId;
        const teacherId = schoolClass.teacherId as Types.ObjectId;
        await upsert(models.classVoice, { classId }, {
            teacherId, tone: index % 2 === 0 ? "SOCRATIC" : "CALM", detailLevel: "BALANCED",
            rules: ["Começar por uma pergunta de diagnóstico.", "Usar exemplos do contexto da turma.", "Terminar com um próximo passo verificável."],
        });
        await upsert(models.alertRule, { teacherId, classId, title: "Alunos sem atividade recente" }, {
            inactiveDays: 7 + index * 3,
            message: "Consulta o progresso, envia uma mensagem breve e combina um objetivo pequeno para a próxima sessão.",
        });
    }

    for (const [subjectIndex, subject] of subjects.entries()) {
        const subjectId = subject._id as Types.ObjectId;
        const classId = subject.classId as Types.ObjectId;
        const teacherId = subject.teacherId as Types.ObjectId;
        await upsert(models.teacherVoice, { subjectId }, {
            classId, teacherId, tone: subjectIndex % 3 === 0 ? "DIRECT" : "SOCRATIC",
            detailLevel: subjectIndex % 2 === 0 ? "DETAILED" : "BALANCED",
            rules: ["Não fornecer a solução antes da tentativa do aluno.", "Citar o material oficial usado.", "Destacar erros comuns sem julgamento."],
        });
        const material = await models.officialMaterial.findOne({ subjectId, status: "PROCESSED" }).lean().exec() as Record<string, unknown> | null;
        const classDoc = classes.find((item) => String(item._id) === String(classId));
        const members = (classDoc?.studentIds as Types.ObjectId[] | undefined) ?? studentIds.slice(0, 4);
        if (!material || members.length === 0) continue;
        for (const [interactionIndex, studentId] of members.slice(0, 2).entries()) {
            await upsert(models.classAi, {
                subjectId, studentId, question: interactionIndex === 0
                    ? "Que conceitos devo rever primeiro?"
                    : "Podes propor um exercício de consolidação?",
            }, {
                classId,
                answer: interactionIndex === 0
                    ? "Começa pelos objetivos do guia, faz um diagnóstico curto e revê primeiro o conceito que bloqueia os restantes."
                    : "Resolve um caso pequeno, explica cada decisão e termina com uma variação que teste um caso limite.",
                sourceMaterialIds: [material._id],
                voiceRulesApplied: ["Pergunta de diagnóstico", "Fonte oficial"],
                voiceSource: "SUBJECT_OVERRIDE",
            });
        }

        const summaryStatus = ["APPROVED", "PENDING", "REJECTED"][subjectIndex % 3];
        await upsert(models.review, { subjectId, materialId: material._id, contentType: "SUMMARY" }, {
            teacherId,
            contentJson: { title: `Resumo aprovado de ${String(subject.name)}`, bullets: ["Conceitos essenciais organizados por prioridade.", "Exemplo orientado ligado ao material oficial.", "Checklist curta para autoavaliação."] },
            status: summaryStatus,
            teacherComment: summaryStatus === "REJECTED" ? "Reformular a explicação e citar melhor o material." : "Conteúdo adequado ao nível da turma.",
            origin: "TEACHER_AUTHORED",
        });
        const quizQuestions = buildQuizReviewQuestions(String(subject.name));
        const reviewId = await upsert(models.review, { subjectId, materialId: material._id, contentType: "QUIZ" }, {
            teacherId, contentJson: { title: `Quiz aprovado de ${String(subject.name)}`, questions: quizQuestions },
            status: "APPROVED", teacherComment: "Questões equilibradas e alinhadas com o guia oficial.",
            origin: "TEACHER_AUTHORED",
        });
        for (const [attemptIndex, studentId] of members.slice(0, 3).entries()) {
            const answers = attemptIndex === 0 ? [0, 0, 0] : [0, 1, 0];
            const correctCount = answers.filter((answer) => answer === 0).length;
            await upsert(models.approvedAttempt, { reviewId, studentId, attemptNumber: 1 }, {
                subjectId, classId, selectedOptionIndexes: answers, correctCount,
                totalQuestions: 3, scorePercent: Math.round(correctCount / 3 * 100),
                answeredAt: dateFromNow(-6 + attemptIndex / 20),
            });
        }
    }

    for (const studentId of studentIds) {
        const area = await models.studyArea.findOne({ userId: studentId }).lean().exec() as Record<string, unknown> | null;
        if (!area) continue;
        const material = await models.material.findOne({ userId: studentId, studyAreaId: area._id }).lean().exec() as Record<string, unknown> | null;
        await upsert(models.adaptive, { userId: studentId, studyAreaId: area._id, question: "Como posso ultrapassar a dificuldade que tenho neste tema?" }, {
            answer: "Divide o tema em passos pequenos, resolve um exemplo com apoio e repete um caso semelhante sem consultar a solução.",
            suggestedNextSteps: ["Rever o resumo", "Resolver um exercício", "Registar o erro mais frequente"],
            sourceMaterialIds: material ? [material._id] : [],
        });
    }

    const projects = await models.project.find({ status: "PUBLISHED" }).lean().exec() as Array<Record<string, unknown>>;
    for (const project of projects) {
        const classDoc = classes.find((item) => String(item._id) === String(project.classId));
        const studentId = (classDoc?.studentIds as Types.ObjectId[] | undefined)?.[0];
        if (!studentId) continue;
        await upsert(models.projectState, { projectId: project._id, studentId }, {
            classId: project.classId,
            status: "IN_PROGRESS",
        });
        await upsert(models.projectAi, { projectId: project._id, studentId }, {
            classId: project.classId, subjectId: project.subjectId,
            studentGoal: "Entregar uma versão demonstrável, segura e bem documentada.",
            knownDifficulties: ["dividir tarefas", "validar casos limite"],
            steps: ["Confirmar critérios de sucesso", "Implementar o fluxo principal", "Testar falhas previsíveis", "Preparar evidências e demonstração"],
            rationale: "O plano prioriza valor demonstrável antes de melhorias secundárias.",
            voiceSource: "SUBJECT_OVERRIDE", voiceTone: "SOCRATIC", voiceDetailLevel: "DETAILED",
            voiceRulesApplied: ["Passos graduais", "Perguntas de reflexão"],
        });
    }
}

async function seedSecondaryCollaboration(models: RichModels, students: Types.ObjectId[]): Promise<void> {
    const rooms = [
        ["Oficina de apresentações PAP", "Treino de demonstrações curtas e feedback entre pares."],
        ["Revisão técnica final", "Checklist colaborativa de segurança, testes e documentação."],
    ] as const;
    for (const [roomIndex, [name, description]] of rooms.entries()) {
        const members = students.slice(roomIndex, roomIndex + 6);
        const ownerStudentId = members[0];
        const roomId = await upsert(models.studyRoom, { ownerStudentId, name }, {
            type: "FREE", description, memberIds: members,
            collaborationKind: roomIndex === 0 ? "STUDY_GROUP" : "STUDY_ROOM",
            collaborationKindSource: "NATIVE",
        });
        if (roomIndex === 1) {
            const shareId = await upsert(models.roomShare, { roomId, title: "Checklist partilhada" }, {
            authorStudentId: ownerStudentId, type: "NOTE",
            textContent: "Objetivo claro, demonstração curta, evidências visíveis, riscos explicados e fallback preparado.",
            usableByAi: true, tombstonedAt: null,
            });
            await upsert(models.roomAi, { roomId, studentId: ownerStudentId, question: "Como organizamos a próxima sessão?" }, {
                answer: "Reservem dez minutos para cada demonstração, cinco para feedback e terminem com uma melhoria concreta por pessoa.",
                sourceShareIds: [shareId], visibility: "SHARED", sharedAt: dateFromNow(-2),
            });
        } else {
            let latestMessageId: Types.ObjectId | undefined;
            for (const [index, text] of ["Já preparei o roteiro.", "Posso validar a checklist de segurança.", "No final registamos as melhorias."].entries()) {
                const messageId = await upsert(models.groupMessage, { groupId: roomId, authorStudentId: members[index], text }, {
                    kind: index === 2 ? "NOTE" : "MESSAGE", tombstonedAt: null,
                });
                if (index !== 2) latestMessageId = messageId;
            }
            if (latestMessageId && members[1]) {
                await upsert(models.groupChatReadState, { studentId: members[1], groupId: roomId }, {
                    lastReadAt: dateFromNow(-1),
                    lastReadMessageId: latestMessageId,
                });
            }
            await upsert(models.groupSession, { groupId: roomId, title: "Sessão de revisão" }, {
                createdByStudentId: ownerStudentId, startsAt: dateFromNow(5 + roomIndex),
                durationMinutes: 60, goal: "Validar demonstrações e fechar melhorias prioritárias.",
            });
        }
    }
}

async function seedSecondaryChat(
    models: RichModels,
    teacherId: Types.ObjectId,
    classId: Types.ObjectId,
    subjectId: Types.ObjectId,
    students: Types.ObjectId[],
): Promise<void> {
    const threadId = await upsert(models.chatThread, { subjectId }, { classId, teacherId, status: "OPEN" });
    const messages = [
        [students[0], "STUDENT", "Professora, o roteiro da apresentação já deve incluir o fallback?"],
        [teacherId, "TEACHER", "Sim. Incluam uma alternativa curta para falhas de rede ou serviços externos."],
        [students[1], "STUDENT", "Podemos usar as evidências dos testes automatizados no relatório?"],
        [teacherId, "TEACHER", "Devem. Expliquem o comportamento validado e o resultado observado."],
        [students[2], "STUDENT", "A revisão de acessibilidade entra na próxima entrega?"],
        [teacherId, "TEACHER", "Sim, com foco nos fluxos principais e nas correções efetivamente realizadas."],
    ] as const;
    for (const [index, [authorUserId, authorRole, text]] of messages.entries()) {
        await upsert(models.chatMessage, { threadId, clientMessageId: `seed-pap-chat-${index}` }, {
            subjectId, classId, authorUserId, authorRole, text, tombstonedAt: null,
        });
    }
    if (students[0]) {
        await upsert(models.chatReadState, { studentId: students[0], subjectId }, {
            classId,
            lastReadAt: dateFromNow(-2),
        });
    }
}

async function validateRichDemo(models: RichModels, storage: DemoPdfStorage): Promise<RichDemoSeedSummary> {
    const [users, teachers, students, classes, subjects, officialMaterials, officialTests, projects, posts, guidedRooms, jobs, versions, contexts] = await Promise.all([
        models.user.countDocuments(), models.user.countDocuments({ role: "TEACHER" }),
        models.user.countDocuments({ role: "STUDENT" }), models.schoolClass.countDocuments(),
        models.subject.countDocuments(), models.officialMaterial.countDocuments(),
        models.officialTest.countDocuments(), models.project.countDocuments(),
        models.classPost.countDocuments(), models.guidedRoom.countDocuments(),
        models.indexJob.countDocuments({ status: "DONE" }), models.version.countDocuments({ active: true }),
        models.context.countDocuments(),
    ]);
    const pdfDocuments = [
        ...await models.material.find({ storageKey: { $exists: true, $ne: "" } }).select("storageKey storageSha256").lean().exec(),
        ...await models.officialMaterial.find({ storageKey: { $exists: true, $ne: "" } }).select("storageKey storageSha256").lean().exec(),
    ] as Array<Record<string, unknown>>;
    for (const document of pdfDocuments) {
        await storage.assertStored(String(document.storageKey), String(document.storageSha256));
    }
    const databaseKeys = new Set(pdfDocuments.map((document) => String(document.storageKey)));
    const committedKeys = await storage.listCommittedKeys();
    const orphanFiles = committedKeys.filter((key) => !databaseKeys.has(key)).length;
    const expected = { users: 20, teachers: 2, students: 18, classes: 3, subjects: 6, officialMaterials: 24, pdfFiles: 30, officialTests: 9, projects: 6, posts: 12, guidedRooms: 6 };
    const actual = { users, teachers, students, classes, subjects, officialMaterials, pdfFiles: pdfDocuments.length, officialTests, projects, posts, guidedRooms };
    for (const [key, value] of Object.entries(expected)) {
        if (actual[key as keyof typeof actual] !== value) {
            throw new Error(`Contagem inválida para ${key}: esperado ${value}, obtido ${actual[key as keyof typeof actual]}.`);
        }
    }
    if (jobs !== 30 || versions !== 30 || contexts !== 30 || orphanFiles !== 0 || committedKeys.length !== 30) {
        throw new Error(`Integridade PDF inválida: jobs=${jobs}, versions=${versions}, contexts=${contexts}, storage=${committedKeys.length}, órfãos=${orphanFiles}.`);
    }
    return { ...actual, orphanFiles };
}

function fixturePair(subjectName: string, fixtures: Map<string, DemoPdfFixture>): [DemoPdfFixture, DemoPdfFixture] {
    const normalized = subjectName.toLowerCase();
    const key = normalized.includes("rede") ? "redes-ipv4"
        : normalized.includes("sistema") ? "linux-admin"
            : normalized.includes("base") ? "sql-modelacao"
                : normalized.includes("web") ? "web-acessivel"
                    : "apis-seguras";
    return [requiredFixture(fixtures, key), requiredFixture(fixtures, "pap-planeamento")];
}

function requiredFixture(fixtures: Map<string, DemoPdfFixture>, key: string): DemoPdfFixture {
    const fixture = fixtures.get(key);
    if (!fixture) throw new Error(`Fixture PDF em falta: ${key}.`);
    return fixture;
}

function requiredId(ids: Map<string, Types.ObjectId>, email: string): Types.ObjectId {
    const id = ids.get(email);
    if (!id) throw new Error(`Utilizador da demo em falta: ${email}.`);
    return id;
}

function dateFromNow(dayOffset: number): Date {
    return new Date(Date.now() + dayOffset * DAY_MS);
}

function buildQuestions(topic: string) {
    return ["objetivos", "segurança", "testes", "evidências"].map((concept) => ({
        statement: `Qual prática melhora ${concept} no contexto de ${topic}?`,
        topic: concept,
        options: ["Definir um resultado verificável e recolher evidência.", "Ignorar falhas previsíveis.", "Evitar revisão por pares.", "Depender apenas da memória."],
        correctOptionIndex: 0,
    }));
}

function buildQuizReviewQuestions(subjectName: string) {
    return ["compreensão", "aplicação", "validação"].map((level) => ({
        question: `Que abordagem demonstra ${level} em ${subjectName}?`,
        options: ["Explicar uma decisão e validá-la num caso concreto.", "Copiar a solução sem testar.", "Ignorar os dados do problema.", "Evitar justificar escolhas."],
        correctOptionIndex: 0,
        explanation: "A compreensão torna-se observável quando a decisão é aplicada e validada.",
    }));
}
