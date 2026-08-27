const DEFAULT_VENDOR_SYSTEM_ORIGIN = 'http://localhost:5173'

export const getVendorSystemOrigin = (origin?: string) =>
  String(origin || process.env.VENDOR_SYSTEM_ORIGIN || DEFAULT_VENDOR_SYSTEM_ORIGIN)
    .trim()
    .replace(/\/+$/, '')

export const buildVendorSystemUrl = (pathname: string, origin?: string) => {
  const normalizedPath = String(pathname || '')
    .trim()
    .replace(/^\/+/, '')

  return normalizedPath ? `${getVendorSystemOrigin(origin)}/${normalizedPath}` : getVendorSystemOrigin(origin)
}
