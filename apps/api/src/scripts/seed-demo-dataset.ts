/**
 * Cria um dataset demo idempotente para validar e apresentar a aplicação.
 */
import "../common/config/load-env.js";
import bcrypt from "bcrypt";
import mongoose, { Model, Schema, Types } from "mongoose";
import {
    AccountDeletionRequest,
    AccountDeletionRequestSchema,
} from "../modules/account-deletion/schemas/account-deletion-request.schema.js";
import {
    AiConsent,
    AiConsentPurpose,
    AiConsentSchema,
} from "../modules/ai-consents/schemas/ai-consent.schema.js";
import {
    AiContentReview,
    AiContentReviewSchema,
} from "../modules/ai-content-reviews/schemas/ai-content-review.schema.js";
import {
    AiModelPolicy,
    AiModelPolicySchema,
} from "../modules/ai-model-policies/schemas/ai-model-policy.schema.js";
import {
    AiQuotaPolicy,
    AiQuotaPolicySchema,
} from "../modules/ai-quotas/schemas/ai-quota-policy.schema.js";
import {
    AiQuotaUsage,
    AiQuotaUsageSchema,
} from "../modules/ai-quotas/schemas/ai-quota-usage.schema.js";
import {
    AdaptiveExplanation,
    AdaptiveExplanationSchema,
} from "../modules/ai/schemas/adaptive-explanation.schema.js";
import {
    AiAreaProfile,
    AiAreaProfileSchema,
} from "../modules/ai/schemas/ai-area-profile.schema.js";
import {
    AiArtifact,
    AiArtifactSchema,
} from "../modules/ai/schemas/ai-artifact.schema.js";
import {
    AiQuizAttempt,
    AiQuizAttemptSchema,
} from "../modules/ai/schemas/ai-quiz-attempt.schema.js";
import {
    LearningProfile,
    LearningProfileSchema,
} from "../modules/ai/schemas/learning-profile.schema.js";
import {
    QuizGenerationJob,
    QuizGenerationJobSchema,
} from "../modules/ai/schemas/quiz-generation-job.schema.js";
import {
    AuditEvent,
    AuditEventSchema,
} from "../modules/audit-log/schemas/audit-event.schema.js";
import {
    User,
    UserRole,
    UserSchema,
} from "../modules/auth/schemas/user.schema.js";
import {
    ClassAiInteraction,
    ClassAiInteractionSchema,
} from "../modules/class-ai/schemas/class-ai-interaction.schema.js";
import {
    ClassPost,
    ClassPostSchema,
} from "../modules/class-posts/schemas/class-post.schema.js";
import {
    ClassProgressNote,
    ClassProgressNoteSchema,
} from "../modules/class-progress/schemas/class-progress-note.schema.js";
import {
    ClassProject,
    ClassProjectSchema,
} from "../modules/class-projects/schemas/class-project.schema.js";
import {
    SchoolClass,
    SchoolClassSchema,
} from "../modules/classes/schemas/school-class.schema.js";
import {
    ContextNotification,
    ContextNotificationSchema,
} from "../modules/context-notifications/schemas/context-notification.schema.js";
import {
    FollowUpAlertRule,
    FollowUpAlertRuleSchema,
} from "../modules/follow-up-alerts/schemas/follow-up-alert-rule.schema.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomSchema,
} from "../modules/guided-study-rooms/schemas/guided-study-room.schema.js";
import {
    MaterialContext,
    MaterialContextSchema,
} from "../modules/material-contexts/schemas/material-context.schema.js";
import {
    MaterialIndexJob,
    MaterialIndexJobSchema,
} from "../modules/material-index/schemas/material-index-job.schema.js";
import {
    MaterialStructure,
    MaterialStructureSchema,
} from "../modules/material-structure/schemas/material-structure.schema.js";
import {
    MaterialVersion,
    MaterialVersionSchema,
} from "../modules/material-versions/schemas/material-version.schema.js";
import {
    Material,
    MaterialSchema,
} from "../modules/materials/schemas/material.schema.js";
import {
    NotificationChannelPolicy,
    NotificationChannelPolicySchema,
} from "../modules/notification-policies/schemas/notification-channel-policy.schema.js";
import {
    NotificationPreference,
    NotificationPreferenceSchema,
} from "../modules/notification-preferences/schemas/notification-preference.schema.js";
import {
    OfficialMaterial,
    OfficialMaterialSchema,
} from "../modules/official-materials/schemas/official-material.schema.js";
import {
    OfficialTestAttempt,
    OfficialTestAttemptSchema,
} from "../modules/official-tests/schemas/official-test-attempt.schema.js";
import {
    OfficialTest,
    OfficialTestSchema,
} from "../modules/official-tests/schemas/official-test.schema.js";
import {
    PrivateAreaAiAnswer,
    PrivateAreaAiAnswerSchema,
} from "../modules/private-area-ai/schemas/private-area-ai-answer.schema.js";
import {
    ProjectAiPlan,
    ProjectAiPlanSchema,
} from "../modules/project-ai/schemas/project-ai-plan.schema.js";
import {
    StudentProfile,
    StudentProfileSchema,
} from "../modules/students/schemas/student-profile.schema.js";
import {
    StudyArea,
    StudyAreaSchema,
} from "../modules/study-areas/schemas/study-area.schema.js";
import {
    StudyGroupAiAnswer,
    StudyGroupAiAnswerSchema,
} from "../modules/study-group-ai/schemas/study-group-ai-answer.schema.js";
import {
    StudyGroupMessage,
    StudyGroupMessageSchema,
} from "../modules/study-group-messages/schemas/study-group-message.schema.js";
import {
    StudyGroupSession,
    StudyGroupSessionSchema,
} from "../modules/study-group-sessions/schemas/study-group-session.schema.js";
import {
    RoomAiInteraction,
    RoomAiInteractionSchema,
} from "../modules/study-rooms/schemas/room-ai-interaction.schema.js";
import {
    RoomShare,
    RoomShareSchema,
} from "../modules/study-rooms/schemas/room-share.schema.js";
import {
    StudyRoom,
    StudyRoomSchema,
} from "../modules/study-rooms/schemas/study-room.schema.js";
import {
    StudyEvent,
    StudyEventSchema,
} from "../modules/study/schemas/study-event.schema.js";
import {
    StudyGoal,
    StudyGoalSchema,
} from "../modules/study/schemas/study-goal.schema.js";
import {
    StudyRoutine,
    StudyRoutineSchema,
} from "../modules/study/schemas/study-routine.schema.js";
import {
    Subject,
    SubjectSchema,
} from "../modules/subjects/schemas/subject.schema.js";
import {
    TeacherAiVoice,
    TeacherAiVoiceSchema,
} from "../modules/teacher-ai/schemas/teacher-ai-voice.schema.js";
import {
    TeacherClassAiVoice,
    TeacherClassAiVoiceSchema,
} from "../modules/teacher-ai/schemas/teacher-class-ai-voice.schema.js";

const BCRYPT_COST = 12;
const DEMO_CLASS_CODE = "PAP-DEMO-2026";
const DEMO_POLICY_VERSION = "demo-2026-07";
const DEMO_PERIOD = "2026-07";

type SeedDocument = Record<string, unknown> & { _id: Types.ObjectId };
type SeedModel = Model<SeedDocument>;

type DemoUserSeed = {
    email: string;
    password: string;
    role: UserRole;
};

const demoUsers: DemoUserSeed[] = [
    {
        email: "admin.demo@studyflow.local",
        password: "admin-demo-12345",
        role: "ADMIN",
    },
    {
        email: "professor.dev@studyflow.local",
        password: "professor-dev-12345",
        role: "TEACHER",
    },
    {
        email: "aluno.dev@studyflow.local",
        password: "aluno-dev-12345",
        role: "STUDENT",
    },
    {
        email: "aluno2.demo@studyflow.local",
        password: "aluno2-demo-12345",
        role: "STUDENT",
    },
];

