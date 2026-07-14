/**
 * Arquivo privado transversal dos materiais criados no Assistente.
 * `userId` é a única fronteira de autorização; disciplina, turma e área pessoal
 * são destinos organizacionais que são revalidados para ações mutáveis.
 */
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ArtifactExportService } from "../ai/artifact-export.service.js";
import type { CreateQuizAttemptDto } from "../ai/dto/create-quiz-attempt.dto.js";
import {
    AiArtifact,
    type AiArtifactDocument,
} from "../ai/schemas/ai-artifact.schema.js";
import {
    AiQuizAttempt,
    type AiQuizAttemptDocument,
} from "../ai/schemas/ai-quiz-attempt.schema.js";
import {
    QuizGenerationJob,
    type QuizGenerationJobDocument,
} from "../ai/schemas/quiz-generation-job.schema.js";
import { StudyToolsService } from "../ai/study-tools.service.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import type { ListStudentStudyMaterialsDto } from "./dto/student-ai-assistant.dto.js";
import { StudentAiArtifactContextService } from "./student-ai-artifact-context.service.js";
import { StudentAiAssistantArtifactsService } from "./student-ai-assistant-artifacts.service.js";

type ArtifactRecord = AiArtifact & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};

@Injectable()
export class StudentStudyMaterialsService {
    constructor(
        @InjectModel(AiArtifact.name)
        private readonly artifactModel: Model<AiArtifactDocument>,
        @InjectModel(AiQuizAttempt.name)
        private readonly quizAttemptModel: Model<AiQuizAttemptDocument>,
        @InjectModel(QuizGenerationJob.name)
        private readonly quizJobModel: Model<QuizGenerationJobDocument>,
        private readonly artifactsService: StudentAiAssistantArtifactsService,
        private readonly artifactContext: StudentAiArtifactContextService,
        private readonly studyToolsService: StudyToolsService,
        private readonly exportService: ArtifactExportService,
        private readonly auditLogService: AuditLogService,
    ) {}

    /** Lista materiais do owner com cursor opaco e estado calculado no momento. */
    async list(actor: AuthenticatedUser, input: ListStudentStudyMaterialsDto) {
        this.assertStudent(actor);
        this.assertTargetFilter(input);
        const limit = input.limit ?? 20;
        const filter = this.buildFilter(actor.id, input);
        let cursor = this.decodeCursor(input.cursor);
        const matched: Array<{
            row: ArtifactRecord;
            view: Awaited<ReturnType<StudentAiAssistantArtifactsService["toArtifactView"]>>;
        }> = [];
        let exhausted = false;

        while (matched.length < limit + 1 && !exhausted) {
            const pageFilter: Record<string, unknown> = { ...filter };
            if (cursor) {
                pageFilter.$or = [
                    { createdAt: { $lt: cursor.createdAt } },
                    {
                        createdAt: cursor.createdAt,
                        _id: { $lt: new Types.ObjectId(cursor.id) },
                    },
                ];
            }
            const rows = (await this.artifactModel
                .find(pageFilter)
                .sort({ createdAt: -1, _id: -1 })
                .limit(50)
                .lean()) as ArtifactRecord[];
            if (!rows.length) break;
            exhausted = rows.length < 50;
            for (const row of rows) {
                const view = await this.artifactsService.toArtifactView(actor.id, row);
                cursor = {
                    createdAt: row.createdAt ?? new Date(0),
                    id: String(row._id),
                };
                if (!input.state || view.target.state === input.state) {
                    matched.push({ row, view });
                    if (matched.length >= limit + 1) break;
                }
            }
        }

        const hasMore = matched.length > limit;
        const page = hasMore ? matched.slice(0, limit) : matched;
        const last = page.at(-1)?.row;
        return {
            items: page.map(({ view }) => view),
            nextCursor:
                hasMore && last
                    ? this.encodeCursor(last.createdAt ?? new Date(0), String(last._id))
                    : null,
        };
    }

    /** Devolve conteúdo e fontes apenas ao aluno proprietário. */
    async get(actor: AuthenticatedUser, artifactId: string) {
        const artifact = await this.findOwned(actor, artifactId);
        return {
            ...(await this.artifactsService.toArtifactView(actor.id, artifact)),
            content: artifact.contentJson,
            sources: artifact.sourcesJson,
        };
    }

    /** Exporta o snapshot persistido; não volta a chamar o provider. */
    async export(actor: AuthenticatedUser, artifactId: string, format?: string) {
        this.assertStudent(actor);
        return this.exportService.exportArtifactForOwner(
            actor.id,
            artifactId,
            format,
        );
    }

    /** Só permite praticar enquanto o destino organizacional continuar ativo. */
    async submitQuizAttempt(
        actor: AuthenticatedUser,
        artifactId: string,
        input: CreateQuizAttemptDto,
    ) {
        const artifact = await this.findOwned(actor, artifactId);
        const access = await this.resolveAccess(actor.id, artifact);
        if (!access.active) {
            throw new ConflictException({
                code: "STUDY_MATERIAL_TARGET_ARCHIVED",
                message: "Este material está arquivado e já não permite novas tentativas.",
            });
        }
        return this.studyToolsService.submitQuizAttemptForOwnedArtifact(
            actor.id,
            artifactId,
            input,
        );
    }

