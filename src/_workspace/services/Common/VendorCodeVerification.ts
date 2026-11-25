import { MySQLExecute, OracleExecute } from '@businessData/dbExecute'
import { RowDataPacket } from 'mysql2'
import { VendorCodeSQL } from '../../sql/common/VendorCodeSQL'
import { getVendorCodePrefix, isVendorCodeComplete } from '../_request-register/RegisterRequestWorkflowHelper'

export const PRONES_UNAVAILABLE_MESSAGE = 'Cannot verify Vendor Code with PRONES right now. Please try again later.'

// Only the Vendor Code is checked; the vendor name is not compared. PRONES_VENDOR_NAME is returned for display only.
export interface VendorCodeVerification {
  VENDOR_CODE: string
  PRONES_VENDOR_NAME: string
}

const findPronesVendor = async (vendorCode: string) => {
  try {
    const result = await OracleExecute.searchOracle(VendorCodeSQL.getPronesVendorByCode(), 'PRONES', {
      VENDOR_CODE: vendorCode,
      VENDOR_CODE_LIKE: vendorCode + '%',
    })

    return ((result.rows || []) as Record<string, unknown>[])[0] || null
  } catch (error: any) {
    // PRONES is the source of truth Account keys first; if it cannot be reached the code stays unverified, so block.
    console.error('[verifyVendorCode] PRONES lookup failed:', error?.message)
    throw new Error(PRONES_UNAVAILABLE_MESSAGE)
  }
}

// Account keys the vendor into PRONES before entering its Vendor Code here, so the code must:
// 1) match the Local/Oversea prefix, 2) not belong to another vendor or in-progress request, 3) exist in PRONES.
export const verifyVendorCode = async (dataItem: { REQUEST_REGISTER_VENDOR_ID: unknown; VENDOR_CODE: unknown }): Promise<VendorCodeVerification> => {
  const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID) || 0
  const vendorCode = String(dataItem.VENDOR_CODE ?? '')
    .trim()
    .toUpperCase()
  if (!requestId) throw new Error('Missing request_id')

  const requestVendorRows = (await MySQLExecute.search(VendorCodeSQL.getRequestVendor({ REQUEST_REGISTER_VENDOR_ID: requestId }))) as RowDataPacket[]
  const requestVendor = requestVendorRows[0]
  if (!requestVendor) throw new Error('Vendor is not linked to this registration request.')

  const vendorRegion = String(requestVendor.VENDOR_REGION ?? '').trim()
  if (!vendorRegion) throw new Error('Vendor region was not found')

  const isOversea = vendorRegion.toLowerCase() === 'oversea'
  if (!isVendorCodeComplete(vendorCode, isOversea)) {
    throw new Error(`Vendor Code must start with ${getVendorCodePrefix(isOversea)} followed by the code (letters and numbers only).`)
  }

  const usageRows = (await MySQLExecute.search(
    VendorCodeSQL.getVendorCodeUsage({
      VENDOR_CODE: vendorCode,
      VENDORS_ID: requestVendor.VENDORS_ID,
      REQUEST_REGISTER_VENDOR_ID: requestId,
    }),
  )) as RowDataPacket[]
  const usage = usageRows[0]
  if (usage) {
    const owner = String(usage.COMPANY_NAME ?? '').trim() || 'another vendor'
    throw new Error(
      usage.USAGE_SOURCE === 'REQUEST'
        ? `Vendor Code ${vendorCode} is already proposed for ${owner} in request ${usage.REQUEST_NUMBER}.`
        : `Vendor Code ${vendorCode} is already used by ${owner}.`,
    )
  }

  const pronesVendor = await findPronesVendor(vendorCode)
  if (!pronesVendor) {
    throw new Error(`Vendor Code ${vendorCode} was not found in PRONES. Please register the vendor in PRONES first.`)
  }

  return {
    VENDOR_CODE: vendorCode,
    PRONES_VENDOR_NAME: String(pronesVendor.VENDOR_NAME ?? '').trim(),
  }
}