const aiPurposes: AiConsentPurpose[] = [
    "PRIVATE_AREA_AI",
    "GROUP_AI",
    "CLASS_AI",
    "PROJECT_AI",
    "SOURCE_GROUNDED_AI",
    "EXTERNAL_KNOWLEDGE_AI",
    "ADAPTIVE_EXPLANATION",
    "SUMMARY",
    "STUDY_TOOL",
];

const models = {
    accountDeletionRequest: getModel(AccountDeletionRequest.name, AccountDeletionRequestSchema),
    adaptiveExplanation: getModel(AdaptiveExplanation.name, AdaptiveExplanationSchema),
    aiAreaProfile: getModel(AiAreaProfile.name, AiAreaProfileSchema),
    aiArtifact: getModel(AiArtifact.name, AiArtifactSchema),
    aiConsent: getModel(AiConsent.name, AiConsentSchema),
    aiContentReview: getModel(AiContentReview.name, AiContentReviewSchema),
    aiModelPolicy: getModel(AiModelPolicy.name, AiModelPolicySchema),
    aiQuizAttempt: getModel(AiQuizAttempt.name, AiQuizAttemptSchema),
    aiQuotaPolicy: getModel(AiQuotaPolicy.name, AiQuotaPolicySchema),
    aiQuotaUsage: getModel(AiQuotaUsage.name, AiQuotaUsageSchema),
    auditEvent: getModel(AuditEvent.name, AuditEventSchema),
    classAiInteraction: getModel(ClassAiInteraction.name, ClassAiInteractionSchema),
    classPost: getModel(ClassPost.name, ClassPostSchema),
    classProgressNote: getModel(ClassProgressNote.name, ClassProgressNoteSchema),
    classProject: getModel(ClassProject.name, ClassProjectSchema),
    contextNotification: getModel(ContextNotification.name, ContextNotificationSchema),
    followUpAlertRule: getModel(FollowUpAlertRule.name, FollowUpAlertRuleSchema),
    guidedStudyRoom: getModel(GuidedStudyRoom.name, GuidedStudyRoomSchema),
    learningProfile: getModel(LearningProfile.name, LearningProfileSchema),
    material: getModel(Material.name, MaterialSchema),
    materialContext: getModel(MaterialContext.name, MaterialContextSchema),
    materialIndexJob: getModel(MaterialIndexJob.name, MaterialIndexJobSchema),
    materialStructure: getModel(MaterialStructure.name, MaterialStructureSchema),
    materialVersion: getModel(MaterialVersion.name, MaterialVersionSchema),
    notificationChannelPolicy: getModel(NotificationChannelPolicy.name, NotificationChannelPolicySchema),
    notificationPreference: getModel(NotificationPreference.name, NotificationPreferenceSchema),
    officialMaterial: getModel(OfficialMaterial.name, OfficialMaterialSchema),
    officialTest: getModel(OfficialTest.name, OfficialTestSchema),
    officialTestAttempt: getModel(OfficialTestAttempt.name, OfficialTestAttemptSchema),
    privateAreaAiAnswer: getModel(PrivateAreaAiAnswer.name, PrivateAreaAiAnswerSchema),
    projectAiPlan: getModel(ProjectAiPlan.name, ProjectAiPlanSchema),
    quizGenerationJob: getModel(QuizGenerationJob.name, QuizGenerationJobSchema),
    roomAiInteraction: getModel(RoomAiInteraction.name, RoomAiInteractionSchema),
    roomShare: getModel(RoomShare.name, RoomShareSchema),
    schoolClass: getModel(SchoolClass.name, SchoolClassSchema),
    studentProfile: getModel(StudentProfile.name, StudentProfileSchema),
    studyArea: getModel(StudyArea.name, StudyAreaSchema),
    studyEvent: getModel(StudyEvent.name, StudyEventSchema),
    studyGoal: getModel(StudyGoal.name, StudyGoalSchema),
    studyGroupAiAnswer: getModel(StudyGroupAiAnswer.name, StudyGroupAiAnswerSchema),
    studyGroupMessage: getModel(StudyGroupMessage.name, StudyGroupMessageSchema),
    studyGroupSession: getModel(StudyGroupSession.name, StudyGroupSessionSchema),
    studyRoom: getModel(StudyRoom.name, StudyRoomSchema),
    studyRoutine: getModel(StudyRoutine.name, StudyRoutineSchema),
    subject: getModel(Subject.name, SubjectSchema),
    teacherAiVoice: getModel(TeacherAiVoice.name, TeacherAiVoiceSchema),
    teacherClassAiVoice: getModel(TeacherClassAiVoice.name, TeacherClassAiVoiceSchema),
    user: getModel(User.name, UserSchema),
};

/**
 * Executa a seed demo.
 *
 * @returns Não devolve payload; termina quando todos os upserts ficam concluídos.
 */
async function main(): Promise<void> {
    assertSafeEnvironment();

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("Define MONGODB_URI antes de executar a seed demo.");
    }

    await mongoose.connect(mongoUri);

    const { admin, teacher, student, secondStudent } = await seedUsers();
    await seedStudentProfiles(student, secondStudent);
    const schoolClass = await seedClass(teacher, student, secondStudent);
    const { programmingSubject, mathSubject } = await seedSubjects(teacher, schoolClass);
    const officialMaterials = await seedOfficialMaterials(
        teacher,
        schoolClass,
        programmingSubject,
        mathSubject,
    );
    const studyAreas = await seedStudyAreas(student);
    const privateMaterials = await seedPrivateStudy(student, studyAreas);
    const materialIndexJobs = await seedIndexing(
        student,
        teacher,
        studyAreas,
        privateMaterials,
        officialMaterials,
        programmingSubject,
        mathSubject,
    );
    await seedPersonalStudy(student, studyAreas, privateMaterials, materialIndexJobs);
    const artifacts = await seedAiArtifacts(student, studyAreas.mathArea, privateMaterials.mathMaterial);
    await seedTeacherExperience(
        teacher,
        schoolClass,
        programmingSubject,
        mathSubject,
        officialMaterials,
        student,
        secondStudent,
    );
    const room = await seedCollaboration(student, secondStudent, privateMaterials.mathMaterial);
    await seedGovernance(
        admin,
        teacher,
        student,
        secondStudent,
        schoolClass,
        room,
        artifacts.quizArtifact,
    );

    await mongoose.disconnect();
    console.log("Seed demo StudyFlow concluída sem apagar dados externos.");
}

/**
 * Regista ou reutiliza um modelo Mongoose sem recompilar schemas.
 *
 * @param modelName Nome público do modelo.
 * @param schema Schema associado ao modelo.
 * @returns Modelo pronto a usar.
 */
function getModel(modelName: string, schema: Schema): SeedModel {
    return (mongoose.models[modelName] ?? mongoose.model(modelName, schema)) as SeedModel;
}

/**
 * Impede execução em produção.
 *
 * @returns Não devolve payload; lança erro se o ambiente for inseguro.
 */
function assertSafeEnvironment(): void {
    if (process.env.NODE_ENV === "production") {
        throw new Error("A seed demo não pode correr em produção.");
    }
}

/**
 * Faz upsert de um documento demo com validação Mongoose.
 *
 * @param model Modelo onde o documento será persistido.
 * @param filter Filtro estável que identifica o documento demo.
 * @param values Valores finais do documento.
 * @returns Documento criado ou atualizado.
 */
