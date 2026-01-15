import { SctTotalCostService } from '@src/_workspace/services/sct/sct-for-product/SctTotalCostService'

export const SctTotalCostModel = {
  getBySctId: async (dataItem: any) => SctTotalCostService.getBySctId(dataItem),
}
