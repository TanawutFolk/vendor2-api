import { SctPivotingService } from '@src/_workspace/services/sct-pivoting/SctPivotingService'

export const SctPivotingModel = {
  search: async (dataItem: any) => SctPivotingService.search(dataItem),
}
