export const SESSION_VIDEO_CATEGORIES = {
  GENERAL_SESSION: 'general_session',
  CHIT_CHAT: 'chit_chat',
  REACT_SESSION: 'react_session',
  JAVA_SESSION: 'java_session',
  DATA_SESSION: 'data_session',
  STORY_LAB: 'story_lab',
} as const

export type SessionVideoCategory =
  (typeof SESSION_VIDEO_CATEGORIES)[keyof typeof SESSION_VIDEO_CATEGORIES]

export const SESSION_VIDEO_CATEGORY_OPTIONS: {
  value: SessionVideoCategory
  label: string
}[] = [
  { value: SESSION_VIDEO_CATEGORIES.GENERAL_SESSION, label: 'General Session' },
  { value: SESSION_VIDEO_CATEGORIES.CHIT_CHAT, label: 'Chit-Chat' },
  { value: SESSION_VIDEO_CATEGORIES.REACT_SESSION, label: 'React Session' },
  { value: SESSION_VIDEO_CATEGORIES.JAVA_SESSION, label: 'Java Session' },
  { value: SESSION_VIDEO_CATEGORIES.DATA_SESSION, label: 'Data Session' },
  { value: SESSION_VIDEO_CATEGORIES.STORY_LAB, label: 'StoryLab' },
]

export const SESSION_VIDEO_CATEGORY_LABELS: Record<SessionVideoCategory, string> =
  Object.fromEntries(
    SESSION_VIDEO_CATEGORY_OPTIONS.map((o) => [o.value, o.label]),
  ) as Record<SessionVideoCategory, string>

export function getSessionVideoCategoryLabel(
  category: SessionVideoCategory,
): string {
  return SESSION_VIDEO_CATEGORY_LABELS[category] ?? category
}
