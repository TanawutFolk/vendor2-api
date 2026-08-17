import { describe, expect, test } from 'bun:test'
import { buildPoMgrRecheckTestMailRoute, PO_MGR_RECHECK_TEST_EMP_CODE } from './PoMgrRecheckNotificationRoute'

describe('PO Mgr Re-check test mail route', () => {
  test('routes PO PIC TO and the test CC only to S00823', () => {
    const route = buildPoMgrRecheckTestMailRoute('S00823.TEST@furukawaelectric.com')

    expect(PO_MGR_RECHECK_TEST_EMP_CODE).toBe('S00823')
    expect(route).toEqual({
      toEmpCode: 'S00823',
      toEmail: 's00823.test@furukawaelectric.com',
      ccEmpCodes: ['S00823'],
      ccEmails: ['s00823.test@furukawaelectric.com'],
    })
  })

  test('does not create a fallback recipient when S00823 has no email', () => {
    expect(buildPoMgrRecheckTestMailRoute('')).toEqual({
      toEmpCode: 'S00823',
      toEmail: '',
      ccEmpCodes: ['S00823'],
      ccEmails: [],
    })
  })
})
