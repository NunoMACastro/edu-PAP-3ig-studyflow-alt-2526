/**
 * Implementa exportação RGPD de dados pessoais próprios.
 */
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import {
    PersonalDataExportDownload,
    PersonalDataRegistryService,
} from "../personal-data/personal-data-registry.service.js";
import { DataExportRequest, DataExportRequestDocument } from "./schemas/data-export-request.schema.js";

/**
 * Serviço de pedidos e downloads de exportação.
 */
@Injectable()
export class PrivacyDataExportsService {
    private readonly activeDownloads = new Set<string>();
    /**
     * Recebe as dependências injetadas de PrivacyDataExportsService para manter exportação de dados pessoais testável e separado de detalhes externos.
     * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
     *
     * @param exportModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param auditLogService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param personalDataRegistry Registry total usado para impedir exportações parciais.
     */
    constructor(
        @InjectModel(DataExportRequest.name)
        private readonly exportModel: Model<DataExportRequestDocument>,
        private readonly auditLogService: AuditLogService,
        private readonly personalDataRegistry: PersonalDataRegistryService,
    ) {}

    /**
     * Cria um pedido de exportação para o próprio utilizador.
     *
     * @param actor Utilizador autenticado.
     * @returns Pedido criado.
     */
    async requestExport(actor: AuthenticatedUser) {
        const request = await this.exportModel.create({
            userId: new Types.ObjectId(actor.id),
            status: "READY",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        await this.auditLogService.record({
            actorId: actor.id,
            domain: "PRIVACY",
            action: "DATA_EXPORT_REQUESTED",
            resourceType: "DataExportRequest",
            resourceId: String(request._id),
            result: "SUCCESS",
        });
        return this.toRequestView(request.toObject());
    }

    /**
     * Lista pedidos próprios.
     *
     * @param actor Utilizador autenticado.
     * @returns Pedidos recentes.
     */
    async listMine(actor: AuthenticatedUser) {
        const requests = await this.exportModel
            .find({ userId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();
        return requests.map((request) => this.toRequestView(request));
    }

    /**
     * Gera bundle JSON sem persistir cópia adicional de dados pessoais.
     *
     * @param actor Utilizador autenticado.
     * @param requestId Pedido de exportação próprio.
     * @returns Bundle completo sem segredos ou chaves internas.
     */
    async download(
        actor: AuthenticatedUser,
        requestId: string,
    ): Promise<PersonalDataExportDownload> {
        if (!Types.ObjectId.isValid(requestId)) throw this.notFound();
        const request = await this.exportModel
            .findOne({ _id: requestId, userId: new Types.ObjectId(actor.id) })
            .lean();
        if (!request) throw this.notFound();
        if (request.expiresAt.getTime() < Date.now()) {
            throw new ForbiddenException({
                code: "DATA_EXPORT_EXPIRED",
                message: "O pedido de exportação expirou.",
            });
        }

        if (this.activeDownloads.has(actor.id)) {
            throw new ConflictException({
                code: "DATA_EXPORT_ALREADY_RUNNING",
                message: "Já existe uma exportação em curso para esta conta.",
            });
        }
        this.activeDownloads.add(actor.id);
        let download: PersonalDataExportDownload;
        try {
            download = await this.personalDataRegistry.createExportDownload(
                actor.id,
            );
        } catch (error) {
            this.activeDownloads.delete(actor.id);
            throw error;
        }
        const registryCleanup = download.cleanup;
        let released = false;
        download.cleanup = async () => {
            if (released) return;
            released = true;
            try {
                await registryCleanup();
            } finally {
                this.activeDownloads.delete(actor.id);
            }
        };
        try {
            await this.auditLogService.record({
                actorId: actor.id,
                domain: "PRIVACY",
                action: "DATA_EXPORT_DOWNLOADED",
                resourceType: "DataExportRequest",
                resourceId: requestId,
                result: "SUCCESS",
                metadata: {
                    collectionCount: download.collectionCount,
                    recordCount: download.recordCount,
                    storedFileCount: download.storedFileCount,
                },
            });
            return download;
        } catch (error) {
            await download.cleanup();
            throw error;
        }
    }

    /**
     * Executa not found no domínio de exportação de dados pessoais, aplicando validações, autorização e persistência de forma coesa.
     * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
     *
     * @returns Exceção estruturada pronta a ser lançada pelo service ou controller.
     */
    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "DATA_EXPORT_NOT_FOUND",
            message: "Pedido de exportação não encontrado.",
        });
    }

    /**
     * Transforma o documento interno de exportação de dados pessoais num contrato público, removendo detalhes de persistência antes de responder à UI.
     * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
     *
     * @param request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toRequestView(request: {
        _id?: unknown;
        status: "READY" | "EXPIRED";
        expiresAt: Date;
        createdAt?: Date;
    }) {
        return {
            id: String(request._id),
            status: request.status,
            expiresAt: request.expiresAt,
            createdAt: request.createdAt,
        };
    }
}