async function upsertOne(
    model: SeedModel,
    filter: Record<string, unknown>,
    values: Record<string, unknown>,
): Promise<SeedDocument> {
    const document = await model
        .findOneAndUpdate(
            filter,
            { $set: values },
            {
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true,
                upsert: true,
            },
        )
        .exec();

    if (!document) {
        throw new Error("Não foi possível criar ou atualizar documento demo.");
    }

    return document;
}

/**
 * Devolve o ObjectId de um documento de seed.
 *
 * @param document Documento Mongoose criado ou atualizado.
 * @returns ObjectId normalizado.
 */
function documentId(document: SeedDocument): Types.ObjectId {
    return toObjectId(document._id);
}

/**
 * Normaliza valores para ObjectId.
 *
 * @param value Valor lido do documento.
 * @returns ObjectId correspondente.
 */
function toObjectId(value: unknown): Types.ObjectId {
    if (value instanceof Types.ObjectId) return value;
    return new Types.ObjectId(String(value));
}

/**
 * Cria ou atualiza contas demo reservadas.
 *
 * @returns Utilizadores criados ou atualizados.
 */
async function seedUsers() {
    const seeded = new Map<string, SeedDocument>();

    for (const seed of demoUsers) {
        const passwordHash = await bcrypt.hash(seed.password, BCRYPT_COST);
        const user = await upsertOne(
            models.user,
            { email: seed.email },
            {
                email: seed.email,
                passwordHash,
                role: seed.role,
                authProvider: "local",
            },
        );
        seeded.set(seed.email, user);
    }

    return {
        admin: requireSeeded(seeded, "admin.demo@studyflow.local"),
        teacher: requireSeeded(seeded, "professor.dev@studyflow.local"),
        student: requireSeeded(seeded, "aluno.dev@studyflow.local"),
        secondStudent: requireSeeded(seeded, "aluno2.demo@studyflow.local"),
    };
}

/**
 * Obtém um utilizador sem permitir falha silenciosa.
 *
 * @param users Mapa de utilizadores semeados.
 * @param email Email esperado.
 * @returns Documento do utilizador.
 */
function requireSeeded(users: Map<string, SeedDocument>, email: string): SeedDocument {
    const user = users.get(email);
    if (!user) throw new Error(`Utilizador demo em falta: ${email}`);
    return user;
}

/**
 * Cria perfis escolares dos alunos demo.
 *
 * @param student Aluno principal.
 * @param secondStudent Segundo aluno.
 */
async function seedStudentProfiles(
    student: SeedDocument,
    secondStudent: SeedDocument,
): Promise<void> {
    await upsertOne(
        models.studentProfile,
        { userId: documentId(student) },
        {
            userId: documentId(student),
            name: "Inês Ferreira",
            year: "12.º ano",
            course: "Técnico de Gestão e Programação de Sistemas Informáticos",
            className: "12.º PAP Demo 2025/2026",
        },
    );
    await upsertOne(
        models.studentProfile,
        { userId: documentId(secondStudent) },
        {
            userId: documentId(secondStudent),
            name: "Miguel Costa",
            year: "12.º ano",
            course: "Técnico de Gestão e Programação de Sistemas Informáticos",
            className: "12.º PAP Demo 2025/2026",
        },
    );
}

/**
 * Cria a turma oficial da demo.
 *
 * @param teacher Professor demo.
 * @param student Aluno principal.
 * @param secondStudent Segundo aluno.
 * @returns Turma demo.
 */
async function seedClass(
    teacher: SeedDocument,
    student: SeedDocument,
    secondStudent: SeedDocument,
): Promise<SeedDocument> {
    return upsertOne(
        models.schoolClass,
        { teacherId: documentId(teacher), code: DEMO_CLASS_CODE },
        {
            teacherId: documentId(teacher),
            name: "12.º PAP Demo 2025/2026",
            code: DEMO_CLASS_CODE,
            schoolYear: "2025/2026",
            studentIds: [documentId(student), documentId(secondStudent)],
        },
    );
}

/**
 * Cria disciplinas oficiais da demo.
 *
 * @param teacher Professor demo.
 * @param schoolClass Turma demo.
 * @returns Disciplinas criadas.
 */
async function seedSubjects(teacher: SeedDocument, schoolClass: SeedDocument) {
    const programmingSubject = await upsertOne(
        models.subject,
        { classId: documentId(schoolClass), name: "Programação" },
        {
            classId: documentId(schoolClass),
            teacherId: documentId(teacher),
            name: "Programação",
            code: "PROG-PAP",
            description: "Disciplina demo para API, Node.js, testes e arquitetura.",
        },
    );
    const mathSubject = await upsertOne(
        models.subject,
        { classId: documentId(schoolClass), name: "Matemática A" },
        {
            classId: documentId(schoolClass),
            teacherId: documentId(teacher),
            name: "Matemática A",
            code: "MAT-A",
            description: "Disciplina demo para derivadas, limites e estudo autónomo.",
        },
    );

    return { programmingSubject, mathSubject };
}

/**
 * Cria materiais oficiais processados para professor e turma.
 *
 * @param teacher Professor demo.
 * @param schoolClass Turma demo.
 * @param programmingSubject Disciplina de Programação.
 * @param mathSubject Disciplina de Matemática.
 * @returns Materiais oficiais criados.
 */
async function seedOfficialMaterials(
    teacher: SeedDocument,
    schoolClass: SeedDocument,
    programmingSubject: SeedDocument,
    mathSubject: SeedDocument,
) {
    const programmingMaterial = await upsertOne(
        models.officialMaterial,
        { subjectId: documentId(programmingSubject), title: "Guia oficial: API REST com Node.js" },
        {
            subjectId: documentId(programmingSubject),
            classId: documentId(schoolClass),
            teacherId: documentId(teacher),
            title: "Guia oficial: API REST com Node.js",
            type: "TEXT",
            status: "PROCESSED",
            textContent:
                "Uma API REST organiza recursos, valida entradas, autentica pedidos e devolve respostas previsíveis em JSON.",
        },
    );
    const mathMaterial = await upsertOne(
        models.officialMaterial,
        { subjectId: documentId(mathSubject), title: "Ficha oficial: derivadas e aplicações" },
        {
            subjectId: documentId(mathSubject),
            classId: documentId(schoolClass),
            teacherId: documentId(teacher),
            title: "Ficha oficial: derivadas e aplicações",
            type: "TEXT",
            status: "PROCESSED",
            textContent:
                "A derivada mede a taxa de variação instantânea e permite estudar crescimento, extremos e tangentes.",
        },
    );

    return { programmingMaterial, mathMaterial };
}

/**
 * Cria áreas privadas do aluno.
 *
 * @param student Aluno principal.
 * @returns Áreas criadas.
 */
async function seedStudyAreas(student: SeedDocument) {
    const mathArea = await upsertOne(
        models.studyArea,
        { userId: documentId(student), name: "Matemática A - Derivadas" },
        {
            userId: documentId(student),
            name: "Matemática A - Derivadas",
            description: "Plano pessoal para rever derivadas antes do mini-teste.",
            color: "#2563eb",
            archived: false,
            voiceTone: "step_by_step",
            voiceDetailLevel: "detailed",
            voiceNotes: "Explicar com exemplos resolvidos e alertas sobre erros comuns.",
        },
    );
    const backendArea = await upsertOne(
        models.studyArea,
        { userId: documentId(student), name: "PAP - Backend Node.js" },
        {
            userId: documentId(student),
            name: "PAP - Backend Node.js",
            description: "Revisão de autenticação, persistência e testes da PAP.",
            color: "#16a34a",
            archived: false,
            voiceTone: "rigorous",
            voiceDetailLevel: "normal",
            voiceNotes: "Focar segurança, validação e arquitetura limpa.",
        },
    );

    return { backendArea, mathArea };
}

