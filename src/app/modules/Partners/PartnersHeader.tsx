import { Button } from '@/atoms/button/Button'

interface PartnersHeaderProps {
  onAddPartner: () => void
}

export const PartnersHeader = ({ onAddPartner }: PartnersHeaderProps) => (
  <div className="mb-6 flex items-center justify-between gap-4">
    <div className="border-l-3 border-primary pl-4">
      <h2 className="text-lg font-semibold text-slate-50">Partners</h2>
      <p className="mt-1 text-sm text-slate-400">
        Create and manage partners with contact details.
      </p>
    </div>
    <Button onClick={onAddPartner}>Add partner</Button>
  </div>
)
