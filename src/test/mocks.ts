import type { Property, Contact, ActivityLog } from '@/types/database'

export const mockProperties: Property[] = [
  {
    id: 'prop-1',
    parcel_id: '08-13-27-7061-0010',
    county: 'Putnam',
    owner_name: 'LAIESKI JOHN EST',
    source: 'probate',
    status: 'qualified',
    pipeline_stage: 4,
    property_type: 'raw_land',
    acreage: 0.22,
    land_value: 4500,
    improvement_value: 0,
    market_value: 4500,
    flood_zone: 'X',
    subdivision: 'Interlachen Lakes Estates Unit 9',
    created_at: '2026-02-01T12:00:00Z',
    updated_at: '2026-02-01T12:00:00Z',
  },
  {
    id: 'prop-2',
    parcel_id: '26-10-25-0000-0001',
    county: 'Putnam',
    owner_name: 'BLACKBURN MARY EST',
    source: 'probate',
    status: 'new',
    pipeline_stage: 1,
    property_type: 'raw_land',
    acreage: 0.23,
    land_value: 9090,
    improvement_value: 0,
    market_value: 9090,
    subdivision: 'Paradise Lakes Unit 3',
    created_at: '2026-02-02T12:00:00Z',
    updated_at: '2026-02-02T12:00:00Z',
  },
  {
    id: 'prop-3',
    parcel_id: '99-99-99-9999-9999',
    county: 'Putnam',
    owner_name: 'SIMMS BEVERLY EST',
    source: 'probate',
    status: 'disqualified',
    disqualification_reason: 'flood_zone',
    pipeline_stage: 0,
    property_type: 'raw_land',
    acreage: 0.23,
    created_at: '2026-02-03T12:00:00Z',
    updated_at: '2026-02-03T12:00:00Z',
  },
]

export const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    property_id: 'prop-1',
    contact_type: 'phone',
    value: '555-123-4567',
    label: 'primary',
    is_valid: true,
    source: 'skip_trace',
    created_at: '2026-02-01T12:00:00Z',
  },
]

export const mockActivities: ActivityLog[] = [
  {
    id: 'activity-1',
    property_id: 'prop-1',
    activity_type: 'status_change',
    activity_date: '2026-02-01T12:00:00Z',
    notes: 'Moved to qualified',
    created_by: 'matt',
    created_at: '2026-02-01T12:00:00Z',
  },
]