/**
 * Cria materiais privados prontos nas áreas do aluno.
 *
 * @param student Aluno principal.
 * @param studyAreas Áreas privadas.
 * @returns Materiais privados criados.
 */
async function seedPrivateStudy(
    student: SeedDocument,
    studyAreas: { backendArea: SeedDocument; mathArea: SeedDocument },
) {
    const mathMaterial = await upsertOne(
        models.material,
        { userId: documentId(student), studyAreaId: documentId(studyAreas.mathArea), title: "Apontamentos: regras de derivação" },
        {
            userId: documentId(student),
            studyAreaId: documentId(studyAreas.mathArea),
            type: "TOPIC",
            title: "Apontamentos: regras de derivação",
            status: "READY",
            contentText:
                "A derivada de uma soma é a soma das derivadas. A regra do produto aplica-se a funções multiplicadas e a regra da cadeia a composições.",
        },
    );
    const backendMaterial = await upsertOne(
        models.material,
        { userId: documentId(student), studyAreaId: documentId(studyAreas.backendArea), title: "Checklist PAP: autenticação segura" },
        {
            userId: documentId(student),
            studyAreaId: documentId(studyAreas.backendArea),
            type: "TOPIC",
            title: "Checklist PAP: autenticação segura",
            status: "READY",
            contentText:
                "Passwords devem ser guardadas como hash, sessões em cookies HttpOnly e validação de input deve rejeitar campos inesperados.",
        },
    );

    return { backendMaterial, mathMaterial };
}

/**
 * Cria jobs de indexação, versões, contexto e estrutura.
 *
 * @param student Aluno principal.
 * @param teacher Professor demo.
 * @param studyAreas Áreas privadas.
 * @param privateMaterials Materiais privados.
 * @param officialMaterials Materiais oficiais.
 * @param programmingSubject Disciplina de Programação.
 * @param mathSubject Disciplina de Matemática.
 * @returns Jobs de indexação criados.
 */
async function seedIndexing(
    student: SeedDocument,
    teacher: SeedDocument,
    studyAreas: { backendArea: SeedDocument; mathArea: SeedDocument },
    privateMaterials: { backendMaterial: SeedDocument; mathMaterial: SeedDocument },
    officialMaterials: { programmingMaterial: SeedDocument; mathMaterial: SeedDocument },
    programmingSubject: SeedDocument,
    mathSubject: SeedDocument,
) {
    const mathPrivateJob = await seedIndexJob({
        chunks: [
            {
                locator: "apontamento:1",
                order: 1,
                sourceLabel: "Apontamentos: regras de derivação",
                text: "A regra da cadeia é usada quando uma função está composta dentro de outra.",
            },
        ],
        materialId: documentId(privateMaterials.mathMaterial),
        scope: "PRIVATE_AREA",
        studyAreaId: documentId(studyAreas.mathArea),
        userId: documentId(student),
    });
    const backendPrivateJob = await seedIndexJob({
        chunks: [
            {
                locator: "checklist:1",
                order: 1,
                sourceLabel: "Checklist PAP: autenticação segura",
                text: "Cookies HttpOnly reduzem exposição de tokens a JavaScript no browser.",
            },
        ],
        materialId: documentId(privateMaterials.backendMaterial),
        scope: "PRIVATE_AREA",
        studyAreaId: documentId(studyAreas.backendArea),
        userId: documentId(student),
    });
    const programmingOfficialJob = await seedIndexJob({
        chunks: [
            {
                locator: "guia-api:1",
                order: 1,
                sourceLabel: "Guia oficial: API REST com Node.js",
                text: "Endpoints REST devem ter validação, autenticação e respostas JSON previsíveis.",
            },
        ],
        materialId: documentId(officialMaterials.programmingMaterial),
        scope: "OFFICIAL_SUBJECT",
        subjectId: documentId(programmingSubject),
        teacherId: documentId(teacher),
    });
    const mathOfficialJob = await seedIndexJob({
        chunks: [
            {
                locator: "ficha-derivadas:1",
                order: 1,
                sourceLabel: "Ficha oficial: derivadas e aplicações",
                text: "Derivadas permitem localizar máximos, mínimos e intervalos de crescimento.",
            },
        ],
        materialId: documentId(officialMaterials.mathMaterial),
        scope: "OFFICIAL_SUBJECT",
        subjectId: documentId(mathSubject),
        teacherId: documentId(teacher),
    });

    await seedMaterialVersion(mathPrivateJob, privateMaterials.mathMaterial, {
        scope: "PRIVATE_AREA",
        studyAreaId: documentId(studyAreas.mathArea),
        title: "Versão inicial - regras de derivação",
        userId: documentId(student),
    });
    await seedMaterialVersion(backendPrivateJob, privateMaterials.backendMaterial, {
        scope: "PRIVATE_AREA",
        studyAreaId: documentId(studyAreas.backendArea),
        title: "Versão inicial - autenticação segura",
        userId: documentId(student),
    });
    await seedMaterialVersion(programmingOfficialJob, officialMaterials.programmingMaterial, {
        scope: "OFFICIAL_SUBJECT",
        subjectId: documentId(programmingSubject),
        teacherId: documentId(teacher),
        title: "Versão oficial - API REST",
    });

    await seedMaterialContext("PRIVATE_AREA", documentId(studyAreas.mathArea), privateMaterials.mathMaterial, "student", student);
    await seedMaterialContext("PRIVATE_AREA", documentId(studyAreas.backendArea), privateMaterials.backendMaterial, "student", student);
    await seedMaterialContext("OFFICIAL_SUBJECT", documentId(programmingSubject), officialMaterials.programmingMaterial, "teacher", teacher);
    await seedMaterialContext("OFFICIAL_SUBJECT", documentId(mathSubject), officialMaterials.mathMaterial, "teacher", teacher);

    await seedMaterialStructure(mathPrivateJob, privateMaterials.mathMaterial, "Regras de derivação");
    await seedMaterialStructure(programmingOfficialJob, officialMaterials.programmingMaterial, "Arquitetura REST");

    return { backendPrivateJob, mathOfficialJob, mathPrivateJob, programmingOfficialJob };
}

/**
 * Cria um job de indexação concluído.
 *
 * @param input Dados do job.
 * @returns Job criado.
 */
async function seedIndexJob(input: {
    chunks: Array<{ locator: string; order: number; sourceLabel: string; text: string }>;
    materialId: Types.ObjectId;
    scope: "PRIVATE_AREA" | "OFFICIAL_SUBJECT";
    studyAreaId?: Types.ObjectId;
    subjectId?: Types.ObjectId;
    teacherId?: Types.ObjectId;
    userId?: Types.ObjectId;
}): Promise<SeedDocument> {
    return upsertOne(
        models.materialIndexJob,
        { materialId: input.materialId, scope: input.scope },
        {
            extractedTextChunks: input.chunks,
            materialId: input.materialId,
            scope: input.scope,
            status: "DONE",
            studyAreaId: input.studyAreaId,
            subjectId: input.subjectId,
            teacherId: input.teacherId,
            userId: input.userId,
        },
    );
}

/**
 * Cria uma versão de material.
 *
 * @param job Job de indexação.
 * @param material Material base.
 * @param input Dados da versão.
 */
