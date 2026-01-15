import { ProductTypeBomModel } from '@src/_workspace/models/product-group/product-type/ProductTypeBomModel'
import { StandardCostExportModel } from '@src/_workspace/models/sct/StandardCostExportModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import excel from 'exceljs'
import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'

let cntRowProductTypeList: any

const getDataThree = async (dataItem: any, level: any) => {
  let listResult: any = []

  await recursiveFx(dataItem, level)

  async function recursiveFx(dataItem: any, level: any) {
    dataItem.LEVEL = level
    level = level + 1
    listResult.push(dataItem)

    let result = await StandardCostExportModel.getSubByProductTypeId(dataItem)

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

export const ProductTypeBomController = {
  getBomByLikeProductTypeId: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    let result = await ProductTypeBomModel.getBomByLikeProductTypeId(dataItem)

    res.json({
      Status: true,
      Message: 'getBomByLikeProductTypeId Data Success',
      ResultOnDb: result,
      MethodOnDb: 'getBomByLikeProductTypeId',
      TotalCountOnDb: 0,
    } as ResponseI)
  },
  downloadFileForExportProductTypeBOM: async (req: Request, res: Response) => {
    let dataItem
    if (Object.entries(req.body).length === 0) {
      dataItem = JSON.parse(req.query.data as any)
    } else {
      dataItem = req.body
    }

    if (dataItem.type == 'selected') {
      let listResult: any = []

      for (const data of dataItem.productType.LIST_PRODUCT_TYPE_ID) {
        let dataMain = {
          PRODUCT_TYPE_ID: data.PRODUCT_TYPE_ID,
          LEVEL: 0,
        }

        let result = await getDataThree(data, 0)

        listResult.push(dataMain, result)
      }

      let dataSelect = listResult.flat()

      let dataProductTypeList: any = []

      for (let i = 0; i < dataSelect?.length; i++) {
        let ele = dataSelect[i]
        let dataProductTypeListDetail = await ProductTypeBomModel.exportToFile(ele)
        if (dataProductTypeListDetail.length !== 0) {
          if (dataProductTypeListDetail[0]) {
            dataProductTypeListDetail[0].LEVEL = dataSelect[i]?.LEVEL
          }
          dataProductTypeList.push(dataProductTypeListDetail)
        }
      }

      const workbook = new excel.Workbook()
      const worksheet = workbook.addWorksheet('ProductType-BOM')

      let numberOfDeepest = Math.max(...dataSelect.map((obj: any) => obj.LEVEL))

      if (numberOfDeepest > 10) {
        res.send({
          message: 'SCT level more than Sub 10 is not supported',
          Status: false,
        })
        return
      } else {
        numberOfDeepest = 10
      }

      if (dataSelect?.length === 0) {
        res.send({
          message: 'No data found for Export',
          Status: false,
        })
        return
      }

      let columns: any = []

      const addKeyToColumns = (obj: any) => {
        for (const key in obj) {
          if (key !== 'children' && key !== 'SCT_ID' && key !== 'LEVEL') {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              addKeyToColumns(obj[key])
            } else {
              columns.push(key)
            }
          }
        }
      }

      addKeyToColumns(dataProductTypeList[0])

      for (let i = numberOfDeepest; 0 < i; i--) {
        columns.splice(1, 0, `Sub ${i}`)
      }

      const alphabet = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'AA',
        'AB',
        'AC',
        'AD',
        'AE',
        'AF',
        'AG',
        'AH',
        'AI',
        'AJ',
        'AK',
        'AL',
        'AM',
        'AN',
        'AO',
        'AP',
        'AQ',
        'AR',
        'AS',
        'AT',
        'AU',
        'AV',
        'AW',
        'AX',
        'AY',
        'AZ',
        'BA',
        'BB',
        'BC',
        'BD',
        'BE',
        'BF',
        'BG',
        'BH',
        'BI',
        'BJ',
        'BK',
        'BL',
        'BM',
        'BN',
        'BO',
        'BP',
        'BQ',
        'BR',
        'BS',
        'BT',
      ]

      const productType = ['Main', 'Sub 1', 'Sub 2', 'Sub 3', 'Sub 4', 'Sub 5', 'Sub 6', 'Sub 7', 'Sub 8', 'Sub 9', 'Sub 10']

      const product = ['Product Category', 'Product Main', 'Product Sub', 'Product Type']

      columns = columns.map((item: any, i: number) => {
        let column: any = {}
        column.header = item
        column.key = productType.includes(item) ? 'productType' : product.includes(item) ? 'product' : item
        column.position = productType.includes(item) || product.includes(item) ? `${alphabet[i]}3` : `${alphabet[i]}2`
        column.mergeCells = productType.includes(item) || product.includes(item) ? '' : `${alphabet[i]}2:${alphabet[i]}3`

        return column
      })

      // * Set Header File
      worksheet.getCell('A1').value = 'Export : ProductType-BOM'
      worksheet.getCell('A1').font = {
        name: 'Aptos Display',
        size: 18,
        bold: true,
      }

      worksheet.views = [
        {
          state: 'frozen',
          xSplit: 12, // ล็อกคอลัมน์ A
          ySplit: 3, // ล็อกแถวที่ 1
        },
      ]

      columns.forEach((column: any, i: number) => {
        worksheet.getColumn(i + 1).numFmt = '0.00'
        worksheet.getColumn(i + 1).width = 22

        if (column.mergeCells) {
          worksheet.mergeCells(column.mergeCells)
        }
        worksheet.getCell(column.position).value = column.header
        worksheet.getCell(column.position).alignment = {
          vertical: 'middle',
          horizontal: 'center',
        }
        worksheet.getCell(column.position).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFBCD8F1' },
        }
        worksheet.getCell(column.position).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })
      worksheet.autoFilter = `${columns[0].position}:${columns[columns?.length - 1].position}`.replaceAll('2', '3')

      const productTypeColumnMerge = () => {
        worksheet.getCell('A2').value = 'Product Type Code'
        worksheet.getCell('A2').alignment = {
          vertical: 'middle',
          horizontal: 'center',
        }
        worksheet.getCell('A2').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFBCD8F1' },
        }
        worksheet.getCell('A2').border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }

        worksheet.mergeCells('A2:K2')
      }

      const productColumnMerge = () => {
        worksheet.getCell('R2').value = 'Product Group'
        worksheet.getCell('R2').alignment = {
          vertical: 'middle',
          horizontal: 'center',
        }
        worksheet.getCell('R2').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFBCD8F1' },
        }
        worksheet.getCell('R2').border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }

        worksheet.mergeCells('R2:U2')
      }

      productTypeColumnMerge()
      productColumnMerge()

      cntRowProductTypeList = 1
      //** Step Write data to the sheet
      if (dataProductTypeList.length > 0) {
        for (let i = 0; i < dataProductTypeList.length; i++) {
          const item = dataProductTypeList[i]
          writingFile(item[0], worksheet)
        }
      }

      for (let row = 4; row <= cntRowProductTypeList + 2; row++) {
        for (let col = 1; col <= 25; col++) {
          worksheet.getCell(row, col).border = {
            left: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } },
            top: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
          }
        }
      }

      function getExcelColumnLetter(colNum: number): string {
        let letter = ''
        while (colNum > 0) {
          let mod = (colNum - 1) % 26
          letter = String.fromCharCode(65 + mod) + letter
          colNum = Math.floor((colNum - mod) / 26)
        }
        return letter
      }

      // //** Columns Fit
      worksheet.columns.forEach((column: any, index: number) => {
        const colLetter = getExcelColumnLetter(index + 1) // index base 0 → column 1-based
        let maxLength = 10

        column.eachCell({ includeEmpty: true }, (cell: any) => {
          if (cell.row < 3) return
          const raw = cell.value?.toString() || ''
          maxLength = Math.max(maxLength, raw.length)

          if (colLetter >= 'A' && colLetter <= 'Y') {
            cell.alignment = { vertical: 'middle', horizontal: 'center' }
          }
          cell.font = {
            name: 'Aptos Display',
            color: { argb: 'FF000000' }, // สีดำ
          }
        })

        column.width = maxLength + 2
      })

      await workbook.xlsx
        .writeBuffer()
        .then((buffer: any) => {
          const contentLength = buffer.length
          res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          res.header('Content-Disposition', 'attachment; filename="example.xlsx"')
          res.header('Content-Length', contentLength)
          res.send(buffer)
        })
        .catch((err: Error) => {
          console.error('Error:', err)
          res.status(500).send('Error generating the Excel file')
        })
    } else {
      dataItem = dataItem.DataForFetch

      const tableIds = [
        { table: 'tb_4', id: 'PRODUCT_CATEGORY_NAME', Fns: 'LIKE' },
        { table: 'tb_4', id: 'PRODUCT_CATEGORY_ID', Fns: '=' },
        { table: 'tb_4', id: 'PRODUCT_CATEGORY_CODE_FOR_SCT', Fns: 'LIKE' },
        { table: 'tb_3', id: 'PRODUCT_MAIN_CODE', Fns: 'LIKE' },
        { table: 'tb_3', id: 'PRODUCT_MAIN_ID', Fns: '=' },
        { table: 'tb_3', id: 'PRODUCT_MAIN_NAME', Fns: 'LIKE' },
        { table: 'tb_2', id: 'PRODUCT_SUB_ID', Fns: '=' },
        { table: 'tb_2', id: 'PRODUCT_SUB_NAME', Fns: 'LIKE' },
        { table: 'tb_1', id: 'PRODUCT_TYPE_NAME', Fns: 'LIKE' },
        { table: 'tb_1', id: 'PRODUCT_TYPE_CODE', Fns: 'LIKE' },
        { table: 'tb_1', id: 'PRODUCT_TYPE_CODE_FOR_SCT', Fns: 'LIKE' },
        { table: 'tb_6', id: 'ITEM_CATEGORY_NAME', Fns: 'LIKE' },
        { table: 'tb_5', id: 'ITEM_CATEGORY_ID', Fns: '=' },

        { table: 'tb_11', id: 'BOM_CODE', Fns: 'LIKE' },
        { table: 'tb_13', id: 'FLOW_CODE', Fns: 'LIKE' },
        { table: 'tb_12', id: 'ACCOUNT_DEPARTMENT_CODE', Fns: 'LIKE' },
        { table: 'tb_17', id: 'PRODUCT_SPECIFICATION_TYPE_NAME', Fns: 'LIKE' },
        { table: 'tb_14', id: 'CUSTOMER_INVOICE_TO_ALPHABET', Fns: 'LIKE' },

        { table: 'tb_1', id: 'UPDATE_BY', Fns: 'LIKE' },
        { table: 'tb_1', id: 'UPDATE_DATE', Fns: '=' },
        // { table: 'tb_1', id: dataItem.inuseForSearch !== '' ? 'INUSE' : '', Fns: '=' },
      ]

      dataItem = {
        ...dataItem,
        sqlJoin: `
                           PRODUCT_TYPE tb_1
                                            INNER JOIN
                                    PRODUCT_SUB tb_2
                                            ON tb_1.PRODUCT_SUB_ID  = tb_2.PRODUCT_SUB_ID AND tb_2.INUSE = 1
                                            INNER JOIN
                                    PRODUCT_MAIN tb_3
                                            ON tb_2.PRODUCT_MAIN_ID  = tb_3.PRODUCT_MAIN_ID AND tb_3.INUSE = 1
                                            INNER JOIN
                                    PRODUCT_CATEGORY tb_4
                                            ON tb_3.PRODUCT_CATEGORY_ID  = tb_4.PRODUCT_CATEGORY_ID AND tb_4.INUSE = 1
                                            INNER JOIN
                                    PRODUCT_TYPE_ITEM_CATEGORY tb_5
                                            ON tb_1.PRODUCT_TYPE_ID = tb_5.PRODUCT_TYPE_ID
                                            AND tb_5.INUSE = 1
                                            INNER JOIN
                                    ITEM_CATEGORY tb_6
                                            ON tb_5.ITEM_CATEGORY_ID = tb_6.ITEM_CATEGORY_ID AND tb_6.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_TYPE_BOM tb_7
                                            ON tb_1.PRODUCT_TYPE_ID = tb_7.PRODUCT_TYPE_ID
                                            AND tb_7.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_TYPE_ACCOUNT_DEPARTMENT_CODE tb_8
                                            ON tb_1.PRODUCT_TYPE_ID = tb_8.PRODUCT_TYPE_ID
                                            AND tb_8.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_TYPE_FLOW tb_9
                                            ON tb_1.PRODUCT_TYPE_ID = tb_9.PRODUCT_TYPE_ID
                                            AND tb_9.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_TYPE_CUSTOMER_INVOICE_TO tb_10
                                            ON tb_1.PRODUCT_TYPE_ID = tb_10.PRODUCT_TYPE_ID
                                            AND tb_10.INUSE = 1
                                            LEFT JOIN
                                    BOM tb_11
                                            ON tb_7.BOM_ID = tb_11.BOM_ID
                                            LEFT JOIN
                                    ACCOUNT_DEPARTMENT_CODE tb_12
                                            ON tb_8.ACCOUNT_DEPARTMENT_CODE_ID = tb_12.ACCOUNT_DEPARTMENT_CODE_ID
                                            LEFT JOIN
                                    FLOW tb_13
                                            ON tb_9.FLOW_ID = tb_13.FLOW_ID
                                            LEFT JOIN
                                    CUSTOMER_INVOICE_TO tb_14
                                            ON tb_10.CUSTOMER_INVOICE_TO_ID = tb_14.CUSTOMER_INVOICE_TO_ID
                                            LEFT JOIN
                                    PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_15
                                            ON tb_1.PRODUCT_TYPE_ID = tb_15.PRODUCT_TYPE_ID
                                            AND tb_15.INUSE = 1
                                            LEFT JOIN
                                    PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_16
                                            ON tb_15.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = tb_16.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                                            LEFT JOIN
                                    PRODUCT_SPECIFICATION_TYPE tb_17
                                            ON tb_16.PRODUCT_SPECIFICATION_TYPE_ID = tb_17.PRODUCT_SPECIFICATION_TYPE_ID`,

        selectInuseForSearch: `
        tb_1.INUSE AS inuseForSearch
      `,
      }

      getSqlWhere(dataItem, tableIds)

      // ** Set New Order By Product Type For Support SCT Code
      dataItem = {
        ...dataItem,
        Order: 'tb_1.PRODUCT_TYPE_CODE_FOR_SCT ASC',
      }

      const result = (await ProductTypeBomModel.searchProductTypeBOMAllPage(dataItem)) as RowDataPacket[]

      let dataResultFromDb = result[1]

      if (dataResultFromDb.length <= 0) {
        res.send({
          message: 'No data found for Export',
          Status: false,
        })
        return
      }

      let listResult: any = []

      for (let i = 0; i < dataResultFromDb.length; i++) {
        const element = dataResultFromDb[i]

        let dataMain = {
          PRODUCT_TYPE_ID: element.PRODUCT_TYPE_ID,
          LEVEL: 0,
        }

        let result = await getDataThree(element, 0)
        listResult.push(dataMain, result)
      }

      let dataSelect = listResult.flat()

      let dataProductTypeList: any = []

      for (let i = 0; i < dataSelect?.length; i++) {
        let ele = dataSelect[i]
        let dataProductTypeListDetail = await ProductTypeBomModel.exportToFile(ele)
        if (dataProductTypeListDetail.length !== 0) {
          if (dataProductTypeListDetail[0]) {
            dataProductTypeListDetail[0].LEVEL = dataSelect[i]?.LEVEL
          }
          dataProductTypeList.push(dataProductTypeListDetail)
        }
      }

      const workbook = new excel.Workbook()
      const worksheet = workbook.addWorksheet('ProductType-BOM')

      let numberOfDeepest = Math.max(...dataSelect.map((obj: any) => obj.LEVEL))

      if (numberOfDeepest > 10) {
        res.send({
          message: 'SCT level more than Sub 10 is not supported',
          Status: false,
        })
        return
      } else {
        numberOfDeepest = 10
      }

      if (dataSelect?.length === 0) {
        res.send({
          message: 'No data found for Export',
          Status: false,
        })
        return
      }

      let columns: any = []

      const addKeyToColumns = (obj: any) => {
        for (const key in obj) {
          if (key !== 'children' && key !== 'SCT_ID' && key !== 'LEVEL') {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              addKeyToColumns(obj[key])
            } else {
              columns.push(key)
            }
          }
        }
      }

      addKeyToColumns(dataProductTypeList[0])

      for (let i = numberOfDeepest; 0 < i; i--) {
        columns.splice(1, 0, `Sub ${i}`)
      }

      const alphabet = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'AA',
        'AB',
        'AC',
        'AD',
        'AE',
        'AF',
        'AG',
        'AH',
        'AI',
        'AJ',
        'AK',
        'AL',
        'AM',
        'AN',
        'AO',
        'AP',
        'AQ',
        'AR',
        'AS',
        'AT',
        'AU',
        'AV',
        'AW',
        'AX',
        'AY',
        'AZ',
        'BA',
        'BB',
        'BC',
        'BD',
        'BE',
        'BF',
        'BG',
        'BH',
        'BI',
        'BJ',
        'BK',
        'BL',
        'BM',
        'BN',
        'BO',
        'BP',
        'BQ',
        'BR',
        'BS',
        'BT',
      ]

      const productType = ['Main', 'Sub 1', 'Sub 2', 'Sub 3', 'Sub 4', 'Sub 5', 'Sub 6', 'Sub 7', 'Sub 8', 'Sub 9', 'Sub 10']

      const product = ['Product Category', 'Product Main', 'Product Sub', 'Product Type']

      columns = columns.map((item: any, i: number) => {
        let column: any = {}
        column.header = item
        column.key = productType.includes(item) ? 'productType' : product.includes(item) ? 'product' : item
        column.position = productType.includes(item) || product.includes(item) ? `${alphabet[i]}3` : `${alphabet[i]}2`
        column.mergeCells = productType.includes(item) || product.includes(item) ? '' : `${alphabet[i]}2:${alphabet[i]}3`

        return column
      })

      // * Set Header File
      worksheet.getCell('A1').value = 'Export : ProductType-BOM'
      worksheet.getCell('A1').font = {
        name: 'Aptos Display',
        size: 18,
        bold: true,
      }

      worksheet.views = [
        {
          state: 'frozen',
          xSplit: 12, // ล็อกคอลัมน์ A
          ySplit: 3, // ล็อกแถวที่ 1
        },
      ]

      columns.forEach((column: any, i: number) => {
        worksheet.getColumn(i + 1).numFmt = '0.00'
        worksheet.getColumn(i + 1).width = 22

        if (column.mergeCells) {
          worksheet.mergeCells(column.mergeCells)
        }
        worksheet.getCell(column.position).value = column.header
        worksheet.getCell(column.position).alignment = {
          vertical: 'middle',
          horizontal: 'center',
        }
        worksheet.getCell(column.position).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFBCD8F1' },
        }
        worksheet.getCell(column.position).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })
      worksheet.autoFilter = `${columns[0].position}:${columns[columns?.length - 1].position}`.replaceAll('2', '3')

      const productTypeColumnMerge = () => {
        worksheet.getCell('A2').value = 'Product Type Code'
        worksheet.getCell('A2').alignment = {
          vertical: 'middle',
          horizontal: 'center',
        }
        worksheet.getCell('A2').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFBCD8F1' },
        }
        worksheet.getCell('A2').border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }

        worksheet.mergeCells('A2:K2')
      }

      const productColumnMerge = () => {
        worksheet.getCell('R2').value = 'Product Group'
        worksheet.getCell('R2').alignment = {
          vertical: 'middle',
          horizontal: 'center',
        }
        worksheet.getCell('R2').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFBCD8F1' },
        }
        worksheet.getCell('R2').border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }

        worksheet.mergeCells('R2:U2')
      }

      productTypeColumnMerge()
      productColumnMerge()

      cntRowProductTypeList = 1
      //** Step Write data to the sheet
      if (dataProductTypeList.length > 0) {
        for (let i = 0; i < dataProductTypeList.length; i++) {
          const item = dataProductTypeList[i]
          writingFile(item[0], worksheet)
        }
      }

      for (let row = 4; row <= cntRowProductTypeList + 2; row++) {
        for (let col = 1; col <= 25; col++) {
          worksheet.getCell(row, col).border = {
            left: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } },
            top: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
          }
        }
      }

      function getExcelColumnLetter(colNum: number): string {
        let letter = ''
        while (colNum > 0) {
          let mod = (colNum - 1) % 26
          letter = String.fromCharCode(65 + mod) + letter
          colNum = Math.floor((colNum - mod) / 26)
        }
        return letter
      }

      // //** Columns Fit
      worksheet.columns.forEach((column: any, index: number) => {
        const colLetter = getExcelColumnLetter(index + 1) // index base 0 → column 1-based
        let maxLength = 10

        column.eachCell({ includeEmpty: true }, (cell: any) => {
          if (cell.row < 3) return
          const raw = cell.value?.toString() || ''
          maxLength = Math.max(maxLength, raw.length)

          if (colLetter >= 'A' && colLetter <= 'Y') {
            cell.alignment = { vertical: 'middle', horizontal: 'center' }
          }
          cell.font = {
            name: 'Aptos Display',
            color: { argb: 'FF000000' }, // สีดำ
          }
        })

        column.width = maxLength + 2
      })

      await workbook.xlsx
        .writeBuffer()
        .then((buffer: any) => {
          const contentLength = buffer.length
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          res.setHeader('Content-Disposition', 'attachment; filename="example.xlsx"')
          res.setHeader('Content-Length', contentLength)
          res.end(buffer)
        })
        .catch((err: Error) => {
          console.error('Error:', err)
          res.status(500).send('Error generating the Excel file')
        })
    }
  },
}

