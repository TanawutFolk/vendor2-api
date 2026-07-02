import { StandardCostForProductModel } from '@src/_workspace/models/sct/StandardCostForProductModel'
import ExcelJS from 'exceljs'
import { Request, Response } from 'express'
import moment from 'moment'
//** GLOBAL VARIABLE FOR FORMULA

let cntRowPricingFormula: any

export const GetSctExportWithFormula = async (req: Request, res: Response) => {
  let dataItem

  if (Object.entries(req.body).length === 0) {
    dataItem = JSON.parse(req.query.data as any)
  } else {
    dataItem = req.body
  }

  let dataArrayFormula = dataItem['LIST_SCT_ID']

  // ** SCT HEADER
  let dataHeaderForExcel = []
  let dataHeaderCompareForExcel = []
  let dataIndirectCostPriceTabsData = []
  let dataIndirectCostPriceTabsDataCompare = []

  // ** SCT PRICING
  let dataHeaderPricingForExcel = []
  let dataHeaderPricingCompareForExcel = []
  let dataIndirectCostPriceForPricingTabsData = []
  let dataIndirectCostPriceForPricingTabsDataCompare = []

  let dataFlowProcess = []
  let dataMaterial = []
  let dataMaterialCompare = []
  let dataSellingPrice = []
  let dataSellingPriceCompare = []

  type Item = {
    id: number
    name: string
    LEVEL: number
  }
  const uniqueArray: Item[] = dataArrayFormula.filter((obj: any, index: any, self: any) => index === self.findIndex((t: any) => t.SCT_ID === obj.SCT_ID))

  // ** For SCT Header
  for (let i = 0; i < uniqueArray.length; i++) {
    const dataHeader = await StandardCostForProductModel.getSctHeader(uniqueArray[i])
    const dataHeaderCompare = await StandardCostForProductModel.getSctHeaderCompare(uniqueArray[i])
    const flowProcess = await StandardCostForProductModel.getFlowProcess(uniqueArray[i])
    const material = await StandardCostForProductModel.getMaterial(uniqueArray[i])
    const getMaterialCompare = await StandardCostForProductModel.getMaterialCompare(uniqueArray[i])
    const indirectCostPriceTabsData = await StandardCostForProductModel.getIndirectCostPriceTabsDataForExport(uniqueArray[i])
    const indirectCostPriceTabsDataCompare = await StandardCostForProductModel.getIndirectCostPriceTabsDataCompareForExport(uniqueArray[i])

    if (dataHeader[0]) {
      dataHeader[0].LEVEL = uniqueArray[i]?.LEVEL
    }

    dataHeaderForExcel.push(dataHeader)
    dataHeaderCompareForExcel.push(dataHeaderCompare)

    dataIndirectCostPriceTabsData.push(indirectCostPriceTabsData)
    dataIndirectCostPriceTabsDataCompare.push(indirectCostPriceTabsDataCompare)

    dataFlowProcess.push(flowProcess)

    dataMaterial.push(material)
    dataMaterialCompare.push(getMaterialCompare)
  }

  // ** For SCT Pricing Page

  for (let i = 0; i < dataArrayFormula.length; i++) {
    const dataHeaderPricing = await StandardCostForProductModel.getSctHeader(dataArrayFormula[i])
    const dataHeaderPricingCompare = await StandardCostForProductModel.getSctHeaderCompare(dataArrayFormula[i])
    const sellingPrice = await StandardCostForProductModel.getSellingPrice(dataArrayFormula[i])
    const getSellingPriceCompare = await StandardCostForProductModel.getSellingPriceCompare(dataArrayFormula[i])
    const indirectCostPriceForPricingTabsData = await StandardCostForProductModel.getIndirectCostPriceTabsDataForExport(dataArrayFormula[i])
    const indirectCostPriceForPricingTabsDataCompare = await StandardCostForProductModel.getIndirectCostPriceTabsDataCompareForExport(dataArrayFormula[i])

    if (dataHeaderPricing[0]) {
      dataHeaderPricing[0].LEVEL = dataArrayFormula[i]?.LEVEL
    }

    dataHeaderPricingForExcel.push(dataHeaderPricing)
    dataHeaderPricingCompareForExcel.push(dataHeaderPricingCompare)
    dataIndirectCostPriceForPricingTabsData.push(indirectCostPriceForPricingTabsData)
    dataIndirectCostPriceForPricingTabsDataCompare.push(indirectCostPriceForPricingTabsDataCompare)
    dataSellingPrice.push(sellingPrice)
    dataSellingPriceCompare.push(getSellingPriceCompare)
  }

  const props = {
    dataHeaderForExcel,
    dataHeaderCompareForExcel,
    dataIndirectCostPriceTabsData,
    dataIndirectCostPriceTabsDataCompare,
    dataFlowProcess,
    dataMaterial,
    dataMaterialCompare,
    dataHeaderPricingForExcel,
    dataHeaderPricingCompareForExcel,
    dataIndirectCostPriceForPricingTabsData,
    dataIndirectCostPriceForPricingTabsDataCompare,
    dataSellingPrice,
    dataSellingPriceCompare,
  }

  await createSheetName(dataHeaderForExcel, props)
  await createSheetNamePricing(dataHeaderPricingForExcel, props)

  let workbookFormula = new ExcelJS.Workbook()

  await workbookFormula.xlsx.readFile('Excel Cost Structure - Formula Rev05.xlsx').then(async function () {
    //  ** Prepare Data
    copyWorksheetExcelFileWithFormula(workbookFormula, props).then(function () {
      createAllExcelFileWithFormula(workbookFormula, props).then(function () {
        createPricingSheetWithFormula(workbookFormula, props).then(function () {
          sendFileWithFormula(res, workbookFormula)
        })
      })
    })
  })
}

