import { RowDataPacket } from 'mysql2'
import { MySQLExecute } from '@businessData/dbExecute'
import sendEmail from '@src/config/sendEmail'
import {
    emailAfterCheckerApproverGPRCTemplate,
    emailExternalSubmitGPRBTemplate,
    emailCompleteTemplate,
    emailReject1Template,
    emailRequestRegisterVendorTemplate,
    emailToAccountPICTemplate,
    emailToMDTemplate,
    emailToPMGMTemplate,
    emailToPMMgrTemplate,
    emailVendorDocumentRequestTemplate,
    type MailTemplateData
} from '@src/config/mailTemplate'
import {
    excludeEmails,
    GROUP_CODE,
    inferStepCode,
    mergeUniqueEmails,
    normalizeEmail,
    normalizeText,
    parseCcEmails,
    resolveGroupCodeForStep,
    resolveRequestNumber,
} from './RegisterRequestWorkflowHelper'

export const getPeerCcEmailsByGroupCode = async (
    groupCode: string,
    excludeEmpCode?: string,
    excludeEmail?: string
): Promise<string[]> => {
    if (!groupCode) return []

    const targetGroup = String(groupCode || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, '')
    if (!targetGroup) return []

    const targetCompact = targetGroup.replace(/[^A-Z0-9]/g, '')
    const excludeEmp = String(excludeEmpCode || '').trim()

    const rowsSql = `
        SELECT empcode, empEmail, group_code, group_name
        FROM assignees_to
        WHERE (
            UPPER(TRIM(COALESCE(group_code, ''))) = '${targetGroup}'
            OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_') = '${targetGroup}'
            OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_code, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = '${targetCompact}'
            OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = '${targetCompact}'
        )
          AND INUSE = 1
        ORDER BY Assignees_id ASC
    `
    const rows = (await MySQLExecute.search(rowsSql)) as any[]

    const peerEmails = mergeUniqueEmails(
        rows
            .filter((row: any) => {
                const rowEmpCode = String(row?.empcode || '').trim()
                if (excludeEmp && rowEmpCode === excludeEmp) return false
                return true
            })
            .map((row: any) => normalizeEmail(row?.empEmail))
            .filter((email: string) => email && email !== normalizeEmail(excludeEmail))
    )

    return peerEmails
}

export const selectApprovalNotificationByStep = (
    step: any,
    baseEmailData: MailTemplateData,
    requestNumber: string
): { emailHtml: string; emailSubject: string } => {
    const stepCode = inferStepCode(step)
    const nextDesc = normalizeText(step?.DESCRIPTION)

    if (stepCode === 'PO_GM_APPROVAL' || nextDesc.includes('general manager')) {
        return {
            emailHtml: emailToPMGMTemplate(baseEmailData),
            emailSubject: `[Request Approval] Please approve register vendor "${requestNumber}" - PO GM Step`
        }
    }

    if (stepCode === 'PO_MGR_APPROVAL' || nextDesc.includes('manager') || nextDesc.includes('mgr')) {
        return {
            emailHtml: emailToPMMgrTemplate(baseEmailData),
            emailSubject: `[Request Approval] Please approve register vendor "${requestNumber}" - PO Mgr Step`
        }
    }

    if (stepCode === 'MD_APPROVAL' || nextDesc.includes('md') || nextDesc.includes('director')) {
        return {
            emailHtml: emailToMDTemplate(baseEmailData),
            emailSubject: `[Request Approval] Please approve register vendor "${requestNumber}" - MD Approval`
        }
    }

    if (stepCode === 'ACCOUNT_REGISTERED' || nextDesc.includes('account')) {
        return {
            emailHtml: emailToAccountPICTemplate({ ...baseEmailData, recipientName: 'Account PIC' }),
            emailSubject: `[Request Action] Please process register vendor "${requestNumber}" - Account Step`
        }
    }

    if (stepCode === 'DOC_CHECK' || nextDesc.includes('checker') || nextDesc.includes('check all document') || nextDesc.includes('check document')) {
        return {
            emailHtml: emailToPMMgrTemplate({ ...baseEmailData, recipientName: 'PO Checker' }),
            emailSubject: `[Request Check] Please check register vendor "${requestNumber}" - Document Step`
        }
    }

    return {
        emailHtml: emailToPMMgrTemplate({ ...baseEmailData, recipientName: 'Approver' }),
        emailSubject: `[Request Approval] Please process register vendor "${requestNumber}"`
    }
}

