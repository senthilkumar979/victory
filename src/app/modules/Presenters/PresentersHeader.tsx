import { Button } from '@/atoms/button/Button'

interface PresentersHeaderProps {
  onAddPresenter: () => void
}

export const PresentersHeader = ({ onAddPresenter }: PresentersHeaderProps) => (
  <div className="mb-6 flex items-center justify-between gap-4">
    <div className="border-l-3 border-primary pl-4">
      <h2 className="text-lg font-semibold text-slate-50">Presenters</h2>
      <p className="mt-1 text-sm text-slate-400">
        Create and manage presenter records with student, date, and topic.
      </p>
    </div>
    <Button onClick={onAddPresenter}>Add presenter</Button>
  </div>
)
