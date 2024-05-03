import type { EndpointExecuteResult } from '@api-def/core'
import type { StaticOrResolved } from './utils/static-or-resolved'

export type HttpAuthenticationStrategy = {
  getIsAuthenticated?: () => StaticOrResolved<boolean>
  authenticateRequest: StaticOrResolved<RequestInit, RequestInit>

  // Is used as a default value for `HttpEndpointConfig.requireAuthentication`
  defaultAuthenticationRequired: boolean
}

export type CreateHttpApiConfig = {
  baseUrl: string

  authenticationStrategy?: HttpAuthenticationStrategy
}

export type HttpEndpointConfig<TInput, TOutput, TError> = {
  url: StaticOrResolved<string, TInput>
  method: string

  headers?: StaticOrResolved<Record<string, string>> | undefined

  body?:
    | StaticOrResolved<
        { body: BodyInit | undefined; contentType?: string },
        TInput
      >
    | undefined
  query?: StaticOrResolved<Record<string, any>, TInput> | undefined
  output: (response: Response) => EndpointExecuteResult<TOutput, TError>

  requireAuthentication?: boolean | undefined
}

export type JsonHttpEndpointConfig<TInput, TOutput, TError> = {
  url: StaticOrResolved<string, TInput>
  method: string

  headers?: StaticOrResolved<Record<string, string>>

  body?: StaticOrResolved<any, TInput>
  query?: StaticOrResolved<Record<string, any>, TInput>
  output:
    | ((
        data: unknown,
        response: Response
      ) => EndpointExecuteResult<TOutput, TError>)
    | 'naive'

  requireAuthentication?: boolean
}
