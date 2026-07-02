import { z } from 'zod'

// --- Schemas ---

const nonEmptyString = (fieldName: string) => z.string().min(1, `${fieldName} is required`)
const optionalString = () => z.string().optional().or(z.literal(''))
const getPayloadString = (data: Record<string, unknown>, lowerKey: string, upperKey: string) => String(data[upperKey] ?? data[lowerKey] ?? '').trim()

const validateVendorLocation = (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
  const companyName = getPayloadString(data, 'company_name', 'COMPANY_NAME')
  const vendorRegion = getPayloadString(data, 'vendor_region', 'VENDOR_REGION') || 'Local'
  const isOversea = vendorRegion.toLowerCase() === 'oversea'

  if (!companyName) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['COMPANY_NAME'], message: 'Company Name is required' })
  }

  if (isOversea) {
    if (!getPayloadString(data, 'country', 'COUNTRY')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['COUNTRY'], message: 'Country is required' })
    }
    return
  }

  if (!getPayloadString(data, 'province', 'PROVINCE')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['PROVINCE'], message: 'Province is required' })
  }
  if (!getPayloadString(data, 'postal_code', 'POSTAL_CODE')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['POSTAL_CODE'], message: 'Postal Code is required' })
  }
}

// Check Duplicate Schema (Local: company + province + postal code, Oversea: company + country)
export const CheckDuplicateSchema = z.object({
  company_name: optionalString(),
  COMPANY_NAME: optionalString(),
  vendor_region: optionalString(),
  VENDOR_REGION: optionalString(),
  province: optionalString(),
  PROVINCE: optionalString(),
  postal_code: optionalString(),
  POSTAL_CODE: optionalString(),
  country: optionalString(),
  COUNTRY: optionalString(),
}).superRefine(validateVendorLocation)

export const CheckBlacklistSchema = z.object({
  company_name: nonEmptyString('Company Name').optional(),
  COMPANY_NAME: nonEmptyString('Company Name').optional(),
})

// Contact Schema
const ContactSchema = z.object({
  contact_name: nonEmptyString('Contact Name').optional(),
  CONTACT_NAME: nonEmptyString('Contact Name').optional(),
  tel_phone: z.string().max(30).optional().or(z.literal('')),
  TEL_PHONE: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  EMAIL: z.string().email().optional().or(z.literal('')),
  position: z.string().max(50).optional().or(z.literal('')),
  POSITION: z.string().max(50).optional().or(z.literal('')),
})

// Product Schema
const optionalProductGroupId = z.number().int().nonnegative().optional().nullable()

const ProductSchema = z.object({
  product_group_id: optionalProductGroupId,
  MASTER_PRODUCT_GROUPS_ID: optionalProductGroupId,
  maker_name: nonEmptyString('Maker Name').optional(),
  MAKER_NAME: nonEmptyString('Maker Name').optional(),
  product_name: nonEmptyString('Product Name').optional(),
  PRODUCT_NAME: nonEmptyString('Product Name').optional(),
  model_list: optionalString(),
  MODEL_LIST: optionalString(),
})

// Create Vendor Schema (email removed from vendors table)
export const CreateVendorSchema = z.object({
  company_name: z.string().min(3, 'Company Name is required (min 3 chars)').optional(),
  COMPANY_NAME: z.string().min(3, 'Company Name is required (min 3 chars)').optional(),
  province: optionalString(),
  PROVINCE: optionalString(),
  postal_code: optionalString(),
  POSTAL_CODE: optionalString(),
  country: optionalString(),
  COUNTRY: optionalString(),
  vendor_type_id: z.number().min(1, 'Vendor Type is required').optional(),
  MASTER_VENDOR_TYPES_ID: z.number().min(1, 'Vendor Type is required').optional(),

  vendor_region: optionalString(),
  VENDOR_REGION: optionalString(),
  website: z.string().max(200).optional().or(z.literal('')),
  WEBSITE: z.string().max(200).optional().or(z.literal('')),
  tel_center: z.string().max(30).optional().or(z.literal('')),
  TEL_CENTER: z.string().max(30).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  ADDRESS: z.string().max(500).optional().or(z.literal('')),
  emailmain: optionalString(),
  EMAILMAIN: optionalString(),
  note: optionalString(),
  NOTE: optionalString(),

  CREATE_BY: nonEmptyString('Creator ID').optional(),
  create_by: nonEmptyString('Creator ID').optional(),

  contacts: z.array(ContactSchema).optional(),
  CONTACTS: z.array(ContactSchema).optional(),
  products: z.array(ProductSchema).optional(),
  PRODUCTS: z.array(ProductSchema).optional(),
}).superRefine(validateVendorLocation)
