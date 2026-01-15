import { BomSQLomFlowProcessItemUsageService } from '@src/_workspace/services/bom/BomSQLomFlowProcessItemUsageService'

export const BomFlowProcessItemUsageModel = {
  getByProductTypeCodeAndProcessName: async (dataItem: { PRODUCT_TYPE_CODE: string; PROCESS_NAME: string }) =>
    BomSQLomFlowProcessItemUsageService.getByProductTypeCodeAndProcessName(dataItem),
  getByBomIdAndFiscalYearAndSctPatternIdAndProductTypeId: async (dataItem: any) =>
    BomSQLomFlowProcessItemUsageService.getByBomIdAndFiscalYearAndSctPatternIdAndProductTypeId(dataItem),
}
