import { describe, expect, it } from 'vitest'

import { getWordImageUrl, PLACEHOLDER_IMAGE_URL } from '../../src/utils/getWordImageUrl'

describe('getWordImageUrl', () => {
  it('returns image path for a valid word ID', () => {
    const url = getWordImageUrl('fruits/simple/apple')
    expect(url).toBe('/images/vocabulary/fruits/apple.png')
  })

  it('returns placeholder for an invalid word ID', () => {
    expect(getWordImageUrl('invalid')).toBe(PLACEHOLDER_IMAGE_URL)
    expect(getWordImageUrl('')).toBe(PLACEHOLDER_IMAGE_URL)
    expect(getWordImageUrl('no/such/thing')).toBe(PLACEHOLDER_IMAGE_URL)
  })

  it('returns paths under /images/vocabulary/', () => {
    const url = getWordImageUrl('toys/simple/doll')
    expect(url).toMatch(/^\/images\/vocabulary\//u)
  })

  it('returns consistent results for the same input', () => {
    const a = getWordImageUrl('fruits/simple/apple')
    const b = getWordImageUrl('fruits/simple/apple')
    expect(a).toBe(b)
  })
})
