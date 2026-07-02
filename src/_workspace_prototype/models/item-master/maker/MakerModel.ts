import { MakerService } from '@src/_workspace/services/item-master/maker/MakerService'

export const MakerModel = {
  getMaker: async (dataItem: any) => MakerService.getMaker(dataItem),

  searchMaker: async (dataItem: any) => MakerService.searchMaker(dataItem),

  createMaker: async (dataItem: any) => MakerService.createMaker(dataItem),

  updateMaker: async (dataItem: any) => MakerService.updateMaker(dataItem),

  deleteMaker: async (dataItem: any) => MakerService.deleteMaker(dataItem),

  getByLikeMakerNameAndInuse: async (dataItem: any) => MakerService.getByLikeMakerNameAndInuse(dataItem),
}
