/**
 * Expõe endpoints técnicos seguros sobre o runtime da API.
 */
import { Controller, Get } from "@nestjs/common";
import {
    RuntimeInstanceService,
    RuntimeInstanceView,
} from "./runtime-instance.service.js";

/**
 * Controller de diagnóstico mínimo para validação operacional.
 */
@Controller("api/runtime")
export class RuntimeController {
    /**
     * Recebe as dependências injetadas de RuntimeController para manter metadados de runtime testável e separado de detalhes externos.
     *
     * @param runtimeInstanceService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(
        private readonly runtimeInstanceService: RuntimeInstanceService,
    ) {}

    /**
     * Devolve o identificador da instância e stores partilhados.
     *
     * @returns Metadados seguros para confirmar balanceamento horizontal.
     */
    @Get("instance")
    instance(): RuntimeInstanceView {
        return this.runtimeInstanceService.describe();
    }
}
