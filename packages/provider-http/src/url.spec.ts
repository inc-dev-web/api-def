import { describe, expect, it, vitest } from 'vitest'
import { createRequestUrl } from './url.js'

describe('createRequestUrl', () => {
  it('should return plain endpoint url if empty base url or query parameters is specified and url is plain string', async () => {
    const url = '/url'

    const requestUrlResult = await createRequestUrl(
      {
        baseUrl: '',
      },
      {
        url,
      },
      null
    )

    expect(requestUrlResult).toBe(url)
  })

  it('should return endpoint url with base url if base url is specified', async () => {
    const baseUrl = 'https://google.com'
    const url = '/url'
    const expectedResult = 'https://google.com/url'

    const requestUrlResult = await createRequestUrl(
      {
        baseUrl,
      },
      {
        url,
      },
      null
    )

    expect(requestUrlResult).toStrictEqual(expectedResult)
  })

  it('should return endpoint url with base url and empty query parameters if query paramters are specified as plain empty object', async () => {
    const baseUrl = 'https://google.com'
    const url = '/url'
    const queryParameters = {}
    const expectedResult = 'https://google.com/url'

    const requestUrlResult = await createRequestUrl(
      {
        baseUrl,
      },
      {
        url,
        query: queryParameters,
      },
      null
    )

    expect(requestUrlResult).toStrictEqual(expectedResult)
  })

  it('should return endpoint url with base url and stringified query parameters if query paramters are specified as plain non-empty object', async () => {
    const baseUrl = 'https://google.com'
    const url = '/url'
    const queryParameters = {
      parameter1: 100,
      parameter2: 200,
    }
    const expectedResult =
      'https://google.com/url?parameter1=100&parameter2=200'

    const requestUrlResult = await createRequestUrl(
      {
        baseUrl,
      },
      {
        url,
        query: queryParameters,
      },
      null
    )

    expect(requestUrlResult).toStrictEqual(expectedResult)
  })

  it('should execute query parameters function and return endpoint url with returned parameters', async () => {
    const baseUrl = 'https://google.com'
    const url = '/url'
    const queryParameters = vitest.fn(() => ({
      parameter1: 100,
      parameter2: 200,
    }))
    const param = {}

    const expectedResult =
      'https://google.com/url?parameter1=100&parameter2=200'

    const requestUrlResult = await createRequestUrl(
      {
        baseUrl,
      },
      {
        url,
        query: queryParameters,
      },
      param
    )

    expect(requestUrlResult).toStrictEqual(expectedResult)
    expect(queryParameters).toBeCalled()
    expect(queryParameters).toBeCalledTimes(1)
    expect(queryParameters).toBeCalledWith(param)
  })
})
