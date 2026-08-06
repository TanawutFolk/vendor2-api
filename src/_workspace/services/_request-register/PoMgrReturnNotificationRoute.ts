export const PO_MGR_RETURN_TEST_EMP_CODE = 'S00823'

export const buildPoMgrReturnTestMailRoute = (employeeEmail: string) => {
  const email = String(employeeEmail || '')
    .trim()
    .toLowerCase()

  return {
    toEmpCode: PO_MGR_RETURN_TEST_EMP_CODE,
    toEmail: email,
    ccEmpCodes: [PO_MGR_RETURN_TEST_EMP_CODE],
    ccEmails: email ? [email] : [],
  }
}
