import { SpecificationSettingModel } from '@models/specification-setting/SpecificationSettingModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const SpecificationSettingController = {
  // search: async ({ body }) => {
  //   const tableIds = [
  //     { table: 'tb_1', id: 'CUSTOMER_ORDER_FROM_ID', Fns: '=' },
  //     { table: 'tb_2', id: 'CUSTOMER_ORDER_FROM_NAME', Fns: 'LIKE' },

  //     { table: 'tb_1', id: 'PRODUCT_MAIN_ID', Fns: '=' },
  //     { table: 'tb_3', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },

  //     { table: 'tb_1', id: 'PRODUCT_SPECIFICATION_TYPE_ID', Fns: '=' },
  //     { table: 'tb_4', id: 'PRODUCT_SPECIFICATION_TYPE_NAME', Fns: 'LIKE' },

  //     { table: 'tb_1', id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'PRODUCT_MODEL_NUMBER', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'PRODUCT_PART_NUMBER', Fns: 'LIKE' },
  //     // { table: '', id: 'inuseForSearch', Fns: '=' },

  //     { table: 'tb_1', id: 'CRATE_BY', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'CRATE_DATE', Fns: '=' },
  //     { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' }
  //   ]

  //   // getSqlWhere(body, tableIds)

  //   body['Start'] = Number(body['Start']) * Number(body['Limit'])
  //   let orderBy = ''

  //   if (body['Order'] == '') {
  //     orderBy = 'tb_1.UPDATE_DATE DESC'
  //   } else {
  //     for (let i = 0; i < JSON.parse(body['Order']).length; i++) {
  //       const word = JSON.parse(body['Order'])[i]
  //       let prefix = 'tb_1.'
  //       if (word['id'] === 'CUSTOMER_ORDER_FROM_NAME') {
  //         prefix = 'tb_2.'
  //       } else if (word['id'] === 'PRODUCT_MAIN_NAME') {
  //         prefix = 'tb_3.'
  //       } else if (word['id'] === 'PRODUCT_SPECIFICATION_TYPE_NAME') {
  //         prefix = 'tb_4.'
  //       }
  //       // orderBy += 'tb_1.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
  //       orderBy += prefix + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','

  //       // console.log('orderBySpecSearch', orderBy)
  //     }
  //     orderBy = orderBy.slice(0, -1)
  //   }
  //   body['Order'] = orderBy

  //   // let sqlWhereColumnFilter = ''
  //   // if (body?.ColumnFilters?.length > 0) {
  //   //   sqlWhereColumnFilter += getSqlWhereByColumnFilters(body.ColumnFilters, tableIds)
  //   // }

  //   // body['sqlWhereColumnFilter'] = sqlWhereColumnFilter

  //   // console.log('sqlWhereColumnFilter', body['sqlWhereColumnFilter'])

  //   // สร้างคำสั่ง Search Where
  //   const searchFilters = body.SearchFilters.filter(item => item.value !== '')
  //     .map(item => {
  //       const dataItem = tableIds.find(i => i.id === item.id)
  //       if (!dataItem) return ''

  //       const value = dataItem.Fns === 'LIKE' ? `%${item.value}%` : item.value
  //       return `${dataItem.table}.${item.id} ${dataItem.Fns} '${value}'`
  //     })
  //     .filter(Boolean)
  //     .join(' AND ')

  //   body.sqlWhere = searchFilters

  //   // สร้างคำสั่ง Column Where
  //   const sqlWhereColumnFilter = body.ColumnFilters.length
  //     ? getSqlWhereByColumnFilters(body.ColumnFilters, tableIds)
  //     : ''

  //   // รวมคำสั่ง WHERE
  //   if (body.sqlWhere || sqlWhereColumnFilter) {
  //     body.sqlWhere = `WHERE ${body.sqlWhere} ${
  //       body.sqlWhere && sqlWhereColumnFilter ? 'AND' : ''
  //     } ${sqlWhereColumnFilter}`
  //   }
  //   console.log('sqlWhere666', body.sqlWhere)

  //   const result = await SpecificationSettingModel.search(body)
  //   return {
  //     Status: true,
  //     Message: 'Search Data Success',
  //     ResultOnDb: result[1] || [],
  //     MethodOnDb: 'Search SpecificationSQL',
  //     TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0
  //   } as ResponseI
  //   // if (body !== '') {
  //   //   const result = await SpecificationSettingModel.search(body)
  //   //   return {
  //   //     Status: true,
  //   //     Message: 'Search Data Success',
  //   //     ResultOnDb: result[1] || [],
  //   //     MethodOnDb: 'Search SpecificationSQL',
  //   //     TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0
  //   //   } as ResponseI
  //   // }
  // },
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_1', id: 'CUSTOMER_ORDER_FROM_ID', Fns: '=' },
      { table: 'tb_2', id: 'CUSTOMER_ORDER_FROM_NAME', Fns: 'LIKE' },

      { table: 'tb_1', id: 'PRODUCT_MAIN_ID', Fns: '=' },
      { table: 'tb_3', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },

      { table: 'tb_1', id: 'PRODUCT_SPECIFICATION_TYPE_ID', Fns: '=' },
      { table: 'tb_4', id: 'PRODUCT_SPECIFICATION_TYPE_NAME', Fns: 'LIKE' },

      { table: 'tb_1', id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_MODEL_NUMBER', Fns: 'LIKE' },
      { table: 'tb_1', id: 'PRODUCT_PART_NUMBER', Fns: 'LIKE' },
      // { table: '', id: 'inuseForSearch', Fns: '=' },

      { table: 'tb_1', id: 'CRATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CRATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
    ]

    getSqlWhere(dataItem, tableIds)

    // ค้นหาข้อมูล
    const result = await SpecificationSettingModel.search(dataItem)

    res.status(200).json({
      Status: true,
      Message: 'Search Data Success',
      ResultOnDb: result[1],
      MethodOnDb: 'Search ProductCategory',
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'],
    } as ResponseI)
  },

  // // #region GET ของ TimeRecord
  // search: async query => {
  //   console.log('bodyyyyyyyyyyyy' + query)

  //   let dataItem

  //   if (typeof query === 'string') {
  //     try {
  //       dataItem = JSON.parse(query) // แปลง string JSON เป็น object
  //     } catch (error) {
  //       console.error('Invalid JSON string:', query, error)
  //       dataItem = null // กรณี JSON string ไม่ถูกต้อง
  //     }
  //   } else if (typeof query === 'object' && query !== null) {
  //     dataItem = query // ถ้าเป็น object ให้ใช้ได้เลย
  //   } else {
  //     console.error('Unexpected query format:', query)
  //     dataItem = null // กรณี query เป็น undefined, null, หรือ type อื่นที่ไม่คาดคิด
  //   }

  //   const tableIds = [
  //     { table: 'tb_1', id: 'CUSTOMER_ORDER_FROM_ID', Fns: '=' },
  //     { table: 'tb_2', id: 'CUSTOMER_ORDER_FROM_NAME', Fns: 'LIKE' },

  //     { table: 'tb_1', id: 'PRODUCT_MAIN_ID', Fns: '=' },
  //     { table: 'tb_3', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },

  //     { table: 'tb_1', id: 'PRODUCT_SPECIFICATION_TYPE_ID', Fns: '=' },
  //     { table: 'tb_4', id: 'PRODUCT_SPECIFICATION_TYPE_NAME', Fns: 'LIKE' },

  //     { table: 'tb_1', id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'PRODUCT_MODEL_NUMBER', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'PRODUCT_PART_NUMBER', Fns: 'LIKE' },
  //     // { table: '', id: 'inuseForSearch', Fns: '=' },

  //     { table: 'tb_1', id: 'CRATE_BY', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'CRATE_DATE', Fns: '=' },
  //     { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' }
  //   ]

  //   // getSqlWhere(body, tableIds)

  //   dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])

  //   let orderBy = ''

  //   if (!dataItem.hasOwnProperty('Order')) {
  //     orderBy = 'tb_1.UPDATE_DATE DESC'
  //   } else {
  //     for (let i = 0; i < dataItem['Order'].length; i++) {
  //       const word = dataItem['Order'][i]
  //       let prefix = 'tb_1.'
  //       if (word['id'] === 'CUSTOMER_ORDER_FROM_NAME') {
  //         prefix = 'tb_2.'
  //       } else if (word['id'] === 'PRODUCT_MAIN_NAME') {
  //         prefix = 'tb_3.'
  //       } else if (word['id'] === 'PRODUCT_SPECIFICATION_TYPE_NAME') {
  //         prefix = 'tb_4.'
  //       }
  //       // orderBy += 'tb_1.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
  //       orderBy += prefix + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','

  //       console.log('orderBySpecSearch', orderBy)
  //     }
  //     orderBy = orderBy.slice(0, -1)
  //   }
  //   dataItem['Order'] = orderBy

  //   let sqlWhereColumnFilter = ''
  //   if (dataItem?.ColumnFilters?.length > 0) {
  //     sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
  //   }

  //   dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

  //   console.log('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])

  //   const result = await SpecificationSettingModel.search(dataItem)
  //   return {
  //     Status: true,
  //     Message: 'Search Data Success',
  //     ResultOnDb: result[1] || [],
  //     MethodOnDb: 'Search SpecificationSQL',
  //     TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0
  //   } as ResponseI
  // },
  //#endregion
  getByLikeSpecificationSettingAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    let result = await SpecificationSettingModel.getByLikeSpecificationSettingAndInuse(dataItem)

    res.json({
      Status: true,
      Message: 'getByLikeSpecificationSettingAndInuse Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getByLikeSpecificationSettingAndInuse Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },

  // getBySpecificationSettingForCopy: async () => {
  //   // console.log('1111111111111111111111111111111111111111111111')
  //   const result = await SpecificationSettingModel.getBySpecificationSettingForCopy()

  //   for (let i = 0; i < result[1].length; i++) {
  //     result[1][i]['No'] = i + 1
  //   }

  //   return {
  //     Status: true,
  //     ResultOnDb: result[1],
  //     TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
  //     MethodOnDb: '',
  //     Message: '',
  //   } as ResponseI
  // },

  create: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    await SpecificationSettingModel.create(dataItem)
    res.status(200).json({
      Status: true,
      Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
      ResultOnDb: [],
      MethodOnDb: 'Create Data',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  update: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await SpecificationSettingModel.update(dataItem)

    res.json({
      Status: true,
      Message: 'อัปเดตข้อมูลเรียบร้อยแล้ว Data has been updated successfully',
      ResultOnDb: result,
      MethodOnDb: 'Update Product Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  delete: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await SpecificationSettingModel.delete(dataItem)

    res.json({
      Status: true,
      Message: 'ลบข้อมูลเรียบร้อยแล้ว Data has been deleted successfully',
      ResultOnDb: result,
      MethodOnDb: 'Delete Product Category',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  // GetByLikeCustomerOrderFromNameAndInuse: async ({ query }) => {
  //   if (query !== '') {
  //     let result = await SpecificationSettingModel.getByLikeCustomerOrderFromNameAndInuse(query)
  //     return {
  //       Status: true,
  //       Message: 'getByLikeCustomerOrderFromNameAndInuse Data Success',
  //       ResultOnDb: result,
  //       MethodOnDb: 'getByLikeCustomerOrderFromNameAndInuse Category',
  //       TotalCountOnDb: ''
  //     }
  //   }
  // }
  // GetByLikeProductMainNameAndProductCategoryIdAndInuse: async ({ query }) => {
  //   if (query !== '') {
  //     let result = await ProductMainModel.getByLikeProductMainNameAndProductCategoryIdAndInuse(query)
  //     return {
  //       Status: true,
  //       Message: 'getByLikeProductMainNameAndInuse Data Success',
  //       ResultOnDb: result,
  //       MethodOnDb: 'getByLikeProductMainNameAndInuse Category',
  //       TotalCountOnDb: ''
  //     }
  //   }
  // }
}
