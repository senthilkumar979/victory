import { createAdminCrudHandlers } from '@/lib/mobile/createAdminCrudHandlers'

const handlers = createAdminCrudHandlers('presenters')
export const GET = handlers.GET
export const POST = handlers.POST