async function seedMaterialVersion(
    job: SeedDocument,
    material: SeedDocument,
    input: {
        scope: "PRIVATE_AREA" | "OFFICIAL_SUBJECT";
        studyAreaId?: Types.ObjectId;
        subjectId?: Types.ObjectId;
        teacherId?: Types.ObjectId;
        title: string;
        userId?: Types.ObjectId;
    },
): Promise<void> {
    await upsertOne(
        models.materialVersion,
        { materialId: documentId(material), scope: input.scope, versionNumber: 1 },
        {
            active: true,
            changeSummary: "Versão demo criada pela seed.",
            chunksSnapshot: [
                {
                    locator: "demo:1",
                    order: 1,
                    sourceLabel: input.title,
                    text: "Excerto persistido para demonstração de versões.",
                },
            ],
            jobId: documentId(job),
            materialId: documentId(material),
            scope: input.scope,
            studyAreaId: input.studyAreaId,
            subjectId: input.subjectId,
            teacherId: input.teacherId,
            textSnapshot: "Conteúdo consolidado da versão demo.",
            title: input.title,
            userId: input.userId,
            versionNumber: 1,
        },
    );
}

/**
 * Cria contexto pedagógico de material.
 *
 * @param scope Âmbito do contexto.
 * @param contextId Área ou disciplina.
 * @param material Material associado.
 * @param source Origem pública do material.
 * @param owner Utilizador dono.
 */
async function seedMaterialContext(
    scope: "PRIVATE_AREA" | "OFFICIAL_SUBJECT",
    contextId: Types.ObjectId,
    material: SeedDocument,
    source: "student" | "teacher" | "class",
    owner: SeedDocument,
): Promise<void> {
    await upsertOne(
        models.materialContext,
        { scope, contextId, materialId: documentId(material) },
        {
            contextId,
            materialId: documentId(material),
            scope,
            source,
            studentId: source === "student" ? documentId(owner) : undefined,
            teacherId: source === "teacher" ? documentId(owner) : undefined,
            title: String(material.title ?? "Material demo"),
        },
    );
}

/**
 * Cria estrutura pedagógica de material.
 *
 * @param job Job de indexação.
 * @param material Material base.
 * @param topic Tópico principal.
 */
async function seedMaterialStructure(
    job: SeedDocument,
    material: SeedDocument,
    topic: string,
): Promise<void> {
    await upsertOne(
        models.materialStructure,
        { jobId: documentId(job) },
        {
            jobId: documentId(job),
            materialId: documentId(material),
            sections: [
                {
                    order: 1,
                    references: [
                        {
                            chunkOrder: 1,
                            excerpt: "Excerto demo com fonte autorizada.",
                            locator: "demo:1",
                            sourceLabel: String(material.title ?? topic),
                        },
                    ],
                    summary: `Secção demo sobre ${topic}.`,
                    title: topic,
                },
            ],
            topics: [topic],
        },
    );
}

/**
 * Cria dados do estudo individual.
 *
 * @param student Aluno principal.
 * @param studyAreas Áreas privadas.
 * @param privateMaterials Materiais privados.
 * @param materialIndexJobs Jobs de indexação.
 */
async function seedPersonalStudy(
    student: SeedDocument,
    studyAreas: { backendArea: SeedDocument; mathArea: SeedDocument },
    privateMaterials: { backendMaterial: SeedDocument; mathMaterial: SeedDocument },
    materialIndexJobs: { mathPrivateJob: SeedDocument },
): Promise<void> {
    await upsertOne(
        models.studyRoutine,
        { userId: documentId(student), title: "Revisão de derivadas às segundas" },
        {
            archived: false,
            durationMinutes: 50,
            startTime: "18:00",
            title: "Revisão de derivadas às segundas",
            userId: documentId(student),
            weekdays: ["MONDAY", "WEDNESDAY"],
        },
    );
    await upsertOne(
        models.studyGoal,
        { userId: documentId(student), title: "Resolver 20 exercícios de derivadas" },
        {
            archived: false,
            completed: false,
            description: "Preparar o mini-teste oficial com exercícios graduais.",
            targetDate: new Date("2026-07-20T12:00:00.000Z"),
            title: "Resolver 20 exercícios de derivadas",
            userId: documentId(student),
        },
    );

    await upsertOne(
        models.aiAreaProfile,
        { studyAreaId: documentId(studyAreas.mathArea) },
        {
            materialIds: [documentId(privateMaterials.mathMaterial)],
            processableSourceCount: 1,
            sourceCount: 1,
            status: "READY_FOR_GENERATION",
            studyAreaId: documentId(studyAreas.mathArea),
            userId: documentId(student),
            voiceTone: "step_by_step",
        },
    );
    await upsertOne(
        models.learningProfile,
        { userId: documentId(student), studyAreaId: documentId(studyAreas.mathArea) },
        {
            difficulties: ["regra da cadeia", "interpretação geométrica da derivada"],
            level: "INTERMEDIATE",
            pace: "BALANCED",
            preferredExplanationStyle: "Exemplos resolvidos passo a passo",
            studyAreaId: documentId(studyAreas.mathArea),
            userId: documentId(student),
        },
    );
    await upsertOne(
        models.adaptiveExplanation,
        { userId: documentId(student), studyAreaId: documentId(studyAreas.mathArea), question: "Quando uso a regra da cadeia?" },
        {
            answer: "Usa a regra da cadeia quando a expressão tem uma função dentro de outra, como (3x + 1)^4.",
            question: "Quando uso a regra da cadeia?",
            sourceMaterialIds: [documentId(privateMaterials.mathMaterial)],
            studyAreaId: documentId(studyAreas.mathArea),
            suggestedNextSteps: ["Identificar função exterior", "Derivar a função interior", "Multiplicar os resultados"],
            userId: documentId(student),
        },
    );
    await upsertOne(
        models.privateAreaAiAnswer,
        { studentId: documentId(student), studyAreaId: documentId(studyAreas.mathArea), question: "Resume a regra do produto." },
        {
            answer: "Na regra do produto, deriva-se a primeira função, mantém-se a segunda, e soma-se o caso inverso.",
            question: "Resume a regra do produto.",
            sourceMaterialIds: [documentId(privateMaterials.mathMaterial)],
            studentId: documentId(student),
            studyAreaId: documentId(studyAreas.mathArea),
        },
    );

    await seedStudyEvent(student, "STUDY_AREA_CREATED", "Área criada: Matemática A - Derivadas", "A área privada ficou pronta para materiais e IA.");
    await seedStudyEvent(student, "MATERIAL_SUBMITTED", "Material submetido: regras de derivação", "Material privado pronto para indexação.");
    await seedStudyEvent(student, "AI_PROFILE_CREATED", "Perfil IA preparado", "1 fonte processável disponível.");
    await seedStudyEvent(student, "SUMMARY_GENERATED", "Resumo gerado", "Resumo demo criado pela seed.");
    await seedStudyEvent(student, "STUDY_TOOL_GENERATED", "Ferramentas IA geradas", "Explicação, flashcards e quiz disponíveis.");

    await upsertOne(
        models.quizGenerationJob,
        { userId: documentId(student), studyAreaId: documentId(studyAreas.mathArea), topic: "Derivadas" },
        {
            artifactId: undefined,
            errorMessage: undefined,
            status: "DONE",
            studyAreaId: documentId(studyAreas.mathArea),
            topic: "Derivadas",
            userId: documentId(student),
        },
    );

    await upsertOne(
        models.auditEvent,
        { actorId: documentId(student), action: "DEMO_SEED_PRIVATE_STUDY", resourceId: String(documentId(materialIndexJobs.mathPrivateJob)) },
        {
            action: "DEMO_SEED_PRIVATE_STUDY",
            actorId: documentId(student),
            domain: "MATERIALS",
            metadata: { areaId: String(documentId(studyAreas.mathArea)) },
            resourceId: String(documentId(materialIndexJobs.mathPrivateJob)),
            resourceType: "MaterialIndexJob",
            result: "SUCCESS",
        },
    );
}

/**
 * Cria evento de histórico do aluno.
 *
 * @param student Aluno principal.
 * @param type Tipo de evento.
 * @param title Título visível.
 * @param description Descrição do evento.
 */
