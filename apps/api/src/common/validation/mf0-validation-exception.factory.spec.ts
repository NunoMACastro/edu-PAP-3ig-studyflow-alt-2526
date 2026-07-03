/**
 * Testa o comportamento de infraestrutura comum e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { UpdateStudentProfileDto } from "../../modules/students/dto/update-student-profile.dto.js";
import { mf0ValidationExceptionFactory } from "./mf0-validation-exception.factory.js";

describe("mf0ValidationExceptionFactory", () => {
    /**
     * Confirma o contrato negativo do BK-MF0-03 contra mass assignment.
     */
    it("mapeia campos proibidos de perfil para FORBIDDEN_PROFILE_FIELD", async () => {
        const pipe = new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory: mf0ValidationExceptionFactory,
        });

        await expect(
            pipe.transform(
                {
                    name: "Aluno",
                    role: "ADMIN",
                    email: "novo@example.com",
                    userId: "507f1f77bcf86cd799439012",
                },
                {
                    type: "body",
                    metatype: UpdateStudentProfileDto,
                },
            ),
        ).rejects.toMatchObject({
            response: {
                code: "FORBIDDEN_PROFILE_FIELD",
            },
        });
    });

    /**
     * Confirma que validações sem contrato BK mantêm erro 400 genérico.
     */
    it("mantém BadRequestException para validações genéricas", () => {
        const error = mf0ValidationExceptionFactory([
            {
                property: "name",
                constraints: {
                    maxLength: "name must be shorter than or equal to 120 characters",
                },
            },
        ]);

        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getResponse()).toMatchObject({
            message: ["name must be shorter than or equal to 120 characters"],
        });
    });
});
