import { PriceListExportService } from '@src/_workspace/services/sct/price-list/PriceListService'

export const PriceListExportModel = {
  exportToFile: async (dataItem: any) => await PriceListExportService.exportToFile(dataItem),
}