async function sendFileWithFormula(res: Response, workbookFormula: any) {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const filename = `SCT-FORMULA-${year}${month}${day}-${hours}-${minutes}-${seconds}.xlsx`

  // await workbookNFormula.xlsx.write(res).then(() => {})
  await workbookFormula.xlsx
    .writeBuffer()
    .then((buffer: any) => {
      const contentLength = buffer.length

      res.setHeader('content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64')

      res.setHeader('content-Disposition', `attachment; filename="${filename}"`)

      res.setHeader('content-Length', contentLength)

      res.setHeader('Cache-Control', filename)

      res.end(buffer)
    })
    .catch((err: Error) => {
      console.error('Error:', err)
      res.status(500).send('Error generating the Excel file')
    })
}

async function createSheetName(data: any, props: any) {
  let counter: any = {}

  data.forEach((obj: any, idx: number) => {
    try {
      var key = obj[0].PRODUCT_TYPE_CODE_FOR_SCT
      counter[key] = (counter[key] || 0) + 1
      props.dataHeaderForExcel[idx][0].NAME = counter[key] > 1 ? `${obj[0].PRODUCT_TYPE_CODE_FOR_SCT} (${counter[key] - 1})` : obj[0].PRODUCT_TYPE_CODE_FOR_SCT
    } catch (error) {
      console.log(error)
    }
  })
}

async function createSheetNamePricing(data: any, props: any) {
  let counter: any = {}

  data.forEach((obj: any, idx: number) => {
    try {
      var key = obj[0].PRODUCT_TYPE_CODE_FOR_SCT
      counter[key] = (counter[key] || 0) + 1
      props.dataHeaderPricingForExcel[idx][0].NAME = counter[key] > 1 ? `${obj[0].PRODUCT_TYPE_CODE_FOR_SCT} (${counter[key] - 1})` : obj[0].PRODUCT_TYPE_CODE_FOR_SCT
    } catch (error) {
      console.log(error)
    }
  })
}

async function copyWorksheetExcelFileWithFormula(workbookFormula: any, props: any) {
  for (let i = 0; i < props.dataHeaderForExcel.length - 1; i++) {
    await copyWorksheetWithFormula(i + 1, workbookFormula)
  }
}

async function copyWorksheetWithFormula(i: number, workbookFormula: any) {
  var newWorksheet = workbookFormula.getWorksheet('SCT_NAME_0')
  let copySheet = workbookFormula.addWorksheet('copy')

  copySheet.model = Object.assign(newWorksheet.model, {
    mergeCells: newWorksheet.model.merges,
  })
  copySheet.name = 'SCT_NAME_' + `${i}`
}

async function createAllExcelFileWithFormula(workbookFormula: any, props: any) {
  for (let i = 0; i < props.dataHeaderForExcel.length; i++) {
    // ** SheetID , CountRow
    workbookFormula = await writingFileWithFormula(i, i, workbookFormula, props)
  }
}

