/** Define a precondição de revisão da primeira publicação Markdown. */
import { IsInt, Max, Min } from "class-validator";

export class PublishOfficialMarkdownDto {
    @IsInt()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    expectedRevision!: number;
}
