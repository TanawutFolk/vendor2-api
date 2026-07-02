import { VendorModel } from '@src/_workspace/models/item-master/vendor/VendorModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const VendorController = {
  getItemImportType: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await VendorModel.getItemImportType(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item Import Type',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  getVendor: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await VendorModel.getVendor(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Vendor',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  searchVendor: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const tableIds = [
      { table: 'tb_1', id: 'VENDOR_ID', Fns: '=' },
      { table: 'tb_1', id: 'VENDOR_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'VENDOR_ALPHABET', Fns: 'LIKE' },
      { table: 'tb_2', id: 'ITEM_IMPORT_TYPE_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'VENDOR_CD_PRONES', Fns: 'LIKE' },
      { table: 'tb_1', id: 'VENDOR_NAME_PRONES', Fns: 'LIKE' },
      { table: 'tb_1', id: 'INUSE', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
      { table: 'tb_1', id: 'INUSE', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: `
                          VENDOR tb_1
            LEFT JOIN
                ITEM_IMPORT_TYPE tb_2
            ON
                tb_1.ITEM_IMPORT_TYPE_ID = tb_2.ITEM_IMPORT_TYPE_ID`,

      selectInuseForSearch: `
        tb_1.INUSE AS inuseForSearch
      `,
    }

    // Use getSqlWhere to construct the WHERE clause
    getSqlWhere(dataItem, tableIds)
    // dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    // let orderBy = ''
    // if (typeof dataItem.Order === 'string') {
    //   try {
    //     dataItem.Order = JSON.parse(dataItem.Order) // แปลง string → array
    //   } catch (error) {
    //     console.error('Error parsing Order:', error)
    //     dataItem.Order = [] // ถ้าพาร์สไม่ผ่าน ให้กำหนดเป็นอาร์เรย์ว่าง
    //   }
    // }
    // if (dataItem['Order'].length <= 0) {
    //   orderBy = 'tb_1.UPDATE_DATE DESC'
    // } else {
    //   for (let i = 0; i < dataItem['Order'].length; i++) {
    //     const word = dataItem['Order'][i]
    //     orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
    //   }
    //   orderBy = orderBy.slice(0, -1)
    // }
    // dataItem['Order'] = orderBy

    // let sqlWhereColumnFilter = ''
    // if (dataItem?.ColumnFilters?.length > 0) {
    //   sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
    // }

    // dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    const result = await VendorModel.searchVendor(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Vendor',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  createVendor: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    const result = await VendorModel.createVendor(dataItem)

    res.status(200).json(result as ResponseI)
  },

  updateVendor: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await VendorModel.updateVendor(dataItem)

    res.json(result as ResponseI)
  },

  deleteVendor: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await VendorModel.deleteVendor(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Delete Vendor',
      Message: 'ลบข้อมูลสำเร็จ Successfully deleted',
    } as ResponseI)
  },

  getByLikeVendorName: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await VendorModel.getByLikeVendorName(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'GetByLikeVendorName',
      Message: 'Search Data Success',
    } as ResponseI)
  },

  getByLikeVendorAlphabetAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await VendorModel.getByLikeVendorAlphabetAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'GetByLikeVendorAlphabetAndInuse',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeVendorNameAndImportType: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await VendorModel.getByLikeVendorNameAndImportType(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      MethodOnDb: 'GetByLikeVendorNameAndImportType',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
