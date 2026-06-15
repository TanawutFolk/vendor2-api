export type MailTemplateData = {
  toEmail?: string
  ccEmail?: string
  ccEmailLine1?: string
  ccEmailLine2?: string
  vendorEmail?: string
  topicRef?: string
  isNewSupplier?: boolean
  requestNumber?: string
  recipientName?: string
  userName?: string
  userTel?: string
  picName?: string
  picTel?: string
  picNextStepName?: string
  vendorName?: string
  address?: string
  contactPic?: string
  email?: string
  tel?: string
  supportProduct?: string
  purchaseFrequency?: string
  systemLink?: string
  vendorCode?: string
  remarkEN?: string
  remarkTH?: string
  reasons?: string[]
  stageLabel?: string
  note?: string
}

type DetailRow = [label: string, value: unknown]

type MailLayoutOptions = {
  recipient: unknown
  content: string
  signerName?: unknown
  signerTel?: unknown
  signerRole?: string
}

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const text = (value: unknown, fallback = '-') => {
  const normalized = String(value ?? '').trim()
  return escapeHtml(normalized || fallback)
}

const renderStatus = (status: string, message: string, detail = '') => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; margin: 0 0 22px 0;">
    <tr>
      <td style="border-left: 4px solid #111111; background: #f7f7f7; padding: 12px 14px; color: #111111;">
        <div style="font-size: 13px; line-height: 1.45; font-weight: 700;">Status: ${status}</div>
        <div style="font-size: 13px; line-height: 1.55; margin-top: 3px;">${message}</div>
        ${detail ? `<div style="font-size: 12px; line-height: 1.55; margin-top: 7px; color: #991b1b;"><strong>${detail}</strong></div>` : ''}
      </td>
    </tr>
  </table>
`

const renderThaiStatus = (status: string, message: string, detail = '') => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; margin: 24px 0 18px 0;">
    <tr>
      <td style="border-left: 4px solid #111111; background: #f7f7f7; padding: 12px 14px; color: #111111;">
        <div style="font-size: 13px; line-height: 1.55; font-weight: 700;">สถานะ: ${status}</div>
        <div style="font-size: 13px; line-height: 1.65; margin-top: 3px;">${message}</div>
        ${detail ? `<div style="font-size: 12px; line-height: 1.65; margin-top: 7px; color: #991b1b;"><strong>${detail}</strong></div>` : ''}
      </td>
    </tr>
  </table>
`

const renderDetails = (rows: DetailRow[]) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; margin: 0 0 18px 0;">
    ${rows
      .map(
        ([label, value]) => `
          <tr>
            <td width="42%" valign="top" style="border-bottom: 1px solid #c9c9c9; padding: 7px 8px 7px 0; color: #555555; font-size: 12px; line-height: 1.45;">${escapeHtml(label)}</td>
            <td valign="top" style="border-bottom: 1px solid #c9c9c9; padding: 7px 0 7px 8px; color: #111111; font-size: 12px; line-height: 1.45;">${text(value)}</td>
          </tr>
        `
      )
      .join('')}
  </table>
`

const renderVendorDetails = (data: MailTemplateData, thai = false) =>
  renderDetails(
    thai
      ? [
          ['ชื่อเวนเดอร์', data.vendorName],
          ['ที่อยู่', data.address],
          ['ชื่อผู้ติดต่อ', data.contactPic],
          ['อีเมล', data.email],
          ['เบอร์ติดต่อ', data.tel],
          ['สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ', data.supportProduct],
          ['ความถี่ในการสั่งซื้อต่อปี', data.purchaseFrequency],
        ]
      : [
          ['Vendor Name', data.vendorName],
          ['Address', data.address],
          ['Contact Vendor', data.contactPic],
          ['Email', data.email],
          ['Tel', data.tel],
          ['For support product / process', data.supportProduct],
          ['Purchase Frequency / Year', data.purchaseFrequency],
        ]
  )

const renderLink = (systemLink?: string) => {
  const link = String(systemLink || '').trim()
  if (!link) return ''
  const escapedLink = escapeHtml(link)
  return `
    <p style="margin: 16px 0 22px 0; color: #333333; font-size: 12px; line-height: 1.55;">
      You can access the system through this link:
      <a href="${escapedLink}" style="color: #111111; text-decoration: underline; font-weight: 700;">${escapedLink}</a>
    </p>
  `
}

const renderSignature = (name: unknown, tel: unknown, role: string) => `
  <div style="border-top: 1px solid #c9c9c9; margin-top: 20px; padding-top: 13px; color: #111111; font-size: 12px; line-height: 1.55;">
    <div style="font-weight: 700;">Thank you &amp; Best regards,</div>
    <div style="font-weight: 700;">${text(name, 'Vendor Registration System')}${String(tel || '').trim() ? ` <span style="font-weight: 400;">(#Tel. ${text(tel)})</span>` : ''}</div>
    <div>${escapeHtml(role)}</div>
  </div>
