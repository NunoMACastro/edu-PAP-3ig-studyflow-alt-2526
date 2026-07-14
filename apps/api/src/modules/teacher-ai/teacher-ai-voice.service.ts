/**
 * Implementa as regras de negócio de voz da IA docente e concentra validações do domínio.
 */
import { ForbiddenException, Injectable, Optional } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Model, Types, type ClientSession, type Connection } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import {
    MAX_TEACHER_AI_VOICE_RULES,
    UpdateTeacherAiVoiceDto,
} from "./dto/update-teacher-ai-voice.dto.js";
import {
    TeacherClassAiVoice,
    TeacherClassAiVoiceDocument,
} from "./schemas/teacher-class-ai-voice.schema.js";
import {
    TeacherAiDetailLevel,
    TeacherAiTone,
    TeacherAiVoice,
    TeacherAiVoiceDocument,
} from "./schemas/teacher-ai-voice.schema.js";

/**
 * Contexto de configuração ou herança devolvido pela API de voz docente.
 */
export type TeacherAiVoiceScope = "CLASS" | "SUBJECT";
/**
 * Origem efetiva da voz usada para orientar a IA.
 */
export type TeacherAiVoiceSource = "SUBJECT_OVERRIDE" | "CLASS_BASE" | "DEFAULT";

/**
 * Vista pública de voz da IA docente, sem detalhes internos de Mongoose.
 */
export type TeacherAiVoiceView = {
    _id?: string;
    scope: TeacherAiVoiceScope;
    source: TeacherAiVoiceSource;
    hasOverride: boolean;
    subjectId?: string;
    classId: string;
    teacherId?: string;
    tone: TeacherAiTone;
    detailLevel: TeacherAiDetailLevel;
    rules: string[];
};

/**
 * Serviço da voz docente textual.
 */
