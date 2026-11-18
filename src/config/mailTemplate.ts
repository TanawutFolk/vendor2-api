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

// Layout rules shared by every vendor-registration email:
// - email-client safe: table layout, inline styles only, 640px max width
// - palette limited to black / greys and the company blue; red only in the FITEL wordmark
// - English and Thai live in separate, labelled sections; only language-neutral values
//   (status, request number, vendor code) sit in the shared header
// - internal mails sign with the sender's extension (Ext.); supplier mails never show it

type DetailRow = [label: string, value: unknown]

type SectionOptions = {
  label: string
  headline: string
  greeting: string
  message: string
  thai?: boolean
  reason?: string
  body?: string
  rows?: DetailRow[]
  cta?: string
}

type LayoutOptions = {
  preheader: string
  statusEn: string
  statusTh: string
  requestNumber: unknown
  heroExtra?: string
  sections: string[]
  signerName?: unknown
  signerExt?: unknown
  signerRole: string
}

const COLOR = {
  page: '#F2F2F2',
  card: '#FFFFFF',
  line: '#DDDDDD',
  soft: '#F6F6F6',
  text: '#111111',
  muted: '#5C5C5C',
  rule: '#8C8C8C',
  brand: '#0057B8',
  fitel: '#EF1239',
}

const FONT = "'Segoe UI', 'Leelawadee UI', Tahoma, Arial, sans-serif"

const COMPANY_NAME_TH = 'บริษัท ฟูรูกาวา ไฟเทล (ประเทศไทย) จำกัด'
const BRAND_NAME = `Furukawa <span style="color: ${COLOR.fitel};">FITEL</span> (Thailand)`

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

const isEmployeeCodeLike = (value: unknown) => /^[A-Z]\d{3,}$/i.test(String(value || '').trim())

const isEmailLike = (value: unknown) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())

const isRoleFallbackName = (value: unknown) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
  return ['pic', 'po pic', 'po checker', 'account pic', 'approver', 'requester'].includes(normalized)
}

const isSignatureFallbackName = (value: unknown) => isRoleFallbackName(value) || isEmployeeCodeLike(value) || isEmailLike(value)

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

const renderStatusLabel = (statusEn: string, statusTh: string) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse: separate;">
    <tr>
      <td style="background: ${COLOR.soft}; border: 1px solid ${COLOR.line}; color: ${COLOR.text}; font-size: 12px; font-weight: 700; line-height: 1.4;
        padding: 4px 12px; border-radius: 999px; font-family: ${FONT};">
        ${statusEn} &nbsp;|&nbsp; ${statusTh}
      </td>
    </tr>
  </table>`

const renderSectionLabel = (label: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
    <tr>
      <td style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: ${COLOR.muted}; padding: 0 0 6px 0;
        border-bottom: 1px solid ${COLOR.line}; font-family: ${FONT};">${label}</td>
    </tr>
  </table>`

