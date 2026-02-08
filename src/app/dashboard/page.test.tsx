import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from './page'

describe('Dashboard Page', () => {
  it('renders the dashboard heading', () => {
    render(<DashboardPage />)
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('renders pipeline overview section', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/pipeline overview/i)).toBeInTheDocument()
  })

  it('shows total properties count', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/total properties/i)).toBeInTheDocument()
  })

  it('shows qualified leads count', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/qualified leads/i)).toBeInTheDocument()
  })

  it('shows properties by county', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/by county/i)).toBeInTheDocument()
  })

  it('renders link to properties', () => {
    render(<DashboardPage />)
    expect(screen.getByRole('link', { name: /view all properties/i })).toBeInTheDocument()
  })
})
