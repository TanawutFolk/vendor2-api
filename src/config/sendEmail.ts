// const nodemailer = require('nodemailer')
const axios = require('axios')
const FormData = require('form-data')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INVALID_TOKENS = new Set(['-', 'n/a', 'na', 'null', 'undefined'])

const isValidEmail = (value: string) => EMAIL_REGEX.test(value)

const sanitizeEmail = (value: any) => {
  const normalized = String(value || '').trim().toLowerCase()
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

const normalizeCcList = (cc?: string[]) => {
  if (!Array.isArray(cc) || cc.length === 0) return []

  const seen = new Set<string>()
  const emails: string[] = []

  cc.forEach(item => {
    String(item || '')
      .split(/[;,]+/)
      .map(sanitizeEmail)
      .filter(email => email && isValidEmail(email))
      .forEach(email => {
        if (!seen.has(email)) {
          seen.add(email)
          emails.push(email)
        }
      })
  })

  return emails
}

const sendEmail = async (message: string, send_to: string, subject?: string, cc?: string[]) => {
  // URL ของ API (เอามาจากบรรทัด API_URL ในรูป Python ของคุณ)
  const API_URL = 'http://192.168.0.250:9002/api/mail/send'

  // เตรียมข้อมูลที่จะส่ง (Mapping ให้ตรงกับตัวแปร data ใน Python)
  // 1. แปลง \n ใน HTML ให้เป็น <br> เพื่อให้ขึ้นบรรทัดใหม่สวยงาม
  let fixedMessage = message.replace(/\\n/g, '<br>')

  // 2. ลบ \n (Enter) ของ Code ออกให้เหลือบรรทัดเดียว (Minify) เพื่อกัน Error
  const cleanMessage = fixedMessage.replace(/[\r\n]+/g, '').trim()
  const normalizedTo = sanitizeEmail(send_to)
  if (!normalizedTo || !isValidEmail(normalizedTo)) {
    console.error('[MAIL DEBUG][sendEmail] Invalid TO recipient, skip sending', { to: send_to, subject })
    return
  }
  const normalizedCc = normalizeCcList(cc)
  const form = new FormData()
  form.append('To', normalizedTo)
  form.append('CC', normalizedCc.length > 0 ? normalizedCc.join(';') : '')
  form.append('Subject', subject || '[Vendor Registration System] Vendor Registration')
  form.append('BodyHtml', cleanMessage)

  try {
    // console.log("กำลังส่งข้อมูล...", formData.toString()); // Log ดูข้อมูลที่จะส่ง

    // 3. ส่งข้อมูลด้วย axios (มันจะรู้เองว่าเป็น Form เพราะเราใช้ URLSearchParams)
    const response = await axios.post(API_URL, form, {
      headers: {
        ...form.getHeaders(), // สำคัญมาก! บรรทัดนี้จะบอก Server ว่าเป็น multipart
      },
    })

    if (response.status === 200) {
      // console.log(`ส่งเมลหา ${send_to} สำเร็จ!`);
    }
  } catch (error: any) {
    console.error('[MAIL DEBUG][sendEmail] API error', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    })
    // console.error(`ส่งเมลหา ${send_to} ไม่สำเร็จ:`, error.message);
    if (error.response) {
      // ดูว่า Server ตอบ error อะไรกลับมา (ช่วย debug ได้ดีมาก)
      // console.error("Response Data:", error.response.data);
    }
  }
}

export default sendEmail