export const triggerCreationEmail = async (
    dataItem: any,
    vendorData: any,
    nextAssignee: any,
    insertedId: number,
    persistedRequestNumber?: string,
    assigneeGroupCode?: string
) => {
    //ทำไม ไม่เอาจาก getUserdata ไม่รู้นึกยุ โฟค 18/04/2026
    const requesterSql = `SELECT empName, empSurname FROM Person.MEMBER_FED WHERE empCode = '${dataItem.Request_By_EmployeeCode || ''}' LIMIT 1`
    const requesterRes = (await MySQLExecute.search(requesterSql)) as RowDataPacket[]
    const requesterData = requesterRes[0] || {}
    const requesterFullName = requesterData.empName ? `${requesterData.empName} ${requesterData.empSurname || ''}`.trim() : (dataItem.Request_By_EmployeeCode || 'Unknown')

    const requestNumber = resolveRequestNumber(persistedRequestNumber, insertedId)
    const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

    if (nextAssignee.empEmail) {
        const manualCc = excludeEmails(parseCcEmails(dataItem.cc_emails), [vendorData.email, vendorData.emailmain])
        const peerCc = await getPeerCcEmailsByGroupCode(
            assigneeGroupCode || '',
            nextAssignee.empCode,
            nextAssignee.empEmail
        )
        const ccEmails = excludeEmails(
            mergeUniqueEmails(manualCc, peerCc).filter(email => email !== normalizeEmail(nextAssignee.empEmail)),
            [vendorData.email, vendorData.emailmain]
        )

        const emailHtml = emailRequestRegisterVendorTemplate({
            requestNumber,
            recipientName: nextAssignee.empName || 'PO PIC',
            vendorName: vendorData.company_name || 'Error Connection',
            address: vendorData.address || 'Error Connection',
            contactPic: vendorData.contact_name || 'Error Connection',
            email: vendorData.email || 'Error Connection',
            tel: vendorData.tel_phone || 'Error Connection',
            supportProduct: dataItem.supportProduct_Process || 'Error Connection',
            purchaseFrequency: dataItem.purchase_frequency || 'Error Connection',
            systemLink,
            userName: requesterFullName,
            userTel: ''
        })
        const emailSubject = `[Request Check] Please request check register vendor follow as "${requestNumber}"`
        await sendEmail(emailHtml, nextAssignee.empEmail, emailSubject, ccEmails)
    }
}

export const sendAgreementEmail = async (dataItem: any) => {
    const recipientEmail = String(dataItem.emailmain || '').trim()
    if (!recipientEmail) {
        throw new Error('Vendor emailmain is required')
    }

    const emailHtml = emailVendorDocumentRequestTemplate({
        vendorEmail: recipientEmail,
        ccEmail: '',
        topicRef: dataItem.request_number || '-',
        isNewSupplier: !dataItem.fft_vendor_code,
        picName: dataItem.pic_name || 'PO PIC',
        picTel: dataItem.pic_tel || '',
    })

    await sendEmail(
        emailHtml,
        recipientEmail,
        dataItem.email_subject || `[Request Submit] Document for ${dataItem.request_number || 'vendor registration'}`,
        []
    )

    return { sent_to: recipientEmail }
}

