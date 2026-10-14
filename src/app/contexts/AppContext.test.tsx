import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useContext } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { AppContext, AppProvider } from './AppContext'

const Probe = () => {
  const { repositories, blogs, awards, dispatch } = useContext(AppContext)

  return (
    <>
      <span data-testid="counts">
        {repositories.length}:{blogs.length}:{awards.length}
      </span>
      <button
        type="button"
        onClick={() =>
          dispatch({ type: 'SET_REPOSITORIES', payload: [{ name: 'victory' }] })
        }
      >
        Set repos
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: 'SET_BLOGS', payload: [{ id: 'b1' }] })}
      >
        Set blogs
      </button>
      <button
        type="button"
        onClick={() =>
          dispatch({ type: 'SET_AWARDS', payload: [{ id: 'a1' }, { id: 'a2' }] })
        }
      >
        Set awards
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: 'SET_BLOGS', payload: [] })}
      >
        Clear blogs
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: 'UNKNOWN', payload: null })}
      >
        Unknown
      </button>
    </>
  )
}

afterEach(() => {
  cleanup()
})

describe('AppProvider', () => {
  it('updates one slice without clearing the others and ignores unknown actions', async () => {
    const user = userEvent.setup()
    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    )

    expect(screen.getByTestId('counts')).toHaveTextContent('0:0:0')

    await user.click(screen.getByRole('button', { name: 'Set repos' }))
    await user.click(screen.getByRole('button', { name: 'Set blogs' }))
    await user.click(screen.getByRole('button', { name: 'Set awards' }))
    expect(screen.getByTestId('counts')).toHaveTextContent('1:1:2')

    await user.click(screen.getByRole('button', { name: 'Clear blogs' }))
    expect(screen.getByTestId('counts')).toHaveTextContent('1:0:2')

    await user.click(screen.getByRole('button', { name: 'Unknown' }))
    expect(screen.getByTestId('counts')).toHaveTextContent('1:0:2')
  })
})
