import { BomModel } from '@src/_workspace/models/bom/BomModel'
import { FlowProcessModel } from '@src/_workspace/models/flow-process/FlowProcessModel'
import { FlowModel } from '@src/_workspace/models/flow/FlowModel'
import { getSqlWhereByColumnFilters } from '@src/helpers/getSqlWhereByFilterColumn'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'

type Item = {
  ITEM_CATEGORY_NAME: string
  ITEM_CATEGORY_ID: number
  ITEM_CATEGORY_ALPHABET: string
  ITEM_CATEGORY_SHORT_NAME: string
  ITEM_CODE_FOR_SUPPORT_MES: string
  ITEM_ID: number
  ITEM_INTERNAL_FULL_NAME: string
  UNIT_OF_MEASUREMENT_NAME: string
}

type ItemCategory = {
  ITEM_CATEGORY_NAME: string
  ITEM_CATEGORY_ID: number
  ITEM_CATEGORY_ALPHABET: string
}

type Process = {
  value: number
  label: string
}

type ItemType = {
  ITEM: Item
  ITEM_CATEGORY: ItemCategory
  PROCESS: Process
  USAGE_QUANTITY: string
}

export const BomController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_4', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },
      { table: 'tb_4', id: 'PRODUCT_MAIN_ID', Fns: '=' },
      { table: 'tb_5', id: 'PRODUCT_CATEGORY_ID', Fns: '=' },
      { table: 'tb_1', id: 'BOM_CODE', Fns: 'LIKE' },
      { table: 'tb_1', id: 'BOM_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCTION_PURPOSE_ID', Fns: '=' },
      { table: 'tb_3', id: 'FLOW_CODE', Fns: 'LIKE' },
      { table: 'tb_3', id: 'FLOW_ID', Fns: '=' },
      { table: 'tb_3', id: 'FLOW_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'TOTAL_COUNT_PROCESS', Fns: 'LIKE' },
      { table: 'tb_7', id: 'PRODUCT_TYPE_CODE', Fns: 'LIKE' },
      { table: 'tb_7', id: 'PRODUCT_TYPE_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'INUSE' },
    ]

    // dataItem = {
    //   ...dataItem,
    //   sqlJoin: `
    //                            BOM tb_1
    //                         INNER JOIN
    //                     PRODUCTION_PURPOSE tb_2
    //                         ON tb_1.PRODUCTION_PURPOSE_ID = tb_2.PRODUCTION_PURPOSE_ID
    //                         INNER JOIN
    //                     FLOW tb_3
    //                         ON tb_1.FLOW_ID = tb_3.FLOW_ID
    //                         INNER JOIN
    //                     PRODUCT_MAIN tb_4
    //                         ON tb_1.PRODUCT_MAIN_ID = tb_4.PRODUCT_MAIN_ID
    //                         INNER JOIN
    //                     PRODUCT_CATEGORY tb_5
    //                         ON tb_4.PRODUCT_CATEGORY_ID = tb_5.PRODUCT_CATEGORY_ID`,

    //   selectInuseForSearch: `
    //         (IF (tb_1.INUSE = 0 ,0 ,IF(
    //                                 EXISTS
    //                                         (
    //                                             SELECT
    //                                                 tbs_1.BOM_ID
    //                                             FROM
    //                                                 SCT_BOM tbs_1
    //                                                         INNER JOIN
    //                                                 SCT tbs_2 ON tbs_1.SCT_ID = tbs_2.SCT_ID
    //                                                 AND tbs_2.INUSE = 1 AND tbs_1.INUSE = 1
    //                                                 AND tbs_1.BOM_ID = tb_1.BOM_ID) = TRUE
    //                                         , 2
    //                                         ,   IF(
    //                                                     EXISTS
    //                                                     (
    //                                                             SELECT
    //                                                                 BOM_ID
    //                                                             FROM
    //                                                                 SCT_BOM
    //                                                             WHERE
    //                                                                 BOM_ID = tb_1.BOM_ID
    //                                                     ) = TRUE
    //                                         , 3
    //                                         , 1
    //                                         )))) AS inuseForSearch
    //       `,
    // }

    // getSqlWhere(dataItem, tableIds)

    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''
    if (typeof dataItem.Order === 'string') {
      try {
        dataItem.Order = JSON.parse(dataItem.Order) // แปลง string → array
      } catch (error) {
        console.error('Error parsing Order:', error)
        dataItem.Order = [] // ถ้าพาร์สไม่ผ่าน ให้กำหนดเป็นอาร์เรย์ว่าง
      }
    }
    if (dataItem['Order'].length <= 0) {
      orderBy = 'tb_1.UPDATE_DATE DESC'
    } else {
      for (let i = 0; i < dataItem['Order'].length; i++) {
        const word = dataItem['Order'][i]
        if (word['id'] == 'PRODUCTION_PURPOSE_NAME') {
          orderBy += 'tb_2.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'FLOW_CODE' || word['id'] == 'FLOW_NAME') {
          orderBy += 'tb_3.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'PRODUCT_MAIN_NAME') {
          orderBy += 'tb_4.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'PRODUCT_CATEGORY_NAME') {
          orderBy += 'tb_5.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'TOTAL_COUNT_PROCESS') {
          orderBy += 'tb_3.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'INUSE') {
          orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else {
          orderBy += 'tb_1.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        }
      }
      orderBy = orderBy.slice(0, -1)
    }
    dataItem['Order'] = orderBy

    let sqlWhereColumnFilter = ''

    if (dataItem?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    }

    dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter
    // console.log(dataItem)

    let result = await BomModel.search(dataItem)
    // for (let i = 0; i < result[1]?.length; i++) {
    //   result[1][i]['No'] = i + 1
    // }

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Process',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  getByBomNameAndProductMainIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await BomModel.getByBomNameAndProductMainIdAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result || [],
      TotalCountOnDb: result?.length ?? 0,
      MethodOnDb: '',
      Message: '',
    } as ResponseI)
  },
  getByBomCodeAndProductMainIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await BomModel.getByBomCodeAndProductMainIdAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result || [],
      TotalCountOnDb: result?.length ?? 0,
      MethodOnDb: '',
      Message: '',
    } as ResponseI)
  },

  getByLikeBomNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await BomModel.getByLikeBomNameAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeProductCategoryNameAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeProductCategoryNameAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getByLikeBomCodeAndProductMainIdAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await BomModel.getByLikeBomCodeAndProductMainIdAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'getByLikeBomCodeAndProductMainIdAndInuse',
      Message: 'getByLikeBomCodeAndProductMainIdAndInuse',
    } as ResponseI)
  },

  searchBomDetailsByBomId: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = (await BomModel.searchBomDetailsByBomId(dataItem)) as RowDataPacket[]
    // console.log(result)

    let item: any = {}
    let listItemRawData: any = []
    let process: any = []
    let productMain = {}
    let bomName = ''
    let flowName = ''
    let bomCode = ''
    let flowCode = ''
    let productType: any = []

    if (result.length > 0) {
      process = result.map((res) => {
        const id = (Math.random() + 1).toString(36).substring(7)

        item[id] = {
          ITEM: {
            ...res,
          },
          ITEM_CATEGORY: {
            ITEM_CATEGORY_ID: res.ITEM_CATEGORY_ID,
            ITEM_CATEGORY_NAME: res.ITEM_CATEGORY_NAME,
            ITEM_CATEGORY_ALPHABET: res.ITEM_CATEGORY_ALPHABET,
          },
          PROCESS: {
            value: res.PROCESS_ID,
            label: res.PROCESS_NAME,
          },
          USAGE_QUANTITY: res?.USAGE_QUANTITY ? `${res.USAGE_QUANTITY}` : '',
        }

        if (res?.ITEM_ID) {
          listItemRawData.push({
            ITEM_ID: res.ITEM_ID,
            ITEM_CODE_FOR_SUPPORT_MES: res.ITEM_CODE_FOR_SUPPORT_MES,
            ITEM_INTERNAL_FULL_NAME: res.ITEM_INTERNAL_FULL_NAME,
            // ITEM_NAME: res.ITEM_NAME,
            // ITEM_CATEGORY_ID: res.ITEM_CATEGORY_ID,
            ITEM_CATEGORY_NAME: res.ITEM_CATEGORY_NAME,
            //ITEM_CATEGORY_ALPHABET: res.ITEM_CATEGORY_ALPHABET,
            // PROCESS_ID: res.PROCESS_ID,
            PROCESS_NAME: res.PROCESS_NAME,
            USAGE_QUANTITY: res.USAGE_QUANTITY,
            UNIT_OF_MEASUREMENT_NAME: res.UNIT_OF_MEASUREMENT_NAME,
          })
        }
        //  {
        //   ITEM: {
        //     ...res
        //   },
        //   ITEM_CATEGORY: {
        //     ITEM_CATEGORY_ID: res.ITEM_CATEGORY_ID,
        //     ITEM_CATEGORY_NAME: res.ITEM_CATEGORY_NAME,
        //     ITEM_CATEGORY_ALPHABET: res.ITEM_CATEGORY_ALPHABET
        //   },
        //   PROCESS: {
        //     value: res.PROCESS_ID,
        //     label: res.PROCESS_NAME
        //   },
        //   USAGE_QUANTITY: res?.USAGE_QUANTITY ? `${res.USAGE_QUANTITY}` : ''
        // }

        if (!res?.ITEM_ID) {
          delete item[id]
        }

        return {
          NO: res.NO,
          PROCESS_ID: res.PROCESS_ID,
          PROCESS_NAME: res.PROCESS_NAME,
        }
      })

      productType = result.map((res) => {
        return {
          PRODUCT_TYPE_ID: res.PRODUCT_TYPE_ID,
          PRODUCT_TYPE_CODE: res.PRODUCT_TYPE_CODE,
          PRODUCT_TYPE_NAME: res.PRODUCT_TYPE_NAME,
          IS_OLD: true,
        }
      })

      productMain = {
        PRODUCT_MAIN_ID: result[0].PRODUCT_MAIN_ID,
        PRODUCT_MAIN_NAME: result[0].PRODUCT_MAIN_NAME,
        PRODUCT_MAIN_ALPHABET: result[0].PRODUCT_MAIN_ALPHABET,
        PRODUCT_CATEGORY_NAME: result[0].PRODUCT_CATEGORY_NAME,
        PRODUCT_CATEGORY_ID: result[0].PRODUCT_CATEGORY_ID,
      }

      bomName = result[0].BOM_NAME
      bomCode = result[0].BOM_CODE

      flowName = result[0].FLOW_NAME
      flowCode = result[0].FLOW_CODE

      process = process.filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.NO === v.NO) === i)

      productType = productType.filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.PRODUCT_TYPE_ID === v.PRODUCT_TYPE_ID) === i)

      process = process.filter((v: any) => v.PROCESS_ID !== null)

      productType = productType.filter((v: any) => v.PRODUCT_TYPE_ID !== null)
    }

    // result = {
    //   ITEM: item,
    //   ITEM_RAW_DATA: listItemRawData,
    //   PROCESS: process,
    //   productMain: productMain,
    //   bomName: bomName,
    //   flowName: flowName,
    //   bomCode: bomCode,
    //   flowCode: flowCode,
    //   productType: productType,
    // }

    res.json({
      Status: true,
      ResultOnDb: [
        {
          ITEM: item,
          ITEM_RAW_DATA: listItemRawData,
          PROCESS: process,
          productMain: productMain,
          bomName: bomName,
          flowName: flowName,
          bomCode: bomCode,
          flowCode: flowCode,
          productType: productType,
        },
      ],
      MethodOnDb: 'Get Bom Details',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  searchBomDetailsByBomIdAndProductTypeId: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = (await BomModel.searchBomDetailsByBomIdAndProductTypeId(dataItem)) as RowDataPacket[]

    let item: any = {}
    let listItemRawData: any = []
    let process: any = []
    let productMain = {}
    let bomName = ''
    let flowName = ''
    let bomCode = ''
    let flowCode = ''
    let productType: any = []

    if (result.length > 0) {
      process = result.map((res) => {
        const id = (Math.random() + 1).toString(36).substring(7)

        item[id] = {
          ITEM: {
            ...res,
          },
          ITEM_CATEGORY: {
            ITEM_CATEGORY_ID: res.ITEM_CATEGORY_ID,
            ITEM_CATEGORY_NAME: res.ITEM_CATEGORY_NAME,
            ITEM_CATEGORY_ALPHABET: res.ITEM_CATEGORY_ALPHABET,
          },
          PROCESS: {
            value: res.PROCESS_ID,
            label: res.PROCESS_NAME,
          },
          USAGE_QUANTITY: res?.USAGE_QUANTITY ? `${res.USAGE_QUANTITY}` : '',
        }

        if (res?.ITEM_ID) {
          listItemRawData.push({
            ITEM_ID: res.ITEM_ID,
            ITEM_CODE_FOR_SUPPORT_MES: res.ITEM_CODE_FOR_SUPPORT_MES,
            ITEM_INTERNAL_FULL_NAME: res.ITEM_INTERNAL_FULL_NAME,
            // ITEM_NAME: res.ITEM_NAME,
            // ITEM_CATEGORY_ID: res.ITEM_CATEGORY_ID,
            ITEM_CATEGORY_NAME: res.ITEM_CATEGORY_NAME,
            //ITEM_CATEGORY_ALPHABET: res.ITEM_CATEGORY_ALPHABET,
            // PROCESS_ID: res.PROCESS_ID,
            PROCESS_NAME: res.PROCESS_NAME,
            USAGE_QUANTITY: res.USAGE_QUANTITY,
            UNIT_OF_MEASUREMENT_NAME: res.UNIT_OF_MEASUREMENT_NAME,
          })
        }
        //  {
        //   ITEM: {
        //     ...res
        //   },
        //   ITEM_CATEGORY: {
        //     ITEM_CATEGORY_ID: res.ITEM_CATEGORY_ID,
        //     ITEM_CATEGORY_NAME: res.ITEM_CATEGORY_NAME,
        //     ITEM_CATEGORY_ALPHABET: res.ITEM_CATEGORY_ALPHABET
        //   },
        //   PROCESS: {
        //     value: res.PROCESS_ID,
        //     label: res.PROCESS_NAME
        //   },
        //   USAGE_QUANTITY: res?.USAGE_QUANTITY ? `${res.USAGE_QUANTITY}` : ''
        // }

        if (!res?.ITEM_ID) {
          delete item[id]
        }

        return {
          NO: res.NO,
          PROCESS_ID: res.PROCESS_ID,
          PROCESS_NAME: res.PROCESS_NAME,
        }
      })

      productType = result.map((res) => {
        return {
          PRODUCT_TYPE_ID: res.PRODUCT_TYPE_ID,
          PRODUCT_TYPE_CODE: res.PRODUCT_TYPE_CODE,
          PRODUCT_TYPE_NAME: res.PRODUCT_TYPE_NAME,
          IS_OLD: true,
        }
      })

      productMain = {
        PRODUCT_MAIN_ID: result[0].PRODUCT_MAIN_ID,
        PRODUCT_MAIN_NAME: result[0].PRODUCT_MAIN_NAME,
        PRODUCT_MAIN_ALPHABET: result[0].PRODUCT_MAIN_ALPHABET,
        PRODUCT_CATEGORY_NAME: result[0].PRODUCT_CATEGORY_NAME,
        PRODUCT_CATEGORY_ID: result[0].PRODUCT_CATEGORY_ID,
      }

      bomName = result[0].BOM_NAME
      bomCode = result[0].BOM_CODE

      flowName = result[0].FLOW_NAME
      flowCode = result[0].FLOW_CODE

      process = process.filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.NO === v.NO) === i)

      productType = productType.filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.PRODUCT_TYPE_ID === v.PRODUCT_TYPE_ID) === i)

      process = process.filter((v: any) => v.PROCESS_ID !== null)

      productType = productType.filter((v: any) => v.PRODUCT_TYPE_ID !== null)
    }

    // result = {
    //   ITEM: item,
    //   ITEM_RAW_DATA: listItemRawData,
    //   PROCESS: process,
    //   productMain: productMain,
    //   bomName: bomName,
    //   flowName: flowName,
    //   bomCode: bomCode,
    //   flowCode: flowCode,
    //   productType: productType,
    // }

    res.json({
      Status: true,
      ResultOnDb: [
        {
          ITEM: item,
          ITEM_RAW_DATA: listItemRawData,
          PROCESS: process,
          productMain: productMain,
          bomName: bomName,
          flowName: flowName,
          bomCode: bomCode,
          flowCode: flowCode,
          productType: productType,
        },
      ],
      MethodOnDb: 'Get Bom Details',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  create: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const flowProcessBody = dataItem.FLOW_PROCESS
    //* Check is flow process is exist
    let flowId = (await FlowModel.checkFlowProcessExist(flowProcessBody)) as RowDataPacket[]

    let countFlowId: any = {}
    for (let i = 0; i < flowId.length; i++) {
      for (let j = 0; j < flowId[i].length; j++) {
        if (countFlowId[flowId[i][j].FLOW_ID]) {
          countFlowId[flowId[i][j].FLOW_ID]++
        } else {
          countFlowId[flowId[i][j].FLOW_ID] = 1
        }
      }
    }

    let oldFlowId = ''

    for (let [key, value] of Object.entries(countFlowId)) {
      if (flowProcessBody.length === value) {
        oldFlowId = key
        break
      }
    }

    let flow = []
    let flowProcess = []

    if (oldFlowId) {
      dataItem['FLOW_ID'] = oldFlowId

      const oldFlow = (await FlowProcessModel.searchProcessByFlowProcessId({ FLOW_ID: oldFlowId })) as RowDataPacket[]

      for (let i = 0; i < oldFlow.length; i++) {
        flowProcess.push({
          FLOW_PROCESS_ID: oldFlow[i].FLOW_PROCESS_ID,
          PROCESS_ID: oldFlow[i].PROCESS_ID,
        })
      }
    } else {
      // console.log('create flow')

      flow = (await BomModel.createFlowFromCreateBom(dataItem)) as any
      // console.log(flow)

      // console.log('flow', flow.ResultOnDb[0][2][0].FLOW_ID)

      if (flow.Status === false) {
        res.status(200).json({
          Status: false,
          ResultOnDb: [],
          TotalCountOnDb: 0,
          MethodOnDb: 'Create Flow',
          Message: 'ไม่สามารถสร้าง Flow ได้',
        } as ResponseI)
      }
      // console.log('flow', flow.ResultOnDb[0][2][0].FLOW_ID)
      const flowId = flow.ResultOnDb[flow.ResultOnDb.length - 1]

      dataItem['FLOW_ID'] = flowId.FLOW_ID

      let i = 0
      while (true) {
        if (!flow.ResultOnDb?.[i] || !flow.ResultOnDb[i][2]?.[0]) {
          break
        }

        flowProcess.push({
          FLOW_PROCESS_ID: flow.ResultOnDb[i][2][0].FLOW_PROCESS_ID,
          PROCESS_ID: flow.ResultOnDb[i][2][0].PROCESS_ID,
        })

        i++
      }
    }
    // console.log('flowProcess', flowProcess)

    let bomFlowProcessItemUsage = []
    let bomItemCategory = []

    for (let i = 0; i < Object.values(dataItem['ITEM']).length; i++) {
      let item = Object.values(dataItem['ITEM'])[i] as ItemType

      const flowProcessId = flowProcess.filter((f) => {
        return Number(f.PROCESS_ID) === item.PROCESS.value
      })

      bomFlowProcessItemUsage.push({
        FLOW_PROCESS_ID: flowProcessId[0].FLOW_PROCESS_ID,
        NO: i + 1,
        ITEM_ID: item.ITEM.ITEM_ID,
        USAGE_QUANTITY: item.USAGE_QUANTITY,
        CREATE_BY: dataItem.CREATE_BY,
      })

      bomItemCategory.push({
        FLOW_PROCESS_ID: flowProcessId[0].FLOW_PROCESS_ID,
        NO: i + 1,
        ITEM_ID: item.ITEM.ITEM_ID,
        ITEM_CATEGORY_ID: item.ITEM_CATEGORY.ITEM_CATEGORY_ID,
        CREATE_BY: dataItem.CREATE_BY,
      })
    }

    dataItem['ITEM_USAGE'] = bomFlowProcessItemUsage
    dataItem['ITEM_CATEGORY'] = bomItemCategory
    // console.log(dataItem)

    let result = await BomModel.create(dataItem)

    res.status(200).json(result as ResponseI)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const flowProcessBody = dataItem.FLOW_PROCESS

    //* Check is flow process is exist
    let flowId = (await FlowModel.checkFlowProcessExist(flowProcessBody)) as RowDataPacket[]

    let countFlowId: any = {}
    for (let i = 0; i < flowId.length; i++) {
      for (let j = 0; j < flowId[i].length; j++) {
        if (countFlowId[flowId[i][j].FLOW_ID]) {
          countFlowId[flowId[i][j].FLOW_ID]++
        } else {
          countFlowId[flowId[i][j].FLOW_ID] = 1
        }
      }
    }

    let oldFlowId = ''

    for (let [key, value] of Object.entries(countFlowId)) {
      if (flowProcessBody.length === value) {
        oldFlowId = key
        break
      }
    }

    let flow = []
    let flowProcess = []

    if (oldFlowId) {
      dataItem['FLOW_ID'] = oldFlowId

      const oldFlow = (await FlowProcessModel.searchProcessByFlowProcessId({ FLOW_ID: oldFlowId })) as RowDataPacket[]

      for (let i = 0; i < oldFlow.length; i++) {
        flowProcess.push({
          FLOW_PROCESS_ID: oldFlow[i].FLOW_PROCESS_ID,
          PROCESS_ID: oldFlow[i].PROCESS_ID,
        })
      }
    } else {
      flow = (await BomModel.createFlowFromCreateBom(dataItem)) as any

      if (flow.Status === false && flow.ResultOnDb === false) {
        res.status(200).json({
          Status: false,
          Message: 'Flow name ที่ต้องการ มีอยู่แล้ว Flow name already exists ',
          ResultOnDb: false,
          MethodOnDb: 'Flow name ที่ต้องการ มีอยู่แล้ว Flow name already exists',
          TotalCountOnDb: 0,
        } as ResponseI)
      } else if (flow.Status === false) {
        res.status(200).json({
          Status: false,
          ResultOnDb: [],
          TotalCountOnDb: 0,
          MethodOnDb: 'Create Flow',
          Message: 'ไม่สามารถสร้าง Flow ได้',
        } as ResponseI)
      }
      // console.log('flow', flow)

      const flowId = flow.ResultOnDb[flow.ResultOnDb.length - 1]
      //  console.log('flowId', flowId)

      dataItem['FLOW_ID'] = flowId.FLOW_ID
      //  console.log(dataItem['FLOW_ID'])

      let i = 0
      while (true) {
        if (!flow.ResultOnDb?.[i] || !flow.ResultOnDb[i][2]?.[0]) {
          break
        }

        flowProcess.push({
          FLOW_PROCESS_ID: flow.ResultOnDb[i][2][0].FLOW_PROCESS_ID,
          PROCESS_ID: flow.ResultOnDb[i][2][0].PROCESS_ID,
        })

        i++
      }
    }

    let bomFlowProcessItemUsage = []
    let bomItemCategory = []

    for (let i = 0; i < Object.values(dataItem['ITEM']).length; i++) {
      let item = Object.values(dataItem['ITEM'])[i] as ItemType

      const flowProcessId = flowProcess.filter((f) => {
        return Number(f.PROCESS_ID) === item.PROCESS.value
      })

      if (flowProcessId.length !== 0) {
        bomFlowProcessItemUsage.push({
          FLOW_PROCESS_ID: flowProcessId[0].FLOW_PROCESS_ID,
          NO: i + 1,
          ITEM_ID: item.ITEM.ITEM_ID,
          USAGE_QUANTITY: item.USAGE_QUANTITY,
          CREATE_BY: dataItem.CREATE_BY,
        })

        bomItemCategory.push({
          FLOW_PROCESS_ID: flowProcessId[0].FLOW_PROCESS_ID,
          NO: i + 1,
          ITEM_ID: item.ITEM.ITEM_ID,
          ITEM_CATEGORY_ID: item.ITEM_CATEGORY.ITEM_CATEGORY_ID,
          CREATE_BY: dataItem.CREATE_BY,
        })
      }
    }

    dataItem['ITEM_USAGE'] = bomFlowProcessItemUsage
    dataItem['ITEM_CATEGORY'] = bomItemCategory
    // console.log(dataItem)

    let result = await BomModel.update(dataItem)

    res.status(200).json(result as ResponseI)
  },
  updateBomProductType: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await BomModel.updateBomProductType(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Update Bom - Product Type',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    } as ResponseI)
  },
  Delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await BomModel.Delete(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Delete Bom',
      Message: 'ลบข้อมูลสำเร็จ Successfully deleted',
    } as ResponseI)
  },
  // !! use for batch change material only
  getBomDetailByBomId: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await BomModel.getBomDetailByBomId(dataItem)

    let dataResult: any = []

    for (const [index, item] of dataItem['LIST_DATA'].entries()) {
      dataResult[index] = {
        SCT_ID: item.SCT_ID,
        FLOW_PROCESS: result[index],
      }
    }

    res.json({
      Status: true,
      ResultOnDb: dataResult,
      TotalCountOnDb: 0,
      MethodOnDb: 'getBomDetailByBomId',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getBomByLikeProductTypeIdAndCondition: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await BomModel.getBomByLikeProductTypeIdAndCondition(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'getBomByLikeProductTypeIdAndCondition',
      Message: 'Get Data Success',
    } as ResponseI)
  },
  getItemCodeForSupportMes: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await BomModel.getItemCodeForSupportMes(dataItem)

    res.json({
      Status: true,
      Message: 'getItemCodeForSupportMes Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getItemCodeForSupportMes',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  getBOMNameByLike: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await BomModel.getBOMNameByLike(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'getBOMNameByLike',
      Message: 'Get Data Success',
    } as ResponseI)
  },
  getBOMCodeByLike: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await BomModel.getBOMCodeByLike(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'getBOMCodeByLike',
      Message: 'Get Data Success',
    } as ResponseI)
  },
  getByLikeBomCodeAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await BomModel.getByLikeBomCodeAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeBomCodeAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeBomCodeAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
}
