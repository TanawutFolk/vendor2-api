import { ClearTimeForSctTotalService } from '@src/_workspace/services/_cycle-time-system/ClearTimeForSctTotalService'

export const ClearTimeForSctTotalModel = {
  getByProductTypeIdAndFiscalYear_MasterDataLatest: async (dataItem: any) => ClearTimeForSctTotalService.getByProductTypeIdAndFiscalYear_MasterDataLatest(dataItem),
  getByProductTypeIdAndFiscalYearAndRevisionNo: async (dataItem: any) => ClearTimeForSctTotalService.getByProductTypeIdAndFiscalYearAndRevisionNo(dataItem),
}
