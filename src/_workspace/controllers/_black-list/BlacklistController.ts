import { Request, Response } from 'express'
import { ResponseI } from '@src/types/ResponseI'
import { BlacklistModel } from '@src/_workspace/models/_black-list/BlacklistModel'
import { BlacklistUSModel } from '@src/_workspace/models/_black-list/BlacklistModel'
import { BlacklistCNModel } from '@src/_workspace/models/_black-list/BlacklistModel'

const getRequestDataItem = (req: Request) => {
    let dataItem

    if (!req.body || Object.entries(req.body).length === 0) {
        dataItem = req.query
    } else {
        dataItem = req.body
    }

    if (typeof dataItem.dataItem === 'string') {
        try {
            return JSON.parse(dataItem.dataItem)
        } catch {
            return dataItem
        }
    }

    if (dataItem.dataItem && typeof dataItem.dataItem === 'object') {
        return dataItem.dataItem
    }

    return dataItem
}

// ─── US ─────────────────────────────────────────────────────────────────────

export const BlacklistController = {
    search: async (req: Request, res: Response) => {
        const dataItem = getRequestDataItem(req)

        try {
            const result = await BlacklistModel.search(dataItem)
            return res.status(200).json({
                Status: true,
                ResultOnDb: result[1],
                TotalCountOnDb: result[0]?.[0]?.TOTAL_COUNT ?? 0,
                MethodOnDb: 'Search Blacklist',
                Message: 'Success',
            } as ResponseI)
        } catch (error: any) {
            console.error('Search Blacklist Error:', error)
            return res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Search Blacklist',
                Message: error?.message || 'Failed to search blacklist',
            } as ResponseI)
        }
    },
}

export const BlacklistUSController = {
    search: async (req: Request, res: Response) => {
        const dataItem = getRequestDataItem(req)

        try {
            const result = await BlacklistUSModel.search(dataItem)
            return res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Search Blacklist US',
                Message: 'Success',
            } as ResponseI)
        } catch (error: any) {
            console.error('Search Blacklist US Error:', error)
            return res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Search Blacklist US',
                Message: error?.message || 'Failed to search US blacklist',
            } as ResponseI)
        }
    },

    importFile: async (req: Request, res: Response) => {
        const dataItem = getRequestDataItem(req)

        try {
            const result = await BlacklistUSModel.importFile({
                ...dataItem,
                file: req.file,
            })

            return res.status(200).json({
                Status: result?.Status ?? false,
                ResultOnDb: result?.ResultOnDb ?? {},
                TotalCountOnDb: result?.TotalCountOnDb ?? 0,
                MethodOnDb: result?.MethodOnDb || 'Import Blacklist US',
                Message: result?.Message || 'Success',
            } as ResponseI)
        } catch (error: any) {
            console.error('Import Blacklist US Error:', error)
            return res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Import Blacklist US',
                Message: error?.message || 'Failed to import US blacklist',
            } as ResponseI)
        }
    },
}

// ─── CN ─────────────────────────────────────────────────────────────────────

export const BlacklistCNController = {
    search: async (req: Request, res: Response) => {
        const dataItem = getRequestDataItem(req)

        try {
            const result = await BlacklistCNModel.search(dataItem)
            return res.status(200).json({
                Status: true,
                ResultOnDb: result,
                TotalCountOnDb: result.length,
                MethodOnDb: 'Search Blacklist CN',
                Message: 'Success',
            } as ResponseI)
        } catch (error: any) {
            console.error('Search Blacklist CN Error:', error)
            return res.status(200).json({
                Status: false,
                ResultOnDb: [],
                TotalCountOnDb: 0,
                MethodOnDb: 'Search Blacklist CN',
                Message: error?.message || 'Failed to search CN blacklist',
            } as ResponseI)
        }
    },

    importFile: async (req: Request, res: Response) => {
        const dataItem = getRequestDataItem(req)

        try {
            const result = await BlacklistCNModel.importFile({
                ...dataItem,
                file: req.file,
            })

            return res.status(200).json({
                Status: result?.Status ?? false,
                ResultOnDb: result?.ResultOnDb ?? {},
                TotalCountOnDb: result?.TotalCountOnDb ?? 0,
                MethodOnDb: result?.MethodOnDb || 'Import Blacklist CN',
                Message: result?.Message || 'Success',
            } as ResponseI)
        } catch (error: any) {
            console.error('Import Blacklist CN Error:', error)
            return res.status(200).json({
                Status: false,
                ResultOnDb: {},
                TotalCountOnDb: 0,
                MethodOnDb: 'Import Blacklist CN',
                Message: error?.message || 'Failed to import CN blacklist',
            } as ResponseI)
        }
    },
}
