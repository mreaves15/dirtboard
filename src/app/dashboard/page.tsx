'use client'

import Link from 'next/link'
import { useProperties } from '@/hooks/useProperties'
import { getPipelineStats } from '@/lib/mock-data'
import type { PropertyStatus } from '@/types/database'

const statusColors: Record<PropertyStatus, string> = {
  new: 'bg-gray-100 text-gray-800',
  appraiser_review: 'bg-yellow-100 text-yellow-800',
  flood_check: 'bg-yellow-100 text-yellow-800',
  buyer_pool_check: 'bg-yellow-100 text-yellow-800',
  skip_trace: 'bg-yellow-100 text-yellow-800',
  tax_check: 'bg-amber-100 text-amber-800',
  lien_check: 'bg-amber-100 text-amber-800',
  title_review: 'bg-amber-100 text-amber-800',
  qualified: 'bg-green-100 text-green-800',
  contacted: 'bg-purple-100 text-purple-800',
  offer_made: 'bg-orange-100 text-orange-800',
  negotiating: 'bg-orange-100 text-orange-800',
  under_contract: 'bg-blue-100 text-blue-800',
  closed_won: 'bg-green-200 text-green-900',
  closed_lost: 'bg-gray-200 text-gray-700',
  listed_for_sale: 'bg-teal-100 text-teal-800',
  sold: 'bg-green-300 text-green-900',
  disqualified: 'bg-red-100 text-red-800',
}

const statusLabels: Record<PropertyStatus, string> = {
  new: 'New',
  appraiser_review: 'Appraiser Review',
  flood_check: 'Flood Check',
  buyer_pool_check: 'Buyer Pool Check',
  skip_trace: 'Skip Trace',
  tax_check: 'Tax Check',
  lien_check: 'Lien Check',
  title_review: 'Title Review',
  qualified: 'Qualified',
  contacted: 'Contacted',
  offer_made: 'Offer Made',
  negotiating: 'Negotiating',
  under_contract: 'Under Contract',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
  listed_for_sale: 'Listed',
  sold: 'Sold',
  disqualified: 'Disqualified',
}

// Turn a snake_case enum value into a readable label, e.g. flood_zone -> "Flood Zone"
const ACRONYMS = new Set(['pa', 'hoa'])
function titleCase(value: string): string {
  return value
    .split('_')
    .map((word) =>
      ACRONYMS.has(word)
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')
}

export default function DashboardPage() {
  const { properties, loading, error } = useProperties()
  const stats = getPipelineStats(properties)

  // Deal metrics — exclude disqualified leads from value/margin math
  const activeProperties = properties.filter((p) => p.status !== 'disqualified')
  const totalEstimatedValue = activeProperties.reduce(
    (sum, p) => sum + (p.estimated_retail_value || 0),
    0
  )
  const avgMargin = activeProperties
    .filter((p) => p.estimated_margin_percent)
    .reduce(
      (sum, p, _, arr) => sum + (p.estimated_margin_percent || 0) / arr.length,
      0
    )
  // Of leads with a verdict, what share qualified
  const decided = stats.qualified + stats.disqualified
  const qualificationRate = decided > 0 ? (stats.qualified / decided) * 100 : 0

  const barPct = (count: number, total: number) =>
    total > 0 ? (count / total) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">DirtBoard</Link>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="font-medium">
              Dashboard
            </Link>
            <Link href="/properties" className="text-muted-foreground hover:text-foreground">
              Properties
            </Link>
            <Link href="/buyers" className="text-muted-foreground hover:text-foreground">
              Buyers
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/properties" className="text-primary hover:underline">
            View All Properties →
          </Link>
        </div>

        {loading && (
          <p className="text-muted-foreground">Loading dashboard…</p>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error.message}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border rounded-lg p-6">
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <p className="text-sm text-muted-foreground">Qualified Leads</p>
                <p className="text-3xl font-bold text-green-600">{stats.qualified}</p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <p className="text-sm text-muted-foreground">Active Pipeline</p>
                <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <p className="text-sm text-muted-foreground">Disqualified</p>
                <p className="text-3xl font-bold text-red-600">{stats.disqualified}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pipeline Overview */}
              <section className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Pipeline Overview</h2>
                <div className="space-y-3">
                  {Object.entries(stats.byStatus)
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status as PropertyStatus]}`}>
                            {statusLabels[status as PropertyStatus]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${barPct(count, stats.total)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-10 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </section>

              {/* By County */}
              <section className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">By County</h2>
                <div className="space-y-3">
                  {Object.entries(stats.byCounty)
                    .sort((a, b) => b[1] - a[1])
                    .map(([county, count]) => (
                      <div key={county} className="flex items-center justify-between">
                        <span className="font-medium">{county}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${barPct(count, stats.total)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-10 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </section>

              {/* Deal Metrics */}
              <section className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Deal Metrics</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Est. Retail Value</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${totalEstimatedValue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Margin</p>
                    <p className="text-2xl font-bold text-green-600">
                      {avgMargin.toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Qualification Rate</p>
                    <p className="text-2xl font-bold">
                      {qualificationRate.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of {decided.toLocaleString()} decided
                    </p>
                  </div>
                </div>
              </section>

              {/* Disqualification Reasons */}
              <section className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Disqualification Reasons</h2>
                {stats.disqualified === 0 ? (
                  <p className="text-sm text-muted-foreground">No disqualified leads.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(stats.byDqReason)
                      .sort((a, b) => b[1] - a[1])
                      .map(([reason, count]) => (
                        <div key={reason} className="flex items-center justify-between">
                          <span className="font-medium text-sm">{titleCase(reason)}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${barPct(count, stats.disqualified)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-10 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </section>
            </div>

            {/* Recent Properties */}
            <section className="bg-white border rounded-lg p-6 mt-8">
              <h2 className="text-xl font-semibold mb-4">Recent Properties</h2>
              <div className="space-y-3">
                {properties.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No properties yet.</p>
                ) : (
                  [...properties]
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .slice(0, 8)
                    .map((property) => (
                      <Link
                        key={property.id}
                        href={`/properties/${property.id}`}
                        className="flex items-center justify-between hover:bg-muted/50 p-2 rounded -mx-2"
                      >
                        <div>
                          <p className="font-medium truncate max-w-[260px]">{property.owner_name}</p>
                          <p className="text-sm text-muted-foreground">{property.county} County</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[property.status]}`}>
                          {statusLabels[property.status]}
                        </span>
                      </Link>
                    ))
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
