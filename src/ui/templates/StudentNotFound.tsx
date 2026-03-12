import { UserIcon } from 'lucide-react'
import { PrimaryButton } from '../atoms/button/Button'

export const StudentNotFound = ({ message }: { message: string }) => {
  return (
    <div className="min-h-screen px-20 py-12">
      <div className=" flex items-center justify-center gap-5 flex-col rounded-xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-600">
        <UserIcon className="size-10" />
        {message}
        <PrimaryButton onClick={() => window.history.back()} size="sm">
          Go Back
        </PrimaryButton>
      </div>
    </div>
  )
}