async function writingFile(element: any, worksheet: any) {
  if (element) {
    if (element?.LEVEL === 0) {
      worksheet.getCell(3 + cntRowProductTypeList, 1).value = element['SCT Code']
    } else if (element?.LEVEL === 1) {
      worksheet.getCell(3 + cntRowProductTypeList, 2).value = element['SCT Code']
    } else if (element?.LEVEL === 2) {
      worksheet.getCell(3 + cntRowProductTypeList, 3).value = element['SCT Code']
    } else if (element?.LEVEL === 3) {
      worksheet.getCell(3 + cntRowProductTypeList, 4).value = element['SCT Code']
    } else if (element?.LEVEL === 4) {
      worksheet.getCell(3 + cntRowProductTypeList, 5).value = element['SCT Code']
    } else if (element?.LEVEL === 5) {
      worksheet.getCell(3 + cntRowProductTypeList, 6).value = element['SCT Code']
    } else if (element?.LEVEL === 6) {
      worksheet.getCell(3 + cntRowProductTypeList, 7).value = element['SCT Code']
    } else if (element?.LEVEL === 7) {
      worksheet.getCell(3 + cntRowProductTypeList, 8).value = element['SCT Code']
    } else if (element?.LEVEL === 8) {
      worksheet.getCell(3 + cntRowProductTypeList, 9).value = element['SCT Code']
    } else if (element?.LEVEL === 9) {
      worksheet.getCell(3 + cntRowProductTypeList, 10).value = element['SCT Code']
    } else if (element?.LEVEL === 10) {
      worksheet.getCell(3 + cntRowProductTypeList, 11).value = element['SCT Code']
    }

    worksheet.getColumn(2).outlineLevel = 1
    worksheet.getColumn(3).outlineLevel = 1
    worksheet.getColumn(4).outlineLevel = 1
    worksheet.getColumn(5).outlineLevel = 1
    worksheet.getColumn(6).outlineLevel = 1
    worksheet.getColumn(7).outlineLevel = 1
    worksheet.getColumn(8).outlineLevel = 1
    worksheet.getColumn(9).outlineLevel = 1
    worksheet.getColumn(10).outlineLevel = 1
    worksheet.getColumn(11).outlineLevel = 1

    worksheet.getCell(3 + cntRowProductTypeList, 12).value = element['SCT Code']
    worksheet.getCell(3 + cntRowProductTypeList, 13).value = element['BOM Code']
    worksheet.getCell(3 + cntRowProductTypeList, 14).value = element['BOM Name']
    worksheet.getCell(3 + cntRowProductTypeList, 15).value = element['Flow Code']
    worksheet.getCell(3 + cntRowProductTypeList, 16).value = element['Flow Name']
    worksheet.getCell(3 + cntRowProductTypeList, 17).value = element['Item Category']
    worksheet.getCell(3 + cntRowProductTypeList, 18).value = element['Product Category']
    worksheet.getCell(3 + cntRowProductTypeList, 19).value = element['Product Main']
    worksheet.getCell(3 + cntRowProductTypeList, 20).value = element['Product Sub']
    worksheet.getCell(3 + cntRowProductTypeList, 21).value = element['Product Type']
    worksheet.getCell(3 + cntRowProductTypeList, 22).value = element['Customer Invoice To Alphabet']
    worksheet.getCell(3 + cntRowProductTypeList, 23).value = element['Product Specification Type Name']
    worksheet.getCell(3 + cntRowProductTypeList, 24).value = element['Modified Date']
    worksheet.getCell(3 + cntRowProductTypeList, 25).value = element['Modified By']
  }
  cntRowProductTypeList++
}
