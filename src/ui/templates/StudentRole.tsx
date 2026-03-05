import { useMemo } from 'react'

export const StudentRole = ({ role }: { role: string }) => {
  const roleColor = useMemo(() => {
    if (role === 'Mobile App Developer') return 'tertiary'
    if (role === 'Front End Developer') return 'primary'
    if (role === 'Backend Developer') return 'secondary'
    if (role === 'UX Designer') return 'success'
    return 'info'
  }, [role])
  return (
    <span
      className={`border-l-2 border-${roleColor} pl-2 text-xs font-medium text-${roleColor}`}
    >
      {role}
    </span>
  )
}
