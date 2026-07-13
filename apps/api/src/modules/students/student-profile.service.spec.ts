/** Testes da fronteira entre perfil autónomo e inscrições oficiais. */
import { StudentProfileService } from "./student-profile.service.js";

describe("StudentProfileService", () => {
    it("guarda apenas dados pessoais editáveis e remove className legacy", async () => {
        const profile = {
            userId: "507f1f77bcf86cd799439012",
            name: "Nuno",
            year: "12.º",
            course: "Informática",
        };
        const profileModel = {
            findOneAndUpdate: jest.fn().mockResolvedValue(profile),
        };
        const service = new StudentProfileService(profileModel as never);

        await expect(
            service.updateMyProfile("507f1f77bcf86cd799439012", {
                name: " Nuno ",
                year: " 12.º ",
                course: " Informática ",
            }),
        ).resolves.toBe(profile);

        expect(profileModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.any(Object),
            {
                $set: {
                    name: "Nuno",
                    year: "12.º",
                    course: "Informática",
                },
                $unset: { className: "" },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );
    });
});
