import { beforeEach, describe, expect, it, vitest } from 'vitest'
import { createRequestInit } from './request.js'
import type { HttpEndpointConfig } from './types.js'

describe('createRequestInit', () => {
  let outputFn
  let endpointConfig: HttpEndpointConfig<unknown, unknown, unknown>

  beforeEach(() => {
    outputFn = vitest.fn()

    endpointConfig = {
      url: '/',
      method: 'POST',
      output: outputFn,
    }
  })

  it('should create request with empty headers and null body if undefined body in endpoint configuration', async () => {
    const result = await createRequestInit(endpointConfig, undefined)

    expect(typeof result).toBe('object')
    expect(result.headers).toStrictEqual({})
    expect(result.body).toBe(null)
  })

  it('should create request with empty headers and string body with body if no content type in endpoint configuration', async () => {
    const body = 'Hello'

    endpointConfig.body = {
      body,
    }
    const result = await createRequestInit(endpointConfig, undefined)

    expect(typeof result).toBe('object')
    expect(result.headers).toStrictEqual({})
    expect(result.body).toBe(body)
  })

  it('should create request with content type header and string body with body if content type in endpoint configuration', async () => {
    const body = 'Hello'
    const contentType = 'application/json'

    endpointConfig.body = {
      body,
      contentType,
    }
    const result = await createRequestInit(endpointConfig, undefined)

    expect(typeof result).toBe('object')
    expect(result.headers).toStrictEqual({
      'Content-Type': contentType,
    })
    expect(result.body).toBe(body)
  })

  it('should create request with content type header and string body and execute body function if content type in endpoint configuration', async () => {
    const bodyContent = 'Hello'
    const contentType = 'application/json'

    const body = vitest.fn(() => ({
      body: bodyContent,
      contentType,
    }))
    endpointConfig.body = body
    const param = {}

    const result = await createRequestInit(endpointConfig, param)

    expect(typeof result).toBe('object')
    expect(result.headers).toStrictEqual({
      'Content-Type': contentType,
    })
    expect(result.body).toBe(bodyContent)
    expect(body).toBeCalledTimes(1)
    expect(body).toBeCalled()
    expect(body).toBeCalledWith(param)
  })
})