export const triggerVendorDocumentEmail = async (requestId: number, stageHint?: string) => {
    try {
        const vendorSql = `
            SELECT
                   rr.request_number,
                   rr.CREATE_DATE,
                   rr.assign_to,
                   rr.cc_emails,
                   rr.vendor_contact_id,
                   v.company_name,
                   v.vendor_region,
                   v.emailmain,
                   v.fft_vendor_code,
                   vc_sel.email AS selected_vendor_email
            FROM request_register_vendor rr
            LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
            LEFT JOIN vendor_contacts vc_sel ON vc_sel.vendor_contact_id = rr.vendor_contact_id AND vc_sel.INUSE = 1
            WHERE rr.request_id = ${Number(requestId) || 0}
            LIMIT 1
        `
        const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
        const vd = vendorRes[0] || {}

        const vendorEmail = (vd.selected_vendor_email || vd.emailmain || '').trim()
        if (!vendorEmail) {
            return { sent: false, reason: 'missing vendor email' }
        }

        const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

        const picSql = `SELECT empName, empEmail FROM assignees_to WHERE empcode = '${vd.assign_to || ''}' LIMIT 1`
        const picRes = (await MySQLExecute.search(picSql)) as any[]
        const picRow = picRes[0] || {}
        const picName = picRow.empName ? `${picRow.empName}`.trim() : (vd.assign_to || 'PO PIC')
        const picEmail = picRow.empEmail || ''
        const picTel = ''

        const isOversea = normalizeText(vd.vendor_region) === 'oversea'
        const picGroupCode = isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC
        const peerPicCc = await getPeerCcEmailsByGroupCode(picGroupCode, vd.assign_to, picEmail)
        const manualCc = parseCcEmails(vd.cc_emails)

        const ccEmails = excludeEmails(mergeUniqueEmails(
            picEmail ? [picEmail] : [],
            peerPicCc,
            manualCc
        ).filter(email => email !== normalizeEmail(vendorEmail)), [vendorEmail, vd.emailmain])

        const stageHintRaw = String(stageHint || '').trim().toLowerCase()
        const isGprBStage = stageHintRaw.includes('gpr b')
        const isGprCStage = stageHintRaw.includes('gpr c')

        let emailHtml = emailVendorDocumentRequestTemplate({
            vendorEmail,
            ccEmail: ccEmails.join('; '),
            topicRef: requestNumber,
            isNewSupplier: !vd.fft_vendor_code,
            picName,
            picTel,
        })
        let emailSubject = `[Request Submit] Document for ${requestNumber}`

        if (isGprBStage) {
            emailHtml = emailExternalSubmitGPRBTemplate({
                vendorEmail,
                ccEmail: ccEmails.join('; '),
                requestNumber,
                picName,
                picTel,
            })
            emailSubject = `[Request Submit] Please submit ${requestNumber} - General Purchase Specification Form B`
        } else if (isGprCStage) {
            // Reuse existing Form C template available in the project.
            emailHtml = emailAfterCheckerApproverGPRCTemplate({
                toEmail: vendorEmail,
                ccEmail: ccEmails.join('; '),
                requestNumber,
                picNextStepName: 'Supplier',
                picName,
                picTel,
                vendorName: vd.company_name || 'N/A',
                address: vd.address || 'N/A',
                contactPic: vd.contact_name || 'N/A',
                email: vd.emailmain || 'N/A',
                tel: vd.tel_phone || 'N/A',
                supportProduct: vd.supportProduct_Process || 'N/A',
                purchaseFrequency: vd.purchase_frequency || 'N/A',
                systemLink: `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`,
            })
            emailSubject = `[Request Submit] Please submit ${requestNumber} - General Purchase Specification Form C`
        }

        await sendEmail(emailHtml, vendorEmail, emailSubject, ccEmails)

        return { sent: true, to: vendorEmail, ccCount: ccEmails.length }
    } catch (err: any) {
        console.error('[triggerVendorDocumentEmail] Failed:', err?.message)
        return { sent: false, reason: err?.message || 'send failed' }
    }
}

