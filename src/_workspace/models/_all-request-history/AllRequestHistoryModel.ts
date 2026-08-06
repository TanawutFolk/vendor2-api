import { AllRequestHistoryService } from '../../services/_all-request-history/AllRequestHistoryService'
import type { AllRequestHistorySearchData } from '../../types/AllRequestHistory'

export const AllRequestHistoryModel = {
  search: async (dataItem: AllRequestHistorySearchData) => AllRequestHistoryService.search(dataItem),
  getFilterOptions: async () => AllRequestHistoryService.getFilterOptions(),
  getById: async (requestId: number) => AllRequestHistoryService.getById(requestId),
}
