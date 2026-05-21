import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from './page'
import { mockProperties } from '@/test/mocks'

const mockUseProperties = vi.fn()

vi.mock('@/hooks/useProperties', () => ({
  useProperties: () => mockUseProperties(),
}))

function loaded(overrides: Record<string, unknown> = {}) {
  return {
    properties: mockProperties,
    loading: false,
    error: null,
    refetch: vi.fn(),
    addProperty: vi.fn(),
    editProperty: vi.fn(),
    removeProperty: vi.fn(),
    ...overrides,
  }
}

function statCardValue(label: string): string {
  return screen.getByText(label).nextElementSibling?.textContent ?? ''
}

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseProperties.mockReturnValue(loaded())
  })

  it('renders the dashboard heading', () => {
    render(<DashboardPage />)
    expect(
      screen.getByRole('heading', { name: /dashboard/i })
    ).toBeInTheDocument()
  })

  it('renders pipeline overview section', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/pipeline overview/i)).toBeInTheDocument()
  })

  it('shows total properties from the database hook', () => {
    render(<DashboardPage />)
    expect(statCardValue('Total Properties')).toBe(String(mockProperties.length))
  })

  it('shows qualified leads count from the database hook', () => {
    render(<DashboardPage />)
    const qualified = mockProperties.filter(p => p.status === 'qualified').length
    expect(statCardValue('Qualified Leads')).toBe(String(qualified))
  })

  it('shows properties by county', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/by county/i)).toBeInTheDocument()
  })

  it('shows a disqualification reasons breakdown', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/disqualification reasons/i)).toBeInTheDocument()
    // mockProperties has one disqualified lead with reason 'flood_zone'
    expect(screen.getByText(/flood zone/i)).toBeInTheDocument()
  })

  it('renders recent properties from the database hook', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/SOLD OWNER/i)).toBeInTheDocument()
  })

  it('shows a loading state while data is fetching', () => {
    mockUseProperties.mockReturnValue(loaded({ properties: [], loading: true }))
    render(<DashboardPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows an error message when the fetch fails', () => {
    mockUseProperties.mockReturnValue(
      loaded({ properties: [], error: new Error('Database connection failed') })
    )
    render(<DashboardPage />)
    expect(
      screen.getByText(/database connection failed/i)
    ).toBeInTheDocument()
  })

  it('renders link to properties', () => {
    render(<DashboardPage />)
    expect(
      screen.getByRole('link', { name: /view all properties/i })
    ).toBeInTheDocument()
  })
})
