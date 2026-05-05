// const nodemailer = require('nodemailer')
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const mime = require('mime-types')
const path = require('path')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INVALID_TOKENS = new Set(['-', 'n/a', 'na', 'null', 'undefined'])

const isValidEmail = (value: string) => EMAIL_REGEX.test(value)

const sanitizeEmail = (value: any) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
  if (!normalized || INVALID_TOKENS.has(normalized)) return ''
  return normalized
}

// const sendEmail = async (
//   message,
//   send_to
//   //   reply_to
// ) => {
//   // Create Email Transporter
//   const transporter = nodemailer.createTransport({
//     service: "hotmail",
//     host: "SMTP.office365.com",
//     port: 587,
//     auth: {
//       user: "fft.system@furukawaelectric.com",
//       pass: "3Km@rY=8j3n",
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//   });

//   // Option for sending email
//   const options = {
//     from: "fft.system@furukawaelectric.com",
//     to: send_to,
//     // replyTo: reply_to,
//     subject: "Leave System / Flex Time System",
//     html: message,
//     attachments: [
//       // {
//       //   // file on disk as an attachment
//       //   filename: 'bg_mail_template.jpg',
//       //   path: `${__dirname}/../images/bg_mail_template.jpg`, // stream this file
//       //   cid: 'bg',
//       // },
//       // {
//       //   // file on disk as an attachment
//       //   filename: 'leave-system-logo-dark.png',
//       //   path: `${__dirname}/../images/leave-system-logo-dark.png`, // stream this file
//       //   cid: 'logo-dark',
//       // },
//       //   {
//       //     // file on disk as an attachment
//       //     filename: "leave-system-logo.png",
//       //     path: `${__dirname}/../images/leave-system-logo.png`, // stream this file
//       //     cid: "logo",
//       //   },
//     ],
//   };

//   // Send email
//   transporter.sendMail(options, function (err, info) {
//     if (err) {
//       // console.log(err);
//     } else {
//       // console.log('Sent Email Successfully.');
//     }
//   });
// };

const normalizeEmailList = (value?: string | string[]) => {
  const values = Array.isArray(value) ? value : [value || '']
  if (values.length === 0) return []

  const seen = new Set<string>()
  const emails: string[] = []

  values.forEach((item) => {
    String(item || '')
      .split(/[;,]+/)
      .map(sanitizeEmail)
      .filter((email) => email && isValidEmail(email))
      .forEach((email) => {
        if (!seen.has(email)) {
          seen.add(email)
          emails.push(email)
        }
      })
  })

  return emails
}

const normalizeCcList = (cc?: string[]) => normalizeEmailList(cc || [])

type MailLogMeta = {
  templateName?: string
  requestId?: string | number
  requestNumber?: string
  flow?: string
}

export type MailAttachment = {
  filename?: string
  path?: string
  content?: Buffer | string
  contentType?: string
}

type MailSendResult = {
  success: boolean
  skipped?: boolean
  reason?: string
}

const buildMailLogPayload = (params: {
  templateName?: string
  toEmail?: string
  ccEmails?: string[]
  subject?: string
  requestId?: string | number
  requestNumber?: string
  flow?: string
  bodyLength?: number
  attachments?: MailAttachment[]
}) => ({
  templateName: params.templateName || 'unknown-template',
  toEmail: params.toEmail || '',
  ccEmails: params.ccEmails || [],
  ccCount: params.ccEmails?.length || 0,
  subject: params.subject || '',
  requestId: params.requestId ?? '',
  requestNumber: params.requestNumber || '',
  flow: params.flow || '',
  bodyLength: params.bodyLength || 0,
  attachments: (params.attachments || []).map((item) => ({
    filename: item.filename || path.basename(item.path || '') || 'attachment',
    path: item.path || '',
    hasInlineContent: Boolean(item.content),
  })),
  attachmentCount: params.attachments?.length || 0,
})

const resolveAttachmentFilename = (attachment: MailAttachment, index: number) => {
  const filename = String(attachment.filename || '').trim()
  if (filename) return filename
  if (attachment.path) return path.basename(attachment.path)
  return `attachment-${index + 1}`
}

const resolveAttachmentContentType = (attachment: MailAttachment, filename: string) => {
  return attachment.contentType || mime.lookup(filename) || 'application/octet-stream'
}

