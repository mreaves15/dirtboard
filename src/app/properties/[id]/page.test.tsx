import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
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

  it('property_type dropdown only offers raw_land, improved, mobile_home', async () => {
    await renderWithParams('prop-1')
    fireEvent.click(screen.getByRole('button', { name: /✏️ Edit/i }))

    const propertyTypeLabel = screen.getByText('Property Type')
    const select = propertyTypeLabel.parentElement?.querySelector('select')
    expect(select).toBeTruthy()

    const optionValues = Array.from(select!.querySelectorAll('option')).map(o => o.value)
    expect(optionValues).toEqual(['', 'raw_land', 'improved', 'mobile_home'])
  })

  it('disqualify opens an inline form (no window.prompt)', async () => {
    await renderWithParams('prop-1')
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null)
    fireEvent.click(screen.getByRole('button', { name: /✗ Disqualify/i }))

    expect(promptSpy).not.toHaveBeenCalled()
    expect(screen.getByText(/Disqualification Reason/i)).toBeInTheDocument()
    promptSpy.mockRestore()
  })

  it('does not render Deal Verdict or Tax Delinquent UI (dropped columns)', async () => {
    await renderWithParams('prop-1')
    expect(screen.queryByText(/Deal Verdict/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Tax Delinquent$/)).not.toBeInTheDocument()
  })

  it('disqualify reason dropdown lists canonical enum values only', async () => {
    await renderWithParams('prop-1')
    fireEvent.click(screen.getByRole('button', { name: /✗ Disqualify/i }))

    const reasonLabel = screen.getByText(/Disqualification Reason/i)
    const select = reasonLabel.parentElement?.querySelector('select')
    expect(select).toBeTruthy()

    const optionValues = Array.from(select!.querySelectorAll('option')).map(o => o.value)
    // Empty placeholder + 24 canonical enum values
    expect(optionValues).toContain('flood_zone')
    expect(optionValues).toContain('weak_buyer_pool')
    expect(optionValues).toContain('recent_arms_length_sale')
    expect(optionValues).toContain('hoa_buyer_pool_restriction')
    expect(optionValues).toContain('other')
    // Must not contain old non-canonical values
    expect(optionValues).not.toContain('flood_zone_A')
    expect(optionValues).not.toContain('owner_decision')
    expect(optionValues).not.toContain('commercial_zoning')
  })
})
