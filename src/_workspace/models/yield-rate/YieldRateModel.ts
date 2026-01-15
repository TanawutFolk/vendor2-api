import { YieldRateService } from '@src/_workspace/services/yield-rate/YieldRateService'

export const YieldRateModel = {
  search: async (dataItem: any) => YieldRateService.search(dataItem),
}
