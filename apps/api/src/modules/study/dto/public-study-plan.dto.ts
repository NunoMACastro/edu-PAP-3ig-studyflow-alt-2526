/**
 * Define contratos de dados usados nas entradas e saídas de study.
 */
export type PublicStudyRoutineDto = {
    _id: string;
    title: string;
    weekdays: string[];
    startTime: string;
    durationMinutes: number;
    archived?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

/**
 * DTO que define os dados aceites ou devolvidos no fluxo de rotinas e objetivos de estudo.
 */
export type PublicStudyGoalDto = {
    _id: string;
    title: string;
    description?: string;
    targetDate?: Date;
    completed?: boolean;
    archived?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

/**
 * Forma mínima de rotinas e objetivos de estudo aceite por mappers e testes sem exigir documento completo.
 */
type RoutineLike = Omit<PublicStudyRoutineDto, "_id"> & {
    _id: unknown;
    toObject?: () => RoutineLike;
};

/**
 * Forma mínima de rotinas e objetivos de estudo aceite por mappers e testes sem exigir documento completo.
 */
type GoalLike = Omit<PublicStudyGoalDto, "_id"> & {
    _id: unknown;
    toObject?: () => GoalLike;
};

/**
 * Converte uma rotina persistida no contrato público da MF0.
 *
 * @param routine Documento Mongoose ou objeto lean.
 * @returns Rotina sem `userId` nem campos internos Mongo.
 */
export function toPublicStudyRoutine(
    routine: RoutineLike,
): PublicStudyRoutineDto {
    const value = normalizeDocument(routine);
    return {
        _id: String(value._id),
        title: value.title,
        weekdays: value.weekdays,
        startTime: value.startTime,
        durationMinutes: value.durationMinutes,
        ...(value.archived !== undefined ? { archived: value.archived } : {}),
        ...(value.createdAt ? { createdAt: value.createdAt } : {}),
        ...(value.updatedAt ? { updatedAt: value.updatedAt } : {}),
    };
}

/**
 * Converte um objetivo persistido no contrato público da MF0.
 *
 * @param goal Documento Mongoose ou objeto lean.
 * @returns Objetivo sem `userId` nem campos internos Mongo.
 */
export function toPublicStudyGoal(goal: GoalLike): PublicStudyGoalDto {
    const value = normalizeDocument(goal);
    return {
        _id: String(value._id),
        title: value.title,
        ...(value.description !== undefined
            ? { description: value.description }
            : {}),
        ...(value.targetDate ? { targetDate: value.targetDate } : {}),
        ...(value.completed !== undefined ? { completed: value.completed } : {}),
        ...(value.archived !== undefined ? { archived: value.archived } : {}),
        ...(value.createdAt ? { createdAt: value.createdAt } : {}),
        ...(value.updatedAt ? { updatedAt: value.updatedAt } : {}),
    };
}

/**
 * Usa `toObject` quando existe para lidar com documentos Mongoose.
 *
 * @param value Documento ou objeto já serializado.
 * @returns Objeto serializável.
 */
function normalizeDocument<T extends { toObject?: () => T }>(value: T): T {
    return typeof value.toObject === "function" ? value.toObject() : value;
}
