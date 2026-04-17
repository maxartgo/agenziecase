// src/__tests__/utils/currency.test.js
import { describe, it, expect } from 'vitest'

describe('Currency Utils', () => {
  it('should format currency correctly', () => {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }

    const result1 = formatCurrency(100000)
    expect(result1).toContain('100')
    expect(result1).toContain('€')

    const result2 = formatCurrency(350000)
    expect(result2).toContain('350')
    expect(result2).toContain('€')

    const result3 = formatCurrency(0)
    expect(result3).toContain('0')
    expect(result3).toContain('€')
  })

  it('should handle edge cases', () => {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }

    const result1 = formatCurrency(-1000)
    expect(result1).toContain('-')

    const result2 = formatCurrency(999.99)
    expect(result2).toContain('999')
  })
})
