export const registerVendorTemplate = (data: {
  requestNumber: string;
  picName: string;
  vendorName: string;
  address: string;
  contactPic: string;
  email: string;
  tel: string;
  supportProduct: string;
  purchaseFrequency: string;
  systemLink: string;
  requesterName: string;
  requesterTel: string;
}) => {
  return `
<div style="background-color: #f4f7f6; padding: 40px 20px; font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <div style="background-color: #1e293b; padding: 30px 40px; text-align: center;">
            <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Action Required</p>
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">Vendor Registration</h1>
            <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px;">Req No: ${data.requestNumber}</p>
        </div>

        <div style="padding: 40px;">
            <p style="font-size: 12px; color: #94a3b8; margin-top: 0; text-align: right;">
                CC: [Email of SubPIC]
            </p>

            <p style="font-size: 16px; color: #334155; margin-top: 0;">
                Dear <strong style="color: #0f172a;">${data.picName}</strong>,
            </p>
            
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Please proceed with the vendor registration process in the system within <strong style="color: #e11d48;">2 weeks</strong>.<br>
                <span style="font-size: 13px; color: #94a3b8;">โปรดดำเนินการลงทะเบียนผู้ขายในระบบภายใน 2 สัปดาห์</span>
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.5;">
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; width: 45%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                            Vendor Name<br><span style="font-size: 12px; color: #94a3b8;">ชื่อเวนเดอร์</span>
                        </td>
                        <td style="padding: 10px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                            ${data.vendorName}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                            Address<br><span style="font-size: 12px; color: #94a3b8;">ที่อยู่</span>
                        </td>
                        <td style="padding: 10px 0; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                            ${data.address}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                            Contact Person<br><span style="font-size: 12px; color: #94a3b8;">ชื่อผู้ติดต่อ</span>
                        </td>
                        <td style="padding: 10px 0; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                            ${data.contactPic}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                            Contact Info<br><span style="font-size: 12px; color: #94a3b8;">ข้อมูลติดต่อ</span>
                        </td>
                        <td style="padding: 10px 0; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                            ✉️ ${data.email}<br>📞 ${data.tel}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                            Support Product<br><span style="font-size: 12px; color: #94a3b8;">สนับสนุนผลิตภัณฑ์</span>
                        </td>
                        <td style="padding: 10px 0; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                            ${data.supportProduct}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; vertical-align: top;">
                            Purchase Freq.<br><span style="font-size: 12px; color: #94a3b8;">ความถี่การสั่งซื้อ</span>
                        </td>
                        <td style="padding: 10px 0; color: #0f172a; font-weight: 500; vertical-align: top;">
                            ${data.purchaseFrequency}
                        </td>
                    </tr>
                </table>
            </div>

            <div style="text-align: center; margin: 40px 0;">
                <a href="${data.systemLink}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.3);">
                    Access System / เข้าสู่ระบบ
                </a>
                <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
                    If the button doesn't work, click the link below:<br>
                    <a href="${data.systemLink}" style="color: #0284c7; text-decoration: underline; word-break: break-all;">${data.systemLink}</a>
                </p>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

            <div style="font-size: 14px; line-height: 1.6;">
                <p style="color: #475569; margin: 0 0 5px 0;">Thank you & Best regards,</p>
                <p style="color: #0f172a; font-weight: 600; margin: 0; font-size: 16px;">${data.requesterName}</p>
                <p style="color: #64748b; margin: 3px 0 0 0; font-size: 13px;">Requester &nbsp;|&nbsp; 📞 Tel: ${data.requesterTel}</p>
            </div>
            
        </div>
    </div>
</div>
`;
};
