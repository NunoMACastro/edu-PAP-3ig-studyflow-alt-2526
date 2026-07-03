/**
 * Implementa as regras de negócio de students e concentra validações do domínio.
 */
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateStudentProfileDto } from "./dto/update-student-profile.dto.js";
import {
    StudentProfile,
    StudentProfileDocument,
} from "./schemas/student-profile.schema.js";

/**
 * Serviço do perfil de aluno.
 *
 * Todas as operações recebem `userId` vindo da sessão. O frontend não escolhe
 * qual perfil editar, o que mantém isolamento entre alunos.
 */
@Injectable()
export class StudentProfileService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param profileModel Modelo Mongoose injetado para ler e persistir perfil do aluno.
     */
    constructor(
        @InjectModel(StudentProfile.name)
        private readonly profileModel: Model<StudentProfileDocument>,
    ) {}

    /**
     * Obtém o perfil do aluno autenticado.
     *
     * @param userId Identificador do utilizador vindo da sessão.
     * @returns Perfil existente ou `null` quando ainda não foi preenchido.
     */
    async getMyProfile(
        userId: string,
    ): Promise<StudentProfileDocument | null> {
        if (!Types.ObjectId.isValid(userId)) return null;
        return this.profileModel.findOne({ userId: new Types.ObjectId(userId) });
    }

    /**
     * Cria ou atualiza apenas os campos editáveis do perfil.
     *
     * @param userId Identificador do utilizador vindo da sessão.
     * @param input Campos permitidos pelo DTO.
     * @returns Perfil atualizado.
     * @throws BadRequestException quando o nome fica vazio.
     */
    async updateMyProfile(
        userId: string,
        input: UpdateStudentProfileDto,
    ): Promise<StudentProfileDocument> {
        const name = input.name?.trim();
        if (!name) {
            throw new BadRequestException({
                code: "PROFILE_NAME_REQUIRED",
                message: "Indica o teu nome.",
            });
        }

        const profile = await this.profileModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId) },
            {
                $set: {
                    name,
                    year: this.optionalText(input.year),
                    course: this.optionalText(input.course),
                    className: this.optionalText(input.className),
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        if (!profile) {
            throw new BadRequestException({
                code: "PROFILE_NOT_SAVED",
                message: "Não foi possível guardar o perfil.",
            });
        }

        return profile;
    }

    /**
     * Normaliza texto opcional para evitar guardar strings vazias.
     *
     * @param value Valor recebido do formulário.
     * @returns Texto limpo ou `null` quando está vazio.
     */
    private optionalText(value: string | null | undefined): string | null {
        const trimmed = String(value ?? "").trim();
        return trimmed.length > 0 ? trimmed : null;
    }
}