async function seedStudyEvent(
    student: SeedDocument,
    type: string,
    title: string,
    description: string,
): Promise<void> {
    await upsertOne(
        models.studyEvent,
        { userId: documentId(student), type, title },
        {
            description,
            occurredAt: new Date(),
            title,
            type,
            userId: documentId(student),
        },
    );
}

/**
 * Cria artefactos IA persistidos e tentativa de quiz.
 *
 * @param student Aluno principal.
 * @param mathArea Área de Matemática.
 * @param mathMaterial Material privado de Matemática.
 * @returns Artefactos criados.
 */
async function seedAiArtifacts(
    student: SeedDocument,
    mathArea: SeedDocument,
    mathMaterial: SeedDocument,
) {
    const materialId = String(documentId(mathMaterial));
    const source = {
        contentText: String(mathMaterial.contentText ?? ""),
        materialId,
        title: String(mathMaterial.title ?? "Material demo"),
    };

    const summaryArtifact = await upsertOne(
        models.aiArtifact,
        { userId: documentId(student), studyAreaId: documentId(mathArea), type: "SUMMARY" },
        {
            contentJson: {
                bullets: [
                    "A derivada mede taxa de variação instantânea.",
                    "As regras de soma, produto e cadeia ajudam a derivar expressões compostas.",
                    "A interpretação geométrica liga derivada ao declive da tangente.",
                ],
                sourceMaterialIds: [materialId],
                title: "Resumo demo: derivadas essenciais",
            },
            sourcesJson: [source],
            studyAreaId: documentId(mathArea),
            type: "SUMMARY",
            userId: documentId(student),
        },
    );
    const explanationArtifact = await upsertOne(
        models.aiArtifact,
        { userId: documentId(student), studyAreaId: documentId(mathArea), type: "EXPLANATION" },
        {
            contentJson: {
                sections: [
                    {
                        body: "Começa por identificar a função exterior e a função interior. Depois deriva ambas e multiplica os resultados.",
                        heading: "Regra da cadeia",
                        sourceMaterialIds: [materialId],
                    },
                    {
                        body: "Se tiveres duas funções multiplicadas, deriva a primeira e mantém a segunda; depois soma a primeira vezes a derivada da segunda.",
                        heading: "Regra do produto",
                        sourceMaterialIds: [materialId],
                    },
                ],
                title: "Explicação demo: escolher a regra certa",
            },
            sourcesJson: [source],
            studyAreaId: documentId(mathArea),
            type: "EXPLANATION",
            userId: documentId(student),
        },
    );
    const flashcardsArtifact = await upsertOne(
        models.aiArtifact,
        { userId: documentId(student), studyAreaId: documentId(mathArea), type: "FLASHCARDS" },
        {
            contentJson: {
                cards: [
                    {
                        back: "Quando existe uma função composta, por exemplo (3x + 1)^4.",
                        front: "Quando se usa a regra da cadeia?",
                        sourceMaterialIds: [materialId],
                    },
                    {
                        back: "É o declive da reta tangente ao gráfico nesse ponto.",
                        front: "Qual é o significado geométrico da derivada num ponto?",
                        sourceMaterialIds: [materialId],
                    },
                ],
                title: "Flashcards demo: derivadas",
            },
            sourcesJson: [source],
            studyAreaId: documentId(mathArea),
            type: "FLASHCARDS",
            userId: documentId(student),
        },
    );
    const quizArtifact = await upsertOne(
        models.aiArtifact,
        { userId: documentId(student), studyAreaId: documentId(mathArea), type: "QUIZ" },
        {
            contentJson: {
                questions: [
                    {
                        correctOptionIndex: 1,
                        explanation: "A regra da cadeia aplica-se a funções compostas.",
                        options: [
                            "Regra da soma",
                            "Regra da cadeia",
                            "Regra do quociente",
                            "Regra da constante",
                        ],
                        question: "Que regra se aplica a (3x + 1)^4?",
                        sourceMaterialIds: [materialId],
                    },
                    {
                        correctOptionIndex: 0,
                        explanation: "A derivada representa a taxa de variação instantânea.",
                        options: [
                            "Taxa de variação instantânea",
                            "Área total sob a curva",
                            "Valor médio da função",
                            "Domínio da função",
                        ],
                        question: "O que mede a derivada num ponto?",
                        sourceMaterialIds: [materialId],
                    },
                ],
                title: "Quiz demo: derivadas",
            },
            sourcesJson: [source],
            studyAreaId: documentId(mathArea),
            type: "QUIZ",
            userId: documentId(student),
        },
    );

    await upsertOne(
        models.aiQuizAttempt,
        { userId: documentId(student), studyAreaId: documentId(mathArea), artifactId: documentId(quizArtifact) },
        {
            answeredAt: new Date(),
            answers: [1, 2],
            artifactId: documentId(quizArtifact),
            correctCount: 1,
            results: [
                {
                    correctOptionIndex: 1,
                    isCorrect: true,
                    questionIndex: 0,
                    selectedOptionIndex: 1,
                    sourceMaterialIds: [materialId],
                },
                {
                    correctOptionIndex: 0,
                    isCorrect: false,
                    questionIndex: 1,
                    selectedOptionIndex: 2,
                    sourceMaterialIds: [materialId],
                },
            ],
            scorePercent: 50,
            studyAreaId: documentId(mathArea),
            totalQuestions: 2,
            userId: documentId(student),
        },
    );
    await seedStudyEvent(student, "QUIZ_ATTEMPT_RECORDED", "Quiz IA resolvido", "Resultado demo: 1/2 respostas certas.");

    return { explanationArtifact, flashcardsArtifact, quizArtifact, summaryArtifact };
}

/**
 * Cria dados do professor e da turma.
 *
 * @param teacher Professor demo.
 * @param schoolClass Turma demo.
 * @param programmingSubject Disciplina de Programação.
 * @param mathSubject Disciplina de Matemática.
 * @param officialMaterials Materiais oficiais.
 * @param student Aluno principal.
 * @param secondStudent Segundo aluno.
 */
