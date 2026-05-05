import * as XLSX from 'xlsx'

export type SourceFormat = 'US' | 'CN'
export const MAX_TRACKED_COLUMNS = 28

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface ParsedBlacklistUsRow {
  source: string | null
  entity_number: string | null
  entity_type: string | null
  programs: string | null
  name: string
  title: string | null
  addresses: string | null
  federal_register_notice: string | null
  start_date: string | null
  end_date: string | null
  standard_order: string | null
  license_requirement: string | null
  license_policy: string | null
  vessel_information: string | null
  remarks: string | null
  source_list_url: string | null
  alt_names: string | null
  citizenships: string | null
  dates_of_birth: string | null
  nationalities: string | null
  places_of_birth: string | null
  source_information_url: string | null
  description: string | null
}

export interface ParsedBlacklistCnRow {
  source_name: string | null
  entity_number: string | null
  entity_type: string | null
  programs: string | null
  country: string | null
  primary_name: string
  normalized_name: string
  wmd_type: string | null
  aliases: string[]
  raw_payload: string
}

// ─────────────────────────────────────────────
// Text Utilities
// ─────────────────────────────────────────────

export const getCellValue = (row: any[], index: number) => (index >= 0 ? row[index] : '')

export const normalizeText = (value: any) =>
  String(value ?? '')
    .replace(/\r/g, '\n')
    .trim()

export const normalizeName = (value: any) =>
  normalizeText(value)
    .toUpperCase()
    .replace(/_/g, ' ')
    .replace(/[.,()\/\\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const splitCellLines = (value: any) =>
  normalizeText(value)
    .split('\n')
    .map((item) => item.replace(/^[•·・\-]+\s*/, '').trim())
    .filter(Boolean)

export const pickLastLine = (value: any) => {
  const lines = splitCellLines(value)
  return lines.length > 0 ? lines[lines.length - 1] : ''
}

export const extractWmdType = (value: any) => {
  const lines = splitCellLines(value)
  const codeLine = lines.find((line) => /^[A-Z,\-/ ]+$/.test(line))
  return normalizeText(codeLine || pickLastLine(value) || null) || null
}

export const dedupeValues = (values: string[]) => {
  const uniqueMap = new Map<string, string>()

  values
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      const normalizedItem = normalizeName(item)
      if (!normalizedItem || uniqueMap.has(normalizedItem)) return
      uniqueMap.set(normalizedItem, item)
    })

  return Array.from(uniqueMap.values())
}

export const buildRowsPreview = (rows: any[][]) => rows.slice(0, 5).map((row) => (row || []).slice(0, 10).map((cell) => normalizeText(cell)))

// ─────────────────────────────────────────────
// Header Token Helpers
// ─────────────────────────────────────────────

export const GENERIC_HEADER_TOKENS = new Set([
  'NO',
  'NUMBER',
  'SOURCE',
  'ENTITY',
  'ENTITY NUMBER',
  'ENTITY NO',
  'ENTITY TYPE',
  'TYPE',
  'PROGRAM',
  'PROGRAMS',
  'NAME',
  'PRIMARY NAME',
  'COUNTRY',
  'ALIAS',
  'ALIASES',
  'WMD',
])

export const isGenericHeaderToken = (value: any) => GENERIC_HEADER_TOKENS.has(normalizeName(value))

export const looksLikeCountryValue = (value: any) => {
  const normalized = normalizeName(value)
  if (!normalized || isGenericHeaderToken(normalized)) return false
  if (/^\d+([.,]\d+)?$/.test(normalized)) return false
  return /[A-Z]/.test(normalized)
}

export const hasDetectedHeader = (parsedRows: any) => parsedRows?.__debug?.headerRow !== null && parsedRows?.__debug?.headerRow !== undefined

// ─────────────────────────────────────────────
// US Parser
// ─────────────────────────────────────────────

