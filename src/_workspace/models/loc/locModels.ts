import { LocServices } from '@src/_workspace/services/loc/LocServices'

export const LocModels = {
  getLocTypeByLikeLocTypeNameAndInuseOnlyProductionType: async (dataItem: any) => LocServices.getLocTypeByLikeLocTypeNameAndInuseOnlyProductionType(dataItem),
}
