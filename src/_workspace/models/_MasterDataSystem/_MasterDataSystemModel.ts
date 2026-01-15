import { MasterDataSystemService } from '@src/_workspace/services/_MasterDataSystem/_MasterDataSystemService'

export const MasterDataSystemModel = {
  getItemCodeInBomOfProduct: async (dataItem: any) => MasterDataSystemService.getItemCodeInBomOfProduct(dataItem),
}
