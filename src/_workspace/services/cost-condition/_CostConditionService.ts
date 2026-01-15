import { MySQLExecute } from '@businessData/dbExecute'
import { _CostConditionSQL } from '@src/_workspace/sql/cost-condition/_CostConditionSQL'

import { RowDataPacket } from 'mysql2'
import LIST_COST_CONDITION_SETTING from './COST_CONDITION_SETTING'

export const _CostConditionService = {
  getAllByProductMainIdAndFiscalYear_MasterDataLatest: async (dataItem: {
    FISCAL_YEAR: number
    PRODUCT_MAIN_ID: number
    ITEM_CATEGORY_ID: number
    PRODUCT_MAIN_NAME: string
    ITEM_CATEGORY_NAME: string
  }) => {
    let sql = await _CostConditionSQL.getAllByProductMainIdAndFiscalYear_MasterDataLatest({
      FISCAL_YEAR: dataItem.FISCAL_YEAR,
      PRODUCT_MAIN_ID: dataItem.PRODUCT_MAIN_ID,
    })

    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]

    // const data: Array<{
    //   PRODUCT_MAIN_NAME: string
    //   ITEM_CATEGORY_NAME: string
    //   VALUE: number[]
    // }> = [
    //   { PRODUCT_MAIN_NAME: 'CPO-ELS', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'CPO-ELS',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'CPO-ELS',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'Sensor-DFB', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'Sensor-DFB',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Sensor-DFB',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'FBT-ITLA', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'FBT-ITLA',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'FBT-ITLA',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'uITLA', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'uITLA',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   { PRODUCT_MAIN_NAME: 'uITLA', ITEM_CATEGORY_NAME: 'Finished Goods', VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },
    //   { PRODUCT_MAIN_NAME: 'uTOSA', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'uTOSA',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   { PRODUCT_MAIN_NAME: 'uTOSA', ITEM_CATEGORY_NAME: 'Finished Goods', VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },
    //   { PRODUCT_MAIN_NAME: 'JU-uTOSA', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'JU-uTOSA',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'JU-uTOSA',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'JU-uITLA', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'JU-uITLA',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'JU-uITLA',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'Nano-ITLA', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'Nano-ITLA',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Nano-ITLA',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'Nano-TOSA', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'Nano-TOSA',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Nano-TOSA',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'PLC-Wavelength-Locker',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'PLC-Wavelength-Locker',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'PLC-Wavelength-Locker',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'iPump', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'iPump',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   { PRODUCT_MAIN_NAME: 'iPump', ITEM_CATEGORY_NAME: 'Finished Goods', VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },
    //   { PRODUCT_MAIN_NAME: 'DFB', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'DFB',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   { PRODUCT_MAIN_NAME: 'DFB', ITEM_CATEGORY_NAME: 'Finished Goods', VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },
    //   { PRODUCT_MAIN_NAME: 'HBCDM', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'HBCDM',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   { PRODUCT_MAIN_NAME: 'HBCDM', ITEM_CATEGORY_NAME: 'Finished Goods', VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },
    //   { PRODUCT_MAIN_NAME: 'Adhesive', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'Adhesive',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Adhesive',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: '980nm_LDM', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: '980nm_LDM',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: '980nm_LDM',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: '980MM', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: '980MM',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   { PRODUCT_MAIN_NAME: '980MM', ITEM_CATEGORY_NAME: 'Finished Goods', VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },
    //   { PRODUCT_MAIN_NAME: '1480nm_LDM', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: '1480nm_LDM',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: '1480nm_LDM',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'T-PIG', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'T-PIG',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   { PRODUCT_MAIN_NAME: 'T-PIG', ITEM_CATEGORY_NAME: 'Finished Goods', VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },
    //   { PRODUCT_MAIN_NAME: 'Stabilizer', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'Stabilizer',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Stabilizer',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'FBG-for-Fiber-Laser',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'FBG-for-Fiber-Laser',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'FBG-for-Fiber-Laser',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Module-Product',
    //   //   ITEM_CATEGORY_NAME: 'Sub-Assy',
    //   //   VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Module-Product',
    //   //   ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //   //   VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Module-Product',
    //   //   ITEM_CATEGORY_NAME: 'Finished Goods',
    //   //   VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Silicone-Adhesive',
    //   //   ITEM_CATEGORY_NAME: 'Sub-Assy',
    //   //   VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Silicone-Adhesive',
    //   //   ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //   //   VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Silicone-Adhesive',
    //   //   ITEM_CATEGORY_NAME: 'Finished Goods',
    //   //   VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1],
    //   // },
    //   // { PRODUCT_MAIN_NAME: 'TFB', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'TFB',
    //   //   ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //   //   VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // { PRODUCT_MAIN_NAME: 'TFB', ITEM_CATEGORY_NAME: 'Finished Goods', VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Standard-Fiber-Laser',
    //   //   ITEM_CATEGORY_NAME: 'Sub-Assy',
    //   //   VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Standard-Fiber-Laser',
    //   //   ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //   //   VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Standard-Fiber-Laser',
    //   //   ITEM_CATEGORY_NAME: 'Finished Goods',
    //   //   VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   // },
    //   // { PRODUCT_MAIN_NAME: 'Ribbon-Cable', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Ribbon-Cable',
    //   //   ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //   //   VALUE: [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Ribbon-Cable',
    //   //   ITEM_CATEGORY_NAME: 'Finished Goods',
    //   //   VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Mode-Stripper',
    //   //   ITEM_CATEGORY_NAME: 'Sub-Assy',
    //   //   VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Mode-Stripper',
    //   //   ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //   //   VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Mode-Stripper',
    //   //   ITEM_CATEGORY_NAME: 'Finished Goods',
    //   //   VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Fiber-Laser-Engine',
    //   //   ITEM_CATEGORY_NAME: 'Sub-Assy',
    //   //   VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Fiber-Laser-Engine',
    //   //   ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //   //   VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Fiber-Laser-Engine',
    //   //   ITEM_CATEGORY_NAME: 'Finished Goods',
    //   //   VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   // },
    //   // { PRODUCT_MAIN_NAME: 'Cavity', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Cavity',
    //   //   ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //   //   VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // { PRODUCT_MAIN_NAME: 'Cavity', ITEM_CATEGORY_NAME: 'Finished Goods', VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Beam-Combiner',
    //   //   ITEM_CATEGORY_NAME: 'Sub-Assy',
    //   //   VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Beam-Combiner',
    //   //   ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //   //   VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   // },
    //   // {
    //   //   PRODUCT_MAIN_NAME: 'Beam-Combiner',
    //   //   ITEM_CATEGORY_NAME: 'Finished Goods',
    //   //   VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   // },
    //   { PRODUCT_MAIN_NAME: 'Fiber-Holder', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'Fiber-Holder',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Fiber-Holder',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Thermal-Stripper',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Thermal-Stripper',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Thermal-Stripper',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Reinforced-Sleeve',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Reinforced-Sleeve',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Reinforced-Sleeve',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Fusion-Splicer',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Fusion-Splicer',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Fusion-Splicer',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'IDH', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'IDH',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   { PRODUCT_MAIN_NAME: 'IDH', ITEM_CATEGORY_NAME: 'Finished Goods', VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },
    //   {
    //     PRODUCT_MAIN_NAME: 'Optical-Rosette',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Optical-Rosette',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Optical-Rosette',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Splitter-Module',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Splitter-Module',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Splitter-Module',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'Small8Bunki', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'Small8Bunki',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Small8Bunki',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Multi-Closure',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Multi-Closure',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Multi-Closure',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'Master-Fiber', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'Master-Fiber',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Master-Fiber',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'Lensed-Fiber', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'Lensed-Fiber',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Lensed-Fiber',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'IDM-J', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'IDM-J',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   { PRODUCT_MAIN_NAME: 'IDM-J', ITEM_CATEGORY_NAME: 'Finished Goods', VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },
    //   { PRODUCT_MAIN_NAME: 'IDM-Cable', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'IDM-Cable',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'IDM-Cable',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'IDM-C', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'IDM-C',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   { PRODUCT_MAIN_NAME: 'IDM-C', ITEM_CATEGORY_NAME: 'Finished Goods', VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },
    //   {
    //     PRODUCT_MAIN_NAME: 'FA&Kantan&EZ-Connector',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'FA&Kantan&EZ-Connector',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'FA&Kantan&EZ-Connector',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'Henkan&PF', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'Henkan&PF',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Henkan&PF',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'Gaihihaji', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'Gaihihaji',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Gaihihaji',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   { PRODUCT_MAIN_NAME: 'FTM', ITEM_CATEGORY_NAME: 'Sub-Assy', VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    //   {
    //     PRODUCT_MAIN_NAME: 'FTM',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   { PRODUCT_MAIN_NAME: 'FTM', ITEM_CATEGORY_NAME: 'Finished Goods', VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },
    //   // --------------------------- New Data 2024-Dec-12 ---------------------------
    //   {
    //     PRODUCT_MAIN_NAME: 'Module-Product',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Module-Product',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Module-Product',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Silicone-Adhesive',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Silicone-Adhesive',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Silicone-Adhesive',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'TFB',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'TFB',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'TFB',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Standard-Fiber-Laser',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Standard-Fiber-Laser',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Standard-Fiber-Laser',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Ribbon-Cable',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Ribbon-Cable',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Ribbon-Cable',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Mode-Stripper',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Mode-Stripper',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Mode-Stripper',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Fiber-Laser-Engine',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Fiber-Laser-Engine',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Fiber-Laser-Engine',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Cavity',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Cavity',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Cavity',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Beam-Combiner',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Beam-Combiner',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'Beam-Combiner',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'ELS',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'ELS',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'ELS',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },

    //   // Add new 2025-Aug-26 (PR-NANO-ITLA , PR-NANO-TOSA)
    //   {
    //     PRODUCT_MAIN_NAME: 'PR-NANO-ITLA',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'PR-NANO-ITLA',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'PR-NANO-ITLA',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'PR-NANO-TOSA',
    //     ITEM_CATEGORY_NAME: 'Sub-Assy',
    //     VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'PR-NANO-TOSA',
    //     ITEM_CATEGORY_NAME: 'Semi-Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    //   },
    //   {
    //     PRODUCT_MAIN_NAME: 'PR-NANO-TOSA',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
    //   },

    //   // Add new 2025-Sep-22 (DFB Chip)
    //   // *** Sub-Assy , Semi-Finished Goods => No data from PC section
    //   {
    //     PRODUCT_MAIN_NAME: 'DFB-Chip',
    //     ITEM_CATEGORY_NAME: 'Finished Goods',
    //     VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    //   },
    // ]

    //const dataRe = data.find((item) => item.PRODUCT_MAIN_NAME == dataItem.PRODUCT_MAIN_NAME && item.ITEM_CATEGORY_NAME == dataItem.ITEM_CATEGORY_NAME)
    const dataRe = LIST_COST_CONDITION_SETTING.find((item) => item.PRODUCT_MAIN_ID == dataItem.PRODUCT_MAIN_ID && item.ITEM_CATEGORY_ID == dataItem.ITEM_CATEGORY_ID)

    if (!dataRe) {
      throw new Error(`Not found data for PRODUCT_MAIN_NAME : ${dataItem.PRODUCT_MAIN_NAME} and ITEM_CATEGORY_NAME : ${dataItem.ITEM_CATEGORY_NAME}`)
    }

    if (dataRe.VALUE[0] === 0) {
      //Direct Unit Process Cost (h)
      resultData[0][0].DIRECT_UNIT_PROCESS_COST = 0
    }
    if (dataRe.VALUE[1] === 0) {
      //Indirect Rate of Direct Process Cost (%)
      resultData[0][0].INDIRECT_RATE_OF_DIRECT_PROCESS_COST = 0
    }

    if (dataRe.VALUE[2] === 0) {
      //Labor
      resultData[1][0].LABOR = 0
    }
    if (dataRe.VALUE[3] === 0) {
      //Depreciation
      resultData[1][0].DEPRECIATION = 0
    }
    if (dataRe.VALUE[4] === 0) {
      //Other Expense
      resultData[1][0].OTHER_EXPENSE = 0
    }
    if (dataRe.VALUE[5] === 0) {
      //Total Indirect Cost
      resultData[1][0].TOTAL_INDIRECT_COST = 0
    }
    if (dataRe.VALUE[6] === 0) {
      //GA (%)
      resultData[2][0].GA = 0
    }
    if (dataRe.VALUE[7] === 0) {
      //MARGIN
      resultData[2][0].MARGIN = 0
    }
    if (dataRe.VALUE[8] === 0) {
      //SELLING_EXPENSE
      resultData[2][0].SELLING_EXPENSE = 0
    }
    if (dataRe.VALUE[9] === 0) {
      //VAT
      resultData[2][0].VAT = 0
    }
    if (dataRe.VALUE[10] === 0) {
      //CIT
      resultData[2][0].CIT = 0
    }
    if (dataRe.VALUE[10] === 0) {
      //ADJUST_PRICE
      if (resultData[3] && resultData[3][0]) {
        resultData[3][0].ADJUST_PRICE = 0
      }
    }

    // if (dataItem.PRODUCT_MAIN_NAME === 'Nano-TOSA' && dataItem.ITEM_CATEGORY_NAME === 'Sub-Assy') {
    //   console.log(dataRe)
    //   console.log(resultData)
    // }

    //console.log(resultData)

    return resultData
  },
}
