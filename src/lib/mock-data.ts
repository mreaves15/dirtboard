import type { Property, Contact, ActivityLog } from '@/types/database'

// Mock properties for development
export const mockProperties: Property[] = [
  {
    id: '1',
    parcel_id: '09-10-24-4068-0510-0290',
    county: 'Putnam',
    owner_name: 'LAIESKI RONALD C EST',
    source: 'probate',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-06T00:00:00Z',
    address: 'No Address Assigned',
    subdivision: 'Interlachen Lakes Estates Unit 9',
    acreage: 0.22,
    improvement_value: 0,
    land_value: 4500,
    market_value: 4500,
    property_type: 'raw_land',
    flood_zone: 'X',
    tax_status: 'current',
    is_out_of_state: true,
    is_inherited: true,
    seller_type: 'estate',
    estimated_retail_value: 8000,
    target_offer_price: 2500,
    estimated_margin_percent: 220,
    deal_verdict: 'good_deal',
    status: 'qualified',
    pipeline_stage: 9,
    notes: 'Estate owns 3 properties. NY heirs.',
  },
  {
    id: '2',
    parcel_id: '37-13-27-7062-0980-0080',
    county: 'Putnam',
    owner_name: 'BLACKBURN WINONA KIM EST',
    source: 'probate',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-05T00:00:00Z',
    address: '115 June Ave',
    city: 'Georgetown',
    zip: '32139',
    subdivision: 'Paradise Lakes Unit 3',
    acreage: 0.23,
    improvement_value: 0,
    land_value: 9090,
    market_value: 9090,
    property_type: 'raw_land',
    flood_zone: 'X',
    tax_status: 'current',
    is_out_of_state: true,
    is_inherited: true,
    seller_type: 'estate',
    estimated_retail_value: 10000,
    target_offer_price: 3000,
    estimated_margin_percent: 233,
    deal_verdict: 'good_deal',
    status: 'qualified',
    pipeline_stage: 9,
    notes: 'Phoenix AZ heir. Title shows RICHINS SYLVIA BLACKBURN.',
  },
  {
    id: '3',
    parcel_id: '39-11-26-8231-0610-0130',
    county: 'Putnam',
    owner_name: 'BORNHEIMER KENNETH EARLE EST',
    source: 'probate',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-06T00:00:00Z',
    address: '129 Carr Pl',
    city: 'Satsuma',
    zip: '32189',
    subdivision: 'San Jose Riverside Estates Unit 2',
    acreage: 0.96,
    improvement_value: 0,
    land_value: 17280,
    market_value: 17280,
    property_type: 'raw_land',
    flood_zone: 'X',
    tax_status: 'current',
    is_out_of_state: true,
    is_inherited: true,
    seller_type: 'estate',
    estimated_retail_value: 25000,
    target_offer_price: 7500,
    estimated_margin_percent: 233,
    deal_verdict: 'good_deal',
    status: 'qualified',
    pipeline_stage: 9,
    notes: 'BEST OPPORTUNITY - largest lot! Marlene age 91.',
  },
  {
    id: '4',
    parcel_id: '35-08-27-8152-0060-0290',
    county: 'Putnam',
    owner_name: 'WEBER JAMES',
    source: 'probate',
    created_at: '2026-02-07T00:00:00Z',
    updated_at: '2026-02-07T00:00:00Z',
    address: '113 Redfish Dr',
    city: 'Palatka',
    zip: '32177',
    subdivision: 'St Johns Harbor S/D Unit 3',
    acreage: 0.28,
    improvement_value: 0,
    land_value: 8480,
    market_value: 8480,
    property_type: 'raw_land',
    flood_zone: 'X',
    tax_status: 'current',
    is_out_of_state: true,
    is_inherited: true,
    status: 'new',
    pipeline_stage: 1,
    notes: 'Vacant lot Block 6 Lot 29. Out-of-state owner (NY).',
  },
  {
    id: '5',
    parcel_id: '08-13-27-7061-0500-0010',
    county: 'Putnam',
    owner_name: 'SIMMS BEVERLY',
    source: 'probate',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
    subdivision: 'Paradise Lakes Unit 2',
    acreage: 0.23,
    improvement_value: 0,
    land_value: 9410,
    market_value: 9410,
    property_type: 'raw_land',
    flood_zone: 'AE',
    status: 'disqualified',
    disqualification_reason: 'flood_zone',
    disqualification_notes: 'Property is borderline Zone AE - too risky',
    pipeline_stage: 3,
  },
  {
    id: '6',
    parcel_id: '23-12-27-2501-0010-0300',
    county: 'Putnam',
    owner_name: 'MCNAUGHT GEORGE FRANKLIN JR EST',
    source: 'probate',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
    address: '175 Palamino Rd',
    city: 'Crescent City',
    zip: '32112',
    subdivision: 'Fernwood Estates',
    acreage: 1.0,
    improvement_value: 217340,
    land_value: 43680,
    market_value: 261020,
    property_type: 'improved',
    status: 'disqualified',
    disqualification_reason: 'not_raw_land',
    disqualification_notes: 'Has house - $217k improvements',
    pipeline_stage: 2,
  },
  {
    id: '7',
    parcel_id: 'A-15-33-28-011-0150-15E0',
    county: 'Highlands',
    owner_name: 'LANDWEHR HENRY AUGUST EST',
    source: 'probate',
    created_at: '2026-02-07T00:00:00Z',
    updated_at: '2026-02-07T00:00:00Z',
    address: '1472 N Melrose Dr',
    city: 'Avon Park',
    zip: '33825',
    acreage: 0.5,
    improvement_value: 27576,
    land_value: 5000,
    market_value: 35765,
    property_type: 'improved',
    status: 'disqualified',
    disqualification_reason: 'not_raw_land',
    disqualification_notes: 'Single family rental property',
    pipeline_stage: 2,
  },
  {
    id: '8',
    parcel_id: 'C-08-35-28-060-0110-0030',
    county: 'Highlands',
    owner_name: 'BAEZ FROILAN EST',
    source: 'probate',
    created_at: '2026-02-07T00:00:00Z',
    updated_at: '2026-02-07T00:00:00Z',
    address: '1007 Thunderbird Hill Rd',
    city: 'Sebring',
    subdivision: '',
    improvement_value: 184185,
    land_value: 71210,
    market_value: 255395,
    property_type: 'improved',
    status: 'disqualified',
    disqualification_reason: 'not_raw_land',
    disqualification_notes: 'Single family home',
    pipeline_stage: 2,
  },
]

