import { AssigneesService } from '../../services/_Employee-manager/AssigneesService'

export const AssigneesModel = {
  getGroups: async (dataItem: any) => AssigneesService.getGroups(dataItem),
  search: async (dataItem: any) => AssigneesService.search(dataItem),
  save: async (dataItem: any) => AssigneesService.save(dataItem),
}