`

const renderCompanyFooter = () => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
    <tr>
      <td style="padding: 30px 0 0 0; color: #111111; font-size: 10px; line-height: 1.45;">
        <div style="font-weight: 700; color: #0057b8;">Furukawa <span style="color: #ef1239;">FITEL</span> (Thailand) Co., Ltd.</div>
        <div>1/1 Moo 6, Tambol Khanham</div>
        <div>Amphur U-Thai, Phranakhon Sri Ayutthaya</div>
        <div>13210, Thailand</div>
      </td>
    </tr>
  </table>
`

const renderMailLayout = ({
  recipient,
  content,
  signerName,
  signerTel,
  signerRole = 'PO & SCM',
}: MailLayoutOptions) => `
  <!doctype html>
  <html>
    <body style="margin: 0; padding: 0; background-color: #ffffff; background-image: linear-gradient(to bottom, #F02016 0%, #F02016 40%, #ffffff 40%, #ffffff 100%); background-repeat: no-repeat;">
      <table role="presentation" width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="width: 100%; min-height: 100%; border-collapse: collapse; background-color: #ffffff; background-image: linear-gradient(to bottom, #F02016 0%, #F02016 40%, #ffffff 40%, #ffffff 100%); background-repeat: no-repeat;">
        <tr>
          <td align="center" valign="top" style="padding: 28px 12px 40px 12px; background-color: transparent;">
            <table role="presentation" width="680" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 680px; border-collapse: collapse; font-family: Arial, 'Segoe UI', Tahoma, sans-serif;">
              <tr>
                <td style="padding: 0 24px; background-color: transparent;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background: #ededed;">
                    <tr>
                      <td style="padding: 42px 52px 36px 52px;">
                        <div style="text-align: center; color: #000000; font-size: 22px; line-height: 1.25; font-weight: 700;">Vendor Registration Request</div>
                        <div style="height: 1px; background: #8c8c8c; margin: 20px 0 24px 0;"></div>
                        <p style="margin: 0 0 18px 0; color: #111111; font-size: 12px; line-height: 1.5;">
                          Dear&nbsp;&nbsp; <strong>${text(recipient, 'Recipient')}</strong>
                        </p>
                        ${content}
                        ${renderSignature(signerName, signerTel, signerRole)}
                      </td>
                    </tr>
                  </table>
                  ${renderCompanyFooter()}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`

const renderStandardWorkflowMail = (
  data: MailTemplateData,
  options: {
    recipient: unknown
    status: string
    message: string
    thaiStatus: string
    thaiMessage: string
    detail?: string
    thaiDetail?: string
    extraHtml?: string
    signerName?: unknown
    signerTel?: unknown
    signerRole?: string
  }
) =>
  renderMailLayout({
    recipient: options.recipient,
    signerName: options.signerName ?? data.picName,
    signerTel: options.signerTel ?? data.picTel,
    signerRole: options.signerRole,
    content: `
      ${renderStatus(options.status, options.message, options.detail)}
      ${renderVendorDetails(data)}
      ${options.extraHtml || ''}
      ${renderLink(data.systemLink)}
      ${renderThaiStatus(options.thaiStatus, options.thaiMessage, options.thaiDetail)}
      ${renderVendorDetails(data, true)}
    `,
  })

