import { useMemo } from 'react'

export const StudentRole = ({ role }: { role: string }) => {
  const roleColor = useMemo(() => {
    if (role === 'Mobile App Developer') return 'tertiary'
    if (role === 'Frontend Engineer') return 'primary'
    if (role === 'Backend Engineer') return 'secondary'
    if (role === 'UX Designer') return 'success'
    if (role === 'FullStack Engineer') return 'info'
    if (role === 'Python Developer') return 'error'
    return 'warning'
  }, [role])
  return (
    <span
      className={`border-l-2 border-${roleColor} pl-2 text-xs font-medium text-${roleColor}`}
    >
      {role}
    </span>
  )
}
