import { ClearTimeService } from '@src/_workspace/services/clear-time/ClearTimeServices'

export const ClearTimeModel = {
  createClearTime: async (dataItem: any) => await ClearTimeService.createClearTime(dataItem),
  getClearTimeExportDataByProductTypeId: async (dataItem: any) => await ClearTimeService.getClearTimeExportDataByProductTypeId(dataItem),
}
