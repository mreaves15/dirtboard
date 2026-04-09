import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertiesPage from './page'
import { mockProperties } from '@/test/mocks'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock the useProperties hook with a spy so we can check what filters are passed
const mockUseProperties = vi.fn((_filters?: { status?: string }) => ({
  properties: mockProperties,
  loading: false,
  error: null,
  refetch: vi.fn(),
  addProperty: vi.fn(),
  editProperty: vi.fn(),
  removeProperty: vi.fn(),
}))

vi.mock('@/hooks/useProperties', () => ({
  useProperties: (filters?: { status?: string }) => mockUseProperties(filters),
}))

describe('Properties Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page heading', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /properties/i })
      ).toBeInTheDocument()
    })
  })

  it('renders the search input', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    })
  })

  it('renders the add property button', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /add property/i })
      ).toBeInTheDocument()
    })
  })

  it('renders the data table', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('shows property data in the table', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      expect(screen.getByText(/LAIESKI/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Putnam/i).length).toBeGreaterThan(0)
    })
  })

  it('shows disqualified properties by default', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      // SIMMS is disqualified but should be visible — no client-side hiding
      expect(screen.getByText(/SIMMS BEVERLY/i)).toBeInTheDocument()
    })
  })

  it('does not render a Show Disqualified checkbox', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      expect(screen.queryByLabelText(/show disqualified/i)).not.toBeInTheDocument()
    })
  })

  it('renders status filter dropdown', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: /status/i })
      ).toBeInTheDocument()
    })
  })

  it('passes status filter to useProperties when set', async () => {
    render(<PropertiesPage />)

    await waitFor(() => {
      // On initial render, useProperties should be called with { status: 'all' }
      expect(mockUseProperties).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'all' })
      )
    })
  })

  it('renders county filter dropdown', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: /county/i })
      ).toBeInTheDocument()
    })
  })

  it('shows correct property count', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      // All 5 visible — disqualified no longer hidden client-side
      expect(screen.getByText(/showing 5 of 5/i)).toBeInTheDocument()
    })
  })

  it('renders sortable column headers for County, Acres, Market Value', async () => {
    render(<PropertiesPage />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^county/i })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /acres/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /market value/i })
      ).toBeInTheDocument()
    })
  })

  it('sorts by county ascending on first click', async () => {
    const user = userEvent.setup()
    render(<PropertiesPage />)

    const countySort = await screen.findByRole('button', { name: /^county/i })
    await user.click(countySort)

    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1]
    expect(within(firstDataRow).getByText('Highlands')).toBeInTheDocument()
  })

  it('sorts by county descending on second click', async () => {
    const user = userEvent.setup()
    render(<PropertiesPage />)

    const countySort = await screen.findByRole('button', { name: /^county/i })
    await user.click(countySort)
    await user.click(countySort)

    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1]
    expect(within(firstDataRow).getByText('Putnam')).toBeInTheDocument()
  })

  it('clears sort on third click', async () => {
    const user = userEvent.setup()
    render(<PropertiesPage />)

    const countySort = await screen.findByRole('button', { name: /^county/i })
    await user.click(countySort)
    await user.click(countySort)
    await user.click(countySort)

    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1]
    expect(within(firstDataRow).getByText(/LAIESKI JOHN EST/i)).toBeInTheDocument()
  })

  it('sorts null values to end when sorting acres', async () => {
    const user = userEvent.setup()
    render(<PropertiesPage />)

    const acresSort = await screen.findByRole('button', { name: /acres/i })
    await user.click(acresSort)

    const rows = screen.getAllByRole('row')
    const lastDataRow = rows[rows.length - 1]
    expect(
      within(lastDataRow).getByText(/PUTNAM NULL ACRE\/VALUE/i)
    ).toBeInTheDocument()
  })

  it('renders min and max acreage inputs', async () => {
    render(<PropertiesPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/min acres/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/max acres/i)).toBeInTheDocument()
    })
  })

  it('filters properties by minimum acreage', async () => {
    const user = userEvent.setup()
    render(<PropertiesPage />)

    const minAcreInput = await screen.findByPlaceholderText(/min acres/i)
    await user.type(minAcreInput, '1')

    expect(screen.getByText(/HIGHLANDS TEST OWNER/i)).toBeInTheDocument()
    expect(screen.queryByText(/LAIESKI JOHN EST/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/BLACKBURN MARY EST/i)).not.toBeInTheDocument()
  })

  it('filters properties by maximum acreage', async () => {
    const user = userEvent.setup()
    render(<PropertiesPage />)

    const maxAcreInput = await screen.findByPlaceholderText(/max acres/i)
    await user.type(maxAcreInput, '0.22')

    expect(screen.getByText(/LAIESKI JOHN EST/i)).toBeInTheDocument()
    expect(screen.queryByText(/BLACKBURN MARY EST/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/HIGHLANDS TEST OWNER/i)).not.toBeInTheDocument()
  })

  it('excludes null acreage from range filter', async () => {
    const user = userEvent.setup()
    render(<PropertiesPage />)

    const minAcreInput = await screen.findByPlaceholderText(/min acres/i)
    await user.type(minAcreInput, '0')

    expect(
      screen.queryByText(/PUTNAM NULL ACRE\/VALUE/i)
    ).not.toBeInTheDocument()
  })

  it('ignores empty string inputs', async () => {
    const user = userEvent.setup()
    render(<PropertiesPage />)

    const minAcreInput = await screen.findByPlaceholderText(/min acres/i)
    await user.type(minAcreInput, '1')
    await user.clear(minAcreInput)

    // back to default — all 5 visible (including disqualified)
    expect(screen.getByText(/LAIESKI JOHN EST/i)).toBeInTheDocument()
    expect(screen.getByText(/BLACKBURN MARY EST/i)).toBeInTheDocument()
    expect(screen.getByText(/HIGHLANDS TEST OWNER/i)).toBeInTheDocument()
    expect(screen.getByText(/PUTNAM NULL ACRE\/VALUE/i)).toBeInTheDocument()
    expect(screen.getByText(/SIMMS BEVERLY/i)).toBeInTheDocument()
  })

  it('renders min/max value inputs', async () => {
    render(<PropertiesPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/min \$/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/max \$/i)).toBeInTheDocument()
    })
  })

  it('filters by minimum market value', async () => {
    const user = userEvent.setup()
    render(<PropertiesPage />)

    const minValueInput = await screen.findByPlaceholderText(/min \$/i)
    await user.type(minValueInput, '10000')

    expect(screen.getByText(/HIGHLANDS TEST OWNER/i)).toBeInTheDocument()
    expect(screen.queryByText(/LAIESKI JOHN EST/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/BLACKBURN MARY EST/i)).not.toBeInTheDocument()
    expect(
      screen.queryByText(/PUTNAM NULL ACRE\/VALUE/i)
    ).not.toBeInTheDocument()
  })

  it('renders a date input', async () => {
    render(<PropertiesPage />)

    await waitFor(() => {
      expect(screen.getByLabelText(/date added/i)).toBeInTheDocument()
    })
  })

  it('filters properties added on or after selected date', async () => {
    const user = userEvent.setup()
    render(<PropertiesPage />)

    const dateInput = await screen.findByLabelText(/date added/i)
    await user.type(dateInput, '2026-02-15')

    expect(screen.getByText(/HIGHLANDS TEST OWNER/i)).toBeInTheDocument()
    expect(screen.queryByText(/LAIESKI JOHN EST/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/BLACKBURN MARY EST/i)).not.toBeInTheDocument()
    expect(
      screen.queryByText(/PUTNAM NULL ACRE\/VALUE/i)
    ).not.toBeInTheDocument()
  })
})