    /** Remove apenas a cópia privada, tentativas e referências de jobs do owner. */
    async delete(actor: AuthenticatedUser, artifactId: string) {
        this.assertStudent(actor);
        if (!Types.ObjectId.isValid(artifactId)) throw this.notFound();
        const artifactObjectId = new Types.ObjectId(artifactId);
        const userObjectId = new Types.ObjectId(actor.id);
        const session = await this.artifactModel.db.startSession();
        try {
            await session.withTransaction(async () => {
                const artifact = await this.artifactModel.findOne({
                    _id: artifactObjectId,
                    userId: userObjectId,
                }).session(session);
                if (!artifact) throw this.notFound();
                await Promise.all([
                    this.quizAttemptModel.deleteMany(
                        { userId: userObjectId, artifactId: artifactObjectId },
                        { session },
                    ),
                    this.quizJobModel.updateMany(
                        { userId: userObjectId, artifactId: artifactObjectId },
                        { $unset: { artifactId: 1 } },
                        { session },
                    ),
                ]);
                await this.artifactModel.deleteOne(
                    { _id: artifactObjectId, userId: userObjectId },
                    { session },
                );
                await this.auditLogService.record(
                    {
                        actorId: actor.id,
                        domain: "AI",
                        action: "STUDENT_STUDY_MATERIAL_DELETED",
                        resourceType: "AiArtifact",
                        resourceId: artifactId,
                        result: "SUCCESS",
                        metadata: { artifactType: artifact.type },
                    },
                    session,
                );
            });
        } finally {
            await session.endSession();
        }
        return { deleted: true };
    }

    private buildFilter(
        userId: string,
        input: ListStudentStudyMaterialsDto,
    ): Record<string, unknown> {
        const filter: Record<string, unknown> = {
            userId: new Types.ObjectId(userId),
        };
        if (input.type) filter.type = input.type;
        if (input.targetKind && input.targetId) {
            if (input.targetKind === "STUDY_AREA") {
                filter.$and = [{
                    $or: [
                        {
                            targetKind: "STUDY_AREA",
                            targetId: new Types.ObjectId(input.targetId),
                        },
                        {
                            targetKind: { $exists: false },
                            studyAreaId: new Types.ObjectId(input.targetId),
                        },
                    ],
                }];
            } else {
                filter.targetKind = input.targetKind;
                filter.targetId = new Types.ObjectId(input.targetId);
            }
        }
        return filter;
    }

    private async findOwned(
        actor: AuthenticatedUser,
        artifactId: string,
    ): Promise<ArtifactRecord> {
        this.assertStudent(actor);
        if (!Types.ObjectId.isValid(artifactId)) throw this.notFound();
        const row = await this.artifactModel.findOne({
            _id: new Types.ObjectId(artifactId),
            userId: new Types.ObjectId(actor.id),
        }).lean();
        if (!row) throw this.notFound();
        return row as ArtifactRecord;
    }

    private resolveAccess(userId: string, artifact: ArtifactRecord) {
        const kind = artifact.targetKind ?? "STUDY_AREA";
        const id = artifact.targetId ?? artifact.studyAreaId;
        if (!id) return Promise.resolve({ active: false, label: "Contexto removido" });
        return this.artifactContext.resolveTargetAccess(
            userId,
            kind,
            String(id),
            artifact.targetLabelSnapshot ?? "Contexto removido",
        );
    }

    private assertTargetFilter(input: ListStudentStudyMaterialsDto): void {
        if (Boolean(input.targetKind) !== Boolean(input.targetId)) {
            throw new BadRequestException({
                code: "STUDY_MATERIAL_TARGET_FILTER_INVALID",
                message: "Indica o tipo e o identificador do destino em conjunto.",
            });
        }
    }

    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }

    private encodeCursor(createdAt: Date, id: string): string {
        return Buffer.from(
            JSON.stringify({ createdAt: createdAt.toISOString(), id }),
        ).toString("base64url");
    }

    private decodeCursor(cursor?: string): { createdAt: Date; id: string } | null {
        if (!cursor) return null;
        try {
            const value = JSON.parse(
                Buffer.from(cursor, "base64url").toString("utf8"),
            ) as { createdAt?: string; id?: string };
            const createdAt = new Date(value.createdAt ?? "");
            if (
                !value.id ||
                !Types.ObjectId.isValid(value.id) ||
                Number.isNaN(createdAt.getTime())
            ) throw new Error("invalid");
            return { createdAt, id: value.id };
        } catch {
            throw new BadRequestException({
                code: "STUDY_MATERIAL_CURSOR_INVALID",
                message: "Cursor de materiais inválido.",
            });
        }
    }

    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "STUDY_MATERIAL_NOT_FOUND",
            message: "Material de estudo não encontrado.",
        });
    }
}
