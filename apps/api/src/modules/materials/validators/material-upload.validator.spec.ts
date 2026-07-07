/**
 * Testa o comportamento de materials e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException, PayloadTooLargeException } from "@nestjs/common";
import {
    MATERIAL_UPLOAD_OPTIONS,
    MAX_UPLOAD_BYTES,
    validateMaterialUpload,
} from "./material-upload.validator.js";

describe("material-upload.validator", () => {
    /**
     * Cria um ficheiro Multer mínimo para testes unitários.
     *
     * @param overrides Valor de overrides usado pela função para executar make file com dados explícitos.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    function makeFile(
        overrides: Partial<Express.Multer.File>,
    ): Express.Multer.File {
        return {
            fieldname: "file",
            originalname: "apontamentos.pdf",
            encoding: "7bit",
            mimetype: "application/pdf",
            size: 12,
            buffer: Buffer.from("%PDF-1.7"),
            stream: undefined as never,
            destination: "",
            filename: "",
            path: "",
            ...overrides,
        };
    }

    it("aceita PDF com MIME, extensão e assinatura válidos", () => {
        expect(() => validateMaterialUpload(makeFile({}))).not.toThrow();
    });

    it("aceita DOCX com MIME, extensão e assinatura ZIP", () => {
        expect(() =>
            validateMaterialUpload(
                makeFile({
                    originalname: "ficha.docx",
                    mimetype:
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    buffer: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
                }),
            ),
        ).not.toThrow();
    });

    it("rejeita ficheiro disfarçado com assinatura inválida", () => {
        expect(() =>
            validateMaterialUpload(
                makeFile({
                    buffer: Buffer.from("MZ executavel"),
                }),
            ),
        ).toThrow(BadRequestException);
    });

    it("rejeita extensão incoerente com o MIME", () => {
        expect(() =>
            validateMaterialUpload(
                makeFile({
                    originalname: "apontamentos.exe",
                }),
            ),
        ).toThrow(BadRequestException);
    });

    it("rejeita MIME fora do contrato MF0", () => {
        expect(() =>
            validateMaterialUpload(
                makeFile({
                    originalname: "imagem.png",
                    mimetype: "image/png",
                    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
                }),
            ),
        ).toThrow(BadRequestException);
    });

    it("rejeita ficheiro em falta", () => {
        expect(() => validateMaterialUpload(undefined as never)).toThrow(
            BadRequestException,
        );
    });

    it("rejeita ficheiro acima do limite MF0", () => {
        expect(() =>
            validateMaterialUpload(
                makeFile({
                    size: MAX_UPLOAD_BYTES + 1,
                }),
            ),
        ).toThrow(PayloadTooLargeException);
    });

    it("aplica fileFilter aos metadados antes de aceitar o upload", () => {
        const callback = jest.fn();

        MATERIAL_UPLOAD_OPTIONS.fileFilter(
            {},
            makeFile({ originalname: "apontamentos.exe" }),
            callback,
        );

        expect(callback).toHaveBeenCalledWith(
            expect.any(BadRequestException),
            false,
        );
    });
});
