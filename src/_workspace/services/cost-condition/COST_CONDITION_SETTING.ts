const LIST_COST_CONDITION_SETTING: Array<{
  PRODUCT_MAIN_ID: number
  ITEM_CATEGORY_ID: number
  VALUE: number[]
}> = [
  // NOTE: The following CPO-ELS mappings are intentionally commented out per request.
  // { PRODUCT_MAIN_ID: 48, ITEM_CATEGORY_ID: 3, VALUE: [1,1,0,0,0,0,0,0,0,0,0,0] }, // CPO-ELS -> ELS(48) (COMMENTED)
  // { PRODUCT_MAIN_ID: 48, ITEM_CATEGORY_ID: 2, VALUE: [1,1,1,1,1,1,0,0,0,0,0,0] }, // CPO-ELS -> ELS(48) (COMMENTED)
  // { PRODUCT_MAIN_ID: 48, ITEM_CATEGORY_ID: 1, VALUE: [1,1,1,1,1,1,1,1,1,0,0,1] }, // CPO-ELS -> ELS(48) (COMMENTED)

  { PRODUCT_MAIN_ID: 26, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Sensor-DFB (26)
  { PRODUCT_MAIN_ID: 26, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 26, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  // NOTE: The following FBT-ITLA mappings are intentionally commented out per request.
  // { PRODUCT_MAIN_ID: 35, ITEM_CATEGORY_ID: 3, VALUE: [1,1,0,0,0,0,0,0,0,0,0,0] }, // FBT-ITLA -> mapped to TFB(35) (COMMENTED)
  // { PRODUCT_MAIN_ID: 35, ITEM_CATEGORY_ID: 2, VALUE: [1,1,1,1,1,1,0,0,0,0,0,0] },
  // { PRODUCT_MAIN_ID: 35, ITEM_CATEGORY_ID: 1, VALUE: [1,1,1,1,1,1,1,1,1,0,0,1] },

  { PRODUCT_MAIN_ID: 1, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // uITLA (1)
  { PRODUCT_MAIN_ID: 1, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 1, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 2, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // uTOSA (2)
  { PRODUCT_MAIN_ID: 2, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 2, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 22, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // JU-uTOSA (22)
  { PRODUCT_MAIN_ID: 22, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 22, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 21, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // JU-uITLA (21)
  { PRODUCT_MAIN_ID: 21, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 21, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 23, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Nano-ITLA (23)
  { PRODUCT_MAIN_ID: 23, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 23, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 24, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Nano-TOSA (24)
  { PRODUCT_MAIN_ID: 24, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 24, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 25, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // PLC-Wavelength-Locker (25)
  { PRODUCT_MAIN_ID: 25, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 25, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 20, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // iPump (20)
  { PRODUCT_MAIN_ID: 20, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 20, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 17, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // DFB (17)
  { PRODUCT_MAIN_ID: 17, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 17, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 18, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // HBCDM (18)
  { PRODUCT_MAIN_ID: 18, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 18, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 19, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Adhesive (19)
  { PRODUCT_MAIN_ID: 19, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  //{ PRODUCT_MAIN_ID: 19, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },
  { PRODUCT_MAIN_ID: 19, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] }, // Last Update : 2025-Dec-09 -> Change indirect Cost

  { PRODUCT_MAIN_ID: 16, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // 980nm_LDM (16)
  { PRODUCT_MAIN_ID: 16, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 16, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 10, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // 980MM (10)
  { PRODUCT_MAIN_ID: 10, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 10, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 15, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // 1480nm_LDM (15)
  { PRODUCT_MAIN_ID: 15, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 15, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 29, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] }, // T-PIG (29)
  { PRODUCT_MAIN_ID: 29, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 29, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 28, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Stabilizer (28)
  { PRODUCT_MAIN_ID: 28, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 28, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 27, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // FBG-for-Fiber-Laser (27)
  { PRODUCT_MAIN_ID: 27, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 27, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 49, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Fiber-Holder (49)
  { PRODUCT_MAIN_ID: 49, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 49, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 13, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Thermal-Stripper (13)
  { PRODUCT_MAIN_ID: 13, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 13, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 12, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Reinforced-Sleeve (12)
  { PRODUCT_MAIN_ID: 12, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0] },
  { PRODUCT_MAIN_ID: 12, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1] },

  { PRODUCT_MAIN_ID: 7, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Fusion-Splicer (7)
  { PRODUCT_MAIN_ID: 7, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 7, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 11, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // IDH (11)
  { PRODUCT_MAIN_ID: 11, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 11, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 42, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Optical-Rosette (42)
  { PRODUCT_MAIN_ID: 42, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 42, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 44, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Splitter-Module (44)
  { PRODUCT_MAIN_ID: 44, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 44, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 43, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Small8Bunki (43)
  { PRODUCT_MAIN_ID: 43, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 43, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 41, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Multi-Closure (41)
  { PRODUCT_MAIN_ID: 41, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 41, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 40, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Master-Fiber (40)
  { PRODUCT_MAIN_ID: 40, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 40, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 39, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Lensed-Fiber (39)
  { PRODUCT_MAIN_ID: 39, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 39, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 38, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // IDM-J (38)
  { PRODUCT_MAIN_ID: 38, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 38, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 37, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // IDM-Cable (37)
  { PRODUCT_MAIN_ID: 37, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 37, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 36, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // IDM-C (36)
  { PRODUCT_MAIN_ID: 36, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 36, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 4, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // FA&Kantan&EZ-Connector (4)
  { PRODUCT_MAIN_ID: 4, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 4, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 14, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Henkan&PF (14)
  { PRODUCT_MAIN_ID: 14, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 14, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 9, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Gaihihaji (9)
  { PRODUCT_MAIN_ID: 9, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 9, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 5, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // FTM (5)
  { PRODUCT_MAIN_ID: 5, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 5, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  // --------------------------- New Data 2024-Dec-12 ---------------------------
  { PRODUCT_MAIN_ID: 47, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Module-Product (47)
  { PRODUCT_MAIN_ID: 47, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 47, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 45, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Silicone-Adhesive (45)
  { PRODUCT_MAIN_ID: 45, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 45, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1] },

  { PRODUCT_MAIN_ID: 35, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // TFB (35)
  { PRODUCT_MAIN_ID: 35, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 35, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 34, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Standard-Fiber-Laser (34)
  { PRODUCT_MAIN_ID: 34, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 34, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 33, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Ribbon-Cable (33)
  { PRODUCT_MAIN_ID: 33, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 33, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 32, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Mode-Stripper (32)
  { PRODUCT_MAIN_ID: 32, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 32, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 31, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Fiber-Laser-Engine (31)
  { PRODUCT_MAIN_ID: 31, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 31, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 30, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Cavity (30)
  { PRODUCT_MAIN_ID: 30, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 30, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 3, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // Beam-Combiner (3)
  { PRODUCT_MAIN_ID: 3, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 3, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 48, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // ELS (48)
  { PRODUCT_MAIN_ID: 48, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 48, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  // Add new 2025-Aug-26 (PR-NANO-ITLA , PR-NANO-TOSA)
  { PRODUCT_MAIN_ID: 51, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // PR-NANO-ITLA (51)
  { PRODUCT_MAIN_ID: 51, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 51, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] },

  { PRODUCT_MAIN_ID: 52, ITEM_CATEGORY_ID: 3, VALUE: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // PR-NANO-TOSA (52)
  { PRODUCT_MAIN_ID: 52, ITEM_CATEGORY_ID: 2, VALUE: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
  { PRODUCT_MAIN_ID: 52, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1] },

  // Add new 2025-Sep-22 (DFB Chip)
  // *** Sub-Assy , 2 => No data from PC section
  { PRODUCT_MAIN_ID: 53, ITEM_CATEGORY_ID: 1, VALUE: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1] }, // DFB-Chip (53)
]

export default LIST_COST_CONDITION_SETTING
