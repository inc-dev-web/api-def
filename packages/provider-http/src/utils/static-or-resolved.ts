export type StaticOrResolved<T, TPossibleParam = void> = T extends
  | string
  | object
  | number
  | boolean
  | null
  ? T | Promise<T> | ((param: TPossibleParam) => Promise<T> | T)
  : unknown

export type InferStaticOrResolvedValue<T> =
  T extends StaticOrResolved<infer Value, any> ? Value : unknown

export const resolveStaticOrResolved = async <T, TPossibleParam>(
  value: StaticOrResolved<T, TPossibleParam>,
  param: TPossibleParam
): Promise<InferStaticOrResolvedValue<typeof value>> => {
  if (typeof value === 'function') {
    const result = await value(param)
    return result
  }

  // If value is Promise<T> | T then `await value` will result in T being resolved
  const result = await value
  return result as InferStaticOrResolvedValue<typeof value>
}
