import { Button } from '@/atoms/button/Button'

interface AwardsHeaderProps {
  onAddAward: () => void
}

export const AwardsHeader = ({ onAddAward }: AwardsHeaderProps) => (
  <div className="mb-6 flex items-center justify-between gap-4">
    <div className="border-l-3 border-primary pl-4">
      <h2 className="text-lg font-semibold text-slate-50">Awards</h2>
      <p className="mt-1 text-sm text-slate-400">
        Create and manage awards with recipient, date, and description.
      </p>
    </div>
    <Button onClick={onAddAward}>Add award</Button>
  </div>
)
