import { SctBomFlowProcessItemUsagePriceService } from '@src/_workspace/services/sct/sct-for-product/SctBomFlowProcessItemUsagePriceService'

export const SctBomFlowProcessItemUsagePriceModel = {
  getBySctId: async (dataItem: any) => SctBomFlowProcessItemUsagePriceService.getBySctId(dataItem),
}
