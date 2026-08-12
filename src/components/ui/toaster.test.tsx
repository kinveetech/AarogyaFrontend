import { describe, it, expect } from 'vitest'
import { act } from 'react'
import { render, screen, waitFor } from '@/test/render'
import { Toaster, toaster } from './toaster'

describe('Toaster', () => {
  it('renders a toast created via the toaster store', async () => {
    render(<Toaster />)

    act(() => {
      toaster.create({
        type: 'error',
        title: 'Could not save',
        description: 'Please try again.',
      })
    })

    await waitFor(() => {
      expect(screen.getByText('Could not save')).toBeInTheDocument()
    })
    expect(screen.getByText('Please try again.')).toBeInTheDocument()
  })
})
