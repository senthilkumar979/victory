import { Presenter } from '@/modules/Presenters/Presenter.types'
import { formatDateWithoutTime } from '@/utils/meetingUtils'
import { Presentation } from 'lucide-react'
import { useFetchPresentersByUser } from '../../../hooks/useFetchPresentersByUser'

interface ProfilePresentationsProps {
  studentEmail: string
}

export const ProfilePresentations = ({
  studentEmail,
}: ProfilePresentationsProps) => {
  const { presenters, isLoading, error } = useFetchPresentersByUser({
    userEmail: studentEmail,
  })

  if (isLoading) return <div>Loading presentations...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        <Presentation className="size-4" /> Topics Presented
      </h2>
      {presenters?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Presentation className="size-12 text-slate-200" />
          <p className="mt-2 text-sm text-slate-500">No presentations yet</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {presenters?.map((presenter: Presenter) => (
            <li
              key={presenter.id}
              className="border-l-3 border-secondary pl-2 pb-2"
            >
              <div className="font-medium text-black">{presenter.topic}</div>
              <div className="text-xs text-slate-400">
                {formatDateWithoutTime(presenter.presented_date)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
