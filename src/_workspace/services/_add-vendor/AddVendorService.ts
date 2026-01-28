import { MySQLExecute } from '@businessData/dbExecute'
import { AddVendorSQL } from '@src/_workspace/sql/_add-vendor/AddVendorSQL'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export const AddVendorService = {
    // Check if vendor already exists
    checkDuplicateVendor: async (dataItem: any) => {
        console.log('=== CHECK DUPLICATE VENDOR ===')
        console.log('Input dataItem:', JSON.stringify(dataItem, null, 2))

        const sql = await AddVendorSQL.checkDuplicateVendor(dataItem)
        console.log('Generated SQL:', sql)

        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        console.log('Query Result:', JSON.stringify(resultData, null, 2))
        console.log('Result Count:', resultData.length)
        console.log('=== END CHECK ===')

        if (resultData.length > 0) {
            const response = {
                Status: true,
                isDuplicate: true,
                existingVendorId: resultData[0].vendor_id,
                Message: 'Vendor already exists',
            }
            console.log('RETURNING (DUPLICATE FOUND):', JSON.stringify(response, null, 2))
            return response
        }

        const response = {
            Status: true,
            isDuplicate: false,
            existingVendorId: null,
            Message: 'Vendor is available for registration',
        }
        console.log('RETURNING (NOT DUPLICATE):', JSON.stringify(response, null, 2))
        return response
    },

    // Create vendor with contacts and products
    createVendor: async (dataItem: any) => {
        try {
            // Step 1: Check duplicate first
            const checkResult = await AddVendorService.checkDuplicateVendor({
                company_name: dataItem.company_name,
                email: dataItem.email,
            })

            if (checkResult.isDuplicate) {
                return {
                    Status: false,
                    Message: `Vendor already exists! (ID: ${checkResult.existingVendorId})`,
                    ResultOnDb: [],
                    MethodOnDb: 'Create Vendor Failed',
                    TotalCountOnDb: 0,
                }
            }

            // Step 2: Insert main vendor
            const sqlCreateVendor = await AddVendorSQL.createVendor(dataItem)
            const resultVendor = (await MySQLExecute.execute(sqlCreateVendor)) as ResultSetHeader

            if (!resultVendor.insertId) {
                return {
                    Status: false,
                    Message: 'Failed to create vendor',
                    ResultOnDb: [],
                    MethodOnDb: 'Create Vendor Failed',
                    TotalCountOnDb: 0,
                }
            }

            const vendorId = resultVendor.insertId

            // Step 3: Insert contacts
            if (dataItem.contacts && dataItem.contacts.length > 0) {
                for (const contact of dataItem.contacts) {
                    const contactData = {
                        vendor_id: vendorId,
                        contact_name: contact.contact_name,
                        tel_phone: contact.tel_phone || '',
                        email: contact.email || '',
                        position: contact.position || '',
                        CREATE_BY: dataItem.CREATE_BY,
                    }
                    const sqlContact = await AddVendorSQL.createVendorContact(contactData)
                    await MySQLExecute.execute(sqlContact)
                }
            }

            // Step 4: Insert products
            if (dataItem.products && dataItem.products.length > 0) {
                for (const product of dataItem.products) {
                    const productData = {
                        vendor_id: vendorId,
                        product_group_id: product.product_group_id,
                        maker_name: product.maker_name,
                        product_name: product.product_name,
                        model_list: product.model_list || '',
                        CREATE_BY: dataItem.CREATE_BY,
                    }
                    const sqlProduct = await AddVendorSQL.createVendorProduct(productData)
                    await MySQLExecute.execute(sqlProduct)
                }
            }

            return {
                Status: true,
                Message: 'บันทึกข้อมูลเรียบร้อยแล้ว Data has been saved successfully',
                ResultOnDb: { vendorId },
                MethodOnDb: 'Create Vendor Success',
                TotalCountOnDb: 1,
                vendorId,
            }
        } catch (error: any) {
            return {
                Status: false,
                Message: error?.message || 'Failed to create vendor',
                ResultOnDb: [],
                MethodOnDb: 'Create Vendor Failed',
                TotalCountOnDb: 0,
            }
        }
    },

    // Get vendor types for dropdown
    getVendorTypes: async () => {
        const sql = await AddVendorSQL.getVendorTypes()
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Get product groups for dropdown
    getProductGroups: async () => {
        const sql = await AddVendorSQL.getProductGroups()
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Create new product group
    createProductGroup: async (dataItem: any) => {
        try {
            // Check duplicate first
            const checkSql = await AddVendorSQL.checkDuplicateProductGroup(dataItem)
            const checkResult = (await MySQLExecute.search(checkSql)) as RowDataPacket[]

            if (checkResult.length > 0) {
                return {
                    Status: false,
                    Message: 'Product Group already exists!',
                    ResultOnDb: [],
                    MethodOnDb: 'Create Product Group Failed',
                    TotalCountOnDb: 0,
                }
            }

            // Insert new product group
            const sql = await AddVendorSQL.createProductGroup(dataItem)
            const resultData = (await MySQLExecute.execute(sql)) as ResultSetHeader

            if (resultData.insertId) {
                return {
                    Status: true,
                    Message: 'Data has been saved successfully',
                    ResultOnDb: { product_group_id: resultData.insertId },
                    MethodOnDb: 'Create Product Group Success',
                    TotalCountOnDb: 1,
                }
            }

            return {
                Status: false,
                Message: 'Failed to create product group',
                ResultOnDb: [],
                MethodOnDb: 'Create Product Group Failed',
                TotalCountOnDb: 0,
            }
        } catch (error: any) {
            return {
                Status: false,
                Message: error?.message || 'Failed to create product group',
                ResultOnDb: [],
                MethodOnDb: 'Create Product Group Failed',
                TotalCountOnDb: 0,
            }
        }
    },
}
