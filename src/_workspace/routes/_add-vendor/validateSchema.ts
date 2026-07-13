import { z } from 'zod'

// --- Schemas ---
// Every field is declared twice (lowercase + UPPERCASE) because callers send either
// casing. Field-level rules only bound the value when present; hard "required"
// rules live in the superRefines below, which look at both casings at once.
// Constraints must stay in sync with the frontend schema:
// vendor2-app/src/_workspace/pages/_add-vendor/validateSchema.ts

const nonEmptyString = (fieldName: string) => z.string().min(1, `${fieldName} is required`)
const optionalString = () => z.string().optional().or(z.literal(''))

// Optional at field level, but bounded when non-empty (empty string is allowed here
// so the dual-case pattern works; required-ness is enforced in superRefine).
const boundedString = (fieldName: string, max: number, min = 0) => {
  let schema = z.string().max(max, `${fieldName} must be at most ${max} characters`)
  if (min > 0) {
    schema = schema.min(min, `${fieldName} must be at least ${min} characters`)
  }
  return schema.optional().or(z.literal(''))
}

const optionalEmail = (fieldName: string, max: number) =>
  z.string().email(`${fieldName} must be a valid email`).max(max, `${fieldName} must be at most ${max} characters`).optional().or(z.literal(''))

const getPayloadString = (data: Record<string, unknown>, lowerKey: string, upperKey: string) => String(data[upperKey] ?? data[lowerKey] ?? '').trim()

const validateVendorLocation = (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
  const companyName = getPayloadString(data, 'company_name', 'COMPANY_NAME')
  const vendorRegion = getPayloadString(data, 'vendor_region', 'VENDOR_REGION') || 'Local'
  const isOversea = vendorRegion.toLowerCase() === 'oversea'

  if (!companyName) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['COMPANY_NAME'], message: 'Company Name is required' })
  }

  if (!['local', 'oversea'].includes(vendorRegion.toLowerCase())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['VENDOR_REGION'], message: 'Vendor Region must be Local or Oversea' })
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

// Create-only required fields, on top of the location rules shared with check-duplicate.
const validateCreateVendor = (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
  validateVendorLocation(data, ctx)

  if (!getPayloadString(data, 'tel_center', 'TEL_CENTER')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['TEL_CENTER'], message: 'Tel Center is required' })
  }
  if (!getPayloadString(data, 'address', 'ADDRESS')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['ADDRESS'], message: 'Address is required' })
  }

  const vendorTypeId = Number(data['MASTER_VENDOR_TYPES_ID'] ?? data['vendor_type_id'] ?? 0)
  if (!Number.isFinite(vendorTypeId) || vendorTypeId < 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['MASTER_VENDOR_TYPES_ID'], message: 'Vendor Type is required' })
  }

  if (!getPayloadString(data, 'create_by', 'CREATE_BY')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['CREATE_BY'], message: 'Creator ID is required' })
  }
}

// Check Duplicate Schema (Local: company + province + postal code, Oversea: company + country)
export const CheckDuplicateSchema = z.object({
  company_name: boundedString('Company Name', 200, 3),
  COMPANY_NAME: boundedString('Company Name', 200, 3),
  vendor_region: optionalString(),
  VENDOR_REGION: optionalString(),
  province: boundedString('Province', 50),
  PROVINCE: boundedString('Province', 50),
  postal_code: boundedString('Postal Code', 10),
  POSTAL_CODE: boundedString('Postal Code', 10),
  country: boundedString('Country', 100),
  COUNTRY: boundedString('Country', 100),
}).superRefine(validateVendorLocation)

export const CheckBlacklistSchema = z.object({
  company_name: optionalString(),
  COMPANY_NAME: optionalString(),
}).superRefine((data, ctx) => {
  if (!getPayloadString(data, 'company_name', 'COMPANY_NAME')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['COMPANY_NAME'], message: 'Company Name is required' })
  }
})

// Contact Schema (contact_name + email required; tel_phone + position optional, same bounds as the frontend)
const ContactSchema = z.object({
  contact_name: boundedString('Contact Name', 100, 2),
  CONTACT_NAME: boundedString('Contact Name', 100, 2),
  tel_phone: boundedString('Phone', 30),
  TEL_PHONE: boundedString('Phone', 30),
  email: optionalEmail('Email', 100),
  EMAIL: optionalEmail('Email', 100),
  position: boundedString('Position', 50),
  POSITION: boundedString('Position', 50),
}).superRefine((contact, ctx) => {
  if (!getPayloadString(contact, 'contact_name', 'CONTACT_NAME')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['CONTACT_NAME'], message: 'Contact Name is required' })
  }
  if (!getPayloadString(contact, 'email', 'EMAIL')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['EMAIL'], message: 'Email is required' })
  }
})

// Product Schema (maker_name + product_name required; product_group + model_list optional)
const optionalProductGroupId = z.number().int().nonnegative().optional().nullable()

const ProductSchema = z.object({
  product_group_id: optionalProductGroupId,
  MASTER_PRODUCT_GROUPS_ID: optionalProductGroupId,
  maker_name: boundedString('Maker Name', 100, 2),
  MAKER_NAME: boundedString('Maker Name', 100, 2),
  product_name: boundedString('Product Name', 150, 2),
  PRODUCT_NAME: boundedString('Product Name', 150, 2),
  model_list: optionalString(),
  MODEL_LIST: optionalString(),
}).superRefine((product, ctx) => {
  if (!getPayloadString(product, 'maker_name', 'MAKER_NAME')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['MAKER_NAME'], message: 'Maker Name is required' })
  }
  if (!getPayloadString(product, 'product_name', 'PRODUCT_NAME')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['PRODUCT_NAME'], message: 'Product Name is required' })
  }
})

// Create Vendor Schema (email removed from vendors table)
export const CreateVendorSchema = z.object({
  company_name: boundedString('Company Name', 200, 3),
  COMPANY_NAME: boundedString('Company Name', 200, 3),
  province: boundedString('Province', 50),
  PROVINCE: boundedString('Province', 50),
  postal_code: boundedString('Postal Code', 10),
  POSTAL_CODE: boundedString('Postal Code', 10),
  country: boundedString('Country', 100),
  COUNTRY: boundedString('Country', 100),
  vendor_type_id: z.number().int().min(1, 'Vendor Type is required').optional(),
  MASTER_VENDOR_TYPES_ID: z.number().int().min(1, 'Vendor Type is required').optional(),

  vendor_region: optionalString(),
  VENDOR_REGION: optionalString(),
  website: boundedString('Website', 200),
  WEBSITE: boundedString('Website', 200),
  tel_center: boundedString('Tel Center', 30),
  TEL_CENTER: boundedString('Tel Center', 30),
  address: boundedString('Address', 500, 5),
  ADDRESS: boundedString('Address', 500, 5),
  emailmain: optionalEmail('Email (Main)', 100),
  EMAILMAIN: optionalEmail('Email (Main)', 100),
  note: optionalString(),
  NOTE: optionalString(),

  CREATE_BY: nonEmptyString('Creator ID').optional(),
  create_by: nonEmptyString('Creator ID').optional(),

  contacts: z.array(ContactSchema).optional(),
  CONTACTS: z.array(ContactSchema).optional(),
  products: z.array(ProductSchema).optional(),
  PRODUCTS: z.array(ProductSchema).optional(),
}).superRefine(validateCreateVendor)
