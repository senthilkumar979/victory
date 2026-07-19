import { createAdminCrudIdHandlers } from '@/lib/mobile/createAdminCrudHandlers'

const handlers = createAdminCrudIdHandlers('hall_of_fame')
export const PATCH = handlers.PATCH
export const DELETE = handlers.DELETE
