import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home Page', () => {
  it('renders the DirtBoard heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /dirtboard/i })).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Home />)
    // Check that navigation links exist (there may be multiple property links)
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /properties/i }).length).toBeGreaterThan(0)
  })
})