export const emailRequestRegisterVendorTemplate = (data: MailTemplateData) =>
  renderStandardWorkflowMail(data, {
    recipient: data.recipientName,
    status: 'Under request register vendor',
    message: `Please register vendor request <strong>"${text(data.requestNumber)}"</strong> in the system within 2 weeks.`,
    thaiStatus: 'อยู่ระหว่างการดำเนินการลงทะเบียนผู้ขาย',
    thaiMessage: `โปรดดำเนินการลงทะเบียนผู้ขายตามหมายเลข <strong>"${text(data.requestNumber)}"</strong> ในระบบภายใน 2 สัปดาห์`,
    signerName: data.userName,
    signerTel: data.userTel,
    signerRole: 'Requester',
  })

export const emailVendorDocumentRequestTemplate = (data: MailTemplateData) => {
  const requestNumber = data.topicRef || data.requestNumber
  const supplierType = data.isNewSupplier ? 'new supplier registration' : 'supplier re-registration'

  return renderMailLayout({
    recipient: 'Supplier',
    signerName: data.picName,
    signerTel: data.picTel,
    signerRole: 'PO & SCM PIC',
    content: `
      ${renderStatus(
        'Vendor documents required',
        `Please prepare the documents for <strong>${escapeHtml(supplierType)}</strong>, reference <strong>"${text(requestNumber)}"</strong>, and reply within 7 days.`
      )}
      <div style="font-size: 12px; line-height: 1.65; color: #222222;">
        <p style="margin: 0 0 10px 0;">Furukawa FITEL (Thailand) Co., Ltd. requires the following information and documents:</p>
        <ol style="margin: 0 0 18px 20px; padding: 0;">
          <li style="margin-bottom: 5px;">Company certificate and VAT license (Por Por 20)</li>
          <li style="margin-bottom: 5px;">Company profile</li>
          <li style="margin-bottom: 5px;">Other certifications, such as ISO9001, ISO14000, and product catalog</li>
          <li style="margin-bottom: 5px;">Copy of bank book</li>
          <li style="margin-bottom: 5px;">Completed MFG Survey in Excel format</li>
          <li>Completed Reply Form in PDF format</li>
        </ol>
      </div>
      ${renderThaiStatus(
        'ขอเอกสารสำหรับลงทะเบียนผู้ขาย',
        `กรุณาจัดเตรียมเอกสารสำหรับหมายเลขอ้างอิง <strong>"${text(requestNumber)}"</strong> และตอบกลับภายใน 7 วัน`
      )}
      <div style="font-size: 12px; line-height: 1.7; color: #222222;">
        <ol style="margin: 0 0 18px 20px; padding: 0;">
          <li style="margin-bottom: 5px;">หนังสือรับรองนิติบุคคลและ ภ.พ.20</li>
          <li style="margin-bottom: 5px;">Company profile</li>
          <li style="margin-bottom: 5px;">เอกสารรับรอง เช่น ISO9001, ISO14000 และแคตตาล็อกสินค้า</li>
          <li style="margin-bottom: 5px;">สำเนาหน้าสมุดบัญชีธนาคาร</li>
          <li style="margin-bottom: 5px;">แบบสำรวจ MFG ในรูปแบบ Excel</li>
          <li>Reply Form ในรูปแบบ PDF</li>
        </ol>
      </div>
    `,
  })
}

export const emailExternalSubmitGPRBTemplate = (data: MailTemplateData) =>
  renderMailLayout({
    recipient: 'Supplier',
    signerName: data.picName,
    signerTel: data.picTel,
    signerRole: 'PO & SCM PIC',
    content: `
      ${renderStatus(
        'General Purchase Specification Form B required',
        `The General Purchase Specification Form A was not accepted. Please complete Form B for request <strong>"${text(data.requestNumber)}"</strong> and reply within 7 days.`
      )}
      ${renderThaiStatus(
        'ต้องดำเนินการ General Purchase Specification Form B',
        `เนื่องจากไม่ยอมรับเงื่อนไขใน Form A กรุณากรอก Form B สำหรับคำขอหมายเลข <strong>"${text(data.requestNumber)}"</strong> และตอบกลับภายใน 7 วัน`
      )}
    `,
  })

