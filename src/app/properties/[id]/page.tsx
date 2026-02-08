'use client'

import { use, Suspense } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useProperty } from '@/hooks/useProperties'
import { usePropertyContacts } from '@/hooks/useContacts'
import { usePropertyActivities } from '@/hooks/useActivities'
import type { PropertyStatus } from '@/types/database'

const statusColors: Record<PropertyStatus, string> = {
  new: 'bg-gray-500',
  appraiser_review: 'bg-yellow-500',
  flood_check: 'bg-yellow-500',
  skip_trace: 'bg-yellow-500',
  tax_check: 'bg-yellow-500',
  lien_check: 'bg-yellow-500',
  access_check: 'bg-yellow-500',
  valuation: 'bg-yellow-500',
  qualified: 'bg-green-500',
  contacted: 'bg-purple-500',
  offer_made: 'bg-orange-500',
  under_contract: 'bg-blue-500',
  closed_won: 'bg-green-700',
  closed_lost: 'bg-gray-600',
  listed_for_sale: 'bg-teal-500',
  sold: 'bg-green-800',
  disqualified: 'bg-red-500',
}

const statusLabels: Record<PropertyStatus, string> = {
  new: 'New',
  appraiser_review: 'Appraiser Review',
  flood_check: 'Flood Check',
  skip_trace: 'Skip Trace',
  tax_check: 'Tax Check',
  lien_check: 'Lien Check',
  access_check: 'Access Check',
  valuation: 'Valuation',
  qualified: 'Qualified',
  contacted: 'Contacted',
  offer_made: 'Offer Made',
  under_contract: 'Under Contract',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
  listed_for_sale: 'Listed',
  sold: 'Sold',
  disqualified: 'Disqualified',
}

function formatCurrency(value: number | undefined): string {
  if (value === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PropertyDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { property, loading, error } = useProperty(id)
  const { contacts } = usePropertyContacts(id)
  const { activities } = usePropertyActivities(id)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold">DirtBoard</Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading property...</p>
        </main>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold">DirtBoard</Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error?.message || "The property you're looking for doesn't exist."}
          </p>
          <Link href="/properties" className="text-primary hover:underline">
            ← Back to Properties
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">DirtBoard</Link>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/properties" className="text-muted-foreground hover:text-foreground">
              Properties
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link href="/properties" className="text-muted-foreground hover:text-foreground mb-6 inline-block">
          ← Back to Properties
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{property.owner_name}</h1>
            <p className="text-muted-foreground font-mono">{property.parcel_id}</p>
            <p className="text-muted-foreground">
              {property.address || property.subdivision || 'No address'}, {property.city || ''} {property.county} County
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={statusColors[property.status]}>
              {statusLabels[property.status]}
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-8">
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            ✓ Qualify
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
            ✗ Disqualify
          </button>
          <button className="border px-4 py-2 rounded-md hover:bg-muted">
            📞 Log Contact
          </button>
          <button className="border px-4 py-2 rounded-md hover:bg-muted">
            ✏️ Edit
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Details */}
            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="font-medium capitalize">{property.property_type?.replace('_', ' ') || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Acreage</p>
                  <p className="font-medium">{property.acreage?.toFixed(2) || '-'} acres</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subdivision</p>
                  <p className="font-medium">{property.subdivision || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zoning</p>
                  <p className="font-medium">{property.zoning || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Flood Zone</p>
                  <p className="font-medium">{property.flood_zone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">DOR Code</p>
                  <p className="font-medium">{property.dor_code || '-'}</p>
                </div>
              </div>
            </section>

            {/* Valuation */}
            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Valuation</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Land Value</p>
                  <p className="font-medium">{formatCurrency(property.land_value)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Improvement Value</p>
                  <p className="font-medium">{formatCurrency(property.improvement_value)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Market Value</p>
                  <p className="font-medium">{formatCurrency(property.market_value)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Retail</p>
                  <p className="font-medium text-green-600">{formatCurrency(property.estimated_retail_value)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Target Offer</p>
                  <p className="font-medium">{formatCurrency(property.target_offer_price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Margin</p>
                  <p className="font-medium text-green-600">
                    {property.estimated_margin_percent ? `${property.estimated_margin_percent}%` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deal Verdict</p>
                  <p className="font-medium capitalize">{property.deal_verdict?.replace('_', ' ') || '-'}</p>
                </div>
              </div>
            </section>

            {/* Tax Status */}
            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Tax Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{property.tax_status || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual Taxes</p>
                  <p className="font-medium">{formatCurrency(property.annual_taxes)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taxes Owed</p>
                  <p className="font-medium">{formatCurrency(property.taxes_owed)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tax Certificate</p>
                  <p className="font-medium">{property.has_tax_certificate ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </section>

            {/* Motivation Indicators */}
            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Motivation Indicators</h2>
              <div className="flex flex-wrap gap-2">
                {property.is_out_of_state && (
                  <Badge variant="outline">Out of State</Badge>
                )}
                {property.is_inherited && (
                  <Badge variant="outline">Inherited</Badge>
                )}
                {property.is_long_term_holder && (
                  <Badge variant="outline">Long-term Holder (10+ yrs)</Badge>
                )}
                {property.is_tax_delinquent_motivated && (
                  <Badge variant="outline">Tax Delinquent</Badge>
                )}
                {property.seller_type && (
                  <Badge variant="outline" className="capitalize">{property.seller_type}</Badge>
                )}
              </div>
            </section>

            {/* Notes */}
            {property.notes && (
              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Notes</h2>
                <p className="whitespace-pre-wrap">{property.notes}</p>
              </section>
            )}

            {/* Disqualification Info */}
            {property.status === 'disqualified' && (
              <section className="border border-red-200 bg-red-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-red-800">Disqualification</h2>
                <p className="text-red-700">
                  <strong>Reason:</strong> {property.disqualification_reason?.replace('_', ' ')}
                </p>
                {property.disqualification_notes && (
                  <p className="text-red-600 mt-2">{property.disqualification_notes}</p>
                )}
              </section>
            )}
          </div>

          {/* Right Column - Contacts & Activity */}
          <div className="space-y-8">
            {/* Contacts */}
            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Contacts</h2>
              {contacts.length === 0 ? (
                <p className="text-muted-foreground">No contacts found</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{contact.value}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {contact.contact_type} • {contact.label}
                        </p>
                      </div>
                      {contact.is_valid === false && (
                        <Badge variant="destructive">Invalid</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Activity Log */}
            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Activity</h2>
              {activities.length === 0 ? (
                <p className="text-muted-foreground">No activity recorded</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="border-l-2 pl-4">
                      <p className="font-medium capitalize">{activity.activity_type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(activity.activity_date)}</p>
                      {activity.notes && (
                        <p className="text-sm mt-1">{activity.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Metadata */}
            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Metadata</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <span className="capitalize">{property.source || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pipeline Stage</span>
                  <span>{property.pipeline_stage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added</span>
                  <span>{formatDate(property.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{formatDate(property.updated_at)}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
