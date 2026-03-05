export interface SettingsNavItem {
  value: string
  label: string
  content: React.ReactNode
  disabled?: boolean
}

export interface SettingsNavProps {
  items: SettingsNavItem[]
  'aria-label'?: string
  className?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}