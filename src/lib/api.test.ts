import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProperties } from './api'
import { supabase } from './supabase'

vi.mock('./supabase', () => {
  const rangeFn = vi.fn(() => Promise.resolve({ data: [], error: null }))
  const orderFn = vi.fn(() => ({ range: rangeFn }))
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
      _mocks: { fromFn, selectFn, eqFn, orderFn, rangeFn },
    },
  }
})

function getMocks() {
  return (supabase as unknown as { _mocks: {
    fromFn: ReturnType<typeof vi.fn>
    selectFn: ReturnType<typeof vi.fn>
    eqFn: ReturnType<typeof vi.fn>
    orderFn: ReturnType<typeof vi.fn>
    rangeFn: ReturnType<typeof vi.fn>
  } })._mocks
}

describe('getProperties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Re-wire mock chain after clear
    const { fromFn, selectFn, eqFn, orderFn, rangeFn } = getMocks()
    rangeFn.mockReturnValue(Promise.resolve({ data: [], error: null }))
    orderFn.mockReturnValue({ range: rangeFn })
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

  it('paginates through all rows when result exceeds the page size', async () => {
    const { rangeFn } = getMocks()

    const page1 = Array.from({ length: 1000 }, (_, i) => ({ id: `id-${i}` }))
    const page2 = [{ id: 'id-1000' }, { id: 'id-1001' }]

    rangeFn
      .mockReturnValueOnce(Promise.resolve({ data: page1, error: null }))
      .mockReturnValueOnce(Promise.resolve({ data: page2, error: null }))

    const result = await getProperties()

    expect(rangeFn).toHaveBeenCalledTimes(2)
    expect(rangeFn).toHaveBeenNthCalledWith(1, 0, 999)
    expect(rangeFn).toHaveBeenNthCalledWith(2, 1000, 1999)
    expect(result).toHaveLength(1002)
  })

  it('stops paginating when a page returns fewer than the page size', async () => {
    const { rangeFn } = getMocks()

    rangeFn.mockReturnValueOnce(
      Promise.resolve({ data: [{ id: 'a' }, { id: 'b' }], error: null })
    )

    const result = await getProperties()

    expect(rangeFn).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(2)
  })
})
