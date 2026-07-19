import { createAdminCrudHandlers } from '@/lib/mobile/createAdminCrudHandlers'

const handlers = createAdminCrudHandlers('hall_of_fame')
export const GET = handlers.GET
export const POST = handlers.POST
