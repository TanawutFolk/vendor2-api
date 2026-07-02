import { ProductionPurposeService } from '@src/_workspace/services/production-control/ProductionPurposeService'

export const ProductionPurposeModel = {
  getByLikeProductionPurposeNameAndInuse: async (dataItem: any) => ProductionPurposeService.getByLikeProductionPurposeNameAndInuse(dataItem),
}
