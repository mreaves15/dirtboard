import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProperties } from './api'
import { supabase } from './supabase'

vi.mock('./supabase', () => {
  const orderFn = vi.fn(() => Promise.resolve({ data: [], error: null }))
  const eqFn = vi.fn(() => ({
    order: orderFn,
  }))
  const selectFn = vi.fn(() => ({
    order: orderFn,
    eq: eqFn,
  }))
  const fromFn = vi.fn(() => ({
    select: selectFn,
  }))

  return {
    supabase: {
      from: fromFn,
      _mocks: { fromFn, selectFn, eqFn, orderFn },
    },
  }
})

function getMocks() {
  return (supabase as unknown as { _mocks: {
    fromFn: ReturnType<typeof vi.fn>
    selectFn: ReturnType<typeof vi.fn>
    eqFn: ReturnType<typeof vi.fn>
    orderFn: ReturnType<typeof vi.fn>
  } })._mocks
}

describe('getProperties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Re-wire mock chain after clear
    const { fromFn, selectFn, eqFn, orderFn } = getMocks()
    orderFn.mockReturnValue(Promise.resolve({ data: [], error: null }))
    eqFn.mockReturnValue({ order: orderFn })
    selectFn.mockReturnValue({ order: orderFn, eq: eqFn })
    fromFn.mockReturnValue({ select: selectFn })
  })

  it('calls supabase without .eq when no status filter is provided', async () => {
    const { selectFn, eqFn, orderFn } = getMocks()

    await getProperties()

    expect(supabase.from).toHaveBeenCalledWith('properties')
    expect(selectFn).toHaveBeenCalledWith('*')
    expect(eqFn).not.toHaveBeenCalled()
    expect(orderFn).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('calls supabase with .eq("status", value) when status filter is provided', async () => {
    const { selectFn, eqFn, orderFn } = getMocks()

    await getProperties({ status: 'qualified' })

    expect(supabase.from).toHaveBeenCalledWith('properties')
    expect(selectFn).toHaveBeenCalledWith('*')
    expect(eqFn).toHaveBeenCalledWith('status', 'qualified')
    expect(orderFn).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('does not call .eq when status is "all"', async () => {
    const { eqFn } = getMocks()

    await getProperties({ status: 'all' })

    expect(eqFn).not.toHaveBeenCalled()
  })
})
