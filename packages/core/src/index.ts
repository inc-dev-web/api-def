type RawEndpointExecuteResult<TOutput, TError> =
  | {
      success: true
      output: TOutput
    }
  | {
      success: false
      error: TError
    }

export type EndpointExecuteResult<TOutput, TError> = Promise<
  RawEndpointExecuteResult<TOutput, TError>
>

export type EndpointDefinition<TInput, TOutput, TError> = {
  execute: (data: TInput) => EndpointExecuteResult<TOutput, TError>
}
