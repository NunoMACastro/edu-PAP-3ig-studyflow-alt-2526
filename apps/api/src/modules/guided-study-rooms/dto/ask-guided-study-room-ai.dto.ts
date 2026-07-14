/** Pergunta do aluno à IA supervisionada da sala guiada. */
import { IsString, MaxLength, MinLength } from "class-validator";

export class AskGuidedStudyRoomAiDto {
    @IsString()
    @MinLength(2)
    @MaxLength(1000)
    question!: string;
}
