import { SctBomFlowProcessItemUsagePriceAdjustService } from '@src/_workspace/services/sct/sct-for-product/SctBomFlowProcessItemUsagePriceAdjustService'

export const SctBomFlowProcessItemUsagePriceAdjustModel = {
  getBySctId: async (dataItem: any) => SctBomFlowProcessItemUsagePriceAdjustService.getBySctId(dataItem),
}
