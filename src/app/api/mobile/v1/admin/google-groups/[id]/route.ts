import { createAdminCrudIdHandlers } from '@/lib/mobile/createAdminCrudHandlers'

const handlers = createAdminCrudIdHandlers('google_groups')
export const PATCH = handlers.PATCH
export const DELETE = handlers.DELETE
