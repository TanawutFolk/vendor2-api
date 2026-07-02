import { MaterialListServices } from '@src/_workspace/services/environment-certificate/MaterialListServices'

export const MaterialListModel = {
  search: async (dataItem: any) => MaterialListServices.search(dataItem),
  searchExport: async (dataItem: any) => MaterialListServices.searchExport(dataItem),
}
