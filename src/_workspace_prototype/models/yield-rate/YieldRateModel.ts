import { YieldRateService } from '@src/_workspace/services/yield-rate/YieldRateService'

export const YieldRateModel = {
  search: async (dataItem: any) => YieldRateService.search(dataItem),
  searchYieldRateProcess: async (dataItem: any) => YieldRateService.searchYieldRateProcess(dataItem),
  searchYieldRateTotal: async (dataItem: any) => YieldRateService.searchYieldRateTotal(dataItem),
  searchUnlimitYieldRate: async (dataItem: any) => YieldRateService.searchUnlimitYieldRate(dataItem),
  searchUnlimitYieldRateTotal: async (dataItem: any) => YieldRateService.searchUnlimitYieldRateTotal(dataItem),
  searchUnlimit: async (dataItem: any) => YieldRateService.searchUnlimit(dataItem),
}