export const triggerApprovalEmails = async (dataItem: any, nextStep: any, dynamicApprover: string) => {
    try {
        const requestId = dataItem.request_id
        const vendorSql = `
              SELECT v.company_name, v.address, v.vendor_region, v.emailmain AS vendor_main_email,
                   vc.contact_name, vc.email AS vendor_email, vc.tel_phone,
                  rr.request_number, rr.CREATE_DATE,
                  rr.assign_to, rr.supportProduct_Process, rr.purchase_frequency, rr.cc_emails,
                   rr.Request_By_EmployeeCode
            FROM request_register_vendor rr
            LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
            LEFT JOIN vendor_contacts vc ON vc.vendor_id = v.vendor_id
            WHERE rr.request_id = ${requestId} LIMIT 1
        `
        const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
        const vd = vendorRes[0] || {}

        const picSql = `SELECT empName, empEmail FROM assignees_to WHERE empcode = '${vd.assign_to || ''}' LIMIT 1`
        const picRes = (await MySQLExecute.search(picSql)) as any[]
        const picRow = picRes[0] || {}
        const picName = picRow.empName ? `${picRow.empName}`.trim() : (vd.assign_to || 'PIC')
        const picEmail = picRow.empEmail || ''
        const picTel = ''

        const targetApprover = dynamicApprover || nextStep?.approver_id || vd.assign_to || ''
        let approverEmail = ''
        if (targetApprover) {
            const approverEmailSql = `SELECT empEmail FROM assignees_to WHERE empcode = '${targetApprover}' LIMIT 1`
            const approverEmailRes = (await MySQLExecute.search(approverEmailSql)) as any[]
            approverEmail = approverEmailRes[0]?.empEmail || ''
        }

        const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
        const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

        const isOversea = normalizeText(vd.vendor_region) === 'oversea'
        const nextGroupCode = nextStep?.group_code || resolveGroupCodeForStep(nextStep, isOversea)
        const peerApproverCc = await getPeerCcEmailsByGroupCode(nextGroupCode, targetApprover, approverEmail)

        const ccEmails = excludeEmails(mergeUniqueEmails(
            picEmail ? [picEmail] : [],
            parseCcEmails(vd.cc_emails),
            peerApproverCc
        ).filter(email => email !== normalizeEmail(approverEmail)), [vd.vendor_email, vd.vendor_main_email])

        const baseEmailData: MailTemplateData = {
            toEmail: approverEmail,
            ccEmail: ccEmails.join('; '),
            requestNumber,
            vendorName: vd.company_name || 'N/A',
            address: vd.address || 'N/A',
            contactPic: vd.contact_name || 'N/A',
            email: vd.vendor_email || 'N/A',
            tel: vd.tel_phone || 'N/A',
            supportProduct: vd.supportProduct_Process || 'N/A',
            purchaseFrequency: vd.purchase_frequency || 'N/A',
            systemLink,
            picName,
            picTel,
        }

        if (!approverEmail) return

        const { emailHtml, emailSubject } = selectApprovalNotificationByStep(nextStep, baseEmailData, requestNumber)
        await sendEmail(emailHtml, approverEmail, emailSubject, ccEmails)
    } catch (err: any) {
        console.error('[triggerApprovalEmails] Failed:', err?.message)
    }
}

