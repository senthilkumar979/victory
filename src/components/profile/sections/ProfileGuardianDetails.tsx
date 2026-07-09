'use client'

import { Shield } from 'lucide-react'

interface ProfileGuardianDetailsProps {
  fatherGuardianDetails?: string
  motherDetails?: string
}

export const ProfileGuardianDetails = ({
  fatherGuardianDetails,
  motherDetails,
}: ProfileGuardianDetailsProps) => {
  const hasFather = Boolean(fatherGuardianDetails?.trim())
  const hasMother = Boolean(motherDetails?.trim())

  if (!hasFather && !hasMother) {
    return (
      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          <Shield className="size-4" aria-hidden />
          Guardian details
        </h2>
        <p className="text-sm text-slate-500">No guardian details recorded.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        <Shield className="size-4" aria-hidden />
        Guardian details
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-amber-800">
          Admin only
        </span>
      </h2>
      {hasFather && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Father&apos;s / Guardian&apos;s details
          </h3>
          <p className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm leading-relaxed text-slate-700">
            {fatherGuardianDetails}
          </p>
        </div>
      )}
      {hasMother && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Mother&apos;s details
          </h3>
          <p className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm leading-relaxed text-slate-700">
            {motherDetails}
          </p>
        </div>
      )}
    </div>
  )
}
