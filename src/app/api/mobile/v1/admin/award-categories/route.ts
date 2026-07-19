import { createAdminCrudHandlers } from '@/lib/mobile/createAdminCrudHandlers'

const handlers = createAdminCrudHandlers('award_categories')
export const GET = handlers.GET
export const POST = handlers.POST
