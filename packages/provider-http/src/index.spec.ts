import { beforeEach, describe, expect, it } from 'vitest'

describe('index', () => {
  let imported: any

  beforeEach(async () => {
    imported = await import('./index')
  })

  it('should export createHttpApi function', () => {
    expect(typeof imported).toBe('object')
    expect(typeof imported.createHttpApi).toBe('function')
  })
})
