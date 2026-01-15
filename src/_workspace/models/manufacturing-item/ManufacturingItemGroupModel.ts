import { ManufacturingItemGroupService } from '@_workspace/services/manufacturing-item/ManufacturingItemGroupService'

export const ManufacturingItemGroupModel = {
  search: async (dataItem: any) => ManufacturingItemGroupService.search(dataItem),
  create: async (dataItem: any) => ManufacturingItemGroupService.create(dataItem),
  update: async (dataItem: any) => ManufacturingItemGroupService.update(dataItem),
  delete: async (dataItem: any) => ManufacturingItemGroupService.delete(dataItem),
}
