import { describe, expect, test } from 'bun:test'
import { buildPoMgrReturnTestMailRoute, PO_MGR_RETURN_TEST_EMP_CODE } from './PoMgrReturnNotificationRoute'

describe('PO Mgr Return test mail route', () => {
  test('routes both Document Checker TO and PO PIC CC only to S00823', () => {
    const route = buildPoMgrReturnTestMailRoute('S00823.TEST@furukawaelectric.com')

    expect(PO_MGR_RETURN_TEST_EMP_CODE).toBe('S00823')
    expect(route).toEqual({
      toEmpCode: 'S00823',
      toEmail: 's00823.test@furukawaelectric.com',
      ccEmpCodes: ['S00823'],
      ccEmails: ['s00823.test@furukawaelectric.com'],
    })
  })

  test('does not create a fallback recipient when S00823 has no email', () => {
    expect(buildPoMgrReturnTestMailRoute('')).toEqual({
      toEmpCode: 'S00823',
      toEmail: '',
      ccEmpCodes: ['S00823'],
      ccEmails: [],
    })
  })
})
