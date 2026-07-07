export const RequestVendorContactSqlSnippets = {
  firstActiveVendorContactIdExpr: (vendorAlias = 'v') => `(
                                           SELECT vc_any.VENDOR_CONTACTS_ID
                                           FROM vendor_contacts vc_any
                                           WHERE vc_any.VENDORS_ID = ${vendorAlias}.VENDORS_ID
                                             AND vc_any.INUSE = 1
                                           ORDER BY CASE WHEN COALESCE(vc_any.EMAIL, '') != '' THEN 0 ELSE 1 END,
                                                    vc_any.VENDOR_CONTACTS_ID ASC
                                           LIMIT 1
                                       )`,
  primaryVendorContactIdExpr: (requestAlias = 'rr') => `(
                                           SELECT rrvc.VENDOR_CONTACTS_ID
                                           FROM request_register_vendor_contacts rrvc
                                           WHERE rrvc.REQUEST_REGISTER_VENDOR_ID = ${requestAlias}.REQUEST_REGISTER_VENDOR_ID
                                             AND rrvc.INUSE = 1
                                           ORDER BY rrvc.IS_PRIMARY DESC, rrvc.REQUEST_REGISTER_VENDOR_CONTACTS_ID ASC
                                           LIMIT 1
                                       )`,
}
