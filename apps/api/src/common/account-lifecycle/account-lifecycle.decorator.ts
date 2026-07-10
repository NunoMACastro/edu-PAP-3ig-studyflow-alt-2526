/** Marca o endpoint destrutivo que adquire a barreira exclusiva no service. */
import { SetMetadata } from "@nestjs/common";

export const ACCOUNT_DELETION_EXCLUSIVE_METADATA =
    "studyflow:account-deletion-exclusive";

/**
 * Evita que o interceptor adquira uma lease normal para o próprio pedido de
 * eliminação, o que criaria um deadlock com a lease exclusiva do service.
 */
export const AccountDeletionExclusive = () =>
    SetMetadata(ACCOUNT_DELETION_EXCLUSIVE_METADATA, true);
