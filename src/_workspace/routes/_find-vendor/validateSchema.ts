import { z } from 'zod'

// --- Common Schemas ---

// SearchFilter item schema
const SearchFilterSchema = z.object({
  id: z.string(),
  value: z
    .union([z.string(), z.number(), z.boolean(), z.array(z.any()), z.null()])
    .optional()
    .nullable(),
})

// ColumnFilter item schema
const ColumnFilterSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.number(), z.array(z.any())]),
})

// Order item schema
const OrderSchema = z.object({
  id: z.string(),
  desc: z.boolean().optional(),
})

// --- Search Schema ---
export const SearchVendorSchema = z.object({
  Start: z.number().int().min(0).optional().default(0),
  Limit: z.number().int().min(1).max(1000000).optional().default(20),
  Order: z.array(OrderSchema).optional().default([]),
  SearchFilters: z.array(SearchFilterSchema).optional().default([]),
  ColumnFilters: z.array(ColumnFilterSchema).optional().default([]),
})

// --- Get By ID Schema ---
export const GetVendorByIdSchema = z
  .object({
    vendor_id: z.union([
      z.number().int().positive('Vendor ID must be a positive integer'),
      z.string().regex(/^\d+$/, 'Vendor ID must be a numeric string'),
    ]).optional(),
    VENDORS_ID: z.union([
      z.number().int().positive('Vendor ID must be a positive integer'),
      z.string().regex(/^\d+$/, 'Vendor ID must be a numeric string'),
    ]).optional(),
  })
  .refine(data => data.vendor_id !== undefined || data.VENDORS_ID !== undefined, {
    message: 'Vendor ID is required',
    path: ['VENDORS_ID'],
  })

export const VendorDetailsSchema = GetVendorByIdSchema

// --- Update Vendor Schema ---
export const UpdateVendorSchema = z.object({
  vendor_id: z.union([z.number().int().positive('Vendor ID is required'), z.string().regex(/^\d+$/, 'Vendor ID must be numeric')]),

  // Vendor fields (optional - only update if provided)
  company_name: z.string().min(3, 'Company Name must be at least 3 characters').optional(),
  vendor_type_id: z.number().int().positive().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  website: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  tel_center: z.string().max(30).optional(),

  // Vendor Contact fields (optional)
  vendor_contact_id: z.number().int().positive().optional(),
  contact_name: z.string().optional(),
  tel_phone: z.string().max(30).optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  position: z.string().max(50).optional(),

  // Vendor Product fields (optional)
  vendor_product_id: z.number().int().positive().optional(),
  product_group_id: z.number().int().positive().optional(),
  maker_name: z.string().optional(),
  product_name: z.string().optional(),
  model_list: z.string().optional(),

  // Audit field
  UPDATE_BY: z.string().min(1, 'UPDATE_BY is required'),
})

const ContactBatchSchema = z.object({
  vendor_contact_id: z.number().int().positive().optional(),
  VENDOR_CONTACTS_ID: z.number().int().positive().optional(),
  contact_name: z.string().optional().default(''),
  CONTACT_NAME: z.string().optional(),
  tel_phone: z.string().max(30).optional().nullable().default(''),
  TEL_PHONE: z.string().max(30).optional().nullable(),
  email: z.string().email('Invalid email format').optional().nullable().or(z.literal('')),
  EMAIL: z.string().email('Invalid email format').optional().nullable().or(z.literal('')),
  position: z.string().max(50).optional().nullable().default(''),
  POSITION: z.string().max(50).optional().nullable(),
})

const ProductBatchSchema = z.object({
  vendor_product_id: z.number().int().positive().optional(),
  VENDOR_PRODUCTS_ID: z.number().int().positive().optional(),
  product_group_id: z.number().int().positive().optional().nullable(),
  MASTER_PRODUCT_GROUPS_ID: z.number().int().positive().optional().nullable(),
  maker_name: z.string().optional().nullable().default(''),
  MAKER_NAME: z.string().optional().nullable(),
  product_name: z.string().optional().default(''),
  PRODUCT_NAME: z.string().optional(),
  model_list: z.string().optional().nullable().default(''),
  MODEL_LIST: z.string().optional().nullable(),
})

