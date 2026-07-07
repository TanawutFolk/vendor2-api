import { resolveRequestNumber } from '../_request-register/RegisterRequestWorkflowHelper'

const getSummaryValue = (row: any, ...keys: string[]) => {
  for (const key of keys) {
    if (row && row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') return row[key]
  }
  return ''
}

export const buildGprCBaseMailData = (summary: any, requestId: number, recipientName = 'Approver') => {
  const requestNumber = resolveRequestNumber(getSummaryValue(summary, 'request_number', 'REQUEST_NUMBER'), requestId, getSummaryValue(summary, 'CREATE_DATE', 'create_date'))

  return {
    requestNumber,
    recipientName,
    vendorName: getSummaryValue(summary, 'company_name', 'COMPANY_NAME') || 'N/A',
    address: getSummaryValue(summary, 'address', 'ADDRESS') || 'N/A',
    contactPic: getSummaryValue(summary, 'contact_name', 'CONTACT_NAME') || 'N/A',
    email: getSummaryValue(summary, 'vendor_email', 'VENDOR_EMAIL', 'email', 'EMAIL', 'emailmain', 'EMAILMAIN') || 'N/A',
    tel: getSummaryValue(summary, 'tel_phone', 'TEL_PHONE') || 'N/A',
    supportProduct: getSummaryValue(summary, 'supportProduct_Process', 'SUPPORTPRODUCT_PROCESS') || 'N/A',
    purchaseFrequency: getSummaryValue(summary, 'purchase_frequency', 'PURCHASE_FREQUENCY') || 'N/A',
    systemLink: `${process.env.LEAVE_SYSTEM_ORIGIN || 'http://localhost:5173'}/en/approval-gpr-c`,
    picName: '',
    picTel: '',
  }
}