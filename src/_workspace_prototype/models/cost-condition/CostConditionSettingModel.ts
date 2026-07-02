import { CostConditionSettingService } from '@src/_workspace/services/cost-condition/CostConditionSettingService'

export const CostConditionSettingModel = {
  getExportData: async (productTypeIds: number[]) => CostConditionSettingService.getExportData(productTypeIds),
  search: async (query: any) => CostConditionSettingService.search(query),
  create: async (dataItems: any[]) => CostConditionSettingService.create(dataItems),
  createByImportFile: async (dataItems: any[]) => CostConditionSettingService.createByImportFile(dataItems),
  update: async (dataItem: any) => CostConditionSettingService.update(dataItem),
  delete: async (dataItem: any) => CostConditionSettingService.delete(dataItem),

  getByProductTypeId: async (dataItem: { PRODUCT_TYPE_ID: number }) => CostConditionSettingService.getByProductTypeId(dataItem),
  getUnsettledCount: async () => CostConditionSettingService.getUnsettledCount(),
  getUnsettledProductTypes: async (query: any) => CostConditionSettingService.getUnsettledProductTypes(query),
}
