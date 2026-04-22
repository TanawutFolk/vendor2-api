import { RowDataPacket } from 'mysql2'
import { MySQLExecute } from '@businessData/dbExecute'
import { RegisterRequestSQL } from '../../sql/_request-registrer/RegisterRequestSQL'
import sendEmail from '@src/config/sendEmail'
import {
    emailAfterCheckerApproverGPRCTemplate,
    emailExternalSubmitGPRBTemplate,
    emailCompleteTemplate,
    emailIncompleteTemplate,
    emailReject1Template,
    emailRequestRegisterVendorTemplate,
    emailToAccountPICTemplate,
    emailToCheckerPICTemplate,
    emailToMDTemplate,
    emailToPMGMTemplate,
    emailToPMMgrTemplate,
    emailUserCheckerApproverGPRCTemplate,
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

    const rowsSql = await RegisterRequestSQL.getPeerCcRowsByNormalizedGroup({
        target_group: targetGroup,
        target_compact: targetCompact,
    })
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

const parseStoredEmailList = (raw: any): string[] => {
    if (!raw) return []

    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (!Array.isArray(parsed)) return []
        return parsed
            .map(item => normalizeEmail(item))
            .filter(Boolean)
            .slice(0, 6)
    } catch {
        return []
    }
}

const parseStoredObject = (raw: any): Record<string, any> => {
    if (!raw) return {}

    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
        return {}
    }
}

const resolveActionRequiredStage = (step: any) => {
    const desc = normalizeText(step?.DESCRIPTION)
    if (desc.includes('engineer')) return 'engineer'
    if (desc.includes('emr')) return 'emr'
    if (desc.includes('qms')) return 'qms'
    if (desc.includes('pm manager') || desc.includes('manager approval')) return 'pm_manager'
    return ''
}