export const triggerRejectionEmail = async (dataItem: any, currentStep: any) => {
    try {
        const requestId = dataItem.request_id
        const vendorSql = `
              SELECT v.company_name, v.address, v.vendor_region, v.emailmain AS vendor_main_email,
                   vc.contact_name, vc.email AS vendor_email, vc.tel_phone,
                  rr.request_number, rr.CREATE_DATE,
                  rr.assign_to, rr.supportProduct_Process, rr.purchase_frequency, rr.cc_emails,
                   rr.Request_By_EmployeeCode
            FROM request_register_vendor rr
            LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
            LEFT JOIN vendor_contacts vc ON vc.vendor_id = v.vendor_id
            WHERE rr.request_id = ${requestId} LIMIT 1
        `
        const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
        const vd = vendorRes[0] || {}

        const picEmailSql = `SELECT empName, empEmail FROM assignees_to WHERE empcode = '${vd.assign_to || ''}' LIMIT 1`
        const picRes = (await MySQLExecute.search(picEmailSql)) as any[]
        const picRow = picRes[0] || {}
        const picEmail = picRow.empEmail || ''
        const picName = picRow.empName ? `${picRow.empName}`.trim() : (vd.assign_to || 'PIC')
        const picTel = ''

        const approverEmailSql = `SELECT empEmail FROM assignees_to WHERE empcode = '${currentStep?.approver_id || ''}' LIMIT 1`
        const approverRes = (await MySQLExecute.search(approverEmailSql)) as any[]
        const approverEmail = approverRes[0]?.empEmail || ''

        const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
        const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

        const isOversea = normalizeText(vd.vendor_region) === 'oversea'
        const picGroupCode = isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC
        const peerPicCc = await getPeerCcEmailsByGroupCode(picGroupCode, vd.assign_to, picEmail)

        const ccEmails = excludeEmails(mergeUniqueEmails(
            approverEmail ? [approverEmail] : [],
            parseCcEmails(vd.cc_emails),
            peerPicCc
        ).filter(email => email !== normalizeEmail(picEmail)), [vd.vendor_email, vd.vendor_main_email])

        if (!picEmail) return

        const rejectRemark = dataItem.approver_remark || ''
        const emailHtml = emailReject1Template({
            toEmail: picEmail,
            recipientName: picName,
            ccEmailLine1: approverEmail,
            ccEmailLine2: ccEmails.filter(email => email !== approverEmail).join('; '),
            requestNumber,
            remarkEN: rejectRemark,
            remarkTH: rejectRemark,
            vendorName: vd.company_name || 'N/A',
            address: vd.address || 'N/A',
            contactPic: vd.contact_name || 'N/A',
            email: vd.vendor_email || 'N/A',
            tel: vd.tel_phone || 'N/A',
            supportProduct: vd.supportProduct_Process || 'N/A',
            purchaseFrequency: vd.purchase_frequency || 'N/A',
            systemLink,
            picName,
            picTel,
        })

        await sendEmail(
            emailHtml,
            picEmail,
            `[REJECT] Register vendor "${requestNumber}" has been rejected`,
            ccEmails
        )
    } catch (err: any) {
        console.error('[triggerRejectionEmail] Failed:', err?.message)
    }
}

export const triggerCompletionEmail = async (dataItem: any) => {
    try {
        const requestId = dataItem.request_id
        const vendorSql = `
              SELECT v.company_name, v.address, v.emailmain AS vendor_main_email,
                   vc.contact_name, vc.email AS vendor_email, vc.tel_phone,
                  rr.request_number, rr.CREATE_DATE,
                  rr.assign_to, rr.supportProduct_Process, rr.purchase_frequency, rr.cc_emails,
                   rr.Request_By_EmployeeCode, rr.vendor_code
            FROM request_register_vendor rr
            LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
            LEFT JOIN vendor_contacts vc ON vc.vendor_id = v.vendor_id
            WHERE rr.request_id = ${requestId} LIMIT 1
        `
        const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
        const vd = vendorRes[0] || {}

        const requesterSql = `SELECT empName, empSurname, empEmail FROM Person.MEMBER_FED WHERE empCode = '${vd.Request_By_EmployeeCode || ''}' LIMIT 1`
        const requesterRes = (await MySQLExecute.search(requesterSql)) as any[]
        const req = requesterRes[0] || {}
        const requesterName = req.empName ? `${req.empName} ${req.empSurname || ''}`.trim() : vd.Request_By_EmployeeCode
        const requesterEmail = req.empEmail || ''

        const picEmailSql = `SELECT empName, empEmail FROM assignees_to WHERE empcode = '${vd.assign_to || ''}' LIMIT 1`
        const picRes = (await MySQLExecute.search(picEmailSql)) as any[]
        const picRow = picRes[0] || {}
        const picName = picRow.empName ? `${picRow.empName}`.trim() : (vd.assign_to || 'PIC')
        const picEmail = picRow.empEmail || ''
        const picTel = ''

        const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
        const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

        const finalCcEmails = excludeEmails(picEmail ? [picEmail] : [], [vd.vendor_email, vd.vendor_main_email])
        if (!requesterEmail) return

        const completionData: MailTemplateData = {
            toEmail: requesterEmail,
            ccEmail: finalCcEmails.join('; '),
            requestNumber,
            vendorName: vd.company_name || 'N/A',
            address: vd.address || 'N/A',
            contactPic: vd.contact_name || 'N/A',
            email: vd.vendor_email || 'N/A',
            tel: vd.tel_phone || 'N/A',
            supportProduct: vd.supportProduct_Process || 'N/A',
            purchaseFrequency: vd.purchase_frequency || 'N/A',
            systemLink,
            picName,
            picTel,
            vendorCode: dataItem.vendor_code || vd.vendor_code || 'Pending',
            userName: requesterName || 'Requester',
        }

        const emailHtml = emailCompleteTemplate(completionData)
        await sendEmail(
            emailHtml,
            requesterEmail,
            `[Complete] Register vendor "${requestNumber}" is now completed`,
            finalCcEmails
        )
    } catch (err: any) {
        console.error('[triggerCompletionEmail] Failed:', err?.message)
    }
}

