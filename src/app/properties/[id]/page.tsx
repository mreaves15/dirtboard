'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useProperty } from '@/hooks/useProperties'
import { usePropertyContacts } from '@/hooks/useContacts'
import { usePropertyActivities } from '@/hooks/useActivities'
import type { DisqualificationReason, PropertyStatus, PropertyUpdate } from '@/types/database'

type DealAction = 'offer' | 'counter' | 'accept' | 'reject' | 'close_won' | 'close_lost' | 'list' | 'sold'

interface DealForm {
  offer_amount: string
  offer_date: string
  counter_amount: string
  buy_accepted: string
  buy_final: string
  closing_date: string
  resale_price: string
  actual_profit: string
}

const emptyDealForm: DealForm = {
  offer_amount: '',
  offer_date: '',
  counter_amount: '',
  buy_accepted: '',
  buy_final: '',
  closing_date: '',
  resale_price: '',
  actual_profit: '',
}

function parseNum(v: string): number | undefined {
  if (!v || v.trim() === '') return undefined
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : undefined
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

const dealActionTitles: Record<DealAction, string> = {
  offer: 'Make Offer',
  counter: 'Log Counter',
  accept: 'Mark Accepted',
  reject: 'Mark Rejected',
  close_won: 'Mark Closed Won',
  close_lost: 'Mark Closed Lost',
  list: 'List For Sale',
  sold: 'Mark Sold',
}

const dealConfirmLabels: Record<DealAction, string> = {
  offer: 'Confirm Offer',
  counter: 'Confirm Counter',
  accept: 'Confirm Accept',
  reject: 'Confirm Reject',
  close_won: 'Confirm Closed Won',
  close_lost: 'Confirm Closed Lost',
  list: 'Confirm List',
  sold: 'Confirm Sold',
}

interface DealActionPanelProps {
  action: DealAction
  form: DealForm
  saving: boolean
  buyFinal: number | undefined
  onChange: (patch: Partial<DealForm>) => void
  onResaleChange: (v: string) => void
  onCancel: () => void
  onSubmit: () => void
}

function DealActionPanel({ action, form, saving, buyFinal, onChange, onResaleChange, onCancel, onSubmit }: DealActionPanelProps) {
  const canSubmit = (() => {
    switch (action) {
      case 'offer': return parseNum(form.offer_amount) != null && form.offer_date !== ''
      case 'counter': return parseNum(form.counter_amount) != null
      case 'accept': return parseNum(form.buy_accepted) != null
      case 'close_won': return parseNum(form.buy_final) != null && form.closing_date !== ''
      case 'sold': return parseNum(form.resale_price) != null
      case 'reject':
      case 'close_lost':
      case 'list':
        return true
    }
  })()

  return (
    <section className="border border-orange-200 bg-orange-50 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-orange-900">{dealActionTitles[action]}</h2>
      <div className="space-y-4">
        {action === 'offer' && (
          <>
            <div>
              <label htmlFor="deal-offer-amount" className="text-sm text-orange-800 block mb-1">Offer Amount</label>
              <input
                id="deal-offer-amount"
                type="number"
                className="border rounded px-2 py-1 w-full text-sm bg-white"
                value={form.offer_amount}
                onChange={e => onChange({ offer_amount: e.target.value })}
                placeholder="e.g. 8500"
              />
            </div>
            <div>
              <label htmlFor="deal-offer-date" className="text-sm text-orange-800 block mb-1">Offer Date</label>
              <input
                id="deal-offer-date"
                type="date"
                className="border rounded px-2 py-1 w-full text-sm bg-white"
                value={form.offer_date}
                onChange={e => onChange({ offer_date: e.target.value })}
              />
            </div>
          </>
        )}

        {action === 'counter' && (
          <div>
            <label htmlFor="deal-counter-amount" className="text-sm text-orange-800 block mb-1">Counter Amount</label>
            <input
              id="deal-counter-amount"
              type="number"
              className="border rounded px-2 py-1 w-full text-sm bg-white"
              value={form.counter_amount}
              onChange={e => onChange({ counter_amount: e.target.value })}
              placeholder="Their counter offer"
            />
          </div>
        )}

        {action === 'accept' && (
          <div>
            <label htmlFor="deal-buy-accepted" className="text-sm text-orange-800 block mb-1">Accepted Price</label>
            <input
              id="deal-buy-accepted"
              type="number"
              className="border rounded px-2 py-1 w-full text-sm bg-white"
              value={form.buy_accepted}
              onChange={e => onChange({ buy_accepted: e.target.value })}
            />
          </div>
        )}

        {action === 'reject' && (
          <p className="text-sm text-orange-800">Mark this offer as rejected and close the lead.</p>
        )}

        {action === 'close_won' && (
          <>
            <div>
              <label htmlFor="deal-buy-final" className="text-sm text-orange-800 block mb-1">Final Purchase Price</label>
              <input
                id="deal-buy-final"
                type="number"
                className="border rounded px-2 py-1 w-full text-sm bg-white"
                value={form.buy_final}
                onChange={e => onChange({ buy_final: e.target.value })}
                placeholder="Actual cash to seller (incl. any cost adjustments)"
              />
            </div>
            <div>
              <label htmlFor="deal-closing-date" className="text-sm text-orange-800 block mb-1">Closing Date</label>
              <input
                id="deal-closing-date"
                type="date"
                className="border rounded px-2 py-1 w-full text-sm bg-white"
                value={form.closing_date}
                onChange={e => onChange({ closing_date: e.target.value })}
              />
            </div>
          </>
        )}

        {action === 'close_lost' && (
          <p className="text-sm text-orange-800">Mark this deal as closed lost (deal fell through).</p>
        )}

        {action === 'list' && (
          <p className="text-sm text-orange-800">Move this property to listed-for-sale.</p>
        )}

        {action === 'sold' && (
          <>
            <div>
              <label htmlFor="deal-resale-price" className="text-sm text-orange-800 block mb-1">Resale Price</label>
              <input
                id="deal-resale-price"
                type="number"
                className="border rounded px-2 py-1 w-full text-sm bg-white"
                value={form.resale_price}
                onChange={e => onResaleChange(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="deal-actual-profit" className="text-sm text-orange-800 block mb-1">
                Actual Profit
                {buyFinal != null && <span className="text-xs text-orange-600 ml-2">(auto = resale − buy_final)</span>}
              </label>
              <input
                id="deal-actual-profit"
                type="number"
                className="border rounded px-2 py-1 w-full text-sm bg-white"
                value={form.actual_profit}
                onChange={e => onChange({ actual_profit: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={onSubmit}
            disabled={!canSubmit || saving}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : dealConfirmLabels[action]}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="border px-4 py-2 rounded-md hover:bg-muted disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  )
}

const offerStatusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  countered: 'bg-amber-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
  expired: 'bg-gray-500',
}

const disqualificationReasonLabels: Record<DisqualificationReason, string> = {
  not_raw_land: 'Not raw land',
  outlot: 'Outlot',
  too_expensive: 'Too expensive (> $50K)',
  flood_zone: 'Flood zone (not X)',
  wetlands: 'Wetlands',
  landlocked: 'Landlocked',
  conservation_zoning: 'Conservation/Preservation zoning',
  already_sold: 'Already sold',
  already_transferred: 'Already transferred out of estate',
  clouded_title: 'Clouded title',
  has_liens: 'Has liens',
  excessive_taxes: 'Excessive taxes',
  tax_deed_pending: 'Tax deed pending',
  weak_buyer_pool: 'Weak buyer pool',
  insufficient_margin: 'Insufficient margin',
  investor_owned: 'Investor-owned (LLC)',
  parcel_not_found: 'Parcel not found in GIS',
  no_pa_match: 'No PA match',
  no_property: 'No property record',
  wrong_person: 'Wrong person (name match failed)',
  unplatted_complex: 'Unplatted / complex parcel',
  recent_arms_length_sale: 'Recent arms-length sale (< 5 yrs)',
  hoa_buyer_pool_restriction: 'HOA / restrictive CC&R',
  other: 'Other',
}

const statusColors: Record<PropertyStatus, string> = {
  new: 'bg-gray-500',
  appraiser_review: 'bg-yellow-500',
  flood_check: 'bg-yellow-500',
  buyer_pool_check: 'bg-yellow-500',
  skip_trace: 'bg-yellow-500',
  tax_check: 'bg-amber-500',
  lien_check: 'bg-amber-500',
  title_review: 'bg-amber-500',
  qualified: 'bg-green-500',
  contacted: 'bg-purple-500',
  offer_made: 'bg-orange-500',
  negotiating: 'bg-orange-500',
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
  const { property, loading, error, update, refetch } = useProperty(id)
  const { contacts } = usePropertyContacts(id)
  const { activities, logActivity, refetch: refetchActivities } = usePropertyActivities(id)

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<PropertyUpdate>({})
  const [disqualifying, setDisqualifying] = useState(false)
  const [dqReason, setDqReason] = useState<DisqualificationReason | ''>('')
  const [dqNotes, setDqNotes] = useState('')
  const [dealAction, setDealAction] = useState<DealAction | null>(null)
  const [dealForm, setDealForm] = useState<DealForm>(emptyDealForm)

  function startEdit() {
    if (!property) return
    setEditForm({
      owner_name: property.owner_name,
      address: property.address,
      acreage: property.acreage,
      zoning: property.zoning,
      flood_zone: property.flood_zone,
      subdivision: property.subdivision,
      market_value: property.market_value,
      estimated_retail_value: property.estimated_retail_value,
      target_offer_price: property.target_offer_price,
      tax_status: property.tax_status,
      notes: property.notes,
      status: property.status,
      property_type: property.property_type,
    })
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
    setEditForm({})
  }

  async function saveEdit() {
    setSaving(true)
    try {
      await update(editForm)
      setIsEditing(false)
      setEditForm({})
    } catch (err) {
      alert('Save failed: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSaving(false)
    }
  }

  async function handleQualify() {
    if (!property) return
    if (!confirm('Mark this property as Qualified?')) return
    try {
      await update({ status: 'qualified' })
      await logActivity({
        property_id: id,
        activity_type: 'status_change',
        activity_date: new Date().toISOString(),
        notes: 'Property marked as qualified',
        created_by: 'user',
      })
      await refetchActivities()
    } catch (err) {
      alert('Failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  function openDisqualify() {
    if (!property) return
    setDqReason(property.disqualification_reason ?? '')
    setDqNotes(property.disqualification_notes ?? '')
    setDisqualifying(true)
  }

  function cancelDisqualify() {
    setDisqualifying(false)
    setDqReason('')
    setDqNotes('')
  }

  async function submitDisqualify() {
    if (!property || !dqReason) return
    setSaving(true)
    try {
      await update({
        status: 'disqualified',
        disqualification_reason: dqReason,
        disqualification_notes: dqNotes || undefined,
      })
      await logActivity({
        property_id: id,
        activity_type: 'status_change',
        activity_date: new Date().toISOString(),
        notes: `Disqualified: ${dqReason}${dqNotes ? ' — ' + dqNotes : ''}`,
        created_by: 'user',
      })
      await refetchActivities()
      setDisqualifying(false)
      setDqReason('')
      setDqNotes('')
    } catch (err) {
      alert('Failed: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSaving(false)
    }
  }

  function openDeal(action: DealAction) {
    if (!property) return
    const next: DealForm = { ...emptyDealForm }
    switch (action) {
      case 'offer':
        next.offer_amount = property.target_offer_price != null ? String(property.target_offer_price) : ''
        next.offer_date = todayISO()
        break
      case 'counter':
        next.counter_amount = property.counter_amount != null ? String(property.counter_amount) : ''
        break
      case 'accept': {
        const seed = property.counter_amount ?? property.offer_amount
        next.buy_accepted = seed != null ? String(seed) : ''
        break
      }
      case 'close_won':
        next.buy_final = property.buy_accepted != null ? String(property.buy_accepted) : ''
        next.closing_date = property.closing_date ?? todayISO()
        break
      case 'sold':
        next.resale_price = property.resale_price != null ? String(property.resale_price) : ''
        next.actual_profit = property.actual_profit != null ? String(property.actual_profit) : ''
        break
      case 'reject':
      case 'close_lost':
      case 'list':
        // no fields
        break
    }
    setDealForm(next)
    setDealAction(action)
  }

  function cancelDeal() {
    setDealAction(null)
    setDealForm(emptyDealForm)
  }

  function onResaleChange(v: string) {
    setDealForm(f => {
      const resale = parseNum(v)
      const buy = property?.buy_final ?? parseNum(f.buy_final)
      const profit = resale != null && buy != null ? String(resale - buy) : f.actual_profit
      return { ...f, resale_price: v, actual_profit: profit }
    })
  }

  async function submitDeal() {
    if (!property || !dealAction) return
    const updates: PropertyUpdate = {}
    let activityType: 'offer' | 'status_change' = 'status_change'
    let activityNote = ''

    switch (dealAction) {
      case 'offer': {
        const amt = parseNum(dealForm.offer_amount)
        if (amt == null || !dealForm.offer_date) return
        updates.status = 'offer_made'
        updates.offer_status = 'pending'
        updates.offer_amount = amt
        updates.offer_date = dealForm.offer_date
        activityType = 'offer'
        activityNote = `Offer made: $${amt.toLocaleString()} on ${dealForm.offer_date}`
        break
      }
      case 'counter': {
        const amt = parseNum(dealForm.counter_amount)
        if (amt == null) return
        updates.status = 'negotiating'
        updates.offer_status = 'countered'
        updates.counter_amount = amt
        activityType = 'offer'
        activityNote = `Counter received: $${amt.toLocaleString()}`
        break
      }
      case 'accept': {
        const amt = parseNum(dealForm.buy_accepted)
        if (amt == null) return
        updates.status = 'under_contract'
        updates.offer_status = 'accepted'
        updates.buy_accepted = amt
        activityNote = `Offer accepted at $${amt.toLocaleString()} — under contract`
        break
      }
      case 'reject': {
        updates.status = 'closed_lost'
        updates.offer_status = 'rejected'
        activityNote = 'Offer rejected — closed lost'
        break
      }
      case 'close_won': {
        const amt = parseNum(dealForm.buy_final)
        if (amt == null || !dealForm.closing_date) return
        updates.status = 'closed_won'
        updates.buy_final = amt
        updates.closing_date = dealForm.closing_date
        activityNote = `Closed won: paid $${amt.toLocaleString()} on ${dealForm.closing_date}`
        break
      }
      case 'close_lost': {
        updates.status = 'closed_lost'
        activityNote = 'Closed lost'
        break
      }
      case 'list': {
        updates.status = 'listed_for_sale'
        activityNote = 'Listed for sale'
        break
      }
      case 'sold': {
        const resale = parseNum(dealForm.resale_price)
        if (resale == null) return
        const buy = property.buy_final
        const profit = parseNum(dealForm.actual_profit) ?? (buy != null ? resale - buy : undefined)
        updates.status = 'sold'
        updates.resale_price = resale
        if (profit != null) updates.actual_profit = profit
        activityNote = `Sold for $${resale.toLocaleString()}${profit != null ? ` (profit $${profit.toLocaleString()})` : ''}`
        break
      }
    }

    setSaving(true)
    try {
      await update(updates)
      await logActivity({
        property_id: id,
        activity_type: activityType,
        activity_date: new Date().toISOString(),
        notes: activityNote,
        created_by: 'user',
      })
      await refetchActivities()
      cancelDeal()
    } catch (err) {
      alert('Failed: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSaving(false)
    }
  }

  async function handleLogContact() {
    const notes = window.prompt('Contact notes (e.g. "Called, no answer" or "Spoke with owner, interested"):')
    if (!notes) return
    try {
      await logActivity({
        property_id: id,
        activity_type: 'call',
        activity_date: new Date().toISOString(),
        notes,
        created_by: 'user',
      })
      await refetchActivities()
    } catch (err) {
      alert('Failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

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
            {isEditing ? (
              <input
                className="text-3xl font-bold mb-2 border rounded px-2 py-1 w-full"
                value={editForm.owner_name ?? ''}
                onChange={e => setEditForm(f => ({ ...f, owner_name: e.target.value }))}
                placeholder="Owner Name"
              />
            ) : (
              <h1 className="text-3xl font-bold mb-2">{property.owner_name}</h1>
            )}
            <p className="text-muted-foreground font-mono">{property.parcel_id}</p>
            {isEditing ? (
              <input
                className="text-sm border rounded px-2 py-1 w-full mt-1"
                value={editForm.address ?? ''}
                onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Address"
              />
            ) : (
              <p className="text-muted-foreground">
                {property.address || property.subdivision || 'No address'}, {property.city || ''} {property.county} County
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Badge className={statusColors[property.status]}>
              {statusLabels[property.status]}
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-8">
          {isEditing ? (
            <>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : '💾 Save'}
              </button>
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="border px-4 py-2 rounded-md hover:bg-muted disabled:opacity-60"
              >
                ✕ Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleQualify}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                ✓ Qualify
              </button>
              <button
                onClick={openDisqualify}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                ✗ Disqualify
              </button>
              <button
                onClick={handleLogContact}
                className="border px-4 py-2 rounded-md hover:bg-muted"
              >
                📞 Log Contact
              </button>
              <button
                onClick={startEdit}
                className="border px-4 py-2 rounded-md hover:bg-muted"
              >
                ✏️ Edit
              </button>
            </>
          )}
        </div>

        {/* Deal-stage action buttons */}
        {!isEditing && !disqualifying && !dealAction && (
          <div className="flex flex-wrap gap-2 mb-8">
            {(property.status === 'qualified' || property.status === 'contacted') && (
              <button
                onClick={() => openDeal('offer')}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
              >
                💰 Make Offer
              </button>
            )}
            {(property.status === 'offer_made' || property.status === 'negotiating') && (
              <>
                <button
                  onClick={() => openDeal('counter')}
                  className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                >
                  ↔ Log Counter
                </button>
                <button
                  onClick={() => openDeal('accept')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  ✓ Mark Accepted
                </button>
                <button
                  onClick={() => openDeal('reject')}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  ✗ Mark Rejected
                </button>
              </>
            )}
            {property.status === 'under_contract' && (
              <>
                <button
                  onClick={() => openDeal('close_won')}
                  className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800"
                >
                  🏁 Mark Closed Won
                </button>
                <button
                  onClick={() => openDeal('close_lost')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  ✗ Mark Closed Lost
                </button>
              </>
            )}
            {property.status === 'closed_won' && (
              <button
                onClick={() => openDeal('list')}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
              >
                🪧 List For Sale
              </button>
            )}
            {property.status === 'listed_for_sale' && (
              <button
                onClick={() => openDeal('sold')}
                className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-900"
              >
                💵 Mark Sold
              </button>
            )}
          </div>
        )}

        {dealAction && (
          <DealActionPanel
            action={dealAction}
            form={dealForm}
            saving={saving}
            buyFinal={property.buy_final}
            onChange={(patch) => setDealForm(f => ({ ...f, ...patch }))}
            onResaleChange={onResaleChange}
            onCancel={cancelDeal}
            onSubmit={submitDeal}
          />
        )}

        {disqualifying && (
          <section className="border border-red-200 bg-red-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-red-800">Disqualify Property</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-red-700 block mb-1">Disqualification Reason</label>
                <select
                  className="border rounded px-2 py-1 w-full text-sm bg-white"
                  value={dqReason}
                  onChange={e => setDqReason(e.target.value as DisqualificationReason | '')}
                >
                  <option value="">Select a reason...</option>
                  {(Object.keys(disqualificationReasonLabels) as DisqualificationReason[]).map(r => (
                    <option key={r} value={r}>{disqualificationReasonLabels[r]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-red-700 block mb-1">Notes (optional)</label>
                <textarea
                  className="border rounded px-2 py-1 w-full text-sm bg-white"
                  rows={3}
                  value={dqNotes}
                  onChange={e => setDqNotes(e.target.value)}
                  placeholder="Additional context (e.g., subdivision, FEMA zone, why disqualified)"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={submitDisqualify}
                  disabled={!dqReason || saving}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : '✗ Confirm Disqualify'}
                </button>
                <button
                  onClick={cancelDisqualify}
                  disabled={saving}
                  className="border px-4 py-2 rounded-md hover:bg-muted disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Details */}
            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  {isEditing ? (
                    <select
                      className="border rounded px-2 py-1 w-full text-sm mt-1"
                      value={editForm.property_type ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, property_type: e.target.value as PropertyUpdate['property_type'] }))}
                    >
                      <option value="">Select...</option>
                      <option value="raw_land">Raw Land</option>
                      <option value="improved">Improved</option>
                      <option value="mobile_home">Mobile Home</option>
                    </select>
                  ) : (
                    <p className="font-medium capitalize">{property.property_type?.replace('_', ' ') || '-'}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Acreage</p>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border rounded px-2 py-1 w-full text-sm mt-1"
                      value={editForm.acreage ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, acreage: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      placeholder="Acreage"
                    />
                  ) : (
                    <p className="font-medium">{property.acreage?.toFixed(2) || '-'} acres</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subdivision</p>
                  {isEditing ? (
                    <input
                      className="border rounded px-2 py-1 w-full text-sm mt-1"
                      value={editForm.subdivision ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, subdivision: e.target.value }))}
                      placeholder="Subdivision"
                    />
                  ) : (
                    <p className="font-medium">{property.subdivision || '-'}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zoning</p>
                  {isEditing ? (
                    <input
                      className="border rounded px-2 py-1 w-full text-sm mt-1"
                      value={editForm.zoning ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, zoning: e.target.value }))}
                      placeholder="Zoning"
                    />
                  ) : (
                    <p className="font-medium">{property.zoning || '-'}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Flood Zone</p>
                  {isEditing ? (
                    <input
                      className="border rounded px-2 py-1 w-full text-sm mt-1"
                      value={editForm.flood_zone ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, flood_zone: e.target.value }))}
                      placeholder="e.g. X, AE"
                    />
                  ) : (
                    <p className="font-medium">{property.flood_zone || '-'}</p>
                  )}
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
                  {isEditing ? (
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-full text-sm mt-1"
                      value={editForm.market_value ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, market_value: e.target.value ? parseInt(e.target.value) : undefined }))}
                      placeholder="Market Value"
                    />
                  ) : (
                    <p className="font-medium">{formatCurrency(property.market_value)}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Retail</p>
                  {isEditing ? (
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-full text-sm mt-1"
                      value={editForm.estimated_retail_value ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, estimated_retail_value: e.target.value ? parseInt(e.target.value) : undefined }))}
                      placeholder="Est. Retail Value"
                    />
                  ) : (
                    <p className="font-medium text-green-600">{formatCurrency(property.estimated_retail_value)}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Target Offer</p>
                  {isEditing ? (
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-full text-sm mt-1"
                      value={editForm.target_offer_price ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, target_offer_price: e.target.value ? parseInt(e.target.value) : undefined }))}
                      placeholder="Target Offer"
                    />
                  ) : (
                    <p className="font-medium">{formatCurrency(property.target_offer_price)}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Margin</p>
                  <p className="font-medium text-green-600">
                    {property.estimated_margin_percent ? `${property.estimated_margin_percent}%` : '-'}
                  </p>
                </div>
              </div>
            </section>

            {/* Tax Status */}
            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Tax Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {isEditing ? (
                    <select
                      className="border rounded px-2 py-1 w-full text-sm mt-1"
                      value={editForm.tax_status ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, tax_status: e.target.value as PropertyUpdate['tax_status'] }))}
                    >
                      <option value="">Select...</option>
                      <option value="current">Current</option>
                      <option value="delinquent">Delinquent</option>
                      <option value="pending">Pending</option>
                    </select>
                  ) : (
                    <p className="font-medium capitalize">{property.tax_status || '-'}</p>
                  )}
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

            {/* Deal */}
            {(() => {
              const dealStages: PropertyStatus[] = [
                'offer_made', 'negotiating', 'under_contract',
                'closed_won', 'closed_lost', 'listed_for_sale', 'sold',
              ]
              const hasDealData =
                property.offer_amount != null ||
                property.offer_date != null ||
                property.counter_amount != null ||
                property.offer_status != null ||
                property.buy_accepted != null ||
                property.closing_date != null ||
                property.buy_final != null ||
                property.resale_price != null ||
                property.actual_profit != null
              const showDeal = dealStages.includes(property.status) || hasDealData
              if (!showDeal) return null
              return (
                <section className="border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Deal</h2>

                  {/* Offer block */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Offer Amount</p>
                      <p className="font-medium">{formatCurrency(property.offer_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Offer Date</p>
                      <p className="font-medium">{formatDate(property.offer_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Counter Amount</p>
                      <p className="font-medium">{formatCurrency(property.counter_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Offer Status</p>
                      {property.offer_status ? (
                        <Badge className={offerStatusColors[property.offer_status] ?? 'bg-gray-500'}>
                          {property.offer_status}
                        </Badge>
                      ) : (
                        <p className="font-medium">-</p>
                      )}
                    </div>
                  </div>

                  {/* Closing block */}
                  {(property.buy_accepted != null || property.closing_date != null || property.buy_final != null) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Accepted Price</p>
                        <p className="font-medium">{formatCurrency(property.buy_accepted)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Closing Date</p>
                        <p className="font-medium">{formatDate(property.closing_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Final Purchase Price</p>
                        <p className="font-medium">{formatCurrency(property.buy_final)}</p>
                      </div>
                    </div>
                  )}

                  {/* Resale block */}
                  {(property.resale_price != null || property.actual_profit != null) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Resale Price</p>
                        <p className="font-medium">{formatCurrency(property.resale_price)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Actual Profit</p>
                        <p className="font-medium text-green-600">{formatCurrency(property.actual_profit)}</p>
                      </div>
                    </div>
                  )}
                </section>
              )
            })()}

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
                {property.seller_type && (
                  <Badge variant="outline" className="capitalize">{property.seller_type}</Badge>
                )}
              </div>
            </section>

            {/* Notes */}
            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              {isEditing ? (
                <textarea
                  className="border rounded px-2 py-1 w-full text-sm"
                  rows={6}
                  value={editForm.notes ?? ''}
                  onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notes..."
                />
              ) : (
                property.notes ? (
                  <p className="whitespace-pre-wrap">{property.notes}</p>
                ) : (
                  <p className="text-muted-foreground">No notes</p>
                )
              )}
            </section>

            {/* Status (edit only) */}
            {isEditing && (
              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Pipeline Status</h2>
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={editForm.status ?? property.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value as PropertyStatus }))}
                >
                  {(Object.keys(statusLabels) as PropertyStatus[]).map(s => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
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
