export const RequestVendorContactSqlSnippets = {
  primaryVendorContactIdExpr: (requestAlias = 'rr') => `(
                                           SELECT rrvc.VENDOR_CONTACTS_ID
                                           FROM request_register_vendor_contacts rrvc
                                           WHERE rrvc.REQUEST_REGISTER_VENDOR_ID = ${requestAlias}.REQUEST_REGISTER_VENDOR_ID
                                             AND rrvc.INUSE = 1
                                           ORDER BY rrvc.IS_PRIMARY DESC, rrvc.REQUEST_REGISTER_VENDOR_CONTACTS_ID ASC
                                           LIMIT 1
                                       )`,
}
