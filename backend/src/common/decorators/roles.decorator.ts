import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Limita l'accesso a una rotta (o a un intero controller) ai ruoli indicati.
 * Il controllo è fatto da RolesGuard leggendo `ruolo` dal JWT.
 * Esempio: @Roles('cassa')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
