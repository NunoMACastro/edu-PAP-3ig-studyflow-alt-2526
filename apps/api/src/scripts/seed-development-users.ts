/**
 * Povoa a base de dados local com um cenário de demonstração coerente.
 *
 * A seed é idempotente, recusa bases remotas e cria relações completas entre
 * professor, alunos, turmas, conteúdos oficiais, estudo pessoal e colaboração.
 */
import "../common/config/load-env.js";
import bcrypt from "bcrypt";
import mongoose, { Types } from "mongoose";
import type { Model, Schema } from "mongoose";
import { DemoPdfStorage } from "./development-seed/demo-pdf-storage.js";
import { seedRichDemoData } from "./development-seed/rich-demo-seed.js";
import { loadRuntimeConfig } from "../common/config/runtime-config.js";
import { CURRENT_AI_POLICY_VERSIONS } from "../modules/ai-consents/ai-consents.service.js";
import {
    AiConsent,
    AiConsentPurpose,
    AiConsentSchema,
} from "../modules/ai-consents/schemas/ai-consent.schema.js";
import {
    AiModelPolicy,
    AiModelPolicySchema,
} from "../modules/ai-model-policies/schemas/ai-model-policy.schema.js";
import {
    AiQuotaPolicy,
    AiQuotaPolicySchema,
} from "../modules/ai-quotas/schemas/ai-quota-policy.schema.js";
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
import { User, UserRole, UserSchema } from "../modules/auth/schemas/user.schema.js";
import {
    ClassLearningActivity,
    ClassLearningActivitySchema,
} from "../modules/class-learning-activity/schemas/class-learning-activity.schema.js";
import {
    StudentClassActivityState,
    StudentClassActivityStateSchema,
} from "../modules/class-learning-activity/schemas/student-class-activity-state.schema.js";
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
    ClassMembership,
    ClassMembershipSchema,
} from "../modules/classes/schemas/class-membership.schema.js";
import {
    SchoolClass,
    SchoolClassSchema,
} from "../modules/classes/schemas/school-class.schema.js";
import {
    GuidedStudyRoomParticipation,
    GuidedStudyRoomParticipationSchema,
} from "../modules/guided-study-rooms/schemas/guided-study-room-participation.schema.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomSchema,
} from "../modules/guided-study-rooms/schemas/guided-study-room.schema.js";
import {
    Material,
    MaterialSchema,
} from "../modules/materials/schemas/material.schema.js";
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
    StudentProfile,
    StudentProfileSchema,
} from "../modules/students/schemas/student-profile.schema.js";
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
    StudyArea,
    StudyAreaSchema,
} from "../modules/study-areas/schemas/study-area.schema.js";
import {
    StudyGroupMessage,
    StudyGroupMessageSchema,
} from "../modules/study-group-messages/schemas/study-group-message.schema.js";
import {
    StudyGroupSession,
    StudyGroupSessionSchema,
} from "../modules/study-group-sessions/schemas/study-group-session.schema.js";
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
    TeacherStudentChatMessage,
    TeacherStudentChatMessageSchema,
} from "../modules/teacher-student-chat/schemas/teacher-student-chat-message.schema.js";
import {
    TeacherStudentChatThread,
    TeacherStudentChatThreadSchema,
} from "../modules/teacher-student-chat/schemas/teacher-student-chat-thread.schema.js";

const BCRYPT_COST = 12;
const DAY_MS = 24 * 60 * 60 * 1000;
const TEACHER_PASSWORD = "professor-dev-12345";
const STUDENT_PASSWORD = "aluno-dev-12345";
const AI_PURPOSES: AiConsentPurpose[] = [
    "PRIVATE_AREA_AI",
    "GROUP_AI",
    "CLASS_AI",
    "PROJECT_AI",
    "SOURCE_GROUNDED_AI",
    "EXTERNAL_KNOWLEDGE_AI",
    "ADAPTIVE_EXPLANATION",
    "SUMMARY",
    "STUDY_TOOL",
    "ROOM_AI",
];
const USER_QUOTA_PURPOSES: AiConsentPurpose[] = [
    "PRIVATE_AREA_AI",
    "PROJECT_AI",
    "SOURCE_GROUNDED_AI",
    "EXTERNAL_KNOWLEDGE_AI",
    "ADAPTIVE_EXPLANATION",
    "SUMMARY",
    "STUDY_TOOL",
];

type DevelopmentUserSeed = {
    email: string;
    password: string;
    role: UserRole;
    name?: string;
    year?: string;
    course?: string;
};

type SeedModel = Model<Record<string, unknown>>;
type SeedModels = ReturnType<typeof createSeedModels>;

