import { ExchangeRateModel } from '@src/_workspace/models/cost-condition/ExchangeRateModel'
import { ItemModel } from '@src/_workspace/models/item-master/item/ItemModel'
import { StandardPriceModel } from '@src/_workspace/models/manufacturing-item/StandardPriceModel'
import formatNumber from '@src/_workspace/utils/formatNumber'
import { getSqlWhereByColumnFilters_elysia } from '@src/helpers/getSqlWhereByFilterColumn'
// import getSqlWhere from '@src/helpers/sqlWhere'
// import { ResponseI } from '@src/types/ResponseI'
import { Request, Response } from 'express'
import * as XLSX from 'xlsx'
const xl = require('excel4node')

export const StandardPriceController = {
  search: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const tableIds = [
      { table: 'tb_3', id: 'ITEM_CODE_FOR_SUPPORT_MES' },
      { table: 'tb_3', id: 'ITEM_INTERNAL_SHORT_NAME' },
      { table: 'tb_3', id: 'ITEM_INTERNAL_FULL_NAME' },
      { table: 'tb_1', id: 'NOTE' },
      { table: 'tb_2', id: 'PURCHASE_PRICE' },
      { table: 'tb_4', id: 'EXCHANGE_RATE_VALUE' },
      { table: 'tb_5', id: 'IMPORT_FEE_RATE' },
      { table: 'tb_10', id: 'PURCHASE_UNIT_NAME' },
      { table: 'tb_11', id: 'USAGE_UNIT_NAME' },
      { table: 'tb_1', id: 'ITEM_M_S_PRICE_VALUE' },
      { table: 'tb_1', id: 'UPDATE_BY' },
      { table: 'tb_1', id: 'UPDATE_DATE' },
    ]

    typeof dataItem
    dataItem['Start'] = Number(dataItem['Start']) * Number(dataItem['Limit'])
    let orderBy = ''

    if (dataItem['Order'].length <= 0) {
      orderBy = 'tb_1.UPDATE_DATE DESC'
    } else {
      for (let i = 0; i < dataItem['Order'].length; i++) {
        const word = dataItem['Order'][i]
        orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
      }
      orderBy = orderBy.slice(0, -1)
    }
    dataItem['Order'] = orderBy

    let sqlWhereColumnFilter = ''
    if (dataItem?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter += getSqlWhereByColumnFilters_elysia(dataItem.ColumnFilters, tableIds)
    }

    dataItem['sqlWhereColumnFilter'] = sqlWhereColumnFilter

    let result = await StandardPriceModel.search(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
      MethodOnDb: 'Search Cost Condition',
      Message: 'Search Data Success',
    })
  },
  // searchDataUnlimit: async (req: Request, res: Response) => {
  //   let dataItem

  //   if (!req.body || Object.entries(req.body).length === 0) {
  //     dataItem = req.query
  //   } else {
  //     dataItem = req.body
  //   }

  //   const tableIds = [
  //     { table: 'tb_3', id: 'ITEM_CODE_FOR_SUPPORT_MES', Fns: 'LIKE' },
  //     { table: 'tb_3', id: 'ITEM_INTERNAL_SHORT_NAME', Fns: 'LIKE' },
  //     { table: 'tb_2', id: 'PURCHASE_PRICE', Fns: '=' },
  //     { table: 'tb_4', id: 'EXCHANGE_RATE_VALUE', Fns: '=' },
  //     { table: 'tb_5', id: 'IMPORT_FEE_RATE', Fns: '=' },
  //     { table: 'tb_10', id: 'PURCHASE_UNIT_NAME', Fns: 'LIKE' },
  //     { table: 'tb_11', id: 'USAGE_UNIT_NAME', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'FISCAL_YEAR', Fns: '=' },
  //     { table: 'tb_1', id: 'ITEM_M_S_PRICE_VALUE', Fns: '=' },
  //     { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
  //     { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
  //   ]

  //   dataItem = {
  //     ...dataItem,
  //     sqlJoin: `  ITEM_M_S_PRICE tb_1
  //               JOIN
  //                   ITEM_M_O_PRICE tb_2
  //               ON
  //                   tb_1.ITEM_M_O_PRICE_ID = tb_2.ITEM_M_O_PRICE_ID
  //               JOIN
  //                   ITEM_MANUFACTURING tb_3
  //               ON
  //                   tb_2.ITEM_ID = tb_3.ITEM_ID
  //               JOIN
  //                   EXCHANGE_RATE tb_4
  //               ON
  //                   tb_1.EXCHANGE_RATE_ID = tb_4.EXCHANGE_RATE_ID
  //               JOIN
  //                   CURRENCY tb_6
  //               ON
  //                   tb_2.PURCHASE_PRICE_CURRENCY_ID = tb_6.CURRENCY_ID
  //               LEFT JOIN
  //                   IMPORT_FEE tb_5
  //               ON
  //                   tb_1.IMPORT_FEE_ID = tb_5.IMPORT_FEE_ID
  //                                       LEFT JOIN
  //               ITEM tb_7
  //                   ON tb_3.ITEM_ID = tb_7.ITEM_ID
  //                                       LEFT JOIN
  //                   vendor tb_8
  //                   ON tb_3.VENDOR_ID = tb_8.VENDOR_ID
  //                   LEFT JOIN item_import_type tb_9
  //                   ON tb_8.ITEM_IMPORT_TYPE_ID = tb_9.ITEM_IMPORT_TYPE_ID
  //              INNER JOIN
  //               UNIT_OF_MEASUREMENT tb_10
  //           ON
  //               tb_1.PURCHASE_UNIT_ID = tb_10.UNIT_OF_MEASUREMENT_ID
  //           INNER JOIN
  //               UNIT_OF_MEASUREMENT tb_11
  //           ON
  //               tb_1.USAGE_UNIT_ID = tb_11.UNIT_OF_MEASUREMENT_ID`,
  //     selectInuseForSearch: `tb_1.INUSE
  //                                 AS inuseForSearch`,
  //   }

  //   getSqlWhere(dataItem, tableIds)
  //   let result = await StandardPriceModel.searchDataUnlimit(dataItem)

  //   res.status(200).json({
  //     Status: true,
  //     ResultOnDb: result[1],
  //     TotalCountOnDb: result[0][0]['TOTAL_COUNT'] ?? 0,
  //     MethodOnDb: 'Search Cost Condition',
  //     Message: 'Search Data Success',
  //   } as ResponseI)
  // },

  create: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    let result = await StandardPriceModel.create(dataItem)

    res.status(200).json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Create Exchange Rate',
      Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
    })
  },
  // create: async (req: Request, res: Response) => {
  //   let dataItem

  //   if (Object.entries(req.body).length === 0) {
  //     dataItem = req.query.data
  //   } else {
  //     dataItem = req.body
  //   }

  //   let data = dataItem['DATA']

  //   const tempSet = new Set()

  //   // let errorMessage = 'มี Item Code ที่ซ้ำกัน :\n'
  //   // let errorDuplicateArray = ['พบ Item Code ที่ซ้ำกัน: ']
  //   // let errorNotChangeArray = ['พบ Item Code ที่ราคาไม่เปลี่ยนแปลง: ']

  //   const error: {
  //     notChange: string[]
  //     duplicate: string[]
  //   } = {
  //     notChange: [],
  //     duplicate: [],
  //   }

  //   for (let item of data) {
  //     const itemId = item.ITEM_ID

  //     let itemData: any = await StandardPriceModel.getOriginalPriceDetailByItemId({ ITEM_ID: itemId })
  //     itemData = itemData[0]

  //     if (itemData && Object.keys(itemData).length > 0) {
  //       if (itemData?.PURCHASE_PRICE == item?.PURCHASE_PRICE && itemData?.PURCHASE_PRICE_CURRENCY_ID == item?.PURCHASE_PRICE_CURRENCY_ID) {
  //         error.notChange.push(item.ITEM_CODE)
  //       }
  //     }

  //     if (tempSet.has(itemId)) {
  //       error.duplicate.push(item.ITEM_CODE)

  //       continue
  //     }

  //     tempSet.add(itemId)
  //   }

  //   let result

  //   if (error.duplicate.length > 0 || error.notChange.length > 0) {
  //     throw error
  //   }

  //   result = await StandardPriceModel.create(dataItem)

  //   res.status(200).json({
  //     Status: true,
  //     ResultOnDb: result,
  //     TotalCountOnDb: 0,
  //     MethodOnDb: 'Create Standard Price',
  //     Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
  //   } as ResponseI)
  // },

  downloadFileForExportStandardPrice: async (req: Request, res: Response) => {
    // console.log('test-------------------------', req.body)
    let query = req.body.DataForFetch
    const tableIds = [
      { table: 'tb_3', id: 'ITEM_CODE_FOR_SUPPORT_MES' },
      { table: 'tb_3', id: 'ITEM_INTERNAL_SHORT_NAME' },
      { table: 'tb_3', id: 'ITEM_INTERNAL_FULL_NAME' },
      { table: 'tb_1', id: 'NOTE' },
      { table: 'tb_2', id: 'PURCHASE_PRICE' },
      { table: 'tb_4', id: 'EXCHANGE_RATE_VALUE' },
      { table: 'tb_5', id: 'IMPORT_FEE_RATE' },
      { table: 'tb_10', id: 'PURCHASE_UNIT_NAME' },
      { table: 'tb_11', id: 'USAGE_UNIT_NAME' },
      { table: 'tb_1', id: 'ITEM_M_S_PRICE_VALUE' },
      { table: 'tb_1', id: 'UPDATE_BY' },
      { table: 'tb_1', id: 'UPDATE_DATE' },
    ]

    typeof query
    query['Start'] = Number(query['Start']) * Number(query['Limit'])
    let orderBy = ''

    if (query['querySortBy'].length <= 0) {
      orderBy = 'tb_1.UPDATE_DATE DESC'
    } else {
      for (let i = 0; i < query['querySortBy'].length; i++) {
        const word = query['querySortBy'][i]
        orderBy += word['id'] + (word['desc'] ? ' DESC' : ' ASC') + ','
      }
      orderBy = orderBy.slice(0, -1)
    }
    query['querySortBy'] = orderBy

    let sqlWhereColumnFilter = ''
    if (query?.ColumnFilters?.length > 0) {
      sqlWhereColumnFilter += getSqlWhereByColumnFilters_elysia(query.ColumnFilters, tableIds)
    }
    if (req.body.TYPE === 'currentPage') {
      query['sqlWhereColumnFilter'] = sqlWhereColumnFilter
      query['Order'] = query['querySortBy']
      query['Limit'] = query['queryPageSize']
      query['Start'] = query['queryPageIndex']
    } else {
      query['sqlWhereColumnFilter'] = sqlWhereColumnFilter
      query['Order'] = query['querySortBy']
      query['Limit'] = query['queryPageSize']
      query['Start'] = query['queryPageIndex']
    }

    if (req.body.TYPE === 'currentPage') {
      const headerMap: Record<string, string> = {
        INUSE: 'STATUS',
        ITEM_CODE_FOR_SUPPORT_MES: 'ITEM CODE',
        ITEM_M_S_PRICE_VALUE: 'STANDARD PRICE(THB)',
        EXCHANGE_RATE_VALUE: 'EXCHANGE RATE',
        FISCAL_YEAR: 'FISCAL YEAR',
        SCT_PATTERN_NAME: 'SCT PATTERN',
        IS_CURRENT: 'LATEST VERSION',
        VENDOR_NAME: 'VENDOR NAME',
        ITEM_IMPORT_TYPE_NAME: 'ITEM IMPORT TYPE',
        VENDOR_ALPHABET: 'VENDOR ALPHABET',
        PURCHASE_UNIT_CODE: 'PURCHASE UNIT CODE',
        USAGE_UNIT_CODE: 'USAGE UNIT CODE',
        ITEM_INTERNAL_SHORT_NAME: 'ITEM INTERNAL SHORT NAME',
        ITEM_INTERNAL_FULL_NAME: 'ITEM INTERNAL FULL NAME',
        PURCHASE_PRICE: 'PURCHASE PRICE',
        PURCHASE_UNIT_RATIO: 'PURCHASE UNIT RATIO',
        USAGE_UNIT_RATIO: 'USAGE UNIT RATIO',
        IMPORT_FEE_RATE: 'IMPORT FEE RATE (%)',
        ITEM_M_S_PRICE_CREATE_FROM_SETTING_NAME: 'CREATE FROM',
        ITEM_VERSION_NO: 'ITEM CODE (VERSION)',
        ITEM_IS_CURRENT: 'ITEM CODE (LATEST VERSION)',
        PURCHASE_PRICE_CURRENCY_SYMBOL: 'PURCHASE CURRENCY',
      }

      const result = await StandardPriceModel.search(query)
      let dataItem = Object.entries(req.body).length === 0 ? req.query : req.body
      const columnFilters = dataItem.columnFilters || []
      const columnVisibility = dataItem.columnVisibility || {}
      const data = result[1] || []

      const visibleColumns = columnFilters.filter((col: any) => columnVisibility[col] !== false && col !== 'mrt-row-spacer' && col !== 'mrt-row-actions')

      if (visibleColumns.length === 0) {
        return res.status(400).json({ error: 'No visible columns to export.' })
      }

      const wb = new xl.Workbook()
      const ws = wb.addWorksheet('Manufacturing Item Price')

      // Header
      visibleColumns.forEach((col: any, colIndex: number) => {
        const headerText = headerMap[col] || col
        ws.cell(1, colIndex + 1)
          .string(headerText)
          .style(
            wb.createStyle({
              font: { name: 'Aptos', size: 11, bold: true },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
              border: {
                left: { style: 'thin' },
                right: { style: 'thin' },
                top: { style: 'thin' },
                bottom: { style: 'thin' },
              },
              fill: {
                type: 'pattern',
                patternType: 'solid',
                fgColor: '#D9D9D9',
              },
            })
          )
      })
      ws.row(1).setHeight(25)

      const maxColWidths: number[] = visibleColumns.map((col: any) => (headerMap[col] || col).length)

      // Data
      data.forEach((row: any, rowIndex: number) => {
        visibleColumns.forEach((col: any, colIndex: number) => {
          let cellValue = row[col]

          if (col === 'INUSE') {
            cellValue = row[col] == '1' ? 'Can use' : row[col] == '2' ? 'Using' : row[col] == '3' ? 'Can use (Used)' : 'Cancel'
          }
          if (col === 'IS_CURRENT') {
            cellValue = row[col] == '1' ? 'Yes' : 'No'
          }
          if (col === 'ITEM_IS_CURRENT') {
            cellValue = row[col] == '1' ? 'Yes' : 'No'
          }
          if (col === 'ITEM_M_S_PRICE_VALUE') {
            cellValue = formatNumber(row[col], 7, true) || ''
          }
          if (col === 'PURCHASE_PRICE') {
            cellValue = `${formatNumber(row[col], 7, true) || ''} `
          }
          if (col === 'USAGE_UNIT_RATIO') {
            cellValue = `${formatNumber(row[col], 7, true) || ''}`
          }

          if (col === 'EXCHANGE_RATE_VALUE') {
            const currency = row['PURCHASE_PRICE_CURRENCY_SYMBOL'] || ''
            cellValue = `${row[col] || ''} ${currency} = 1 THB`.trim()
          }

          const finalValue = cellValue !== undefined && cellValue !== null ? cellValue.toString() : ''

          ws.cell(rowIndex + 2, colIndex + 1)
            .string(finalValue)
            .style(
              wb.createStyle({
                font: { name: 'Arial', size: 11 },
                alignment: { horizontal: 'left', vertical: 'center', wrapText: false },
              })
            )

          maxColWidths[colIndex] = Math.max(maxColWidths[colIndex], finalValue.length)
        })
      })

      // Auto width
      maxColWidths.forEach((width, index) => {
        const finalWidth = Math.min(Math.ceil(width * 1.6), 50)
        ws.column(index + 1).setWidth(finalWidth)
      })

      // Filename
      const now = new Date()
      const pad = (n: any) => n.toString().padStart(2, '0')
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
      const menuName = req.body.menuName || 'Export'
      const filename = `${menuName}_${timestamp}.xlsx`

      wb.writeToBuffer()
        .then((buffer: any) => {
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
          res.send(buffer)
        })
        .catch((err: any) => {
          res.status(500).json({ error: 'Failed to generate file', err })
        })
    } else {
      const headerMap: Record<string, string> = {
        INUSE: 'STATUS',
        ITEM_CODE_FOR_SUPPORT_MES: 'ITEM CODE',
        ITEM_M_S_PRICE_VALUE: 'STANDARD PRICE(THB)',
        EXCHANGE_RATE_VALUE: 'EXCHANGE RATE',
        FISCAL_YEAR: 'FISCAL YEAR',
        SCT_PATTERN_NAME: 'SCT PATTERN',
        IS_CURRENT: 'LATEST VERSION',
        VENDOR_NAME: 'VENDOR NAME',
        ITEM_IMPORT_TYPE_NAME: 'ITEM IMPORT TYPE',
        VENDOR_ALPHABET: 'VENDOR ALPHABET',
        PURCHASE_UNIT_CODE: 'PURCHASE UNIT CODE',
        USAGE_UNIT_CODE: 'USAGE UNIT CODE',
        ITEM_INTERNAL_SHORT_NAME: 'ITEM INTERNAL SHORT NAME',
        ITEM_INTERNAL_FULL_NAME: 'ITEM INTERNAL FULL NAME',
        PURCHASE_PRICE: 'PURCHASE PRICE',
        PURCHASE_UNIT_RATIO: 'PURCHASE UNIT RATIO',
        USAGE_UNIT_RATIO: 'USAGE UNIT RATIO',
        IMPORT_FEE_RATE: 'IMPORT FEE RATE (%)',
        ITEM_M_S_PRICE_CREATE_FROM_SETTING_NAME: 'CREATE FROM',
        ITEM_VERSION_NO: 'ITEM CODE (VERSION)',
        ITEM_IS_CURRENT: 'ITEM CODE (LATEST VERSION)',
        PURCHASE_PRICE_CURRENCY_SYMBOL: 'PURCHASE CURRENCY',
      }

      const result = await StandardPriceModel.searchAll(query)
      let dataItem = Object.entries(req.body).length === 0 ? req.query : req.body
      const columnFilters = dataItem.columnFilters || []
      const columnVisibility = dataItem.columnVisibility || {}
      const data = result[1] || []

      const visibleColumns = columnFilters.filter((col: any) => columnVisibility[col] !== false && col !== 'mrt-row-spacer' && col !== 'mrt-row-actions')

      if (visibleColumns.length === 0) {
        return res.status(400).json({ error: 'No visible columns to export.' })
      }

      const wb = new xl.Workbook()
      const ws = wb.addWorksheet('Manufacturing Item Price')

      // Header
      visibleColumns.forEach((col: any, colIndex: number) => {
        const headerText = headerMap[col] || col
        ws.cell(1, colIndex + 1)
          .string(headerText)
          .style(
            wb.createStyle({
              font: { name: 'Aptos', size: 11, bold: true },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
              border: {
                left: { style: 'thin' },
                right: { style: 'thin' },
                top: { style: 'thin' },
                bottom: { style: 'thin' },
              },
              fill: {
                type: 'pattern',
                patternType: 'solid',
                fgColor: '#D9D9D9',
              },
            })
          )
      })
      ws.row(1).setHeight(25)

      const maxColWidths: number[] = visibleColumns.map((col: any) => (headerMap[col] || col).length)

      // Data
      data.forEach((row: any, rowIndex: number) => {
        visibleColumns.forEach((col: any, colIndex: number) => {
          let cellValue = row[col]

          if (col === 'INUSE') {
            cellValue = row[col] == '1' ? 'Can use' : row[col] == '2' ? 'Using' : row[col] == '3' ? 'Can use (Used)' : 'Cancel'
          }
          if (col === 'IS_CURRENT') {
            cellValue = row[col] == '1' ? 'Yes' : 'No'
          }
          if (col === 'ITEM_IS_CURRENT') {
            cellValue = row[col] == '1' ? 'Yes' : 'No'
          }

          if (col === 'ITEM_M_S_PRICE_VALUE') {
            cellValue = formatNumber(row[col], 7, true) || ''
          }
          if (col === 'PURCHASE_PRICE') {
            cellValue = `${formatNumber(row[col], 7, true) || ''}`
          }
          if (col === 'USAGE_UNIT_RATIO') {
            cellValue = `${formatNumber(row[col], 7, true) || ''}`
          }

          if (col === 'EXCHANGE_RATE_VALUE') {
            const currency = row['PURCHASE_PRICE_CURRENCY_SYMBOL'] || ''
            cellValue = `${row[col] || ''} ${currency} = 1 THB`.trim()
          }

          const finalValue = cellValue !== undefined && cellValue !== null ? cellValue.toString() : ''

          ws.cell(rowIndex + 2, colIndex + 1)
            .string(finalValue)
            .style(
              wb.createStyle({
                font: { name: 'Arial', size: 11 },
                alignment: { horizontal: 'left', vertical: 'center', wrapText: false },
              })
            )

          maxColWidths[colIndex] = Math.max(maxColWidths[colIndex], finalValue.length)
        })
      })

      maxColWidths.forEach((width, index) => {
        ws.column(index + 1).setWidth(Math.min(Math.ceil(width * 1.6), 50))
      })

      // Filename
      const now = new Date()
      const pad = (n: any) => n.toString().padStart(2, '0')
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
      const menuName = req.body.menuName || 'Export'
      const filename = `${menuName}_${timestamp}.xlsx`

      wb.writeToBuffer()
        .then((buffer: any) => {
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
          res.send(buffer)
        })
        .catch((err: any) => res.status(500).json({ error: 'Failed to generate file', err }))
    }
  },
  // getStandardPriceDetail: async (req: Request, res: Response) => {
  //   let dataItem

  //   if (Object.entries(req.body).length === 0) {
  //     dataItem = req.query
  //   } else {
  //     dataItem = req.body
  //   }
  //   let result = await StandardPriceModel.getStandardPriceDetail(dataItem)

  //   return {
  //     Status: true,
  //     ResultOnDb: result,
  //     TotalCountOnDb: 0,
  //     MethodOnDb: 'Create Exchange Rate',
  //     Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
  //   } as ResponseI
  // },

  downloadFileForExport: async (res: Response) => {
    const items = (await ItemModel.getByLikeItemCodeAndInuseAndNotFGSemiFGSubAsNoLimit()) as {
      ITEM_CODE_FOR_SUPPORT_MES: string
      ITEM_INTERNAL_SHORT_NAME: string
      ITEM_INTERNAL_FULL_NAME: string
      PURCHASE_UNIT_RATIO: number
      PURCHASE_UNIT: string
      PURCHASE_UNIT_CODE: string
      USAGE_UNIT_RATIO: number
      USAGE_UNIT: string
      USAGE_UNIT_CODE: string
      ITEM_ID: number
      ITEM_MANUFACTURING_ID: number
      PURCHASE_UNIT_ID: number
      USAGE_UNIT_ID: number
      ITEM_CATEGORY_NAME: string
      ITEM_CATEGORY_ID: number
      VERSION_NO: number
    }[]

    let currencies = await ExchangeRateModel.getCurrencyAll()

    //#region Standard Price sheet
    const columns: any[][] = [
      [
        'Item Code',
        'Item Category Name',
        'Item Internal Full Name',
        'Item Internal Short Name',
        'Purchase Price',
        'Purchase Price Currency',
        'Purchase Unit Code',
        'Usage Unit Ratio',
        'Usage Unit Code',
        'Version No.',
      ],
    ]

    const dataRowLengthMaximum = 10000

    for (let i = 2; i < dataRowLengthMaximum; i++) {
      const itemCategoryFormula = `=IF(A${i} = "", "Please enter M Code", IFERROR(VLOOKUP(A${i}, Item!A:H, 2, FALSE), "Item Code Not Found"))`
      const mCodeFullNameFormula = `=IF(A${i} = "", "Please enter M Code", IFERROR(VLOOKUP(A${i}, Item!A:H, 3, FALSE), "Item Code Not Found"))`
      const mCodeShortNameFormula = `=IF(A${i} = "", "Please enter M Code", IFERROR(VLOOKUP(A${i}, Item!A:H, 4, FALSE), "Item Code Not Found"))`
      const purchaseUnitFormula = `=IF(A${i} = "", "Please enter M Code", IFERROR(VLOOKUP(A${i}, Item!A:H, 5, FALSE), "Item Code Not Found"))`
      const usageUnitRatio = `=IF(A${i} = "", "Please enter M Code", IFERROR(VLOOKUP(A${i}, Item!A:H, 6, FALSE), "Item Code Not Found"))`
      const usageUnitCode = `=IF(A${i} = "", "Please enter M Code", IFERROR(VLOOKUP(A${i}, Item!A:H, 7, FALSE), "Item Code Not Found"))`
      const versionNo = `=IF(A${i} = "", "Please enter M Code", IFERROR(VLOOKUP(A${i}, Item!A:H, 8, FALSE), "Item Code Not Found"))`

      columns.push([
        '',
        { t: 's', v: '', f: itemCategoryFormula },
        { t: 's', v: '', f: mCodeFullNameFormula },
        { t: 's', v: '', f: mCodeShortNameFormula },
        '',
        '',
        { t: 's', v: '', f: purchaseUnitFormula },
        { t: 's', v: '', f: usageUnitRatio },
        { t: 's', v: '', f: usageUnitCode },
        { t: 's', v: '', f: versionNo },
      ])
    }

    const standardPriceWorksheet = XLSX.utils.aoa_to_sheet(columns)
    standardPriceWorksheet['!cols'] = Array(columns[0].length).fill({ wch: 25 })

    // #endregion
    const itemsWorksheet = XLSX.utils.json_to_sheet(
      items.map((item) => {
        return {
          ITEM_CODE: item.ITEM_CODE_FOR_SUPPORT_MES,
          ITEM_CATEGORY_NAME: item.ITEM_CATEGORY_NAME,
          ITEM_INTERNAL_FULL_NAME: item.ITEM_INTERNAL_FULL_NAME,
          ITEM_INTERNAL_SHORT_NAME: item.ITEM_INTERNAL_SHORT_NAME,
          PURCHASE_UNIT_CODE: item.PURCHASE_UNIT_CODE,
          USAGE_UNIT_RATIO: item.USAGE_UNIT_RATIO,
          USAGE_UNIT_CODE: item.USAGE_UNIT_CODE,
          VERSION_NO: item.VERSION_NO,
          ITEM_ID: item.ITEM_ID,
          PURCHASE_UNIT_ID: item.PURCHASE_UNIT_ID,
        }
      })
    )
    const currenciesWorksheet = XLSX.utils.json_to_sheet(
      currencies.map((currency) => ({
        CURRENCY_SYMBOL: currency.CURRENCY_SYMBOL,
        CURRENCY_NAME: currency.CURRENCY_NAME,
        CURRENCY_ID: currency.CURRENCY_ID,
      }))
    )

    // standardPriceWorksheet['!cols'] = [{ wpx: 135 }, { wpx: 135 }, { wpx: 135 }, { wpx: 135 }, { wpx: 135 }]

    itemsWorksheet['!protect'] = {
      selectLockedCells: false,
      selectUnlockedCells: false,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertRows: false,
      insertColumns: false,
      insertHyperlinks: false,
      deleteRows: false,
      deleteColumns: false,
      sort: false,
      autoFilter: false,
      pivotTables: false,
      password: 'devdev',
    }

    itemsWorksheet['!cols'] = Array(columns[0].length).fill({ wch: 25 })

    currenciesWorksheet['!protect'] = {
      selectLockedCells: false,
      selectUnlockedCells: false,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertRows: false,
      insertColumns: false,
      insertHyperlinks: false,
      deleteRows: false,
      deleteColumns: false,
      sort: false,
      autoFilter: false,
      pivotTables: false,
      password: 'devdev',
    }
    currenciesWorksheet['!cols'] = Array(columns[0].length).fill({ wch: 25 })

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, standardPriceWorksheet, 'Standard Price')
    XLSX.utils.book_append_sheet(workbook, itemsWorksheet, 'Item')
    XLSX.utils.book_append_sheet(workbook, currenciesWorksheet, 'Currency')

    // XLSX.writeFile(workbook, 'Standard_Price_Import.xlsx')

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    res.setHeader('Content-Disposition', 'attachment; filename="Standard_Price_Import.xlsx"')
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.send(buffer)

    // const file = Bun.file('Standard_Price_Import.xlsx')

    // const resp = new Response(file)

    // return resp
  },
  delete: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    await StandardPriceModel.delete(dataItem)
    return res.status(200).json({
      Status: true,
      ResultOnDb: [],
      TotalCountOnDb: 0,
      MethodOnDb: 'Delete Standard Price',
      Message: 'ลบข้อมูลสำเร็จ Successfully deleted',
    })
  },
}
