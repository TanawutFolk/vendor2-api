import { UnitOfMeasurementService } from '@src/_workspace/services/unit/unit-of-measurement/UnitOfMeasurementService'

export const UnitOfMeasurementModel = {
  getUnit: async (dataItem: any) => UnitOfMeasurementService.getUnit(dataItem),

  searchUnit: async (dataItem: any) => UnitOfMeasurementService.searchUnit(dataItem),

  createUnit: async (dataItem: any) => UnitOfMeasurementService.createUnit(dataItem),

  updateUnit: async (dataItem: any) => UnitOfMeasurementService.updateUnit(dataItem),

  deleteUnit: async (dataItem: any) => UnitOfMeasurementService.deleteUnit(dataItem),

  getByLikeUnitOfMeasurementName: async (dataItem: any) => UnitOfMeasurementService.getByLikeUnitOfMeasurementName(dataItem),

  getByLikeSymbol: async (dataItem: any) => UnitOfMeasurementService.getByLikeSymbol(dataItem),
}