const developmentUsers: DevelopmentUserSeed[] = [
    {
        email: "professor.dev@studyflow.local",
        password: TEACHER_PASSWORD,
        role: "TEACHER",
    },
    {
        email: "professora.ana@studyflow.local",
        password: TEACHER_PASSWORD,
        role: "TEACHER",
    },
    {
        email: "aluno.dev@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Leonor Martins",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "ines.silva@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Inês Silva",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "joao.costa@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "João Costa",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "maria.ferreira@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Maria Ferreira",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "tiago.rocha@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Tiago Rocha",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "beatriz.santos@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Beatriz Santos",
        year: "11.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "diogo.ribeiro@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Diogo Ribeiro",
        year: "11.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "carolina.lopes@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Carolina Lopes",
        year: "11.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "miguel.alves@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Miguel Alves",
        year: "11.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "ana.mendes@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Ana Mendes",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "francisco.sousa@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Francisco Sousa",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "matilde.correia@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Matilde Correia",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "afonso.pereira@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Afonso Pereira",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "sofia.gomes@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Sofia Gomes",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "tomas.cardoso@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Tomás Cardoso",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "larissa.nunes@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Larissa Nunes",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "rui.monteiro@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Rui Monteiro",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
    {
        email: "eva.baptista@studyflow.local",
        password: STUDENT_PASSWORD,
        role: "STUDENT",
        name: "Eva Baptista",
        year: "12.º ano",
        course: "Técnico de Gestão e Programação de Sistemas Informáticos",
    },
];

/**
 * Executa a seed local completa depois de validar todas as guardas de segurança.
 */
async function main(): Promise<void> {
    if (!["development", "test"].includes(process.env.NODE_ENV ?? "")) {
        throw new Error("A seed só pode correr com NODE_ENV=development ou test.");
    }
    if (process.env.STUDYFLOW_ALLOW_DEV_SEED !== "true") {
        throw new Error(
            "Define STUDYFLOW_ALLOW_DEV_SEED=true para confirmar a seed local.",
        );
    }

    const { mongoUri } = loadRuntimeConfig();
    const seedTarget = assertDevelopmentSeedTarget(mongoUri);
    const pdfStorage = new DemoPdfStorage();
    const fixtures = await pdfStorage.preflight();

    await mongoose.connect(mongoUri);
    if (seedTarget.replaceExistingData) {
        await mongoose.connection.dropDatabase();
        const removedFiles = await pdfStorage.clearCommitted();
        console.log(
            `Base ${seedTarget.databaseName} e ${removedFiles} ficheiros antigos limpos antes do povoamento.`,
        );
    }
    const userModel = mongoose.model(User.name, UserSchema);
    const userIds = await seedDevelopmentUsers(userModel);
    const models = createSeedModels();

    await seedDemoContent(models, userIds);
    const richSummary = await seedRichDemoData({
        userIds,
        pdfStorage,
        fixtures,
    });

    if (process.env.STUDYFLOW_E2E_SEED_AI_GOVERNANCE === "true") {
        await seedE2eAiGovernance(userModel);
    }
    if (
        process.env.STUDYFLOW_DEMO_MODE === "true" &&
        process.env.STUDYFLOW_DEMO_FAKE_AI === "true"
    ) {
        await seedDemoAiGovernance(userModel);
    }

    console.log(JSON.stringify({ ok: true, ...richSummary }));
    await mongoose.disconnect();
}

/**
 * Cria contas previsíveis sem alterar password ou papel de contas existentes.
 *
 * @param userModel Modelo de autenticação.
 * @returns IDs indexados por email para construir todas as relações da seed.
 */
async function seedDevelopmentUsers(
    userModel: Model<User>,
): Promise<Map<string, Types.ObjectId>> {
    const passwordHashes = new Map<string, string>();

    for (const seed of developmentUsers) {
        const existing = await userModel.findOne({ email: seed.email }).lean();
        if (existing) {
            if (existing.role !== seed.role) {
                console.warn(
                    `Conta ${seed.email} existe com role ${existing.role}; não foi alterada.`,
                );
            }
            continue;
        }

        let passwordHash = passwordHashes.get(seed.password);
        if (!passwordHash) {
            passwordHash = await bcrypt.hash(seed.password, BCRYPT_COST);
            passwordHashes.set(seed.password, passwordHash);
        }
        await userModel.create({
            email: seed.email,
            passwordHash,
            role: seed.role,
            authProvider: "local",
        });
    }

    const users = await userModel
        .find({ email: { $in: developmentUsers.map(({ email }) => email) } })
        .select("_id email")
        .lean();
    return new Map(
        users.map((user) => [user.email, user._id as Types.ObjectId]),
    );
}

/**
 * Regista os schemas usados pela seed sem depender do bootstrap NestJS.
 *
 * @returns Modelos Mongoose normalizados para operações idempotentes.
 */
function createSeedModels() {
    return {
        studentProfile: seedModel(StudentProfile.name, StudentProfileSchema),
        schoolClass: seedModel(SchoolClass.name, SchoolClassSchema),
        classMembership: seedModel(ClassMembership.name, ClassMembershipSchema),
        subject: seedModel(Subject.name, SubjectSchema),
        officialMaterial: seedModel(OfficialMaterial.name, OfficialMaterialSchema),
        classPost: seedModel(ClassPost.name, ClassPostSchema),
        classProject: seedModel(ClassProject.name, ClassProjectSchema),
        officialTest: seedModel(OfficialTest.name, OfficialTestSchema),
        officialTestAttempt: seedModel(
            OfficialTestAttempt.name,
            OfficialTestAttemptSchema,
        ),
        classProgressNote: seedModel(
            ClassProgressNote.name,
            ClassProgressNoteSchema,
        ),
        classLearningActivity: seedModel(
            ClassLearningActivity.name,
            ClassLearningActivitySchema,
        ),
        studentClassActivityState: seedModel(
            StudentClassActivityState.name,
            StudentClassActivityStateSchema,
        ),
        guidedStudyRoom: seedModel(GuidedStudyRoom.name, GuidedStudyRoomSchema),
        guidedStudyRoomParticipation: seedModel(
            GuidedStudyRoomParticipation.name,
            GuidedStudyRoomParticipationSchema,
        ),
        studyArea: seedModel(StudyArea.name, StudyAreaSchema),
        material: seedModel(Material.name, MaterialSchema),
        learningProfile: seedModel(LearningProfile.name, LearningProfileSchema),
        aiArtifact: seedModel(AiArtifact.name, AiArtifactSchema),
        aiQuizAttempt: seedModel(AiQuizAttempt.name, AiQuizAttemptSchema),
        studyGoal: seedModel(StudyGoal.name, StudyGoalSchema),
        studyRoutine: seedModel(StudyRoutine.name, StudyRoutineSchema),
        studyEvent: seedModel(StudyEvent.name, StudyEventSchema),
        studyRoom: seedModel(StudyRoom.name, StudyRoomSchema),
        roomShare: seedModel(RoomShare.name, RoomShareSchema),
        roomAiInteraction: seedModel(
            RoomAiInteraction.name,
            RoomAiInteractionSchema,
        ),
        studyGroupMessage: seedModel(
            StudyGroupMessage.name,
            StudyGroupMessageSchema,
        ),
        studyGroupSession: seedModel(
            StudyGroupSession.name,
            StudyGroupSessionSchema,
        ),
        chatThread: seedModel(
            TeacherStudentChatThread.name,
            TeacherStudentChatThreadSchema,
        ),
        chatMessage: seedModel(
            TeacherStudentChatMessage.name,
            TeacherStudentChatMessageSchema,
        ),
    };
}

/**
 * Obtém um modelo já registado ou cria-o para execução isolada do script.
 *
 * @param name Nome Mongoose do modelo.
 * @param schema Schema associado.
 * @returns Modelo apto para operações genéricas da seed.
 */
function seedModel(name: string, schema: Schema): SeedModel {
    return (mongoose.models[name] ?? mongoose.model(name, schema)) as unknown as SeedModel;
}

/**
 * Atualiza ou cria um documento através de uma chave natural estável.
 *
 * @param model Modelo de destino.
 * @param filter Chave natural do registo de demonstração.
 * @param values Estado completo a sincronizar.
 * @returns ID persistido.
 */
async function upsertSeed(
    model: SeedModel,
    filter: Record<string, unknown>,
    values: Record<string, unknown>,
): Promise<Types.ObjectId> {
    const document = await model
        .findOneAndUpdate(
            filter,
            { $set: { ...filter, ...values } },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            },
        )
        .select("_id")
        .exec();
    if (!document) {
        throw new Error(`Não foi possível sincronizar ${model.modelName}.`);
    }
    return document._id as Types.ObjectId;
}

/**
 * Orquestra os vários domínios para que os dados contem uma história coerente.
 *
 * @param models Modelos usados pela seed.
 * @param userIds Contas previamente garantidas.
 */
async function seedDemoContent(
    models: SeedModels,
    userIds: Map<string, Types.ObjectId>,
): Promise<void> {
    const teacherId = requiredUserId(userIds, "professor.dev@studyflow.local");
    const studentSeeds = developmentUsers.filter(({ role }) => role === "STUDENT");
    const studentIds = studentSeeds.map(({ email }) => requiredUserId(userIds, email));

    await seedStudentProfiles(models, userIds, studentSeeds);
    const academic = await seedAcademicContent(models, teacherId, studentIds);
    await seedPersonalStudyContent(models, studentSeeds, userIds);
    await seedCollaborativeContent(models, studentIds);
    await seedTeacherStudentChat(models, teacherId, studentIds, academic);
}

/**
 * Cria os nomes e dados escolares exibidos nas várias páginas de aluno.
 */
async function seedStudentProfiles(
    models: SeedModels,
    userIds: Map<string, Types.ObjectId>,
    students: DevelopmentUserSeed[],
): Promise<void> {
    for (const student of students) {
        const userId = requiredUserId(userIds, student.email);
        await upsertSeed(models.studentProfile, { userId }, {
            name: student.name,
            year: student.year,
            course: student.course,
        });
    }
}

type AcademicSeedResult = {
    classIds: Types.ObjectId[];
    subjectIds: Types.ObjectId[];
};

