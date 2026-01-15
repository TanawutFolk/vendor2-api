import { YieldRateMaterialService } from '@src/_workspace/services/yield-rate-material/YieldRateMaterialService'

export const YieldRateMaterialModel = {
  createYieldRateMaterial: async (dataItem: any) => await YieldRateMaterialService.createYieldRateMaterial(dataItem),
  search: async (dataItem: any) => YieldRateMaterialService.search(dataItem),
  createMaterialYieldRateData: async (dataItem: any) => YieldRateMaterialService.createMaterialYieldRateData(dataItem),
}
