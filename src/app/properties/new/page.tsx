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
import { useProperties } from '@/hooks/useProperties'

const COUNTIES = ['Putnam', 'Highlands', 'Clay', 'St. Johns']
const SOURCES = ['probate', 'tax_sale', 'direct_mail', 'referral', 'other']

export default function AddPropertyPage() {
  const router = useRouter()
  const { addProperty } = useProperties()
  
  const [formData, setFormData] = useState({
    parcel_id: '',
    county: '',
    owner_name: '',
    source: 'probate',
    address: '',
    subdivision: '',
    acreage: '',
    notes: '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.parcel_id.trim()) {
      newErrors.parcel_id = 'Parcel ID is required'
    }
    if (!formData.county) {
      newErrors.county = 'County is required'
    }
    if (!formData.owner_name.trim()) {
      newErrors.owner_name = 'Owner name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (!validate()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const property = await addProperty({
        parcel_id: formData.parcel_id.trim(),
        county: formData.county,
        owner_name: formData.owner_name.trim(),
        source: formData.source,
        status: 'new',
        pipeline_stage: 1,
        property_type: 'raw_land',
        address: formData.address.trim() || undefined,
        subdivision: formData.subdivision.trim() || undefined,
        acreage: formData.acreage ? parseFloat(formData.acreage) : undefined,
        notes: formData.notes.trim() || undefined,
      })
      
      router.push(`/properties/${property.id}`)
    } catch (error) {
      console.error('Failed to save property:', error)
      setSubmitError('Failed to save property. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/properties" className="text-muted-foreground hover:text-foreground mb-6 inline-block">
          ← Back to Properties
        </Link>

        <h1 className="text-3xl font-bold mb-8">Add Property</h1>

        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Fields */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Required Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="parcel_id">Parcel ID</Label>
              <Input
                id="parcel_id"
                value={formData.parcel_id}
                onChange={(e) => handleChange('parcel_id', e.target.value)}
                placeholder="e.g., 08-13-27-7061-0500-0010"
                className={errors.parcel_id ? 'border-red-500' : ''}
              />
              {errors.parcel_id && (
                <p className="text-sm text-red-500">{errors.parcel_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Select
                value={formData.county}
                onValueChange={(value) => handleChange('county', value)}
              >
                <SelectTrigger id="county" className={errors.county ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTIES.map((county) => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.county && (
                <p className="text-sm text-red-500">{errors.county}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_name">Owner Name</Label>
              <Input
                id="owner_name"
                value={formData.owner_name}
                onChange={(e) => handleChange('owner_name', e.target.value)}
                placeholder="e.g., SMITH JOHN EST"
                className={errors.owner_name ? 'border-red-500' : ''}
              />
              {errors.owner_name && (
                <p className="text-sm text-red-500">{errors.owner_name}</p>
              )}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Property Details</h2>
            
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => handleChange('source', value)}
              >
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Physical address (if known)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdivision">Subdivision</Label>
              <Input
                id="subdivision"
                value={formData.subdivision}
                onChange={(e) => handleChange('subdivision', e.target.value)}
                placeholder="e.g., Paradise Lakes Unit 2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acreage">Acreage</Label>
              <Input
                id="acreage"
                type="number"
                step="0.01"
                value={formData.acreage}
                onChange={(e) => handleChange('acreage', e.target.value)}
                placeholder="e.g., 0.23"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional notes..."
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Property'}
            </button>
            <Link
              href="/properties"
              className="px-6 py-2 border rounded-md hover:bg-muted"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
