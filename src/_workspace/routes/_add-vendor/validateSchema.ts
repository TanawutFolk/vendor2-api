import { z } from 'zod'

// --- Schemas ---

// Check Duplicate Schema (company_name + province + postal_code)
export const CheckDuplicateSchema = z.object({
  company_name: z.string().min(1, 'Company Name is required'),
  province: z.string().min(1, 'Province is required'),
  postal_code: z.string().min(1, 'Postal Code is required'),
})

export const CheckBlacklistSchema = z.object({
  company_name: z.string().min(1, 'Company Name is required'),
})

// Contact Schema
const ContactSchema = z.object({
  contact_name: z.string().min(1, 'Contact Name is required'),
  tel_phone: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  position: z.string().max(50).optional().or(z.literal('')),
})

// Product Schema
const ProductSchema = z.object({
  product_group_id: z.number().min(1, 'Product Group is required'),
  maker_name: z.string().min(1, 'Maker Name is required'),
  product_name: z.string().min(1, 'Product Name is required'),
  model_list: z.string().optional().or(z.literal('')),
})

// Create Vendor Schema (email removed from vendors table)
export const CreateVendorSchema = z.object({
  company_name: z.string().min(3, 'Company Name is required (min 3 chars)'),
  province: z.string().min(1, 'Province is required'),
  postal_code: z.string().min(1, 'Postal Code is required'),
  vendor_type_id: z.number().min(1, 'Vendor Type is required'),

  website: z.string().max(200).optional().or(z.literal('')),
  tel_center: z.string().max(30).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  note: z.string().optional().or(z.literal('')),

  CREATE_BY: z.string().min(1, 'Creator ID is required'),

  contacts: z.array(ContactSchema).optional(),
  products: z.array(ProductSchema).optional(),
})
