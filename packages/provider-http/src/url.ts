import type { CreateHttpApiConfig, HttpEndpointConfig } from './types.js'
import qs from 'query-string'
import { resolveStaticOrResolved } from './utils/static-or-resolved.js'

export const createRequestUrl = async <TInput, TOutput, TError>(
  apiConfig: CreateHttpApiConfig,
  endpointConfig: HttpEndpointConfig<TInput, TOutput, TError>,
  data: TInput
): Promise<URL> => {
  const endpointUrl = new URL(endpointConfig.url, apiConfig.baseUrl)

  const queryParamsObject = endpointConfig.query
    ? await resolveStaticOrResolved(endpointConfig.query, data)
    : {}

  const queryValue = qs.stringify(queryParamsObject)
  endpointUrl.search = queryValue

  return endpointUrl
}
