export type MailTemplateData = {
    toEmail?: string;
    ccEmail?: string;
    ccEmailLine1?: string;
    ccEmailLine2?: string;
    vendorEmail?: string;
    topicRef?: string;
    isNewSupplier?: boolean;
    requestNumber?: string;
    recipientName?: string;
    userName?: string;
    userTel?: string;
    picName?: string;
    picTel?: string;
    picNextStepName?: string;
    vendorName?: string;
    address?: string;
    contactPic?: string;
    email?: string;
    tel?: string;
    supportProduct?: string;
    purchaseFrequency?: string;
    systemLink?: string;
    vendorCode?: string;
    remarkEN?: string;
    remarkTH?: string;
    reasons?: string[];
};

//User sent to Approver PIC
export const emailRequestRegisterVendorTemplate = (data: MailTemplateData) => {
    return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.6; max-width: 800px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #fee2e2;">
        <div style="background-color: #d32f2f; height: 6px; width: 100%;"></div>
        <div style="padding: 32px;">
            <p style="margin: 0 0 20px 0; font-size: 15px;">Dear  &nbsp;&nbsp;&nbsp;<span style="color: #d32f2f; font-weight: 600;">${data.recipientName || 'Error Connection PLEAS Report '}</span></p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #d32f2f; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #b91c1c;">Status: Under request register vendor</p>
                <p style="margin: 0; color: #7f1d1d;">Please request register vendor follow as <strong>"${data.requestNumber}"</strong> in the program within 2 weeks.</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">Vendor Name</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Address</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Contact Vendor</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Email</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Tel</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">For support product / process :</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Purchase Frequency / Year :</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <p style="margin: 0 0 24px 0;">
                You can access the system through this link : <a href="${data.systemLink}" style="color: #d32f2f; text-decoration: underline; font-weight: 500;">${data.systemLink}</a>
            </p>

            <hr style="border: none; border-top: 1px dashed #fee2e2; margin: 32px 0;">

            <div style="background-color: #fef2f2; border-left: 4px solid #d32f2f; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #b91c1c;">สถานะ : อยู่ระหว่างการดำเนินการลงทะเบียนผู้ขาย</p>
                <p style="margin: 0; color: #7f1d1d;">โปรดร้องขอลงทะเบียนผู้ขายตามหมายเลข <strong>"${data.requestNumber}"</strong> ในโปรแกรมภายใน 2 สัปดาห์</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">ชื่อเวนเดอร์</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ที่อยู่</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ชื่อผู้ติดต่อ</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">อีเมล</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">เบอร์ติดต่อ</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 32px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ความถี่ในการสั่งซื้อต่อปี:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #fee2e2; font-size: 14px;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827;">Thank you & Best regards,</p>
                <p style="margin: 0 0 4px 0; color: #d32f2f; font-weight: 600;">${data.userName} <span style="color: #6b7280; font-weight: normal;">(#Tel. ${data.userTel})</span></p>
                <p style="margin: 0; color: #6b7280;">Requester</p>
            </div>
        </div>
    </div>
    `;
};
//PIC sent to supplier/Vendor
export const emailVendorDocumentRequestTemplate = (data: MailTemplateData) => {
    const supplierStatusText = data.isNewSupplier
        ? "For register new supplier"
        : "For re-register supplier";

    return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.6; max-width: 800px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #fee2e2;">
        <div style="background-color: #d32f2f; height: 6px; width: 100%;"></div>
        <div style="padding: 32px;">

            <p style="margin: 0 0 24px 0; font-weight: 600; color: #d32f2f; background: #fef2f2; padding: 8px 12px; border-radius: 6px; display: inline-block;">** สามารถอ่านภาษาไทยด้านล่างได้ค่ะ **</p>

            <p style="margin: 0 0 16px 0; font-size: 15px;">Dear Supplier,</p>
            
            <p style="margin: 0 0 16px 0;">
                As <strong>Furukawa <span style="color: #d32f2f;">FITEL</span> (Thailand) Co., Ltd.</strong> has never contacted or used the service from your company, it is necessary to <strong>request more information to register a new supplier</strong>. Including informing about company policies such as Environmental Policy, Quality Policy and Export Control Policy. Therefore, we kindly request the following documents:
            </p>
            
            <ol style="margin: 0 0 24px 0; padding-left: 24px; color: #111827;">
                <li style="margin-bottom: 8px;"><strong>Company certificate</strong> (Limited Company or Public Company Limited) and <strong>Vat License</strong> (Por Por 20)</li>
                <li style="margin-bottom: 8px;"><strong>Company profile</strong></li>
                <li style="margin-bottom: 8px;"><strong>Other certifications</strong>, such as ISO9001, ISO14000, catalog main product, etc.</li>
                <li style="margin-bottom: 8px;"><strong>Copy of Book banking</strong></li>
                <li style="margin-bottom: 8px;">Reply to <strong>"MFG survey document"</strong> in Excel file format <strong>within 7 days</strong>.</li>
                <li style="margin-bottom: 8px;">Reply to <strong>"Reply Form document"</strong> in Pdf file format <strong>within 7 days</strong>.</li>
            </ol>

            <p style="margin: 0 0 24px 0; background-color: #f9fafb; padding: 12px; border-left: 3px solid #9ca3af;">
                You can see more information in attached file.<br>
                If you have any comments, please let me know.
            </p>

            <p style="margin: 0 0 24px 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
                <em>Remark: This message (including any attachments) contains confidential information intended for a specific individual and purpose, and is protected by law. If you are not the intended recipient, you should delete this message.<br>
                Any disclosure, copying, or distribution of this message, or the taking of any action based on it, is strictly prohibited.</em>
            </p>

            <hr style="border: none; border-top: 1px solid #fee2e2; margin: 32px 0;">

            <p style="margin: 0 0 16px 0; font-weight: 600; font-size: 15px; color: #111827;">เรียน ผู้ผลิตและผู้จัดจำหน่าย</p>
            
            <p style="margin: 0 0 16px 0;">
                เนื่องด้วยทาง <strong>บริษัท ฟูรูกาวา <span style="color: #d32f2f;">ไฟเทล</span> (ประเทศไทย) จำกัด</strong> ยังไม่เคยติดต่อใช้บริการร่วมกับบริษัทของคุณ จึงจำเป็นต้องมีการ<strong>ร้องขอข้อมูลที่จำเป็นเพื่อใช้ในการลงทะเบียนผู้ผลิต / ผู้จัดจำหน่ายใหม่</strong> รวมถึงการแจ้งข้อมูลเกี่ยวกับนโยบายของบริษัท ได้แก่ นโยบายด้านสิ่งแวดล้อม ด้านคุณภาพ และด้านการควบคุมการส่งออก ดังนั้นทางเราจึงรบกวนขอเอกสารต่าง ๆ ดังนี้
            </p>
            
            <ol style="margin: 0 0 24px 0; padding-left: 24px; color: #111827;">
                <li style="margin-bottom: 8px;"><strong>หนังสือรับรองนิติบุคคล, ภพ.20</strong></li>
                <li style="margin-bottom: 8px;"><strong>Company profile</strong></li>
                <li style="margin-bottom: 8px;"><strong>เอกสารรับรองอื่นๆ</strong> เช่น ISO9001, ISO14000, แคตตาล็อค ฯลฯ</li>
                <li style="margin-bottom: 8px;"><strong>สำเนาหน้า Book banking</strong></li>
                <li style="margin-bottom: 8px;">ตอบกลับเอกสาร <strong>"MFG survey"</strong> ในรูปแบบไฟล์ Excel <strong>ภายใน 7 วัน</strong></li>
                <li style="margin-bottom: 8px;">ตอบกลับเอกสาร <strong>"Reply Form"</strong> ในรูปแบบไฟล์ pdf <strong>ภายใน 7 วัน</strong></li>
            </ol>

            <p style="margin: 0 0 32px 0; background-color: #f9fafb; padding: 12px; border-left: 3px solid #9ca3af;">
                รบกวนดูรายละเอียดเพิ่มเติมจากไฟล์แนบ<br>
                หากมีข้อสงสัย โปรดแจ้งกลับมาให้เราทราบค่ะ
            </p>

            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #fee2e2; font-size: 14px;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827;">Thank you & Best regards,</p>
                <p style="margin: 0 0 4px 0; color: #d32f2f; font-weight: 600;">${data.picName} <span style="color: #6b7280; font-weight: normal;">(#Tel. ${data.picTel})</span></p>
            </div>
        </div>
    </div>
    `;
};
//If supplier/Vendor not accept the GPR Form A send this email to supplier/Vendor
export const emailExternalSubmitGPRBTemplate = (data: MailTemplateData) => {
    return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.6; max-width: 800px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #fee2e2;">
        <div style="background-color: #d32f2f; height: 6px; width: 100%;"></div>
        <div style="padding: 32px;">

            <p style="margin: 0 0 20px 0; font-size: 15px;">Dear Supplier,</p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #d32f2f; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #b91c1c;">Status: Under Submit register vendor</p>
                <p style="margin: 0 0 8px 0; color: #7f1d1d;">
                    Since you <span style="color: #ffffff; background-color: #dc2626; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 12px; margin: 0 4px;">Not Accept</span> the General Purchase Specification Form A document.
                </p>
                <p style="margin: 0; color: #7f1d1d;">
                    Please submit register vendor follow as <strong>"${data.requestNumber}"</strong>. General Purchase Specification Form B and reply within 7 days.
                </p>
            </div>

            <div style="background-color: #fef2f2; border-left: 4px solid #d32f2f; padding: 16px; margin-bottom: 32px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #b91c1c;">สถานะ : อยู่ระหว่างการดำเนินการลงทะเบียนผู้ขาย</p>
                <p style="margin: 0 0 8px 0; color: #7f1d1d;">
                    เนื่องจากทางผู้ขาย <span style="color: #ffffff; background-color: #dc2626; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 12px; margin: 0 4px;">ไม่ยอมรับ</span> ข้อกำหนดตามเอกสาร General Purchase Specification Form A
                </p>
                <p style="margin: 0; color: #7f1d1d;">
                    โปรดกรอกข้อมูล ลงทะเบียนผู้ขายตามหมายเลข <strong>"${data.requestNumber}"</strong> สำหรับเอกสาร General Purchase Specification Form B และตอบกลับภายใน 7 วัน
                </p>
            </div>

            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #fee2e2; font-size: 14px;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827;">Thank you & Best regards,</p>
                <p style="margin: 0 0 4px 0; color: #d32f2f; font-weight: 600;">${data.picName} <span style="color: #6b7280; font-weight: normal;">(#Tel. ${data.picTel})</span></p>
            </div>
        </div>
    </div>
    `;
};
// sent to requester head approver after PIC confirms vendor accepted the GPR B conditions.
export const emailUserCheckerApproverGPRCTemplate = (data: MailTemplateData) => {
    return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.6; max-width: 800px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #fee2e2;">
        <div style="background-color: #d32f2f; height: 6px; width: 100%;"></div>
        <div style="padding: 32px;">

            <p style="margin: 0 0 20px 0; font-size: 15px;">Dear : &nbsp;&nbsp;&nbsp;<span style="color: #d32f2f; font-weight: 600;">${data.userName}</span></p>
            
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #92400e;">Status: Requester acknowledgment / requester head approval</p>
                <p style="margin: 0; color: #b45309;">Please review and approve <strong>"${data.requestNumber}"</strong> for General Purchase Specification Form C.</p>
                <p style="margin: 8px 0 0 0; color: #d32f2f; font-weight: 500; font-size: 13px;">* PIC confirmed the vendor can accept the updated conditions from GPR B. After your approval, PIC will continue the request to Doc Checker.</p>
            </div>

            ${Array.isArray(data.reasons) && data.reasons.length > 0 ? `
            <div style="background-color: #fff7ed; border: 1px solid #fdba74; padding: 16px; margin-bottom: 24px; border-radius: 10px;">
                <p style="margin: 0 0 10px 0; font-weight: 700; color: #9a3412;">Conditions requiring your review</p>
                <ul style="margin: 0; padding-left: 18px; color: #7c2d12;">
                    ${data.reasons.map(reason => `<li style="margin-bottom: 6px;">${reason}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">Vendor Name:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Address:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Contact PIC:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Email:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Tel:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">For support product / process:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Purchase Frequency:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <p style="margin: 0 0 24px 0;">
                You can access the system through this link: <a href="${data.systemLink}" style="color: #d32f2f; text-decoration: underline; font-weight: 500;">${data.systemLink}</a>
            </p>

            <hr style="border: none; border-top: 1px dashed #fee2e2; margin: 32px 0;">

            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #92400e;">สถานะ : อยู่ระหว่างการอนุมัติการลงทะเบียนผู้ขาย</p>
                <p style="margin: 0; color: #b45309;">โปรดอนุมัติลงทะเบียนผู้ขายตามหมายเลข <strong>"${data.requestNumber}"</strong>. เอกสาร General Purchase Specification Form C.</p>
                <p style="margin: 8px 0 0 0; color: #d32f2f; font-weight: 500; font-size: 13px;">* เวนเดอร์ไม่ยอมรับบางเงื่อนไขของเอกสาร General Purchase Specification Form A. โปรดตรวจสอบและอนุมัติ</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">ชื่อเวนเดอร์:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ที่อยู่:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ชื่อผู้ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">อีเมล:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">เบอร์ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 32px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #fee2e2; font-size: 14px;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827;">Thank you & Best regards,</p>
                <p style="margin: 0 0 4px 0; color: #d32f2f; font-weight: 600;">${data.picName} <span style="color: #6b7280; font-weight: normal;">(#Tel. ${data.picTel})</span></p>
            </div>
        </div>
    </div>
    `;
};



// ใช้โครงสร้างเดียวกับ emailUserCheckerApproverGPRCTemplate แต่เปลี่ยนตัวแปรชื่อผู้รับ
export const emailAfterCheckerApproverGPRCTemplate = (data: MailTemplateData) => {
    return emailUserCheckerApproverGPRCTemplate({...data, userName: data.picNextStepName});
};

export const emailReject1Template = (data: MailTemplateData) => {
    return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.6; max-width: 800px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #fee2e2;">
        <div style="background-color: #dc2626; height: 6px; width: 100%;"></div>
        <div style="padding: 32px;">

            <p style="margin: 0 0 20px 0; font-size: 15px;">Dear : &nbsp;&nbsp;&nbsp;<span style="color: #d32f2f; font-weight: 600;">${data.recipientName || 'PO PIC'}</span></p>
            
            <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #be123c; font-size: 16px;">❌ Status: [REJECT] register vendor</p>
                <p style="margin: 0 0 8px 0; color: #881337;">Please recheck register vendor follow as <strong>"${data.requestNumber}"</strong> . General Purchase Specification Form B</p>
                <p style="margin: 0; background: #ffe4e6; padding: 8px; border-radius: 4px; color: #9f1239; font-weight: 500;">Reason: ${data.remarkEN}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">Vendor Name:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Address:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Contact PIC:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Email:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Tel:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">For support product/process:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Purchase Frequency:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <p style="margin: 0 0 24px 0;">
                You can access the system through this link: <a href="${data.systemLink}" style="color: #d32f2f; text-decoration: underline; font-weight: 500;">${data.systemLink}</a>
            </p>

            <hr style="border: none; border-top: 1px dashed #fee2e2; margin: 32px 0;">

            <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #be123c; font-size: 16px;">❌ สถานะ : [ปฏิเสธการตรวจสอบ] การลงทะเบียนผู้ขาย</p>
                <p style="margin: 0 0 8px 0; color: #881337;">โปรดตรวจสอบลงทะเบียนผู้ขายตามหมายเลข <strong>"${data.requestNumber}"</strong>. เอกสาร General Purchase Specification Form B. อีกครั้ง</p>
                <p style="margin: 0; background: #ffe4e6; padding: 8px; border-radius: 4px; color: #9f1239; font-weight: 500;">สาเหตุ: ${data.remarkTH}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">ชื่อเวนเดอร์:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ที่อยู่:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ชื่อผู้ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">อีเมล:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">เบอร์ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 32px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #fee2e2; font-size: 14px;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827;">Thank you & Best regards,</p>
                <p style="margin: 0 0 4px 0; color: #d32f2f; font-weight: 600;">${data.picName} <span style="color: #6b7280; font-weight: normal;">(#Tel. ${data.picTel})</span></p>
            </div>
        </div>
    </div>
    `;
};

export const emailToCheckerPICTemplate = (data: MailTemplateData) => {
    return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.6; max-width: 800px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #fee2e2;">
        <div style="background-color: #d32f2f; height: 6px; width: 100%;"></div>
        <div style="padding: 32px;">

            <p style="margin: 0 0 20px 0; font-size: 15px;">Dear : &nbsp;&nbsp;&nbsp;<span style="color: #d32f2f; font-weight: 600;">PO CHECKER</span></p>
            
            <div style="background-color: #f3f4f6; border-left: 4px solid #4b5563; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #1f2937;">Status: Under checking register vendor</p>
                <p style="margin: 0; color: #374151;">Please request register vendor follow as <strong>"${data.requestNumber}"</strong></p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">Vendor Name:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Address:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Contact PIC:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Email:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Tel:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">For support product/process:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Purchase Frequency:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <p style="margin: 0 0 24px 0;">
                You can access the system through this link: <a href="${data.systemLink}" style="color: #d32f2f; text-decoration: underline; font-weight: 500;">${data.systemLink}</a>
            </p>

            <hr style="border: none; border-top: 1px dashed #fee2e2; margin: 32px 0;">

            <div style="background-color: #f3f4f6; border-left: 4px solid #4b5563; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #1f2937;">สถานะ : อยู่ระหว่างการตรวจสอบการลงทะเบียนผู้ขาย</p>
                <p style="margin: 0; color: #374151;">โปรดตรวจสอบการลงทะเบียนผู้ขายตามหมายเลข <strong>"${data.requestNumber}"</strong></p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">ชื่อเวนเดอร์:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ที่อยู่:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ชื่อผู้ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">อีเมล:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">เบอร์ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 32px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #fee2e2; font-size: 14px;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827;">Thank you & Best regards,</p>
                <p style="margin: 0 0 4px 0; color: #d32f2f; font-weight: 600;">${data.picName} <span style="color: #6b7280; font-weight: normal;">(#Tel. ${data.picTel})</span></p>
            </div>
        </div>
    </div>
    `;
};

export const emailReject2Template = (data: MailTemplateData) => {
    return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.6; max-width: 800px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #fee2e2;">
        <div style="background-color: #dc2626; height: 6px; width: 100%;"></div>
        <div style="padding: 32px;">

            <p style="margin: 0 0 20px 0; font-size: 15px;">Dear : &nbsp;&nbsp;&nbsp;<span style="color: #d32f2f; font-weight: 600;">${data.recipientName || 'PO PIC'}</span></p>
            
            <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #be123c;">Status: Under Recheck register vendor</p>
                <p style="margin: 0 0 8px 0; color: #881337;">Please recheck register vendor follow as <strong>"${data.requestNumber}"</strong>.</p>
                <p style="margin: 0; background: #ffe4e6; padding: 8px; border-radius: 4px; color: #9f1239; font-weight: 500;">Reason: ${data.remarkEN}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">Vendor Name:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Address:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Contact PIC:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Email:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Tel:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">For support product/process:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Purchase Frequency:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <p style="margin: 0 0 24px 0;">
                You can access the system through this link: <a href="${data.systemLink}" style="color: #d32f2f; text-decoration: underline; font-weight: 500;">${data.systemLink}</a>
            </p>

            <hr style="border: none; border-top: 1px dashed #fee2e2; margin: 32px 0;">

            <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #be123c;">สถานะ : อยู่ระหว่างการตรวจสอบการลงทะเบียนผู้ขาย</p>
                <p style="margin: 0 0 8px 0; color: #881337;">โปรดตรวจสอบลงทะเบียนผู้ขายตามหมายเลข <strong>"${data.requestNumber}"</strong>.</p>
                <p style="margin: 0; background: #ffe4e6; padding: 8px; border-radius: 4px; color: #9f1239; font-weight: 500;">สาเหตุ: ${data.remarkTH}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">ชื่อเวนเดอร์:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ที่อยู่:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ชื่อผู้ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">อีเมล:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">เบอร์ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 32px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #fee2e2; font-size: 14px;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827;">Thank you & Best regards,</p>
                <p style="margin: 0 0 4px 0; color: #d32f2f; font-weight: 600;">${data.picName} <span style="color: #6b7280; font-weight: normal;">(#Tel. ${data.picTel})</span></p>
            </div>
        </div>
    </div>
    `;
};

// ---------------------------------------------------------
// 1. Email to PM Mgr.
// ---------------------------------------------------------
export const emailToPMMgrTemplate = (data: MailTemplateData) => `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.6; max-width: 800px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #fee2e2;">
        <div style="background-color: #d32f2f; height: 6px; width: 100%;"></div>
        <div style="padding: 32px;">

            <p style="margin: 0 0 20px 0; font-size: 15px;">Dear : &nbsp;&nbsp;&nbsp;<span style="color: #d32f2f; font-weight: 600;">${data.recipientName || 'PO Mgr'}</span></p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #d32f2f; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #b91c1c;">Status: Under approval register vendor</p>
                <p style="margin: 0; color: #7f1d1d;">Please approve register vendor follow as <strong>"${data.requestNumber}"</strong></p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">Vendor Name:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Address:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Contact PIC:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Email:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Tel:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">For support product/process:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Purchase Frequency:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <p style="margin: 0 0 24px 0;">
                You can access the system through this link: <a href="${data.systemLink}" style="color: #d32f2f; text-decoration: underline; font-weight: 500;">${data.systemLink}</a>
            </p>

            <hr style="border: none; border-top: 1px dashed #fee2e2; margin: 32px 0;">

            <div style="background-color: #fef2f2; border-left: 4px solid #d32f2f; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #b91c1c;">สถานะ : อยู่ระหว่างการอนุมัติการลงทะเบียนผู้ขาย</p>
                <p style="margin: 0; color: #7f1d1d;">โปรดอนุมัติการลงทะเบียนผู้ขายตามหมายเลข <strong>"${data.requestNumber}"</strong>.</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">ชื่อเวนเดอร์:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ที่อยู่:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ชื่อผู้ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">อีเมล:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">เบอร์ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 32px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #fee2e2; font-size: 14px;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827;">Thank you & Best regards,</p>
                <p style="margin: 0 0 4px 0; color: #d32f2f; font-weight: 600;">${data.picName} <span style="color: #6b7280; font-weight: normal;">(#Tel. ${data.picTel})</span></p>
            </div>
        </div>
    </div>`;

// ---------------------------------------------------------
// 2. Email to PM GM.
// ---------------------------------------------------------
export const emailToPMGMTemplate = (data: MailTemplateData) =>
    emailToPMMgrTemplate({ ...data, recipientName: data.recipientName || 'PO GM' });

// ---------------------------------------------------------
// 3. Email to MD.
// ---------------------------------------------------------
export const emailToMDTemplate = (data: MailTemplateData) =>
    emailToPMMgrTemplate({ ...data, recipientName: data.recipientName || 'MD' });

// ---------------------------------------------------------
// 4. Email to Account PIC
// ---------------------------------------------------------
export const emailToAccountPICTemplate = (data: MailTemplateData) =>
    emailToPMMgrTemplate({ ...data, recipientName: data.recipientName || 'ACC PIC' });

export const emailCompleteTemplate = (data: MailTemplateData) => {
    return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.6; max-width: 800px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #fee2e2;">
        <div style="background-color: #10b981; height: 6px; width: 100%;"></div>
        <div style="padding: 32px;">

            <p style="margin: 0 0 20px 0; font-size: 15px;">Dear : &nbsp;&nbsp;&nbsp;<span style="color: #d32f2f; font-weight: 600;">${data.userName}</span></p>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #047857; font-size: 16px;">✅ Status: Complete register vendor.</p>
                <p style="margin: 0; color: #065f46;">Complete register vendor follow as <strong>"${data.requestNumber}"</strong></p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">Vendor Name:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Address:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Contact PIC:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Email:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Tel:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">For support product/process:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Purchase Frequency:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: center; border: 1px dashed #d1d5db;">
                <p style="margin: 0; font-weight: 600; color: #374151;">Vendor code</p>
                <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: bold; color: #d32f2f; letter-spacing: 1px;">${data.vendorCode}</p>
            </div>

            <p style="margin: 0 0 24px 0;">
                You can access the system through this link: <a href="${data.systemLink}" style="color: #d32f2f; text-decoration: underline; font-weight: 500;">${data.systemLink}</a>
            </p>

            <hr style="border: none; border-top: 1px dashed #fee2e2; margin: 32px 0;">

            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #047857; font-size: 16px;">✅ สถานะ : การลงทะเบียนผู้ขายสำเร็จ</p>
                <p style="margin: 0; color: #065f46;">การลงทะเบียนผู้ขายตามหมายเลข <strong>"${data.requestNumber}"</strong> สำเร็จเรียบร้อยแล้ว</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">ชื่อเวนเดอร์:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ที่อยู่:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ชื่อผู้ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">อีเมล:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">เบอร์ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 32px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #fee2e2; font-size: 14px;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827;">Thank you & Best regards,</p>
                <p style="margin: 0 0 4px 0; color: #d32f2f; font-weight: 600;">${data.picName} <span style="color: #6b7280; font-weight: normal;">(#Tel. ${data.picTel})</span></p>
            </div>
        </div>
    </div>
    `;
};

export const emailIncompleteTemplate = (data: MailTemplateData) => {
    const reasonsHtml = (data.reasons || []).map(reason =>
        `<div style="background: #ffe4e6; padding: 8px 12px; border-radius: 4px; color: #9f1239; font-weight: 500; margin-bottom: 6px;">• ${reason}</div>`
    ).join('');

    return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.6; max-width: 800px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #fee2e2;">
        <div style="background-color: #dc2626; height: 6px; width: 100%;"></div>
        <div style="padding: 32px;">

            <p style="margin: 0 0 20px 0; font-size: 15px;">Dear : &nbsp;&nbsp;&nbsp;<span style="color: #d32f2f; font-weight: 600;">${data.userName}</span></p>
            
            <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #be123c; font-size: 16px;">❌ Status: Incomplete register vendor</p>
                <p style="margin: 0 0 12px 0; color: #881337;">Incomplete register vendor follow as <strong>"${data.requestNumber}"</strong></p>
                
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #9f1239; font-size: 13px;">Reason(s):</p>
                ${reasonsHtml}
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">Vendor Name:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Address:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Contact PIC:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Email:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Tel:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">For support product/process:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">Purchase Frequency:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <p style="margin: 0 0 24px 0;">
                You can access the system through this link: <a href="${data.systemLink}" style="color: #d32f2f; text-decoration: underline; font-weight: 500;">${data.systemLink}</a>
            </p>

            <hr style="border: none; border-top: 1px dashed #fee2e2; margin: 32px 0;">

            <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #be123c; font-size: 16px;">❌ สถานะ : การลงทะเบียนผู้ขายไม่สำเร็จ</p>
                <p style="margin: 0; color: #881337;">การลงทะเบียนผู้ขายตามหมายเลข <strong>"${data.requestNumber}"</strong> ไม่สำเร็จ</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">ชื่อเวนเดอร์:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ที่อยู่:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.address}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ชื่อผู้ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.contactPic}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">อีเมล:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.email}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">เบอร์ติดต่อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.tel}</td></tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 32px;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="width: 240px; padding: 10px 0; color: #6b7280;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 10px 0; font-weight: 500; color: #111827;">${data.purchaseFrequency}</td></tr>
            </table>

            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #fee2e2; font-size: 14px;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827;">Thank you & Best regards,</p>
                <p style="margin: 0 0 4px 0; color: #d32f2f; font-weight: 600;">${data.picName} <span style="color: #6b7280; font-weight: normal;">(#Tel. ${data.picTel})</span></p>
            </div>
        </div>
    </div>
    `;
};
