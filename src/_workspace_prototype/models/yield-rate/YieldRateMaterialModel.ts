import { YieldRateMaterialService } from '@src/_workspace/services/yield-rate/YieldRateMaterialService'
export const YieldRateMaterialModel = {
  search: async (dataItem: any) => YieldRateMaterialService.search(dataItem),
}