export const triggerVendorDisagreeEmail = async (dataItem: any) => {
    try {
        const requestId = Number(dataItem.request_id) || 0
        if (!requestId) return

        const vendorSql = `
            SELECT
                   v.company_name,
                   rr.request_number,
                   rr.CREATE_DATE,
                   rr.assign_to,
                   rr.cc_emails,
                   rr.Request_By_EmployeeCode
            FROM request_register_vendor rr
            LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
            WHERE rr.request_id = ${requestId}
            LIMIT 1
        `
        const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
        const vd = vendorRes[0] || {}

        const requesterSql = `SELECT empName, empSurname, empEmail FROM Person.MEMBER_FED WHERE empCode = '${vd.Request_By_EmployeeCode || ''}' LIMIT 1`
        const requesterRes = (await MySQLExecute.search(requesterSql)) as any[]
        const requester = requesterRes[0] || {}

        const requesterName = requester.empName
            ? `${requester.empName} ${requester.empSurname || ''}`.trim()
            : (vd.Request_By_EmployeeCode || 'Requester')
        const requesterEmail = requester.empEmail || ''
        if (!requesterEmail) return

        const picSql = `SELECT empEmail FROM assignees_to WHERE empcode = '${vd.assign_to || ''}' LIMIT 1`
        const picRes = (await MySQLExecute.search(picSql)) as any[]
        const picEmail = picRes[0]?.empEmail || ''

        const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
        const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

        const ccEmails = mergeUniqueEmails(
            picEmail ? [picEmail] : [],
            parseCcEmails(vd.cc_emails)
        ).filter(email => email !== normalizeEmail(requesterEmail))

        const safeRemark = String(dataItem.approver_remark || '').trim()
        const emailHtml = `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">
                <h3 style="margin:0 0 12px;">Vendor Registration Request Closed</h3>
                <p style="margin:0 0 8px;">Dear ${requesterName},</p>
                <p style="margin:0 0 8px;">
                    Request <strong>${requestNumber}</strong> for vendor <strong>${vd.company_name || 'N/A'}</strong>
                    has been closed because the vendor did not agree after GPR negotiation rounds.
                </p>
                ${safeRemark ? `<p style="margin:0 0 8px;"><strong>Remark:</strong> ${safeRemark}</p>` : ''}
                <p style="margin:0 0 8px;">Please review details in the system: <a href="${systemLink}">${systemLink}</a></p>
                <p style="margin:0;">Best regards,<br/>Vendor Registration System</p>
            </div>
        `

        await sendEmail(
            emailHtml,
            requesterEmail,
            `[Closed] Register vendor "${requestNumber}" ended as Vendor Disagreed`,
            ccEmails
        )
    } catch (err: any) {
        console.error('[triggerVendorDisagreeEmail] Failed:', err?.message)
    }
}
