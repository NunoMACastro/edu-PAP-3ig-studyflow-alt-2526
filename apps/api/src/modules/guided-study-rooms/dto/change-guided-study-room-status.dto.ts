/** Transição explícita e limitada do estado de uma sala guiada. */
import { IsIn } from "class-validator";

export class ChangeGuidedStudyRoomStatusDto {
    @IsIn(["OPEN", "CLOSED"])
    status!: "OPEN" | "CLOSED";
}
