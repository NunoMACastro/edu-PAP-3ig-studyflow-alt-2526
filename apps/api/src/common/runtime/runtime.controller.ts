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
     * @param runtimeInstanceService Service que fornece metadados seguros da instância.
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
