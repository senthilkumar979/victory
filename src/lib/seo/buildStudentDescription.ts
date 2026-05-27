interface StudentDescriptionRow {
  name: string
  summary: string | null
  role: string | null
  company: string | null
}

export function buildStudentDescription(row: StudentDescriptionRow): string {
  if (row.summary?.trim()) {
    const summary = row.summary.trim()
    return summary.length > 160 ? `${summary.slice(0, 157)}…` : summary
  }

  const rolePart =
    row.role && row.company
      ? `${row.role} at ${row.company}`
      : row.role || row.company || 'MentorBridge student'

  return `${row.name} — ${rolePart}. Part of the MentorBridge rural tech community.`
}