export const emailGprCRequesterSetupTemplate = (data: MailTemplateData) =>
  renderStandardWorkflowMail(data, {
    recipient: data.userName || data.recipientName || 'Requester',
    status: 'GPR C setup required',
    message: `Please configure the GPR C Approver, PC PIC, and Circular List for request <strong>"${text(data.requestNumber)}"</strong>.`,
    thaiStatus: 'ต้องกำหนดผู้ดำเนินการ GPR C',
    thaiMessage: `กรุณากำหนด GPR C Approver, PC PIC และ Circular List สำหรับคำขอหมายเลข <strong>"${text(data.requestNumber)}"</strong>`,
  })

export const emailUserCheckerApproverGPRCTemplate = (data: MailTemplateData) =>
  renderStandardWorkflowMail(data, {
    recipient: data.userName || data.recipientName,
    status: 'GPR C approval required',
    message: `Please review and approve request <strong>"${text(data.requestNumber)}"</strong> for General Purchase Specification Form C.`,
    detail: 'Please review the attached Vendor Form B before approving this step.',
    thaiStatus: 'รอการตรวจสอบและอนุมัติ GPR C',
    thaiMessage: `กรุณาตรวจสอบและอนุมัติคำขอหมายเลข <strong>"${text(data.requestNumber)}"</strong> สำหรับ General Purchase Specification Form C`,
    thaiDetail: 'กรุณาตรวจสอบ Vendor Form B ที่แนบมาก่อนอนุมัติขั้นตอนนี้',
  })

export const emailGprCStepApprovalTemplate = (data: MailTemplateData) =>
  emailUserCheckerApproverGPRCTemplate({ ...data, userName: data.picNextStepName })

export const emailReject1Template = (data: MailTemplateData) =>
  renderStandardWorkflowMail(data, {
    recipient: data.recipientName || 'PO PIC',
    status: 'Rejected - General Purchase Specification Form B',
    message: `Please recheck vendor request <strong>"${text(data.requestNumber)}"</strong>.`,
    detail: `Reason: ${text(data.remarkEN)}`,
    thaiStatus: 'ปฏิเสธการตรวจสอบ General Purchase Specification Form B',
    thaiMessage: `กรุณาตรวจสอบคำขอหมายเลข <strong>"${text(data.requestNumber)}"</strong> อีกครั้ง`,
    thaiDetail: `สาเหตุ: ${text(data.remarkTH || data.remarkEN)}`,
  })

export const emailToCheckerPICTemplate = (data: MailTemplateData) =>
  renderStandardWorkflowMail(data, {
    recipient: data.recipientName || 'PO CHECKER',
    status: 'Under checking register vendor',
    message: `Please check vendor request <strong>"${text(data.requestNumber)}"</strong>.`,
    thaiStatus: 'อยู่ระหว่างการตรวจสอบการลงทะเบียนผู้ขาย',
    thaiMessage: `กรุณาตรวจสอบคำขอหมายเลข <strong>"${text(data.requestNumber)}"</strong>`,
  })

export const emailReject2Template = (data: MailTemplateData) =>
  renderStandardWorkflowMail(data, {
    recipient: data.recipientName || 'PO PIC',
    status: 'Vendor registration requires recheck',
    message: `Please recheck vendor request <strong>"${text(data.requestNumber)}"</strong>.`,
    detail: `Reason: ${text(data.remarkEN)}`,
    thaiStatus: 'ต้องตรวจสอบการลงทะเบียนผู้ขายอีกครั้ง',
    thaiMessage: `กรุณาตรวจสอบคำขอหมายเลข <strong>"${text(data.requestNumber)}"</strong> อีกครั้ง`,
    thaiDetail: `สาเหตุ: ${text(data.remarkTH || data.remarkEN)}`,
  })

