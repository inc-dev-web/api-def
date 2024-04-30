import type { CreateHttpApiConfig, HttpEndpointConfig } from './types.js'
import { attachBaseUrl } from './utils/attach-base-url.js'
import { resolveStaticOrResolved } from './utils/static-or-resolved.js'

import qs from 'query-string'

export const createRequestUrl = async <TInput, TOutput, TError>(
  apiConfig: Pick<CreateHttpApiConfig, 'baseUrl'>,
  endpointConfig: Pick<
    HttpEndpointConfig<TInput, TOutput, TError>,
    'query' | 'url'
  >,
  data: TInput
): Promise<string> => {
  const endpointUrl = attachBaseUrl(endpointConfig.url, apiConfig.baseUrl)

  const queryParamsObject = endpointConfig.query
    ? await resolveStaticOrResolved(endpointConfig.query, data)
    : {}

  const queryValue = qs.stringify(queryParamsObject)

  if (queryValue.length === 0) {
    return endpointUrl
  }

  return `${endpointUrl}?${queryValue}`
}
