import { PriceListExportModel } from '@src/_workspace/models/sct/price-list/PriceListModel'
import { Request, Response } from 'express'
const excel = require('exceljs')
let cntRowPriceList: any
export const exportFile_new_template = async (req: Request, res: Response) => {
  try {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = JSON.parse(req.query.data as any)
    } else {
      dataItem = req.body
    }

    // ** Declare Variable SCT Header
    let dataPriceList: any = []

    let dataList = dataItem['LIST_SCT_ID']

    for (let i = 0; i < dataList.length; i++) {
      let dataPriceListDetail = await PriceListExportModel.exportToFile(dataList[i])

      if (dataPriceListDetail.length !== 0) {
        if (dataPriceListDetail[0]) {
          dataPriceListDetail[0].LEVEL = dataList[i]?.LEVEL
        }
        dataPriceList.push(dataPriceListDetail)
      }
    }

    let numberOfDeepest = Math.max(...dataList.map((obj: any) => obj.LEVEL))

    if (numberOfDeepest > 10) {
      res.send({
        message: 'SCT level more than Sub 10 is not supported',
        Status: false,
      })
      return
    } else {
      numberOfDeepest = 10
    }

    if (dataPriceList?.length === 0) {
      res.send({
        message: 'No data found for Export',
        Status: false,
      })
      return
    }

    let columns: any = []
    // add all key to columns array include children key
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

    addKeyToColumns(dataPriceList[0])

    // console.log(columns)

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

    const product = ['Product Category', 'Product Main', 'Product Sub', 'Product Type']

    const costCondition = [
      'Direct unit Process Cost (/h)',
      'Indirect rate of Direct process cost',
      'Import Fee rate (%)',
      'Selling Expense rate (%)',
      'GA rate (%)',
      'Margin rate (%)',
      'CIT (%)',
      'VAT (%)',
    ]

    const directCost = ['RM+(imported fee)', 'Consume + Packing', 'Materials Cost', 'Process Cost', 'Total']

    columns = columns.map((item: any, i: number) => {
      let column: any = {}
      column.header = item
      column.key = product.includes(item) ? 'productGroup' : costCondition.includes(item) ? 'costCondition' : directCost.includes(item) ? 'directCost' : item
      column.position = product.includes(item) || costCondition.includes(item) || directCost.includes(item) ? `${alphabet[i]}2` : `${alphabet[i]}1`
      column.mergeCells = product.includes(item) || costCondition.includes(item) || directCost.includes(item) ? '' : `${alphabet[i]}1:${alphabet[i]}2`

      return column
    })

    const workbook = new excel.Workbook()
    const worksheet = workbook.addWorksheet('Sheet')

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
        fgColor: { argb: 'FFD9D9D9' },
      }
      worksheet.getCell(column.position).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
    worksheet.autoFilter = `${columns[0].position}:${columns[columns?.length - 1].position}`.replaceAll('1', '2')

    const productGroupColumnMerge = () => {
      worksheet.getCell('X1').value = 'Product Group'
      worksheet.getCell('X1').alignment = {
        vertical: 'middle',
        horizontal: 'center',
      }
      worksheet.getCell('X1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      }
      worksheet.getCell('X1').border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }

      worksheet.mergeCells('X1:AA1')
    }

    const costConditionColumnMerge = () => {
      worksheet.getCell('AC1').value = 'Cost Condition'
      worksheet.getCell('AC1').alignment = {
        vertical: 'middle',
        horizontal: 'center',
      }
      worksheet.getCell('AC1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      }
      worksheet.getCell('AC1').border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }

      worksheet.mergeCells('AC1:AJ1')
    }

    const directCostColumnMerge = () => {
      worksheet.getCell('AK1').value = 'Direct Cost'
      worksheet.getCell('AK1').alignment = {
        vertical: 'middle',
        horizontal: 'center',
      }
      worksheet.getCell('AK1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      }
      worksheet.getCell('AK1').border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }

      worksheet.mergeCells('AK1:AO1')
    }

    productGroupColumnMerge()
    costConditionColumnMerge()
    directCostColumnMerge()
    cntRowPriceList = 0
    //** Step Write data to the sheet
    if (dataPriceList.length > 0) {
      for (let i = 0; i < dataPriceList.length; i++) {
        const item = dataPriceList[i]
        writingPriceList(item[0], worksheet)
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

    //** Columns Fit
    worksheet.columns.forEach((column: any, index: number) => {
      const colLetter = getExcelColumnLetter(index + 1) // index base 0 → column 1-based
      let maxLength = 10

      column.eachCell({ includeEmpty: true }, (cell: any) => {
        if (cell.row < 3) return
        const raw = cell.value?.toString() || ''
        maxLength = Math.max(maxLength, raw.length)

        if (colLetter >= 'A' && colLetter <= 'AA') {
          cell.alignment = { vertical: 'middle', horizontal: 'left' }
        } else if (colLetter >= 'AB' && colLetter <= 'BF') {
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
        }
        cell.font = {
          name: 'Aptos Display',
          color: { argb: 'FF000000' }, // สีดำ
        }
      })

      column.width = maxLength + 2
    })

    //**  Paint background
    let columnIndices = [17, 18]
    let numRows = cntRowPriceList + 2

    for (let row = 1; row <= numRows; row++) {
      for (const col of columnIndices) {
        const cell = worksheet.getCell(row, col)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF808080' }, // เทาอ่อน
        }
      }
    }

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
  } catch (err) {
    res.status(500).send({
      Status: false,
      ResultOnDb: 'ERROR CREATE EXCEL : ' + err,
      TotalCountOnDb: '',
      MethodOnDb: 'Search Price List Data',
      Message: 'Create Excel Error',
    })
  }
}

