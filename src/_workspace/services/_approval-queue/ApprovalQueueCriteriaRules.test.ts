import { describe, expect, test } from 'bun:test'
import { evaluateGprCriteria } from './ApprovalQueueService'

const buildCriteria = (lawDocumentNo?: '4.1' | '4.11') => {
  const rows = [
    { NO: '4.2', UPLOADED_FILE: '/files/4.2.pdf' },
    { NO: '4.3', REMARK: 'Accept' },
    { NO: '4.4', UPLOADED_FILE: '/files/4.4.pdf' },
    { NO: '4.5', UPLOADED_FILE: '/files/4.5.pdf' },
    { NO: '4.6', UPLOADED_FILE: '/files/4.6.pdf' },
    { NO: '4.7', UPLOADED_FILE: '/files/4.7.pdf' },
    { NO: '4.8', UPLOADED_FILE: '/files/4.8.pdf' }
  ]

  if (lawDocumentNo) rows.push({ NO: lawDocumentNo, UPLOADED_FILE: `/files/${lawDocumentNo}.pdf` })

  return rows as unknown as Parameters<typeof evaluateGprCriteria>[0]
}

describe('Approval queue Selection Sheet criteria rules', () => {
  test('accepts document 4.1 for the law-document requirement', () => {
    expect(evaluateGprCriteria(buildCriteria('4.1'), { gpr_43_acceptance_status: 'ACCEPT' } as never).passed).toBe(true)
  })

  test('accepts document 4.11 as a substitute for missing document 4.1', () => {
    expect(evaluateGprCriteria(buildCriteria('4.11'), { gpr_43_acceptance_status: 'ACCEPT' } as never).passed).toBe(true)
  })

  test('blocks the next workflow step when both documents 4.1 and 4.11 are missing', () => {
    expect(evaluateGprCriteria(buildCriteria(), { gpr_43_acceptance_status: 'ACCEPT' } as never).passed).toBe(false)
  })
})
