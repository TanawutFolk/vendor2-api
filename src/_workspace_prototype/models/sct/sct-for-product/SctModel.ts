import { _ReCalFgService, calculateSellPriceByFgStructure } from '@_workspace/services/sct/sct-for-product/_sct-for-product/_ReCalFgService'
import { _MultiCreate_manualService } from '@src/_workspace/services/sct/sct-for-product/_sct-for-product/_MultiCreate_manualService'
import { _SctStructureBomService } from '@src/_workspace/services/sct/sct-for-product/_sct-for-product/_SctStructureBomService'
// import { reCalService } from '@src/_workspace/services/sct/sct-for-product/recalService'
import { SctService } from '@src/_workspace/services/sct/sct-for-product/sctService'

export const SctModel = {
  calculateSellPriceByFgStructure: async (dataItem: any) => calculateSellPriceByFgStructure(dataItem),
  calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId: async (dataItem: any) =>
    _ReCalFgService.calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId(dataItem),
  calculateSellPriceByNotHaveFGAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId: async (dataItem: any) =>
    _ReCalFgService.calculateSellPriceByNotHaveFGAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId(dataItem),
  checkBomLevelNotHaveSct: async (dataItem: any) => _SctStructureBomService.checkBomLevelNotHaveSct(dataItem),
  changeSctStatusProgressId: async (dataItem: any) => _MultiCreate_manualService.changeSctStatusProgressId(dataItem),
  //createSctFormMultiple: async (dataItem: any) => SctService.createSctFormMultiple(dataItem),
  searchAllSctData: async (dataItem: any) => await SctService.searchAllSctData(dataItem),
  getMaterialPriceData: async (dataItem: any) => SctService.getMaterialPriceData(dataItem),
  getItemPriceAdjustment: async (dataItem: any) => SctService.getItemPriceAdjustment(dataItem),
  // calculateSellingPriceBySctIdAndBudget: async (dataItem: any) => reCalService.calculateSellingPriceBySctIdAndBudget(dataItem),
  // calculateSellingPriceBySctIdAndPrice: async (dataItem: any) => reCalService.calculateSellingPriceBySctIdAndPrice(dataItem),
  // getBySctIdReal: async (dataItem: any) => reCalService.getBySctIdReal(dataItem),
}