async function writingPriceList(element: any, worksheet: any) {
  // internal link
  if (element) {
    if (element?.LEVEL === 0) {
      worksheet.getCell(3 + cntRowPriceList, 1).value = element['SCT Code']
    } else if (element?.LEVEL === 1) {
      worksheet.getCell(3 + cntRowPriceList, 2).value = element['SCT Code']
    } else if (element?.LEVEL === 2) {
      worksheet.getCell(3 + cntRowPriceList, 3).value = element['SCT Code']
    } else if (element?.LEVEL === 3) {
      worksheet.getCell(3 + cntRowPriceList, 4).value = element['SCT Code']
    } else if (element?.LEVEL === 4) {
      worksheet.getCell(3 + cntRowPriceList, 5).value = element['SCT Code']
    } else if (element?.LEVEL === 5) {
      worksheet.getCell(3 + cntRowPriceList, 6).value = element['SCT Code']
    } else if (element?.LEVEL === 6) {
      worksheet.getCell(3 + cntRowPriceList, 7).value = element['SCT Code']
    } else if (element?.LEVEL === 7) {
      worksheet.getCell(3 + cntRowPriceList, 8).value = element['SCT Code']
    } else if (element?.LEVEL === 8) {
      worksheet.getCell(3 + cntRowPriceList, 9).value = element['SCT Code']
    } else if (element?.LEVEL === 9) {
      worksheet.getCell(3 + cntRowPriceList, 10).value = element['SCT Code']
    } else if (element?.LEVEL === 10) {
      worksheet.getCell(3 + cntRowPriceList, 11).value = element['SCT Code']
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

    worksheet.getCell(3 + cntRowPriceList, 12).value = element['SCT Revision Code']
    worksheet.getCell(3 + cntRowPriceList, 13).value = element['SCT Status']
    worksheet.getCell(3 + cntRowPriceList, 14).value = element['Re-Cal Update Date']
    worksheet.getCell(3 + cntRowPriceList, 15).value = element['Fiscal Year']
    worksheet.getCell(3 + cntRowPriceList, 16).value = element['SCT Pattern']
    worksheet.getCell(3 + cntRowPriceList, 17).value = element['SCT Reason']
    worksheet.getCell(3 + cntRowPriceList, 18).value = element['SCT Tag']
    worksheet.getCell(3 + cntRowPriceList, 19).value = element['BOM Code']
    worksheet.getCell(3 + cntRowPriceList, 20).value = element['BOM Name']
    worksheet.getCell(3 + cntRowPriceList, 21).value = element['Flow Code']
    worksheet.getCell(3 + cntRowPriceList, 22).value = element['Flow Name']
    worksheet.getCell(3 + cntRowPriceList, 23).value = element['Item Category']
    worksheet.getCell(3 + cntRowPriceList, 24).value = element['Product Category']
    worksheet.getCell(3 + cntRowPriceList, 25).value = element['Product Main']
    worksheet.getCell(3 + cntRowPriceList, 26).value = element['Product Sub']
    worksheet.getCell(3 + cntRowPriceList, 27).value = element['Product Type']
    worksheet.getCell(3 + cntRowPriceList, 28).value = element['Customer Invoice To Alphabet']
    worksheet.getCell(3 + cntRowPriceList, 29).value = element['Direct unit Process Cost (/h)']
    worksheet.getCell(3 + cntRowPriceList, 30).value = element['Indirect rate of Direct process cost']

    worksheet.getCell(3 + cntRowPriceList, 31).value = element['Import Fee rate (%)'] / 100
    worksheet.getCell(3 + cntRowPriceList, 31).numFmt = '0.00%'

    worksheet.getCell(3 + cntRowPriceList, 32).value = element['Selling Expense rate (%)'] / 100
    worksheet.getCell(3 + cntRowPriceList, 32).numFmt = '0.00%'

    worksheet.getCell(3 + cntRowPriceList, 33).value = element['GA rate (%)'] / 100
    worksheet.getCell(3 + cntRowPriceList, 33).numFmt = '0.00%'

    worksheet.getCell(3 + cntRowPriceList, 34).value = element['Margin rate (%)'] / 100
    worksheet.getCell(3 + cntRowPriceList, 34).numFmt = '0.00%'

    worksheet.getCell(3 + cntRowPriceList, 35).value = element['CIT (%)'] / 100
    worksheet.getCell(3 + cntRowPriceList, 35).numFmt = '0.00%'

    worksheet.getCell(3 + cntRowPriceList, 36).value = element['VAT (%)'] / 100
    worksheet.getCell(3 + cntRowPriceList, 36).numFmt = '0.00%'

    worksheet.getCell(3 + cntRowPriceList, 37).value = element['RM+(imported fee)']
    worksheet.getCell(3 + cntRowPriceList, 37).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 38).value = element['Consume + Packing']
    worksheet.getCell(3 + cntRowPriceList, 38).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 39).value = element['Materials Cost']
    worksheet.getCell(3 + cntRowPriceList, 39).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 40).value = element['Process Cost']
    worksheet.getCell(3 + cntRowPriceList, 40).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 41).value = element['Total']
    worksheet.getCell(3 + cntRowPriceList, 41).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 42).value = element['Indirect Cost (Baht)']
    worksheet.getCell(3 + cntRowPriceList, 42).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 43).value = element['Indirect Cost Mode']

    worksheet.getCell(3 + cntRowPriceList, 44).value = element['Selling Expense (Baht)']
    worksheet.getCell(3 + cntRowPriceList, 44).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 45).value = element['GA (Baht)']
    worksheet.getCell(3 + cntRowPriceList, 45).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 46).value = element['Margin (Baht)']
    worksheet.getCell(3 + cntRowPriceList, 46).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 47).value = element['CIT (Baht)']
    worksheet.getCell(3 + cntRowPriceList, 47).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 48).value = element['VAT (Baht)']
    worksheet.getCell(3 + cntRowPriceList, 48).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 49).value = element['Selling Price by formula(Baht)']
    worksheet.getCell(3 + cntRowPriceList, 49).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 50).value = element['Adjust Price (Baht)']
    worksheet.getCell(3 + cntRowPriceList, 50).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 51).value = element['Selling Price (Baht)']
    worksheet.getCell(3 + cntRowPriceList, 51).numFmt = '_-[$฿-th-TH]* #,##0.00_-;-[$฿-th-TH]* #,##0.00_-;_-[$฿-th-TH]* "-"??_-;_-@_-'

    worksheet.getCell(3 + cntRowPriceList, 52).value = element['Total Yield Rate (%)'] / 100
    worksheet.getCell(3 + cntRowPriceList, 52).numFmt = '0.00%'

    worksheet.getCell(3 + cntRowPriceList, 53).value = element['Total Go Straight Rate (%)'] / 100
    worksheet.getCell(3 + cntRowPriceList, 53).numFmt = '0.00%'

    worksheet.getCell(3 + cntRowPriceList, 54).value = element['Total Clear Time (MM)']
    worksheet.getCell(3 + cntRowPriceList, 55).value = element['Total Essential Time (MM)']
    worksheet.getCell(3 + cntRowPriceList, 56).value = element['Assembly Group']
    worksheet.getCell(3 + cntRowPriceList, 57).value = element['Start Date']
    worksheet.getCell(3 + cntRowPriceList, 58).value = element['End Date']
    worksheet.getCell(3 + cntRowPriceList, 59).value = element['Note']
  }
  cntRowPriceList++
}