export const mockContacts: Contact[] = [
  {
    id: '1',
    property_id: '1',
    contact_type: 'phone',
    value: '(516) 333-1822',
    label: 'primary',
    is_valid: true,
    source: 'skip_trace',
    created_at: '2026-02-05T00:00:00Z',
  },
  {
    id: '2',
    property_id: '1',
    contact_type: 'email',
    value: 'patricia.macchia@aol.com',
    label: 'primary',
    is_valid: true,
    source: 'skip_trace',
    created_at: '2026-02-05T00:00:00Z',
  },
  {
    id: '3',
    property_id: '2',
    contact_type: 'phone',
    value: '(801) 792-6205',
    label: 'primary',
    is_valid: true,
    source: 'skip_trace',
    created_at: '2026-02-05T00:00:00Z',
  },
]

export const mockActivityLog: ActivityLog[] = [
  {
    id: '1',
    property_id: '1',
    activity_type: 'status_change',
    activity_date: '2026-02-06T00:00:00Z',
    notes: 'Moved to qualified after tax check passed',
    created_by: 'openclaw',
    created_at: '2026-02-06T00:00:00Z',
  },
  {
    id: '2',
    property_id: '1',
    activity_type: 'research',
    activity_date: '2026-02-05T00:00:00Z',
    notes: 'Comps pulled - Est market $5K-8K',
    created_by: 'openclaw',
    created_at: '2026-02-05T00:00:00Z',
  },
]

// Helper to filter properties
export function filterProperties(
  properties: Property[],
  filters: {
    status?: string[]
    county?: string[]
    showDisqualified?: boolean
    search?: string
  }
): Property[] {
  return properties.filter((p) => {
    // Hide disqualified by default
    if (!filters.showDisqualified && p.status === 'disqualified') {
      return false
    }

    // Status filter
    if (filters.status?.length && !filters.status.includes(p.status)) {
      return false
    }

    // County filter
    if (filters.county?.length && !filters.county.includes(p.county)) {
      return false
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const searchableFields = [
        p.parcel_id,
        p.owner_name,
        p.address,
        p.subdivision,
        p.notes,
      ].filter(Boolean)
      
      if (!searchableFields.some(f => f?.toLowerCase().includes(searchLower))) {
        return false
      }
    }

    return true
  })
}

// Get unique values for filter dropdowns
export function getFilterOptions(properties: Property[]) {
  const statuses = [...new Set(properties.map(p => p.status))]
  const counties = [...new Set(properties.map(p => p.county))]
  
  return { statuses, counties }
}

// Get pipeline stats
export function getPipelineStats(properties: Property[]) {
  const stats = {
    total: properties.length,
    byStatus: {} as Record<string, number>,
    byCounty: {} as Record<string, number>,
    qualified: 0,
    disqualified: 0,
    active: 0,
  }

  properties.forEach(p => {
    stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1
    stats.byCounty[p.county] = (stats.byCounty[p.county] || 0) + 1
    
    if (p.status === 'qualified') stats.qualified++
    else if (p.status === 'disqualified') stats.disqualified++
    else stats.active++
  })

  return stats
}
