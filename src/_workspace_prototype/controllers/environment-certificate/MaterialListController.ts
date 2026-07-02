import { getSqlWhereByColumnFilters } from '@helpers/getSqlWhereByFilterColumn'
import { MaterialListModel } from '@src/_workspace/models/environment-certificate/MaterialListModel'
import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'

export const MaterialListController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_8', id: 'ITEM_CATEGORY_NAME' },
      { table: 'tb_6', id: 'PRODUCT_CATEGORY_NAME' },
      { table: 'tb_5', id: 'PRODUCT_MAIN_NAME' },
      { table: 'tb_4', id: 'PRODUCT_SUB_NAME' },
      { table: 'tb_2', id: 'PRODUCT_TYPE_CODE', alias: 'SCT_CODE_FOR_SUPPORT_MES' },
      { table: 'tb_1', id: 'PRODUCT_TYPE_NAME' },
      { table: 'tb_11', id: 'CUSTOMER_INVOICE_TO_NAME' },
      { table: 'tb_2', id: 'PRODUCT_TYPE_CODE_SUB', alias: 'SCT_CODE_FOR_SUPPORT_MES' },
      { table: 'tb_1', id: 'PRODUCT_TYPE_NAME_SUB', alias: 'PRODUCT_TYPE_NAME' },
      { table: 'tb_17', id: 'BOM_CODE' },
      { table: 'tb_12', id: 'M_CODE_MES', alias: 'ITEM_CODE_FOR_SUPPORT_MES' },
      { table: 'tb_21', id: 'ITEM_CATEGORY_FROM_BOM', alias: 'ITEM_CATEGORY_NAME' },
      { table: 'tb_12', id: 'MATERIAL_EXTERNAL_FULL_NAME', alias: 'ITEM_EXTERNAL_FULL_NAME' },
      { table: 'tb_12', id: 'MATERIAL_EXTERNAL_SHORT_NAME', alias: 'ITEM_EXTERNAL_SHORT_NAME' },
      // { table: 'tb_', id: 'PURCHASE_SPECIFICATION_NO' },
      // { table: 'tb_', id: 'DRAWING_NO' },
      { table: 'tb_19', id: 'MADE_BY', alias: 'MADE_BY_NAME' },
      { table: 'tb_22', id: 'VENDOR_NAME' },
      { table: 'tb_23', id: 'MAKER_NAME' },
      { table: 'tb_25', id: 'ITEM_CATEGORY_FROM_ITEM_MASTER', alias: 'ITEM_CATEGORY_NAME' },
    ]

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
    if (dataItem['Order'].length > 0) {
      for (let i = 0; i < dataItem['Order'].length; i++) {
        const word = dataItem['Order'][i]
        if (word['id'] == 'ITEM_CATEGORY_NAME') {
          orderBy += ', tb_8.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'PRODUCT_CATEGORY_NAME') {
          orderBy += ', tb_6.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'PRODUCT_MAIN_NAME') {
          orderBy += ', tb_5.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'PRODUCT_SUB_NAME') {
          orderBy += ', tb_4.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'PRODUCT_TYPE_CODE') {
          orderBy += ', tb_2.' + 'SCT_CODE_FOR_SUPPORT_MES' + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'PRODUCT_TYPE_NAME') {
          orderBy += ', tb_1.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'CUSTOMER_INVOICE_TO_NAME') {
          orderBy += ', tb_11.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'PRODUCT_TYPE_CODE_SUB') {
          orderBy += ', tb_15.' + 'SCT_CODE_FOR_SUPPORT_MES' + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'PRODUCT_TYPE_NAME_SUB') {
          orderBy += ', tb_16.' + 'PRODUCT_TYPE_NAME' + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'BOM_CODE') {
          orderBy += ', tb_17.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'M_CODE_MES') {
          orderBy += ', tb_12.' + 'ITEM_CODE_FOR_SUPPORT_MES' + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'ITEM_CATEGORY_FROM_BOM') {
          orderBy += ', tb_21.' + 'ITEM_CATEGORY_NAME' + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'MATERIAL_EXTERNAL_FULL_NAME') {
          orderBy += ', tb_12.' + 'ITEM_EXTERNAL_FULL_NAME' + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'MATERIAL_EXTERNAL_SHORT_NAME') {
          orderBy += ', tb_12.' + 'ITEM_EXTERNAL_SHORT_NAME' + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'MADE_BY_NAME') {
          orderBy += ', tb_19.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'VENDOR_NAME') {
          orderBy += ', tb_22.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'MAKER_NAME') {
          orderBy += ', tb_23.' + word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
        } else if (word['id'] == 'ITEM_CATEGORY_FROM_ITEM_MASTER') {
          orderBy += ', tb_25.' + 'ITEM_CATEGORY_NAME' + (word['desc'] ? ' DESC' : ' ASC') + ','
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

    const result = await MaterialListModel.search(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]?.TOTAL_COUNT ?? 0,
      MethodOnDb: 'Search Material List',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  // searchExport: async (req: Request, res: Response) => {
  //   let dataItem

  //   if (Object.entries(req.body).length === 0) {
  //     dataItem = req.query
  //   } else {
  //     dataItem = req.body
  //   }
  //   const tableIds = [
  //     { table: 'tb_8', id: 'ITEM_CATEGORY_NAME' },
  //     { table: 'tb_6', id: 'PRODUCT_CATEGORY_NAME' },
  //     { table: 'tb_5', id: 'PRODUCT_MAIN_NAME' },
  //     { table: 'tb_4', id: 'PRODUCT_SUB_NAME' },
  //     { table: 'tb_2', id: 'SCT_CODE_FOR_SUPPORT_MES' },
  //     { table: 'tb_1', id: 'PRODUCT_TYPE_NAME' },
  //     { table: 'tb_11', id: 'CUSTOMER_INVOICE_TO_NAME' },
  //     { table: 'tb_2', id: 'SCT_CODE_FOR_SUPPORT_MES' },
  //     { table: 'tb_1', id: 'PRODUCT_TYPE_NAME' },
  //     { table: 'tb_17', id: 'BOM_CODE' },
  //     { table: 'tb_12', id: 'ITEM_CODE_FOR_SUPPORT_MES' },
  //     { table: 'tb_21', id: 'ITEM_CATEGORY_NAME' },
  //     { table: 'tb_12', id: 'ITEM_EXTERNAL_FULL_NAME' },
  //     { table: 'tb_12', id: 'ITEM_EXTERNAL_SHORT_NAME' },
  //     // { table: 'tb_', id: 'PURCHASE_SPECIFICATION_NO' },
  //     // { table: 'tb_', id: 'DRAWING_NO' },
  //     { table: 'tb_19', id: 'MADE_BY_NAME' },
  //     { table: 'tb_22', id: 'VENDOR_NAME' },
  //     { table: 'tb_23', id: 'MAKER_NAME' },
  //     { table: 'tb_25', id: 'ITEM_CATEGORY_NAME' },
  //   ]

  //   let sqlWhereColumnFilter = ''
  //   if (dataItem?.ColumnFilters?.length > 0) {
  //     sqlWhereColumnFilter += getSqlWhereByColumnFilters(dataItem.ColumnFilters, tableIds)
  //   }

  //   dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

  //   let result = await MaterialListModel.searchExport(dataItem)

  //   //console.log('130 controller', result)

  //   result = result.map((res: any) => {
  //     delete res.SCT_ID_SUB
  //     delete res.PRODUCT_MAIN_ID_MAIN
  //     if (dataItem.EXPORT_MODE_ID === '2' || dataItem.EXPORT_MODE_ID === 2) {
  //       res.STANDARD_COST_CODE_SUB = ''
  //       res.PRODUCT_TYPE_NAME_SUB = ''
  //     }
  //     return res
  //   })

  //   let columnWidths: any = []

  //   if (result.length > 0) {
  //     //* Init Column Widths from Header
  //     Object.keys(result[0]).map((key, i) => {
  //       columnWidths[i] = { wch: key.length + 2 }
  //     })

  //     //* Loop through each row and update column widths
  //     result.forEach((row: any) => {
  //       Object.values(row).map((v, i) => {
  //         if (v && columnWidths[i]?.wch) {
  //           columnWidths[i].wch = v.toString().length > columnWidths[i].wch ? v.toString().length : columnWidths[i].wch
  //         }
  //       })
  //     })
  //   }

  //   const workbook = XLSX.utils.book_new()
  //   const worksheet = XLSX.utils.json_to_sheet(result)

  //   worksheet['!cols'] = columnWidths
  //   worksheet['!autofilter'] = { ref: 'A1:Z1' }

  //   XLSX.utils.book_append_sheet(workbook, worksheet)

  //   XLSX.writeFile(workbook, 'Mat_List.xlsx')

  //   const file = Bun.file('Mat_List.xlsx')

  //   const resp = new Response(file)

  //   res.json(resp)
  // },
}
