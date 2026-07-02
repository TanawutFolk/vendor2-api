import { SctController } from '@src/_workspace/controllers/sct/sct-for-product/SctController'

import { Router } from 'express'

const sctRoutes = Router()
  .post(
    '/calculateSellPriceByFgStructure',
    // validateData(
    //   z.object({
    //     ITEM_CATEGORY_ID: z.number(),
    //     // email: z.string().email(),
    //     // password: z.string().min(8),
    //   })
    // ),
    SctController.calculateSellPriceByFgStructure
  )
  .post(
    '/calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId',
    SctController.calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId
  )
  .post(
    '/calculateSellPriceByNotHaveFGAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId',
    SctController.calculateSellPriceByNotHaveFGAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId
  )
  .post('/checkBomLevelNotHaveSct', SctController.checkBomLevelNotHaveSct)

  .get('/searchAllSctData', SctController.searchAllSctData)
  .get('/getMaterialPriceData', SctController.getMaterialPriceData)

  .post('/changeSctStatusProgressId', SctController.changeSctStatusProgressId)

  .post('/calculateSellingPriceBySctIdAndBudget', SctController.calculateSellingPriceBySctIdAndBudget)
  .post('/getSctByLikeProductTypeCodeAndCondition', SctController.getSctByLikeProductTypeCodeAndCondition)
  .post('/getParentProductTypeBySctRevisionCode', SctController.getParentProductTypeBySctRevisionCode)
export default sctRoutes