const findBestUsHeader = (rows: any[][]) => {
  const headerHints = {
    source: ['SOURCE', 'SOURCE NAME'],
    entity_number: ['ENTITY NUMBER', 'ENTITY NO', 'NUMBER'],
    entity_type: ['ENTITY TYPE', 'TYPE'],
    programs: ['PROGRAM', 'PROGRAMS'],
    name: ['NAME', 'PRIMARY NAME', 'ENTITY NAME'],
    title: ['TITLE'],
    addresses: ['ADDRESS', 'ADDRESSES'],
    federal_register_notice: ['FEDERAL REGISTER NOTICE'],
    start_date: ['START DATE'],
    end_date: ['END DATE'],
    standard_order: ['STANDARD ORDER'],
    license_requirement: ['LICENSE REQUIREMENT'],
    license_policy: ['LICENSE POLICY'],
    vessel_information: ['VESSEL INFORMATION'],
    remarks: ['REMARKS', 'REMARK'],
    source_list_url: ['SOURCE LIST URL'],
    alt_names: ['ALT NAMES', 'ALTERNATE NAMES', 'ALIASES'],
    citizenships: ['CITIZENSHIPS', 'CITIZENSHIP'],
    dates_of_birth: ['DATES OF BIRTH', 'DATE OF BIRTH', 'DOB'],
    nationalities: ['NATIONALITIES', 'NATIONALITY'],
    places_of_birth: ['PLACES OF BIRTH', 'PLACE OF BIRTH'],
    source_information_url: ['SOURCE INFORMATION URL'],
    description: ['DESCRIPTION'],
    create_by: ['CREATE BY'],
    update_by: ['UPDATE BY'],
    inuse: ['INUSE', 'IN USE'],
  }

  const pickColumnByHints = (normalizedHeaders: string[], hints: string[]) => {
    for (const hint of hints) {
      const exactIndex = normalizedHeaders.findIndex((header) => header === hint)
      if (exactIndex >= 0) return exactIndex
    }
    for (const hint of hints) {
      const includesIndex = normalizedHeaders.findIndex((header) => header.includes(hint))
      if (includesIndex >= 0) return includesIndex
    }
    return -1
  }

  let best: {
    rowIndex: number
    columns: {
      source: number
      entity_number: number
      entity_type: number
      programs: number
      name: number
      title: number
      addresses: number
      federal_register_notice: number
      start_date: number
      end_date: number
      standard_order: number
      license_requirement: number
      license_policy: number
      vessel_information: number
      remarks: number
      source_list_url: number
      alt_names: number
      citizenships: number
      dates_of_birth: number
      nationalities: number
      places_of_birth: number
      source_information_url: number
      description: number
      create_by: number
      update_by: number
      inuse: number
    }
    score: number
  } | null = null

  const scanLimit = Math.min(rows.length, 12)

  for (let rowIndex = 0; rowIndex < scanLimit; rowIndex++) {
    const row = (rows[rowIndex] || []).slice(0, MAX_TRACKED_COLUMNS)
    const normalizedHeaders = row.map((cell) => normalizeName(cell))

    const columns = {
      source: pickColumnByHints(normalizedHeaders, headerHints.source),
      entity_number: pickColumnByHints(normalizedHeaders, headerHints.entity_number),
      entity_type: pickColumnByHints(normalizedHeaders, headerHints.entity_type),
      programs: pickColumnByHints(normalizedHeaders, headerHints.programs),
      name: pickColumnByHints(normalizedHeaders, headerHints.name),
      title: pickColumnByHints(normalizedHeaders, headerHints.title),
      addresses: pickColumnByHints(normalizedHeaders, headerHints.addresses),
      federal_register_notice: pickColumnByHints(normalizedHeaders, headerHints.federal_register_notice),
      start_date: pickColumnByHints(normalizedHeaders, headerHints.start_date),
      end_date: pickColumnByHints(normalizedHeaders, headerHints.end_date),
      standard_order: pickColumnByHints(normalizedHeaders, headerHints.standard_order),
      license_requirement: pickColumnByHints(normalizedHeaders, headerHints.license_requirement),
      license_policy: pickColumnByHints(normalizedHeaders, headerHints.license_policy),
      vessel_information: pickColumnByHints(normalizedHeaders, headerHints.vessel_information),
      remarks: pickColumnByHints(normalizedHeaders, headerHints.remarks),
      source_list_url: pickColumnByHints(normalizedHeaders, headerHints.source_list_url),
      alt_names: pickColumnByHints(normalizedHeaders, headerHints.alt_names),
      citizenships: pickColumnByHints(normalizedHeaders, headerHints.citizenships),
      dates_of_birth: pickColumnByHints(normalizedHeaders, headerHints.dates_of_birth),
      nationalities: pickColumnByHints(normalizedHeaders, headerHints.nationalities),
      places_of_birth: pickColumnByHints(normalizedHeaders, headerHints.places_of_birth),
      source_information_url: pickColumnByHints(normalizedHeaders, headerHints.source_information_url),
      description: pickColumnByHints(normalizedHeaders, headerHints.description),
      create_by: pickColumnByHints(normalizedHeaders, headerHints.create_by),
      update_by: pickColumnByHints(normalizedHeaders, headerHints.update_by),
      inuse: pickColumnByHints(normalizedHeaders, headerHints.inuse),
    }

    // Only 'name' is strictly required. source is helpful but not mandatory.
    const nameFound = columns.name >= 0
    const score = Object.values(columns).filter((i) => i >= 0).length

    if (nameFound && score >= 2 && (!best || score > best.score)) {
      best = { rowIndex, columns, score }
    }
  }

  return best
}

