'use client'

import { joinClassNames } from '@/utils/tailwindUtils'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SettingsNavProps } from './SettingNav.types'
import { findFirstEnabledValue, findNextEnabledIndex } from './settingsHelper'

export const SettingsNav = ({
  items,
  className,
  defaultValue,
  value,
  onValueChange,
  'aria-label': ariaLabel = 'Settings navigation',
}: SettingsNavProps) => {
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState<
    string | undefined
  >(() => {
    return defaultValue ?? findFirstEnabledValue(items)
  })

  const activeValue = isControlled ? value : uncontrolledValue

  const activeIndex = useMemo(() => {
    const index = items.findIndex((item) => item.value === activeValue)
    return index === -1 ? 0 : index
  }, [activeValue, items])

  const tabButtonRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    if (isControlled) return
    if (items.length === 0) return
    const hasActiveValue = items.some(
      (item) => item.value === uncontrolledValue && !item.disabled,
    )
    if (hasActiveValue) return

    setUncontrolledValue(defaultValue ?? findFirstEnabledValue(items))
  }, [defaultValue, isControlled, items, uncontrolledValue])

  const setActiveValue = (nextValue: string) => {
    onValueChange?.(nextValue)
    if (!isControlled) setUncontrolledValue(nextValue)
  }

  return (
    <div>
      <div className="shrink-0 border-r border-zinc-200 p-1 mb-4 bg-zinc border border-zinc-400 rounded-lg">
        <div
          role="tablist"
          aria-orientation="horizontal"
          aria-label={ariaLabel}
          className="flex gap-1"
        >
          {items.map((item, index) => {
            const isActive = item.value === activeValue
            const tabId = `settings-nav-tab-${item.value}`
            const panelId = `settings-nav-panel-${item.value}`

            return (
              <button
                key={item.value}
                ref={(node) => {
                  tabButtonRefs.current[index] = node
                }}
                type="button"
                role="tab"
                id={tabId}
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                disabled={item.disabled}
                onClick={() => setActiveValue(item.value)}
                onKeyDown={(event) => {
                  if (items.length === 0) return

                  if (event.key === 'Home') {
                    event.preventDefault()
                    const firstIndex = findNextEnabledIndex(items, 0, 1)
                    if (firstIndex === -1) return
                    const next = items[firstIndex]
                    if (!next) return
                    setActiveValue(next.value)
                    tabButtonRefs.current[firstIndex]?.focus()
                    return
                  }

                  if (event.key === 'End') {
                    event.preventDefault()
                    const lastIndex = findNextEnabledIndex(
                      items,
                      items.length - 1,
                      -1,
                    )
                    if (lastIndex === -1) return
                    const next = items[lastIndex]
                    if (!next) return
                    setActiveValue(next.value)
                    tabButtonRefs.current[lastIndex]?.focus()
                    return
                  }

                  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')
                    return
                  event.preventDefault()

                  const delta = event.key === 'ArrowDown' ? 1 : -1
                  const nextIndex = findNextEnabledIndex(
                    items,
                    activeIndex,
                    delta,
                  )
                  if (nextIndex === -1) return
                  const next = items[nextIndex]
                  if (!next) return
                  setActiveValue(next.value)
                  tabButtonRefs.current[nextIndex]?.focus()
                }}
                className={joinClassNames(
                  'w-full rounded-md px-3 py-2 text-left text-sm outline-none transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary-50 dark:focus-visible:ring-primary-100 dark:focus-visible:ring-offset-primary-950',
                  item.disabled &&
                    'cursor-not-allowed text-primary-400 dark:text-primary-600 focus-visible:ring-0 focus-visible:ring-offset-0',
                  !item.disabled &&
                    !isActive &&
                    'text-primary border border-transparent hover:bg-primary-100 hover:text-primary-900 dark:text-primary-300 hover:border-primary dark:hover:border-primary dark:hover:text-primary hover:border-primary-200',
                  !item.disabled &&
                    isActive &&
                    'bg-primary font-medium text-primary-900 shadow-sm dark:bg-primary-900 dark:text-primary-50 uppercase',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
      <div
        className={joinClassNames(
          'flex w-full overflow-hidden rounded-xl border border-zinc-200 shadow-sm bg-foreground',
          className,
        )}
      >
        <div className="min-w-0 flex-1 p-6">
          {items.map((item) => {
            const isActive = item.value === activeValue
            const tabId = `settings-nav-tab-${item.value}`
            const panelId = `settings-nav-panel-${item.value}`

            return (
              <section
                key={item.value}
                role="tabpanel"
                id={panelId}
                aria-labelledby={tabId}
                hidden={!isActive}
                className={joinClassNames(!isActive && 'hidden')}
              >
                {item.content}
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