/**
 * Povoa toda a experiência oficial do professor e das suas turmas.
 */
async function seedAcademicContent(
    models: SeedModels,
    teacherId: Types.ObjectId,
    studentIds: Types.ObjectId[],
): Promise<AcademicSeedResult> {
    const now = new Date();
    const class12Students = studentIds.slice(0, 6);
    const class11Students = [studentIds[0], ...studentIds.slice(6)];
    const class12Id = await upsertSeed(
        models.schoolClass,
        { teacherId, code: "12GPSI" },
        {
            name: "12.º GPSI",
            schoolYear: "2025/2026",
            studentIds: class12Students,
            status: "ACTIVE",
            archivedAt: null,
        },
    );
    const class11Id = await upsertSeed(
        models.schoolClass,
        { teacherId, code: "11GPSI" },
        {
            name: "11.º GPSI",
            schoolYear: "2025/2026",
            studentIds: class11Students,
            status: "ACTIVE",
            archivedAt: null,
        },
    );

    for (const [classId, members] of [
        [class12Id, class12Students],
        [class11Id, class11Students],
    ] as const) {
        for (const [index, studentId] of members.entries()) {
            await upsertSeed(models.classMembership, { classId, studentId }, {
                status: "ACTIVE",
                joinedAt: dateFromNow(-160 + index),
                joinedBy: teacherId,
                removedAt: null,
                joinedAtEstimated: false,
            });
        }
    }

    const subjectSeeds = [
        {
            classId: class12Id,
            name: "Programação e Sistemas de Informação",
            code: "PSI-12",
            description: "APIs REST, Node.js, testes, segurança e arquitetura modular.",
        },
        {
            classId: class12Id,
            name: "Redes de Comunicação",
            code: "RC-12",
            description: "Endereçamento, serviços de rede, diagnóstico e segurança.",
        },
        {
            classId: class12Id,
            name: "Sistemas Operativos",
            code: "SO-12",
            description: "Administração Linux, processos, permissões e automatização.",
        },
        {
            classId: class11Id,
            name: "Bases de Dados",
            code: "BD-11",
            description: "Modelação relacional, SQL, normalização e transações.",
        },
        {
            classId: class11Id,
            name: "Tecnologias Web",
            code: "TW-11",
            description: "HTML semântico, CSS responsivo e JavaScript moderno.",
        },
    ];
    const subjects: Array<(typeof subjectSeeds)[number] & { _id: Types.ObjectId }> = [];
    for (const subject of subjectSeeds) {
        const subjectId = await upsertSeed(
            models.subject,
            { classId: subject.classId, name: subject.name },
            {
                teacherId,
                code: subject.code,
                description: subject.description,
                status: "ACTIVE",
                archivedAt: null,
            },
        );
        subjects.push({ ...subject, _id: subjectId });
    }

    await seedOfficialMaterials(models, teacherId, subjects);
    await seedClassPostsAndProjects(models, teacherId, class12Id, class11Id, subjects);
    const attempts = await seedOfficialTests(
        models,
        teacherId,
        class12Students,
        class11Students,
        subjects,
    );
    await seedClassProgressAndActivity(
        models,
        teacherId,
        class12Id,
        class11Id,
        class12Students,
        class11Students,
        subjects,
        attempts,
    );
    await seedGuidedRooms(
        models,
        teacherId,
        class12Id,
        class11Id,
        class12Students,
        class11Students,
        subjects,
    );

    console.log(`Conteúdo académico sincronizado em ${now.toLocaleDateString("pt-PT")}.`);
    return {
        classIds: [class12Id, class11Id],
        subjectIds: subjects.map(({ _id }) => _id),
    };
}

/** Cria apontamentos, guias e referências oficiais em todas as disciplinas. */
async function seedOfficialMaterials(
    models: SeedModels,
    teacherId: Types.ObjectId,
    subjects: Array<{ _id: Types.ObjectId; classId: Types.ObjectId; name: string }>,
): Promise<void> {
    const topicsBySubject = [
        ["APIs REST seguras", "Testes automatizados", "Arquitetura por módulos"],
        ["Subnetting IPv4", "DNS e DHCP", "Diagnóstico de conectividade"],
        ["Permissões Linux", "Gestão de processos", "Scripts Bash"],
        ["Normalização de dados", "Consultas SQL", "Transações ACID"],
        ["HTML semântico", "Layouts responsivos", "JavaScript assíncrono"],
    ];

    for (const [subjectIndex, subject] of subjects.entries()) {
        for (const [topicIndex, topic] of topicsBySubject[subjectIndex].entries()) {
            await upsertSeed(
                models.officialMaterial,
                { subjectId: subject._id, title: `${topic}: guia de aula` },
                {
                    classId: subject.classId,
                    teacherId,
                    type: "TEXT",
                    status: "PROCESSED",
                    textContent:
                        `Material oficial de ${subject.name} sobre ${topic}. ` +
                        "Inclui objetivos, explicação estruturada, exemplo resolvido, " +
                        "exercícios de consolidação e critérios de autoavaliação.",
                    contentRevision: 1,
                },
            );
        }
        await upsertSeed(
            models.officialMaterial,
            { subjectId: subject._id, title: "Documentação e recursos complementares" },
            {
                classId: subject.classId,
                teacherId,
                type: "URL",
                status: "REFERENCE_ONLY",
                sourceUrl: "https://developer.mozilla.org/pt-BR/docs/Learn",
                contentRevision: 1,
            },
        );
    }
}

/** Cria comunicação docente e projetos em estados distintos. */
async function seedClassPostsAndProjects(
    models: SeedModels,
    teacherId: Types.ObjectId,
    class12Id: Types.ObjectId,
    class11Id: Types.ObjectId,
    subjects: Array<{ _id: Types.ObjectId; classId: Types.ObjectId; name: string }>,
): Promise<void> {
    const posts = [
        [class12Id, "NOTICE", "Calendário das apresentações finais", "As apresentações decorrem na próxima semana. Confirmem o horário e testem antecipadamente a demonstração."],
        [class12Id, "POST", "Recursos para revisão de APIs", "Foram adicionados novos exemplos sobre validação, autenticação e tratamento consistente de erros."],
        [class12Id, "POST", "Balanço da sprint", "A turma melhorou a cobertura de testes. O próximo foco será documentação técnica e acessibilidade."],
        [class11Id, "NOTICE", "Preparação para o mini-teste", "Revejam normalização, chaves e consultas com JOIN. A sala guiada já está disponível."],
        [class11Id, "POST", "Desafio semanal de frontend", "Construam um cartão responsivo apenas com HTML semântico e CSS Grid."],
        [class11Id, "POST", "Materiais novos", "Já podem consultar os guiões de SQL e JavaScript assíncrono na respetiva disciplina."],
    ] as const;
    for (const [classId, type, title, body] of posts) {
        await upsertSeed(models.classPost, { classId, title }, {
            teacherId,
            type,
            body,
            tombstonedAt: null,
        });
    }

    const projects = [
        {
            classId: class12Id,
            subject: subjects[0],
            title: "API de gestão de biblioteca",
            brief: "Desenvolver uma API REST segura para gerir livros, leitores e empréstimos. A solução deve incluir autenticação, validação, documentação e testes automatizados.",
            dueDate: dateFromNow(18),
            status: "PUBLISHED",
        },
        {
            classId: class12Id,
            subject: subjects[1],
            title: "Plano de rede para uma PME",
            brief: "Projetar a rede de uma pequena empresa, incluindo topologia, plano de endereçamento, serviços essenciais, regras de segurança e estratégia de diagnóstico.",
            dueDate: dateFromNow(31),
            status: "PUBLISHED",
        },
        {
            classId: class11Id,
            subject: subjects[3],
            title: "Base de dados para gestão escolar",
            brief: "Modelar e implementar uma base de dados relacional para turmas, disciplinas e avaliações, justificando normalização e integridade referencial.",
            dueDate: dateFromNow(24),
            status: "PUBLISHED",
        },
        {
            classId: class11Id,
            subject: subjects[4],
            title: "Portefólio web acessível",
            brief: "Planear um portefólio responsivo e acessível com HTML semântico, CSS moderno e uma pequena interação em JavaScript sem dependências externas.",
            dueDate: dateFromNow(45),
            status: "DRAFT",
        },
    ] as const;
    for (const project of projects) {
        await upsertSeed(models.classProject, {
            classId: project.classId,
            title: project.title,
        }, {
            teacherId,
            brief: project.brief,
            subjectId: project.subject._id,
            subjectNameSnapshot: project.subject.name,
            subject: project.subject.name,
            dueDate: project.dueDate,
            status: project.status,
            publishedAt: project.status === "PUBLISHED" ? dateFromNow(-12) : null,
        });
    }
}

