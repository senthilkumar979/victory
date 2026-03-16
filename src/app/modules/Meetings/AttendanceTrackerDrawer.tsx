'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

import { useMeetingAttendance } from '@/hooks/useMeetingAttendance'
import { useStudentsForAttendance } from '@/hooks/useStudentsForAttendance'
import { Badge } from '@/ui/atoms/badge/Badge'
import { Drawer } from '@/ui/organisms/drawer/Drawer'
import { gooeyToast } from 'goey-toast'
import {
  Check,
  CheckCircle2,
  ClipboardList,
  RotateCcw,
  Trash2,
  UserCheck,
  XIcon,
} from 'lucide-react'

import { Button } from '@/atoms/button/Button'
import type { MeetingFormState, StudentForAttendance } from './Meeting.types'

interface AttendanceTrackerDrawerProps {
  isOpen: boolean
  meeting: MeetingFormState | null
  onClose: () => void
  onSuccess?: () => void
}

const hasAttendance = (serialNo: number, attendance: number[]) =>
  serialNo > 0 && attendance.includes(serialNo)

const toggleAttendance = (serialNo: number, attendance: number[]) => {
  if (serialNo <= 0) return attendance
  const set = new Set(attendance)
  if (set.has(serialNo)) set.delete(serialNo)
  else set.add(serialNo)
  return [...set].sort((a, b) => a - b)
}