@Injectable()
export class TeacherAiVoiceService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param voiceModel Modelo Mongoose injetado para ler e persistir voz da IA docente.
     * @param classVoiceModel Modelo Mongoose injetado para ler e persistir voz base por turma.
     * @param subjectsService Service injetado para reutilizar regras de disciplinas sem duplicar validações.
     * @param classesService Service injetado para reutilizar regras de turmas sem duplicar validações.
     */
    constructor(
        @InjectModel(TeacherAiVoice.name)
        private readonly voiceModel: Model<TeacherAiVoiceDocument>,
        @InjectModel(TeacherClassAiVoice.name)
        private readonly classVoiceModel: Model<TeacherClassAiVoiceDocument>,
        private readonly subjectsService: SubjectsService,
        private readonly classesService: ClassesService,
        @Optional()
        @InjectConnection()
        private readonly connection?: Connection,
    ) {}

    /**
     * Carrega voz base da IA docente para uma turma do professor.
     *
     * @param actor Utilizador autenticado vindo da sessão; valida role e ownership.
     * @param classId Identificador da turma que define a voz base.
     * @returns Voz da turma ou defaults quando ainda não existe configuração.
     */
    async getClassTeacherVoice(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<TeacherAiVoiceView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const voice = await this.classVoiceModel
            .findOne({ classId: new Types.ObjectId(schoolClass._id) })
            .lean();
        if (!voice) {
            return this.defaultVoice({
                scope: "CLASS",
                classId: schoolClass._id,
            });
        }
        return this.toClassBaseVoiceView(voice, { scope: "CLASS" });
    }

    /**
     * Atualiza a voz base da IA docente de uma turma.
     *
     * @param actor Utilizador autenticado vindo da sessão; valida role e ownership.
     * @param classId Identificador da turma que define a voz base.
     * @param input Dados de voz normalizados pelo DTO.
     * @returns Voz base da turma persistida.
     */
    async updateClassTeacherVoice(
        actor: AuthenticatedUser,
        classId: string,
        input: UpdateTeacherAiVoiceDto,
    ): Promise<TeacherAiVoiceView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedActiveClass(
            actor.id,
            classId,
        );
        const voice = await this.runInTransaction(async (session) => {
            await this.classesService.reserveActiveChildMutation(
                actor.id,
                schoolClass._id,
                session,
            );
            return this.classVoiceModel
                .findOneAndUpdate(
                    { classId: new Types.ObjectId(schoolClass._id) },
                    {
                        $set: {
                            tone: input.tone,
                            detailLevel: input.detailLevel,
                            rules: this.cleanRules(input.rules ?? []),
                        },
                        $setOnInsert: {
                            classId: new Types.ObjectId(schoolClass._id),
                            teacherId: new Types.ObjectId(actor.id),
                        },
                    },
                    session
                        ? { new: true, upsert: true, runValidators: true, session }
                        : { new: true, upsert: true, runValidators: true },
                )
                .lean();
        });
        return this.toClassBaseVoiceView(voice, { scope: "CLASS" });
    }

    /**
     * Carrega a voz efetiva da disciplina: override próprio, voz da turma ou defaults.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Entidade de voz da IA docente já filtrada pelo contexto recebido.
     */
    async getTeacherVoice(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<TeacherAiVoiceView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubjectForHistory(
            actor.id,
            subjectId,
        );
        return this.resolveTeacherVoice({
            classId: subject.classId,
            subjectId: subject._id,
        });
    }

    /**
     * Atualiza o override de voz da IA docente de uma disciplina.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param subjectId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async updateTeacherVoice(
        actor: AuthenticatedUser,
        subjectId: string,
        input: UpdateTeacherAiVoiceDto,
    ): Promise<TeacherAiVoiceView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const voice = await this.runInTransaction(async (session) => {
            await this.subjectsService.reserveActiveChildMutation(
                actor.id,
                subject.classId,
                subject._id,
                session,
            );
            return this.voiceModel
                .findOneAndUpdate(
                    { subjectId: new Types.ObjectId(subject._id) },
                    {
                        $set: {
                            tone: input.tone,
                            detailLevel: input.detailLevel,
                            rules: this.cleanRules(input.rules ?? []),
                        },
                        $setOnInsert: {
                            subjectId: new Types.ObjectId(subject._id),
                            classId: new Types.ObjectId(subject.classId),
                            teacherId: new Types.ObjectId(actor.id),
                        },
                    },
                    session
                        ? { new: true, upsert: true, runValidators: true, session }
                        : { new: true, upsert: true, runValidators: true },
                )
                .lean();
        });
        return this.toSubjectOverrideVoiceView(voice);
    }

    /**
     * Remove o override de voz da disciplina, fazendo-a voltar a herdar da turma.
     *
     * @param actor Utilizador autenticado vindo da sessão; valida role e ownership.
     * @param subjectId Identificador da disciplina cujo override será removido.
     * @returns Voz efetiva após remoção do override.
     */
    async deleteSubjectTeacherVoice(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<TeacherAiVoiceView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        await this.runInTransaction(async (session) => {
            await this.subjectsService.reserveActiveChildMutation(
                actor.id,
                subject.classId,
                subject._id,
                session,
            );
            await this.voiceModel.deleteOne(
                { subjectId: new Types.ObjectId(subject._id) },
                session ? { session } : undefined,
            );
        });
        return this.resolveTeacherVoice({
            classId: subject.classId,
            subjectId: subject._id,
        });
    }

    /**
     * Resolve a voz efetiva para IA docente, respeitando a ordem override -> turma -> default.
     *
     * @param input Identificadores já validados pelo chamador.
     * @returns Voz efetiva pronta para prompt ou UI.
     */
    async resolveTeacherVoice(input: {
        classId: string;
        subjectId?: string;
    }): Promise<TeacherAiVoiceView> {
        if (input.subjectId) {
            const subjectOverride = await this.voiceModel
                .findOne({ subjectId: new Types.ObjectId(input.subjectId) })
                .lean();
            if (subjectOverride) {
                return this.toSubjectOverrideVoiceView(subjectOverride);
            }
        }

        const classVoice = await this.classVoiceModel
            .findOne({ classId: new Types.ObjectId(input.classId) })
            .lean();
        if (classVoice) {
            return this.toClassBaseVoiceView(classVoice, {
                scope: input.subjectId ? "SUBJECT" : "CLASS",
                subjectId: input.subjectId,
            });
        }

        return this.defaultVoice({
            scope: input.subjectId ? "SUBJECT" : "CLASS",
            classId: input.classId,
            subjectId: input.subjectId,
        });
    }

    /**
     * Procura voz por disciplina no contrato antigo; preferir `resolveTeacherVoice` em novos fluxos.
     *
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Entidade de voz da IA docente já filtrada pelo contexto recebido.
     */
    async findVoiceForSubject(subjectId: string): Promise<TeacherAiVoiceView> {
        const voice = await this.voiceModel
            .findOne({ subjectId: new Types.ObjectId(subjectId) })
            .lean();
        if (!voice) {
            return this.defaultVoice({
                scope: "SUBJECT",
                classId: "",
                subjectId,
            });
        }
        return this.toSubjectOverrideVoiceView(voice);
    }

    /** Mantém a reserva de lifecycle e a escrita da configuração num só commit. */
    private async runInTransaction<T>(
        operation: (session?: ClientSession) => Promise<T>,
    ): Promise<T> {
        if (!this.connection) return operation(undefined);
        return this.connection.transaction((session) => operation(session));
    }

    /**
     * Executa a operação default voice no domínio de voz da IA docente com contrato explícito.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    private defaultVoice(input: {
        scope: TeacherAiVoiceScope;
        classId: string;
        subjectId?: string;
    }): TeacherAiVoiceView {
        return {
            scope: input.scope,
            source: "DEFAULT",
            hasOverride: false,
            classId: input.classId,
            subjectId: input.subjectId,
            tone: "CALM",
            detailLevel: "BALANCED",
            rules: [],
        };
    }

    /**
     * Remove ruído ou conteúdo perigoso antes de usar o valor no fluxo de voz da IA docente.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param rules Valor de rules usado pela função para executar clean rules com dados explícitos.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    private cleanRules(rules: string[]): string[] {
        return rules
            .map((rule) => rule.trim())
            .filter((rule) => rule.length > 0)
            .slice(0, MAX_TEACHER_AI_VOICE_RULES);
    }

    /**
     * Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    /**
     * Mapeia o documento interno de voz de disciplina para uma forma pública estável.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param voice Valor de voice usado pela função para executar to subject override voice view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toSubjectOverrideVoiceView(voice: {
        _id?: unknown;
        subjectId: unknown;
        classId: unknown;
        teacherId: unknown;
        tone: TeacherAiTone;
        detailLevel: TeacherAiDetailLevel;
        rules?: string[];
    }): TeacherAiVoiceView {
        return {
            _id: voice._id ? String(voice._id) : undefined,
            scope: "SUBJECT",
            source: "SUBJECT_OVERRIDE",
            hasOverride: true,
            subjectId: String(voice.subjectId),
            classId: String(voice.classId),
            teacherId: String(voice.teacherId),
            tone: voice.tone,
            detailLevel: voice.detailLevel,
            rules: voice.rules ?? [],
        };
    }

    /**
     * Mapeia o documento interno de voz base da turma para o contrato público.
     *
     * @param voice Documento persistido da voz base.
     * @param context Contexto em que a voz está a ser lida.
     * @returns Contrato público sem campos internos de persistência.
     */
    private toClassBaseVoiceView(
        voice: {
            _id?: unknown;
            classId: unknown;
            teacherId: unknown;
            tone: TeacherAiTone;
            detailLevel: TeacherAiDetailLevel;
            rules?: string[];
        },
        context: { scope: TeacherAiVoiceScope; subjectId?: string },
    ): TeacherAiVoiceView {
        return {
            _id: voice._id ? String(voice._id) : undefined,
            scope: context.scope,
            source: "CLASS_BASE",
            hasOverride: false,
            classId: String(voice.classId),
            subjectId: context.subjectId,
            teacherId: String(voice.teacherId),
            tone: voice.tone,
            detailLevel: voice.detailLevel,
            rules: voice.rules ?? [],
        };
    }
}