export const emailToPMMgrTemplate = (data: MailTemplateData) =>
  renderStandardWorkflowMail(data, {
    recipient: data.recipientName || 'PO Mgr',
    status: 'Under approval register vendor',
    message: `Please approve vendor request <strong>"${text(data.requestNumber)}"</strong>.`,
    thaiStatus: 'อยู่ระหว่างการอนุมัติการลงทะเบียนผู้ขาย',
    thaiMessage: `กรุณาอนุมัติคำขอหมายเลข <strong>"${text(data.requestNumber)}"</strong>`,
  })

export const emailToPMGMTemplate = (data: MailTemplateData) =>
  emailToPMMgrTemplate({ ...data, recipientName: data.recipientName || 'PO GM' })

export const emailToMDTemplate = (data: MailTemplateData) =>
  emailToPMMgrTemplate({ ...data, recipientName: data.recipientName || 'MD' })

export const emailToAccountPICTemplate = (data: MailTemplateData) =>
  emailToPMMgrTemplate({ ...data, recipientName: data.recipientName || 'Account PIC' })

export const emailCompleteTemplate = (data: MailTemplateData) =>
  renderStandardWorkflowMail(data, {
    recipient: data.userName || data.recipientName,
    status: 'Vendor registration completed',
    message: `Vendor request <strong>"${text(data.requestNumber)}"</strong> has been completed.`,
    thaiStatus: 'การลงทะเบียนผู้ขายสำเร็จ',
    thaiMessage: `คำขอหมายเลข <strong>"${text(data.requestNumber)}"</strong> ดำเนินการเสร็จเรียบร้อยแล้ว`,
    extraHtml: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; margin: 18px 0 20px 0;">
        <tr>
          <td align="center" style="border: 1px solid #bdbdbd; background: #f7f7f7; padding: 14px;">
            <div style="font-size: 11px; color: #555555;">Vendor Code</div>
            <div style="font-size: 22px; line-height: 1.4; font-weight: 700; color: #111111; letter-spacing: 1px;">${text(data.vendorCode)}</div>
          </td>
        </tr>
      </table>
    `,
  })

export const emailIncompleteTemplate = (data: MailTemplateData) => {
  const reasons = (data.reasons || []).map((reason) => `<li style="margin-bottom: 4px;">${text(reason)}</li>`).join('')
  const reasonHtml = reasons
    ? `<div style="font-size: 12px; line-height: 1.55; color: #991b1b;"><strong>Reason(s):</strong><ul style="margin: 6px 0 0 18px; padding: 0;">${reasons}</ul></div>`
    : ''

  return renderStandardWorkflowMail(data, {
    recipient: data.userName || data.recipientName,
    status: 'Vendor registration incomplete',
    message: `Vendor request <strong>"${text(data.requestNumber)}"</strong> could not be completed.`,
    thaiStatus: 'การลงทะเบียนผู้ขายไม่สำเร็จ',
    thaiMessage: `คำขอหมายเลข <strong>"${text(data.requestNumber)}"</strong> ยังดำเนินการไม่สำเร็จ`,
    extraHtml: reasonHtml,
  })
}

export const emailActionRequiredTemplate = (data: MailTemplateData) =>
  renderMailLayout({
    recipient: data.recipientName || 'PIC',
    signerName: data.picName,
    signerTel: data.picTel,
    signerRole: 'PO & SCM PIC',
    content: `
      ${renderStatus(
        'Action Required',
        `${text(data.stageLabel, 'Current workflow stage')} requires your action for request <strong>"${text(data.requestNumber)}"</strong>.`,
        data.note ? `Note: ${text(data.note)}` : ''
      )}
      ${renderDetails([
        ['Vendor Name', data.vendorName],
        ['Support Product / Process', data.supportProduct],
        ['Stage', data.stageLabel],
        ['Note', data.note],
      ])}
      ${renderLink(data.systemLink)}
      ${renderThaiStatus(
        'ต้องดำเนินการเพิ่มเติม',
        `ขั้นตอน ${text(data.stageLabel, 'ปัจจุบัน')} ต้องการให้คุณดำเนินการสำหรับคำขอหมายเลข <strong>"${text(data.requestNumber)}"</strong>`,
        data.note ? `หมายเหตุ: ${text(data.note)}` : ''
      )}
    `,
  })
