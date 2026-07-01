const mysql = require('mysql2/promise');

const StepType = {
  PENDING_AGREEMENT: 'PENDING_AGREEMENT',
  AGREEMENT_REACHED: 'AGREEMENT_REACHED',
  ISSUE_GPR_B: 'ISSUE_GPR_B',
  ISSUE_GPR_C: 'ISSUE_GPR_C',
  VENDOR_DISAGREED: 'VENDOR_DISAGREED',
  DOCUMENT_CHECK: 'DOCUMENT_CHECK',
  ACCOUNT_REGISTERED: 'ACCOUNT_REGISTERED',
  OTHER: 'OTHER',
};

const WORKFLOW_STEP_CODE = {
  REQUEST_SUBMITTED: 'REQUEST_SUBMITTED',
  PIC_REVIEW: 'PIC_REVIEW',
  PENDING_AGREEMENT: 'PENDING_AGREEMENT',
  AGREEMENT_REACHED: 'AGREEMENT_REACHED',
  DOC_CHECK: 'DOC_CHECK',
  PO_MGR_APPROVAL: 'PO_MGR_APPROVAL',
  PO_GM_APPROVAL: 'PO_GM_APPROVAL',
  MD_APPROVAL: 'MD_APPROVAL',
  ACCOUNT_REGISTERED: 'ACCOUNT_REGISTERED',
  REJECTED: 'REJECTED',
  VENDOR_DISAGREED: 'VENDOR_DISAGREED',
  ISSUE_GPR_B: 'ISSUE_GPR_B',
  ISSUE_GPR_C: 'ISSUE_GPR_C',
};

const LEGACY_STEP_CODE_BY_LABEL = {
  'sent to po & scm (pic)': WORKFLOW_STEP_CODE.REQUEST_SUBMITTED,
  'po & scm approved (pic)': WORKFLOW_STEP_CODE.PIC_REVIEW,
  'po & scm approve (pic)': WORKFLOW_STEP_CODE.PIC_REVIEW,
  'pending agreement to vendor': WORKFLOW_STEP_CODE.PENDING_AGREEMENT,
  'agreement reached': WORKFLOW_STEP_CODE.AGREEMENT_REACHED,
  'po & scm check all document': WORKFLOW_STEP_CODE.DOC_CHECK,
  'po mgr approve': WORKFLOW_STEP_CODE.PO_MGR_APPROVAL,
  'po gm approve': WORKFLOW_STEP_CODE.PO_GM_APPROVAL,
  'md approval': WORKFLOW_STEP_CODE.MD_APPROVAL,
  'account registered': WORKFLOW_STEP_CODE.ACCOUNT_REGISTERED,
  rejected: WORKFLOW_STEP_CODE.REJECTED,
  'vendor disagreed': WORKFLOW_STEP_CODE.VENDOR_DISAGREED,
  'issue gpr b': WORKFLOW_STEP_CODE.ISSUE_GPR_B,
  'issue gpr c': WORKFLOW_STEP_CODE.ISSUE_GPR_C,
};

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function inferStepCode(step) {
  const configuredStepCode = String(step?.step_code || step?.STEP_CODE || '').trim().toUpperCase();
  const source = normalizeText(step?.DESCRIPTION || step?.description || step?.label || step?.value);

  if (configuredStepCode === WORKFLOW_STEP_CODE.PIC_REVIEW && source === 'sent to po & scm (pic)') {
    return WORKFLOW_STEP_CODE.REQUEST_SUBMITTED;
  }
  if (configuredStepCode) return configuredStepCode;
  const legacyStepCode = LEGACY_STEP_CODE_BY_LABEL[source];
  if (legacyStepCode) return legacyStepCode;
  return '';
}

function getStepType(step) {
  switch (inferStepCode(step)) {
    case WORKFLOW_STEP_CODE.PENDING_AGREEMENT:
      return StepType.PENDING_AGREEMENT;
    case WORKFLOW_STEP_CODE.AGREEMENT_REACHED:
      return StepType.AGREEMENT_REACHED;
    case WORKFLOW_STEP_CODE.ISSUE_GPR_B:
      return StepType.ISSUE_GPR_B;
    case WORKFLOW_STEP_CODE.ISSUE_GPR_C:
      return StepType.ISSUE_GPR_C;
    case WORKFLOW_STEP_CODE.VENDOR_DISAGREED:
      return StepType.VENDOR_DISAGREED;
    case WORKFLOW_STEP_CODE.DOC_CHECK:
      return StepType.DOCUMENT_CHECK;
    case WORKFLOW_STEP_CODE.ACCOUNT_REGISTERED:
      return StepType.ACCOUNT_REGISTERED;
    default:
      return StepType.OTHER;
  }
}

async function simulateBackend() {
  const connection = await mysql.createConnection({
    host: '192.168.14.236',
    user: 'Tanawut',
    password: 'Tanawut12345',
    database: '_test_suply_chain_trainee'
  });

  const [stepsRes] = await connection.execute(`
    SELECT * FROM request_approval_step
    WHERE REQUEST_REGISTER_VENDOR_ID = 151 AND INUSE = 1
    ORDER BY STEP_ORDER ASC
  `);

  console.log('--- Simulating Step Mapping ---');
  const steps = stepsRes.map(step => ({
    ...step,
    step_id: Number(step.REQUEST_APPROVAL_STEP_ID),
    step_order: Number(step.STEP_ORDER),
    step_status: String(step.STEP_STATUS),
    step_code: String(step.STEP_CODE),
    DESCRIPTION: step.DESCRIPTION
  }));

  const currentStep = steps.find(s => s.step_status === 'in_progress');
  console.log('Current Step:', currentStep ? `${currentStep.DESCRIPTION} (Type: ${getStepType(currentStep)})` : 'None');

  const pendingAfterCurrent = steps.filter(s => s.step_status === 'pending' && s.step_order > currentStep.step_order);
  console.log('Pending After Current Steps count:', pendingAfterCurrent.length);
  pendingAfterCurrent.forEach(s => {
    console.log(` - Step ${s.step_order}: ${s.DESCRIPTION} | Code: ${s.step_code} | Type: ${getStepType(s)}`);
  });

  const nextStep = pendingAfterCurrent.find(s => getStepType(s) === StepType.ISSUE_GPR_C);
  console.log('Found nextStep (ISSUE_GPR_C)?', nextStep ? 'YES' : 'NO');

  await connection.end();
}

simulateBackend().catch(console.error);