type SeededAttempt = {
    classId: Types.ObjectId;
    subjectId: Types.ObjectId;
    studentId: Types.ObjectId;
    occurredAt: Date;
    sourceEventKey: string;
};

/** Cria mini-testes com tentativas e resultados variados por aluno. */
async function seedOfficialTests(
    models: SeedModels,
    teacherId: Types.ObjectId,
    class12Students: Types.ObjectId[],
    class11Students: Types.ObjectId[],
    subjects: Array<{ _id: Types.ObjectId; classId: Types.ObjectId; name: string }>,
): Promise<SeededAttempt[]> {
    const testSeeds = [
        {
            subject: subjects[0],
            title: "Mini-teste: APIs REST e segurança",
            status: "CLOSED",
            students: class12Students,
            questions: buildQuestions("Node.js", "validação", "HTTP", "autorização"),
        },
        {
            subject: subjects[1],
            title: "Diagnóstico de redes IPv4",
            status: "PUBLISHED",
            students: class12Students,
            questions: buildQuestions("IPv4", "subnetting", "DNS", "gateway"),
        },
        {
            subject: subjects[2],
            title: "Linux: processos e permissões",
            status: "PUBLISHED",
            students: class12Students,
            questions: buildQuestions("Linux", "chmod", "processos", "shell"),
        },
        {
            subject: subjects[3],
            title: "Normalização e SQL",
            status: "CLOSED",
            students: class11Students,
            questions: buildQuestions("SQL", "chave primária", "JOIN", "3FN"),
        },
        {
            subject: subjects[4],
            title: "Fundamentos de desenvolvimento web",
            status: "PUBLISHED",
            students: class11Students,
            questions: buildQuestions("HTML", "CSS Grid", "DOM", "async/await"),
        },
    ] as const;
    const activities: SeededAttempt[] = [];

    for (const [testIndex, testSeed] of testSeeds.entries()) {
        const testId = await upsertSeed(
            models.officialTest,
            { subjectId: testSeed.subject._id, title: testSeed.title },
            {
                classId: testSeed.subject.classId,
                teacherId,
                description: "Avaliação curta para consolidar os conteúdos trabalhados nas últimas aulas.",
                status: testSeed.status,
                questions: testSeed.questions,
                submissionFenceVersion: testSeed.students.length,
                closedAt: testSeed.status === "CLOSED" ? dateFromNow(-9 + testIndex) : null,
                closedReason: testSeed.status === "CLOSED" ? "TEACHER" : null,
            },
        );

        for (const [studentIndex, studentId] of testSeed.students.entries()) {
            const answers = testSeed.questions.map((question, questionIndex) =>
                (question.correctOptionIndex + (studentIndex + questionIndex) % 3) % 4,
            );
            const results = testSeed.questions.map((question, questionIndex) => ({
                questionIndex,
                selectedOptionIndex: answers[questionIndex],
                correctOptionIndex: question.correctOptionIndex,
                isCorrect: answers[questionIndex] === question.correctOptionIndex,
            }));
            const correctAnswers = results.filter(({ isCorrect }) => isCorrect).length;
            const answeredAt = dateFromNow(-18 + testIndex * 2 + studentIndex / 10);
            const attemptKey = `demo-${testIndex + 1}-${studentId.toString()}-1`;
            await upsertSeed(
                models.officialTestAttempt,
                { studentId, testId, attemptNumber: 1 },
                {
                    subjectId: testSeed.subject._id,
                    classId: testSeed.subject.classId,
                    attemptKey,
                    selectedOptionIndexes: answers,
                    correctAnswers,
                    totalQuestions: results.length,
                    percentage: Math.round((correctAnswers / results.length) * 100),
                    results,
                    answeredAt,
                },
            );
            activities.push({
                classId: testSeed.subject.classId,
                subjectId: testSeed.subject._id,
                studentId,
                occurredAt: answeredAt,
                sourceEventKey: `seed:official-test:${attemptKey}`,
            });
        }
    }
    return activities;
}

/** Cria perguntas simples mas completas para mini-testes de demonstração. */
function buildQuestions(...topics: string[]) {
    return topics.map((topic, index) => ({
        statement: `Qual afirmação descreve corretamente o conceito de ${topic}?`,
        topic,
        options: [
            `${topic} é aplicado de forma explícita no contexto estudado.`,
            `${topic} elimina sempre a necessidade de validação.`,
            `${topic} só pode ser usado sem qualquer configuração.`,
            `${topic} substitui todos os restantes componentes do sistema.`,
        ],
        correctOptionIndex: 0,
        seedOrder: index,
    }));
}

