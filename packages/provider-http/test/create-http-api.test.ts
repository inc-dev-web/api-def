import { createHttpApi } from '../src/index'
import { describe, it, expect } from 'vitest'

describe('createHttpApi', () => {
  it('should return an object', () => {
    const apiConfig = createHttpApi({ baseUrl: '' })

    expect(typeof apiConfig).toBe('object')
  })

  it('should return an object with defineEndpoint function', () => {
    const apiConfig = createHttpApi({ baseUrl: '' })

    expect(typeof apiConfig.defineEndpoint).toBe('function')
  })

  it('should return an object with defineJsonEndpoint function', () => {
    const apiConfig = createHttpApi({ baseUrl: '' })

    expect(typeof apiConfig.defineJsonEndpoint).toBe('function')
  })

  it('should return an object with config object', () => {
    const apiConfig = createHttpApi({ baseUrl: '' })

    expect(typeof apiConfig.config).toBe('object')
  })

  it('should return an object with config object being the config passed as a parameter', () => {
    const config = { baseUrl: '' }

    const apiConfig = createHttpApi(config)

    expect(apiConfig.config).toBe(config)
  })
})
