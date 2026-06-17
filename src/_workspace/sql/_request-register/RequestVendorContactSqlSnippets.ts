export const primaryVendorContactIdExpr = (requestAlias = 'rr') => `(
                                           SELECT rrvc.VENDOR_CONTACT_ID
                                           FROM request_register_vendor_contacts rrvc
                                           WHERE rrvc.REQUEST_ID = ${requestAlias}.REQUEST_ID
                                             AND rrvc.INUSE = 1
                                           ORDER BY rrvc.IS_PRIMARY DESC, rrvc.REQUEST_CONTACT_ID ASC
                                           LIMIT 1
                                       )`
