import { describe, expect, it } from 'vitest'
import { attachBaseUrl } from './attach-base-url'

describe('attachBaseUrl', () => {
  it('should return only url if baseUrl is empty', () => {
    const baseUrl = ''
    const url = '/url'

    const result = attachBaseUrl(url, baseUrl)

    expect(result).toStrictEqual(url)
  })

  it("should return baseUrl + url if baseUrl has / and url doesn't", () => {
    const baseUrl = 'https://google.com/'
    const url = 'hello/world'

    const result = attachBaseUrl(url, baseUrl)

    expect(result).toStrictEqual(baseUrl + url)
  })

  it("should return baseUrl + url if url has / and baseUrl doesn't", () => {
    const baseUrl = 'https://google.com/'
    const url = 'hello/world'

    const result = attachBaseUrl(url, baseUrl)

    expect(result).toStrictEqual(baseUrl + url)
  })

  it('should return valid url with single slash if baseUrl and url both have slash', () => {
    const baseUrl = 'https://google.com/'
    const url = '/hello/world'

    const result = attachBaseUrl(url, baseUrl)

    expect(result).toStrictEqual('https://google.com/hello/world')
  })

  it("should return valid url with single slash if baseUrl and url both don't have slash", () => {
    const baseUrl = 'https://google.com'
    const url = 'hello/world'

    const result = attachBaseUrl(url, baseUrl)

    expect(result).toStrictEqual('https://google.com/hello/world')
  })
})
