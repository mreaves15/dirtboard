'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProperties } from '@/hooks/useProperties'
import type { Property, PropertyStatus } from '@/types/database'

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

type SortField = 'county' | 'acreage' | 'market_value'
type SortDirection = 'asc' | 'desc' | null
interface SortConfig { field: SortField | null; direction: SortDirection }
interface RangeFilter { min: string; max: string }

export default function PropertiesPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { properties, loading, error } = useProperties({ status: statusFilter })
  const [search, setSearch] = useState('')
  const [countyFilter, setCountyFilter] = useState<string>('all')

  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null })
  const [acreageRange, setAcreageRange] = useState<RangeFilter>({ min: '', max: '' })
  const [valueRange, setValueRange] = useState<RangeFilter>({ min: '', max: '' })
  const [dateFilter, setDateFilter] = useState<string>('')

  function handleSort(field: SortField) {
    setSortConfig(prev => {
      if (prev.field !== field) return { field, direction: 'asc' }
      if (prev.direction === 'asc') return { field, direction: 'desc' }
      return { field: null, direction: null }
    })
  }

  // Build filter options from loaded data
  const filterOptions = useMemo(() => {
    const counties = [...new Set(properties.map(p => p.county))]
    return { counties }
  }, [properties])

  // Filter properties client-side
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // County filter
      if (countyFilter !== 'all' && property.county !== countyFilter) return false
      
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const searchable = [
          property.parcel_id,
          property.owner_name,
          property.address,
          property.subdivision,
        ].filter(Boolean).join(' ').toLowerCase()
        
        if (!searchable.includes(searchLower)) return false
      }
      


      // Acreage range filter
      if (acreageRange.min || acreageRange.max) {
        if (property.acreage == null) return false
        const min = acreageRange.min ? parseFloat(acreageRange.min) : -Infinity
        const max = acreageRange.max ? parseFloat(acreageRange.max) : Infinity
        if (isNaN(min) || isNaN(max)) return false
        if (property.acreage < min || property.acreage > max) return false
      }

      // Market value range filter
      if (valueRange.min || valueRange.max) {
        if (property.market_value == null) return false
        const min = valueRange.min ? parseFloat(valueRange.min) : -Infinity
        const max = valueRange.max ? parseFloat(valueRange.max) : Infinity
        if (isNaN(min) || isNaN(max)) return false
        if (property.market_value < min || property.market_value > max) return false
      }

      // Date filter
      if (dateFilter && property.created_at) {
        const filterDate = new Date(dateFilter)
        const propDate = new Date(property.created_at)
        if (propDate < filterDate) return false
      }

      return true
    })
  }, [properties, search, countyFilter, acreageRange, valueRange, dateFilter])


  const sortedProperties = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) return filteredProperties
    return [...filteredProperties].sort((a, b) => {
      const field = sortConfig.field!
      const aVal = a[field]
      const bVal = b[field]

      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      let cmp: number
      if (typeof aVal === 'string') {
        cmp = aVal.localeCompare(bVal as string)
      } else {
        cmp = (aVal as number) - (bVal as number)
      }
      return sortConfig.direction === 'desc' ? -cmp : cmp
    })
  }, [filteredProperties, sortConfig])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">DirtBoard</Link>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/properties" className="font-medium">
              Properties
            </Link>
            <Link href="/buyers" className="text-muted-foreground hover:text-foreground">
              Buyers
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Properties</h1>
          <Link
            href="/properties/new"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90"
          >
            + Add Property
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search parcel, owner, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]" aria-label="Status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={countyFilter} onValueChange={setCountyFilter}>
            <SelectTrigger className="w-[180px]" aria-label="County">
              <SelectValue placeholder="All Counties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Counties</SelectItem>
              {filterOptions.counties.map((county) => (
                <SelectItem key={county} value={county}>
                  {county}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Min Acres"
            value={acreageRange.min}
            onChange={(e) =>
              setAcreageRange(prev => ({ ...prev, min: e.target.value }))
            }
            className="w-[140px]"
          />
          <Input
            type="number"
            placeholder="Max Acres"
            value={acreageRange.max}
            onChange={(e) =>
              setAcreageRange(prev => ({ ...prev, max: e.target.value }))
            }
            className="w-[140px]"
          />
          <Input
            type="number"
            placeholder="Min $"
            value={valueRange.min}
            onChange={(e) => setValueRange(prev => ({ ...prev, min: e.target.value }))}
            className="w-[120px]"
          />
          <Input
            type="number"
            placeholder="Max $"
            value={valueRange.max}
            onChange={(e) => setValueRange(prev => ({ ...prev, max: e.target.value }))}
            className="w-[120px]"
          />
          <Input
            type="date"
            aria-label="Date Added"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-[160px]"
          />

        </div>

        {/* Results count */}
        <p className="text-muted-foreground mb-4">
          {loading ? 'Loading...' : `Showing ${filteredProperties.length} of ${properties.length} properties`}
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error.message}
          </div>
        )}

        {/* Data Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('county')}
                    className="flex items-center gap-1 font-medium hover:text-primary"
                  >
                    County{' '}
                    {sortConfig.field === 'county' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </button>
                </TableHead>
                <TableHead>Parcel ID</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">
                  <button
                    onClick={() => handleSort('acreage')}
                    className="ml-auto flex items-center gap-1 font-medium hover:text-primary"
                  >
                    Acres{' '}
                    {sortConfig.field === 'acreage' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    onClick={() => handleSort('market_value')}
                    className="ml-auto flex items-center gap-1 font-medium hover:text-primary"
                  >
                    Market Value{' '}
                    {sortConfig.field === 'market_value' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </button>
                </TableHead>
                <TableHead className="text-right">Est. Retail</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProperties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No properties found
                  </TableCell>
                </TableRow>
              ) : (
                sortedProperties.map((property) => (
                  <TableRow 
                    key={property.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/properties/${property.id}`)}
                  >
                    <TableCell>
                      <Badge className={statusColors[property.status]}>
                        {statusLabels[property.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{property.county}</TableCell>
                    <TableCell className="font-mono text-sm">{property.parcel_id}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{property.owner_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {property.address || property.subdivision || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {property.acreage?.toFixed(2) || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(property.market_value)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(property.estimated_retail_value)}
                    </TableCell>
                    <TableCell className="text-right">
                      {property.estimated_margin_percent 
                        ? `${property.estimated_margin_percent.toFixed(0)}%` 
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