export const AttendanceTrackerDrawer = ({
  isOpen,
  meeting,
  onClose,
  onSuccess,
}: AttendanceTrackerDrawerProps) => {
  const {
    students,
    loading: studentsLoading,
    error: studentsError,
    cohort,
    setCohort,
    cohortOptions,
  } = useStudentsForAttendance()

  const {
    loading: attendanceLoading,
    error: attendanceError,
    attendance: savedAttendance,
    fetchAttendance,
    updateAttendance,
  } = useMeetingAttendance()

  const [localAttendance, setLocalAttendance] = useState<number[]>([])

  useEffect(() => {
    if (!isOpen) {
      setLocalAttendance([])
      return
    }
    if (!meeting?.id) return
    fetchAttendance(meeting.id).then((data) => {
      setLocalAttendance(data)
    })
  }, [isOpen, meeting?.id, fetchAttendance])

  const handleToggle = useCallback((student: StudentForAttendance) => {
    if (student.serialNo <= 0) return
    setLocalAttendance((prev) => toggleAttendance(student.serialNo, prev))
  }, [])

  const handleMarkAll = useCallback(() => {
    const allSerialNos = students.map((s) => s.serialNo).filter((n) => n > 0)
    setLocalAttendance([...new Set(allSerialNos)].sort((a, b) => a - b))
  }, [students])

  const handleUnmarkAll = useCallback(() => setLocalAttendance([]), [])

  const handleReset = useCallback(
    () => setLocalAttendance([...savedAttendance]),
    [savedAttendance],
  )

  const handleSave = useCallback(async () => {
    if (!meeting?.id) return
    try {
      await updateAttendance(meeting.id, localAttendance)
      gooeyToast.success('Attendance saved.', {
        description: `${localAttendance.length} student(s) marked present.`,
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
      })
      onSuccess?.()
    } catch {
      gooeyToast.error('Failed to save attendance.', {
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        description: attendanceError,
      })
    }
  }, [meeting, localAttendance, updateAttendance, onSuccess, attendanceError])

  const isLoading = studentsLoading || attendanceLoading
  const error = studentsError || attendanceError
  const hasChanges =
    localAttendance.length !== savedAttendance.length ||
    localAttendance.some((n, i) => savedAttendance[i] !== n)
  const attendedCount = localAttendance.length

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="xxl">
      <Drawer.Title
        description={
          meeting
            ? `Mark attendance for "${meeting.title}". Filter by cohort batch below.`
            : undefined
        }
      >
        <span className="flex items-center gap-2">
          <ClipboardList className="size-4" />
          Attendance Tracker
        </span>
      </Drawer.Title>
      <Drawer.Body>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex-1">
              <label
                htmlFor="attendance-cohort"
                className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-400"
              >
                Cohort Batch
              </label>
              <select
                id="attendance-cohort"
                value={cohort}
                onChange={(e) => setCohort(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800/90 px-3 py-2.5 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                <option value="">Select a cohort to load students</option>
                <option value="__all__">All cohorts</option>
                {cohortOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="tertiary"
                size="sm"
                onClick={handleMarkAll}
                disabled={students.length === 0}
              >
                <UserCheck className="size-4" /> Mark All
              </Button>
              <Button
                variant="tertiary"
                size="sm"
                onClick={handleUnmarkAll}
                disabled={localAttendance.length === 0}
              >
                <XIcon className="size-4" /> Unmark All
              </Button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          {isLoading && (
            <p className="text-sm text-slate-400">Loading students…</p>
          )}

          {!cohort && !isLoading && (
            <p className="rounded-lg border border-slate-700/60 bg-slate-800/30 px-4 py-3 text-sm text-slate-300">
              Select a cohort above to load students and mark attendance.
            </p>
          )}

          {cohort && !isLoading && students.length === 0 && (
            <p className="rounded-lg border border-slate-700/60 bg-slate-800/30 px-4 py-3 text-sm text-slate-300">
              No students found for this cohort. Ensure students have serial
              numbers.
            </p>
          )}

          {!isLoading && students.length > 0 && (
            <>
              <ul className="max-h-[min(60vh,400px)] space-y-1 overflow-y-auto rounded-lg border border-slate-700/70 bg-slate-800/40 p-2">
                {students.map((student) => {
                  const isAttended = hasAttendance(
                    student.serialNo,
                    localAttendance,
                  )
                  return (
                    <li
                      key={student.id}
                      className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-700/50"
                    >
                      <input
                        type="checkbox"
                        id={`att-${student.id}`}
                        checked={isAttended}
                        onChange={() => handleToggle(student)}
                        disabled={student.serialNo <= 0}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary/40 focus:ring-offset-0 focus:ring-offset-slate-950"
                      />
                      <label
                        htmlFor={`att-${student.id}`}
                        className="flex flex-1 cursor-pointer items-center gap-3"
                      >
                        {student.picture ? (
                          <Image
                            src={student.picture}
                            alt={student.name}
                            width={32}
                            height={32}
                            className="size-8 rounded-full object-cover ring-1 ring-slate-600/50"
                          />
                        ) : (
                          <span className="flex size-8 items-center justify-center rounded-full border-2 border-primary/60 bg-slate-700/80 text-primary text-sm font-semibold">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span className="text-sm font-medium text-slate-200">
                          {student.name}
                        </span>
                        <span className="rounded bg-slate-700/60 px-1.5 py-0.5 text-xs font-medium text-slate-300">
                          #{student.serialNo}
                        </span>
                      </label>
                      {isAttended && (
                        <Badge color="success" size="sm" className="shrink-0">
                          Attended
                        </Badge>
                      )}
                    </li>
                  )
                })}
              </ul>

              <div className="rounded-xl border border-slate-700/70 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-4 shadow-lg ring-1 ring-slate-600/30">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        Total Attendance
                      </p>
                      <p className="text-xs text-slate-400">
                        Students marked present for this meeting
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold tabular-nums text-primary">
                      {attendedCount}
                    </span>
                    <span className="ml-1 text-sm text-slate-400">
                      / {students.filter((s) => s.serialNo > 0).length}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          <XIcon className="size-4" /> Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            variant="tertiary"
            size="sm"
            onClick={handleUnmarkAll}
            disabled={localAttendance.length === 0}
          >
            <Trash2 className="size-4" /> Clear All
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="size-4" /> Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || attendanceLoading}
          >
            <Check className="size-4" /> Save
          </Button>
        </div>
      </Drawer.Footer>
    </Drawer>
  )
}
