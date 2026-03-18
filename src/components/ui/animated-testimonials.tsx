import React from 'react'

import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import Image from 'next/image'
import { MeetingFormState } from '../../app/modules/Meetings/Meeting.types'
import { formatDateWithoutTime } from '../../utils/meetingUtils'

interface AnimatedCanopyProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical?: boolean
  repeat?: number
  reverse?: boolean
  pauseOnHover?: boolean
  applyMask?: boolean
}

const AnimatedCanopy = ({
  children,
  vertical = false,
  repeat = 4,
  pauseOnHover = false,
  reverse = false,
  className,
  applyMask = true,
  ...props
}: AnimatedCanopyProps) => (
  <div
    {...props}
    className={cn(
      'group relative flex h-full w-full overflow-hidden p-2 [--duration:10s] [--gap:12px] gap-(--gap)',
      vertical ? 'flex-col' : 'flex-row',
      className,
    )}
  >
    {Array.from({ length: repeat }).map((_, index) => (
      <div
        key={`item-${index}`}
        className={cn('flex shrink-0 gap-(--gap)', {
          'group-hover:paused': pauseOnHover,
          'direction-reverse': reverse,
          'animate-canopy-horizontal flex-row': !vertical,
          'animate-canopy-vertical flex-col': vertical,
        })}
      >
        {children}
      </div>
    ))}
    {applyMask && (
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-10 h-full w-full from-white/50 from-5% via-transparent via-50% to-white/50 to-95% dark:from-gray-800/50 dark:via-transparent dark:to-gray-800/50',
          vertical ? 'bg-linear-to-b' : 'bg-linear-to-r',
        )}
      />
    )}
  </div>
)

const ParticipationCard = ({
  participation,
}: {
  participation: MeetingFormState
}) => (
  <div
    className={
      'group mx-2 flex h-25 w-80 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-transparent p-3 transition-all bg-gray-900 hover:border-primary/20 dark:bg-gray-950 dark:hover:border-slate-500 hover:bg-primary/80'
    }
  >
    <div className="flex items-start gap-3">
      <div className="relative h-15 w-15 shrink-0 overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-600">
        {participation.coverImageUrl ? (
          <img
            src={participation.coverImageUrl}
            alt={participation.title}
            className="h-full w-full not-prose object-cover"
            width={100}
            height={100}
          />
        ) : (
          <Image
            src="https://91qunajyvl11yxyb.public.blob.vercel-storage.com/meeting-placeholder.png"
            alt="Meeting placeholder"
            className="h-full w-full not-prose object-cover"
            width={100}
            height={100}
          />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-foreground">
            {participation.title}
          </span>
        </div>
        <p className="mt-1 line-clamp-3 text-sm text-foreground flex items-center gap-2">
          <CalendarIcon className="size-4 text-white" />
          {formatDateWithoutTime(participation.date)}
        </p>
      </div>
    </div>
  </div>
)

export const AnimatedParticipations = ({
  data,
  className,
  cardClassName,
}: {
  data: MeetingFormState[]
  className?: string
  cardClassName?: string
}) => (
  <div className={cn('w-full overflow-x-hidden py-4', className)}>
    {[false, true, false].map((reverse, index) => (
      <AnimatedCanopy
        key={`Canopy-${index}`}
        reverse={reverse}
        className="[--duration:25s]"
        pauseOnHover
        applyMask={false}
        repeat={3}
      >
        {data.map((participation) => (
          <ParticipationCard
            key={participation.id}
            participation={participation}
            className={cardClassName}
          />
        ))}
      </AnimatedCanopy>
    ))}
  </div>
)
