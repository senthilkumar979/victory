import { formatDate } from '@/utils/meetingUtils'

export const CalendarDate = ({ date }: { date: string }) => {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-500/10 px-3 py-1 shadow-inner text-primary font-semibold">
      <time dateTime={date}>{formatDate(date)}</time>
    </div>
  )
}
