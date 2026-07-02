import { YieldRateGoStraightRateTotalForSctService } from '@src/_workspace/services/yield-rate-go-straight-rate/YieldRateGoStraightRateTotalForSctService'

export const YieldRateGoStraightRateTotalForSctModel = {
  search: async (dataItem: any) => YieldRateGoStraightRateTotalForSctService.search(dataItem),
  getByProductTypeIdAndFiscalYear_MasterDataLatest: async (dataItem: any) => YieldRateGoStraightRateTotalForSctService.getByProductTypeIdAndFiscalYear_MasterDataLatest(dataItem),
  getByProductTypeIdAndFiscalYearAndRevisionNo: async (dataItem: any) => YieldRateGoStraightRateTotalForSctService.getByProductTypeIdAndFiscalYearAndRevisionNo(dataItem),
}