/** Cria notas docentes, eventos minimizados e a projeção de atividade por aluno. */
async function seedClassProgressAndActivity(
    models: SeedModels,
    teacherId: Types.ObjectId,
    class12Id: Types.ObjectId,
    class11Id: Types.ObjectId,
    class12Students: Types.ObjectId[],
    class11Students: Types.ObjectId[],
    subjects: Array<{ _id: Types.ObjectId }>,
    attempts: SeededAttempt[],
): Promise<void> {
    const notes = [
        [class12Id, "Evolução positiva nas APIs", "A maioria da turma já estrutura controllers e services corretamente. Reforçar validação de input e autorização por recurso.", ["validação", "autorização"]],
        [class12Id, "Revisão de redes", "O subnetting continua a exigir prática. Agendar uma sessão guiada com exercícios progressivos.", ["subnetting", "cálculo"]],
        [class11Id, "Consolidação de SQL", "Boa evolução em consultas simples. Trabalhar JOIN, agregações e interpretação de modelos relacionais.", ["JOIN", "modelação"]],
        [class11Id, "Acessibilidade no frontend", "Rever hierarquia de títulos, labels de formulários e navegação por teclado antes do projeto final.", ["acessibilidade", "HTML semântico"]],
    ] as const;
    for (const [classId, title, note, difficultyTags] of notes) {
        await upsertSeed(models.classProgressNote, { classId, title }, {
            teacherId,
            note,
            difficultyTags,
        });
    }

    const extraActivities: SeededAttempt[] = [];
    for (const [classId, students, subjectId] of [
        [class12Id, class12Students, subjects[0]._id],
        [class11Id, class11Students, subjects[3]._id],
    ] as const) {
        for (const [index, studentId] of students.entries()) {
            extraActivities.push({
                classId,
                subjectId,
                studentId,
                occurredAt: dateFromNow(-3 - index / 10),
                sourceEventKey: `seed:guided-room:${classId}:${studentId}`,
            });
        }
    }

    const allActivities = [...attempts, ...extraActivities];
    for (const activity of allActivities) {
        const type = activity.sourceEventKey.includes("guided-room")
            ? "GUIDED_ROOM_COMPLETED"
            : "OFFICIAL_TEST_ATTEMPT";
        await upsertSeed(
            models.classLearningActivity,
            { sourceEventKey: activity.sourceEventKey },
            {
                classId: activity.classId,
                studentId: activity.studentId,
                subjectId: activity.subjectId,
                type,
                occurredAt: activity.occurredAt,
            },
        );
    }

    for (const [classId, students] of [
        [class12Id, class12Students],
        [class11Id, class11Students],
    ] as const) {
        for (const studentId of students) {
            const studentActivities = allActivities
                .filter(
                    (activity) =>
                        activity.classId.equals(classId) &&
                        activity.studentId.equals(studentId),
                )
                .sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime());
            const first = studentActivities[0];
            const last = studentActivities.at(-1);
            if (!first || !last) continue;
            await upsertSeed(
                models.studentClassActivityState,
                { classId, studentId },
                {
                    firstActivityAt: first.occurredAt,
                    lastActivityAt: last.occurredAt,
                    lastActivityType: last.sourceEventKey.includes("guided-room")
                        ? "GUIDED_ROOM_COMPLETED"
                        : "OFFICIAL_TEST_ATTEMPT",
                    activityCount: studentActivities.length,
                },
            );
        }
    }
}

/** Cria salas orientadas pelo professor e participação dos alunos. */
async function seedGuidedRooms(
    models: SeedModels,
    teacherId: Types.ObjectId,
    class12Id: Types.ObjectId,
    class11Id: Types.ObjectId,
    class12Students: Types.ObjectId[],
    class11Students: Types.ObjectId[],
    subjects: Array<{ _id: Types.ObjectId }>,
): Promise<void> {
    const rooms = [
        {
            classId: class12Id,
            subjectId: subjects[0]._id,
            title: "Clínica de APIs REST",
            description: "Sessão orientada para rever validação, autenticação, autorização e tratamento de erros numa API Node.js.",
            goal: "Concluir uma checklist de segurança antes da entrega.",
            startsAt: dateFromNow(2),
            students: class12Students,
            aiEnabled: true,
            status: "OPEN",
        },
        {
            classId: class12Id,
            subjectId: subjects[1]._id,
            title: "Oficina de subnetting",
            description: "Resolução progressiva de exercícios de cálculo de redes, broadcast e intervalos válidos de hosts.",
            goal: "Resolver quatro cenários sem consultar a solução.",
            startsAt: dateFromNow(-3),
            students: class12Students,
            aiEnabled: false,
            status: "CLOSED",
        },
        {
            classId: class11Id,
            subjectId: subjects[3]._id,
            title: "Laboratório de SQL e JOIN",
            description: "Sala guiada com um modelo relacional comum e desafios de dificuldade crescente.",
            goal: "Escrever e explicar consultas com INNER JOIN e agregação.",
            startsAt: dateFromNow(4),
            students: class11Students,
            aiEnabled: true,
            status: "OPEN",
        },
    ] as const;
    for (const room of rooms) {
        const roomId = await upsertSeed(
            models.guidedStudyRoom,
            { classId: room.classId, title: room.title },
            {
                subjectId: room.subjectId,
                teacherId,
                description: room.description,
                materialIds: [],
                goal: room.goal,
                startsAt: room.startsAt,
                durationMinutes: 75,
                aiEnabled: room.aiEnabled,
                status: room.status,
                closedAt: room.status === "CLOSED" ? dateFromNow(-3) : null,
                closedReason: room.status === "CLOSED" ? "TEACHER" : null,
            },
        );
        for (const [index, studentId] of room.students.entries()) {
            const viewedAt = dateFromNow(-5 + index / 10);
            const completed = index % 3 !== 2;
            await upsertSeed(
                models.guidedStudyRoomParticipation,
                { roomId, studentId },
                {
                    classId: room.classId,
                    status: completed ? "COMPLETED" : "VIEWED",
                    firstViewedAt: viewedAt,
                    lastViewedAt: dateFromNow(-3 + index / 10),
                    completedAt: completed ? dateFromNow(-3 + index / 10) : null,
                },
            );
        }
    }
}

/** Povoa áreas pessoais, materiais, rotinas, objetivos, IA e histórico. */
async function seedPersonalStudyContent(
    models: SeedModels,
    students: DevelopmentUserSeed[],
    userIds: Map<string, Types.ObjectId>,
): Promise<void> {
    const areaTemplates = [
        {
            name: "Programação",
            description: "Projetos, exercícios e revisão de Node.js e JavaScript.",
            color: "#2563EB",
            voiceTone: "step_by_step",
            difficulties: ["estruturar problemas complexos", "testar casos limite"],
        },
        {
            name: "Bases de Dados",
            description: "Modelação relacional, SQL e preparação de avaliações.",
            color: "#0F766E",
            voiceTone: "examples_first",
            difficulties: ["JOIN com várias tabelas", "normalização"],
        },
        {
            name: "Redes e Sistemas",
            description: "Redes, Linux e administração de sistemas.",
            color: "#B45309",
            voiceTone: "rigorous",
            difficulties: ["subnetting", "permissões Linux"],
        },
    ] as const;

    for (const [studentIndex, student] of students.entries()) {
        const userId = requiredUserId(userIds, student.email);
        const selectedAreas = studentIndex === 0 ? areaTemplates : areaTemplates.slice(0, 2);
        for (const [areaIndex, area] of selectedAreas.entries()) {
            const studyAreaId = await upsertSeed(
                models.studyArea,
                { userId, name: area.name },
                {
                    description: area.description,
                    color: area.color,
                    archived: false,
                    voiceTone: area.voiceTone,
                    voiceDetailLevel: studentIndex % 2 === 0 ? "detailed" : "normal",
                    voiceNotes: "Usar português claro, exemplos concretos e indicar sempre os passos críticos.",
                },
            );
            const materialIds = await seedPersonalMaterials(
                models,
                userId,
                studyAreaId,
                area.name,
            );
            await upsertSeed(models.learningProfile, { userId, studyAreaId }, {
                pace: studentIndex % 3 === 0 ? "SLOW" : "BALANCED",
                level: areaIndex === 0 && studentIndex > 4 ? "BEGINNER" : "INTERMEDIATE",
                difficulties: area.difficulties,
                preferredExplanationStyle: "Explicação progressiva com exemplo resolvido e pequeno exercício final.",
            });
            await seedAiArtifacts(models, userId, studyAreaId, area.name, materialIds);
        }
        await seedGoalsRoutinesAndEvents(models, userId, studentIndex);
    }
}

