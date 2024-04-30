export const attachBaseUrl = (url: string, baseUrl: string): string => {
  if (baseUrl.length === 0) {
    return url
  }

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
  const normalizedUrl = url.startsWith('/') ? url.slice(1) : url

  return normalizedBaseUrl + normalizedUrl
}
