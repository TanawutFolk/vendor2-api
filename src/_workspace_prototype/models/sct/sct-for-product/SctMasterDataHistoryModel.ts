import { SctMasterDataHistoryService } from '@src/_workspace/services/sct/sct-for-product/SctMasterDataHistoryService'

export const SctMasterDataHistoryModel = {
  getBySctIdAndIsFromSctCopy: async (dataItem: any) => SctMasterDataHistoryService.getBySctIdAndIsFromSctCopy(dataItem),
}
