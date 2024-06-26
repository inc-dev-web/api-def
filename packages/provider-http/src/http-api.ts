import type { EndpointDefinition } from '@api-def/core'
import { resolveStaticOrResolved } from './utils/static-or-resolved'
import { authenticateRequest } from './authentication'
import type {
  CreateHttpApiConfig,
  HttpEndpointConfig,
  JsonHttpEndpointConfig,
} from './types'
import { createRequestInit } from './request'
import { createRequestUrl } from './url'

export const createHttpApi = <TError = Error>(
  apiConfig: CreateHttpApiConfig
) => {
  const defineEndpoint = <TInput, TOutput, TEndpointError = TError>(
    endpointConfig: HttpEndpointConfig<TInput, TOutput, TEndpointError>
  ): EndpointDefinition<TInput, TOutput, TEndpointError> => {
    return {
      execute: async (data) => {
        const endpointUrl = await createRequestUrl(
          apiConfig,
          endpointConfig,
          data
        )

        let requestInit = await createRequestInit(endpointConfig, data)

        if (apiConfig.authenticationStrategy) {
          requestInit = await authenticateRequest(
            requestInit,
            endpointConfig,
            apiConfig.authenticationStrategy
          )
        }

        const response = await fetch(endpointUrl, {
          ...requestInit,
          method: endpointConfig.method,
        })

        const output = await endpointConfig.output(response)

        return output
      },
    }
  }

  const defineJsonEndpoint = <TInput, TOutput, TEndpointError = TError>(
    endpointConfig: JsonHttpEndpointConfig<TInput, TOutput, TEndpointError>
  ): EndpointDefinition<TInput, TOutput, TEndpointError> => {
    const baseEndpointConfig: Omit<
      HttpEndpointConfig<TInput, TOutput, TEndpointError>,
      'query' | 'body'
    > = {
      url: endpointConfig.url,
      method: endpointConfig.method,
      headers: endpointConfig.headers,

      requireAuthentication: endpointConfig.requireAuthentication,

      output: async (response) => {
        const responseData = await response.json()

        if (endpointConfig.output === 'naive') {
          if (!response.status.toString().startsWith('2')) {
            return {
              success: false,
              error: responseData as TEndpointError,
            }
          }

          return {
            success: true,
            output: responseData as TOutput,
          }
        }

        const transformedResult = await endpointConfig.output(
          responseData,
          response
        )
        return transformedResult
      },
    }

    const query =
      endpointConfig.query === 'input'
        ? (input: TInput) => input
        : endpointConfig.query

    const jsonBody = (data: any) => ({
      body: JSON.stringify(data),
      contentType: 'application/json',
    })

    const body = endpointConfig.body
      ? async (input: TInput) => {
          if (endpointConfig.body === 'input') {
            return jsonBody(input)
          }

          const transformedBody = await resolveStaticOrResolved(
            endpointConfig.body,
            input
          )

          return jsonBody(transformedBody)
        }
      : undefined

    return defineEndpoint<TInput, TOutput, TEndpointError>({
      ...baseEndpointConfig,
      query,
      body,
    })
  }

  return {
    config: apiConfig,

    defineEndpoint,
    defineJsonEndpoint,
  }
}
