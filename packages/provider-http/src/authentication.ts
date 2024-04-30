import type { HttpAuthenticationStrategy, HttpEndpointConfig } from './types'
import { resolveStaticOrResolved } from './utils/static-or-resolved'

export const authenticateRequest = async <TInput, TOutput, TError>(
  request: RequestInit,
  endpointConfig: HttpEndpointConfig<TInput, TOutput, TError>,
  strategy: HttpAuthenticationStrategy
): Promise<RequestInit> => {
  const authenticationRequired =
    endpointConfig.requireAuthentication ?? strategy.authenticateRequest

  if (!authenticationRequired) {
    return request
  }

  const isAuthenticated = strategy.getIsAuthenticated
    ? await strategy.getIsAuthenticated()
    : true

  if (!isAuthenticated) {
    // TODO: make a better fancy error for not authenticated state
    throw new Error('Not Authenticated')
  }

  return await resolveStaticOrResolved(strategy.authenticateRequest, request)
}
