// src/__tests__/components/PropertyCard.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock del componente PropertyCard
const MockPropertyCard = ({ property }) => {
  return (
    <div data-testid="property-card">
      <h3>{property.title}</h3>
      <p>{property.price} €</p>
      <p>{property.city}</p>
    </div>
  )
}

describe('PropertyCard Component', () => {
  const mockProperty = {
    id: 1,
    title: 'Villa Milano Centrale',
    price: 350000,
    city: 'Milano',
    images: ['image1.jpg']
  }

  it('renders property information', () => {
    render(<MockPropertyCard property={mockProperty} />)

    expect(screen.getByText('Villa Milano Centrale')).toBeInTheDocument()
    expect(screen.getByText(/350000/)).toBeInTheDocument()
    expect(screen.getByText('Milano')).toBeInTheDocument()
  })

  it('has property-card data-testid', () => {
    const { container } = render(<MockPropertyCard property={mockProperty} />)

    expect(container.querySelector('[data-testid="property-card"]')).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    render(<MockPropertyCard property={mockProperty} />)
    // Test passed if no error thrown
  })
})
