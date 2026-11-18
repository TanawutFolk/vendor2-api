import { describe, expect, test } from 'bun:test'
import {
  email_ToUser_ActionRequired,
  email_ToUser_ActionResult,
  email_ToRequester_RegistrationCompleted,
  email_ToSupplier_RequestFormB,
  email_ToRequester_GprCSetup,
  email_ToGprCApprover_NextStep,
  email_ToRequester_RegistrationIncomplete,
  email_ToPic_RejectedByApprover,
  email_ToPic_RecheckByApprover,
  email_ToPic_RecheckByGprCApprover,
  email_ToPic_RequestRegisterVendor,
  email_ToAccount_RegisterRequired,
  email_ToChecker_CheckRequired,
  email_ToMd_ApproveRequired,
  email_ToPoGm_ApproveRequired,
  email_ToPoManager_ApproveRequired,
  email_ToGprCApprover_FirstStep,
  email_ToSupplier_RequestFormA,
  type MailTemplateData,
} from './mailTemplate'

const sample: MailTemplateData = {
  topicRef: 'Selection-26-N002',
  requestNumber: 'Selection-26-N002',
  recipientName: 'Test Recipient',
  userName: 'Test Requester',
  userTel: '1234',
  picName: 'Test PIC',
  picTel: '5678',
  picNextStepName: 'Next Approver',
  vendorName: 'Example Supplier Co., Ltd.',
  address: 'Ayutthaya, Thailand',
  contactPic: 'Vendor Contact',
  email: 'vendor@example.com',
  tel: '02-000-0000',
  supportProduct: 'Electronic components',
  purchaseFrequency: '12 times / year',
  systemLink: 'http://localhost:5173/request-history',
  vendorCode: 'V00001',
  remarkEN: 'Please correct the document.',
  remarkTH: 'กรุณาแก้ไขเอกสาร',
  reasons: ['Missing bank document'],
  stageLabel: 'QMS Approval',
  note: 'Please review the attached document.',
  isNewSupplier: true,
}

const internalTemplates = [
  email_ToPic_RequestRegisterVendor,
  email_ToRequester_GprCSetup,
  email_ToGprCApprover_FirstStep,
  email_ToGprCApprover_NextStep,
  email_ToPic_RejectedByApprover,
  email_ToChecker_CheckRequired,
  email_ToPic_RecheckByApprover,
  email_ToPic_RecheckByGprCApprover,
  email_ToPoManager_ApproveRequired,
  email_ToPoGm_ApproveRequired,
  email_ToMd_ApproveRequired,
  email_ToAccount_RegisterRequired,
  email_ToRequester_RegistrationCompleted,
  email_ToRequester_RegistrationIncomplete,
  email_ToUser_ActionRequired,
  email_ToUser_ActionResult,
]

const supplierTemplates = [email_ToSupplier_RequestFormA, email_ToSupplier_RequestFormB]

const templates = [...internalTemplates, ...supplierTemplates]

// Black / greys, the company blue and the FITEL red. Nothing else may appear.
const ALLOWED_COLORS = new Set(['#111111', '#5C5C5C', '#8C8C8C', '#DDDDDD', '#F2F2F2', '#F6F6F6', '#FFFFFF', '#0057B8', '#EF1239'])

