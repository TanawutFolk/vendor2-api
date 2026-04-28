import { BlacklistUSService } from '@src/_workspace/services/_black-list/BlacklistUSService'
import { BlacklistCNService } from '@src/_workspace/services/_black-list/BlacklistCNService'

export const BlacklistModel = {
    search: async (dataItem: any) => BlacklistUSService.searchAgGrid(dataItem),
}

export const BlacklistUSModel = {
    search: async (dataItem: any) => BlacklistUSService.search(dataItem),
    importFile: async (dataItem: any) => BlacklistUSService.importFile(dataItem),
}

export const BlacklistCNModel = {
    search: async (dataItem: any) => BlacklistCNService.search(dataItem),
    importFile: async (dataItem: any) => BlacklistCNService.importFile(dataItem),
}
