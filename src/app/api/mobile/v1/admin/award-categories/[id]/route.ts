import { createAdminCrudIdHandlers } from '@/lib/mobile/createAdminCrudHandlers'

const handlers = createAdminCrudIdHandlers('award_categories')
export const PATCH = handlers.PATCH
export const DELETE = handlers.DELETE
