import { Presenter } from '@/modules/Presenters/Presenter.types'
import { formatDateWithoutTime } from '@/utils/meetingUtils'
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
  if (presenters.length === 0) return <div>No presentations found.</div>

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        Topics Presented
      </h2>
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
    </div>
  )
}
