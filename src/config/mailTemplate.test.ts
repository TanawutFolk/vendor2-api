import { describe, expect, test } from 'bun:test'
import {
  email_ToUser_ActionRequired,
  email_ToRequester_RegistrationCompleted,
  email_ToSupplier_RequestFormB,
  email_ToRequester_GprCSetup,
  email_ToGprCApprover_NextStep,
  email_ToRequester_RegistrationIncomplete,
  email_ToPic_RejectedByApprover,
  email_ToPic_RejectedByChecker,
  email_ToPic_RequestRegisterVendor,
  email_ToAccount_RegisterRequired,
  email_ToChecker_CheckRequired,
  email_ToChecker_ReturnedByPoMgr,
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

const templates = [
  email_ToPic_RequestRegisterVendor,
  email_ToSupplier_RequestFormA,
  email_ToSupplier_RequestFormB,
  email_ToRequester_GprCSetup,
  email_ToGprCApprover_FirstStep,
  email_ToGprCApprover_NextStep,
  email_ToPic_RejectedByApprover,
  email_ToChecker_CheckRequired,
  email_ToChecker_ReturnedByPoMgr,
  email_ToPic_RejectedByChecker,
  email_ToPoManager_ApproveRequired,
  email_ToPoGm_ApproveRequired,
  email_ToMd_ApproveRequired,
  email_ToAccount_RegisterRequired,
  email_ToRequester_RegistrationCompleted,
  email_ToRequester_RegistrationIncomplete,
  email_ToUser_ActionRequired,
]

describe('mail templates', () => {
  test.each(templates)('uses the shared vendor registration layout', (template) => {
    const html = template(sample)

    expect(html).toContain('Vendor Registration Request')
    expect(html).not.toContain('#F02016')
    expect(html).toContain('padding: 28px 12px 40px 12px')
    expect(html).toContain('background: #ededed')
    expect(html).toContain('border-left: 4px solid #111111')
    expect(html).toContain('Furukawa')
    expect(html).toContain('FITEL')
    expect(html).not.toContain('undefined')
    expect(html).not.toContain('à¸')
  })
  test('renders PO PIC signature with a real name and role', () => {
    const html = email_ToChecker_CheckRequired({ ...sample, picName: 'TANAWUT PATRAWAN', picTel: '' })

    expect(html).toContain('<div style="font-weight: 700;">Thank you &amp; Best regards,</div>')
    expect(html).toContain('<div style="font-weight: 700;">TANAWUT PATRAWAN</div>')
    expect(html).toContain('<div>PO &amp; SCM PIC</div>')
  })

  test('renders the PO Mgr return remark for Document Check', () => {
    const html = email_ToChecker_ReturnedByPoMgr(sample)

    expect(html).toContain('Returned by PO Mgr for document recheck')
    expect(html).toContain('Please correct the document.')
    expect(html).toContain('PO &amp; SCM Check All Document')
  })

  test('does not render empcode or email values as signature names', () => {
    const empcodeHtml = email_ToChecker_CheckRequired({ ...sample, picName: 'S00823', picTel: '' })
    const emailHtml = email_ToChecker_CheckRequired({ ...sample, picName: 'Tanawut.pf@gmail.com', picTel: '' })

    expect(empcodeHtml).not.toContain('<div style="font-weight: 700;">S00823</div>')
    expect(emailHtml).not.toContain('<div style="font-weight: 700;">Tanawut.pf@gmail.com</div>')
    expect(empcodeHtml).toContain('<div style="font-weight: 700;">Vendor Registration System</div>')
    expect(emailHtml).toContain('<div style="font-weight: 700;">Vendor Registration System</div>')
  })
})
