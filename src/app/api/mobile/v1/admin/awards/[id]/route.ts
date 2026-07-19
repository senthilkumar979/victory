import { createAdminCrudIdHandlers } from '@/lib/mobile/createAdminCrudHandlers'

const handlers = createAdminCrudIdHandlers('awards')
export const PATCH = handlers.PATCH
export const DELETE = handlers.DELETE