async function seedTeacherExperience(
    teacher: SeedDocument,
    schoolClass: SeedDocument,
    programmingSubject: SeedDocument,
    mathSubject: SeedDocument,
    officialMaterials: { programmingMaterial: SeedDocument; mathMaterial: SeedDocument },
    student: SeedDocument,
    secondStudent: SeedDocument,
): Promise<void> {
    await upsertOne(
        models.teacherClassAiVoice,
        { classId: documentId(schoolClass) },
        {
            classId: documentId(schoolClass),
            detailLevel: "BALANCED",
            rules: ["Usar exemplos ligados à PAP.", "Evitar respostas sem fontes da turma."],
            teacherId: documentId(teacher),
            tone: "SOCRATIC",
        },
    );
    await upsertOne(
        models.teacherAiVoice,
        { subjectId: documentId(programmingSubject) },
        {
            classId: documentId(schoolClass),
            detailLevel: "DETAILED",
            rules: ["Explicar decisões de arquitetura.", "Referir validação e segurança."],
            subjectId: documentId(programmingSubject),
            teacherId: documentId(teacher),
            tone: "DIRECT",
        },
    );
    await upsertOne(
        models.classAiInteraction,
        { subjectId: documentId(programmingSubject), studentId: documentId(student), question: "Como devo validar um endpoint de login?" },
        {
            answer: "Valida email/password no DTO, limita tentativas falhadas e nunca devolvas o hash da password.",
            classId: documentId(schoolClass),
            question: "Como devo validar um endpoint de login?",
            sourceMaterialIds: [documentId(officialMaterials.programmingMaterial)],
            studentId: documentId(student),
            subjectId: documentId(programmingSubject),
            voiceRulesApplied: ["Explicar decisões de arquitetura.", "Referir validação e segurança."],
        },
    );
    await upsertOne(
        models.classPost,
        { classId: documentId(schoolClass), title: "Entrega intermédia da PAP" },
        {
            body: "Até sexta-feira, cada grupo deve submeter o plano técnico e a lista de endpoints críticos.",
            classId: documentId(schoolClass),
            teacherId: documentId(teacher),
            title: "Entrega intermédia da PAP",
            type: "NOTICE",
        },
    );
    await upsertOne(
        models.guidedStudyRoom,
        { classId: documentId(schoolClass), title: "Sala guiada: revisão de APIs seguras" },
        {
            classId: documentId(schoolClass),
            description: "Rever autenticação, validação e persistência antes da apresentação da PAP.",
            materialIds: [String(documentId(officialMaterials.programmingMaterial))],
            status: "OPEN",
            subjectId: documentId(programmingSubject),
            teacherId: documentId(teacher),
            title: "Sala guiada: revisão de APIs seguras",
        },
    );
    const project = await upsertOne(
        models.classProject,
        { classId: documentId(schoolClass), title: "Projeto demo: módulo de estudo inteligente" },
        {
            brief: "Construir um módulo que permite ao aluno organizar materiais, gerar apoio IA com fontes e apresentar evidências de validação.",
            classId: documentId(schoolClass),
            dueDate: new Date("2026-07-31T23:00:00.000Z"),
            status: "PUBLISHED",
            subject: "Programação",
            teacherId: documentId(teacher),
            title: "Projeto demo: módulo de estudo inteligente",
        },
    );
    await upsertOne(
        models.projectAiPlan,
        { projectId: documentId(project), studentId: documentId(student), studentGoal: "Preparar apresentação técnica da PAP" },
        {
            knownDifficulties: ["priorizar endpoints", "explicar segurança de sessões"],
            projectId: documentId(project),
            rationale: "Plano demo persistido para não depender de provider externo.",
            steps: [
                "Mapear funcionalidades principais.",
                "Escolher 3 fluxos demonstráveis.",
                "Preparar evidência de testes e validação.",
            ],
            studentGoal: "Preparar apresentação técnica da PAP",
            studentId: documentId(student),
        },
    );
    await upsertOne(
        models.classProgressNote,
        { classId: documentId(schoolClass), title: "Acompanhamento demo: APIs e IA" },
        {
            classId: documentId(schoolClass),
            difficultyTags: ["autenticação", "fontes IA", "testes"],
            note: "A turma compreende a estrutura principal, mas deve reforçar validação de input e explicação das fontes IA.",
            teacherId: documentId(teacher),
            title: "Acompanhamento demo: APIs e IA",
        },
    );

    const publishedTest = await upsertOne(
        models.officialTest,
        { subjectId: documentId(mathSubject), title: "Mini-teste demo: derivadas" },
        {
            classId: documentId(schoolClass),
            description: "Mini-teste publicado para demonstrar tentativa do aluno e ranking docente.",
            questions: [
                {
                    correctOptionIndex: 0,
                    options: ["Taxa de variação instantânea", "Área sob a curva", "Valor máximo", "Ordenada na origem"],
                    statement: "O que representa a derivada num ponto?",
                    topic: "Interpretação",
                },
                {
                    correctOptionIndex: 2,
                    options: ["Regra da soma", "Regra da constante", "Regra da cadeia", "Regra do domínio"],
                    statement: "Que regra se usa em funções compostas?",
                    topic: "Regras de derivação",
                },
            ],
            status: "PUBLISHED",
            subjectId: documentId(mathSubject),
            teacherId: documentId(teacher),
            title: "Mini-teste demo: derivadas",
        },
    );
    await upsertOne(
        models.officialTest,
        { subjectId: documentId(programmingSubject), title: "Rascunho demo: segurança em APIs" },
        {
            classId: documentId(schoolClass),
            description: "Rascunho visível ao professor para demonstrar estados de teste.",
            questions: [
                {
                    correctOptionIndex: 1,
                    options: ["Guardar token no localStorage", "Usar cookie HttpOnly", "Expor passwordHash", "Aceitar campos extra"],
                    statement: "Qual é a prática mais segura para sessão web?",
                    topic: "Autenticação",
                },
            ],
            status: "DRAFT",
            subjectId: documentId(programmingSubject),
            teacherId: documentId(teacher),
            title: "Rascunho demo: segurança em APIs",
        },
    );
    await seedOfficialAttempt(publishedTest, mathSubject, schoolClass, student, [0, 2], 2);
    await seedOfficialAttempt(publishedTest, mathSubject, schoolClass, secondStudent, [0, 1], 1);

    await upsertOne(
        models.aiContentReview,
        { subjectId: documentId(programmingSubject), materialId: documentId(officialMaterials.programmingMaterial), contentType: "SUMMARY" },
        {
            contentJson: {
                bullets: ["Validar inputs", "Proteger sessões", "Não expor dados sensíveis"],
                title: "Resumo IA para revisão docente",
            },
            contentType: "SUMMARY",
            materialId: documentId(officialMaterials.programmingMaterial),
            status: "PENDING",
            subjectId: documentId(programmingSubject),
            teacherComment: "Conteúdo demo pendente para mostrar o workflow.",
            teacherId: documentId(teacher),
        },
    );
}

/**
 * Cria tentativa de mini-teste oficial.
 *
 * @param test Teste oficial.
 * @param subject Disciplina.
 * @param schoolClass Turma.
 * @param student Aluno.
 * @param selectedOptionIndexes Respostas escolhidas.
 * @param correctAnswers Total de respostas certas.
 */
async function seedOfficialAttempt(
    test: SeedDocument,
    subject: SeedDocument,
    schoolClass: SeedDocument,
    student: SeedDocument,
    selectedOptionIndexes: number[],
    correctAnswers: number,
): Promise<void> {
    const totalQuestions = 2;
    await upsertOne(
        models.officialTestAttempt,
        { testId: documentId(test), studentId: documentId(student) },
        {
            answeredAt: new Date(),
            classId: documentId(schoolClass),
            correctAnswers,
            percentage: Math.round((correctAnswers / totalQuestions) * 100),
            results: [
                {
                    correctOptionIndex: 0,
                    isCorrect: selectedOptionIndexes[0] === 0,
                    questionIndex: 0,
                    selectedOptionIndex: selectedOptionIndexes[0],
                },
                {
                    correctOptionIndex: 2,
                    isCorrect: selectedOptionIndexes[1] === 2,
                    questionIndex: 1,
                    selectedOptionIndex: selectedOptionIndexes[1],
                },
            ],
            selectedOptionIndexes,
            studentId: documentId(student),
            subjectId: documentId(subject),
            testId: documentId(test),
            totalQuestions,
        },
    );
}

/**
 * Cria sala/grupo de estudo e histórico colaborativo.
 *
 * @param student Aluno principal.
 * @param secondStudent Segundo aluno.
 * @param mathMaterial Material privado referenciado.
 * @returns Sala/grupo criado.
 */
