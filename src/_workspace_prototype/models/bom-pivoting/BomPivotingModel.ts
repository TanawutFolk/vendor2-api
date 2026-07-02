import { BomPivotingService } from '@src/_workspace/services/bom-pivoting/BomPivotingService'

export const BomPivotingModel = {
  search: async (dataItem: any) => BomPivotingService.search(dataItem),
}
