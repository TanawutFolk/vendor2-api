export interface AllRequestHistorySearchData {
  REQUESTER_SECTION?: string | null
  REQUEST_YEAR?: number | null
  ORDER?: Array<{ id: string; desc?: boolean }>
  START?: number
  LIMIT?: number
}
