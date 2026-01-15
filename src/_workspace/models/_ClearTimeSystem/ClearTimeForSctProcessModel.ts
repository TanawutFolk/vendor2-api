import { ClearTimeForSctProcessService } from '@src/_workspace/services/_cycle-time-system/ClearTimeForSctProcessService'

export const ClearTimeForSctProcessModel = {
  getByProductTypeIdAndFiscalYear_MasterDataLatest: async (dataItem: any) => ClearTimeForSctProcessService.getByProductTypeIdAndFiscalYear_MasterDataLatest(dataItem),
  getByProductTypeIdAndFiscalYearAndRevisionNo: async (dataItem: any) => ClearTimeForSctProcessService.getByProductTypeIdAndFiscalYearAndRevisionNo(dataItem),
}