async function writingFileWithFormula(sheetId: number, cntRows: number, workbookFormula: any, props: any) {
  const worksheet = workbookFormula.getWorksheet('SCT_NAME_' + `${sheetId}`)

  // worksheet.name = dataHeaderForExcel[cntRows][0]['PRODUCT_TYPE_CODE_FOR_SCT']
  worksheet.name = props.dataHeaderForExcel[cntRows][0]['NAME']

  adjustMergeCells(worksheet)
  // **** set (Row , Column)
  // *** ITEM COST

  // console.log('Material', dataMaterial[cntRows][0]['ITEM_CATEGORY_NAME'])

  for (let i = 0; i < props.dataMaterial[cntRows].length; i++) {
    const element = props.dataMaterial[cntRows][i]
    const elementCompare = props.dataMaterialCompare[cntRows]
    worksheet.getCell(16 + i, 7).value = element['ITEM_CODE_FOR_SUPPORT_MES']
    worksheet.getCell(16 + i, 8).value = element['ITEM_CATEGORY_NAME']
    worksheet.getCell(16 + i, 9).value = element['ITEM_INTERNAL_FULL_NAME']
    worksheet.getCell(16 + i, 10).value = element['ITEM_INTERNAL_SHORT_NAME']
    worksheet.getCell(16 + i, 11).value = element['USAGE_QUANTITY']
    worksheet.getCell(16 + i, 12).value = element['USAGE_UNIT']
    worksheet.getCell(16 + i, 13).value = element['USAGE_PRICE']

    worksheet.getCell(16 + i, 16).value = element['OLD_SYSTEM_PROCESS_SEQUENCE_CODE']

    //  worksheet.getCell(16 + i, 17).value = element['YIELD_ACCUMULATION']

    // worksheet.getCell(16 + i, 19).value = element['AMOUNT']

    worksheet.getCell(16 + i, 14).value = elementCompare.find((item: any) => item.COMPARE_ITEM_ID == element['ITEM_ID'])?.COMPARE_USAGE_PRICE || ''

    worksheet.getCell(16 + i, 18).value =
      Number(
        elementCompare.find(
          (item: any) =>
            item.COMPARE_ITEM_ID == element['ITEM_ID'] && item.COMPARE_ITEM_CATEGORY_ID == element['ITEM_CATEGORY_ID'] && item.COMPARE_PROCESS_ID == element['PROCESS_ID']
        )?.COMPARE_YIELD_ACCUMULATION
      ) || ''

    worksheet.getCell(16 + i, 20).value =
      elementCompare.find(
        (item: any) =>
          item.COMPARE_ITEM_ID == element['ITEM_ID'] && item.COMPARE_ITEM_CATEGORY_ID == element['ITEM_CATEGORY_ID'] && item.COMPARE_PROCESS_ID == element['PROCESS_ID']
      )?.COMPARE_AMOUNT || ''
    conditionFormatting(worksheet, i)
  }

  for (let i = 0; i < props.dataHeaderForExcel?.length; i++) {
    const element = props.dataHeaderForExcel[cntRows][0]
    const elementIndirect = props.dataIndirectCostPriceTabsData[cntRows][0]

    // ** Header
    worksheet.getCell(4, 2).value = element['FISCAL_YEAR']
    worksheet.getCell(5, 2).value = element['PRODUCT_TYPE_CODE_FOR_SCT']
    worksheet.getCell(6, 2).value = element['SCT_REVISION_CODE'].substring(element['SCT_REVISION_CODE'].length - 2)
    worksheet.getCell(7, 2).value = element['NOTE']
    // worksheet.getCell(8, 2).value = await setFormatDate(element['ESTIMATE_PERIOD_START_DATE'])
    // worksheet.getCell(9, 2).value = await setFormatDate(element['ESTIMATE_PERIOD_END_DATE'])
    // worksheet.getCell(8, 2).value = element['ESTIMATE_PERIOD_START_DATE']
    // worksheet.getCell(9, 2).value = element['ESTIMATE_PERIOD_END_DATE']
    // worksheet.getCell(8, 2).value = new Date(element['ESTIMATE_PERIOD_START_DATE'])
    // worksheet.getCell(9, 2).value = new Date(element['ESTIMATE_PERIOD_END_DATE'])

    worksheet.getCell(8, 2).value = new Date(element['ESTIMATE_PERIOD_START_DATE'])
    worksheet.getCell(9, 2).value = new Date(element['ESTIMATE_PERIOD_END_DATE'])

    worksheet.getCell(11, 2).value = element['PRODUCT_TYPE_CODE_FOR_SCT']
    worksheet.getCell(12, 2).value = element['PRODUCT_TYPE_NAME']
    worksheet.getCell(13, 2).value = element['PRODUCT_TYPE_NAME']
    worksheet.getCell(14, 2).value = element['BOM_CODE']
    worksheet.getCell(15, 2).value = element['CUSTOMER_INVOICE_TO_ALPHABET']

    // ** Indirect Cost
    worksheet.getCell(16, 2).value = element['SCT_REVISION_CODE']
    worksheet.getCell(17, 2).value = elementIndirect['DIRECT_UNIT_PROCESS_COST']
    worksheet.getCell(18, 2).value = elementIndirect['INDIRECT_RATE_OF_DIRECT_PROCESS_COST'] ? Number(elementIndirect['INDIRECT_RATE_OF_DIRECT_PROCESS_COST'] / 100) : ''
    worksheet.getCell(19, 2).value = 'FFT'
    // worksheet.getCell(20, 2).value = element['TOTAL_PROCESSING_TIME'];
    // worksheet.getCell(21, 2).value = element['TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE'];
    // worksheet.getCell(22, 2).value = element['TOTAL_DIRECT_COST'];
    // worksheet.getCell(23, 2).value = element['DIRECT_PROCESS_COST'];
    // worksheet.getCell(24, 2).value = element['TOTAL_PRICE_OF_RAW_MATERIAL'];
    // worksheet.getCell(25, 2).value = element['TOTAL_PRICE_OF_SUB_ASSY'];
    // worksheet.getCell(26, 2).value = element['TOTAL_PRICE_OF_SEMI_FINISHED_GOODS'];
    // worksheet.getCell(27, 2).value = element['TOTAL_PRICE_OF_CONSUMABLE'];
    // worksheet.getCell(28, 2).value = element['TOTAL_PRICE_OF_PACKING'];
    // worksheet.getCell(29, 2).value = element['TOTAL_PRICE_OF_ALL_OF_ITEMS'];
    worksheet.getCell(30, 2).value = elementIndirect['IMPORTED_FEE'] ? Number(elementIndirect['IMPORTED_FEE'] / 100) : ''
    worksheet.getCell(31, 2).value = elementIndirect['IMPORTED_COST']
    // worksheet.getCell(32, 2).value = element['TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST'];
    worksheet.getCell(40, 2).value = elementIndirect['ASSEMBLY_GROUP_FOR_SUPPORT_MES']
    worksheet.getCell(41, 2).value = elementIndirect['INDIRECT_COST_SALE_AVE']
  }

  // ***์ OLD STANDARD COST DETAIL
  if (props.dataHeaderCompareForExcel[cntRows]?.length > 0) {
    for (let i = 0; i < props.dataHeaderCompareForExcel?.length; i++) {
      const element = props.dataHeaderCompareForExcel[cntRows][0]
      const elementIndirect = props.dataIndirectCostPriceTabsDataCompare[cntRows][0]

      worksheet.getCell(4, 3).value = element['COMPARE_FISCAL_YEAR']
      worksheet.getCell(5, 3).value = element['COMPARE_PRODUCT_TYPE_CODE_FOR_SCT']
      worksheet.getCell(6, 3).value = element['COMPARE_SCT_REVISION_CODE'].substring(element['COMPARE_SCT_REVISION_CODE'].length - 2)
      worksheet.getCell(7, 3).value = element['COMPARE_NOTE']
      // worksheet.getCell(8, 3).value = await setFormatDate(element['COMPARE_ESTIMATE_PERIOD_START_DATE'])
      // worksheet.getCell(9, 3).value = await setFormatDate(element['COMPARE_ESTIMATE_PERIOD_END_DATE'])
      // worksheet.getCell(8, 3).value = element['COMPARE_ESTIMATE_PERIOD_START_DATE']
      // worksheet.getCell(9, 3).value = element['COMPARE_ESTIMATE_PERIOD_END_DATE']

      worksheet.getCell(8, 3).value = new Date(element['COMPARE_ESTIMATE_PERIOD_START_DATE'])
      worksheet.getCell(9, 3).value = new Date(element['COMPARE_ESTIMATE_PERIOD_END_DATE'])

      worksheet.getCell(11, 3).value = element['COMPARE_PRODUCT_TYPE_CODE_FOR_SCT']
      worksheet.getCell(12, 3).value = element['COMPARE_PRODUCT_TYPE_NAME']
      worksheet.getCell(13, 3).value = element['COMPARE_PRODUCT_TYPE_NAME']
      worksheet.getCell(14, 3).value = element['COMPARE_BOM_CODE']
      worksheet.getCell(15, 3).value = element['COMPARE_CUSTOMER_INVOICE_TO_ALPHABET']
      //  ** Indirect Cost

      worksheet.getCell(16, 3).value = element['COMPARE_SCT_REVISION_CODE']
      worksheet.getCell(17, 3).value = elementIndirect['COMPARE_DIRECT_UNIT_PROCESS_COST']
      worksheet.getCell(18, 3).value = elementIndirect['COMPARE_INDIRECT_RATE_OF_DIRECT_PROCESS_COST']
        ? Number(elementIndirect['COMPARE_INDIRECT_RATE_OF_DIRECT_PROCESS_COST'] / 100)
        : ''
      worksheet.getCell(19, 3).value = elementIndirect['COMPARE_SCT_REVISION_CODE'] ? '' : 'FFT'
      worksheet.getCell(20, 3).value = elementIndirect['COMPARE_TOTAL_PROCESSING_TIME']
      worksheet.getCell(21, 3).value = elementIndirect['COMPARE_TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE']
        ? Number(elementIndirect['COMPARE_TOTAL_PROCESSING_TIME_INCLUDING_INDIRECT_RATE'])
        : ''
      worksheet.getCell(22, 3).value = elementIndirect['COMPARE_TOTAL_DIRECT_COST']
      worksheet.getCell(23, 3).value = elementIndirect['COMPARE_DIRECT_PROCESS_COST']
      worksheet.getCell(24, 3).value = elementIndirect['COMPARE_TOTAL_PRICE_OF_RAW_MATERIAL']
      worksheet.getCell(25, 3).value = elementIndirect['COMPARE_TOTAL_PRICE_OF_SUB_ASSY']
      worksheet.getCell(26, 3).value = elementIndirect['COMPARE_TOTAL_PRICE_OF_SEMI_FINISHED_GOODS']
      worksheet.getCell(27, 3).value = elementIndirect['COMPARE_TOTAL_PRICE_OF_CONSUMABLE']
      worksheet.getCell(28, 3).value = elementIndirect['COMPARE_TOTAL_PRICE_OF_PACKING']
      worksheet.getCell(29, 3).value = elementIndirect['COMPARE_TOTAL_PRICE_OF_ALL_OF_ITEMS']
      worksheet.getCell(30, 3).value = elementIndirect['COMPARE_IMPORTED_FEE'] ? Number(elementIndirect['COMPARE_IMPORTED_FEE'] / 100) : ''
      worksheet.getCell(31, 3).value = elementIndirect['COMPARE_IMPORTED_COST']
      worksheet.getCell(32, 3).value = elementIndirect['COMPARE_TOTAL_PRICE_OF_ALL_OF_ITEMS_INCLUDE_IMPORTED_COST']
      // worksheet.getCell(40, 3).value = element['ASSEMBLY_GROUP_FOR_SUPPORT_MES'];
      // worksheet.getCell(41, 3).value = element['INDIRECT_COST_SALE_AVE'];
    }
  }

  // *** PROCESSING COST
  for (let i = 0; i < props.dataFlowProcess[cntRows].length; i++) {
    const element = props.dataFlowProcess[cntRows][i]
    //(element['OLD_SYSTEM_COLLECTION_POINT'], i, processResult[cntRows].length);
    worksheet.getCell(16 + i, 22).value = element['OLD_SYSTEM_PROCESS_SEQUENCE_CODE']
    worksheet.getCell(16 + i, 23).value = element['PROCESS_NAME']
    worksheet.getCell(16 + i, 24).value = element['YIELD_RATE']
    // worksheet.getCell(16 + i, 25).value = element['YIELD_ACCUMULATION'];
    worksheet.getCell(16 + i, 26).value = element['CLEAR_TIME']
    worksheet.getCell(16 + i, 27).value = element['GO_STRAIGHT_RATE']
    // worksheet.getCell(16 + i, 28).value = element['ESSENTIAL_TIME'];
    // worksheet.getCell(16 + i, 29).value = element['PROCESS_STANDARD_TIME'];
    // worksheet.getCell(16 + i, 30).value = element['NOTE'];
    worksheet.getCell(16 + i, 31).value = element['OLD_SYSTEM_COLLECTION_POINT'] == 1 ? 'O' : ''
    worksheet.getCell(16 + i, 32).value =
      (element['OLD_SYSTEM_COLLECTION_POINT'] == 0 || element['OLD_SYSTEM_COLLECTION_POINT'] == null) && i == props.dataFlowProcess[cntRows].length - 1 ? 'O' : ''
    // worksheet.getCell(16 + i, 33).value = element['NOTE']
  }

  return workbookFormula
}

