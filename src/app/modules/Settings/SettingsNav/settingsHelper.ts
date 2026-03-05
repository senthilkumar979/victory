import { SettingsNavItem } from "./SettingNav.types"

export const findFirstEnabledValue = (items: SettingsNavItem[]): string | undefined => {
  return items.find((item) => !item.disabled)?.value
}

export const findNextEnabledIndex =(
  items: SettingsNavItem[],
  startIndex: number,
  delta: number,
): number => {
  if (items.length === 0) return -1
  const safeStart = Math.min(Math.max(startIndex, 0), items.length - 1)

  for (let step = 1; step <= items.length; step += 1) {
    const nextIndex = (safeStart + step * delta + items.length) % items.length
    if (!items[nextIndex]?.disabled) return nextIndex
  }

  return -1
}