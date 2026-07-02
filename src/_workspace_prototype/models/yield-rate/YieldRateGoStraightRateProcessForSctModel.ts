import { YieldRateGoStraightRateProcessForSctService } from '@src/_workspace/services/yield-rate-go-straight-rate/YieldRateGoStraightRateProcessForSctService'

export const YieldRateGoStraightRateProcessForSctModel = {
  getByProductTypeIdAndFiscalYear_MasterDataLatest: async (dataItem: any) => YieldRateGoStraightRateProcessForSctService.getByProductTypeIdAndFiscalYear_MasterDataLatest(dataItem),
  getByProductTypeIdAndFiscalYearAndRevisionNo: async (dataItem: any) => YieldRateGoStraightRateProcessForSctService.getByProductTypeIdAndFiscalYearAndRevisionNo(dataItem),
}
