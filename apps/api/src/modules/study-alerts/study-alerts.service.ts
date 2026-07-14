/**
 * Implementa as regras de negócio de alertas de estudo e concentra validações do domínio.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    NotificationContext,
} from "../notification-preferences/dto/update-notification-preferences.dto.js";
import { NotificationPreferencesService } from "../notification-preferences/notification-preferences.service.js";
import { RoutinesService } from "../study/routines.service.js";
import { PublicStudyGoalDto, PublicStudyRoutineDto } from "../study/dto/public-study-plan.dto.js";
import { StudyGroupSessionsService } from "../study-group-sessions/study-group-sessions.service.js";
import { StudyAlertsQueryDto } from "./dto/study-alerts-query.dto.js";

/**
 * Contrato de alertas de estudo que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type StudyAlert = {
    key: string;
    context: NotificationContext;
    title: string;
    body: string;
    dueAt?: Date;
    sourceId: string;
};

/**
 * Serviço de alertas internos derivados de rotinas, objetivos e sessões.
 */
@Injectable()
export class StudyAlertsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param routinesService Service injetado para reutilizar regras de routines sem duplicar validações.
     * @param sessionsService Service injetado para reutilizar regras de sessions sem duplicar validações.
     * @param preferencesService Service injetado para reutilizar regras de preferences sem duplicar validações.
     */
    constructor(
        private readonly routinesService: RoutinesService,
        private readonly sessionsService: StudyGroupSessionsService,
        private readonly preferencesService: NotificationPreferencesService,
    ) {}

    /**
     * Lista alertas in-app respeitando preferências por contexto.
     *
     * @param actor Aluno autenticado.
     * @param query Filtros opcionais.
     * @returns Alertas internos.
     */
    async listAlerts(
        actor: AuthenticatedUser,
        query: StudyAlertsQueryDto,
    ): Promise<StudyAlert[]> {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }

        const [plan, sessions, routineInApp, goalInApp, sessionInApp] =
            await Promise.all([
                this.routinesService.listMine(actor.id),
                this.sessionsService.listUpcomingForStudent(actor, "STUDY_ROOM"),
                this.preferencesService.isInAppEnabled(
                    actor.id,
                    NotificationContext.STUDY_ROUTINE,
                ),
                this.preferencesService.isInAppEnabled(
                    actor.id,
                    NotificationContext.STUDY_GOAL,
                ),
                this.preferencesService.isInAppEnabled(
                    actor.id,
                    NotificationContext.GROUP_SESSION,
                ),
            ]);

        const alerts: StudyAlert[] = [
            ...(routineInApp
                ? plan.routines.map((routine) => this.fromRoutine(routine))
                : []),
            ...(goalInApp ? plan.goals.map((goal) => this.fromGoal(goal)) : []),
            ...(sessionInApp
                ? sessions.map((session) => ({
                      key: `session:${session._id}`,
                      context: NotificationContext.GROUP_SESSION,
                      title: `Sessão: ${session.title}`,
                      body:
                          session.goal ??
                          `Sessão agendada para ${this.formatDateTime(session.startsAt)}.`,
                      dueAt: session.startsAt,
                      sourceId: session._id,
                  }))
                : []),
        ];

        return query.onlyUpcoming
            ? alerts.filter((alert) => !alert.dueAt || alert.dueAt >= new Date())
            : alerts;
    }

    /**
     * Converte rotina num alerta interno.
     *
     * @param routine Rotina pessoal.
     * @returns Alerta de rotina.
     */
    private fromRoutine(routine: PublicStudyRoutineDto): StudyAlert {
        return {
            key: `routine:${routine._id}`,
            context: NotificationContext.STUDY_ROUTINE,
            title: `Rotina: ${routine.title}`,
            body: `Planeada para ${routine.weekdays.join(", ")} às ${routine.startTime}.`,
            sourceId: routine._id,
        };
    }

    /**
     * Converte objetivo num alerta interno.
     *
     * @param goal Objetivo pessoal.
     * @returns Alerta de objetivo.
     */
    private fromGoal(goal: PublicStudyGoalDto): StudyAlert {
        return {
            key: `goal:${goal._id}`,
            context: NotificationContext.STUDY_GOAL,
            title: `Objetivo: ${goal.title}`,
            body: goal.targetDate
                ? `Objetivo com data alvo em ${this.formatDate(goal.targetDate)}.`
                : "Objetivo ativo sem data alvo definida.",
            dueAt: goal.targetDate,
            sourceId: goal._id,
        };
    }

    /**
     * Formata data em PT-PT para resposta pública.
     *
     * @param value Data alvo.
     * @returns Data formatada.
     */
    private formatDate(value: Date): string {
        return new Intl.DateTimeFormat("pt-PT").format(value);
    }

    /**
     * Formata data/hora em PT-PT para alertas.
     *
     * @param value Data da sessão.
     * @returns Data e hora formatadas.
     */
    private formatDateTime(value: Date): string {
        return new Intl.DateTimeFormat("pt-PT", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(value);
    }
}
