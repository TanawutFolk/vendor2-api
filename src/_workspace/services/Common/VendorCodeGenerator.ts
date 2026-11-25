import { MySQLExecute, OracleExecute } from '@businessData/dbExecute'
import { RowDataPacket } from 'mysql2'
import { VendorCodeSQL } from '../../sql/common/VendorCodeSQL'
import { getVendorCodePrefix } from '../_request-register/RegisterRequestWorkflowHelper'
import { PRONES_UNAVAILABLE_MESSAGE } from './VendorCodeVerification'

// Account's Vendor Code rule (10 characters):
//   5-digit prefix (20030 Local / 20031 Oversea) + first 3 letters of the vendor name + 2-digit running number.
// The running number counts per prefix + FIRST letter (W-TECH after WORLD INFINITY 20030WOR64 gets 20030WTE65).
// When a letter passes 99, Account switches to 2 letters + 3 digits and keeps counting (20030TO221 -> 20030TO222).

export interface ExistingVendorCode {
  code: string
  enteredAt?: Date | string | null
}

export interface GeneratedVendorCode {
  VENDOR_CODE: string
  LAST_VENDOR_CODE: string
}

type ParsedCode = { code: string; letters: 2 | 3; number: number; enteredAt: number }

const MAX_RUNNING_NUMBER = 999

// "MR.WANCHAI SIRIJINNO" -> "WANCHAISIRIJINNO"; "W-TECH (THAILAND)" -> "WTECHTHAILAND". Salutations need the dot
// so names such as "MS ELECTRIC" or "DRAGON" keep their letters.
export const getVendorNameLetters = (companyName: unknown) =>
  String(companyName ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/^\s*(MRS|MR|MISS|MS|DR)\.\s*/, '')
    .replace(/[^A-Z]/g, '')

const toTime = (value: ExistingVendorCode['enteredAt']) => {
  const time = value ? new Date(value).getTime() : NaN
  return Number.isNaN(time) ? 0 : time
}

const parseCode = (item: ExistingVendorCode, codeStart: string): ParsedCode | null => {
  const code = String(item.code ?? '')
    .trim()
    .toUpperCase()
  if (!code.startsWith(codeStart)) return null

  const rest = code.slice(codeStart.length - 1)
  const threeLetters = rest.match(/^[A-Z]{3}(\d{2})$/)
  if (threeLetters) return { code, letters: 3, number: Number(threeLetters[1]), enteredAt: toTime(item.enteredAt) }
  const twoLetters = rest.match(/^[A-Z]{2}(\d{3})$/)
  if (twoLetters) return { code, letters: 2, number: Number(twoLetters[1]), enteredAt: toTime(item.enteredAt) }
  return null
}

export const generateNextVendorCode = (input: { prefix: string; companyName: unknown; existingCodes: ExistingVendorCode[] }): GeneratedVendorCode => {
  const nameLetters = getVendorNameLetters(input.companyName)
  if (nameLetters.length < 3) {
    throw new Error('Company name needs at least 3 English letters to generate a Vendor Code. Please enter the Vendor Code manually.')
  }

  const codeStart = input.prefix + nameLetters[0]
  const codes = input.existingCodes.map((item) => parseCode(item, codeStart)).filter((item): item is ParsedCode => item !== null)
  const usedNumbers = new Set(codes.map((item) => item.number))
  const maxNumber = (letters: 2 | 3) => Math.max(0, ...codes.filter((item) => item.letters === letters).map((item) => item.number))

  // Continue the format of the code Account created most recently, so an old typo such as 20030KO153
  // does not push K (still at 20030KON93) into 3 digits.
  const latest = [...codes].sort((a, b) => b.enteredAt - a.enteredAt || b.number - a.number)[0]
  let letters: 2 | 3 = latest?.letters ?? 3
  let next = letters === 3 ? maxNumber(3) + 1 : Math.max(99, maxNumber(2)) + 1
  while (usedNumbers.has(next)) next++

  if (letters === 3 && next > 99) {
    letters = 2
    next = Math.max(99, maxNumber(2)) + 1
    while (usedNumbers.has(next)) next++
  }
  if (next > MAX_RUNNING_NUMBER) {
    throw new Error(`Running numbers for ${codeStart} are used up. Please enter the Vendor Code manually.`)
  }

  return {
    VENDOR_CODE: codeStart + nameLetters.slice(1, letters) + String(next).padStart(letters === 3 ? 2 : 3, '0'),
    LAST_VENDOR_CODE: latest?.code ?? '',
  }
}

// Suggest the next Vendor Code for the request's vendor from the codes already in PRONES. Account still keys the
// vendor into PRONES with this code; Save and Approve then verify it as usual (verifyVendorCode).
export const generateVendorCodeForRequest = async (dataItem: { REQUEST_REGISTER_VENDOR_ID: unknown }): Promise<GeneratedVendorCode> => {
  const requestId = Number(dataItem.REQUEST_REGISTER_VENDOR_ID) || 0
  if (!requestId) throw new Error('Missing request_id')

  const requestVendorRows = (await MySQLExecute.search(VendorCodeSQL.getRequestVendor({ REQUEST_REGISTER_VENDOR_ID: requestId }))) as RowDataPacket[]
  const requestVendor = requestVendorRows[0]
  if (!requestVendor) throw new Error('Vendor is not linked to this registration request.')

  const vendorRegion = String(requestVendor.VENDOR_REGION ?? '').trim()
  if (!vendorRegion) throw new Error('Vendor region was not found')

  const prefix = getVendorCodePrefix(vendorRegion.toLowerCase() === 'oversea')
  const nameLetters = getVendorNameLetters(requestVendor.COMPANY_NAME)
  if (nameLetters.length < 3) {
    throw new Error('Company name needs at least 3 English letters to generate a Vendor Code. Please enter the Vendor Code manually.')
  }

  let pronesRows: Record<string, unknown>[]
  try {
    const result = await OracleExecute.searchOracle(VendorCodeSQL.getPronesCodesByStart(), 'PRONES', { CODE_LIKE: prefix + nameLetters[0] + '%' })
    pronesRows = (result.rows || []) as Record<string, unknown>[]
  } catch (error: any) {
    console.error('[generateVendorCode] PRONES lookup failed:', error?.message)
    throw new Error(PRONES_UNAVAILABLE_MESSAGE)
  }

  return generateNextVendorCode({
    prefix,
    companyName: requestVendor.COMPANY_NAME,
    existingCodes: pronesRows.map((row) => ({ code: String(row.VENDOR_CODE ?? ''), enteredAt: row.ENTERED_AT as Date | string | null })),
  })
}