/** Cria fontes pessoais prontas a usar pelos artefactos de estudo. */
async function seedPersonalMaterials(
    models: SeedModels,
    userId: Types.ObjectId,
    studyAreaId: Types.ObjectId,
    areaName: string,
): Promise<Types.ObjectId[]> {
    const materials = [
        {
            title: `Apontamentos essenciais de ${areaName}`,
            type: "TOPIC",
            contentText: `Resumo pessoal de ${areaName} com definições, exemplos, dúvidas frequentes e checklist de revisão.`,
        },
        {
            title: `Exercícios resolvidos de ${areaName}`,
            type: "TOPIC",
            contentText: `Coleção de exercícios de ${areaName} organizada por dificuldade, com estratégia de resolução e erros comuns.`,
        },
        {
            title: `Referência online de ${areaName}`,
            type: "URL",
            url: "https://developer.mozilla.org/pt-BR/docs/Learn",
            contentText: `Referência complementar selecionada para aprofundar ${areaName}.`,
        },
    ] as const;
    const ids: Types.ObjectId[] = [];
    for (const material of materials) {
        ids.push(
            await upsertSeed(models.material, { userId, studyAreaId, title: material.title }, {
                type: material.type,
                status: "READY",
                url: "url" in material ? material.url : null,
                contentText: material.contentText,
            }),
        );
    }
    return ids;
}

/** Cria os quatro tipos de artefacto de IA e uma tentativa de quiz. */
async function seedAiArtifacts(
    models: SeedModels,
    userId: Types.ObjectId,
    studyAreaId: Types.ObjectId,
    areaName: string,
    materialIds: Types.ObjectId[],
): Promise<void> {
    const sourceMaterialIds = materialIds.map((id) => id.toString());
    const sourcesJson = materialIds.map((id, index) => ({
        materialId: id.toString(),
        title: index === 0 ? "Apontamentos pessoais" : `Fonte ${index + 1}`,
    }));
    const summaryId = await upsertSeed(
        models.aiArtifact,
        { generationKey: `seed:${userId}:${studyAreaId}:summary` },
        {
            userId,
            studyAreaId,
            type: "SUMMARY",
            contentJson: {
                title: `Resumo de revisão: ${areaName}`,
                bullets: [
                    `Identificar os conceitos essenciais de ${areaName}.`,
                    "Relacionar cada conceito com um exemplo concreto.",
                    "Praticar primeiro sem consultar a solução.",
                    "Registar os erros para orientar a próxima sessão.",
                ],
                sourceMaterialIds,
            },
            sourcesJson,
        },
    );
    await upsertSeed(
        models.aiArtifact,
        { generationKey: `seed:${userId}:${studyAreaId}:explanation` },
        {
            userId,
            studyAreaId,
            type: "EXPLANATION",
            contentJson: {
                title: `${areaName} explicado passo a passo`,
                sections: [
                    {
                        heading: "1. Compreender o problema",
                        body: "Começa por identificar dados, objetivo e restrições antes de escolher uma técnica.",
                        sourceMaterialIds: sourceMaterialIds.slice(0, 1),
                    },
                    {
                        heading: "2. Aplicar num exemplo",
                        body: "Executa cada passo num caso pequeno e confirma o resultado intermédio.",
                        sourceMaterialIds: sourceMaterialIds.slice(1, 2),
                    },
                    {
                        heading: "3. Validar e consolidar",
                        body: "Testa um caso diferente, explica a solução por palavras tuas e revê os erros.",
                        sourceMaterialIds,
                    },
                ],
            },
            sourcesJson,
        },
    );
    await upsertSeed(
        models.aiArtifact,
        { generationKey: `seed:${userId}:${studyAreaId}:flashcards` },
        {
            userId,
            studyAreaId,
            type: "FLASHCARDS",
            contentJson: {
                title: `Flashcards de ${areaName}`,
                cards: [
                    { front: "Qual é o primeiro passo perante um problema novo?", back: "Clarificar o objetivo, os dados disponíveis e as restrições.", sourceMaterialIds: sourceMaterialIds.slice(0, 1) },
                    { front: "Como confirmar que uma solução é robusta?", back: "Testar casos normais, limites e inválidos, verificando os resultados.", sourceMaterialIds: sourceMaterialIds.slice(1, 2) },
                    { front: "O que fazer depois de um erro?", back: "Registar a causa, corrigir o raciocínio e repetir um exercício semelhante.", sourceMaterialIds },
                    { front: `Como consolidar ${areaName}?`, back: "Alternar revisão curta, prática deliberada e explicação por palavras próprias.", sourceMaterialIds },
                ],
            },
            sourcesJson,
        },
    );
    const questions = [
        {
            question: `Qual é a melhor estratégia inicial ao estudar ${areaName}?`,
            options: ["Memorizar sem contexto", "Definir objetivos e testar conhecimentos prévios", "Ignorar erros", "Ler tudo uma única vez"],
            correctOptionIndex: 1,
            explanation: "Objetivos claros e diagnóstico inicial tornam o estudo mais dirigido.",
            sourceMaterialIds,
        },
        {
            question: "Que prática ajuda mais a consolidar conhecimentos?",
            options: ["Prática espaçada com recuperação ativa", "Copiar respostas", "Evitar exercícios", "Estudar apenas na véspera"],
            correctOptionIndex: 0,
            explanation: "A recuperação ativa e espaçada reforça a retenção e revela dificuldades.",
            sourceMaterialIds,
        },
        {
            question: "Como devem ser usados os erros durante o estudo?",
            options: ["Devem ser escondidos", "Não têm utilidade", "Devem orientar revisão e nova prática", "Implicam abandonar o tema"],
            correctOptionIndex: 2,
            explanation: "Analisar a causa do erro permite escolher a revisão adequada.",
            sourceMaterialIds,
        },
    ];
    const quizId = await upsertSeed(
        models.aiArtifact,
        { generationKey: `seed:${userId}:${studyAreaId}:quiz` },
        {
            userId,
            studyAreaId,
            type: "QUIZ",
            contentJson: { title: `Quiz de ${areaName}`, questions },
            sourcesJson,
        },
    );
    const answers = [1, 0, 1];
    const results = questions.map((question, questionIndex) => ({
        questionIndex,
        selectedOptionIndex: answers[questionIndex],
        correctOptionIndex: question.correctOptionIndex,
        isCorrect: answers[questionIndex] === question.correctOptionIndex,
        explanation: question.explanation,
        sourceMaterialIds: question.sourceMaterialIds,
    }));
    const correctCount = results.filter(({ isCorrect }) => isCorrect).length;
    await upsertSeed(
        models.aiQuizAttempt,
        { userId, artifactId: quizId },
        {
            studyAreaId,
            answers,
            correctCount,
            totalQuestions: questions.length,
            scorePercent: Math.round((correctCount / questions.length) * 100),
            results,
            answeredAt: dateFromNow(-6),
        },
    );
    void summaryId;
}

