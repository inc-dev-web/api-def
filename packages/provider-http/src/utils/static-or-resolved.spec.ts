import { describe, expect, it, vi } from 'vitest'
import { resolveStaticOrResolved } from './static-or-resolved.js'

describe('resolveStaticOrResolved', () => {
  it('should return static value if static value is given as first parameter', async () => {
    const value = 'value'

    const result = await resolveStaticOrResolved<string, void>(value, undefined)

    expect(result).toBe(value)
  })

  it('should return awaited promise value if promise is given as first parameter', async () => {
    const value = 'value'
    const promise = Promise.resolve(value)

    const result = await resolveStaticOrResolved<string, void>(
      promise,
      undefined
    )

    expect(result).toBe(value)
  })

  it('should return function result if function is given as first parameter', async () => {
    const value = 'value'
    const func = vi.fn(() => {
      return value
    })

    const result = await resolveStaticOrResolved<string, void>(func, undefined)

    expect(result).toBe(value)
    expect(func).toBeCalledTimes(1)
  })

  it('should return async function result if async function is given as first parameter', async () => {
    const value = 'value'
    const func = vi.fn(async () => {
      return value
    })

    const result = await resolveStaticOrResolved<string, void>(func, undefined)

    expect(result).toBe(value)
    expect(func).toBeCalledTimes(1)
  })

  it('should pass parameter to function', async () => {
    const parameter = 'parameter'

    const func = vi.fn((param: string) => {
      return param
    })

    const result = await resolveStaticOrResolved(func, parameter)

    expect(result).toBe(parameter)
    expect(func).toBeCalledTimes(1)
    expect(func).toBeCalledWith(parameter)
  })
})
