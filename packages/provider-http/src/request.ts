import type { HttpEndpointConfig } from './types.js'
import { resolveStaticOrResolved } from './utils/static-or-resolved.js'

export const createRequestInit = async <TInput, TOutput, TError>(
  endpointConfig: HttpEndpointConfig<TInput, TOutput, TError>,
  data: TInput
): Promise<RequestInit> => {
  const headers: Record<string, string> = {}

  const createdBody = endpointConfig.body
    ? await resolveStaticOrResolved(endpointConfig.body, data)
    : undefined
  const body = createdBody?.body ?? null

  if (createdBody?.contentType) {
    headers['Content-Type'] = createdBody.contentType
  }

  return {
    headers,
    body,
  }
}