async function adjustMergeCells(worksheet: any) {
  worksheet.mergeCells('F14:F15')
  worksheet.mergeCells('G14:G15')
  worksheet.mergeCells('H14:H15')
  worksheet.mergeCells('I14:I15')
  worksheet.mergeCells('J14:J15')
  worksheet.mergeCells('K14:K15')
  worksheet.mergeCells('L14:L15')
  worksheet.mergeCells('M14:M15')
  worksheet.mergeCells('N14:N15')
  worksheet.mergeCells('O14:O15')
  worksheet.mergeCells('P14:P15')
  worksheet.mergeCells('Q14:Q15')
  worksheet.mergeCells('R14:R15')
  worksheet.mergeCells('S14:S15')
  worksheet.mergeCells('T14:T15')
  worksheet.mergeCells('U14:U15')
  worksheet.mergeCells('V14:V15')
  worksheet.mergeCells('W14:W15')
  worksheet.mergeCells('X14:X15')
  worksheet.mergeCells('Y14:Y15')
  worksheet.mergeCells('Z14:Z15')
  worksheet.mergeCells('AA14:AA15')
  worksheet.mergeCells('AB14:AB15')
  worksheet.mergeCells('AC14:AC15')
  worksheet.mergeCells('AD14:AD15')
  worksheet.mergeCells('AE14:AE15')
  worksheet.mergeCells('AF14:AF15')
  worksheet.mergeCells('AG14:AG15')
}

