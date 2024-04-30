import type { HttpEndpointConfig } from './types'
import { resolveStaticOrResolved } from './utils/static-or-resolved'

export const createRequestInit = async <TInput, TOutput, TError>(
  // Pick is used for narrowing types for better testing
  endpointConfig: Pick<HttpEndpointConfig<TInput, TOutput, TError>, 'body'>,
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
