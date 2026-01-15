import { SctCompareService } from './SctCompareService'

export const SctCompareModel = {
  getBySctId: async (dataItem: any) => SctCompareService.getBySctId(dataItem),
}
