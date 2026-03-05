export interface RichTextEditorProps {
  id: string
  label: string
  value: string
  handleChange: (value: string) => void
  isDarkMode?: boolean
  placeholder?: string
}