import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

// Mock the useProperties hook
vi.mock('@/hooks/useProperties', () => ({
  useProperties: () => ({
    properties: mockProperties,
    loading: false,
    error: null,
    refetch: vi.fn(),
    addProperty: vi.fn(),
    editProperty: vi.fn(),
    removeProperty: vi.fn(),
  }),
}))

describe('Properties Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page heading', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /properties/i })).toBeInTheDocument()
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
      expect(screen.getByRole('link', { name: /add property/i })).toBeInTheDocument()
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

  it('hides disqualified properties by default', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      // SIMMS is disqualified, should not be visible by default
      expect(screen.queryByText(/SIMMS BEVERLY/i)).not.toBeInTheDocument()
    })
  })

  it('renders status filter dropdown', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument()
    })
  })

  it('renders county filter dropdown', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /county/i })).toBeInTheDocument()
    })
  })

  it('shows correct property count', async () => {
    render(<PropertiesPage />)
    await waitFor(() => {
      // 2 visible (LAIESKI qualified, BLACKBURN new), 1 disqualified hidden
      expect(screen.getByText(/showing 2 of 3/i)).toBeInTheDocument()
    })
  })
})
