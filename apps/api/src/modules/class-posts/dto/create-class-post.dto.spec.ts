/**
 * Testa o comportamento de turma posts e documenta os cenários de aceitação automatizados.
 */
import { validate } from "class-validator";
import { CreateClassPostDto } from "./create-class-post.dto.js";

describe("CreateClassPostDto", () => {
    it("rejeita corpo com menos de 5 caracteres", async () => {
        const dto = new CreateClassPostDto();
        dto.type = "POST";
        dto.title = "Aviso";
        dto.body = "abcd";

        const errors = await validate(dto);

        expect(errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    property: "body",
                    constraints: expect.objectContaining({
                        minLength: expect.stringContaining("body"),
                    }),
                }),
            ]),
        );
    });
});
