import { createAdminCrudIdHandlers } from '@/lib/mobile/createAdminCrudHandlers'

const handlers = createAdminCrudIdHandlers('presenters')
export const PATCH = handlers.PATCH
export const DELETE = handlers.DELETE