async function conditionFormatting(worksheet: any, row: number) {
  worksheet.addConditionalFormatting({
    ref: `K${16 + row}`,
    rules: [
      {
        type: 'cellIs',
        operator: 'lessThan',
        formulae: [0.0000005],
        // formulae: [4],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            bgColor: { argb: 'FF9999' },
          },
        },
      },
    ],
  })

  worksheet.addConditionalFormatting({
    ref: `M${16 + row}:N${16 + row}`,
    rules: [
      {
        type: 'cellIs',
        operator: 'lessThan',
        formulae: [0.0000005],
        // formulae: [4],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            bgColor: { argb: 'FF9999' },
          },
        },
      },
    ],
  })

  worksheet.addConditionalFormatting({
    ref: `S${16 + row}:T${16 + row}`,
    rules: [
      {
        type: 'cellIs',
        operator: 'lessThan',
        formulae: [0.0000005],
        // formulae: [4],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            bgColor: { argb: 'FF9999' },
          },
        },
      },
    ],
  })

  worksheet.addConditionalFormatting({
    ref: 'F16:T315',
    rules: [
      {
        type: 'containsText',
        operator: 'containsBlanks',
        // formulae: ['MOD(ROW()+COLUMN(),2)=0'],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            bgColor: { argb: 'F2F2F2' },
          },
        },
      },
    ],
  })
}

