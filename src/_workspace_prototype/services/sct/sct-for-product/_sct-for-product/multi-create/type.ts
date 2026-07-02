export type MultipleSctDataResponse = {
  IS_DRAFT: boolean

  SCT_F_CREATE_TYPE_ID: number
  SCT_F_CREATE_TYPE_ALPHABET: string

  SCT_FORMULA_VERSION_ID: number

  FISCAL_YEAR: number
  SCT_PATTERN_ID: number
  SCT_PATTERN_NO: string

  ESTIMATE_PERIOD_START_DATE: string
  ESTIMATE_PERIOD_END_DATE: string

  SCT_REASON_SETTING_ID: number
  SCT_REASON_SETTING_NAME: string

  SCT_TAG_SETTING_ID: number | ''
  SCT_TAG_SETTING_NAME: string | ''

  NOTE: string
  CREATE_BY: string
  UPDATE_BY: string
  LIST_MULTIPLE_SCT_DATA: SCT_MultiCreateType[]
}

export type SCT_MultiCreateType = {
  SCT_CREATE_FROM_SETTING_ID: number
  BOM_ID: number

  // --- Create From
  CREATE_FROM_SCT_ID: string | ''
  CREATE_FROM_SCT_FISCAL_YEAR: number | ''
  CREATE_FROM_SCT_PATTERN_ID: number | ''
  CREATE_FROM_SCT_STATUS_PROGRESS_ID: number | ''

  PRODUCT_CATEGORY_ID: number
  PRODUCT_CATEGORY_NAME: string
  PRODUCT_CATEGORY_ALPHABET: string

  PRODUCT_MAIN_ID: number
  PRODUCT_MAIN_NAME: string
  PRODUCT_MAIN_ALPHABET: string

  PRODUCT_SUB_ID: number
  PRODUCT_SUB_NAME: string
  PRODUCT_SUB_ALPHABET: string

  PRODUCT_TYPE_ID: number
  PRODUCT_TYPE_NAME: string
  PRODUCT_TYPE_CODE: string

  PRODUCT_SPECIFICATION_TYPE_ID: number
  PRODUCT_SPECIFICATION_TYPE_ALPHABET: string
  PRODUCT_SPECIFICATION_TYPE_NAME: string

  // --- Nested components
  listSctComponentType: {
    SCT_COMPONENT_TYPE_ID: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    // 1	Direct Cost Condition
    // 2	Indirect Cost Condition
    // 3	Other Cost Condition
    // 4	Special Cost Condition
    // 5	Yield Rate & Go Straight Rate
    // 6	Clear Time
    // 7	Manufacturing Item Price
    // 8	Yield Rate Material
    SCT_RESOURCE_OPTION_ID: 1 | 4
    // 1	Master Data (Latest)
    // 4	SCT Selection
  }[]

  CREATE_BY: string
  UPDATE_BY: string
}
