import { ResponseI } from "@src/types/ResponseI"
export const VendorController = {
    searchVendor: async (req: Request, res: Response) => {
        let dataItem

        if (!req.body || Object.entries(req.body).length === 0) {
            dataItem = req.query
        } else {
            dataItem = req.body
        }

        const tableIds = [
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
            MethodOnDb: 'Find Vendor',
            Message: 'Find Data Success',
        } as ResponseI)
    },
}