/** Cria planeamento pessoal e um histórico recente com estados variados. */
async function seedGoalsRoutinesAndEvents(
    models: SeedModels,
    userId: Types.ObjectId,
    studentIndex: number,
): Promise<void> {
    const goals = [
        ["Concluir revisão semanal", "Rever os tópicos assinalados e resolver três exercícios.", 5, false],
        ["Preparar apresentação do projeto", "Ensaiar a demonstração e confirmar a checklist técnica.", 14, false],
        ["Organizar apontamentos", "Consolidar notas e marcar dúvidas para a próxima aula.", -4, true],
    ] as const;
    for (const [title, description, targetOffset, completed] of goals) {
        await upsertSeed(models.studyGoal, { userId, title }, {
            description,
            targetDate: dateFromNow(targetOffset + studentIndex),
            completed,
            archived: false,
        });
    }
    const routines = [
        ["Revisão depois das aulas", ["MONDAY", "WEDNESDAY", "FRIDAY"], "18:00", 50],
        ["Sessão curta de exercícios", ["TUESDAY", "THURSDAY"], "19:15", 35],
    ] as const;
    for (const [title, weekdays, startTime, durationMinutes] of routines) {
        await upsertSeed(models.studyRoutine, { userId, title }, {
            weekdays,
            startTime,
            durationMinutes,
            archived: false,
        });
    }
    const events = [
        ["STUDY_AREA_CREATED", "Área de estudo criada", "Organização inicial dos materiais.", -42],
        ["MATERIAL_SUBMITTED", "Novos apontamentos adicionados", "Material pronto para consulta e estudo.", -16],
        ["SUMMARY_GENERATED", "Resumo de revisão gerado", "Resumo baseado nos materiais pessoais.", -10],
        ["STUDY_TOOL_GENERATED", "Flashcards preparados", "Conjunto de cartões disponível para praticar.", -8],
        ["QUIZ_ATTEMPT_RECORDED", "Quiz concluído", "Resultado guardado no histórico de estudo.", -6],
        ["GOAL_UPDATED", "Objetivo de estudo atualizado", "Progresso revisto após a última sessão.", -1],
    ] as const;
    for (const [type, title, description, offset] of events) {
        await upsertSeed(models.studyEvent, {
            userId,
            type,
            title,
        }, {
            description,
            occurredAt: dateFromNow(offset - studentIndex / 20),
        });
    }
}

/** Povoa salas livres com recursos, conversas, sessões e histórico de IA. */
async function seedCollaborativeContent(
    models: SeedModels,
    studentIds: Types.ObjectId[],
): Promise<void> {
    const roomSeeds = [
        { owner: 0, name: "Sprint final de PAP", type: "FREE", disciplineName: undefined, members: [0, 1, 2, 3, 4], description: "Planeamento, revisão técnica e apoio mútuo para as entregas finais." },
        { owner: 1, name: "Clube de Node.js", type: "SUBJECT", disciplineName: "Programação", members: [0, 1, 2, 4, 5], description: "Dúvidas, exemplos e desafios semanais sobre backend moderno." },
        { owner: 3, name: "SQL sem medo", type: "SUBJECT", disciplineName: "Bases de Dados", members: [0, 3, 6, 7, 8], description: "Grupo de prática para modelação, consultas e preparação de testes." },
        { owner: 6, name: "Foco e organização", type: "FREE", disciplineName: undefined, members: [0, 2, 6, 7, 8], description: "Sessões curtas, objetivos semanais e partilha de técnicas de estudo." },
    ] as const;
    for (const [roomIndex, room] of roomSeeds.entries()) {
        const memberIds = room.members.map((index) => studentIds[index]);
        const ownerStudentId = studentIds[room.owner];
        const roomId = await upsertSeed(
            models.studyRoom,
            { ownerStudentId, name: room.name },
            {
                type: room.type,
                disciplineName: room.disciplineName,
                description: room.description,
                memberIds,
            },
        );
        const shareSeeds = [
            { title: "Checklist da próxima sessão", type: "NOTE", textContent: "Rever os conceitos, trazer uma dúvida concreta e concluir um exercício antes da sessão.", usableByAi: true },
            { title: "Resumo colaborativo", type: "NOTE", textContent: `Síntese criada pelo grupo ${room.name}, com decisões, conceitos-chave e próximos passos.`, usableByAi: true },
            { title: "Referência recomendada", type: "URL", url: "https://developer.mozilla.org/pt-BR/docs/Learn", usableByAi: false },
        ] as const;
        const shareIds: Types.ObjectId[] = [];
        for (const [shareIndex, share] of shareSeeds.entries()) {
            shareIds.push(
                await upsertSeed(models.roomShare, { roomId, title: share.title }, {
                    authorStudentId: memberIds[shareIndex % memberIds.length],
                    type: share.type,
                    textContent: "textContent" in share ? share.textContent : null,
                    url: "url" in share ? share.url : null,
                    usableByAi: share.usableByAi,
                    tombstonedAt: null,
                }),
            );
        }
        await upsertSeed(
            models.roomAiInteraction,
            { roomId, studentId: memberIds[0], question: "Quais devem ser as prioridades da próxima sessão?" },
            {
                answer: "Comecem pela dúvida que bloqueia mais membros, resolvam um exemplo em conjunto e terminem com uma tarefa individual curta.",
                sourceShareIds: shareIds.slice(0, 2),
                visibility: "SHARED",
                sharedAt: dateFromNow(-2 - roomIndex),
            },
        );
        await upsertSeed(
            models.roomAiInteraction,
            { roomId, studentId: memberIds[1], question: "Podes criar um plano de revisão de 30 minutos?" },
            {
                answer: "Usa 5 minutos para diagnóstico, 15 para prática ativa, 5 para corrigir erros e 5 para resumir o que ainda precisa de revisão.",
                sourceShareIds: shareIds.slice(0, 1),
                visibility: "PRIVATE",
            },
        );
        const messages = [
            "Já deixei a checklist para a próxima sessão.",
            "Vou preparar dois exercícios para resolvermos em conjunto.",
            "Posso ficar responsável por reunir as dúvidas do grupo.",
            "A referência partilhada tem um exemplo útil na secção introdutória.",
            "Combinado. No final registamos os próximos passos.",
        ];
        for (const [messageIndex, text] of messages.entries()) {
            await upsertSeed(
                models.studyGroupMessage,
                { groupId: roomId, authorStudentId: memberIds[messageIndex % memberIds.length], text },
                { kind: messageIndex === 2 ? "NOTE" : "MESSAGE", tombstonedAt: null },
            );
        }
        for (const [sessionIndex, session] of [
            ["Revisão colaborativa", 2, 60, "Resolver dúvidas prioritárias e consolidar conceitos."],
            ["Sprint de exercícios", 8, 45, "Completar uma sequência curta de exercícios e rever erros."],
        ].entries()) {
            const [title, dayOffset, durationMinutes, goal] = session as [string, number, number, string];
            await upsertSeed(models.studyGroupSession, { groupId: roomId, title }, {
                createdByStudentId: memberIds[sessionIndex % memberIds.length],
                startsAt: dateFromNow(dayOffset + roomIndex),
                durationMinutes,
                goal,
            });
        }
    }
}