export const UpdateVendorComprehensiveSchema = z.object({
  vendor_id: z.union([z.number().int().positive('Vendor ID is required'), z.string().regex(/^\d+$/, 'Vendor ID must be numeric')]).optional(),
  VENDORS_ID: z.union([z.number().int().positive('Vendor ID is required'), z.string().regex(/^\d+$/, 'Vendor ID must be numeric')]).optional(),
  vendor: z.object({
    company_name: z.string().min(3, 'Company Name must be at least 3 characters').optional(),
    COMPANY_NAME: z.string().min(3, 'Company Name must be at least 3 characters').optional(),
    vendor_type_id: z.number().int().positive().optional().nullable(),
    MASTER_VENDOR_TYPES_ID: z.number().int().positive().optional().nullable(),
    vendor_region: z.enum(['Local', 'Oversea']).optional().nullable(),
    VENDOR_REGION: z.enum(['Local', 'Oversea']).optional().nullable(),
    province: z.string().optional().nullable(),
    PROVINCE: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
    POSTAL_CODE: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    COUNTRY: z.string().optional().nullable(),
    website: z.string().max(200).optional().nullable(),
    WEBSITE: z.string().max(200).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    ADDRESS: z.string().max(500).optional().nullable(),
    tel_center: z.string().max(30).optional().nullable(),
    TEL_CENTER: z.string().max(30).optional().nullable(),
    emailmain: z.string().email('Invalid email format').optional().nullable().or(z.literal('')),
    EMAILMAIN: z.string().email('Invalid email format').optional().nullable().or(z.literal('')),
    INUSE: z.number().int().optional().nullable(),
  }).optional(),
  VENDOR: z.object({
    company_name: z.string().min(3, 'Company Name must be at least 3 characters').optional(),
    COMPANY_NAME: z.string().min(3, 'Company Name must be at least 3 characters').optional(),
    vendor_type_id: z.number().int().positive().optional().nullable(),
    MASTER_VENDOR_TYPES_ID: z.number().int().positive().optional().nullable(),
    vendor_region: z.enum(['Local', 'Oversea']).optional().nullable(),
    VENDOR_REGION: z.enum(['Local', 'Oversea']).optional().nullable(),
    province: z.string().optional().nullable(),
    PROVINCE: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
    POSTAL_CODE: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    COUNTRY: z.string().optional().nullable(),
    website: z.string().max(200).optional().nullable(),
    WEBSITE: z.string().max(200).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    ADDRESS: z.string().max(500).optional().nullable(),
    tel_center: z.string().max(30).optional().nullable(),
    TEL_CENTER: z.string().max(30).optional().nullable(),
    emailmain: z.string().email('Invalid email format').optional().nullable().or(z.literal('')),
    EMAILMAIN: z.string().email('Invalid email format').optional().nullable().or(z.literal('')),
    INUSE: z.number().int().optional().nullable(),
  }).optional(),
  contacts: z.array(ContactBatchSchema).optional().default([]),
  CONTACTS: z.array(ContactBatchSchema).optional(),
  products: z.array(ProductBatchSchema).optional().default([]),
  PRODUCTS: z.array(ProductBatchSchema).optional(),
  deleted_contact_ids: z.array(z.number().int().positive()).optional().default([]),
  DELETED_CONTACT_IDS: z.array(z.number().int().positive()).optional(),
  deleted_product_ids: z.array(z.number().int().positive()).optional().default([]),
  DELETED_PRODUCT_IDS: z.array(z.number().int().positive()).optional(),
  vendor_changed: z.boolean().optional().default(true),
  VENDOR_CHANGED: z.boolean().optional(),
  UPDATE_BY: z.string().min(1, 'UPDATE_BY is required'),
}).refine(data => data.vendor_id !== undefined || data.VENDORS_ID !== undefined, {
  message: 'Vendor ID is required',
  path: ['VENDORS_ID'],
}).refine(data => Boolean(data.vendor || data.VENDOR), {
  message: 'Vendor payload is required',
  path: ['VENDOR'],
})

export const DeleteVendorSchema = z.object({
  vendor_id: z.union([z.number().int().positive('Vendor ID is required'), z.string().regex(/^\d+$/, 'Vendor ID must be numeric')]),
  UPDATE_BY: z.string().min(1, 'UPDATE_BY is required'),
})

// --- Export Schema ---
export const ExportVendorSchema = z.object({
  TYPE: z
    .enum(['currentPage', 'AllPage'], {
      errorMap: () => ({ message: 'TYPE must be either "currentPage" or "AllPage"' }),
    })
    .optional()
    .default('AllPage'),
  DataForFetch: z
    .object({
      Start: z.number().int().min(0).optional().default(0),
      Limit: z.number().int().min(1).max(1000000).optional().default(20),
      Order: z.array(OrderSchema).optional().default([]),
      SearchFilters: z.array(SearchFilterSchema).optional().default([]),
      ColumnFilters: z.array(ColumnFilterSchema).optional().default([]),
    })
    .optional()
    .default({}),
})
