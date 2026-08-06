const parseJsonArray = (value: unknown): any[] => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value !== 'string' || value.trim() === '') return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

export type VendorDetailDto = {
  vendor_id: number
  fft_vendor_code?: string | null
  fft_status?: string | null
  vendor_status_id?: number
  vendor_status_code?: string
  vendor_status_label?: string
  reject_reason?: string | null
  company_name: string
  vendor_type_id?: number | null
  vendor_type_name: string
  vendor_region?: 'Local' | 'Oversea' | null
  province: string
  postal_code: string
  country?: string | null
  website: string
  address: string
  tel_center: string
  emailmain?: string | null
  contacts: Array<Record<string, unknown>>
  products: Array<Record<string, unknown>>
  CREATE_BY?: string
  UPDATE_BY?: string
  CREATE_DATE?: string
  UPDATE_DATE?: string
  INUSE?: number
}

export const mapVendorDetailRow = (row: any): VendorDetailDto => ({
  vendor_id: Number(row?.VENDORS_ID || 0),
  fft_vendor_code: row?.FFT_VENDOR_CODE ?? null,
  fft_status: row?.FFT_STATUS ?? null,
  vendor_status_id: Number(row?.M_VENDOR_STATUS_ID ?? row?.FFT_STATUS ?? 0),
  vendor_status_code: row?.VENDOR_STATUS_CODE,
  vendor_status_label: row?.VENDOR_STATUS_LABEL,
  reject_reason: row?.REJECT_REASON ?? null,
  company_name: row?.COMPANY_NAME ?? '',
  vendor_type_id: row?.MASTER_VENDOR_TYPES_ID ?? null,
  vendor_type_name: row?.VENDOR_TYPE_NAME ?? '',
  vendor_region: row?.VENDOR_REGION ?? null,
  province: row?.PROVINCE ?? '',
  postal_code: row?.POSTAL_CODE ?? '',
  country: row?.COUNTRY ?? '',
  website: row?.WEBSITE ?? '',
  address: row?.ADDRESS ?? '',
  tel_center: row?.TEL_CENTER ?? '',
  emailmain: row?.EMAILMAIN ?? '',
  contacts: parseJsonArray(row?.CONTACTS_JSON).map(contact => ({
    vendor_contact_id: contact?.VENDOR_CONTACT_ID ?? contact?.VENDOR_CONTACTS_ID,
    contact_name: contact?.CONTACT_NAME ?? '',
    position: contact?.POSITION ?? '',
    tel_phone: contact?.TEL_PHONE ?? '',
    email: contact?.EMAIL ?? '',
    CREATE_BY: contact?.CREATE_BY ?? contact?.CONTACT_CREATE_BY ?? '',
    UPDATE_BY: contact?.UPDATE_BY ?? contact?.CONTACT_UPDATE_BY ?? '',
    CREATE_DATE: contact?.CREATE_DATE ?? contact?.CONTACT_CREATE_DATE ?? '',
    UPDATE_DATE: contact?.UPDATE_DATE ?? contact?.CONTACT_UPDATE_DATE ?? '',
  })),
  products: parseJsonArray(row?.PRODUCTS_JSON).map(product => ({
    vendor_product_id: product?.VENDOR_PRODUCT_ID ?? product?.VENDOR_PRODUCTS_ID,
    product_group_id: product?.PRODUCT_GROUP_ID ?? product?.MASTER_PRODUCT_GROUPS_ID,
    group_name: product?.GROUP_NAME ?? '',
    maker_name: product?.MAKER_NAME ?? '',
    product_name: product?.PRODUCT_NAME ?? '',
    model_list: product?.MODEL_LIST ?? '',
    CREATE_BY: product?.CREATE_BY ?? product?.PRODUCT_CREATE_BY ?? '',
    UPDATE_BY: product?.UPDATE_BY ?? product?.PRODUCT_UPDATE_BY ?? '',
    CREATE_DATE: product?.CREATE_DATE ?? product?.PRODUCT_CREATE_DATE ?? '',
    UPDATE_DATE: product?.UPDATE_DATE ?? product?.PRODUCT_UPDATE_DATE ?? '',
  })),
  CREATE_BY: row?.CREATE_BY ?? '',
  UPDATE_BY: row?.UPDATE_BY ?? '',
  CREATE_DATE: row?.CREATE_DATE ?? '',
  UPDATE_DATE: row?.UPDATE_DATE ?? '',
  INUSE: Number(row?.INUSE ?? 1),
})
