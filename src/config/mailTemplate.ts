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
                <p style="color: #475569; margin: 0 0 5px 0;">Thank you &amp; Best regards,</p>
                <p style="color: #0f172a; font-weight: 600; margin: 0; font-size: 16px;">${data.requesterName}</p>
                <p style="color: #64748b; margin: 3px 0 0 0; font-size: 13px;">Requester &nbsp;|&nbsp; 📞 Tel: ${data.requesterTel}</p>
            </div>
            
        </div>
    </div>
</div>
`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Vendor Agreement Request Template
// Sent directly to the Vendor's email asking them to prepare documents
// ─────────────────────────────────────────────────────────────────────────────
export const vendorAgreementTemplate = (data: {
    requestNumber: string;
    vendorName: string;
    vendorAddress: string;
    contactName: string;
    picName: string;
    picEmail: string;
    supportProduct: string;
    purchaseFrequency: string;
    isReregister?: boolean;
}) => {
    const docType = data.isReregister
        ? `Document for Register_Selection-YY-RXXX &nbsp;&nbsp; <span style="color:#64748b;">For re-register supplier</span>`
        : `Document for Register_Selection-YY-NXXX &nbsp;&nbsp; <span style="color:#64748b;">For register new supplier</span>`

    return `
<div style="background-color: #f4f7f6; padding: 40px 20px; font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">
<div style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">

    <!-- Header -->
    <div style="background-color: #1e3a5f; padding: 28px 40px; text-align: center;">
        <p style="color: #93c5fd; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Furukawa FITEL (Thailand) Co., Ltd.</p>
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Vendor Registration Agreement</h1>
        <p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 13px;">Request No: ${data.requestNumber}</p>
    </div>

    <div style="padding: 36px 40px;">

        <!-- To / CC / Topic -->
        <table style="width:100%; font-size:14px; color:#334155; margin-bottom:24px; border-collapse:collapse;">
            <tr>
                <td style="padding:6px 0; color:#64748b; width:90px; vertical-align:top; font-weight:600;">Email to:</td>
                <td style="padding:6px 0; vertical-align:top;">Vendor's Email</td>
            </tr>
            <tr>
                <td style="padding:6px 0; color:#64748b; font-weight:600; vertical-align:top;">CC:</td>
                <td style="padding:6px 0; vertical-align:top;">PIC and User</td>
            </tr>
            <tr>
                <td style="padding:6px 0; color:#64748b; font-weight:600; vertical-align:top;">Topic:</td>
                <td style="padding:6px 0; vertical-align:top;">${docType}</td>
            </tr>
        </table>

        <div style="border-top:1px solid #e2e8f0; margin-bottom:24px;"></div>

        <!-- Bilingual notice -->
        <p style="font-size:13px; color:#0284c7; font-weight:600; margin:0 0 20px 0;">** สามารถอ่านภาษาไทยด้านล่างได้ค่ะ **</p>

        <!-- English Section -->
        <p style="font-size:15px; color:#0f172a; font-weight:600; margin:0 0 10px 0;">Dear Supplier,</p>

        <p style="font-size:14px; color:#475569; line-height:1.8; margin:0 0 16px 0;">
            As <strong>Furukawa FITEL (Thailand) Co., Ltd.</strong> has never contacted or used the service from your company,
            it is necessary to request more information to register a new supplier. Including informing about company policies such as
            Environmental Policy, Quality Policy and Export Control Policy. Therefore, we kindly request the following documents,
        </p>

        <ol style="color:#334155; font-size:14px; line-height:2; padding-left:24px; margin:0 0 20px 0;">
            <li>Company certificate (Limited Company or Public Company Limited) and Vat License ( Por Por 20 )</li>
            <li>Company profile</li>
            <li>Other certifications, such as ISO9001, ISO14000, catalog main product, etc.</li>
            <li>Copy of Book banking</li>
            <li>Reply to " MFG survey document " in Excel file format within 7 days.</li>
            <li>Reply to " Reply Form document " in Pdf file format within 7 days.</li>
        </ol>

        <p style="font-size:14px; color:#475569; line-height:1.8; margin:0 0 8px 0;">
            You can see more information in attached file.<br>
            If you have any comments, please let me know.
        </p>

        <!-- Vendor Info Box -->
        <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px 24px; margin:24px 0;">
            <table style="width:100%; border-collapse:collapse; font-size:13px; line-height:1.6;">
                <tr>
                    <td style="padding:7px 0; color:#64748b; width:40%; border-bottom:1px solid #f1f5f9; vertical-align:top;">Vendor / ผู้จัดจำหน่าย</td>
                    <td style="padding:7px 0; color:#0f172a; font-weight:600; border-bottom:1px solid #f1f5f9;">${data.vendorName}</td>
                </tr>
                <tr>
                    <td style="padding:7px 0; color:#64748b; border-bottom:1px solid #f1f5f9; vertical-align:top;">Address / ที่อยู่</td>
                    <td style="padding:7px 0; color:#0f172a; font-weight:500; border-bottom:1px solid #f1f5f9;">${data.vendorAddress || '-'}</td>
                </tr>
                <tr>
                    <td style="padding:7px 0; color:#64748b; border-bottom:1px solid #f1f5f9; vertical-align:top;">Contact / ผู้ติดต่อ</td>
                    <td style="padding:7px 0; color:#0f172a; font-weight:500; border-bottom:1px solid #f1f5f9;">${data.contactName || '-'}</td>
                </tr>
                <tr>
                    <td style="padding:7px 0; color:#64748b; border-bottom:1px solid #f1f5f9; vertical-align:top;">Support Product / สินค้า/บริการ</td>
                    <td style="padding:7px 0; color:#0f172a; font-weight:500; border-bottom:1px solid #f1f5f9;">${data.supportProduct || '-'}</td>
                </tr>
                <tr>
                    <td style="padding:7px 0; color:#64748b; vertical-align:top;">Purchase Freq. / ความถี่</td>
                    <td style="padding:7px 0; color:#0f172a; font-weight:500;">${data.purchaseFrequency || '-'}</td>
                </tr>
            </table>
        </div>

        <div style="border-top:1px solid #e2e8f0; margin:28px 0;"></div>

        <!-- Thai Section -->
        <p style="font-size:15px; color:#0f172a; font-weight:600; margin:0 0 10px 0;">เรียน ผู้ผลิตและผู้จัดจำหน่าย</p>

        <p style="font-size:14px; color:#475569; line-height:1.8; margin:0 0 16px 0;">
            เนื่องด้วยทางบริษัท ฟูรูกาวา ไฟเทล (ประเทศไทย) จำกัด ยังไม่เคยติดต่อหรือใช้บริการร่วมกับบริษัทของคุณ<br>
            จึงจำเป็นต้องมีการร้องขอข้อมูลที่จำเป็นเพื่อใช้ในการลงทะเบียนผู้ผลิต / ผู้จัดจำหน่ายใหม่
            รวมถึงการแจ้งข้อมูลเกี่ยวกับนโยบายของบริษัท ได้แก่
            นโยบายด้านสิ่งแวดล้อม ด้านคุณภาพ และด้านการควบคุมการส่งออก ดังนั้นทางเราจึงขอเอกสารต่าง ๆ ดังนี้
        </p>

        <ol style="color:#334155; font-size:14px; line-height:2; padding-left:24px; margin:0 0 20px 0;">
            <li>หนังสือรับรองบริษัท เช่น หนังสือรับรอง, ภ.พ.20</li>
            <li>Company profile</li>
            <li>เอกสารรับรองอื่นๆ เช่น ISO9001, ISO14000, แคตตาล็อก ฯลฯ</li>
            <li>สำเนาหน้า Book banking</li>
            <li>ตอบกลับเอกสาร " MFG survey " ในรูปแบบไฟล์ Excel ภายใน 7 วัน</li>
            <li>ตอบกลับเอกสาร " Reply Form " ในรูปแบบไฟล์ pdf ภายใน 7 วัน</li>
        </ol>

        <p style="font-size:14px; color:#475569; line-height:1.8; margin:0 0 4px 0;">รบกวนดูรายละเอียดเพิ่มเติมจากไฟล์แนบ</p>
        <p style="font-size:14px; color:#475569; margin:0 0 28px 0;">หากมีข้อสงสัย โปรดแจ้งกลับมาให้เราทราบค่ะ</p>

        <div style="border-top:1px solid #e2e8f0; margin-bottom:24px;"></div>

        <!-- Remark -->
        <p style="font-size:12px; color:#94a3b8; line-height:1.7; margin:0 0 28px 0;">
            <em>Remark : This message (including any attachments) contains confidential information intended for a specific individual and purpose,
            and is protected by law. If you are not the intended recipient, you should delete this message.
            Any disclosure, copying, or distribution of this message, or the taking of any action based on it, is strictly prohibited.</em>
        </p>

        <!-- Signature -->
        <div style="font-size:14px; line-height:1.6; border-top:2px solid #e2e8f0; padding-top:20px;">
            <p style="color:#475569; margin:0 0 4px 0;">Best regards,</p>
            <p style="color:#0f172a; font-weight:700; margin:0; font-size:15px;">${data.picName}</p>
            <p style="color:#64748b; margin:3px 0 0 0; font-size:13px;">PIC — Furukawa FITEL (Thailand) Co., Ltd. &nbsp;|&nbsp; ✉️ ${data.picEmail}</p>
        </div>

    </div>
</div>
</div>
`
}

