export type RequestRegisterVendorData = {
    requestNumber: string;
    vendorName: string;
    address: string;
    contactPic: string;
    email: string;
    tel: string;
    supportProduct: string;
    purchaseFrequency: string;
    systemLink: string;
    userName: string;
    userTel: string;
};

export const emailRequestRegisterVendorTemplate = (data: RequestRegisterVendorData) => {
    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.5; max-width: 800px;">
        <p style="margin: 0 0 16px 0;">Dear : &nbsp;&nbsp;&nbsp;PO PIC</p>
        
        <p style="margin: 0 0 16px 0;">
            Status: Under request register vendor<br>
            Please request register vendor follow as "${data.requestNumber}" in the program within 2 weeks.
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">Vendor Name:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">Address:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">Contact PIC :</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">Email:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">Tel:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">For support product / process:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">Purchase Frequency:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <p style="margin: 0 0 16px 0;">
            You can access the system through this link <a href="${data.systemLink}" style="color: blue; text-decoration: none;">${data.systemLink}</a>
        </p>

        <p style="margin: 0 0 16px 0;">
            สถานะ : อยู่ระหว่างการดำเนินการลงทะเบียนผู้ขาย<br>
            โปรดร้องขอลงทะเบียนผู้ขายตามหมายเลข "${data.requestNumber}" ในโปรแกรมภายใน 2 สัปดาห์
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">ชื่อเวนเดอร์:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">ที่อยู่:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">ชื่อผู้ติดต่อ:</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">อีเมล:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">เบอร์ติดต่อ:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr><td style="width: 220px; padding: 2px 0;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <div style="font-size: 14px; font-weight: bold;">
            <p style="margin: 0 0 4px 0;">Thank you & Best regards,</p>
            <p style="margin: 0 0 4px 0; color: blue; font-weight: normal;">${data.userName} (#Tel. ${data.userTel})</p>
            <p style="margin: 0; font-weight: normal;">Requester</p>
        </div>
    </div>
    `;
};

export type VendorDocumentRequestData = {
    vendorEmail: string;     // อีเมลของ Vendor
    ccEmail: string;         // อีเมล CC (PO PIC, SubPIC)
    topicRef: string;        // เช่น "Register_Selection-YY-N000"
    isNewSupplier: boolean;  // true = For register new supplier, false = For re-register supplier
    picName: string;         // ชื่อผู้ส่ง (PO PIC Name)
    picTel: string;          // เบอร์โทรผู้ส่ง
};

export const emailVendorDocumentRequestTemplate = (data: VendorDocumentRequestData) => {
    // กำหนดข้อความ Topic ตามเงื่อนไขว่าเป็นรายใหม่หรือรายเก่า
    const supplierStatusText = data.isNewSupplier
        ? "For register new supplier"
        : "For re-register supplier";

    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.5; max-width: 800px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr>
                <td style="width: 60px; padding: 2px 0; color: blue;">Email to:</td>
                <td style="padding: 2px 0; color: blue;">${data.vendorEmail}</td>
            </tr>
            <tr>
                <td style="padding: 2px 0; color: blue;">CC:</td>
                <td style="padding: 2px 0; color: blue;">${data.ccEmail}</td>
            </tr>
            <tr>
                <td style="padding: 12px 0 2px 0;">Topic</td>
                <td style="padding: 12px 0 2px 0;">Document for ${data.topicRef} - <strong>${supplierStatusText}</strong></td>
            </tr>
        </table>

        <p style="margin: 0 0 24px 0; font-weight: bold;">** สามารถอ่านภาษาไทยด้านล่างได้ค่ะ **</p>

        <p style="margin: 0 0 16px 0;">Dear Supplier,</p>
        
        <p style="margin: 0 0 8px 0;">
            As Furukawa FITEL (Thailand) Co., Ltd. has never contacted or used the service from your company, it is necessary to request more information to register a new supplier. Including informing about company policies such as Environmental Policy, Quality Policy and Export Control Policy. Therefore, we kindly request the following documents,
        </p>
        
        <ol style="margin: 0 0 16px 0; padding-left: 24px;">
            <li style="margin-bottom: 4px;">Company certificate (Limited Company or Public Company Limited) and Vat License ( Por Por 20 )</li>
            <li style="margin-bottom: 4px;">Company profile</li>
            <li style="margin-bottom: 4px;">Other certifications, such as ISO9001, ISO14000, catalog main product, etc.</li>
            <li style="margin-bottom: 4px;">Copy of Book banking</li>
            <li style="margin-bottom: 4px;">Reply to " MFG survey document " in Excel file format within 7 days.</li>
            <li style="margin-bottom: 4px;">Reply to " Reply Form document " in Pdf file format within 7 days.</li>
        </ol>

        <p style="margin: 0 0 24px 0;">
            You can see more information in attached file.<br>
            If you have any comments, please let me know.
        </p>

        <p style="margin: 0 0 24px 0;">
            Remark : This message (including any attachments) contains confidential information intended for a specific individual and purpose, and is protected by law. If you are not the intended recipient, you should delete this message.<br>
            Any disclosure, copying, or distribution of this message, or the taking of any action based on it, is strictly prohibited.
        </p>

        <hr style="border: none; border-top: 1px dashed #000; margin: 24px 0;">

        <p style="margin: 0 0 16px 0; font-weight: bold;">เรียน ผู้ผลิตและผู้จัดจำหน่าย</p>
        
        <p style="margin: 0 0 8px 0;">
            เนื่องด้วยทางบริษัท ฟูรูกาวา ไฟเทล (ประเทศไทย) จำกัด ยังไม่เคยติดต่อใช้บริการร่วมกับบริษัทของคุณ จึงจำเป็นต้องมีการร้องขอข้อมูลที่จำเป็นเพื่อใช้ในการลงทะเบียนผู้ผลิต / ผู้จัดจำหน่ายใหม่ รวมถึงการแจ้งข้อมูลเกี่ยวกับนโยบายของบริษัท ได้แก่ นโยบายด้านสิ่งแวดล้อม ด้านคุณภาพ และด้านการควบคุมการส่งออก ดังนั้นทางเราจึงรบกวนขอเอกสารต่าง ๆ ดังนี้
        </p>
        
        <ol style="margin: 0 0 16px 0; padding-left: 24px;">
            <li style="margin-bottom: 4px;">หนังสือรับรองนิติบุคคล, ภพ.20</li>
            <li style="margin-bottom: 4px;">Company profile</li>
            <li style="margin-bottom: 4px;">เอกสารรับรองอื่นๆ เช่น ISO9001, ISO14000, แคตตาล็อค ฯลฯ</li>
            <li style="margin-bottom: 4px;">สำเนาหน้า Book banking</li>
            <li style="margin-bottom: 4px;">ตอบกลับเอกสาร " MFG survey " ในรูปแบบไฟล์ Excel ภายใน 7 วัน</li>
            <li style="margin-bottom: 4px;">ตอบกลับเอกสาร " Reply Form " ในรูปแบบไฟล์ pdf ภายใน 7 วัน</li>
        </ol>

        <p style="margin: 0 0 24px 0;">
            รบกวนดูรายละเอียดเพิ่มเติมจากไฟล์แนบ<br>
            หากมีข้อสงสัย โปรดแจ้งกลับมาให้เราทราบค่ะ
        </p>

        <div style="font-size: 14px; font-weight: bold;">
            <p style="margin: 0 0 4px 0;">Thank you & Best regards,</p>
            <p style="margin: 0 0 4px 0; color: blue; font-weight: normal;">${data.picName} (#Tel. ${data.picTel})</p>
        </div>
    </div>
    `;
};

export type ExternalSubmitGPRBData = {
    vendorEmail: string;     // [Email of vendor]
    ccEmail: string;         // [Email of PO PIC], [Email of SubPIC]
    requestNumber: string;   // เช่น "Register_Selection-YY-N000"
    picName: string;         // ชื่อ PO PIC
    picTel: string;          // เบอร์โทร PO PIC
};

export const emailExternalSubmitGPRBTemplate = (data: ExternalSubmitGPRBData) => {
    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.5; max-width: 800px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr>
                <td style="width: 60px; padding: 2px 0; color: blue;">Email to:</td>
                <td style="padding: 2px 0; color: blue;">${data.vendorEmail}</td>
            </tr>
            <tr>
                <td style="padding: 2px 0; color: blue;">CC:</td>
                <td style="padding: 2px 0; color: blue;">${data.ccEmail}</td>
            </tr>
            <tr>
                <td style="padding: 12px 0 2px 0; vertical-align: top;">Topic</td>
                <td style="padding: 12px 0 2px 0;">
                    [Request Submit] Please Submit register vendor follow as "${data.requestNumber}" - General Purchase Specification Form B
                </td>
            </tr>
        </table>

        <p style="margin: 0 0 16px 0;">Dear Supplier,</p>
        
        <p style="margin: 0 0 24px 0;">
            Status: Under Submit register vendor<br>
            Since you <span style="color: red; font-weight: bold; text-decoration: underline;">Not Accept</span> the General Purchase Specification Form A document.<br>
            Please submit register vendor follow as "${data.requestNumber}". General Purchase Specification Form B and reply within 7 days.
        </p>

        <p style="margin: 0 0 24px 0;">
            สถานะ : อยู่ระหว่างการดำเนินการลงทะเบียนผู้ขาย<br>
            เนื่องจากทางผู้ขาย <span style="color: red; font-weight: bold; text-decoration: underline;">ไม่ยอมรับ</span> ข้อกำหนดตามเอกสาร General Purchase Specification Form A<br>
            โปรดกรอกข้อมูล ลงทะเบียนผู้ขายตามหมายเลข "${data.requestNumber}" สำหรับเอกสาร General Purchase Specification Form B และตอบกลับภายใน 7 วัน
        </p>

        <div style="font-size: 14px; font-weight: bold;">
            <p style="margin: 0 0 4px 0;">Thank you & Best regards,</p>
            <p style="margin: 0 0 4px 0; color: blue; font-weight: normal;">${data.picName} (#Tel. ${data.picTel})</p>
        </div>
    </div>
    `;
};

export type CheckerApproverGPRCData = {
    toEmail: string;         // [Email to user]
    ccEmail: string;         // [Email of PO PIC], [Email of SubPIC]
    requestNumber: string;   // เช่น "Register_Selection-YY-N000"
    userName: string;        // ชื่อ USER สำหรับใส่หลัง Dear :
    vendorName: string;
    address: string;
    contactPic: string;
    email: string;
    tel: string;
    supportProduct: string;
    purchaseFrequency: string;
    systemLink: string;      // ลิงก์เข้าระบบ
    picName: string;         // ชื่อ PO PIC (ลายเซ็น)
    picTel: string;          // เบอร์โทร PO PIC (ลายเซ็น)
};

export const emailCheckerApproverGPRCTemplate = (data: CheckerApproverGPRCData) => {
    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.5; max-width: 800px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr>
                <td style="width: 50px; padding: 2px 0; color: blue;">TO:</td>
                <td style="padding: 2px 0; color: blue;">${data.toEmail}</td>
            </tr>
            <tr>
                <td style="padding: 2px 0; color: blue;">CC:</td>
                <td style="padding: 2px 0; color: blue;">${data.ccEmail}</td>
            </tr>
            <tr>
                <td style="padding: 16px 0 2px 0; vertical-align: top;">Topic</td>
                <td style="padding: 16px 0 2px 0;">
                    [Request Approve] Please approve register vendor follow as "${data.requestNumber}" - General Purchase Specification Form C
                </td>
            </tr>
        </table>

        <p style="margin: 0 0 16px 0;">Dear : &nbsp;&nbsp;&nbsp;<span style="color: blue;">${data.userName}</span></p>
        
        <p style="margin: 0 0 16px 0;">
            Status: Under Approve register vendor<br>
            Please approve register vendor follow as "${data.requestNumber}" . General Purchase Specification Form C
        </p>

        <p style="margin: 0 0 16px 0;">
            The vendor has not accepted the General Purchase Specification Form A. Please review and approve.
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">Vendor Name:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">Address:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">Contact PIC :</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">Email:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">Tel :</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">For support product / process:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">Purchase Frequency:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <p style="margin: 0 0 16px 0;">
            You can access the system through this link <a href="${data.systemLink}" style="color: red; text-decoration: none;">${data.systemLink}</a>
        </p>

        <p style="margin: 0 0 16px 0;">
            สถานะ : อยู่ระหว่างการอนุมัติการลงทะเบียนผู้ขาย<br>
            โปรดอนุมัติลงทะเบียนผู้ขายตามหมายเลข "${data.requestNumber}". เอกสาร General Purchase Specification Form C.
        </p>

        <p style="margin: 0 0 16px 0;">
            เวนเดอร์ไม่ยอมรับบางเงื่อนไขของเอกสาร General Purchase Specification Form A. โปรดตรวจสอบและอนุมัติ
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">ชื่อเวนเดอร์:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">ที่อยู่:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">ชื่อผู้ติดต่อ:</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">อีเมล:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">เบอร์ติดต่อ:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr><td style="width: 220px; padding: 2px 0;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <div style="font-size: 14px; font-weight: bold;">
            <p style="margin: 0 0 4px 0;">Thank you & Best regards,</p>
            <p style="margin: 0 0 4px 0; color: blue; font-weight: normal;">${data.picName} (#Tel. ${data.picTel})</p>
        </div>
    </div>
    `;
};

export type AfterCheckerApproverGPRCData = {
    toEmail: string;         // [Email to PIC Next step]
    ccEmail: string;         // [Email of PO PIC], [Email of SubPIC]
    requestNumber: string;   // เช่น "Register_Selection-YY-N000"
    picNextStepName: string; // ชื่อ PIC NEXT STEP สำหรับใส่หลัง Dear :
    vendorName: string;
    address: string;
    contactPic: string;
    email: string;
    tel: string;
    supportProduct: string;
    purchaseFrequency: string;
    systemLink: string;      // ลิงก์เข้าระบบ
    picName: string;         // ชื่อ PO PIC (ลายเซ็น)
    picTel: string;          // เบอร์โทร PO PIC (ลายเซ็น)
};

export const emailAfterCheckerApproverGPRCTemplate = (data: AfterCheckerApproverGPRCData) => {
    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.5; max-width: 800px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr>
                <td style="width: 50px; padding: 2px 0; color: blue;">TO:</td>
                <td style="padding: 2px 0; color: blue;">${data.toEmail}</td>
            </tr>
            <tr>
                <td style="padding: 2px 0; color: blue;">CC:</td>
                <td style="padding: 2px 0; color: blue;">${data.ccEmail}</td>
            </tr>
            <tr>
                <td style="padding: 16px 0 2px 0; vertical-align: top;">Topic</td>
                <td style="padding: 16px 0 2px 0;">
                    [Request Approve] Please approve register vendor follow as "${data.requestNumber}" - General Purchase Specification Form C
                </td>
            </tr>
        </table>

        <p style="margin: 0 0 16px 0;">Dear : &nbsp;&nbsp;&nbsp;<span style="color: blue;">${data.picNextStepName}</span></p>
        
        <p style="margin: 0 0 16px 0;">
            Status: Under Approve register vendor<br>
            Please approve register vendor follow as "${data.requestNumber}" . General Purchase Specification Form C
        </p>

        <p style="margin: 0 0 16px 0;">
            The vendor has not accepted the General Purchase Specification Form A. Please review and approve.
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">Vendor Name:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">Address:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">Contact PIC :</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">Email:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">Tel :</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">For support product / process:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">Purchase Frequency:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <p style="margin: 0 0 16px 0;">
            You can access the system through this link <a href="${data.systemLink}" style="color: red; text-decoration: none;">${data.systemLink}</a>
        </p>

        <p style="margin: 0 0 16px 0;">
            สถานะ : อยู่ระหว่างการอนุมัติการลงทะเบียนผู้ขาย<br>
            โปรดอนุมัติลงทะเบียนผู้ขายตามหมายเลข "${data.requestNumber}". เอกสาร General Purchase Specification Form C.
        </p>

        <p style="margin: 0 0 16px 0;">
            เวนเดอร์ไม่ยอมรับบางเงื่อนไขของเอกสาร General Purchase Specification Form A. โปรดตรวจสอบและอนุมัติ
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">ชื่อเวนเดอร์:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">ที่อยู่:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">ชื่อผู้ติดต่อ:</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">อีเมล:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">เบอร์ติดต่อ:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr><td style="width: 220px; padding: 2px 0;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <div style="font-size: 14px; font-weight: bold;">
            <p style="margin: 0 0 4px 0;">Thank you & Best regards,</p>
            <p style="margin: 0 0 4px 0; color: blue; font-weight: normal;">${data.picName} (#Tel. ${data.picTel})</p>
        </div>
    </div>
    `;
};

export type RejectEmail1Data = {
    toEmail: string;         // [Email of PO PIC]
    ccEmailLine1: string;    // [Email of SubPIC]
    ccEmailLine2: string;    // [Email to user] [Email to PIC previouse step]
    requestNumber: string;   // เช่น "Register_Selection-YY-N000"
    remarkEN: string;        // สาเหตุ (ภาษาอังกฤษ)
    remarkTH: string;        // สาเหตุ (ภาษาไทย)
    vendorName: string;
    address: string;
    contactPic: string;
    email: string;
    tel: string;
    supportProduct: string;
    purchaseFrequency: string;
    systemLink: string;      // ลิงก์เข้าระบบ
    picName: string;         // ชื่อ PIC (ลายเซ็น)
    picTel: string;          // เบอร์โทร PIC (ลายเซ็น)
};

export const emailReject1Template = (data: RejectEmail1Data) => {
    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.5; max-width: 800px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr>
                <td style="width: 60px; padding: 2px 0; color: blue;">Email to:</td>
                <td style="padding: 2px 0; color: blue;">${data.toEmail}</td>
            </tr>
            <tr>
                <td style="padding: 2px 0; color: blue; vertical-align: top;">CC:</td>
                <td style="padding: 2px 0; color: blue;">
                    ${data.ccEmailLine1}<br>
                    ${data.ccEmailLine2}
                </td>
            </tr>
            <tr>
                <td style="padding: 16px 0 2px 0; vertical-align: top;">Topic</td>
                <td style="padding: 16px 0 2px 0;">
                    [REJECT] Please recheck register vendor follow as "${data.requestNumber}" - General Purchase Specification Form B
                </td>
            </tr>
        </table>

        <p style="margin: 0 0 16px 0;">Dear : &nbsp;&nbsp;&nbsp;<span style="color: blue;">PO PIC</span></p>
        
        <p style="margin: 0 0 16px 0;">
            <span style="color: red;">Status: [REJECT] register vendor</span><br>
            Please recheck register vendor follow as "${data.requestNumber}" . General Purchase Specification Form B<br>
            Reason: &nbsp;&nbsp;&nbsp;<span style="color: blue;">${data.remarkEN}</span>
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">Vendor Name:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">Address:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">Contact PIC :</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">Email:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">Tel:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">For support product / process:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">Purchase Frequency:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <p style="margin: 0 0 16px 0;">
            You can access the system through this link <a href="${data.systemLink}" style="color: red; text-decoration: none;">${data.systemLink}</a>
        </p>

        <p style="margin: 0 0 16px 0;">
            <span style="color: red;">สถานะ : [ปฏิเสธการตรวจสอบ]การลงทะเบียนผู้ขาย</span><br>
            โปรดตรวจสอบลงทะเบียนผู้ขายตามหมายเลข "${data.requestNumber}". เอกสาร General Purchase Specification Form B. อีกครั้ง<br>
            สาเหตุ: &nbsp;&nbsp;&nbsp;<span>${data.remarkTH}</span>
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">ชื่อเวนเดอร์:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">ที่อยู่:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">ชื่อผู้ติดต่อ:</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">อีเมล:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">เบอร์ติดต่อ:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr><td style="width: 220px; padding: 2px 0;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <div style="font-size: 14px; font-weight: bold;">
            <p style="margin: 0 0 4px 0;">Thank you & Best regards,</p>
            <p style="margin: 0 0 4px 0; color: blue; font-weight: normal;">${data.picName} (#Tel. ${data.picTel})</p>
        </div>
    </div>
    `;
};

export type EmailToCheckerPICData = {
    toEmail: string;         // [PO CHECKER PIC]
    ccEmail: string;         // [Email to user], [Email of PO PIC], [Email of SubPIC]
    requestNumber: string;   // เช่น "Register_Selection-YY-N000"
    vendorName: string;
    address: string;
    contactPic: string;
    email: string;
    tel: string;
    supportProduct: string;
    purchaseFrequency: string;
    systemLink: string;      // ลิงก์เข้าระบบ
    picName: string;         // ชื่อ PO PIC (ลายเซ็น)
    picTel: string;          // เบอร์โทร PO PIC (ลายเซ็น)
};

export const emailToCheckerPICTemplate = (data: EmailToCheckerPICData) => {
    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.5; max-width: 800px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr>
                <td style="width: 60px; padding: 2px 0; color: blue;">Email to:</td>
                <td style="padding: 2px 0; color: blue;">${data.toEmail}</td>
            </tr>
            <tr>
                <td style="padding: 2px 0; color: blue;">CC:</td>
                <td style="padding: 2px 0; color: blue;">${data.ccEmail}</td>
            </tr>
            <tr>
                <td style="padding: 16px 0 2px 0; vertical-align: top;">Topic</td>
                <td style="padding: 16px 0 2px 0;">
                    [Request Check] Please request check register vendor follow as "${data.requestNumber}"
                </td>
            </tr>
        </table>

        <p style="margin: 0 0 16px 0;">Dear : &nbsp;&nbsp;&nbsp;PO CHECKER</p>
        
        <p style="margin: 0 0 16px 0;">
            Status: Under checking register vendor<br>
            Please request register vendor follow as "${data.requestNumber}"
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">Vendor Name:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">Address:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">Contact PIC :</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">Email:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">Tel:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">For support product / process:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">Purchase Frequency:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <p style="margin: 0 0 16px 0;">
            You can access the system through this link <a href="${data.systemLink}" style="color: red; text-decoration: none;">${data.systemLink}</a>
        </p>

        <p style="margin: 0 0 16px 0;">
            สถานะ : อยู่ระหว่างการตรวจสอบการลงทะเบียนผู้ขาย<br>
            โปรดตรวจสอบการลงทะเบียนผู้ขายตามหมายเลข "${data.requestNumber}".
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">ชื่อเวนเดอร์:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">ที่อยู่:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">ชื่อผู้ติดต่อ:</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">อีเมล:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">เบอร์ติดต่อ:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr><td style="width: 220px; padding: 2px 0;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <div style="font-size: 14px; font-weight: bold;">
            <p style="margin: 0 0 4px 0;">Thank you & Best regards,</p>
            <p style="margin: 0 0 4px 0; color: blue; font-weight: normal;">${data.picName} (#Tel. ${data.picTel})</p>
        </div>
    </div>
    `;
};

export type RejectEmail2Data = {
    toEmail: string;         // [Email of PO PIC]
    ccEmail: string;         // [PO CHECKER PIC], [Email to user], [Email of PO PIC], [Email of SubPIC]
    requestNumber: string;   // เช่น "Register_Selection-YY-N000"
    remarkEN: string;        // สาเหตุ (ภาษาอังกฤษ)
    remarkTH: string;        // สาเหตุ (ภาษาไทย)
    vendorName: string;
    address: string;
    contactPic: string;
    email: string;
    tel: string;
    supportProduct: string;
    purchaseFrequency: string;
    systemLink: string;      // ลิงก์เข้าระบบ
    picName: string;         // ชื่อ PIC (ลายเซ็น)
    picTel: string;          // เบอร์โทร PIC (ลายเซ็น)
};

export const emailReject2Template = (data: RejectEmail2Data) => {
    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.5; max-width: 800px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr>
                <td style="width: 60px; padding: 2px 0; color: blue;">Email to:</td>
                <td style="padding: 2px 0; color: blue;">${data.toEmail}</td>
            </tr>
            <tr>
                <td style="padding: 2px 0; color: blue; vertical-align: top;">CC:</td>
                <td style="padding: 2px 0; color: blue;">${data.ccEmail}</td>
            </tr>
            <tr>
                <td style="padding: 16px 0 2px 0; vertical-align: top;">Topic</td>
                <td style="padding: 16px 0 2px 0;">
                    [Request Recheck] Please recheck register vendor follow as "${data.requestNumber}"
                </td>
            </tr>
        </table>

        <p style="margin: 0 0 16px 0;">Dear : &nbsp;&nbsp;&nbsp;PO PIC</p>
        
        <p style="margin: 0 0 16px 0;">
            Status: Under Recheck register vendor<br>
            Please recheck register vendor follow as "${data.requestNumber}".<br>
            <span style="color: red;">Reason: &nbsp;&nbsp;&nbsp;${data.remarkEN}</span>
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">Vendor Name:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">Address:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">Contact PIC :</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">Email:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">Tel:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">For support product / process:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">Purchase Frequency:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <p style="margin: 0 0 16px 0;">
            You can access the system through this link <a href="${data.systemLink}" style="color: red; text-decoration: none;">${data.systemLink}</a>
        </p>

        <p style="margin: 0 0 16px 0;">
            สถานะ : อยู่ระหว่างการตรวจสอบการลงทะเบียนผู้ขาย<br>
            โปรดตรวจสอบลงทะเบียนผู้ขายตามหมายเลข "${data.requestNumber}".<br>
            <span style="color: red;">สาเหตุ: &nbsp;&nbsp;&nbsp;${data.remarkTH}</span>
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">ชื่อเวนเดอร์:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">ที่อยู่:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">ชื่อผู้ติดต่อ:</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">อีเมล:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">เบอร์ติดต่อ:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr><td style="width: 220px; padding: 2px 0;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <div style="font-size: 14px; font-weight: bold;">
            <p style="margin: 0 0 4px 0;">Thank you & Best regards,</p>
            <p style="margin: 0 0 4px 0; color: blue; font-weight: normal;">${data.picName} (#Tel. ${data.picTel})</p>
        </div>
    </div>
    `;
};

export type ApprovalEmailData = {
    toEmail: string;
    ccEmail: string;
    requestNumber: string;
    vendorName: string;
    address: string;
    contactPic: string;
    email: string;
    tel: string;
    supportProduct: string;
    purchaseFrequency: string;
    systemLink: string;
    picName: string;
    picTel: string;
    recipientName?: string; // สำหรับ Account PIC ที่ชื่ออาจจะเปลี่ยนไปมา
};

// ---------------------------------------------------------
// 1. Email to PM Mgr.
// ---------------------------------------------------------
export const emailToPMMgrTemplate = (data: ApprovalEmailData) => `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.5; max-width: 800px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr><td style="width: 60px; padding: 2px 0; color: blue;">Email to:</td><td style="padding: 2px 0; color: blue;">${data.toEmail}</td></tr>
            <tr><td style="padding: 2px 0; color: blue; vertical-align: top;">CC:</td><td style="padding: 2px 0; color: blue;">${data.ccEmail}</td></tr>
            <tr><td style="padding: 16px 0 2px 0; vertical-align: top;">Topic</td><td style="padding: 16px 0 2px 0;">[Request Approval] Please approve register vendor follow as "${data.requestNumber}"</td></tr>
        </table>
        <p style="margin: 0 0 16px 0;">Dear : &nbsp;&nbsp;&nbsp;<span style="color: blue;">${data.recipientName || 'PO Mgr'}</span></p>
        <p style="margin: 0 0 16px 0;">Status: Under approval register vendor<br>Please approve register vendor follow as "${data.requestNumber}"</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">Vendor Name:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">Address:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">Contact PIC :</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">Email:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">Tel:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">For support product / process:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">Purchase Frequency:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>
        <p style="margin: 0 0 16px 0;">You can access the system through this link <a href="${data.systemLink}" style="color: red; text-decoration: none;">${data.systemLink}</a></p>
        <p style="margin: 0 0 16px 0;">สถานะ : อยู่ระหว่างการอนุมัติการลงทะเบียนผู้ขาย<br>โปรดอนุมัติการลงทะเบียนผู้ขายตามหมายเลข "${data.requestNumber}".</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">ชื่อเวนเดอร์:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">ที่อยู่:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">ชื่อผู้ติดต่อ:</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">อีเมล:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">เบอร์ติดต่อ:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr><td style="width: 220px; padding: 2px 0;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>
        <div style="font-size: 14px; font-weight: bold;">
            <p style="margin: 0 0 4px 0;">Thank you & Best regards,</p>
            <p style="margin: 0 0 4px 0; color: blue; font-weight: normal;">${data.picName} (#Tel. ${data.picTel})</p>
        </div>
    </div>`;

// ---------------------------------------------------------
// 2. Email to PM GM.
// ---------------------------------------------------------
export const emailToPMGMTemplate = (data: ApprovalEmailData) =>
    emailToPMMgrTemplate(data).replace('>PO Mgr<', '>PO GM<');
// โครงสร้างเหมือน Mgr ทุกประการ เปลี่ยนแค่ Dear: PO GM

// ---------------------------------------------------------
// 3. Email to MD.
// ---------------------------------------------------------
export const emailToMDTemplate = (data: ApprovalEmailData) =>
    emailToPMMgrTemplate(data).replace('>PO Mgr<', '><');
// โครงสร้างเหมือนกัน แต่เว้นว่างหลัง Dear : ไว้ตามในภาพ

// ---------------------------------------------------------
// 4. Email to Account PIC
// ---------------------------------------------------------
export const emailToAccountPICTemplate = (data: ApprovalEmailData) =>
    emailToPMMgrTemplate(data).replace('>PO Mgr<', `>${data.recipientName || 'ACC PIC'}<`);
// โครงสร้างเหมือนกัน แต่ใช้ตัวแปร recipientName แทน

export type EmailCompleteData = ApprovalEmailData & {
    vendorCode: string;
    userName: string; // สำหรับเติมหลัง Dear: User
};

export const emailCompleteTemplate = (data: EmailCompleteData) => {
    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.5; max-width: 800px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr><td style="width: 60px; padding: 2px 0; color: blue;">Email to:</td><td style="padding: 2px 0; color: blue;">${data.toEmail}</td></tr>
            <tr><td style="padding: 2px 0; color: blue; vertical-align: top;">CC:</td><td style="padding: 2px 0; color: blue;">${data.ccEmail}</td></tr>
            <tr><td style="padding: 16px 0 2px 0; vertical-align: top;">Topic</td><td style="padding: 16px 0 2px 0;">[Complete] Register vendor follow as "${data.requestNumber}"</td></tr>
        </table>
        
        <p style="margin: 0 0 16px 0;">Dear : &nbsp;&nbsp;&nbsp;<span style="color: blue;">${data.userName}</span></p>
        
        <p style="margin: 0 0 16px 0;">
            Status: Complete register vendor.<br>
            Complete register vendor follow as "${data.requestNumber}"
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">Vendor Name:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">Address:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">Contact PIC :</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">Email:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">Tel:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">For support product / process:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">Purchase Frequency:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <p style="margin: 0 0 16px 0; font-weight: bold; color: blue;">Vendor code: &nbsp;&nbsp;&nbsp;${data.vendorCode}</p>

        <p style="margin: 0 0 16px 0;">You can access the system through this link <a href="${data.systemLink}" style="color: red; text-decoration: none;">${data.systemLink}</a></p>

        <p style="margin: 0 0 16px 0;">สถานะ : การลงทะเบียนผู้ขายสำเร็จ<br>การลงทะเบียนผู้ขายตามหมายเลข "${data.requestNumber}" สำเร็จ</p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">ชื่อเวนเดอร์:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">ที่อยู่:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">ชื่อผู้ติดต่อ:</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">อีเมล:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">เบอร์ติดต่อ:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr><td style="width: 220px; padding: 2px 0;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <div style="font-size: 14px; font-weight: bold;">
            <p style="margin: 0 0 4px 0;">Thank you & Best regards,</p>
            <p style="margin: 0 0 4px 0; color: blue; font-weight: normal;">${data.picName} (#Tel. ${data.picTel})</p>
        </div>
    </div>
    `;
};

export type EmailIncompleteData = ApprovalEmailData & {
    userName: string;
    reasons: string[]; // ส่งสาเหตุเข้ามาเป็น Array เพื่อให้วนลูปแสดงผลกี่ข้อก็ได้
};

export const emailIncompleteTemplate = (data: EmailIncompleteData) => {
    // นำ Array เหตุผลมาแปลงเป็น HTML สีแดงทีละบรรทัด
    const reasonsHtml = data.reasons.map(reason =>
        `<p style="margin: 0; color: red;">Reason: &nbsp;&nbsp;&nbsp;${reason}</p>`
    ).join('');

    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.5; max-width: 800px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr><td style="width: 60px; padding: 2px 0; color: blue;">Email to:</td><td style="padding: 2px 0; color: blue;">${data.toEmail}</td></tr>
            <tr><td style="padding: 2px 0; color: blue; vertical-align: top;">CC:</td><td style="padding: 2px 0; color: blue;">${data.ccEmail}</td></tr>
            <tr><td style="padding: 16px 0 2px 0; vertical-align: top;">Topic</td><td style="padding: 16px 0 2px 0;">[Incomplete] Register vendor follow as "${data.requestNumber}"</td></tr>
        </table>
        
        <p style="margin: 0 0 16px 0;">Dear : &nbsp;&nbsp;&nbsp;<span style="color: blue;">${data.userName}</span></p>
        
        <p style="margin: 0 0 16px 0;">
            Status: Incomplete register vendor.<br>
            Incomplete register vendor follow as "${data.requestNumber}"
        </p>

        <div style="margin: 0 0 16px 0;">
            ${reasonsHtml}
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">Vendor Name:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">Address:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">Contact PIC :</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">Email:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">Tel:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">For support product / process:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">Purchase Frequency:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <p style="margin: 0 0 16px 0;">You can access the system through this link <a href="${data.systemLink}" style="color: red; text-decoration: none;">${data.systemLink}</a></p>

        <p style="margin: 0 0 16px 0;">สถานะ : การลงทะเบียนผู้ขายไม่สำเร็จ<br>การลงทะเบียนผู้ขายตามหมายเลข "${data.requestNumber}" ไม่สำเร็จ</p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="width: 220px; padding: 2px 0;">ชื่อเวนเดอร์:</td><td style="padding: 2px 0;">${data.vendorName}</td></tr>
            <tr><td style="padding: 2px 0;">ที่อยู่:</td><td style="padding: 2px 0;">${data.address}</td></tr>
            <tr><td style="padding: 2px 0;">ชื่อผู้ติดต่อ:</td><td style="padding: 2px 0;">${data.contactPic}</td></tr>
            <tr><td style="padding: 2px 0;">อีเมล:</td><td style="padding: 2px 0;">${data.email}</td></tr>
            <tr><td style="padding: 2px 0;">เบอร์ติดต่อ:</td><td style="padding: 2px 0;">${data.tel}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr><td style="width: 220px; padding: 2px 0;">สำหรับสนับสนุนผลิตภัณฑ์/กระบวนการ:</td><td style="padding: 2px 0;">${data.supportProduct}</td></tr>
            <tr><td style="padding: 2px 0;">ความถี่ในการสั่งซื้อ:</td><td style="padding: 2px 0;">${data.purchaseFrequency}</td></tr>
        </table>

        <div style="font-size: 14px; font-weight: bold;">
            <p style="margin: 0 0 4px 0;">Thank you & Best regards,</p>
            <p style="margin: 0 0 4px 0; color: blue; font-weight: normal;">${data.picName} (#Tel. ${data.picTel})</p>
        </div>
    </div>
    `;
};