/** Cria canais oficiais por disciplina com conversas representativas. */
async function seedTeacherStudentChat(
    models: SeedModels,
    teacherId: Types.ObjectId,
    studentIds: Types.ObjectId[],
    academic: AcademicSeedResult,
): Promise<void> {
    for (const [index, subjectId] of academic.subjectIds.entries()) {
        const classId = index < 3 ? academic.classIds[0] : academic.classIds[1];
        const threadId = await upsertSeed(models.chatThread, { subjectId }, {
            classId,
            teacherId,
            status: "OPEN",
        });
        const messages = [
            { authorUserId: studentIds[0], authorRole: "STUDENT", text: "Professor, pode confirmar quais são os conteúdos prioritários para a próxima aula?" },
            { authorUserId: teacherId, authorRole: "TEACHER", text: "Sim. Revejam o último guia, resolvam os exercícios assinalados e tragam uma dúvida concreta." },
            { authorUserId: studentIds[(index + 1) % studentIds.length], authorRole: "STUDENT", text: "O material complementar também faz parte da revisão?" },
            { authorUserId: teacherId, authorRole: "TEACHER", text: "É recomendado para aprofundar, mas a avaliação incide nos objetivos indicados no guia principal." },
        ] as const;
        for (const [messageIndex, message] of messages.entries()) {
            await upsertSeed(
                models.chatMessage,
                { threadId, clientMessageId: `seed-${index}-${messageIndex}` },
                {
                    subjectId,
                    classId,
                    authorUserId: message.authorUserId,
                    authorRole: message.authorRole,
                    text: message.text,
                    tombstonedAt: null,
                },
            );
        }
    }
}

/** Devolve um ID obrigatório e falha cedo se uma conta não ficou disponível. */
function requiredUserId(
    userIds: Map<string, Types.ObjectId>,
    email: string,
): Types.ObjectId {
    const userId = userIds.get(email);
    if (!userId) throw new Error(`Conta de seed em falta: ${email}.`);
    return userId;
}

/** Produz datas recentes e futuras relativamente ao momento de execução. */
function dateFromNow(dayOffset: number): Date {
    return new Date(Date.now() + dayOffset * DAY_MS);
}

/**
 * Cria apenas fixtures explícitas do ambiente E2E. Não é executado pela seed
 * de desenvolvimento normal e nunca concede ROOM_AI automaticamente.
 */
async function seedE2eAiGovernance(
    userModel: Model<User>,
): Promise<void> {
    const policyModel = mongoose.model(AiModelPolicy.name, AiModelPolicySchema);
    const quotaModel = mongoose.model(AiQuotaPolicy.name, AiQuotaPolicySchema);
    const consentModel = mongoose.model(AiConsent.name, AiConsentSchema);

    for (const purpose of AI_PURPOSES) {
        await policyModel.updateOne(
            { purpose },
            {
                $set: {
                    enabled: purpose !== "ROOM_AI",
                    provider: "openai",
                    model: "studyflow-e2e-fake",
                    timeoutMs: 8_000,
                    maxSourceCount: 10,
                    maxPromptChars: 12_000,
                },
                $setOnInsert: { purpose },
            },
            { upsert: true, runValidators: true },
        );
    }

    const users = await userModel
        .find({ email: { $in: developmentUsers.map((user) => user.email) } })
        .select("_id")
        .lean();
    for (const user of users) {
        for (const purpose of AI_PURPOSES.filter((value) => value !== "ROOM_AI")) {
            await consentModel.updateOne(
                { userId: user._id, purpose },
                {
                    $set: {
                        actorId: user._id,
                        status: "GRANTED",
                        policyVersion: CURRENT_AI_POLICY_VERSIONS[purpose],
                    },
                    $setOnInsert: { userId: user._id, purpose },
                },
                { upsert: true, runValidators: true },
            );
        }
        for (const purpose of USER_QUOTA_PURPOSES) {
            await quotaModel.updateOne(
                { scope: "USER", targetId: user._id, purpose },
                {
                    $set: { monthlyLimitUnits: 100 },
                    $setOnInsert: {
                        scope: "USER",
                        targetId: user._id,
                        purpose,
                    },
                },
                { upsert: true, runValidators: true },
            );
        }
    }
}

/**
 * Ativa governação apenas para as contas sintéticas e para o provider fake.
 */
async function seedDemoAiGovernance(userModel: Model<User>): Promise<void> {
    const policyModel = mongoose.model(AiModelPolicy.name, AiModelPolicySchema);
    const quotaModel = mongoose.model(AiQuotaPolicy.name, AiQuotaPolicySchema);
    const consentModel = mongoose.model(AiConsent.name, AiConsentSchema);
    for (const purpose of AI_PURPOSES) {
        await policyModel.updateOne(
            { purpose },
            {
                $set: {
                    enabled: true,
                    provider: "openai",
                    model: "studyflow-demo-fake",
                    timeoutMs: 8_000,
                    maxSourceCount: 10,
                    maxPromptChars: 12_000,
                },
                $setOnInsert: { purpose },
            },
            { upsert: true, runValidators: true },
        );
    }
    const users = await userModel
        .find({ email: { $in: developmentUsers.map(({ email }) => email) } })
        .select("_id")
        .lean();
    for (const user of users) {
        for (const purpose of AI_PURPOSES) {
            await consentModel.updateOne(
                { userId: user._id, purpose },
                {
                    $set: {
                        actorId: user._id,
                        status: "GRANTED",
                        policyVersion: CURRENT_AI_POLICY_VERSIONS[purpose],
                    },
                    $setOnInsert: { userId: user._id, purpose },
                },
                { upsert: true, runValidators: true },
            );
            await quotaModel.updateOne(
                { scope: "USER", targetId: user._id, purpose },
                {
                    $set: { monthlyLimitUnits: 500 },
                    $setOnInsert: {
                        scope: "USER",
                        targetId: user._id,
                        purpose,
                    },
                },
                { upsert: true, runValidators: true },
            );
        }
    }
}

/**
 * Valida o alvo da seed e exige confirmação reforçada antes de substituir uma
 * base completa. Atlas só é permitido no modo destrutivo explicitamente
 * confirmado; o modo idempotente normal continua limitado a loopback.
 *
 * @param mongoUri URI MongoDB carregada da configuração de runtime.
 * @returns Nome da base validada e indicação de substituição integral.
 */
export function assertDevelopmentSeedTarget(mongoUri: string): {
    databaseName: string;
    replaceExistingData: boolean;
} {
    const parsed = new URL(mongoUri);
    const hostname = parsed.hostname.toLowerCase();
    const databaseName = parsed.pathname.replace(/^\//, "");
    if (!/^studyflow(?:[_-](?:dev|test|e2e))?$/i.test(databaseName)) {
        throw new Error("A seed exige uma base StudyFlow permitida.");
    }

    const replaceExistingData =
        process.env.STUDYFLOW_REPLACE_EXISTING_DATA === "true";
    const isLoopback = ["127.0.0.1", "localhost", "[::1]"].includes(hostname);
    const isAtlas =
        parsed.protocol === "mongodb+srv:" && hostname.endsWith(".mongodb.net");

    if (!isLoopback && !isAtlas) {
        throw new Error("A seed só aceita MongoDB local ou MongoDB Atlas oficial.");
    }
    if (isLoopback && !parsed.searchParams.get("replicaSet")?.trim()) {
        throw new Error("A seed exige MongoDB local configurado como replica set.");
    }
    if (isAtlas && !replaceExistingData) {
        throw new Error(
            "Uma seed Atlas exige STUDYFLOW_REPLACE_EXISTING_DATA=true.",
        );
    }
    if (
        replaceExistingData &&
        process.env.STUDYFLOW_RESET_CONFIRMATION !== databaseName
    ) {
        throw new Error(
            "STUDYFLOW_RESET_CONFIRMATION deve coincidir com o nome da base a substituir.",
        );
    }

    return { databaseName, replaceExistingData };
}

if (process.argv[1]?.endsWith("seed-development-users.js")) {
    void main().catch(async (error: unknown) => {
        console.error(error);
        await mongoose.disconnect().catch(() => undefined);
        process.exitCode = 1;
    });
}