describe('mail templates', () => {
  test.each(templates)('uses the shared vendor registration layout', (template) => {
    const html = template(sample)

    expect(html).toContain('Vendor Registration System')
    expect(html).toContain('max-width: 640px')
    expect(html).toContain('Selection-26-N002')
    expect(html).toContain('ENGLISH')
    expect(html).toContain('ภาษาไทย')
    expect(html).toContain('Furukawa')
    expect(html).toContain('FITEL')
    expect(html).not.toContain('undefined')
    expect(html).not.toContain('à¸')
  })

  test.each(templates)('keeps the palette to black, greys and the company colours', (template) => {
    const colors = template(sample).match(/#[0-9a-f]{6}\b/gi) || []
    const unexpected = [...new Set(colors.map((color) => color.toUpperCase()))].filter((color) => !ALLOWED_COLORS.has(color))

    expect(unexpected).toEqual([])
  })

  test.each(internalTemplates)('signs internal mails with the sender extension', (template) => {
    const html = template(sample)

    expect(html).toMatch(/\(Ext\. (1234|5678)\)/)
    expect(html).not.toContain('#Tel')
  })

  test.each(supplierTemplates)('never shows the internal extension to suppliers', (template) => {
    const html = template(sample)

    expect(html).not.toContain('Ext.')
    expect(html).not.toContain('#Tel')
    expect(html).not.toContain('5678')
    expect(html).toContain('Test PIC')
  })

  test('renders PO PIC signature with a real name and role', () => {
    const html = email_ToChecker_CheckRequired({ ...sample, picName: 'TANAWUT PATRAWAN', picTel: '' })

    expect(html).toContain('Best regards &middot; ขอแสดงความนับถือ')
    expect(html).toContain('<div style="font-weight: 700;">TANAWUT PATRAWAN</div>')
    expect(html).toContain('PO &amp; SCM PIC')
  })

  test('renders the extension after the signer name', () => {
    const html = email_ToChecker_CheckRequired({ ...sample, picName: 'TANAWUT PATRAWAN', picTel: '5678' })

    expect(html).toContain('TANAWUT PATRAWAN <span style="font-weight: 400; color: #5C5C5C;">(Ext. 5678)</span>')
  })

  test('renders the approver re-check remark for PO PIC', () => {
    const html = email_ToPic_RecheckByApprover(sample)

    expect(html).toContain('Recheck required')
    expect(html).toContain('Reason from approver')
    expect(html).toContain('Please correct the document.')
    expect(html).toContain('กรุณาแก้ไขเอกสาร')
  })

  test('renders the GPR C approver re-check remark for PO PIC', () => {
    const html = email_ToPic_RecheckByGprCApprover({
      ...sample,
      stageLabel: 'QMS Approver',
    })

    expect(html).toContain('GPR C recheck requested')
    expect(html).toContain('QMS Approver remark')
    expect(html).toContain('Please correct the document.')
  })

  test('shows the vendor code on the completed mail', () => {
    const html = email_ToRequester_RegistrationCompleted(sample)

    expect(html).toContain('Vendor Code / รหัสผู้ขาย')
    expect(html).toContain('V00001')
  })

  test('does not render empcode or email values as signature names', () => {
    const empcodeHtml = email_ToChecker_CheckRequired({ ...sample, picName: 'S00823', picTel: '' })
    const emailHtml = email_ToChecker_CheckRequired({ ...sample, picName: 'Tanawut.pf@gmail.com', picTel: '' })

    expect(empcodeHtml).not.toContain('<div style="font-weight: 700;">S00823</div>')
    expect(emailHtml).not.toContain('<div style="font-weight: 700;">Tanawut.pf@gmail.com</div>')
    expect(empcodeHtml).toContain('<div style="font-weight: 700;">Vendor Registration System</div>')
    expect(emailHtml).toContain('<div style="font-weight: 700;">Vendor Registration System</div>')
  })

  test('renders the company address in the fixed footer format', () => {
    const html = email_ToChecker_CheckRequired(sample)

    expect(html).toContain('display: inline-block; border-top: 1px solid #8c8c8c; padding-top: 7px; font-weight: 700; color: #0057b8;')
    expect(html).toContain('Furukawa <span style="color: #ef1239;">FITEL</span> (Thailand) Co., Ltd.')
    expect(html).toContain('<div>1/71 Moo 5, Rojana Industrial Park, Rojana Road, Kanharm</div>')
    expect(html).toContain('<div>U-Thai, Phranakorn Sri Ayutthaya 13210, Thailand</div>')
    expect(html).not.toContain('1/1 Moo 6, Tambol Khanham')
  })

  test('does not render a bottom border below the final detail row', () => {
    const html = email_ToChecker_CheckRequired(sample)
    const purchaseFrequencyLabel = html.indexOf('Purchase frequency per year')
    const finalEnglishRow = html.slice(html.lastIndexOf('<tr>', purchaseFrequencyLabel), html.indexOf('</tr>', purchaseFrequencyLabel))

    expect(purchaseFrequencyLabel).toBeGreaterThan(-1)
    expect(finalEnglishRow).not.toContain('border-bottom')
  })

  test('escapes user-supplied values', () => {
    const html = email_ToPic_RecheckByApprover({ ...sample, remarkEN: '<script>alert(1)</script>' })

    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
