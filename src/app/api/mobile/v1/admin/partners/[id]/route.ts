import { createAdminCrudIdHandlers } from '@/lib/mobile/createAdminCrudHandlers'

const handlers = createAdminCrudIdHandlers('partners')
export const PATCH = handlers.PATCH
export const DELETE = handlers.DELETE