const looksLikeUsHeaderRow = (sourceName: string, entityNumber: string, entityType: string, programs: string, primaryName: string) => {
  const source = normalizeName(sourceName)
  const entityNo = normalizeName(entityNumber)
  const type = normalizeName(entityType)
  const programText = normalizeName(programs)
  const name = normalizeName(primaryName)

  const headerVotes = [
    source.includes('SOURCE'),
    entityNo.includes('NUMBER') || entityNo.includes('NO'),
    type.includes('TYPE'),
    programText.includes('PROGRAM'),
    name.includes('NAME'),
  ].filter(Boolean).length

  return headerVotes >= 3
}

export const parseUsRows = (worksheet: XLSX.WorkSheet): ParsedBlacklistUsRow[] => {
  const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '', raw: false })
  const parsedRows: ParsedBlacklistUsRow[] = []
  const bestHeader = findBestUsHeader(rows)

  const columns = bestHeader
    ? bestHeader.columns
    : {
        source: 0,
        entity_number: 1,
        entity_type: 2,
        programs: 3,
        name: 4,
        title: 5,
        addresses: 6,
        federal_register_notice: 7,
        start_date: 8,
        end_date: 9,
        standard_order: 10,
        license_requirement: 11,
        license_policy: 12,
        vessel_information: 13,
        remarks: 14,
        source_list_url: 15,
        alt_names: 16,
        citizenships: 17,
        dates_of_birth: 18,
        nationalities: 19,
        places_of_birth: 20,
        source_information_url: 21,
        description: 22,
        create_by: 23,
        update_by: 24,
        inuse: 25,
      }

  const startRow = bestHeader ? bestHeader.rowIndex + 1 : 1

  // ── Debug: print header detection result ──────────────────────────────────
  console.log('\n====== [BlacklistUS] parseUsRows DEBUG ======')
  console.log(`Total rows in file  : ${rows.length}`)
  console.log(`Header detected     : ${bestHeader ? `YES at row ${bestHeader.rowIndex} (score=${bestHeader.score})` : 'NO — using positional fallback'}`)
  console.log(`Data starts at row  : ${startRow}`)
  console.log(`Column mapping:`)
  console.log(`  name              = col ${columns.name}`)
  console.log(`  source            = col ${columns.source}`)
  console.log(`  entity_number     = col ${columns.entity_number}`)
  console.log(`  entity_type       = col ${columns.entity_type}`)
  console.log(`  programs          = col ${columns.programs}`)
  if (rows[0]) {
    console.log(`Row 0 (raw)         : ${(rows[0] || []).slice(0, 8).map(String).join(' | ')}`)
  }
  if (rows[startRow]) {
    console.log(`Row ${startRow} (first data): ${(rows[startRow] || []).slice(0, 8).map(String).join(' | ')}`)
  }
  // ─────────────────────────────────────────────────────────────────────────

  let skippedEmpty = 0
  let skippedHeader = 0
  let skippedNoName = 0

  for (let rowIndex = startRow; rowIndex < rows.length; rowIndex++) {
    const row = (rows[rowIndex] || []).slice(0, MAX_TRACKED_COLUMNS)
    const sourceName = normalizeText(getCellValue(row, columns.source))
    const entityNumber = normalizeText(getCellValue(row, columns.entity_number))
    const entityType = normalizeText(getCellValue(row, columns.entity_type))
    const programs = normalizeText(getCellValue(row, columns.programs))
    const primaryName = normalizeText(getCellValue(row, columns.name))

    if (!sourceName && !entityNumber && !entityType && !programs && !primaryName) {
      skippedEmpty++
      continue
    }
    if (looksLikeUsHeaderRow(sourceName, entityNumber, entityType, programs, primaryName)) {
      skippedHeader++
      continue
    }
    if (!primaryName) {
      skippedNoName++
      continue
    }

    parsedRows.push({
      source: sourceName || null,
      entity_number: entityNumber || null,
      entity_type: entityType || null,
      programs: programs || null,
      name: primaryName,
      title: normalizeText(getCellValue(row, columns.title)) || null,
      addresses: normalizeText(getCellValue(row, columns.addresses)) || null,
      federal_register_notice: normalizeText(getCellValue(row, columns.federal_register_notice)) || null,
      start_date: normalizeText(getCellValue(row, columns.start_date)) || null,
      end_date: normalizeText(getCellValue(row, columns.end_date)) || null,
      standard_order: normalizeText(getCellValue(row, columns.standard_order)) || null,
      license_requirement: normalizeText(getCellValue(row, columns.license_requirement)) || null,
      license_policy: normalizeText(getCellValue(row, columns.license_policy)) || null,
      vessel_information: normalizeText(getCellValue(row, columns.vessel_information)) || null,
      remarks: normalizeText(getCellValue(row, columns.remarks)) || null,
      source_list_url: normalizeText(getCellValue(row, columns.source_list_url)) || null,
      alt_names: normalizeText(getCellValue(row, columns.alt_names)) || null,
      citizenships: normalizeText(getCellValue(row, columns.citizenships)) || null,
      dates_of_birth: normalizeText(getCellValue(row, columns.dates_of_birth)) || null,
      nationalities: normalizeText(getCellValue(row, columns.nationalities)) || null,
      places_of_birth: normalizeText(getCellValue(row, columns.places_of_birth)) || null,
      source_information_url: normalizeText(getCellValue(row, columns.source_information_url)) || null,
      description: normalizeText(getCellValue(row, columns.description)) || null,
    })
  }

  console.log(`Rows skipped (empty): ${skippedEmpty}`)
  console.log(`Rows skipped (header-like): ${skippedHeader}`)
  console.log(`Rows skipped (no name at col ${columns.name}): ${skippedNoName}`)
  console.log(`Rows parsed OK      : ${parsedRows.length}`)
  console.log('============================================\n')
  ;(parsedRows as any).__debug = {
    rowCount: rows.length,
    headerRow: bestHeader?.rowIndex ?? null,
    startRow,
    columns,
    preview: buildRowsPreview(rows),
  }

  return parsedRows
}

