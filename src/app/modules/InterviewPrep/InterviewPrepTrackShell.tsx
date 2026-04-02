'use client'

import type { CodingExercise } from '@/data/interview-prep'
import { useState } from 'react'
import { CodingExercisesSection } from './CodingExercisesSection'
import {
  InterviewPrepNavTabs,
  type InterviewPrepTabId,
} from './InterviewPrepNavTabs'
import { InterviewPrepSession } from './InterviewPrepSession'

interface InterviewPrepTrackShellProps {
  trackSlug: string
  trackTitle: string
  codingExercises: CodingExercise[]
}

export const InterviewPrepTrackShell = ({
  trackSlug,
  trackTitle,
  codingExercises,
}: InterviewPrepTrackShellProps) => {
  const [tab, setTab] = useState<InterviewPrepTabId>('questions')

  return (
    <div className="space-y-8">
      <InterviewPrepNavTabs value={tab} onChange={setTab} />

      <div
        role="tabpanel"
        id="interview-prep-panel-questions"
        aria-labelledby="interview-prep-tab-questions"
        hidden={tab !== 'questions'}
        className={tab === 'questions' ? 'block' : 'hidden'}
      >
        {tab === 'questions' ? (
          <InterviewPrepSession trackSlug={trackSlug} />
        ) : null}
      </div>

      <div
        role="tabpanel"
        id="interview-prep-panel-coding"
        aria-labelledby="interview-prep-tab-coding"
        hidden={tab !== 'coding'}
        className={tab === 'coding' ? 'block' : 'hidden'}
      >
        <CodingExercisesSection
          trackTitle={trackTitle}
          exercises={codingExercises}
        />
      </div>
    </div>
  )
}
