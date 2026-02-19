'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBuyers } from '@/hooks/useBuyers'
import type { BuyerType, BuyerInsert } from '@/types/database'

export default function NewBuyerPage() {
  const router = useRouter()
  const { addBuyer } = useBuyers()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    company: '',
    type: 'builder' as BuyerType,
    county: '',
    phone: '',
    email: '',
    website: '',
    source: '',
    notes: '',
    // Buy box fields
    zip_codes: '',
    max_price: '',
    min_lot_size: '',
    max_lot_size: '',
    requirements: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const counties = form.county.split(',').map(c => c.trim()).filter(Boolean)
      const zipCodes = form.zip_codes.split(',').map(z => z.trim()).filter(Boolean)

      const buyer: BuyerInsert = {
        name: form.name,
        company: form.company || undefined,
        type: form.type,
        county: counties[0] || undefined,
        counties: counties.length > 0 ? counties : undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
        source: form.source || undefined,
        notes: form.notes || undefined,
        status: 'active',
        buy_box: {
          zip_codes: zipCodes.length > 0 ? zipCodes : undefined,
          max_price: form.max_price ? parseInt(form.max_price) : undefined,
          min_lot_size: form.min_lot_size || undefined,
          max_lot_size: form.max_lot_size || undefined,
          requirements: form.requirements || undefined,
        },
      }

      await addBuyer(buyer)
      router.push('/buyers')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add buyer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">DirtBoard</Link>
          <nav className="flex gap-4">
            <Link href="/buyers" className="text-muted-foreground hover:text-foreground">← Back to Buyers</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Add Buyer / Builder</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-lg">Contact Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as BuyerType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="builder">🏗️ Builder</SelectItem>
                    <SelectItem value="investor">💰 Investor</SelectItem>
                    <SelectItem value="agent">🏠 Agent</SelectItem>
                    <SelectItem value="wholesaler">🔄 Wholesaler</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="county">Counties (comma-separated)</Label>
                <Input id="county" placeholder="Marion, Lee" value={form.county}
                  onChange={e => setForm(f => ({ ...f, county: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Source</Label>
                <Input id="source" placeholder="Zillow, BuyerBridge, referral..." value={form.source}
                  onChange={e => setForm(f => ({ ...f, source: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Buy Box */}
          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-lg">Buy Box</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zip_codes">ZIP Codes (comma-separated)</Label>
                <Input id="zip_codes" placeholder="33971, 33972, 33976" value={form.zip_codes}
                  onChange={e => setForm(f => ({ ...f, zip_codes: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="max_price">Max Price per Lot ($)</Label>
                <Input id="max_price" type="number" value={form.max_price}
                  onChange={e => setForm(f => ({ ...f, max_price: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_lot_size">Min Lot Size</Label>
                <Input id="min_lot_size" placeholder="0.20 ac" value={form.min_lot_size}
                  onChange={e => setForm(f => ({ ...f, min_lot_size: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="max_lot_size">Max Lot Size</Label>
                <Input id="max_lot_size" placeholder="1.0 ac" value={form.max_lot_size}
                  onChange={e => setForm(f => ({ ...f, max_lot_size: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" placeholder="Road access, utilities, no flood zone..."
                value={form.requirements}
                onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Buyer'}
            </button>
            <Link href="/buyers" className="px-6 py-2 border rounded-md hover:bg-muted">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