const renderActionRequiredEmail = (data: {
    stageLabel: string
    recipientName: string
    requestNumber: string
    vendorName: string
    supportProduct: string
    systemLink: string
    note: string
    picName: string
    picTel: string
}) => `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.6; max-width: 760px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #dbeafe;">
        <div style="background-color: #0284c7; height: 6px; width: 100%;"></div>
        <div style="padding: 32px;">
            <p style="margin: 0 0 16px 0;">Dear ${data.recipientName || 'PIC'},</p>
            <div style="background-color: #eff6ff; border-left: 4px solid #0284c7; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px 0; font-weight: 700; color: #0f172a;">Action Required</p>
                <p style="margin: 0; color: #1e3a8a;">
                    ${data.stageLabel} requires your action for request <strong>${data.requestNumber}</strong>.
                </p>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="width: 220px; padding: 10px 0; color: #64748b;">Vendor Name</td><td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${data.vendorName}</td></tr>
                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Support Product / Process</td><td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${data.supportProduct}</td></tr>
                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Stage</td><td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${data.stageLabel}</td></tr>
                <tr><td style="padding: 10px 0; color: #64748b;">Note</td><td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${data.note || '-'}</td></tr>
            </table>
            <p style="margin: 0 0 24px 0;">
                Open the system here:
                <a href="${data.systemLink}" style="color: #0284c7; text-decoration: underline; font-weight: 600;">${data.systemLink}</a>
            </p>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827;">Best regards,</p>
                <p style="margin: 0; color: #0f172a;">${data.picName} ${data.picTel ? `(#Tel. ${data.picTel})` : ''}</p>
            </div>
        </div>
    </div>
`

export const selectApprovalNotificationByStep = (
    step: any,
    baseEmailData: MailTemplateData,
    requestNumber: string
): { emailHtml: string; emailSubject: string } => {
    const stepCode = inferStepCode(step)
    const nextDesc = normalizeText(step?.DESCRIPTION)

    if (stepCode === 'PO_GM_APPROVAL' || nextDesc.includes('general manager')) {
        return {
            emailHtml: emailToPMGMTemplate({ ...baseEmailData, recipientName: baseEmailData.recipientName || 'PO GM' }),
            emailSubject: `[Request Approval] Please approve register vendor "${requestNumber}" - PO GM Step`
        }
    }

    if (stepCode === 'PO_MGR_APPROVAL' || nextDesc.includes('manager') || nextDesc.includes('mgr')) {
        return {
            emailHtml: emailToPMMgrTemplate({ ...baseEmailData, recipientName: baseEmailData.recipientName || 'PO Mgr' }),
            emailSubject: `[Request Approval] Please approve register vendor "${requestNumber}" - PO Mgr Step`
        }
    }

    if (stepCode === 'MD_APPROVAL' || nextDesc.includes('md') || nextDesc.includes('director')) {
        return {
            emailHtml: emailToMDTemplate({ ...baseEmailData, recipientName: baseEmailData.recipientName || 'MD' }),
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
            emailHtml: emailToCheckerPICTemplate({ ...baseEmailData, recipientName: 'PO Checker' }),
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
    const requesterSql = await RegisterRequestSQL.getMemberByEmpCode({
        empcode: dataItem.Request_By_EmployeeCode || '',
    })
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
        const vendorSql = await RegisterRequestSQL.getNotificationVendorContextByRequestId({ request_id: Number(requestId) || 0 })
        const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
        const vd = vendorRes[0] || {}

        const vendorEmail = (vd.selected_vendor_email || vd.emailmain || '').trim()

        const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)

        const picSql = await RegisterRequestSQL.getAssigneeByEmpCodeContact({ empcode: vd.assign_to || '' })
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

        if (isGprCStage) {
            const gprCApproverEmail = normalizeEmail(vd.gpr_c_approver_email)
            const gprCApproverName = String(vd.gpr_c_approver_name || 'Approver PIC').trim()
            const gprCPcPicEmail = normalizeEmail(vd.gpr_c_pc_pic_email)
            const circularEmails = parseStoredEmailList(vd.gpr_c_circular_json)
            const checkerEmails = await getPeerCcEmailsByGroupCode(GROUP_CODE.PO_CHECKER_MAIN)
            const primaryCheckerEmail = checkerEmails[0] || ''

            const primaryRecipient = gprCApproverEmail || primaryCheckerEmail
            if (!primaryRecipient) {
                return { sent: false, reason: 'missing GPR C approver/checker email' }
            }

            const gprCCcEmails = excludeEmails(mergeUniqueEmails(
                picEmail ? [picEmail] : [],
                checkerEmails,
                gprCApproverEmail ? [gprCApproverEmail] : [],
                gprCPcPicEmail ? [gprCPcPicEmail] : [],
                circularEmails,
                manualCc
            ).filter(email => email !== primaryRecipient), [vendorEmail, vd.emailmain])

            const gprCApprovalHtml = emailUserCheckerApproverGPRCTemplate({
                toEmail: primaryRecipient,
                ccEmail: gprCCcEmails.join('; '),
                requestNumber,
                userName: gprCApproverName,
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

            await sendEmail(
                gprCApprovalHtml,
                primaryRecipient,
                `[Request Approval] Please approve ${requestNumber} - General Purchase Specification Form C`,
                gprCCcEmails
            )

            return {
                sent: true,
                to: primaryRecipient,
                ccCount: gprCCcEmails.length
            }
        }

        if (!vendorEmail) {
            return { sent: false, reason: 'missing vendor email' }
        }

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
        const vendorSql = await RegisterRequestSQL.getNotificationVendorContextByRequestId({ request_id: requestId })
        const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
        const vd = vendorRes[0] || {}

        const picSql = await RegisterRequestSQL.getAssigneeByEmpCodeContact({ empcode: vd.assign_to || '' })
        const picRes = (await MySQLExecute.search(picSql)) as any[]
        const picRow = picRes[0] || {}
        const picName = picRow.empName ? `${picRow.empName}`.trim() : (vd.assign_to || 'PIC')
        const picEmail = picRow.empEmail || ''
        const picTel = ''

        const targetApprover = dynamicApprover || nextStep?.approver_id || vd.assign_to || ''
        let approverEmail = ''
        let approverName = ''
        if (targetApprover) {
            const approverEmailSql = await RegisterRequestSQL.getAssigneeByEmpCodeContact({ empcode: targetApprover })
            const approverEmailRes = (await MySQLExecute.search(approverEmailSql)) as any[]
            approverEmail = approverEmailRes[0]?.empEmail || ''
            approverName = approverEmailRes[0]?.empName || ''
        }

        const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
        const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`
        const requesterSql = await RegisterRequestSQL.getMemberByEmpCode({ empcode: vd.Request_By_EmployeeCode || '' })
        const requesterRes = (await MySQLExecute.search(requesterSql)) as any[]
        const requesterEmail = requesterRes[0]?.empEmail || ''

        const isOversea = normalizeText(vd.vendor_region) === 'oversea'
        const nextStepCode = inferStepCode(nextStep)
        const nextStepDesc = normalizeText(nextStep?.DESCRIPTION)
        const isDocumentCheckerStep = nextStepCode === 'DOC_CHECK' || nextStepDesc.includes('checker') || nextStepDesc.includes('check all document')

        const picGroupCode = isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC
        const peerPicCc = await getPeerCcEmailsByGroupCode(picGroupCode, vd.assign_to, picEmail)
        const checkerPicCc = await getPeerCcEmailsByGroupCode(GROUP_CODE.PO_CHECKER_MAIN)
        const accPicCc = await getPeerCcEmailsByGroupCode(isOversea ? GROUP_CODE.ACC_OVERSEA_CC : GROUP_CODE.ACC_LOCAL_CC)

        const isPmMgrAndAbove = ['PO_MGR_APPROVAL', 'PO_GM_APPROVAL', 'MD_APPROVAL'].includes(nextStepCode)
        const isAccountStep = nextStepCode === 'ACCOUNT_REGISTERED'

        const nextGroupCode = isDocumentCheckerStep
            ? GROUP_CODE.PO_CHECKER_MAIN
            : (nextStep?.group_code || resolveGroupCodeForStep(nextStep, isOversea))
        const peerApproverCc = await getPeerCcEmailsByGroupCode(nextGroupCode, targetApprover, approverEmail)

        const ccEmails = excludeEmails(
            mergeUniqueEmails(
                ...(isPmMgrAndAbove
                    ? [
                        checkerPicCc,
                        requesterEmail ? [requesterEmail] : [],
                        picEmail ? [picEmail] : [],
                        peerPicCc,
                    ]
                    : []),
                ...(isAccountStep
                    ? [
                        accPicCc,
                        checkerPicCc,
                        requesterEmail ? [requesterEmail] : [],
                        picEmail ? [picEmail] : [],
                        peerPicCc,
                    ]
                    : []),
                ...(!isPmMgrAndAbove && !isAccountStep
                    ? [
                        picEmail ? [picEmail] : [],
                        peerApproverCc,
                    ]
                    : []),
                parseCcEmails(vd.cc_emails)
            ).filter(email => email !== normalizeEmail(approverEmail)),
            [vd.vendor_email, vd.vendor_main_email]
        )

        const baseEmailData: MailTemplateData = {
            toEmail: approverEmail,
            ccEmail: ccEmails.join('; '),
            requestNumber,
            recipientName: approverName || targetApprover || 'Approver',
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

export const triggerActionRequiredEmail = async (dataItem: any, currentStep: any) => {
    try {
        const requestId = dataItem.request_id
        const vendorSql = await RegisterRequestSQL.getNotificationVendorContextByRequestId({ request_id: requestId })
        const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
        const vd = vendorRes[0] || {}

        const stageKey = resolveActionRequiredStage(currentStep)
        if (!stageKey) return

        const setup = parseStoredObject(vd.action_required_json)
        const stageConfig = setup?.[stageKey] || {}
        const recipientEmail = normalizeEmail(stageConfig?.pic_email)
        if (!recipientEmail) return

        const recipientName = String(stageConfig?.pic_name || 'PIC').trim()
        const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
        const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

        const picSql = await RegisterRequestSQL.getAssigneeByEmpCodeContact({ empcode: vd.assign_to || '' })
        const picRes = (await MySQLExecute.search(picSql)) as any[]
        const picRow = picRes[0] || {}
        const picName = picRow.empName ? `${picRow.empName}`.trim() : (vd.assign_to || 'PO PIC')
        const picEmail = picRow.empEmail || ''
        const picTel = ''

        const ccEmails = excludeEmails(
            mergeUniqueEmails(
                picEmail ? [picEmail] : [],
                parseCcEmails(vd.cc_emails)
            ).filter(email => email !== recipientEmail),
            [vd.vendor_email, vd.vendor_main_email]
        )

        const stageLabel =
            stageKey === 'engineer' ? 'Engineer Judgement'
                : stageKey === 'emr' ? 'EMR Judgement'
                    : stageKey === 'qms' ? 'QMS Judgement'
                        : 'PM Manager Approval'

        const emailHtml = renderActionRequiredEmail({
            stageLabel,
            recipientName,
            requestNumber,
            vendorName: vd.company_name || 'N/A',
            supportProduct: vd.supportProduct_Process || 'N/A',
            systemLink,
            note: String(dataItem?.approver_remark || '').trim(),
            picName,
            picTel,
        })

        await sendEmail(
            emailHtml,
            recipientEmail,
            `[Action Required] ${stageLabel} for ${requestNumber}`,
            ccEmails
        )
    } catch (err: any) {
        console.error('[triggerActionRequiredEmail] Failed:', err?.message)
    }
}

export const triggerAfterGprCApprovedEmail = async (dataItem: any) => {
    try {
        const requestId = Number(dataItem.request_id) || 0
        if (!requestId) return

        const vendorSql = await RegisterRequestSQL.getNotificationVendorContextByRequestId({ request_id: requestId })
        const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
        const vd = vendorRes[0] || {}

        const requesterSql = await RegisterRequestSQL.getMemberByEmpCode({ empcode: vd.Request_By_EmployeeCode || '' })
        const requesterRes = (await MySQLExecute.search(requesterSql)) as any[]
        const requester = requesterRes[0] || {}
        const requesterEmail = normalizeEmail(requester?.empEmail || '')
        const requesterName = requester?.empName
            ? `${requester.empName} ${requester.empSurname || ''}`.trim()
            : (vd.Request_By_EmployeeCode || 'Requester')

        if (!requesterEmail) return

        const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
        const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

        const picSql = await RegisterRequestSQL.getAssigneeByEmpCodeContact({ empcode: vd.assign_to || '' })
        const picRes = (await MySQLExecute.search(picSql)) as any[]
        const picRow = picRes[0] || {}
        const picName = picRow.empName ? `${picRow.empName}`.trim() : (vd.assign_to || 'PO PIC')
        const picEmail = normalizeEmail(picRow.empEmail || '')
        const picTel = ''

        const checkerEmails = await getPeerCcEmailsByGroupCode(GROUP_CODE.PO_CHECKER_MAIN)
        const gprCApproverEmail = normalizeEmail(vd.gpr_c_approver_email)
        const gprCPcPicEmail = normalizeEmail(vd.gpr_c_pc_pic_email)
        const circularEmails = parseStoredEmailList(vd.gpr_c_circular_json)

        const ccEmails = excludeEmails(
            mergeUniqueEmails(
                picEmail ? [picEmail] : [],
                checkerEmails,
                gprCApproverEmail ? [gprCApproverEmail] : [],
                gprCPcPicEmail ? [gprCPcPicEmail] : [],
                circularEmails,
                parseCcEmails(vd.cc_emails)
            ).filter(email => email !== requesterEmail),
            [vd.vendor_email, vd.vendor_main_email]
        )

        const emailHtml = emailAfterCheckerApproverGPRCTemplate({
            toEmail: requesterEmail,
            ccEmail: ccEmails.join('; '),
            requestNumber,
            picNextStepName: requesterName,
            picName,
            picTel,
            vendorName: vd.company_name || 'N/A',
            address: vd.address || 'N/A',
            contactPic: vd.contact_name || 'N/A',
            email: vd.vendor_email || vd.emailmain || 'N/A',
            tel: vd.tel_phone || 'N/A',
            supportProduct: vd.supportProduct_Process || 'N/A',
            purchaseFrequency: vd.purchase_frequency || 'N/A',
            systemLink,
        })

        await sendEmail(
            emailHtml,
            requesterEmail,
            `[Request Update] ${requestNumber} - General Purchase Specification Form C approved`,
            ccEmails
        )
    } catch (err: any) {
        console.error('[triggerAfterGprCApprovedEmail] Failed:', err?.message)
    }
}

export const triggerRejectionEmail = async (dataItem: any, currentStep: any) => {
    try {
        const requestId = dataItem.request_id
        const vendorSql = await RegisterRequestSQL.getNotificationVendorContextByRequestId({ request_id: requestId })
        const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
        const vd = vendorRes[0] || {}

        const picEmailSql = await RegisterRequestSQL.getAssigneeByEmpCodeContact({ empcode: vd.assign_to || '' })
        const picRes = (await MySQLExecute.search(picEmailSql)) as any[]
        const picRow = picRes[0] || {}
        const picEmail = picRow.empEmail || ''
        const picName = picRow.empName ? `${picRow.empName}`.trim() : (vd.assign_to || 'PIC')
        const picTel = ''

        const approverEmailSql = await RegisterRequestSQL.getAssigneeEmailByEmpCode({ empcode: currentStep?.approver_id || '' })
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
        const vendorSql = await RegisterRequestSQL.getNotificationVendorContextByRequestId({ request_id: requestId })
        const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
        const vd = vendorRes[0] || {}

        const requesterSql = await RegisterRequestSQL.getMemberByEmpCode({ empcode: vd.Request_By_EmployeeCode || '' })
        const requesterRes = (await MySQLExecute.search(requesterSql)) as any[]
        const req = requesterRes[0] || {}
        const requesterName = req.empName ? `${req.empName} ${req.empSurname || ''}`.trim() : vd.Request_By_EmployeeCode
        const requesterEmail = req.empEmail || ''

        const picEmailSql = await RegisterRequestSQL.getAssigneeByEmpCodeContact({ empcode: vd.assign_to || '' })
        const picRes = (await MySQLExecute.search(picEmailSql)) as any[]
        const picRow = picRes[0] || {}
        const picName = picRow.empName ? `${picRow.empName}`.trim() : (vd.assign_to || 'PIC')
        const picEmail = picRow.empEmail || ''
        const picTel = ''
        const picNextStepEmail = normalizeEmail(dataItem.pic_next_step_email || dataItem.PIC_Email || '')

        const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
        const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

        const isOversea = normalizeText(vd.vendor_region) === 'oversea'
        const picGroupCode = isOversea ? GROUP_CODE.OVERSEA_PO_PIC : GROUP_CODE.LOCAL_PO_PIC
        const peerPicCc = await getPeerCcEmailsByGroupCode(picGroupCode, vd.assign_to, picEmail)
        const checkerPicCc = await getPeerCcEmailsByGroupCode(GROUP_CODE.PO_CHECKER_MAIN)
        const accPicCc = await getPeerCcEmailsByGroupCode(isOversea ? GROUP_CODE.ACC_OVERSEA_CC : GROUP_CODE.ACC_LOCAL_CC)

        const finalCcEmails = excludeEmails(
            mergeUniqueEmails(
                accPicCc,
                checkerPicCc,
                requesterEmail ? [requesterEmail] : [],
                picEmail ? [picEmail] : [],
                peerPicCc,
                picNextStepEmail ? [picNextStepEmail] : [],
                parseCcEmails(vd.cc_emails)
            ),
            [vd.vendor_email, vd.vendor_main_email]
        )
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

        const vendorSql = await RegisterRequestSQL.getNotificationVendorContextByRequestId({ request_id: requestId })
        const vendorRes = (await MySQLExecute.search(vendorSql)) as any[]
        const vd = vendorRes[0] || {}

        const requesterSql = await RegisterRequestSQL.getMemberByEmpCode({ empcode: vd.Request_By_EmployeeCode || '' })
        const requesterRes = (await MySQLExecute.search(requesterSql)) as any[]
        const requester = requesterRes[0] || {}

        const requesterName = requester.empName
            ? `${requester.empName} ${requester.empSurname || ''}`.trim()
            : (vd.Request_By_EmployeeCode || 'Requester')
        const requesterEmail = requester.empEmail || ''
        if (!requesterEmail) return

        const picSql = await RegisterRequestSQL.getAssigneeEmailByEmpCode({ empcode: vd.assign_to || '' })
        const picRes = (await MySQLExecute.search(picSql)) as any[]
        const picEmail = picRes[0]?.empEmail || ''

        const requestNumber = resolveRequestNumber(vd.request_number, requestId, vd.CREATE_DATE)
        const systemLink = `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/request-register`

        const ccEmails = mergeUniqueEmails(
            picEmail ? [picEmail] : [],
            parseCcEmails(vd.cc_emails)
        ).filter(email => email !== normalizeEmail(requesterEmail))

        const safeRemark = String(dataItem.approver_remark || '').trim()
        const reasons = [
            'Vendor disagreed after GPR negotiation rounds',
            ...(safeRemark ? [safeRemark] : []),
        ]

        const picContactSql = await RegisterRequestSQL.getAssigneeByEmpCodeContact({ empcode: vd.assign_to || '' })
        const picContactRes = (await MySQLExecute.search(picContactSql)) as any[]
        const picRow = picContactRes[0] || {}
        const picName = picRow.empName ? `${picRow.empName}`.trim() : (vd.assign_to || 'PO PIC')
        const picTel = ''

        const emailHtml = emailIncompleteTemplate({
            toEmail: requesterEmail,
            ccEmail: ccEmails.join('; '),
            requestNumber,
            userName: requesterName,
            vendorName: vd.company_name || 'N/A',
            address: vd.address || 'N/A',
            contactPic: vd.contact_name || 'N/A',
            email: vd.vendor_email || vd.emailmain || 'N/A',
            tel: vd.tel_phone || 'N/A',
            supportProduct: vd.supportProduct_Process || 'N/A',
            purchaseFrequency: vd.purchase_frequency || 'N/A',
            systemLink,
            picName,
            picTel,
            reasons,
        })

        await sendEmail(
            emailHtml,
            requesterEmail,
            `[Incomplete] Register vendor "${requestNumber}" ended as Vendor Disagreed`,
            ccEmails
        )
    } catch (err: any) {
        console.error('[triggerVendorDisagreeEmail] Failed:', err?.message)
    }
}
