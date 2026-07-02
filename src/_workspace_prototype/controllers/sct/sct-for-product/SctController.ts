import { SctModel } from '@_workspace/models/sct/sct-for-product/SctModel'
import { StandardCostForProductModel } from '@src/_workspace/models/sct/StandardCostForProductModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const SctController = {
  calculateSellPriceByFgStructure: async (req: Request, res: Response) => {
    const result = await SctModel.calculateSellPriceByFgStructure(req.body)
    res.json(result as ResponseI)
  },
  calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId: async (req: Request, res: Response) => {
    const result = await SctModel.calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId(req.body)
    res.json(result as ResponseI)
  },
  calculateSellPriceByNotHaveFGAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId: async (req: Request, res: Response) => {
    const result = await SctModel.calculateSellPriceByNotHaveFGAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId(req.body)
    res.json(result as ResponseI)
  },
  checkBomLevelNotHaveSct: async (req: Request, res: Response) => {
    const result = await SctModel.checkBomLevelNotHaveSct(req.body)
    res.json(result as ResponseI)
  },
  changeSctStatusProgressId: async (req: Request, res: Response) => {
    const result = await SctModel.changeSctStatusProgressId(req.body)
    res.json(result as ResponseI)
  },
  // createSctFormMultiple: async (req: Request, res: Response) => {
  //   const result = await SctModel.createSctFormMultiple(req.body)
  //   res.json(result as ResponseI)
  // },
  searchAllSctData: async (req: Request, res: Response) => {
    const result = await SctModel.searchAllSctData(req.query)
    res.json(result as ResponseI)
  },
  getMaterialPriceData: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result: any = await SctModel.getMaterialPriceData(dataItem)

    if (dataItem.RESOURCE_OPTION_ID === 1 || dataItem.RESOURCE_OPTION_ID === '1') {
      result = [...result[0], ...result[1][1]]
    } else {
      result = [...result[0]]
    }

    let priceAdjustment: any = await SctModel.getItemPriceAdjustment(dataItem)

    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < priceAdjustment.length; j++) {
        if (result[i].BOM_FLOW_PROCESS_ITEM_USAGE_ID === priceAdjustment[j].BOM_FLOW_PROCESS_ITEM_USAGE_ID) {
          result[i].ITEM_M_S_PRICE_VALUE = priceAdjustment[j].SCT_BOM_FLOW_PROCESS_ITEM_USAGE_PRICE_ADJUST_VALUE
        }
      }
    }

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'Search Sct Data',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  calculateSellingPriceBySctIdAndBudget: async (req: Request, res: Response) => {
    const result = await SctModel.calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId(req.body)

    // let result: ResponseI | undefined

    // let sctBudget = []
    // let sctPrice = []
    // let sctSeason = []

    // if (req.body.length > 0) {
    //   for (let i = 0; i < req.body.length; i++) {
    //     let sctDetail: any = await SctModel.getBySctIdReal(req.body[i])

    //     if (sctDetail.length > 0) {
    //       if (sctDetail[0].SCT_REASON_SETTING_ID === 1 && sctDetail[0].SCT_TAG_SETTING_ID != 1) {
    //         result = {
    //           Status: false,
    //           ResultOnDb: [],
    //           TotalCountOnDb: 0,
    //           MethodOnDb: 'calculateSellingPriceTag',
    //           Message: 'SCT Budget is not Tag Budget',
    //         }

    //         res.json(result as ResponseI)
    //         return
    //       }

    //       if (sctDetail[0].SCT_TAG_SETTING_ID === 1) {
    //         sctBudget.push(sctDetail[0])
    //       } else if (sctDetail[0].SCT_REASON_SETTING_ID === 2) {
    //         sctSeason.push(sctDetail[0])
    //       } else if (sctDetail[0].SCT_REASON_SETTING_ID === 3) {
    //         sctPrice.push(sctDetail[0])
    //       }
    //     }
    //   }
    // }

    // if (sctBudget.length > 0) {
    //   result = await SctModel.calculateSellingPriceBySctIdAndBudget(sctBudget)
    // }

    // if (sctPrice.length > 0) {
    //   result = await SctModel.calculateSellingPriceBySctIdAndPrice(sctPrice)
    // }

    // if (sctSeason.length > 0) {
    //   result = await SctModel.calculateSellingPriceBySctIdAndPrice(sctSeason)
    // }

    res.json(result as ResponseI)
  },
  getSctByLikeProductTypeCodeAndCondition: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await StandardCostForProductModel.getSctByLikeProductTypeCodeAndCondition(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search By Like Sct Pattern Name',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getParentProductTypeBySctRevisionCode: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await StandardCostForProductModel.getParentProductTypeBySctRevisionCode(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: result.length,
      MethodOnDb: 'getParentProductTypeBySctRevisionCode',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