async function seedCollaboration(
    student: SeedDocument,
    secondStudent: SeedDocument,
    mathMaterial: SeedDocument,
): Promise<SeedDocument> {
    const room = await upsertOne(
        models.studyRoom,
        { ownerStudentId: documentId(student), name: "Grupo demo: derivadas e PAP" },
        {
            description: "Grupo de estudo usado para demonstrar partilhas, mensagens e IA da sala.",
            disciplineName: "Matemática A",
            memberIds: [documentId(student), documentId(secondStudent)],
            name: "Grupo demo: derivadas e PAP",
            ownerStudentId: documentId(student),
            type: "SUBJECT",
        },
    );
    const noteShare = await upsertOne(
        models.roomShare,
        { roomId: documentId(room), title: "Resumo partilhado: regra da cadeia" },
        {
            authorStudentId: documentId(student),
            roomId: documentId(room),
            textContent: "Para funções compostas, deriva a exterior, mantém a interior e multiplica pela derivada da interior.",
            title: "Resumo partilhado: regra da cadeia",
            type: "NOTE",
            usableByAi: true,
        },
    );
    await upsertOne(
        models.roomShare,
        { roomId: documentId(room), title: "Material privado referenciado" },
        {
            authorStudentId: documentId(student),
            materialId: documentId(mathMaterial),
            materialTitle: String(mathMaterial.title ?? "Material privado"),
            roomId: documentId(room),
            title: "Material privado referenciado",
            type: "MATERIAL_REF",
            usableByAi: true,
        },
    );
    await upsertOne(
        models.studyGroupMessage,
        { groupId: documentId(room), authorStudentId: documentId(student), text: "Vamos rever a regra da cadeia antes do teste." },
        {
            authorStudentId: documentId(student),
            groupId: documentId(room),
            kind: "MESSAGE",
            text: "Vamos rever a regra da cadeia antes do teste.",
        },
    );
    await upsertOne(
        models.studyGroupSession,
        { groupId: documentId(room), title: "Sessão demo: exercícios de derivadas" },
        {
            createdByStudentId: documentId(student),
            durationMinutes: 45,
            goal: "Resolver exercícios e comparar métodos.",
            groupId: documentId(room),
            startsAt: new Date("2026-07-15T17:30:00.000Z"),
            title: "Sessão demo: exercícios de derivadas",
        },
    );
    await upsertOne(
        models.roomAiInteraction,
        { roomId: documentId(room), studentId: documentId(student), question: "Qual é o erro mais comum na regra da cadeia?" },
        {
            answer: "O erro mais comum é esquecer multiplicar pela derivada da função interior.",
            question: "Qual é o erro mais comum na regra da cadeia?",
            roomId: documentId(room),
            sharedAt: new Date(),
            sourceShareIds: [documentId(noteShare)],
            studentId: documentId(student),
            visibility: "SHARED",
        },
    );
    await upsertOne(
        models.studyGroupAiAnswer,
        { groupId: documentId(room), studentId: documentId(student), question: "Cria um plano rápido para rever derivadas." },
        {
            answer: "Comecem pelas regras básicas, resolvam dois exercícios de cadeia e terminem com interpretação gráfica.",
            groupId: documentId(room),
            question: "Cria um plano rápido para rever derivadas.",
            sources: [{ shareId: String(documentId(noteShare)), title: "Resumo partilhado: regra da cadeia" }],
            studentId: documentId(student),
        },
    );

    return room;
}

/**
 * Cria políticas, quotas, consentimentos e notificações de demonstração.
 *
 * @param admin Administrador demo.
 * @param teacher Professor demo.
 * @param student Aluno principal.
 * @param secondStudent Segundo aluno.
 * @param schoolClass Turma demo.
 * @param room Sala/grupo demo.
 * @param quizArtifact Artefacto de quiz IA.
 */
async function seedGovernance(
    admin: SeedDocument,
    teacher: SeedDocument,
    student: SeedDocument,
    secondStudent: SeedDocument,
    schoolClass: SeedDocument,
    room: SeedDocument,
    quizArtifact: SeedDocument,
): Promise<void> {
    for (const channel of ["IN_APP", "EMAIL", "PUSH"]) {
        await upsertOne(
            models.notificationChannelPolicy,
            { channel },
            {
                channel,
                enabled: channel !== "PUSH",
                maxPerContextPerHour: 30,
                maxPerUserPerDay: 20,
            },
        );
    }

    for (const purpose of aiPurposes) {
        await upsertOne(
            models.aiModelPolicy,
            { purpose },
            {
                enabled: true,
                maxPromptChars: 12000,
                maxSourceCount: 8,
                model: "gpt-5.4-mini",
                provider: "openai",
                purpose,
                timeoutMs: 8000,
            },
        );
        await upsertOne(
            models.aiConsent,
            { userId: documentId(student), purpose },
            {
                actorId: documentId(student),
                policyVersion: DEMO_POLICY_VERSION,
                purpose,
                status: "GRANTED",
                userId: documentId(student),
            },
        );
    }

    await upsertOne(
        models.aiQuotaPolicy,
        { scope: "USER", targetId: documentId(student), purpose: "STUDY_TOOL" },
        {
            monthlyLimitUnits: 100,
            purpose: "STUDY_TOOL",
            scope: "USER",
            targetId: documentId(student),
        },
    );
    await upsertOne(
        models.aiQuotaUsage,
        { scope: "USER", targetId: documentId(student), purpose: "STUDY_TOOL", period: DEMO_PERIOD },
        {
            period: DEMO_PERIOD,
            purpose: "STUDY_TOOL",
            scope: "USER",
            targetId: documentId(student),
            usedUnits: 12,
        },
    );
    await upsertOne(
        models.followUpAlertRule,
        { teacherId: documentId(teacher), classId: documentId(schoolClass), title: "Acompanhar alunos sem atividade" },
        {
            classId: documentId(schoolClass),
            inactiveDays: 7,
            message: "Verifica se o aluno precisa de apoio no plano semanal.",
            teacherId: documentId(teacher),
            title: "Acompanhar alunos sem atividade",
        },
    );

    for (const context of ["STUDY_ROUTINE", "STUDY_GOAL", "GROUP_SESSION"]) {
        await upsertOne(
            models.notificationPreference,
            { userId: documentId(student), context },
            {
                context,
                email: context === "STUDY_GOAL",
                inApp: true,
                push: false,
                userId: documentId(student),
            },
        );
    }

    await upsertOne(
        models.contextNotification,
        { contextType: "CLASS", contextId: documentId(schoolClass), title: "Novo material oficial disponível" },
        {
            actorId: documentId(teacher),
            body: "O professor adicionou materiais oficiais para a revisão da PAP.",
            contextId: documentId(schoolClass),
            contextType: "CLASS",
            recipientIds: [documentId(student), documentId(secondStudent)],
            suppressedRecipientIds: [],
            title: "Novo material oficial disponível",
            type: "NEW_MATERIAL",
        },
    );
    await upsertOne(
        models.contextNotification,
        { contextType: "GROUP", contextId: documentId(room), title: "Sessão de estudo agendada" },
        {
            actorId: documentId(student),
            body: "Há uma sessão demo marcada para rever derivadas.",
            contextId: documentId(room),
            contextType: "GROUP",
            recipientIds: [documentId(student), documentId(secondStudent)],
            suppressedRecipientIds: [],
            title: "Sessão de estudo agendada",
            type: "TASK",
        },
    );
    await upsertOne(
        models.accountDeletionRequest,
        { userId: documentId(secondStudent) },
        {
            deletedCounts: {
                materials: 0,
                studyAreas: 0,
                studyEvents: 0,
            },
            userId: documentId(secondStudent),
        },
    );
    await upsertOne(
        models.auditEvent,
        { actorId: documentId(admin), action: "DEMO_SEED_GOVERNANCE", resourceId: String(documentId(quizArtifact)) },
        {
            action: "DEMO_SEED_GOVERNANCE",
            actorId: documentId(admin),
            domain: "ADMIN",
            metadata: { seed: "seed-demo-dataset" },
            resourceId: String(documentId(quizArtifact)),
            resourceType: "AiArtifact",
            result: "SUCCESS",
        },
    );
}

main().catch(async (error: unknown) => {
    console.error(error);
    await mongoose.disconnect().catch(() => undefined);
    process.exitCode = 1;
});