// async function setFormatDate(date: any) {
//   const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
//   let d = new Date(date),
//     month = '' + monthNames[d.getMonth()],
//     day = '' + d.getDate(),
//     year = d.getFullYear().toString().substr(-2)

//   if (month.length < 2) month = '0' + month
//   if (day.length < 2) day = '0' + day

//   return [day, month, year].join('-')
// }

const createPricingSheetWithFormula = async (workbookFormula: any, props: any) => {
  // *** Set initial Rows
  cntRowPricingFormula = 0
  await writingPricingFileWithFormula(workbookFormula, props)
}

async function writingPricingFileWithFormula(workbookFormula: any, props: any) {
  let worksheet = workbookFormula.getWorksheet('Pricing')

  let uniqueData = []
  let output = []
  let outputMainName = []

  for (let k = 0; k < props.dataHeaderPricingForExcel.length; k++) {
    if (uniqueData[props.dataHeaderPricingForExcel[k][0].PRODUCT_MAIN_NAME]) continue
    uniqueData[props.dataHeaderPricingForExcel[k][0].PRODUCT_MAIN_NAME] = true
    outputMainName.push(
      Object.assign(
        [],
        props.dataHeaderPricingForExcel[k][0],
        props.dataHeaderPricingCompareForExcel[k][0],
        props.dataIndirectCostPriceForPricingTabsData[k][0],
        props.dataIndirectCostPriceForPricingTabsDataCompare[k][0],
        props.dataSellingPrice[k][0],
        props.dataSellingPriceCompare[k][0]
      )
    )
  }

  // ** prepare output data pricing
  for (let k = 0; k < props.dataHeaderPricingForExcel.length; k++) {
    output.push(
      Object.assign(
        [],
        props.dataHeaderPricingForExcel[k][0],
        props.dataHeaderPricingCompareForExcel[k][0],
        props.dataIndirectCostPriceForPricingTabsData[k][0],
        props.dataIndirectCostPriceForPricingTabsDataCompare[k][0],
        props.dataSellingPrice[k][0],
        props.dataSellingPriceCompare[k][0]
      )
    )
  }

  // // ** Set Header Pricing File
  if (outputMainName?.length <= 1) {
    worksheet.getCell(1 + cntRowPricingFormula, 4).value = outputMainName[0]['FISCAL_YEAR']
    worksheet.getCell(1 + cntRowPricingFormula, 8).value = outputMainName[0]['SCT_REASON_SETTING_NAME']
    worksheet.getCell(2 + cntRowPricingFormula, 4).value = outputMainName[0]['PRODUCT_MAIN_NAME']
  } else {
    worksheet.getCell(1 + cntRowPricingFormula, 4).value = null
    worksheet.getCell(1 + cntRowPricingFormula, 8).value = null
    worksheet.getCell(2 + cntRowPricingFormula, 4).value = null
  }
  // ** Writing Pricing File
  //  console.log('length-price', dataHeaderForExcel.length)
  for (let i = 0; i < props.dataHeaderPricingForExcel.length; i++) {
    const element = output[i]
    recurseWithFormula(element, worksheet)
  }
  return workbookFormula
}

