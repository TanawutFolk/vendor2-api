import { ItemModel } from '@src/_workspace/models/item-master/item/ItemModel'
import getSqlWhere from '@src/helpers/sqlWhere'
import { ResponseI } from '@src/types/ResponseI'
import ExcelJS from 'exceljs'
import { Request, Response } from 'express'
import fs from 'fs'
import mime from 'mime-types'
import path from 'path'
import sharp from 'sharp'
const xl = require('excel4node')
export const ItemController = {
  getViewItemDataByItemId: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ItemModel.getViewItemDataByItemId(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getAll: async (req: Request, res: Response) => {
    let dataItem
    // let allImages: any[] = []

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const tableIds = [
      { table: 'tb_1', id: 'ITEM_CATEGORY_ID', Fns: '=' },
      { table: 'tb_3', id: 'ITEM_PURPOSE_ID', Fns: '=' },
      { table: 'tb_3', id: 'ITEM_GROUP_ID', Fns: '=' },
      { table: 'tb_3', id: 'VENDOR_ID', Fns: '=' },
      { table: 'tb_3', id: 'MAKER_ID', Fns: '=' },
      { table: 'tb_7', id: 'MAKER_NAME', Fns: '=' },
      { table: 'tb_3', id: 'ITEM_PROPERTY_SHAPE_ID', Fns: '=' },
      { table: 'tb_3', id: 'WIDTH', Fns: '=' },
      { table: 'tb_3', id: 'HEIGHT', Fns: '=' },
      { table: 'tb_3', id: 'DEPTH', Fns: '=' },
      { table: 'tb_3', id: 'ITEM_PROPERTY_COLOR_NAME', Fns: '=' },
      { table: 'tb_9', id: 'ITEM_PROPERTY_SHAPE_NAME', Fns: '=' },
      // { table: 'tb_17', id: 'CUSTOMER_ORDER_FROM_ALPHABET', Fns: 'LIKE' },
      { table: 'tb_3', id: 'PURCHASE_UNIT_RATIO', Fns: '=' },
      { table: 'tb_23', id: 'SYMBOL', alias: 'PURCHASE_UNIT_NAME', Fns: '=' },
      { table: 'tb_20', id: 'SYMBOL', alias: 'USAGE_UNIT_NAME', Fns: '=' },
      { table: 'tb_9', id: 'ITEM_PROPERTY_SHAPE_NAME', Fns: 'LIKE' },
      { table: 'tb_26', id: 'MOQ', Fns: 'LIKE' },
      { table: 'tb_26', id: 'LEAD_TIME', Fns: 'LIKE' },
      { table: 'tb_26', id: 'SAFETY_STOCK', Fns: 'LIKE' },
      { table: 'tb_2', id: 'ITEM_CATEGORY_NAME', Fns: 'LIKE' },
      { table: 'tb_1', id: 'STATUS_ID', Fns: '=' },
      { table: 'tb_3', id: 'ITEM_INTERNAL_FULL_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_INTERNAL_SHORT_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_EXTERNAL_CODE', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_EXTERNAL_FULL_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_EXTERNAL_SHORT_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_CODE_FOR_SUPPORT_MES', Fns: 'LIKE' },
      { table: 'tb_3', id: 'USAGE_UNIT_RATIO', Fns: 'LIKE' },
      { table: 'tb_3', id: 'WIDTH', Fns: '=' },
      { table: 'tb_3', id: 'HEIGHT', Fns: '=' },
      { table: 'tb_3', id: 'DEPTH', Fns: '=' },
      { table: 'tb_3', id: 'ITEM_PROPERTY_COLOR_ID', Fns: '=' },
      { table: 'tb_3', id: 'NOTE', Fns: '=' },
      { table: 'tb_8', id: 'ITEM_PROPERTY_COLOR_NAME', Fns: 'LIKE' },
      { table: 'tb_25', id: 'COLOR_ID', Fns: '=' },
      { table: 'tb_25', id: 'COLOR_HEX', Fns: '=' },
      { table: 'tb_25', id: 'COLOR_NAME', Fns: '=' },
      { table: 'tb_4', id: 'ITEM_PURPOSE_NAME', Fns: 'LIKE' },
      { table: 'tb_5', id: 'ITEM_GROUP_NAME', Fns: 'LIKE' },
      { table: 'tb_6', id: 'VENDOR_ALPHABET', Fns: 'LIKE' },
      { table: 'tb_26', id: 'MOQ', Fns: '=' },
      { table: 'tb_26', id: 'LEAD_TIME', Fns: '=' },
      { table: 'tb_26', id: 'SAFETY_STOCK', Fns: '=' },
      { table: 'tb_11', id: 'CUSTOMER_ORDER_FROM_ID', Fns: '=' },
      { table: 'tb_1', id: 'CREATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CREATE_DATE', Fns: '=' },
      { table: 'tb_3', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_3', id: 'UPDATE_DATE', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: ` ITEM tb_1
                    INNER JOIN
                ITEM_CATEGORY tb_2
                    ON tb_1.ITEM_CATEGORY_ID = tb_2.ITEM_CATEGORY_ID
                    AND tb_2.ITEM_CATEGORY_ID NOT IN (1,2,3)
                    INNER JOIN
                ITEM_MANUFACTURING tb_3
                    ON tb_1.ITEM_ID = tb_3.ITEM_ID
                    AND tb_3.IS_CURRENT = 1
                    INNER JOIN
                ITEM_PURPOSE tb_4
                    ON tb_3.ITEM_PURPOSE_ID  = tb_4.ITEM_PURPOSE_ID
                    INNER JOIN
                ITEM_GROUP tb_5
                    ON tb_3.ITEM_GROUP_ID  = tb_5.ITEM_GROUP_ID
                    INNER JOIN
                VENDOR tb_6
                    ON tb_3.VENDOR_ID  = tb_6.VENDOR_ID
                    INNER JOIN
                MAKER tb_7
                    ON tb_3.MAKER_ID  = tb_7.MAKER_ID
                    LEFT JOIN
                ITEM_PROPERTY_COLOR tb_8
                    ON tb_3.ITEM_PROPERTY_COLOR_ID  = tb_8.ITEM_PROPERTY_COLOR_ID
                    LEFT JOIN
                ITEM_PROPERTY_SHAPE tb_9
                    ON tb_3.ITEM_PROPERTY_SHAPE_ID  = tb_9.ITEM_PROPERTY_SHAPE_ID
                    LEFT JOIN
                ITEM_PROPERTY_MADE_BY tb_10
                    ON tb_3.ITEM_PROPERTY_MADE_BY_ID  = tb_10.ITEM_PROPERTY_MADE_BY_ID
                    LEFT JOIN
                UNIT_OF_MEASUREMENT tb_20
                    ON tb_3.USAGE_UNIT_ID = tb_20.UNIT_OF_MEASUREMENT_ID
                    LEFT JOIN
                UNIT_OF_MEASUREMENT tb_23
                    ON tb_3.PURCHASE_UNIT_ID = tb_23.UNIT_OF_MEASUREMENT_ID
                    LEFT JOIN
                ITEM_THEME_COLOR tb_24
                    ON tb_1.ITEM_ID = tb_24.ITEM_ID
                    AND tb_24.INUSE = 1
                    LEFT JOIN
                COLOR tb_25
                    ON tb_24.COLOR_ID = tb_25.COLOR_ID
                    LEFT JOIN
                ITEM_STOCK tb_26
                    ON tb_3.ITEM_ID = tb_26.ITEM_ID
                    AND tb_26.INUSE = 1`,
      selectInuseForSearch: `IF(tb_1.INUSE = 0 OR tb_3.INUSE = 0 ,0 , IF(EXISTS(SELECT ITEM_ID from BOM_FLOW_PROCESS_ITEM_USAGE tbs_1
                  INNER JOIN BOM tbs_2
                  ON tbs_1.BOM_ID = tbs_2.BOM_ID AND tbs_2.INUSE = 1
                  WHERE tbs_1.ITEM_ID = tb_1.ITEM_ID AND tbs_1.INUSE = 1 LIMIT 1),2,IF(
                  EXISTS
                  (
                          SELECT
                              ITEM_ID
                          FROM
                              BOM_FLOW_PROCESS_ITEM_USAGE tbs_3
                          WHERE
                              tbs_3.ITEM_ID = tb_1.ITEM_ID
                  ) = TRUE
      , 3
      , 1
      ))) AS inuseForSearch`,
    }
    getSqlWhere(dataItem, tableIds)

    const result = await ItemModel.getAll(dataItem)

    // let length = result[0][0]['TOTAL_COUNT']
    // let pathFiles: any[] = []
    // let defaultPathFiles: any[] = []

    // for (let i = 0; i < length; i++) {
    //   let imgPath = result[1][i]?.IMAGE_PATH

    //   if (imgPath && imgPath !== 'undefined') pathFiles.push(imgPath)
    // }
    // for (let i = 0; i < length; i++) {
    //   let defaultImgPath = result[1][i]?.DEFAULT_IMG_PATH
    //   if (defaultImgPath && defaultImgPath !== 'undefined') defaultPathFiles.push(defaultImgPath)
    // }

    // let pathImgData = [{ imagesPath: pathFiles, defaultImagePath: defaultPathFiles }]

    // for (const item of pathImgData) {
    //   for (let folderPath of item.imagesPath) {
    //     if (!folderPath) continue
    //     folderPath = path.join(folderPath, 'original/')
    //     let normalizedPath = folderPath
    //     if (fs.existsSync(normalizedPath)) {
    //       const files = fs.readdirSync(normalizedPath)
    //       const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(file))

    //       const images = imageFiles.map((file) => {
    //         const imagePath = path.join(normalizedPath, file)
    //         item.defaultImagePath = item.defaultImagePath.filter((n) => n)
    //         const isDefault = item.defaultImagePath.some((path) => path.includes(imagePath.replaceAll(' ', '\\ ')))
    //         let base64 = ''
    //         const imageBuffer = fs.readFileSync(imagePath)
    //         base64 = `data:image/${path.extname(file).slice(1)};base64,${imageBuffer.toString('base64')}`

    //         return {
    //           id: Math.random().toString(36).substring(2, 9),
    //           url: imagePath.replaceAll('/', "'/'").slice(1, imagePath.replaceAll('/', "'/'").length) + "'",
    //           base64: base64,
    //           isDefault: isDefault,
    //         }
    //       })
    //       allImages = [...allImages, ...images]
    //     }
    //   }
    // }

    // result[1] = result[1].map((item: any) => ({
    //   ...item,
    //   images: allImages.filter((img) => {
    //     const itemCode = String(item.ITEM_CODE_FOR_SUPPORT_MES)
    //     return img.url.includes(`${itemCode}`)
    //   }),
    // }))

    res.json({
      Status: true,
      ResultOnDb: result[1],
      TotalCountOnDb: result[0][0]['TOTAL_COUNT'] as Number,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getAllUnlimit: async (req: Request, res: Response) => {
    let dataItem
    let allImages: any[] = []

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    // console.log(dataItem)

    const tableIds = [
      { table: 'tb_1', id: 'ITEM_CATEGORY_ID', Fns: '=' },
      { table: 'tb_3', id: 'ITEM_PURPOSE_ID', Fns: '=' },
      { table: 'tb_3', id: 'ITEM_GROUP_ID', Fns: '=' },
      { table: 'tb_3', id: 'VENDOR_ID', Fns: '=' },
      { table: 'tb_3', id: 'MAKER_ID', Fns: '=' },
      { table: 'tb_1', id: 'STATUS_ID', Fns: '=' },

      { table: 'tb_3', id: 'ITEM_INTERNAL_FULL_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_INTERNAL_SHORT_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_EXTERNAL_CODE', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_EXTERNAL_FULL_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_EXTERNAL_SHORT_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_CODE_FOR_SUPPORT_MES', Fns: 'LIKE' },

      { table: 'tb_1', id: 'CREATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CREATE_DATE', Fns: '=' },
      { table: 'tb_3', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_3', id: 'UPDATE_DATE', Fns: '=' },
    ]

    dataItem = {
      ...dataItem,
      sqlJoin: ` ITEM tb_1
                    INNER JOIN
                ITEM_CATEGORY tb_2
                    ON tb_1.ITEM_CATEGORY_ID = tb_2.ITEM_CATEGORY_ID
                    INNER JOIN
                ITEM_MANUFACTURING tb_3
                    ON tb_1.ITEM_ID = tb_3.ITEM_ID
                    INNER JOIN
                ITEM_PURPOSE tb_4
                    ON tb_3.ITEM_PURPOSE_ID  = tb_4.ITEM_PURPOSE_ID
                    INNER JOIN
                ITEM_GROUP tb_5
                    ON tb_3.ITEM_GROUP_ID  = tb_5.ITEM_GROUP_ID
                    INNER JOIN
                VENDOR tb_6
                    ON tb_3.VENDOR_ID  = tb_6.VENDOR_ID
                    INNER JOIN
                MAKER tb_7
                    ON tb_3.MAKER_ID  = tb_7.MAKER_ID
                    LEFT JOIN
                ITEM_PROPERTY_COLOR tb_8
                    ON tb_3.ITEM_PROPERTY_COLOR_ID  = tb_8.ITEM_PROPERTY_COLOR_ID
                    LEFT JOIN
                ITEM_PROPERTY_SHAPE tb_9
                    ON tb_3.ITEM_PROPERTY_SHAPE_ID  = tb_9.ITEM_PROPERTY_SHAPE_ID
                    LEFT JOIN
                ITEM_PROPERTY_MADE_BY tb_10
                    ON tb_3.ITEM_PROPERTY_MADE_BY_ID  = tb_10.ITEM_PROPERTY_MADE_BY_ID
                    LEFT JOIN
                ITEM_PRODUCT_DETAIL tb_11
                    ON tb_3.ITEM_ID = tb_11.ITEM_ID
                    LEFT JOIN
                PRODUCT_TYPE tb_12
                    ON tb_11.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID
                    LEFT JOIN
                PRODUCT_SUB tb_13
                    ON tb_12.PRODUCT_SUB_ID = tb_13.PRODUCT_SUB_ID
                    LEFT JOIN
                WORK_ORDER tb_14
                    ON tb_11.WORK_ORDER_ID  = tb_14.WORK_ORDER_ID
                    LEFT JOIN
                PART_NO  tb_15
                    ON tb_11.PART_NO_ID  = tb_15.PART_NO_ID
                    LEFT JOIN
                SPECIFICATION tb_16
                    ON tb_11.SPECIFICATION_ID  = tb_16.SPECIFICATION_ID
                    LEFT JOIN
                CUSTOMER_ORDER_FROM  tb_17
                    ON tb_11.CUSTOMER_ORDER_FROM_ID  = tb_17.CUSTOMER_ORDER_FROM_ID
                    LEFT JOIN
                PRODUCT_MAIN tb_18
                    ON tb_13.PRODUCT_MAIN_ID = tb_18.PRODUCT_MAIN_ID
                    LEFT JOIN
                PRODUCT_CATEGORY tb_19
                    ON tb_18.PRODUCT_CATEGORY_ID = tb_19.PRODUCT_CATEGORY_ID
                    INNER JOIN
                UNIT_OF_MEASUREMENT tb_20
                    ON tb_3.USAGE_UNIT_ID = tb_20.UNIT_OF_MEASUREMENT_ID
                    LEFT JOIN
                UNIT_OF_MEASUREMENT tb_23
                    ON tb_3.PURCHASE_UNIT_ID = tb_23.UNIT_OF_MEASUREMENT_ID
                    LEFT JOIN
                ITEM_THEME_COLOR tb_24
                    ON tb_1.ITEM_ID = tb_24.ITEM_ID
                    AND tb_24.INUSE = 1
                    LEFT JOIN
                COLOR tb_25
                    ON tb_24.COLOR_ID = tb_25.COLOR_ID
                    LEFT JOIN
                ITEM_STOCK tb_26
                    ON tb_3.ITEM_ID = tb_26.ITEM_ID
                    AND tb_26.INUSE = 1`,
      selectInuseForSearch: `IF(tb_1.INUSE = 0 OR tb_3.INUSE = 0 ,0 , IF(EXISTS(SELECT ITEM_ID from BOM_FLOW_PROCESS_ITEM_USAGE tbs_1
                  INNER JOIN BOM tbs_2
                  ON tbs_1.BOM_ID = tbs_2.BOM_ID AND tbs_2.INUSE = 1
                  WHERE tbs_1.ITEM_ID = tb_1.ITEM_ID AND tbs_1.INUSE = 1 LIMIT 1),2,IF(
                  EXISTS
                  (
                          SELECT
                              ITEM_ID
                          FROM
                              BOM_FLOW_PROCESS_ITEM_USAGE tbs_3
                          WHERE
                              tbs_3.ITEM_ID = tb_1.ITEM_ID
                  ) = TRUE
      , 3
      , 1
      ))) AS inuseForSearch`,
    }
    getSqlWhere(dataItem, tableIds)
    const result = await ItemModel.getAllUnlimit(dataItem)

    let length = result[0][0]['TOTAL_COUNT']
    let pathFiles: any[] = []
    let defaultPathFiles: any[] = []

    for (let i = 0; i < length; i++) {
      let imgPath = result[1][i]?.IMAGE_PATH
      if (pathFiles) pathFiles.push(imgPath)
    }
    for (let i = 0; i < length; i++) {
      let defaultImgPath = result[1][i]?.DEFAULT_IMG_PATH
      if (defaultPathFiles) defaultPathFiles.push(defaultImgPath)
    }
    // pathFiles = pathFiles.filter((n: any) => n)
    // defaultPathFiles = defaultPathFiles.filter((n: any) => n)

    let pathImgData = [{ imagesPath: pathFiles, defaultImagePath: defaultPathFiles }]

    const convertToUncPath = (networkPath: string): string => {
      return networkPath.replace(/\//g, '\\')
    }

    for (const item of pathImgData) {
      // วนลูปผ่านทุก imagesPath
      for (let folderPath of item.imagesPath) {
        if (!folderPath) continue // ข้ามถ้า path ไม่มีค่า
        // folderPath = path.join(folderPath, 'optimized\\large')
        folderPath = path.join(folderPath, 'original\\')
        let normalizedPath = convertToUncPath(folderPath)

        // console.log(item.defaultImagePath)

        if (fs.existsSync(normalizedPath)) {
          const files = fs.readdirSync(normalizedPath)
          // กรองเฉพาะไฟล์รูปภาพ
          const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(file))

          const images = imageFiles.map((file) => {
            const imagePath = path.join(normalizedPath, file)
            const fileName = path.basename(imagePath)

            item.defaultImagePath = item.defaultImagePath.filter((n) => n)

            const isDefault = item.defaultImagePath.some((path) => path.includes(fileName))

            let base64 = ''
            const imageBuffer = fs.readFileSync(imagePath) // อ่านไฟล์
            base64 = `data:image/${path.extname(file).slice(1)};base64,${imageBuffer.toString('base64')}`

            return {
              id: Math.random().toString(36).substring(2, 9), // ใช้ path กับ index เป็น ID
              url: imagePath, // รวม path และชื่อไฟล์
              // url: base64, // รวม path และชื่อไฟล์
              base64: base64, // ไม่มี base64 เพราะใช้ path
              isDefault: isDefault, // ถ้าตรงกับ defaultImagePath ให้เป็น default
            }
          })

          // เพิ่มรูปภาพที่ได้จาก path นี้ไปยัง allImages
          allImages = [...allImages, ...images]
        }
      }
      // console.log(allImages)
    }
    result[1] = result[1].map((item: any) => ({
      ...item,
      images: allImages.filter((img) => {
        const itemCode = String(item.ITEM_CODE_FOR_SUPPORT_MES) // ✅ แปลงให้เป็น string เสมอ
        return img.url.includes(`\\${itemCode}\\`)
        // return true
      }),
    }))

    // console.log(result[1])

    res.json({
      Status: true,
      ResultOnDb: result[1],
      // TotalCountOnDb: result[1].length as Number,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeItemCodeNameAndInuse: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ItemModel.getByLikeItemCodeNameAndInuse(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeItemCodeNameAndInuse_NotFG: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ItemModel.getByLikeItemCodeNameAndInuse_NotFG(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getItemPriceByItemIdAndFiscalYear: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    const result = await ItemModel.getItemPriceByItemIdAndFiscalYear(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeItemCodeAndInuseAndNotFGSemiFGSubAs: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await ItemModel.getByLikeItemCodeAndInuseAndNotFGSemiFGSubAs(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  create: async (req: Request, res: Response) => {
    let dataItem
    let savedFiles: any = []

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }

    if (dataItem.IMG.length != 0) {
      const basePath = `/mnt/C20_Smart_Factory/WG04_Smart-FFT/08_Master Data System/Item Master/uploads/${dataItem.ITEM_CODE_FOR_SUPPORT_MES}/`

      const paths = {
        basePath,
        original: path.join(basePath, 'original'),
        optimized: path.join(basePath, 'optimized'),
        large: path.join(basePath, 'optimized/large'),
        medium: path.join(basePath, 'optimized/medium'),
        small: path.join(basePath, 'optimized/small'),
      }

      Object.values(paths).forEach((folder) => {
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true })
        }
      })

      try {
        for (let i = 0; i < dataItem.IMG.length; i++) {
          const { base64, isDefault } = dataItem.IMG[i]
          if (!base64) continue

          const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/)
          if (!matches || matches.length !== 3) {
            res.status(400).json({ Status: false, Message: 'Invalid base64 format' })
            return
            // return res.status(400).json({ Status: false, Message: 'Invalid base64 format' })
          }

          const ext = matches[1]
          const buffer = Buffer.from(matches[2], 'base64')

          const filename = `${dataItem.ITEM_CODE_FOR_SUPPORT_MES}_${i + 1}.${ext}`
          const filePaths = {
            basePath,
            original: path.join(paths.original, filename),
            large: path.join(paths.large, filename),
            medium: path.join(paths.medium, filename),
            small: path.join(paths.small, filename),
          }

          fs.writeFileSync(filePaths.original, buffer)

          await Promise.all([
            sharp(buffer).resize(1600, 1200, { fit: 'inside' }).jpeg({ quality: 80 }).toFile(filePaths.large),

            sharp(buffer).resize(800, 600, { fit: 'inside' }).jpeg({ quality: 80 }).toFile(filePaths.medium),

            sharp(buffer).resize(300, 300, { fit: 'inside' }).jpeg({ quality: 80 }).toFile(filePaths.small),
          ])

          savedFiles.push({
            rootPath: basePath.replace(/\\/g, '/'),
            original: filePaths.original.replace(/\\/g, '/'),
            large: filePaths.large.replace(/\\/g, '/'),
            medium: filePaths.medium.replace(/\\/g, '/'),
            small: filePaths.small.replace(/\\/g, '/'),
            isDefault: isDefault, // บันทึกค่า isDefault ไว้ในอ็อบเจ็กต์
          })
        }
      } catch (error) {
        console.error(error)
        res.status(500).json({ Status: false, Message: 'Internal server error' })
      }
    }

    const DEFAULT_IMG_PATH = savedFiles.find((file: any) => file.isDefault)?.large || ''
    const IMAGE_PATH = savedFiles[0]?.rootPath || ''
    dataItem = {
      ...dataItem,
      savedFiles,
      DEFAULT_IMG_PATH,
      IMAGE_PATH,
    }

    const result = await ItemModel.create(dataItem)

    res.status(200).json(result)
  },
  update: async (req: Request, res: Response) => {
    let dataItem
    let savedFiles = []

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }
    // console.log(dataItem)
    if (dataItem.IMG.length != 0) {
      const basePath = `/mnt/C20_Smart_Factory/WG04_Smart-FFT/08_Master Data System/Item Master/uploads/${dataItem.ITEM_CODE_FOR_SUPPORT_MES}/`

      const paths = {
        basePath,
        original: path.join(basePath, 'original'),
        optimized: path.join(basePath, 'optimized'),
        large: path.join(basePath, 'optimized/large'),
        medium: path.join(basePath, 'optimized/medium'),
        small: path.join(basePath, 'optimized/small'),
      }

      // **ลบไฟล์ทั้งหมดก่อน**
      Object.values(paths).forEach((folder) => {
        if (fs.existsSync(folder)) {
          fs.rmSync(folder, { recursive: true, force: true }) // ลบโฟลเดอร์และไฟล์ทั้งหมด
        }
      })

      // **สร้างโฟลเดอร์ใหม่**
      Object.values(paths).forEach((folder) => {
        fs.mkdirSync(folder, { recursive: true })
      })

      try {
        for (let i = 0; i < dataItem.IMG.length; i++) {
          const { base64, isDefault } = dataItem.IMG[i]
          if (!base64) continue

          const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/)
          if (!matches || matches.length !== 3) {
            res.status(400).json({ Status: false, Message: 'Invalid base64 format' })
            return
          }

          const ext = matches[1]
          const buffer = Buffer.from(matches[2], 'base64')

          const filename = `${dataItem.ITEM_CODE_FOR_SUPPORT_MES}_${i + 1}.${ext}`
          const filePaths = {
            original: path.join(paths.original, filename),
            large: path.join(paths.large, filename),
            medium: path.join(paths.medium, filename),
            small: path.join(paths.small, filename),
          }

          fs.writeFileSync(filePaths.original, buffer)

          await Promise.all([
            sharp(buffer).resize(1600, 1200, { fit: 'inside' }).jpeg({ quality: 80 }).toFile(filePaths.large),
            sharp(buffer).resize(800, 600, { fit: 'inside' }).jpeg({ quality: 80 }).toFile(filePaths.medium),
            sharp(buffer).resize(300, 300, { fit: 'inside' }).jpeg({ quality: 80 }).toFile(filePaths.small),
          ])

          savedFiles.push({
            rootPath: basePath.replace(/\\/g, '/'),
            original: filePaths.original.replace(/\\/g, '/'),
            large: filePaths.large.replace(/\\/g, '/'),
            medium: filePaths.medium.replace(/\\/g, '/'),
            small: filePaths.small.replace(/\\/g, '/'),
            isDefault,
          })
        }
        // หา path ของรูปที่เป็น default
        const DEFAULT_IMG_PATH = savedFiles.find((file) => file.isDefault)?.large || ''
        const IMAGE_PATH = savedFiles[0]?.rootPath || ''

        dataItem = {
          ...dataItem,
          savedFiles,
          DEFAULT_IMG_PATH,
          IMAGE_PATH,
        }
      } catch (error) {
        console.error(error)
        res.status(500).json({ Status: false, Message: 'Internal server error' })
      }
    } else {
      const basePath = `/mnt/C20_Smart_Factory/WG04_Smart-FFT/08_Master Data System/Item Master/uploads/${dataItem.ITEM_CODE_FOR_SUPPORT_MES}/`

      const paths = {
        basePath,
        original: path.join(basePath, 'original'),
        optimized: path.join(basePath, 'optimized'),
        large: path.join(basePath, 'optimized/large'),
        medium: path.join(basePath, 'optimized/medium'),
        small: path.join(basePath, 'optimized/small'),
      }

      // **ลบไฟล์ทั้งหมดก่อน**
      Object.values(paths).forEach((folder) => {
        if (fs.existsSync(folder)) {
          fs.rmSync(folder, { recursive: true, force: true }) // ลบโฟลเดอร์และไฟล์ทั้งหมด
        }
      })
    }

    // console.log(dataItem)

    const result = await ItemModel.update(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  delete: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await ItemModel.delete(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getImageFromUrl: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    // dataItem.DEFAULT_IMG_PATH = dataItem?.DEFAULT_IMG_PATH !== null ? dataItem?.DEFAULT_IMG_PATH.replace(/^\/\/192\.168\.14\.35/, '/mnt') : 'NO PATH'

    dataItem.DEFAULT_IMG_PATH = dataItem?.DEFAULT_IMG_PATH !== null ? dataItem?.DEFAULT_IMG_PATH.replace(/^\/\//, '\\\\') : 'NO PATH'
    // dataItem.DEFAULT_IMG_PATH = dataItem?.DEFAULT_IMG_PATH !== null ? dataItem?.DEFAULT_IMG_PATH.replace(/^\/\/192\.168\.14\.35/, '/mnt') : 'NO PATH'

    // console.log('Test  : ', dataItem.DEFAULT_IMG_PATH)
    fs.readFile(path.resolve(dataItem.DEFAULT_IMG_PATH), (error, data) => {
      if (error || dataItem.DEFAULT_IMG_PATH === 'NO PATH') {
        // console.log('ERROR', error)

        // ถ้าเกิด error หรือ path เป็น '' ให้ส่ง response 404 โดยไม่ทำงานต่อ
        if (!res.headersSent) {
          res.writeHead(404, { 'Content-Type': 'image/jpg' })
          res.end('No such image')
        }
      } else {
        // ถ้าไฟล์อ่านได้ ให้ส่งข้อมูลภาพ
        const extname = path.extname(dataItem.DEFAULT_IMG_PATH) // รับนามสกุลไฟล์
        const mimeType = mime.lookup(extname)
        if (!res.headersSent) {
          res.writeHead(200, { 'Content-Type': mimeType || 'application/octet-stream' }) // กำหนด
          res.end(data, 'binary')
        }
      }
    })
  },
  downloadFileForExportItem: async (req: Request, res: Response) => {
    // console.log('test-------------------------', req.body)
    let query = req.body.DataForFetch
    const tableIds = [
      { table: 'tb_1', id: 'ITEM_CATEGORY_ID', Fns: '=' },
      { table: 'tb_3', id: 'ITEM_PURPOSE_ID', Fns: '=' },
      { table: 'tb_3', id: 'ITEM_GROUP_ID', Fns: '=' },
      { table: 'tb_3', id: 'VENDOR_ID', Fns: '=' },
      { table: 'tb_3', id: 'MAKER_ID', Fns: '=' },
      { table: 'tb_1', id: 'STATUS_ID', Fns: '=' },

      { table: 'tb_3', id: 'ITEM_INTERNAL_FULL_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_INTERNAL_SHORT_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_EXTERNAL_CODE', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_EXTERNAL_FULL_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_EXTERNAL_SHORT_NAME', Fns: 'LIKE' },
      { table: 'tb_3', id: 'ITEM_CODE_FOR_SUPPORT_MES', Fns: 'LIKE' },

      { table: 'tb_1', id: 'CREATE_BY', Fns: 'LIKE' },
      { table: 'tb_1', id: 'CREATE_DATE', Fns: '=' },
      { table: 'tb_3', id: 'UPDATE_BY', Fns: 'LIKE' },
      { table: 'tb_3', id: 'UPDATE_DATE', Fns: '=' },
    ]
    if (req.body.TYPE === 'currentPage') {
      query = {
        ...query,
        sqlJoin: ` ITEM tb_1
                    INNER JOIN
                ITEM_CATEGORY tb_2
                    ON tb_1.ITEM_CATEGORY_ID = tb_2.ITEM_CATEGORY_ID
                    AND tb_2.ITEM_CATEGORY_ID NOT IN (1,2,3)
                    INNER JOIN
                ITEM_MANUFACTURING tb_3
                    ON tb_1.ITEM_ID = tb_3.ITEM_ID
                    INNER JOIN
                ITEM_PURPOSE tb_4
                    ON tb_3.ITEM_PURPOSE_ID  = tb_4.ITEM_PURPOSE_ID
                    INNER JOIN
                ITEM_GROUP tb_5
                    ON tb_3.ITEM_GROUP_ID  = tb_5.ITEM_GROUP_ID
                    INNER JOIN
                VENDOR tb_6
                    ON tb_3.VENDOR_ID  = tb_6.VENDOR_ID
                    INNER JOIN
                MAKER tb_7
                    ON tb_3.MAKER_ID  = tb_7.MAKER_ID
                    LEFT JOIN
                ITEM_PROPERTY_COLOR tb_8
                    ON tb_3.ITEM_PROPERTY_COLOR_ID  = tb_8.ITEM_PROPERTY_COLOR_ID
                    LEFT JOIN
                ITEM_PROPERTY_SHAPE tb_9
                    ON tb_3.ITEM_PROPERTY_SHAPE_ID  = tb_9.ITEM_PROPERTY_SHAPE_ID
                    LEFT JOIN
                ITEM_PROPERTY_MADE_BY tb_10
                    ON tb_3.ITEM_PROPERTY_MADE_BY_ID  = tb_10.ITEM_PROPERTY_MADE_BY_ID
                    LEFT JOIN
                UNIT_OF_MEASUREMENT tb_20
                    ON tb_3.USAGE_UNIT_ID = tb_20.UNIT_OF_MEASUREMENT_ID
                    LEFT JOIN
                UNIT_OF_MEASUREMENT tb_23
                    ON tb_3.PURCHASE_UNIT_ID = tb_23.UNIT_OF_MEASUREMENT_ID
                    LEFT JOIN
                ITEM_THEME_COLOR tb_24
                    ON tb_1.ITEM_ID = tb_24.ITEM_ID
                    AND tb_24.INUSE = 1
                    LEFT JOIN
                COLOR tb_25
                    ON tb_24.COLOR_ID = tb_25.COLOR_ID
                    LEFT JOIN
                ITEM_STOCK tb_26
                    ON tb_3.ITEM_ID = tb_26.ITEM_ID
                    AND tb_26.INUSE = 1`,
        selectInuseForSearch: `IF(tb_1.INUSE = 0 OR tb_3.INUSE = 0 ,0 , IF(EXISTS(SELECT ITEM_ID from BOM_FLOW_PROCESS_ITEM_USAGE tbs_1
                  INNER JOIN BOM tbs_2
                  ON tbs_1.BOM_ID = tbs_2.BOM_ID AND tbs_2.INUSE = 1
                  WHERE tbs_1.ITEM_ID = tb_1.ITEM_ID AND tbs_1.INUSE = 1 LIMIT 1),2,IF(
                  EXISTS
                  (
                          SELECT
                              ITEM_ID
                          FROM
                              BOM_FLOW_PROCESS_ITEM_USAGE tbs_3
                          WHERE
                              tbs_3.ITEM_ID = tb_1.ITEM_ID
                  ) = TRUE
      , 3
      , 1
      ))) AS inuseForSearch`,
      }
    } else {
      query = {
        ...query,
        sqlJoin: ` ITEM tb_1
                    INNER JOIN
                ITEM_CATEGORY tb_2
                    ON tb_1.ITEM_CATEGORY_ID = tb_2.ITEM_CATEGORY_ID
                    AND tb_2.ITEM_CATEGORY_ID NOT IN (1,2,3)
                    INNER JOIN
                ITEM_MANUFACTURING tb_3
                    ON tb_1.ITEM_ID = tb_3.ITEM_ID
                    INNER JOIN
                ITEM_PURPOSE tb_4
                    ON tb_3.ITEM_PURPOSE_ID  = tb_4.ITEM_PURPOSE_ID
                    INNER JOIN
                ITEM_GROUP tb_5
                    ON tb_3.ITEM_GROUP_ID  = tb_5.ITEM_GROUP_ID
                    INNER JOIN
                VENDOR tb_6
                    ON tb_3.VENDOR_ID  = tb_6.VENDOR_ID
                    INNER JOIN
                MAKER tb_7
                    ON tb_3.MAKER_ID  = tb_7.MAKER_ID
                    LEFT JOIN
                ITEM_PROPERTY_COLOR tb_8
                    ON tb_3.ITEM_PROPERTY_COLOR_ID  = tb_8.ITEM_PROPERTY_COLOR_ID
                    LEFT JOIN
                ITEM_PROPERTY_SHAPE tb_9
                    ON tb_3.ITEM_PROPERTY_SHAPE_ID  = tb_9.ITEM_PROPERTY_SHAPE_ID
                    LEFT JOIN
                ITEM_PROPERTY_MADE_BY tb_10
                    ON tb_3.ITEM_PROPERTY_MADE_BY_ID  = tb_10.ITEM_PROPERTY_MADE_BY_ID
                    LEFT JOIN
                ITEM_PRODUCT_DETAIL tb_11
                    ON tb_3.ITEM_ID = tb_11.ITEM_ID
                    LEFT JOIN
                PRODUCT_TYPE tb_12
                    ON tb_11.PRODUCT_TYPE_ID = tb_12.PRODUCT_TYPE_ID
                    LEFT JOIN
                PRODUCT_SUB tb_13
                    ON tb_12.PRODUCT_SUB_ID = tb_13.PRODUCT_SUB_ID
                    LEFT JOIN
                WORK_ORDER tb_14
                    ON tb_11.WORK_ORDER_ID  = tb_14.WORK_ORDER_ID
                    LEFT JOIN
                PART_NO  tb_15
                    ON tb_11.PART_NO_ID  = tb_15.PART_NO_ID
                    LEFT JOIN
                SPECIFICATION tb_16
                    ON tb_11.SPECIFICATION_ID  = tb_16.SPECIFICATION_ID
                    LEFT JOIN
                CUSTOMER_ORDER_FROM  tb_17
                    ON tb_11.CUSTOMER_ORDER_FROM_ID  = tb_17.CUSTOMER_ORDER_FROM_ID
                    LEFT JOIN
                PRODUCT_MAIN tb_18
                    ON tb_13.PRODUCT_MAIN_ID = tb_18.PRODUCT_MAIN_ID
                    LEFT JOIN
                PRODUCT_CATEGORY tb_19
                    ON tb_18.PRODUCT_CATEGORY_ID = tb_19.PRODUCT_CATEGORY_ID
                    INNER JOIN
                UNIT_OF_MEASUREMENT tb_20
                    ON tb_3.USAGE_UNIT_ID = tb_20.UNIT_OF_MEASUREMENT_ID
                    LEFT JOIN
                UNIT_OF_MEASUREMENT tb_23
                    ON tb_3.PURCHASE_UNIT_ID = tb_23.UNIT_OF_MEASUREMENT_ID
                    LEFT JOIN
                ITEM_THEME_COLOR tb_24
                    ON tb_1.ITEM_ID = tb_24.ITEM_ID
                    AND tb_24.INUSE = 1
                    LEFT JOIN
                COLOR tb_25
                    ON tb_24.COLOR_ID = tb_25.COLOR_ID
                    LEFT JOIN
                ITEM_STOCK tb_26
                    ON tb_3.ITEM_ID = tb_26.ITEM_ID
                    AND tb_26.INUSE = 1`,
        selectInuseForSearch: `IF(tb_1.INUSE = 0 OR tb_3.INUSE = 0 ,0 , IF(EXISTS(SELECT ITEM_ID from BOM_FLOW_PROCESS_ITEM_USAGE tbs_1
                  INNER JOIN BOM tbs_2
                  ON tbs_1.BOM_ID = tbs_2.BOM_ID AND tbs_2.INUSE = 1
                  WHERE tbs_1.ITEM_ID = tb_1.ITEM_ID AND tbs_1.INUSE = 1 LIMIT 1),2,IF(
                  EXISTS
                  (
                          SELECT
                              ITEM_ID
                          FROM
                              BOM_FLOW_PROCESS_ITEM_USAGE tbs_3
                          WHERE
                              tbs_3.ITEM_ID = tb_1.ITEM_ID
                  ) = TRUE
      , 3
      , 1
      ))) AS inuseForSearch`,
      }
    }

    getSqlWhere(query, tableIds)
    // console.log(req.body.TYPE)

    if (req.body.TYPE === 'currentPage') {
      const ignoreColumns = ['IMAGE_PATH']
      const headerMap: Record<string, string> = {
        inuseForSearch: 'STATUS',
        ITEM_CODE_FOR_SUPPORT_MES: 'ITEM CODE',
        ITEM_CATEGORY_NAME: 'ITEM CATEGORY NAME',
        ITEM_INTERNAL_FULL_NAME: 'ITEM INTERNAL FULL NAME',
        ITEM_INTERNAL_SHORT_NAME: 'ITEM INTERNAL SHORT NAME',
        ITEM_EXTERNAL_CODE: 'ITEM EXTERNAL CODE',
        ITEM_EXTERNAL_FULL_NAME: 'ITEM EXTERNAL FULL NAME',
        ITEM_EXTERNAL_SHORT_NAME: 'ITEM EXTERNAL SHORT NAME',
        ITEM_PURPOSE_NAME: 'ITEM PURPOSE NAME',
        ITEM_GROUP_NAME: 'ITEM GROUP NAME',
        VENDOR_NAME: 'VENDOR NAME',
        MAKER_NAME: 'MAKER NAME',
        PURCHASE_UNIT_RATIO: 'PURCHASE UNIT RATIO',
        MOQ: 'MOQ',
        LEAD_TIME: 'LEAD TIME',
        SAFETY_STOCK: 'SAFETY STOCK',
        WIDTH: 'WIDTH',
        HEIGHT: 'HEIGHT',
        DEPTH: 'DEPTH',
        USAGE_UNIT_RATIO: 'USAGE UNIT RATIO',
        USAGE_UNIT_NAME: 'USAGE UNIT NAME',
        PURCHASE_UNIT_NAME: 'PURCHASE UNIT NAME',
        ITEM_PROPERTY_COLOR_NAME: 'ITEM PROPERTY COLOR NAME',
        ITEM_PROPERTY_SHAPE_NAME: 'ITEM PROPERTY SHAPE NAME',
        CUSTOMER_ORDER_FROM_ALPHABET: 'CUSTOMER ORDER FROM ALPHABET',
        COLOR_NAME: 'THEME COLOR NAME',
        UPDATE_BY: 'UPDATE BY',
        UPDATE_DATE: 'UPDATE DATE',
      }
      const result = await ItemModel.getAll(query)
      let dataItem = Object.entries(req.body).length === 0 ? req.query : req.body

      const columnFilters = dataItem.columnFilters || []
      const columnVisibility = dataItem.columnVisibility || {}
      const data = result[1] || []

      // เลือกเฉพาะ columns ที่ไม่อยู่ใน ignore และ ไม่ถูก hidden
      const visibleColumns = columnFilters.filter(
        (col: any) => !ignoreColumns.includes(col) && columnVisibility[col] !== false && col !== 'mrt-row-spacer' && col !== 'mrt-row-actions'
      )

      if (visibleColumns.length === 0) {
        return res.status(400).json({ error: 'No visible columns to export.' })
      }

      const wb = new xl.Workbook()
      const ws = wb.addWorksheet('Manufacturing Item')

      // ตั้งค่าสไตล์ที่มี border
      // const wrapBorderStyle = wb.createStyle({
      //   font: { name: 'Aptos', size: 11, bold: true },
      //   alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      //   border: {
      //     left: { style: 'thin' },
      //     right: { style: 'thin' },
      //     top: { style: 'thin' },
      //     bottom: { style: 'thin' },
      //   },
      //   fill: {
      //     type: 'pattern',
      //     patternType: 'solid',
      //     fgColor: '#D9D9D9',
      //   },
      // })

      // const bodyStyle = wb.createStyle({
      //   font: { name: 'Arial', size: 11 },
      //   alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
      // })

      // Map header ตาม headerMap
      visibleColumns.forEach((col: any, colIndex: any) => {
        const headerText = headerMap[col] || col
        ws.cell(1, colIndex + 1)
          .string(headerText)
          .style(
            wb.createStyle({
              font: { name: 'Aptos', size: 11, bold: true },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: false }, // ไม่ wrap
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
      ws.row(1).setHeight(25) // ปรับสูงเผื่อ header

      // ใส่ข้อมูล + เก็บความยาว
      const maxColWidths: number[] = visibleColumns.map((col: any) => (headerMap[col] || col).length)
      data.forEach((row: any, rowIndex: any) => {
        visibleColumns.forEach((col: any, colIndex: any) => {
          let cellValue = row[col]
          if (col === 'inuseForSearch') {
            cellValue = cellValue === 1 ? 'Can use' : cellValue === 2 ? 'Using' : cellValue === 3 ? 'Can use (Used)' : 'Cancel'
          }
          const finalValue = cellValue !== undefined && cellValue !== null ? cellValue.toString() : ''
          ws.cell(rowIndex + 2, colIndex + 1)
            .string(finalValue)
            .style(
              wb.createStyle({
                font: { name: 'Arial', size: 11 },
                alignment: { horizontal: 'left', vertical: 'center', wrapText: false }, // ไม่ wrap
              })
            )
          maxColWidths[colIndex] = Math.max(maxColWidths[colIndex], finalValue.length)
        })
      })

      // ปรับขนาดคอลัมน์ (อิงความยาวอักษร x 1.4) แต่ไม่เกิน 50
      maxColWidths.forEach((width, index) => {
        const finalWidth = Math.min(Math.ceil(width * 1.6), 50)
        ws.column(index + 1).setWidth(finalWidth)
      })
      const now = new Date()
      const pad = (n: any) => n.toString().padStart(2, '0')
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
      const menuName = req.body.menuName || 'Export' // ใช้ชื่อเมนูจาก frontend ถ้ามีส่งมา
      const filename = `${menuName}_${timestamp}.xlsx`

      // บันทึกไฟล์แล้วส่งให้ client
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
      const ignoreColumns = ['IMAGE_PATH']
      const headerMap: Record<string, string> = {
        inuseForSearch: 'STATUS',
        ITEM_CODE_FOR_SUPPORT_MES: 'ITEM CODE',
        ITEM_CATEGORY_NAME: 'ITEM CATEGORY NAME',
        ITEM_INTERNAL_FULL_NAME: 'ITEM INTERNAL FULL NAME',
        ITEM_INTERNAL_SHORT_NAME: 'ITEM INTERNAL SHORT NAME',
        ITEM_EXTERNAL_CODE: 'ITEM EXTERNAL CODE',
        ITEM_EXTERNAL_FULL_NAME: 'ITEM EXTERNAL FULL NAME',
        ITEM_EXTERNAL_SHORT_NAME: 'ITEM EXTERNAL SHORT NAME',
        ITEM_PURPOSE_NAME: 'ITEM PURPOSE NAME',
        ITEM_GROUP_NAME: 'ITEM GROUP NAME',
        VENDOR_NAME: 'VENDOR NAME',
        MAKER_NAME: 'MAKER NAME',
        PURCHASE_UNIT_RATIO: 'PURCHASE UNIT RATIO',
        MOQ: 'MOQ',
        LEAD_TIME: 'LEAD TIME',
        SAFETY_STOCK: 'SAFETY STOCK',
        WIDTH: 'WIDTH',
        HEIGHT: 'HEIGHT',
        DEPTH: 'DEPTH',
        USAGE_UNIT_RATIO: 'USAGE UNIT RATIO',
        USAGE_UNIT_NAME: 'USAGE UNIT NAME',
        PURCHASE_UNIT_NAME: 'PURCHASE UNIT NAME',
        ITEM_PROPERTY_COLOR_NAME: 'ITEM PROPERTY COLOR NAME',
        ITEM_PROPERTY_SHAPE_NAME: 'ITEM PROPERTY SHAPE NAME',
        CUSTOMER_ORDER_FROM_ALPHABET: 'CUSTOMER ORDER FROM ALPHABET',
        COLOR_NAME: 'THEME COLOR NAME',
        UPDATE_BY: 'UPDATE BY',
        UPDATE_DATE: 'UPDATE DATE',
      }
      const result = await ItemModel.getAllUnlimit(query)
      let dataItem = Object.entries(req.body).length === 0 ? req.query : req.body
      const columnFilters = dataItem.columnFilters || []
      const columnVisibility = dataItem.columnVisibility || {}
      const data = result[1] || []

      // เลือกเฉพาะ columns ที่ไม่อยู่ใน ignore และ ไม่ถูก hidden
      const visibleColumns = columnFilters.filter(
        (col: any) => !ignoreColumns.includes(col) && columnVisibility[col] !== false && col !== 'mrt-row-spacer' && col !== 'mrt-row-actions'
      )

      if (visibleColumns.length === 0) {
        return res.status(400).json({ error: 'No visible columns to export.' })
      }

      const wb = new xl.Workbook()
      const ws = wb.addWorksheet('Manufacturing Item')

      // ตั้งค่าสไตล์ที่มี border
      // const wrapBorderStyle = wb.createStyle({
      //   font: { name: 'Aptos', size: 11, bold: true },
      //   alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      //   border: {
      //     left: { style: 'thin' },
      //     right: { style: 'thin' },
      //     top: { style: 'thin' },
      //     bottom: { style: 'thin' },
      //   },
      //   fill: {
      //     type: 'pattern',
      //     patternType: 'solid',
      //     fgColor: '#D9D9D9',
      //   },
      // })

      // const bodyStyle = wb.createStyle({
      //   font: { name: 'Arial', size: 11 },
      //   alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
      // })

      // ใส่ header
      visibleColumns.forEach((col: any, colIndex: any) => {
        const headerText = headerMap[col] || col
        ws.cell(1, colIndex + 1)
          .string(headerText)
          .style(
            wb.createStyle({
              font: { name: 'Aptos', size: 11, bold: true },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: false }, // ไม่ wrap
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
      ws.row(1).setHeight(25) // ปรับสูงเผื่อ header

      // ใส่ข้อมูล + เก็บความยาว
      const maxColWidths: number[] = visibleColumns.map((col: any) => (headerMap[col] || col).length)
      data.forEach((row: any, rowIndex: any) => {
        visibleColumns.forEach((col: any, colIndex: any) => {
          let cellValue = row[col]
          if (col === 'inuseForSearch') {
            cellValue = cellValue === 1 ? 'Can use' : cellValue === 2 ? 'Using' : cellValue === 3 ? 'Can use (Used)' : 'Cancel'
          }
          const finalValue = cellValue !== undefined && cellValue !== null ? cellValue.toString() : ''
          ws.cell(rowIndex + 2, colIndex + 1)
            .string(finalValue)
            .style(
              wb.createStyle({
                font: { name: 'Arial', size: 11 },
                alignment: { horizontal: 'left', vertical: 'center', wrapText: false }, // ไม่ wrap
              })
            )
          maxColWidths[colIndex] = Math.max(maxColWidths[colIndex], finalValue.length)
        })
      })

      // ปรับขนาดคอลัมน์ (อิงความยาวอักษร x 1.6) แต่ไม่เกิน 50
      maxColWidths.forEach((width, index) => {
        const finalWidth = Math.min(Math.ceil(width * 1.6), 50)
        ws.column(index + 1).setWidth(finalWidth)
      })

      const now = new Date()
      const pad = (n: any) => n.toString().padStart(2, '0')
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
      const menuName = req.body.menuName || 'Export' // ใช้ชื่อเมนูจาก frontend ถ้ามีส่งมา
      const filename = `${menuName}_${timestamp}.xlsx`

      // บันทึกไฟล์แล้วส่งให้ client
      wb.writeToBuffer()
        .then((buffer: any) => {
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
          res.send(buffer)
        })
        .catch((err: any) => {
          res.status(500).json({ error: 'Failed to generate file', err })
        })
    }
  },
  downloadTemplate: async (req: Request, res: Response) => {
    try {
      let wb = new ExcelJS.Workbook()
      await wb.xlsx
        .readFile('ITEM-IMPORT-TEMPLATE.xlsx')
        .then(async function () {
          const now = new Date()
          const yyyy = now.getFullYear()
          const mm = String(now.getMonth() + 1).padStart(2, '0')
          const dd = String(now.getDate()).padStart(2, '0')
          const hh = String(now.getHours()).padStart(2, '0')
          const mi = String(now.getMinutes()).padStart(2, '0')
          const ss = String(now.getSeconds()).padStart(2, '0')

          const timestamp = `${yyyy}${mm}${dd}_${hh}${mi}${ss}`
          const filename = `ManufacturingItem_${timestamp}_Template.xlsx`

          await wb.xlsx
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
        })
        .catch(function (err) {
          res.status(500).send({
            Status: false,
            ResultOnDb: 'ERROR CREATE EXCEL: ' + err,
            TotalCountOnDb: '',
            MethodOnDb: 'Create Item Template Data',
            Message: 'Create Excel Error',
          })
        })
    } catch (err) {
      res.status(500).send({
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Item Template Data',
        Message: 'Create Excel Error' + err,
      })
    }
  },
  createItemList: async (req: Request, res: Response) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
      dataItem = req.query
    } else {
      dataItem = req.body
    }

    const result = await ItemModel.createItemList(dataItem)
    res.json(result)
  },
  getByLikeItemCodeByLike: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ItemModel.getByLikeItemCodeByLike(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeItemCodeByLikeAndBOMId: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ItemModel.getByLikeItemCodeByLikeAndBOMId(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeItemCodeAll: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ItemModel.getByLikeItemCodeAll(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeItemCodeAndProductMain: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ItemModel.getByLikeItemCodeAndProductMain(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
  getByLikeItemCode: async (req: Request, res: Response) => {
    let dataItem

    if (Object.entries(req.body).length === 0) {
      dataItem = req.query.data
    } else {
      dataItem = req.body
    }
    const result = await ItemModel.getByLikeItemCode(dataItem)

    res.json({
      Status: true,
      ResultOnDb: result,
      TotalCountOnDb: 0,
      MethodOnDb: 'Search Item',
      Message: 'Search Data Success',
    } as ResponseI)
  },
}