// ─────────────────────────────────────────────
// CN Parser
// ─────────────────────────────────────────────

const findBestCnHeader = (rows: any[][]) => {
  const headerHints = {
    no: ['NO', 'NUMBER', 'ITEM', 'ROW'],
    country: ['COUNTRY', 'NATIONALITY'],
    primary_name: ['NAME', 'PRIMARY NAME', 'ENTITY NAME'],
    aliases: ['ALIASES', 'ALIAS'],
    wmd_type: ['WMD TYPE', 'WMD', 'TYPE'],
    extra: ['EXTRA', 'REMARK', 'NOTE'],
  }

  const pickColumnByHints = (normalizedHeaders: string[], hints: string[]) => {
    for (const hint of hints) {
      const exactIndex = normalizedHeaders.findIndex((header) => header === hint)
      if (exactIndex >= 0) return exactIndex
    }
    for (const hint of hints) {
      const includesIndex = normalizedHeaders.findIndex((header) => header.includes(hint))
      if (includesIndex >= 0) return includesIndex
    }
    return -1
  }

  let best: {
    rowIndex: number
    columns: { no: number; country: number; primary_name: number; aliases: number; wmd_type: number; extra: number }
    score: number
  } | null = null

  const scanLimit = Math.min(rows.length, 12)

  for (let rowIndex = 0; rowIndex < scanLimit; rowIndex++) {
    const row = (rows[rowIndex] || []).slice(0, MAX_TRACKED_COLUMNS)
    const normalizedHeaders = row.map((cell) => normalizeName(cell))

    const columns = {
      no: pickColumnByHints(normalizedHeaders, headerHints.no),
      country: pickColumnByHints(normalizedHeaders, headerHints.country),
      primary_name: pickColumnByHints(normalizedHeaders, headerHints.primary_name),
      aliases: pickColumnByHints(normalizedHeaders, headerHints.aliases),
      wmd_type: pickColumnByHints(normalizedHeaders, headerHints.wmd_type),
      extra: pickColumnByHints(normalizedHeaders, headerHints.extra),
    }

    const requiredScore = [columns.country, columns.primary_name, columns.aliases].filter((i) => i >= 0).length
    const score = Object.values(columns).filter((i) => i >= 0).length

    if (requiredScore === 3 && score >= 3 && (!best || score > best.score)) {
      best = { rowIndex, columns, score }
    }
  }

  return best
}

