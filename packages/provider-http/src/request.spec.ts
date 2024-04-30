import { beforeEach, describe, expect, it } from 'vitest'
import { createRequestInit } from './request.js'
import type { HttpEndpointConfig } from './types.js'

describe('createRequestInit', () => {
  let endpointConfig: HttpEndpointConfig<unknown, unknown, unknown>

  beforeEach(() => {
    endpointConfig = {
      url: '/',
      method: 'POST',
      output: (response) => ({ success: true, output: undefined }),
    }
  })

  it('should create request with empty headers and null body with undefined body in endpoint configuration', async () => {
    const result = await createRequestInit(endpointConfig, undefined)

    expect(typeof result).toBe('object')
    expect(result.headers).toStrictEqual({})
    expect(result.body).toBe(null)
  })
})
