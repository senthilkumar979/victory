import { Button } from '@/atoms/button/Button'

interface MeetingsHeaderProps {
  onAddMeeting: () => void
}

export const MeetingsHeader = ({ onAddMeeting }: MeetingsHeaderProps) => (
  <div className="mb-6 flex items-center justify-between gap-4">
    <div className="border-l-3 border-primary pl-4">
      <h2 className="text-lg font-semibold text-slate-50">Meetings</h2>
      <p className="mt-1 text-sm text-slate-400">
        Create and manage meetings with date, link, and description.
      </p>
    </div>
    <Button onClick={onAddMeeting}>Add meeting</Button>
  </div>
)
