// import ExcelJS from 'exceljs'

import { StandardCostExportModel } from '@src/_workspace/models/sct/StandardCostExportModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const StandardCostExportController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    dataItem = req.body

    let result: any = await StandardCostExportModel.search(dataItem)

    let dataResult = []
    // console.log(result?.length)
    for (let i = 0; i < result?.length; i++) {
      let el = result[i]

      let item = {
        SCT_ID: el[0].SCT_ID,
        SCT_CODE_FOR_SUPPORT_MES: el[0].SCT_CODE_FOR_SUPPORT_MES,
        SCT_REVISION_CODE: el[0].SCT_REVISION_CODE,
        PRODUCT_TYPE_NAME: el[0].PRODUCT_TYPE_NAME,
        PRODUCT_TYPE_CODE: el[0].PRODUCT_TYPE_CODE,
        SCT_ID_FOR_COMPARE: el[0].SCT_ID_FOR_COMPARE,
        COMPARE_SCT_REVISION_CODE: el[0].COMPARE_SCT_REVISION_CODE,
      }

      dataResult.push(item)
    }

    res.status(200).json({
      Status: true,
      ResultOnDb: dataResult,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Standard Cost Export',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  searchByProductTypeId: async (req: Request, res: Response) => {
    let dataItem

    dataItem = req.body

    let result: any = await StandardCostExportModel.searchByProductTypeId(dataItem)

    let dataResult = []
    // console.log(result?.length)
    for (let i = 0; i < result?.length; i++) {
      let el = result[i]

      if (el.length === 0) {
        continue
      } else {
        let item = {
          SCT_ID: el[0]?.SCT_ID,
          SCT_CODE_FOR_SUPPORT_MES: el[0]?.SCT_CODE_FOR_SUPPORT_MES,
          SCT_REVISION_CODE: el[0]?.SCT_REVISION_CODE,
          PRODUCT_TYPE_NAME: el[0]?.PRODUCT_TYPE_NAME,
          PRODUCT_TYPE_CODE: el[0]?.PRODUCT_TYPE_CODE,
          SCT_ID_FOR_COMPARE: el[0]?.SCT_ID_FOR_COMPARE,
          COMPARE_SCT_REVISION_CODE: el[0]?.COMPARE_SCT_REVISION_CODE,
        }

        dataResult.push(item)
      }
    }

    res.status(200).json({
      Status: true,
      ResultOnDb: dataResult,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Standard Cost Export',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  getSubAssyBySctId: async (req: Request, res: Response) => {
    let dataItem

    dataItem = req.body

    let result = await getSctDataThree(dataItem, 0)

    if (!result) {
      result = []
    }

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Sub Assy',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  // getSubAssyByProductTypeId: async (req: Request, res: Response) => {
  //   let dataItem

  //   dataItem = req.body

  //   let result = await getSctDataThreeByProductTypeId(dataItem, 0)

  //   if (!result) {
  //     result = []
  //   }

  //   res.json({
  //     Status: true,
  //     ResultOnDb: result,
  //     TotalCountOnDb: 0,
  //     MethodOnDb: 'Search Sub Assy',
  //     Message: 'Search Data Success',
  //   } as ResponseI)
  // },
}

const getSctDataThree = async (dataItem: any, level: any) => {
  let listResult: any = []

  await recursiveFx(dataItem, level)

  async function recursiveFx(dataItem: any, level: any) {
    dataItem.LEVEL = level
    level = level + 1
    listResult.push(dataItem)

    let result = await StandardCostExportModel.getSctData(dataItem)

    if (result.length > 0) {
      for (const item of result) {
        await recursiveFx(item, level)
      }
    }
  }
  // ??? Delete First Default Object
  listResult = listResult.slice(1)
  return listResult
}

// const getSctDataThreeByProductTypeId = async (dataItem: any, level: any) => {
//   let listResult: any = []

//   await recursiveFx(dataItem, level)

//   async function recursiveFx(dataItem: any, level: any) {
//     dataItem.LEVEL = level

//     level = level + 1
//     listResult.push(dataItem)

//     let result = await StandardCostExportModel.getSctDataByProductTypeId(dataItem)

//     if (result.length > 0) {
//       for (const item of result) {
//         await recursiveFx(item, level)
//       }
//     }
//   }
//   // ??? Delete First Default Object
//   listResult = listResult.slice(1)
//   return listResult
// }