async function recurseWithFormula(element: any, worksheet: any) {
  //  console.log(element);
  // internal link

  if (element) {
    if (element?.LEVEL === 0) {
      worksheet.getCell(5 + cntRowPricingFormula, 2).value = element['NAME']
      // worksheet.getCell(5 + cntRowPricingFormula, 2).font = { bold: true }
      worksheet.getCell(5 + cntRowPricingFormula, 2).value = {
        text: element['NAME'],
        hyperlink: `#${element['NAME']}!B${5 + cntRowPricingFormula}`,
      }
    } else if (element?.LEVEL === 1) {
      worksheet.getCell(5 + cntRowPricingFormula, 3).value = element['NAME']
      worksheet.getCell(5 + cntRowPricingFormula, 3).value = {
        text: element['NAME'],
        hyperlink: `#${element['NAME']}!C${5 + cntRowPricingFormula}`,
      }
    } else if (element?.LEVEL === 2) {
      worksheet.getCell(5 + cntRowPricingFormula, 4).value = element['NAME']
      worksheet.getCell(5 + cntRowPricingFormula, 4).value = {
        text: element['NAME'],
        hyperlink: `#${element['NAME']}!D${5 + cntRowPricingFormula}`,
      }
    } else if (element?.LEVEL === 3) {
      worksheet.getCell(5 + cntRowPricingFormula, 5).value = element['NAME']
      worksheet.getCell(5 + cntRowPricingFormula, 5).value = {
        text: element['NAME'],
        hyperlink: `#${element['NAME']}!E${5 + cntRowPricingFormula}`,
      }
    } else if (element?.LEVEL === 4) {
      worksheet.getCell(5 + cntRowPricingFormula, 6).value = element['NAME']
      worksheet.getCell(5 + cntRowPricingFormula, 6).value = {
        text: element['NAME'],
        hyperlink: `#${element['NAME']}!F${5 + cntRowPricingFormula}`,
      }
    } else if (element?.LEVEL === 5) {
      worksheet.getCell(5 + cntRowPricingFormula, 7).value = element['NAME']
      worksheet.getCell(5 + cntRowPricingFormula, 7).value = {
        text: element['NAME'],
        hyperlink: `#${element['NAME']}!G${5 + cntRowPricingFormula}`,
      }
    } else if (element?.LEVEL === 6) {
      worksheet.getCell(5 + cntRowPricingFormula, 8).value = element['NAME']
      worksheet.getCell(5 + cntRowPricingFormula, 8).value = {
        text: element['NAME'],
        hyperlink: `#${element['NAME']}!H${5 + cntRowPricingFormula}`,
      }
    } else if (element?.LEVEL === 7) {
      worksheet.getCell(5 + cntRowPricingFormula, 9).value = element['NAME']
      worksheet.getCell(5 + cntRowPricingFormula, 9).value = {
        text: element['NAME'],
        hyperlink: `#${element['NAME']}!I${5 + cntRowPricingFormula}`,
      }
    } else if (element?.LEVEL === 8) {
      worksheet.getCell(5 + cntRowPricingFormula, 10).value = element['NAME']
      worksheet.getCell(5 + cntRowPricingFormula, 10).value = {
        text: element['NAME'],
        hyperlink: `#${element['NAME']}!J${5 + cntRowPricingFormula}`,
      }
    } else if (element?.LEVEL === 9) {
      worksheet.getCell(5 + cntRowPricingFormula, 11).value = element['NAME']
      worksheet.getCell(5 + cntRowPricingFormula, 11).value = {
        text: element['NAME'],
        hyperlink: `#${element['NAME']}!K${5 + cntRowPricingFormula}`,
      }
    } else if (element?.LEVEL === 10) {
      worksheet.getCell(5 + cntRowPricingFormula, 12).value = element['NAME']
      worksheet.getCell(5 + cntRowPricingFormula, 12).value = {
        text: element['NAME'],
        hyperlink: `#${element['NAME']}!L${5 + cntRowPricingFormula}`,
      }
    }

    worksheet.getCell(5 + cntRowPricingFormula, 13).value = element['PRODUCT_TYPE_NAME']
    worksheet.getCell(5 + cntRowPricingFormula, 14).value = element['ITEM_CATEGORY_NAME']
    worksheet.getCell(5 + cntRowPricingFormula, 15).value = element['SCT_REVISION_CODE']
    worksheet.getCell(5 + cntRowPricingFormula, 16).value = element['SCT_STATUS_PROGRESS_NAME']
    worksheet.getCell(5 + cntRowPricingFormula, 17).value = element['DIRECT_UNIT_PROCESS_COST']
    worksheet.getCell(5 + cntRowPricingFormula, 18).value = Number(element['INDIRECT_RATE_OF_DIRECT_PROCESS_COST'] / 100) ?? ''
    worksheet.getCell(5 + cntRowPricingFormula, 19).value = Number(element['IMPORTED_FEE'] / 100) ?? ''
    worksheet.getCell(5 + cntRowPricingFormula, 20).value = Number(element['SELLING_EXPENSE'] / 100) ?? ''
    worksheet.getCell(5 + cntRowPricingFormula, 21).value = Number(element['GA'] / 100) ?? ''
    worksheet.getCell(5 + cntRowPricingFormula, 22).value = Number(element['MARGIN'] / 100) ?? ''

    // worksheet.getCell(5 + cntRowPricing, 23).value = element['ITEM_CATEGORY_NAME'];
    worksheet.getCell(5 + cntRowPricingFormula, 24).value = element['RM_INCLUDE_IMPORTED_COST']
    worksheet.getCell(5 + cntRowPricingFormula, 25).value = element['CONSUMABLE_PACKING']
    // worksheet.getCell(5 + cntRowPricing, 26).value = element['MATERIALS_COST'];
    worksheet.getCell(5 + cntRowPricingFormula, 27).value = element['DIRECT_PROCESS_COST']
    // worksheet.getCell(5 + cntRowPricing, 28).value = element['TOTAL_DIRECT_COST'];
    worksheet.getCell(5 + cntRowPricingFormula, 29).value = element['INDIRECT_COST_SALE_AVE']
    // worksheet.getCell(5 + cntRowPricing, 30).value = element['SELLING_EXPENSE_FOR_SELLING_PRICE'];
    // worksheet.getCell(5 + cntRowPricing, 31).value = element['GA_FOR_SELLING_PRICE'];
    // worksheet.getCell(5 + cntRowPricing, 32).value = element['MARGIN_FOR_SELLING_PRICE'];
    // worksheet.getCell(5 + cntRowPricing, 33).value = element['SELLING_PRICE_BY_FORMULA'];
    // worksheet.getCell(5 + cntRowPricing, 34).value = element['SELLING_PRICE'];
    worksheet.getCell(5 + cntRowPricingFormula, 35).value = moment(element['ESTIMATE_PERIOD_START_DATE']).format('DD-MMM-YY')
    worksheet.getCell(5 + cntRowPricingFormula, 36).value = Number(element['TOTAL_YIELD_RATE'] / 100) ?? ''
    worksheet.getCell(5 + cntRowPricingFormula, 37).value = element['TOTAL_CLEAR_TIME']
    worksheet.getCell(5 + cntRowPricingFormula, 38).value = element['ADJUST_PRICE']
    worksheet.getCell(5 + cntRowPricingFormula, 39).value = Number(element['CIT'] / 100) ?? ''
    // worksheet.getCell(5 + cntRowPricingFormula, 40).value = element['CIT_FOR_SELLING_PRICE']
  }

  // *** Compared Data

  if (element?.COMPARE_SCT_REVISION_CODE) {
    worksheet.getCell(5 + cntRowPricingFormula, 44).value = element['COMPARE_SCT_REVISION_CODE']
    worksheet.getCell(5 + cntRowPricingFormula, 45).value = element['COMPARE_SCT_STATUS_PROGRESS_NAME']
    worksheet.getCell(5 + cntRowPricingFormula, 46).value = element['COMPARE_DIRECT_UNIT_PROCESS_COST']
    worksheet.getCell(5 + cntRowPricingFormula, 47).value = Number(element['COMPARE_INDIRECT_RATE_OF_DIRECT_PROCESS_COST'] / 100) ?? ''
    worksheet.getCell(5 + cntRowPricingFormula, 48).value = Number(element['COMPARE_IMPORTED_FEE'] / 100) ?? ''
    worksheet.getCell(5 + cntRowPricingFormula, 49).value = Number(element['COMPARE_SELLING_EXPENSE'] / 100) ?? ''
    worksheet.getCell(5 + cntRowPricingFormula, 50).value = Number(element['COMPARE_GA'] / 100) ?? ''
    worksheet.getCell(5 + cntRowPricingFormula, 51).value = Number(element['COMPARE_MARGIN'] / 100) ?? ''

    worksheet.getCell(5 + cntRowPricingFormula, 53).value = element['COMPARE_RM_INCLUDE_IMPORTED_COST']
    worksheet.getCell(5 + cntRowPricingFormula, 54).value = element['COMPARE_CONSUMABLE_PACKING']
    // worksheet.getCell(5 + cntRowPricing, 55).value = element['MATERIALS_COST'];
    worksheet.getCell(5 + cntRowPricingFormula, 56).value = element['COMPARE_DIRECT_PROCESS_COST']
    //worksheet.getCell(5 + cntRowPricing, 57).value = element['TOTAL_DIRECT_COST'];
    worksheet.getCell(5 + cntRowPricingFormula, 58).value = element['COMPARE_INDIRECT_COST_SALE_AVE']
    //worksheet.getCell(5 + cntRowPricing, 59).value = element['SELLING_EXPENSE_FOR_SELLING_PRICE'];
    //worksheet.getCell(5 + cntRowPricing, 60).value = element['GA_FOR_SELLING_PRICE'];
    //worksheet.getCell(5 + cntRowPricing, 61).value = element['MARGIN_FOR_SELLING_PRICE'];
    //worksheet.getCell(5 + cntRowPricing, 62).value = element['SELLING_PRICE_BY_FORMULA'];
    //worksheet.getCell(5 + cntRowPricing, 63).value = element['SELLING_PRICE'];
    worksheet.getCell(5 + cntRowPricingFormula, 64).value = moment(element['COMPARE_ESTIMATE_PERIOD_START_DATE']).format('DD-MMM-YY')
    worksheet.getCell(5 + cntRowPricingFormula, 65).value = Number(element['COMPARE_TOTAL_YIELD_RATE'] / 100) ?? ''
    worksheet.getCell(5 + cntRowPricingFormula, 66).value = element['COMPARE_TOTAL_CLEAR_TIME']
    worksheet.getCell(5 + cntRowPricingFormula, 67).value = element['COMPARE_ADJUST_PRICE']
    worksheet.getCell(5 + cntRowPricingFormula, 68).value = Number(element['COMPARE_CIT'] / 100) ?? ''
    // worksheet.getCell(5 + cntRowPricingFormula, 69).value = element['COMPARE_CIT_FOR_SELLING_PRICE']
  }
  cntRowPricingFormula++
}
