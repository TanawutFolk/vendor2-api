import { YieldRateImportService } from '@src/_workspace/services/yield-rate-go-straight-rate/YieldRateImportService'

export const YieldRateImportModel = {
  createYieldRate: async (dataItem: any) => await YieldRateImportService.createYieldRate(dataItem),
  getAll: async () => await YieldRateImportService.getAll(),
}
