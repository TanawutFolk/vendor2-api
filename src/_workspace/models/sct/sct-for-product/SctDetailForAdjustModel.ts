import { SctDetailForAdjustService } from '@src/_workspace/services/sct/sct-for-product/SctDetailForAdjustService'

export const SctDetailForAdjustModel = {
  getBySctId: async (dataItem: any) => SctDetailForAdjustService.getBySctId(dataItem),
}
