/**
 * Implementa as regras de negócio de voz da IA docente e concentra validações do domínio.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { UpdateTeacherAiVoiceDto } from "./dto/update-teacher-ai-voice.dto.js";
import {
    TeacherAiDetailLevel,
    TeacherAiTone,
    TeacherAiVoice,
    TeacherAiVoiceDocument,
} from "./schemas/teacher-ai-voice.schema.js";

/**
 * Vista pública de voz da IA docente, sem detalhes internos de Mongoose.
 */
export type TeacherAiVoiceView = {
    _id?: string;
    subjectId: string;
    classId?: string;
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
     * @param subjectsService Service injetado para reutilizar regras de disciplinas sem duplicar validações.
     */
    constructor(
        @InjectModel(TeacherAiVoice.name)
        private readonly voiceModel: Model<TeacherAiVoiceDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Carrega voz da IA docente no formato necessário ao próximo passo do fluxo.
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
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const voice = await this.voiceModel
            .findOne({ subjectId: new Types.ObjectId(subject._id) })
            .lean();
        if (!voice) return this.defaultVoice(subject._id);
        return this.toVoiceView(voice);
    }

    /**
     * Atualiza voz da IA docente sem alterar a semântica pública do endpoint ou componente.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Registo de voz da IA docente atualizado e normalizado para consumo externo.
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
        const voice = await this.voiceModel
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
                { new: true, upsert: true, runValidators: true },
            )
            .lean();
        return this.toVoiceView(voice);
    }

    /**
     * Procura voz da IA docente com filtros de ownership, membership ou estado para evitar leituras indevidas.
     *
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Entidade de voz da IA docente já filtrada pelo contexto recebido.
     */
    async findVoiceForSubject(subjectId: string): Promise<TeacherAiVoiceView> {
        const voice = await this.voiceModel
            .findOne({ subjectId: new Types.ObjectId(subjectId) })
            .lean();
        if (!voice) return this.defaultVoice(subjectId);
        return this.toVoiceView(voice);
    }

    /**
     * Executa a operação default voice no domínio de voz da IA docente com contrato explícito.
     *
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Valor de voz da IA docente no contrato esperado pelo chamador.
     */
    private defaultVoice(subjectId: string): TeacherAiVoiceView {
        return {
            subjectId,
            tone: "CALM",
            detailLevel: "BALANCED",
            rules: [],
        };
    }

    /**
     * Remove ruído ou conteúdo perigoso antes de usar o valor no fluxo de voz da IA docente.
     *
     * @param rules rules necessário para executar clean rules sem depender de estado global.
     * @returns Valor normalizado e seguro para ser usado pelo restante fluxo.
     */
    private cleanRules(rules: string[]): string[] {
        return rules
            .map((rule) => rule.trim())
            .filter((rule) => rule.length > 0)
            .slice(0, 8);
    }

    /**
     * Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo.
     *
     * @param actor Utilizador autenticado que executa a operação.
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
     * Mapeia o documento interno de voz da IA docente para uma forma pública estável e simples de consumir.
     *
     * @param voice voice necessário para executar to voice view sem depender de estado global.
     * @returns Contrato público sem campos internos de persistência.
     */
    private toVoiceView(voice: {
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
            subjectId: String(voice.subjectId),
            classId: String(voice.classId),
            teacherId: String(voice.teacherId),
            tone: voice.tone,
            detailLevel: voice.detailLevel,
            rules: voice.rules ?? [],
        };
    }
}
