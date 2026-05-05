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
export const GetVendorByIdSchema = z.object({
  vendor_id: z.union([z.number().int().positive('Vendor ID must be a positive integer'), z.string().regex(/^\d+$/, 'Vendor ID must be a numeric string')]),
})

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