export const parseCnRows = (worksheet: XLSX.WorkSheet): ParsedBlacklistCnRow[] => {
  const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '', raw: false })
  const bestHeader = findBestCnHeader(rows)

  const columns = bestHeader ? bestHeader.columns : { no: 0, country: 1, primary_name: 2, aliases: 3, wmd_type: 4, extra: 5 }

  const startRow = bestHeader ? bestHeader.rowIndex + 1 : 1

  const parsedRows = rows
    .slice(startRow)
    .map<ParsedBlacklistCnRow | null>((row) => {
      const safeRow = (row || []).slice(0, MAX_TRACKED_COLUMNS)
      const country = pickLastLine(safeRow[columns.country])
      const primaryName = normalizeText(safeRow[columns.primary_name])
      const aliasLines = splitCellLines(safeRow[columns.aliases]).filter((alias) => normalizeName(alias) !== normalizeName(primaryName))

      if (!primaryName || isGenericHeaderToken(primaryName)) return null
      if (!looksLikeCountryValue(country)) return null

      return {
        source_name: null,
        entity_number: null,
        entity_type: null,
        programs: null,
        country: country || null,
        primary_name: primaryName,
        normalized_name: normalizeName(primaryName),
        wmd_type: extractWmdType(safeRow[columns.wmd_type]),
        aliases: dedupeValues(aliasLines),
        raw_payload: JSON.stringify({
          no: safeRow[columns.no] ?? '',
          country: safeRow[columns.country] ?? '',
          primary_name: safeRow[columns.primary_name] ?? '',
          aliases: safeRow[columns.aliases] ?? '',
          wmd_type: safeRow[columns.wmd_type] ?? '',
          extra: safeRow[columns.extra] ?? '',
        }),
      }
    })
    .filter((item): item is ParsedBlacklistCnRow => item !== null)

  ;(parsedRows as any).__debug = {
    rowCount: rows.length,
    headerRow: bestHeader?.rowIndex ?? null,
    startRow,
    columns,
    preview: buildRowsPreview(rows),
  }

  return parsedRows
}
