'use client'

import { AssignmentsList } from './AssignmentsList'

export const AdminAssignments = () => (
  <div className="relative">
    <div className="min-h-[500px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-2 py-2">
      <div className="px-3 py-3">
        <AssignmentsList adminPanel />
      </div>
    </div>
  </div>
)
