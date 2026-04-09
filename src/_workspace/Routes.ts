// Express Imports
import { Router } from 'express'

// Routes Imports
// ? SctRoutes
import AccountDepartmentCodeRoutes from './routes/account/AccountDepartmentCodeRoutes'
import BoiNameForMaterialConsumableRoutes from './routes/boi/boi-name-for-material-consumable/BoiNameForMaterialConsumableRoutes'
import BoiProjectRoutes from './routes/boi/boi-project/BoiProjectRoutes'
import boiUnitRoutes from './routes/boi/boi-unit/BoiUnitRoutes'
import BomFlowProcessItemUsageRoutes from './routes/bom/BomFlowProcessItemUsageRoutes'
import bomRoutes from './routes/bom/BomRoutes'
import ClearTimeRoutes from './routes/clear-time/ClearTimeRoutes'
import currencyRoutes from './routes/cost-condition/CurrencyRoutes'
import directCostConditionRoutes from './routes/cost-condition/DirectCostConditionRoutes'
import exchangeRateRoutes from './routes/cost-condition/ExchangeRateRoutes'
import importFeeRoutes from './routes/cost-condition/ImportFeeRoutes'
import indirectCostConditionRoutes from './routes/cost-condition/IndirectCostConditionRoutes'
import otherCostConditionRoutes from './routes/cost-condition/OtherCostConditionRoutes'
import specialCostConditionRoutes from './routes/cost-condition/SpecialCostConditionRoutes'
import customerInvoiceToRoutes from './routes/customer/customer-invoice-to/CustomerInvoiceToRoutes'
import customerOrderFromRoutes from './routes/customer/customer-order-from/CustomerOrderFromRoutes'
import customerShipToRoutes from './routes/customer/customer-ship-to/CustomerShipToRoutes'
import materialListRoutes from './routes/environment-certificate/materialListRoutes'
import flowProcessRoutes from './routes/flow-type/FlowProcessRoutes'
import flowTypeRoutes from './routes/flow-type/FlowTypeRoutes'
import flowRoutes from './routes/flow/flowRoute'
import itemCategoryRoutes from './routes/item-category/ItemCategoryRoutes'
import itemGroupRoutes from './routes/item-group/ItemGroupRoutes'
import colorRoutes from './routes/item-master/item-property/color/ColorRoutes'
import shapeRoutes from './routes/item-master/item-property/shape/ShapeRoutes'
import itemRoutes from './routes/item-master/item/ItemRoutes'
import makerRoutes from './routes/item-master/maker/MakerRoutes'
import vendorRoutes from './routes/item-master/vendor/VendorRoutes'
import itemPurposeRoutes from './routes/item-purpose/ItemPurposeRoutes'
import standardPriceRoutes from './routes/manufacturing-item/StandardPriceRoutes'
import processRoutes from './routes/process/processNew/ProcessRoutes'
import ProcessRoutes from './routes/process/ProcessRoutes'
import productionPurposeRoutes from './routes/production-control/ProductionPurposeRoutes'
import purchaseModuleRoutes from './routes/purchase-module/PurchaseModuleRoutes'
import ProductSpecificationTypeRoutes from './routes/specification-setting/ProductSpecificationTypeRoutes'
import SpecificationSettingRoutes from './routes/specification-setting/SpecificationSettingRoutes'
import UnitOfMeasurementRoutes from './routes/unit/unit-of-measurement/UnitOfMeasurementRoutes'
import YieldRateMaterialRoutes from './routes/yield-rate-material/YieldRateMaterialRoutes'
import yieldRateRoutes from './routes/yield-rate/YieldRateRoutes'

import commonRoutes from './routes/Common/CommonRoute'
import flowProductTypeRoutes from './routes/flow-product-type/FlowProductTypeRoute'
import manufacturingItemGroupRoutes from './routes/manufacturing-item/ManufacturingItemGroupRoutes'
import manufacturingItemPriceRoutes from './routes/pc-admin/ManufacturingItemGroupRoutes'
import orderTypeRoutes from './routes/production-control/OrderTypeRoutes'
import themeColorRoutes from './routes/theme-color/ThemeColorRoutes'
import LocRoutes from './routes/loc/LocRoutes'
import YieldRateGoStraightRateProcessForSctRoutes from './routes/yield-rate/YieldRateGoStraightRateProcessForSctRoutes'
import YieldRateGoStraightRateTotalForSctRoutes from './routes/yield-rate/YieldRateGoStraightRateTotalForSctRoutes'
import addVendorRoutes from './routes/_add-vendor/AddVendorRoutes'
import findVendorRoutes from './routes/_find-vendor/FindVendorRoute'
import registerRequestRoutes from './routes/_request-registrer/RegisterRequestRoute'
import assigneesRoutes from './routes/_task-manager/AssigneesRoutes'

