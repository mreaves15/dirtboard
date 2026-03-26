import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProperties } from './useProperties'
import * as api from '@/lib/api'

vi.mock('@/lib/api', () => ({
  getProperties: vi.fn(() => Promise.resolve([])),
  getProperty: vi.fn(),
  createProperty: vi.fn(),
  updateProperty: vi.fn(),
  deleteProperty: vi.fn(),
}))

describe('useProperties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getProperties).mockResolvedValue([])
  })

  it('calls getProperties with no filters by default', async () => {
    renderHook(() => useProperties())

    await waitFor(() => {
      expect(api.getProperties).toHaveBeenCalledWith(undefined)
    })
  })

  it('passes status filter to getProperties', async () => {
    renderHook(() => useProperties({ status: 'qualified' }))

    await waitFor(() => {
      expect(api.getProperties).toHaveBeenCalledWith({ status: 'qualified' })
    })
  })

  it('refetches when status filter changes', async () => {
    const { rerender } = renderHook(
      (props) => useProperties(props),
      { initialProps: { status: 'new' } as { status?: string } }
    )

    await waitFor(() => {
      expect(api.getProperties).toHaveBeenCalledWith({ status: 'new' })
    })

    rerender({ status: 'qualified' })

    await waitFor(() => {
      expect(api.getProperties).toHaveBeenCalledWith({ status: 'qualified' })
    })
  })
})
