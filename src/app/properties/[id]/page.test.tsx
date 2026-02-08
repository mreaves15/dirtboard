import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { Suspense } from 'react'
import PropertyDetailPage from './page'
import { mockProperties, mockContacts, mockActivities } from '@/test/mocks'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock the hooks
vi.mock('@/hooks/useProperties', () => ({
  useProperty: (id: string) => {
    const property = mockProperties.find(p => p.id === id)
    return {
      property,
      loading: false,
      error: property ? null : new Error('Not found'),
      refetch: vi.fn(),
      update: vi.fn(),
    }
  },
}))

vi.mock('@/hooks/useContacts', () => ({
  usePropertyContacts: (propertyId: string) => ({
    contacts: mockContacts.filter(c => c.property_id === propertyId),
    loading: false,
    error: null,
    refetch: vi.fn(),
    addContact: vi.fn(),
    removeContact: vi.fn(),
  }),
}))

vi.mock('@/hooks/useActivities', () => ({
  usePropertyActivities: (propertyId: string) => ({
    activities: mockActivities.filter(a => a.property_id === propertyId),
    loading: false,
    error: null,
    refetch: vi.fn(),
    logActivity: vi.fn(),
  }),
}))

// Helper to render with resolved params
async function renderWithParams(id: string) {
  const params = Promise.resolve({ id })
  
  await act(async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <PropertyDetailPage params={params} />
      </Suspense>
    )
  })
  
  // Wait for suspense to resolve
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  }, { timeout: 3000 })
}

describe('Property Detail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders property owner name', async () => {
    await renderWithParams('prop-1')
    expect(screen.getByText(/LAIESKI JOHN EST/i)).toBeInTheDocument()
  })

  it('renders parcel ID', async () => {
    await renderWithParams('prop-1')
    expect(screen.getByText(/08-13-27-7061-0010/)).toBeInTheDocument()
  })

  it('renders property status badge', async () => {
    await renderWithParams('prop-1')
    // "Qualified" appears in badge and potentially elsewhere
    const badges = screen.getAllByText(/Qualified/i)
    expect(badges.length).toBeGreaterThan(0)
  })

  it('renders quick action buttons', async () => {
    await renderWithParams('prop-1')
    // Button text includes emoji: "✓ Qualify" and "✗ Disqualify"
    expect(screen.getByRole('button', { name: /✓ Qualify/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /✗ Disqualify/i })).toBeInTheDocument()
  })

  it('renders property details section', async () => {
    await renderWithParams('prop-1')
    expect(screen.getByText(/Property Details/i)).toBeInTheDocument()
    expect(screen.getByText(/0.22/)).toBeInTheDocument() // acreage
  })

  it('renders contacts section with contact data', async () => {
    await renderWithParams('prop-1')
    expect(screen.getByText(/Contacts/i)).toBeInTheDocument()
    expect(screen.getByText(/555-123-4567/)).toBeInTheDocument()
  })

  it('renders activity section', async () => {
    await renderWithParams('prop-1')
    expect(screen.getByText(/Activity/i)).toBeInTheDocument()
  })

  it('shows not found for invalid property', async () => {
    await renderWithParams('invalid-id')
    expect(screen.getByText(/Property Not Found/i)).toBeInTheDocument()
  })

  it('renders back to properties link', async () => {
    await renderWithParams('prop-1')
    expect(screen.getByText(/Back to Properties/i)).toBeInTheDocument()
  })
})
