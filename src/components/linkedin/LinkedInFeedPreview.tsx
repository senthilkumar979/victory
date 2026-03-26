import { LinkedinIcon } from 'lucide-react'

interface LinkedInFeedPreviewProps {
  companyDisplayName: string
  commentary: string
  coverImageUrl: string
  primaryLink: string
}

export const LinkedInFeedPreview = ({
  companyDisplayName,
  commentary,
  coverImageUrl,
  primaryLink,
}: LinkedInFeedPreviewProps) => (
  <div className="rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm">
    <div className="flex gap-3 border-b border-slate-100 px-4 py-3">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#0a66c2] text-white">
        <LinkedinIcon className="size-7" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight">{companyDisplayName}</p>
        <p className="text-xs text-slate-500">Company page · Post preview</p>
      </div>
    </div>
    <div className="space-y-3 px-4 py-3">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 linkedin-commentary">
        {commentary.split(/(\s+|$)/).map((part, i) =>
          /^#[\p{L}0-9_]+$/u.test(part.trim()) ? (
            <span key={i} style={{ color: '#0a66c2' }}>{part}</span>
          ) : (
            part
          ),
        )}
      </p>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element -- external URL from DB */}
        <img
          src={coverImageUrl}
          alt=""
          className="aspect-video w-full object-cover"
        />
      </div>
      <a
        href={primaryLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0a66c2] hover:underline"
      >
        {primaryLink}
      </a>
    </div>
  </div>
)
