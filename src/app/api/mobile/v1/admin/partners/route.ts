import { createAdminCrudHandlers } from '@/lib/mobile/createAdminCrudHandlers'

const handlers = createAdminCrudHandlers('partners')
export const GET = handlers.GET
export const POST = handlers.POST
