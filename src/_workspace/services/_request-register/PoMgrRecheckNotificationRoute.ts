export const PO_MGR_RECHECK_TEST_EMP_CODE = 'S00823'

export const buildPoMgrRecheckTestMailRoute = (employeeEmail: string) => {
  const email = String(employeeEmail || '')
    .trim()
    .toLowerCase()

  return {
    toEmpCode: PO_MGR_RECHECK_TEST_EMP_CODE,
    toEmail: email,
    ccEmpCodes: [PO_MGR_RECHECK_TEST_EMP_CODE],
    ccEmails: email ? [email] : [],
  }
}