const Routers = Router()

// ? Master Data System Routes
Routers.use('/process', ProcessRoutes)
Routers.use('/bom/bom-flow-process-item-usage', BomFlowProcessItemUsageRoutes)
Routers.use('/account-control/account-department-code-setting', AccountDepartmentCodeRoutes)
Routers.use('/boi-control/boi-category/boi-name-for-material-and-consumable', BoiNameForMaterialConsumableRoutes)
Routers.use('/boi-control/boi-project', BoiProjectRoutes)
Routers.use('/boi-control/boi-unit', boiUnitRoutes)
Routers.use('/product-specification-setting/product-specification-type', ProductSpecificationTypeRoutes)
Routers.use('/product-specification-setting/product-specification-document-setting', SpecificationSettingRoutes)
Routers.use('/item-master/item-category', itemCategoryRoutes)
Routers.use('/item-master/vendor', vendorRoutes)
Routers.use('/item-master/maker', makerRoutes)
Routers.use('/item-manufacturing/item-property/color/', colorRoutes)
Routers.use('/item-manufacturing/item-property/shape', shapeRoutes)
Routers.use('/item-manufacturing/item-manufacturing', itemRoutes)
Routers.use('/item-manufacturing/item', itemRoutes)
Routers.use('/item', itemRoutes)

Routers.use('/item-manufacturing/item-manufacturing-price/', standardPriceRoutes)
Routers.use('/item-purpose', itemPurposeRoutes)
Routers.use('/item-group', itemGroupRoutes)
Routers.use('/flow', flowRoutes)

Routers.use('/flow/flow-type', flowTypeRoutes)
Routers.use('/flow/flow-process', flowProcessRoutes)
Routers.use('/flow/flow-product-type', flowProductTypeRoutes)
Routers.use('/bom', bomRoutes)
Routers.use('/customer/customer-invoice-to', customerInvoiceToRoutes)
Routers.use('/customer/customer-order-from', customerOrderFromRoutes)
Routers.use('/customer/customer-ship-to', customerShipToRoutes)
Routers.use('/unit/unit-of-measurement', UnitOfMeasurementRoutes)
Routers.use('/yield-rate', yieldRateRoutes)
Routers.use('/process', processRoutes)
Routers.use('/cost-condition/currency', currencyRoutes)
Routers.use('/cost-condition/exchange-rate', exchangeRateRoutes)
Routers.use('/cost-condition/direct-cost-condition', directCostConditionRoutes)
Routers.use('/cost-condition/indirect-cost-condition', indirectCostConditionRoutes)
Routers.use('/cost-condition/other-cost-condition', otherCostConditionRoutes)
Routers.use('/cost-condition/special-cost-condition', specialCostConditionRoutes)
Routers.use('/cost-condition/import-fee-rate', importFeeRoutes)
Routers.use('/environment-certificate/material-list', materialListRoutes)
Routers.use('/production-control/production-purpose', productionPurposeRoutes)
Routers.use('/purchase-module', purchaseModuleRoutes)
Routers.use('/production-control/order-type', orderTypeRoutes)
Routers.use('/manufacturing-item/manufacturing-item-group', manufacturingItemGroupRoutes)
// Routers.use('/pc-admin/manufacturing-item-price', manufacturingItemPriceRoutes)
Routers.use('/theme-color', themeColorRoutes)
Routers.use('/common', commonRoutes)


Routers.use('/yield-rate-material', YieldRateMaterialRoutes)

Routers.use('/loc', LocRoutes)

Routers.use('/yield-rate-go-straight-rate-process-for-sct', YieldRateGoStraightRateProcessForSctRoutes)
Routers.use('/yield-rate-go-straight-rate-total-for-sct', YieldRateGoStraightRateTotalForSctRoutes)
// Routers.use('/yield-accumulation-of-item-for-sct', YieldAccumulationOfItemForSctRoutes)


// ? Add Vendor Routes
Routers.use('/add-vendor', addVendorRoutes)

// ? Find Vendor Routes
Routers.use('/find-vendor', findVendorRoutes)

// ? Register Request Routes
Routers.use('/register-request', registerRequestRoutes)

// ? Assignees Configuration Routes
Routers.use('/assignees', assigneesRoutes)

export default Routers
