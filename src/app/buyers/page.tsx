'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
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
import { useBuyers } from '@/hooks/useBuyers'
import type { BuyerType, BuyerStatus } from '@/types/database'

const typeColors: Record<BuyerType, string> = {
  builder: 'bg-blue-600',
  investor: 'bg-green-600',
  agent: 'bg-purple-600',
  wholesaler: 'bg-orange-600',
  other: 'bg-gray-500',
}

const typeLabels: Record<BuyerType, string> = {
  builder: '🏗️ Builder',
  investor: '💰 Investor',
  agent: '🏠 Agent',
  wholesaler: '🔄 Wholesaler',
  other: 'Other',
}

const statusColors: Record<BuyerStatus, string> = {
  active: 'bg-green-500',
  contacted: 'bg-yellow-500',
  working: 'bg-blue-500',
  inactive: 'bg-gray-500',
}

export default function BuyersPage() {
  const { buyers, loading, error } = useBuyers()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [countyFilter, setCountyFilter] = useState<string>('all')

  const counties = useMemo(() => {
    const all = new Set<string>()
    buyers.forEach(b => {
      if (b.county) all.add(b.county)
      b.counties?.forEach(c => all.add(c))
    })
    return [...all].sort()
  }, [buyers])

  const filtered = useMemo(() => {
    return buyers.filter(b => {
      if (typeFilter !== 'all' && b.type !== typeFilter) return false
      if (countyFilter !== 'all') {
        const inCounty = b.county === countyFilter || b.counties?.includes(countyFilter)
        if (!inCounty) return false
      }
      if (search) {
        const s = search.toLowerCase()
        const searchable = [b.name, b.company, b.phone, b.email, b.notes]
          .filter(Boolean).join(' ').toLowerCase()
        if (!searchable.includes(s)) return false
      }
      return true
    })
  }, [buyers, search, typeFilter, countyFilter])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">DirtBoard</Link>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/properties" className="text-muted-foreground hover:text-foreground">Properties</Link>
            <Link href="/buyers" className="font-medium">Buyers</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Buyers & Builders</h1>
          <Link
            href="/buyers/new"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90"
          >
            + Add Buyer
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {(['builder', 'investor', 'agent', 'wholesaler', 'other'] as BuyerType[]).map(type => {
            const count = buyers.filter(b => b.type === type).length
            return (
              <div key={type} className="border rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{typeLabels[type]}</div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search name, company, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]" aria-label="Type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="builder">🏗️ Builder</SelectItem>
              <SelectItem value="investor">💰 Investor</SelectItem>
              <SelectItem value="agent">🏠 Agent</SelectItem>
              <SelectItem value="wholesaler">🔄 Wholesaler</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={countyFilter} onValueChange={setCountyFilter}>
            <SelectTrigger className="w-[180px]" aria-label="County">
              <SelectValue placeholder="All Counties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Counties</SelectItem>
              {counties.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-muted-foreground mb-4">
          {loading ? 'Loading...' : `Showing ${filtered.length} of ${buyers.length} buyers`}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error.message}
          </div>
        )}

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>County</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Buy Box</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No buyers found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((buyer) => (
                  <TableRow key={buyer.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Badge className={typeColors[buyer.type]}>
                        {typeLabels[buyer.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[buyer.status]}>
                        {buyer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{buyer.name}</TableCell>
                    <TableCell>{buyer.company || '-'}</TableCell>
                    <TableCell>
                      {buyer.counties?.length
                        ? buyer.counties.join(', ')
                        : buyer.county || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{buyer.phone || '-'}</TableCell>
                    <TableCell className="text-sm">{buyer.email || '-'}</TableCell>
                    <TableCell className="max-w-[200px] text-sm truncate">
                      {buyer.buy_box?.max_price
                        ? `≤$${(buyer.buy_box.max_price/1000).toFixed(0)}K`
                        : '-'}
                      {buyer.buy_box?.zip_codes?.length
                        ? ` · ${buyer.buy_box.zip_codes.length} ZIPs`
                        : ''}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{buyer.source || '-'}</TableCell>
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
