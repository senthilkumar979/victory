import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NanoBananaSearchBar } from './NanoBananaSearchBar'

afterEach(() => {
  cleanup()
})

function renderBar(prompt: string, isLoading = false, onSubmit = vi.fn()) {
  const onPromptChange = vi.fn()
  render(
    <NanoBananaSearchBar
      prompt={prompt}
      isLoading={isLoading}
      onPromptChange={onPromptChange}
      onSubmit={onSubmit}
    />,
  )
  return { onPromptChange, onSubmit }
}

describe('NanoBananaSearchBar', () => {
  it('blocks Generate for a blank prompt and submits a trimmed one', () => {
    const onSubmit = vi.fn()
    const { rerender, onPromptChange } = (() => {
      const change = vi.fn()
      const view = render(
        <NanoBananaSearchBar
          prompt="   "
          isLoading={false}
          onPromptChange={change}
          onSubmit={onSubmit}
        />,
      )
      return { ...view, onPromptChange: change }
    })()

    const generate = screen.getByRole('button', { name: 'Generate' })
    expect(generate).toBeDisabled()
    fireEvent.click(generate)
    expect(onSubmit).not.toHaveBeenCalled()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Image prompt' }), {
      target: { value: 'rain' },
    })
    expect(onPromptChange).toHaveBeenCalledWith('rain')

    rerender(
      <NanoBananaSearchBar
        prompt="rain"
        isLoading={false}
        onPromptChange={onPromptChange}
        onSubmit={onSubmit}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    fireEvent.keyDown(screen.getByRole('searchbox', { name: 'Image prompt' }), {
      key: 'Enter',
    })
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })

  it('disables submission while a generation is in progress', () => {
    const onSubmit = vi.fn()
    renderBar('rainy cafe', true, onSubmit)

    expect(screen.queryByRole('button', { name: 'Generate' })).not.toBeInTheDocument()
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('still submits on Enter when the prompt is only whitespace', () => {
    const onSubmit = vi.fn()
    renderBar('   ', false, onSubmit)

    fireEvent.keyDown(screen.getByRole('searchbox', { name: 'Image prompt' }), {
      key: 'Enter',
    })
    fireEvent.keyDown(screen.getByRole('searchbox', { name: 'Image prompt' }), {
      key: 'a',
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
