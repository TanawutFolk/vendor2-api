// const nodemailer = require('nodemailer')
const axios = require('axios')
const FormData = require('form-data')

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

const sendEmail = async (message: string, send_to: string) => {
  // URL ของ API (เอามาจากบรรทัด API_URL ในรูป Python ของคุณ)
  const API_URL = 'http://192.168.0.250:9002/api/mail/send'

  // เตรียมข้อมูลที่จะส่ง (Mapping ให้ตรงกับตัวแปร data ใน Python)
  // 1. แปลง \n ใน HTML ให้เป็น <br> เพื่อให้ขึ้นบรรทัดใหม่สวยงาม
  let fixedMessage = message.replace(/\\n/g, '<br>')

  // 2. ลบ \n (Enter) ของ Code ออกให้เหลือบรรทัดเดียว (Minify) เพื่อกัน Error
  const cleanMessage = fixedMessage.replace(/[\r\n]+/g, '').trim()
  const form = new FormData()
  form.append('To', send_to)
  form.append('CC', '') // ใส่ค่าว่าง หรืออีเมลถ้ามี
  form.append('Subject', '[Vendor Registration System] New Registration Request Assigned')
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
    // console.error(`ส่งเมลหา ${send_to} ไม่สำเร็จ:`, error.message);
    if (error.response) {
      // ดูว่า Server ตอบ error อะไรกลับมา (ช่วย debug ได้ดีมาก)
      // console.error("Response Data:", error.response.data);
    }
  }
}

export default sendEmail
