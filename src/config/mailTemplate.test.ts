import { describe, expect, test } from 'bun:test'
import {
  emailActionRequiredTemplate,
  emailCompleteTemplate,
  emailExternalSubmitGPRBTemplate,
  emailGprCRequesterSetupTemplate,
  emailGprCStepApprovalTemplate,
  emailIncompleteTemplate,
  emailReject1Template,
  emailReject2Template,
  emailRequestRegisterVendorTemplate,
  emailToAccountPICTemplate,
  emailToCheckerPICTemplate,
  emailToMDTemplate,
  emailToPMGMTemplate,
  emailToPMMgrTemplate,
  emailUserCheckerApproverGPRCTemplate,
  emailVendorDocumentRequestTemplate,
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
  emailRequestRegisterVendorTemplate,
  emailVendorDocumentRequestTemplate,
  emailExternalSubmitGPRBTemplate,
  emailGprCRequesterSetupTemplate,
  emailUserCheckerApproverGPRCTemplate,
  emailGprCStepApprovalTemplate,
  emailReject1Template,
  emailToCheckerPICTemplate,
  emailReject2Template,
  emailToPMMgrTemplate,
  emailToPMGMTemplate,
  emailToMDTemplate,
  emailToAccountPICTemplate,
  emailCompleteTemplate,
  emailIncompleteTemplate,
  emailActionRequiredTemplate,
]

describe('mail templates', () => {
  test.each(templates)('uses the shared vendor registration layout', (template) => {
    const html = template(sample)

    expect(html).toContain('Vendor Registration Request')
    expect(html).toContain('linear-gradient(to bottom, #F02016 0%, #F02016 40%, #ffffff 40%, #ffffff 100%)')
    expect(html).toContain('padding: 28px 12px 40px 12px')
    expect(html).toContain('background: #ededed')
    expect(html).toContain('border-left: 4px solid #111111')
    expect(html).toContain('Furukawa')
    expect(html).toContain('FITEL')
    expect(html).not.toContain('undefined')
    expect(html).not.toContain('à¸')
  })
})