const renderReasonBox = (title: string, body: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; margin: 0 0 16px 0;">
    <tr>
      <td style="background: ${COLOR.soft}; border-left: 3px solid ${COLOR.text}; padding: 12px 14px; font-size: 13px; line-height: 1.6;
        color: ${COLOR.text}; font-family: ${FONT};">
        <div style="font-weight: 700; margin: 0 0 2px 0;">${title}</div>
        ${body}
      </td>
    </tr>
  </table>`

const renderNoteBox = (html: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; margin: 0 0 14px 0;">
    <tr>
      <td style="background: ${COLOR.soft}; border-left: 3px solid ${COLOR.rule}; padding: 12px 14px; font-size: 13px; line-height: 1.6;
        color: ${COLOR.text}; font-family: ${FONT};">${html}</td>
    </tr>
  </table>`

const renderDetails = (rows: DetailRow[]) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="border-collapse: separate; border: 1px solid ${COLOR.line}; border-radius: 6px; margin: 4px 0 18px 0;">
    ${rows
      .map(([label, value], index) => {
        const bottomBorderStyle = index < rows.length - 1 ? `border-bottom: 1px solid ${COLOR.line}; ` : ''

        return `
          <tr>
            <td width="38%" valign="top"
              style="${bottomBorderStyle}background: ${COLOR.soft}; padding: 9px 12px; font-size: 13px; line-height: 1.5; color: ${COLOR.muted}; font-family: ${FONT};"
            >${escapeHtml(label)}</td>
            <td valign="top" style="${bottomBorderStyle}padding: 9px 12px; font-size: 13px; line-height: 1.5; color: ${COLOR.text}; font-family: ${FONT};">${text(value)}</td>
          </tr>`
      })
      .join('')}
  </table>`

const vendorRows = (data: MailTemplateData, thai: boolean): DetailRow[] =>
  thai
    ? [
        ['ชื่อผู้ขาย', data.vendorName],
        ['ที่อยู่', data.address],
        ['ผู้ติดต่อ', data.contactPic],
        ['อีเมล', data.email],
        ['เบอร์ติดต่อ', data.tel],
        ['ผลิตภัณฑ์ / กระบวนการที่สนับสนุน', data.supportProduct],
        ['ความถี่ในการสั่งซื้อต่อปี', data.purchaseFrequency],
      ]
    : [
        ['Vendor name', data.vendorName],
        ['Address', data.address],
        ['Contact person', data.contactPic],
        ['Email', data.email],
        ['Tel.', data.tel],
        ['Supported product / process', data.supportProduct],
        ['Purchase frequency per year', data.purchaseFrequency],
      ]

const renderChecklist = (items: string[]) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; margin: 0 0 14px 0;">
    ${items
      .map(
        (item, index) => `
        <tr>
          <td width="30" valign="top" style="padding: 0 0 10px 0;">
            <div style="width: 22px; height: 22px; border-radius: 11px; background: ${COLOR.soft}; border: 1px solid ${COLOR.line}; color: ${COLOR.text};
              font-size: 12px; font-weight: 700; line-height: 22px; text-align: center; font-family: ${FONT};">${index + 1}</div>
          </td>
          <td valign="top" style="padding: 2px 0 10px 6px; font-size: 14px; line-height: 1.55; color: ${COLOR.text}; font-family: ${FONT};">${item}</td>
        </tr>`
      )
      .join('')}
  </table>`

const renderButton = (systemLink: string | undefined, label: string, fallbackText: string) => {
  const link = String(systemLink || '').trim()
  if (!link) return ''
  const escapedLink = escapeHtml(link)
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse: separate; margin: 4px 0 8px 0;">
      <tr>
        <td bgcolor="${COLOR.brand}" style="background: ${COLOR.brand}; border-radius: 4px;">
          <a href="${escapedLink}"
            style="display: inline-block; padding: 10px 20px; font-size: 14px; font-weight: 700; color: #FFFFFF; text-decoration: none; font-family: ${FONT};">${label}</a>
        </td>
      </tr>
    </table>
    <div style="font-size: 12px; line-height: 1.5; color: ${COLOR.muted}; margin: 0 0 8px 0; font-family: ${FONT};">
      ${fallbackText} <a href="${escapedLink}" style="color: ${COLOR.brand}; word-break: break-all;">${escapedLink}</a>
    </div>`
}

const buttonEn = (data: MailTemplateData, label = 'Open request') => renderButton(data.systemLink, label, 'Or copy this link:')
const buttonTh = (data: MailTemplateData, label = 'เปิดคำขอในระบบ') => renderButton(data.systemLink, label, 'หรือคัดลอกลิงก์นี้:')

const renderSection = (options: SectionOptions) => {
  const lineHeight = options.thai ? '1.75' : '1.6'
  return `
    <tr>
      <td style="padding: 24px 32px 8px 32px; font-family: ${FONT};">
        ${renderSectionLabel(options.label)}
        <div style="font-size: 17px; font-weight: 700; line-height: 1.4; color: ${COLOR.text}; margin: 16px 0 10px 0;">${options.headline}</div>
        <p style="margin: 0 0 8px 0; font-size: 14px; line-height: ${lineHeight}; color: ${COLOR.text};">${options.greeting}</p>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: ${lineHeight}; color: ${COLOR.text};">${options.message}</p>
        ${options.reason || ''}
        ${options.body || ''}
        ${options.rows ? renderDetails(options.rows) : ''}
        ${options.cta || ''}
      </td>
    </tr>`
}

const englishSection = (options: Omit<SectionOptions, 'label' | 'thai'>) => renderSection({ ...options, label: 'ENGLISH' })
const thaiSection = (options: Omit<SectionOptions, 'label' | 'thai'>) => renderSection({ ...options, label: 'ภาษาไทย', thai: true })

const renderDivider = () => `
  <tr>
    <td style="padding: 8px 32px;">
      <div style="height: 1px; line-height: 1px; font-size: 1px; background: ${COLOR.line};">&nbsp;</div>
    </td>
  </tr>`

const renderHero = (statusEn: string, statusTh: string, requestNumber: unknown, extra = '') => `
  <tr>
    <td style="padding: 28px 32px 8px 32px; font-family: ${FONT};">
      ${renderStatusLabel(statusEn, statusTh)}
      <div style="margin: 16px 0 0 0; font-size: 12px; color: ${COLOR.muted};">Request No. / เลขที่คำขอ</div>
      <div style="font-size: 22px; font-weight: 700; line-height: 1.3; color: ${COLOR.text}; letter-spacing: 0.3px;">${text(requestNumber)}</div>
      ${extra}
      <div style="margin: 14px 0 0 0; font-size: 12px; color: ${COLOR.muted};">English version first &middot; ฉบับภาษาไทยอยู่ด้านล่าง</div>
    </td>
  </tr>`

// signerExt is the sender's internal extension. Supplier templates pass nothing, so the
// extension never reaches people outside the company.
const renderSignature = (name: unknown, ext: unknown, role: string) => {
  const normalizedName = String(name || '').trim()
  const safeName = isSignatureFallbackName(normalizedName) ? '' : normalizedName
  const normalizedExt = String(ext || '').trim()

  return `
    <tr>
      <td style="padding: 16px 32px 28px 32px; font-family: ${FONT};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
          <tr>
            <td style="border-top: 1px solid ${COLOR.line}; padding: 16px 0 0 0; font-size: 13px; line-height: 1.6; color: ${COLOR.text};">
              <div style="color: ${COLOR.muted};">Best regards &middot; ขอแสดงความนับถือ</div>
              <div style="font-weight: 700;">${text(safeName, 'Vendor Registration System')}${
                normalizedExt ? ` <span style="font-weight: 400; color: ${COLOR.muted};">(Ext. ${text(normalizedExt)})</span>` : ''
              }</div>
              <div style="color: ${COLOR.muted};">${escapeHtml(role)}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

// Company footer: wording, line breaks and styling are fixed by the business owner.
const renderCompanyFooter = () => `
  <tr>
    <td style="padding: 24px 4px 0 4px; color: #111111; font-size: 10px; line-height: 1.45; font-family: Arial, 'Segoe UI', Tahoma, sans-serif;">
      <div>
        <span style="display: inline-block; border-top: 1px solid #8c8c8c; padding-top: 7px; font-weight: 700; color: #0057b8;"
          >Furukawa <span style="color: #ef1239;">FITEL</span> (Thailand) Co., Ltd.</span
        >
      </div>
      <div>1/71 Moo 5, Rojana Industrial Park, Rojana Road, Kanharm</div>
      <div>U-Thai, Phranakorn Sri Ayutthaya 13210, Thailand</div>
    </td>
  </tr>`

const renderMailLayout = (options: LayoutOptions) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Vendor Registration System</title>
  </head>
  <body style="margin: 0; padding: 0; background: ${COLOR.page};">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(options.preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${COLOR.page}" style="background: ${COLOR.page}; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 24px 12px 32px 12px;">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; border-collapse: collapse; font-family: ${FONT};">
            <tr>
              <td style="padding: 0 4px 12px 4px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="font-size: 14px; font-weight: 700; color: ${COLOR.brand}; font-family: ${FONT};">${BRAND_NAME}</td>
                    <td align="right" style="font-size: 12px; color: ${COLOR.muted}; font-family: ${FONT};">Vendor Registration System</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background: ${COLOR.card}; border: 1px solid ${COLOR.line}; border-radius: 6px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
                  ${renderHero(options.statusEn, options.statusTh, options.requestNumber, options.heroExtra)}
                  ${options.sections.join(renderDivider())}
                  ${renderSignature(options.signerName, options.signerExt, options.signerRole)}
                </table>
              </td>
            </tr>
            ${renderCompanyFooter()}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

const preheaderText = (message: string, requestNumber: unknown) => `${message} ${String(requestNumber ?? '').trim()}`.trim()

// ---------------------------------------------------------------------------
// Internal workflow mails (signed with Ext.)
// ---------------------------------------------------------------------------

export const email_ToPic_RequestRegisterVendor = (data: MailTemplateData) => {
  const requestNumber = text(data.requestNumber)
  const recipient = text(data.recipientName, 'PO PIC')

  return renderMailLayout({
    preheader: preheaderText('Please register vendor request', data.requestNumber),
    statusEn: 'Vendor registration requested',
    statusTh: 'ขอลงทะเบียนผู้ขาย',
    requestNumber: data.requestNumber,
    sections: [
      englishSection({
        headline: 'A new vendor registration request',
        greeting: `Dear <strong>${recipient}</strong>,`,
        message: `Please register vendor request <strong>${requestNumber}</strong> in the system <strong>within 2 weeks</strong>.`,
        rows: vendorRows(data, false),
        cta: buttonEn(data),
      }),
      thaiSection({
        headline: 'มีคำขอลงทะเบียนผู้ขายรายใหม่',
        greeting: `เรียน <strong>${recipient}</strong>`,
        message: `กรุณาดำเนินการลงทะเบียนผู้ขายตามคำขอเลขที่ <strong>${requestNumber}</strong> ในระบบ<strong>ภายใน 2 สัปดาห์</strong>`,
        rows: vendorRows(data, true),
        cta: buttonTh(data),
      }),
    ],
    signerName: data.userName,
    signerExt: data.userTel,
    signerRole: 'Requester',
  })
}

export const email_ToRequester_GprCSetup = (data: MailTemplateData) => {
  const requestNumber = text(data.requestNumber)
  const recipient = text(data.userName || data.recipientName, 'Requester')

  return renderMailLayout({
    preheader: preheaderText('Please set up GPR C for request', data.requestNumber),
    statusEn: 'GPR C setup required',
    statusTh: 'ต้องตั้งค่า GPR C',
    requestNumber: data.requestNumber,
    sections: [
      englishSection({
        headline: 'Please set up the GPR C approval flow',
        greeting: `Dear <strong>${recipient}</strong>,`,
        message: `Please set the Product Checkers, GPR C Approver, PC PIC and Circular List for request <strong>${requestNumber}</strong>.`,
        rows: vendorRows(data, false),
        cta: buttonEn(data),
      }),
      thaiSection({
        headline: 'กรุณาตั้งค่าผู้อนุมัติ GPR C',
        greeting: `เรียน <strong>${recipient}</strong>`,
        message: `กรุณากำหนด Product Checker, GPR C Approver, PC PIC และ Circular List สำหรับคำขอเลขที่ <strong>${requestNumber}</strong>`,
        rows: vendorRows(data, true),
        cta: buttonTh(data),
      }),
    ],
    signerName: data.picName,
    signerExt: data.picTel,
    signerRole: 'PO & SCM PIC',
  })
}

export const email_ToGprCApprover_FirstStep = (data: MailTemplateData) => {
  const requestNumber = text(data.requestNumber)
  const recipient = text(data.userName || data.recipientName, 'Approver')

  return renderMailLayout({
    preheader: preheaderText('GPR C approval required for request', data.requestNumber),
    statusEn: 'GPR C approval required',
    statusTh: 'รออนุมัติ GPR C',
    requestNumber: data.requestNumber,
    sections: [
      englishSection({
        headline: 'A GPR C step is waiting for your approval',
        greeting: `Dear <strong>${recipient}</strong>,`,
        message: `Please review and approve request <strong>${requestNumber}</strong> for General Purchase Specification Form C.`,
        reason: renderNoteBox('Please review the attached Vendor Form B before approving this step.'),
        rows: vendorRows(data, false),
        cta: buttonEn(data),
      }),
      thaiSection({
        headline: 'มีขั้นตอน GPR C รอการอนุมัติจากคุณ',
        greeting: `เรียน <strong>${recipient}</strong>`,
        message: `กรุณาตรวจสอบและอนุมัติคำขอเลขที่ <strong>${requestNumber}</strong> สำหรับ General Purchase Specification Form C`,
        reason: renderNoteBox('กรุณาตรวจสอบ Vendor Form B ที่แนบมาก่อนอนุมัติขั้นตอนนี้'),
        rows: vendorRows(data, true),
        cta: buttonTh(data),
      }),
    ],
    signerName: data.picName,
    signerExt: data.picTel,
    signerRole: 'Requester',
  })
}

export const email_ToGprCApprover_NextStep = (data: MailTemplateData) => email_ToGprCApprover_FirstStep({ ...data, userName: data.picNextStepName })

export const email_ToPic_RejectedByApprover = (data: MailTemplateData) => {
  const requestNumber = text(data.requestNumber)
  const recipient = text(data.recipientName, 'PO PIC')

  return renderMailLayout({
    preheader: preheaderText('Vendor request rejected', data.requestNumber),
    statusEn: 'Rejected',
    statusTh: 'ไม่อนุมัติ',
    requestNumber: data.requestNumber,
    sections: [
      englishSection({
        headline: 'This vendor request has been rejected',
        greeting: `Dear <strong>${recipient}</strong>,`,
        message: `Vendor request <strong>${requestNumber}</strong> was rejected. The reason is below.`,
        reason: renderReasonBox('Reason', text(data.remarkEN)),
        rows: vendorRows(data, false),
        cta: buttonEn(data),
      }),
      thaiSection({
        headline: 'คำขอลงทะเบียนผู้ขายนี้ไม่ได้รับการอนุมัติ',
        greeting: `เรียน <strong>${recipient}</strong>`,
        message: `คำขอเลขที่ <strong>${requestNumber}</strong> ไม่ได้รับการอนุมัติ สาเหตุอยู่ด้านล่าง`,
        reason: renderReasonBox('สาเหตุ', text(data.remarkTH || data.remarkEN)),
        rows: vendorRows(data, true),
        cta: buttonTh(data),
      }),
    ],
    signerName: data.picName,
    signerExt: data.picTel,
    signerRole: 'PO & SCM PIC',
  })
}

export const email_ToChecker_CheckRequired = (data: MailTemplateData) => {
  const requestNumber = text(data.requestNumber)
  const recipient = text(data.recipientName, 'PO Checker')

  return renderMailLayout({
    preheader: preheaderText('Please check vendor request', data.requestNumber),
    statusEn: 'Check required',
    statusTh: 'รอตรวจสอบ',
    requestNumber: data.requestNumber,
    sections: [
      englishSection({
        headline: 'A vendor request is waiting for your check',
        greeting: `Dear <strong>${recipient}</strong>,`,
        message: `Please check vendor request <strong>${requestNumber}</strong>. The vendor details are below.`,
        rows: vendorRows(data, false),
        cta: buttonEn(data),
      }),
      thaiSection({
        headline: 'มีคำขอลงทะเบียนผู้ขายรอการตรวจสอบจากคุณ',
        greeting: `เรียน <strong>${recipient}</strong>`,
        message: `กรุณาตรวจสอบคำขอเลขที่ <strong>${requestNumber}</strong> รายละเอียดผู้ขายอยู่ด้านล่าง`,
        rows: vendorRows(data, true),
        cta: buttonTh(data),
      }),
    ],
    signerName: data.picName,
    signerExt: data.picTel,
    signerRole: 'PO & SCM PIC',
  })
}

export const email_ToPic_RecheckByApprover = (data: MailTemplateData) => {
  const requestNumber = text(data.requestNumber)
  const recipient = text(data.recipientName, 'PO PIC')

  return renderMailLayout({
    preheader: preheaderText('Recheck required for vendor request', data.requestNumber),
    statusEn: 'Recheck required',
    statusTh: 'ต้องตรวจสอบอีกครั้ง',
    requestNumber: data.requestNumber,
    sections: [
      englishSection({
        headline: 'The approver sent this request back for recheck',
        greeting: `Dear <strong>${recipient}</strong>,`,
        message: `Please update vendor request <strong>${requestNumber}</strong> and submit it again.`,
        reason: renderReasonBox('Reason from approver', text(data.remarkEN)),
        rows: vendorRows(data, false),
        cta: buttonEn(data),
      }),
      thaiSection({
        headline: 'ผู้อนุมัติส่งคำขอนี้กลับมาให้ตรวจสอบอีกครั้ง',
        greeting: `เรียน <strong>${recipient}</strong>`,
        message: `กรุณาแก้ไขคำขอเลขที่ <strong>${requestNumber}</strong> แล้วส่งกลับเข้าระบบอีกครั้ง`,
        reason: renderReasonBox('เหตุผลจากผู้อนุมัติ', text(data.remarkTH || data.remarkEN)),
        rows: vendorRows(data, true),
        cta: buttonTh(data),
      }),
    ],
    signerName: data.picName,
    signerExt: data.picTel,
    signerRole: 'PO & SCM PIC',
  })
}

export const email_ToPic_RecheckByGprCApprover = (data: MailTemplateData) => {
  const requestNumber = text(data.requestNumber)
  const recipient = text(data.recipientName, 'PO PIC')

  return renderMailLayout({
    preheader: preheaderText('GPR C recheck requested for vendor request', data.requestNumber),
    statusEn: 'GPR C recheck requested',
    statusTh: 'GPR C ขอให้ตรวจสอบอีกครั้ง',
    requestNumber: data.requestNumber,
    sections: [
      englishSection({
        headline: 'The GPR C approver requested changes',
        greeting: `Dear <strong>${recipient}</strong>,`,
        message: `Please review vendor request <strong>${requestNumber}</strong> and resubmit it. It will return to the same approver.`,
        reason: renderReasonBox(`${text(data.stageLabel, 'GPR C Approver')} remark`, text(data.remarkEN)),
        rows: vendorRows(data, false),
        cta: buttonEn(data),
      }),
      thaiSection({
        headline: 'ผู้อนุมัติ GPR C ขอให้แก้ไขคำขอ',
        greeting: `เรียน <strong>${recipient}</strong>`,
        message: `กรุณาตรวจสอบคำขอเลขที่ <strong>${requestNumber}</strong> แล้วส่งกลับ คำขอจะกลับไปที่ผู้อนุมัติคนเดิม`,
        reason: renderReasonBox(`หมายเหตุจาก ${text(data.stageLabel, 'ผู้อนุมัติ GPR C')}`, text(data.remarkTH || data.remarkEN)),
        rows: vendorRows(data, true),
        cta: buttonTh(data),
      }),
    ],
    signerName: data.picName,
    signerExt: data.picTel,
    signerRole: 'PO & SCM PIC',
  })
}

export const email_ToPoManager_ApproveRequired = (data: MailTemplateData) => {
  const requestNumber = text(data.requestNumber)
  const recipient = text(data.recipientName, 'PO Mgr')

  return renderMailLayout({
    preheader: preheaderText('Please approve vendor request', data.requestNumber),
    statusEn: 'Approval required',
    statusTh: 'รออนุมัติ',
    requestNumber: data.requestNumber,
    sections: [
      englishSection({
        headline: 'A vendor request is waiting for your approval',
        greeting: `Dear <strong>${recipient}</strong>,`,
        message: `Please review and approve vendor request <strong>${requestNumber}</strong>. The vendor details are below.`,
        rows: vendorRows(data, false),
        cta: buttonEn(data),
      }),
      thaiSection({
        headline: 'มีคำขอลงทะเบียนผู้ขายรอการอนุมัติจากคุณ',
        greeting: `เรียน <strong>${recipient}</strong>`,
        message: `กรุณาตรวจสอบและอนุมัติคำขอลงทะเบียนผู้ขายเลขที่ <strong>${requestNumber}</strong> รายละเอียดผู้ขายอยู่ด้านล่าง`,
        rows: vendorRows(data, true),
        cta: buttonTh(data),
      }),
    ],
    signerName: data.picName,
    signerExt: data.picTel,
    signerRole: 'PO & SCM PIC',
  })
}

export const email_ToPoGm_ApproveRequired = (data: MailTemplateData) => email_ToPoManager_ApproveRequired({ ...data, recipientName: data.recipientName || 'PO GM' })

export const email_ToMd_ApproveRequired = (data: MailTemplateData) => email_ToPoManager_ApproveRequired({ ...data, recipientName: data.recipientName || 'MD' })

export const email_ToAccount_RegisterRequired = (data: MailTemplateData) => email_ToPoManager_ApproveRequired({ ...data, recipientName: data.recipientName || 'Account PIC' })

export const email_ToRequester_RegistrationCompleted = (data: MailTemplateData) => {
  const requestNumber = text(data.requestNumber)
  const recipient = text(data.userName || data.recipientName, 'Requester')
  const vendorCodeBox = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse: separate; margin: 14px 0 0 0;">
      <tr>
        <td style="background: ${COLOR.soft}; border: 1px solid ${COLOR.line}; border-radius: 6px; padding: 10px 16px; font-family: ${FONT};">
          <div style="font-size: 11px; color: ${COLOR.muted};">Vendor Code / รหัสผู้ขาย</div>
          <div style="font-size: 22px; font-weight: 700; letter-spacing: 1.5px; color: ${COLOR.text}; font-family: Consolas, 'Courier New', monospace;"
          >${text(data.vendorCode)}</div>
        </td>
      </tr>
    </table>`

  return renderMailLayout({
    preheader: preheaderText('Vendor registration completed for request', data.requestNumber),
    statusEn: 'Registration completed',
    statusTh: 'ลงทะเบียนสำเร็จ',
    requestNumber: data.requestNumber,
    heroExtra: vendorCodeBox,
    sections: [
      englishSection({
        headline: 'Vendor registration is complete',
        greeting: `Dear <strong>${recipient}</strong>,`,
        message: `Vendor request <strong>${requestNumber}</strong> has been completed. The vendor code is shown above.`,
        rows: vendorRows(data, false),
        cta: buttonEn(data, 'View request'),
      }),
      thaiSection({
        headline: 'ลงทะเบียนผู้ขายเรียบร้อยแล้ว',
        greeting: `เรียน <strong>${recipient}</strong>`,
        message: `คำขอเลขที่ <strong>${requestNumber}</strong> ดำเนินการเสร็จเรียบร้อยแล้ว รหัสผู้ขายแสดงอยู่ด้านบน`,
        rows: vendorRows(data, true),
        cta: buttonTh(data, 'ดูคำขอในระบบ'),
      }),
    ],
    signerName: data.picName,
    signerExt: data.picTel,
    signerRole: 'PO & SCM PIC',
  })
}

export const email_ToRequester_RegistrationIncomplete = (data: MailTemplateData) => {
  const requestNumber = text(data.requestNumber)
  const recipient = text(data.userName || data.recipientName, 'Requester')
  const reasonItems = (data.reasons || []).map((reason) => `<li style="margin: 0 0 4px 0;">${text(reason)}</li>`).join('')
  const reasonList = reasonItems ? `<ul style="margin: 4px 0 0 18px; padding: 0;">${reasonItems}</ul>` : ''

  return renderMailLayout({
    preheader: preheaderText('Vendor registration incomplete for request', data.requestNumber),
    statusEn: 'Registration incomplete',
    statusTh: 'ลงทะเบียนไม่สำเร็จ',
    requestNumber: data.requestNumber,
    sections: [
      englishSection({
        headline: 'Vendor registration could not be completed',
        greeting: `Dear <strong>${recipient}</strong>,`,
        message: `Vendor request <strong>${requestNumber}</strong> could not be completed.`,
        reason: reasonList ? renderReasonBox('Reason(s)', reasonList) : '',
        rows: vendorRows(data, false),
        cta: buttonEn(data, 'View request'),
      }),
      thaiSection({
        headline: 'การลงทะเบียนผู้ขายยังไม่สำเร็จ',
        greeting: `เรียน <strong>${recipient}</strong>`,
        message: `คำขอเลขที่ <strong>${requestNumber}</strong> ยังดำเนินการไม่สำเร็จ`,
        reason: reasonList ? renderReasonBox('สาเหตุ', reasonList) : '',
        rows: vendorRows(data, true),
        cta: buttonTh(data, 'ดูคำขอในระบบ'),
      }),
    ],
    signerName: data.picName,
    signerExt: data.picTel,
    signerRole: 'PO & SCM PIC',
  })
}

export const email_ToUser_ActionRequired = (data: MailTemplateData) => {
  const requestNumber = text(data.requestNumber)
  const recipient = text(data.recipientName, 'Recipient')
  const stageEn = text(data.stageLabel, 'The current stage')
  const stageTh = text(data.stageLabel, 'ขั้นตอนปัจจุบัน')

  return renderMailLayout({
    preheader: preheaderText('Action required for request', data.requestNumber),
    statusEn: 'Action required',
    statusTh: 'ต้องดำเนินการเพิ่มเติม',
    requestNumber: data.requestNumber,
    sections: [
      englishSection({
        headline: 'Your action is required',
        greeting: `Dear <strong>${recipient}</strong>,`,
        message: `<strong>${stageEn}</strong> requires your action for request <strong>${requestNumber}</strong>.`,
        reason: data.note ? renderReasonBox('Note', text(data.note)) : '',
        rows: [
          ['Vendor name', data.vendorName],
          ['Supported product / process', data.supportProduct],
          ['Stage', data.stageLabel],
        ],
        cta: buttonEn(data),
      }),
      thaiSection({
        headline: 'มีงานที่ต้องให้คุณดำเนินการเพิ่มเติม',
        greeting: `เรียน <strong>${recipient}</strong>`,
        message: `<strong>${stageTh}</strong> ต้องการให้คุณดำเนินการสำหรับคำขอเลขที่ <strong>${requestNumber}</strong>`,
        reason: data.note ? renderReasonBox('หมายเหตุ', text(data.note)) : '',
        rows: [
          ['ชื่อผู้ขาย', data.vendorName],
          ['ผลิตภัณฑ์ / กระบวนการที่สนับสนุน', data.supportProduct],
          ['ขั้นตอน', data.stageLabel],
        ],
        cta: buttonTh(data),
      }),
    ],
    signerName: data.picName,
    signerExt: data.picTel,
    signerRole: 'PO & SCM PIC',
  })
}

// Sent back to the GPR C approver (the judge who raised the Action Required) once the assigned PIC
// records their result — closes the "Email result" loop in the GPR C flow.
export const email_ToUser_ActionResult = (data: MailTemplateData) => {
  const requestNumber = text(data.requestNumber)
  const recipient = text(data.recipientName, 'Approver')
  const stageEn = text(data.stageLabel, 'the current stage')
  const stageTh = text(data.stageLabel, 'ขั้นตอนปัจจุบัน')

  return renderMailLayout({
    preheader: preheaderText('Action Required result recorded for request', data.requestNumber),
    statusEn: 'Action result recorded',
    statusTh: 'บันทึกผลการดำเนินการแล้ว',
    requestNumber: data.requestNumber,
    sections: [
      englishSection({
        headline: 'The PIC has recorded the result',
        greeting: `Dear <strong>${recipient}</strong>,`,
        message: `The assigned PIC has recorded the Action Required result for <strong>${stageEn}</strong> of request <strong>${requestNumber}</strong>.`,
        reason: data.note ? renderReasonBox('Result', text(data.note)) : '',
        rows: [
          ['Vendor name', data.vendorName],
          ['Supported product / process', data.supportProduct],
          ['Stage', data.stageLabel],
        ],
        cta: buttonEn(data),
      }),
      thaiSection({
        headline: 'PIC บันทึกผลการดำเนินการแล้ว',
        greeting: `เรียน <strong>${recipient}</strong>`,
        message: `PIC ที่ได้รับมอบหมายบันทึกผล Action Required ของ <strong>${stageTh}</strong> สำหรับคำขอเลขที่ <strong>${requestNumber}</strong> แล้ว`,
        reason: data.note ? renderReasonBox('ผลลัพธ์', text(data.note)) : '',
        rows: [
          ['ชื่อผู้ขาย', data.vendorName],
          ['ผลิตภัณฑ์ / กระบวนการที่สนับสนุน', data.supportProduct],
          ['ขั้นตอน', data.stageLabel],
        ],
        cta: buttonTh(data),
      }),
    ],
    signerName: data.picName,
    signerExt: data.picTel,
    signerRole: 'PO & SCM PIC',
  })
}

// ---------------------------------------------------------------------------
// Supplier mails (sent outside the company: never show the internal extension)
// ---------------------------------------------------------------------------

const renderConfidential = (html: string) => `<p style="margin: 0 0 8px 0; font-size: 11px; line-height: 1.6; color: ${COLOR.muted}; font-family: ${FONT};">${html}</p>`

export const email_ToSupplier_RequestFormA = (data: MailTemplateData) => {
  const referenceRaw = data.topicRef || data.requestNumber
  const reference = text(referenceRaw)
  const isNewSupplier = Boolean(data.isNewSupplier)

  return renderMailLayout({
    preheader: preheaderText('Documents required for supplier registration', referenceRaw),
    statusEn: 'Documents required',
    statusTh: 'ขอเอกสารประกอบ',
    requestNumber: referenceRaw,
    sections: [
      englishSection({
        headline: isNewSupplier ? 'Documents required for new supplier registration' : 'Documents required for supplier re-registration',
        greeting: 'Dear <strong>Supplier</strong>,',
        message: isNewSupplier
          ? `To register your company as a new supplier of <strong>${BRAND_NAME} Co., Ltd.</strong>, and to share our Environmental, Quality and Export Control policies, ` +
            `please send the documents below for reference <strong>${reference}</strong> <strong>within 7 days</strong>.`
          : `To update your supplier registration with <strong>${BRAND_NAME} Co., Ltd.</strong> and confirm our Environmental, Quality and Export Control policies, ` +
            `please send the documents below for reference <strong>${reference}</strong> <strong>within 7 days</strong>.`,
        body:
          renderChecklist([
            '<strong>Company certificate</strong> (Limited or Public Company Limited) and <strong>VAT registration</strong> (Por Por 20)',
            '<strong>Company profile</strong>',
            '<strong>Other certifications</strong>, such as ISO 9001, ISO 14001 and a main product catalog',
            '<strong>Copy of bank book</strong>',
            '<strong>MFG survey</strong> reply, in Excel format',
            '<strong>Reply Form</strong>, in PDF format',
          ]) +
          renderNoteBox('Details are in the attached files. If you have any questions, please reply to this email.') +
          renderConfidential(
            'This message and its attachments contain confidential information intended only for the named recipient and are protected by law. ' +
              'If you are not the intended recipient, please delete this message. Any disclosure, copying, distribution or action based on this message is strictly prohibited.'
          ),
      }),
      thaiSection({
        headline: isNewSupplier ? 'ขอเอกสารเพื่อลงทะเบียนผู้ผลิต / ผู้จัดจำหน่ายรายใหม่' : 'ขอเอกสารเพื่ออัปเดตการลงทะเบียนผู้ผลิต / ผู้จัดจำหน่าย',
        greeting: 'เรียน <strong>ผู้ผลิตและผู้จัดจำหน่าย</strong>',
        message: isNewSupplier
          ? `เพื่อลงทะเบียนบริษัทของท่านเป็นผู้ผลิต / ผู้จัดจำหน่ายรายใหม่ของ <strong>${COMPANY_NAME_TH}</strong> ` +
            'และแจ้งนโยบายด้านสิ่งแวดล้อม ด้านคุณภาพ และด้านการควบคุมการส่งออก ' +
            `รบกวนส่งเอกสารด้านล่างสำหรับเลขที่อ้างอิง <strong>${reference}</strong> <strong>ภายใน 7 วัน</strong>`
          : `เพื่ออัปเดตข้อมูลการลงทะเบียนกับ <strong>${COMPANY_NAME_TH}</strong> ` +
            'และยืนยันนโยบายด้านสิ่งแวดล้อม ด้านคุณภาพ และด้านการควบคุมการส่งออก ' +
            `รบกวนส่งเอกสารด้านล่างสำหรับเลขที่อ้างอิง <strong>${reference}</strong> <strong>ภายใน 7 วัน</strong>`,
        body:
          renderChecklist([
            '<strong>หนังสือรับรองนิติบุคคล</strong> และ <strong>ภ.พ.20</strong>',
            '<strong>Company profile</strong>',
            '<strong>เอกสารรับรองอื่น ๆ</strong> เช่น ISO 9001, ISO 14001 และแคตตาล็อกสินค้าหลัก',
            '<strong>สำเนาหน้าสมุดบัญชีธนาคาร</strong>',
            'ตอบกลับแบบสำรวจ <strong>MFG survey</strong> เป็นไฟล์ Excel',
            'ตอบกลับ <strong>Reply Form</strong> เป็นไฟล์ PDF',
          ]) +
          renderNoteBox('รายละเอียดเพิ่มเติมอยู่ในไฟล์แนบ หากมีข้อสงสัย ตอบกลับอีเมลนี้ได้เลยค่ะ') +
          renderConfidential(
            'ข้อความนี้และไฟล์แนบมีข้อมูลที่เป็นความลับ สำหรับผู้รับที่ระบุไว้เท่านั้น และได้รับความคุ้มครองตามกฎหมาย ' +
              'หากท่านไม่ใช่ผู้รับที่ระบุไว้ กรุณาลบข้อความนี้ ห้ามเปิดเผย ทำสำเนา เผยแพร่ หรือดำเนินการใด ๆ โดยอ้างอิงข้อความนี้'
          ),
      }),
    ],
    signerName: data.picName,
    signerRole: 'PO & SCM PIC',
  })
}

export const email_ToSupplier_RequestFormB = (data: MailTemplateData) => {
  const requestNumber = text(data.requestNumber)

  return renderMailLayout({
    preheader: preheaderText('General Purchase Specification Form B required for', data.requestNumber),
    statusEn: 'Form B required',
    statusTh: 'ขอเอกสาร Form B',
    requestNumber: data.requestNumber,
    sections: [
      englishSection({
        headline: 'Please complete General Purchase Specification Form B',
        greeting: 'Dear <strong>Supplier</strong>,',
        message:
          'Because your company did <strong>not accept</strong> General Purchase Specification Form A, ' +
          `please complete Form B for reference <strong>${requestNumber}</strong> and reply <strong>within 7 days</strong>.`,
      }),
      thaiSection({
        headline: 'กรุณากรอกเอกสาร General Purchase Specification Form B',
        greeting: 'เรียน <strong>ผู้ผลิตและผู้จัดจำหน่าย</strong>',
        message:
          'เนื่องจากบริษัทของท่าน<strong>ไม่ยอมรับ</strong>ข้อกำหนดตามเอกสาร General Purchase Specification Form A ' +
          `กรุณากรอกเอกสาร Form B สำหรับเลขที่อ้างอิง <strong>${requestNumber}</strong> และตอบกลับ<strong>ภายใน 7 วัน</strong>`,
      }),
    ],
    signerName: data.picName,
    signerRole: 'PO & SCM PIC',
  })
}
