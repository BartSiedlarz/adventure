import { describe, expect, it } from 'vitest'
import { calculateProgress } from './helpers'

describe('Helpers', () => {
  describe('calculateProgress', () => {
    it.each([
      ['1000.00', '500.00', '50'],
      ['1000', '1000', '0'],
      ['50000', '49800.00', '99'],
      ['10000', '9800.00', '98'],
    ])('calculates progress (%s, %s) => %s', (total, remainingAmount, expected) => {
      expect(calculateProgress(total, remainingAmount)).toBe(expected)
    })
  })
})