const buildAttachmentEntries = (attachments: MailAttachment[] = []) => {
  return attachments.map((attachment, index) => {
    const filename = resolveAttachmentFilename(attachment, index)
    const attachmentPath = String(attachment.path || '').trim()
    const inlineContent = attachment.content
    const contentType = resolveAttachmentContentType(attachment, filename)

    if (attachmentPath && fs.existsSync(attachmentPath)) {
      return {
        attachment,
        filename,
        contentType,
        value: fs.createReadStream(attachmentPath),
        options: {
          filename,
          contentType,
        },
        reason: '',
      }
    }

    if (Buffer.isBuffer(inlineContent)) {
      return {
        attachment,
        filename,
        contentType,
        value: inlineContent,
        options: {
          filename,
          contentType,
        },
        reason: '',
      }
    }

    if (typeof inlineContent === 'string' && inlineContent.length > 0) {
      return {
        attachment,
        filename,
        contentType,
        value: Buffer.from(inlineContent),
        options: {
          filename,
          contentType,
        },
        reason: '',
      }
    }

    return {
      attachment,
      filename,
      contentType,
      value: null,
      options: null,
      reason: attachmentPath ? 'Attachment file not found' : 'Attachment content is empty',
    }
  })
}

const getFormHeaders = async (form: any) => {
  const headers = {
    ...form.getHeaders(),
  }

  try {
    const contentLength = await new Promise<number>((resolve, reject) => {
      form.getLength((error: Error | null, length: number) => {
        if (error) {
          reject(error)
          return
        }
        resolve(length)
      })
    })

    return {
      ...headers,
      'Content-Length': contentLength,
    }
  } catch {
    return headers
  }
}

const sendEmail = async (
  message: string,
  send_to: string,
  subject?: string,
  cc?: string[],
  meta: MailLogMeta = {},
  attachments: MailAttachment[] = []
): Promise<MailSendResult> => {
  //API
  const API_URL = 'http://192.168.0.250:9002/api/mail/send'

  // 1. แปลง \n ใน HTML ให้เป็น <br> เพื่อให้ขึ้นบรรทัดใหม่สวยงาม
  let fixedMessage = message.replace(/\\n/g, '<br>')

  // 2. ลบ \n (Enter) ของ Code ออกให้เหลือบรรทัดเดียว (Minify) เพื่อกัน Error
  const cleanMessage = fixedMessage.replace(/[\r\n]+/g, '').trim()
  const normalizedToEmails = normalizeEmailList(send_to)
  const normalizedTo = normalizedToEmails.join(';')
  const normalizedCc = normalizeCcList(cc)
  const resolvedSubject = subject || '[Vendor Registration System] Vendor Registration'
  const logPayload = buildMailLogPayload({
    templateName: meta.templateName,
    toEmail: normalizedTo || String(send_to || '').trim(),
    ccEmails: normalizedCc,
    subject: resolvedSubject,
    requestId: meta.requestId,
    requestNumber: meta.requestNumber,
    flow: meta.flow,
    bodyLength: cleanMessage.length,
    attachments,
  })

  if (normalizedToEmails.length === 0) {
    console.error('[MAIL TEMPLATE][skipped]', {
      ...logPayload,
      reason: 'Invalid TO recipient',
      rawToEmail: send_to,
    })
    return { success: false, skipped: true, reason: 'Invalid TO recipient' }
  }
  const form = new FormData()
  form.append('To', normalizedTo)
  form.append('CC', normalizedCc.length > 0 ? normalizedCc.join(';') : '')
  form.append('Subject', resolvedSubject)
  form.append('BodyHtml', cleanMessage)

  const attachmentEntries = buildAttachmentEntries(attachments)
  const readableAttachments = attachmentEntries.filter((item) => item.value && item.options)
  const missingAttachments = attachmentEntries.filter((item) => !item.value || !item.options)

  missingAttachments.forEach((item) => {
    console.error('[MAIL TEMPLATE][attachment skipped]', {
      ...logPayload,
      filename: item.filename,
      contentType: item.contentType,
      path: item.attachment?.path || '',
      reason: item.reason,
    })
  })

  readableAttachments.forEach((item) => {
    form.append('attachments', item.value!, item.options!)
  })

  try {
    console.log('[MAIL TEMPLATE][sending]', {
      ...logPayload,
      toEmail: normalizedTo,
      attachmentCount: readableAttachments.length,
      attachedFiles: readableAttachments.map((item) => ({
        filename: item.filename,
        contentType: item.contentType,
      })),
    })

    const response = await axios.post(API_URL, form, {
      headers: await getFormHeaders(form),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    })

    if (response.status === 200) {
      // console.log(`ส่งเมลหา ${send_to} สำเร็จ!`);
    }
    console.log('[MAIL TEMPLATE][sent]', {
      ...logPayload,
      status: response.status,
    })

    return { success: true }
  } catch (error: any) {
    console.error('[MAIL TEMPLATE][failed]', {
      ...logPayload,
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    })
    // console.error(`ส่งเมลหา ${send_to} ไม่สำเร็จ:`, error.message);
    if (error.response) {
      // console.error("Response Data:", error.response.data);
    }
    return { success: false, reason: error?.message || 'Mail API error' }
  }
}

export default sendEmail
