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
    const evaluation = evaluateGprCriteria(buildCriteria(), { gpr_43_acceptance_status: 'ACCEPT' } as never)

    expect(evaluation.passed).toBe(false)
    expect(evaluation.failureReasons).toEqual([
      'Missing required document: item 4.1 or substitute item 4.11.'
    ])
  })

  test('returns a specific reason when item 4.3 is not accepted', () => {
    const criteria = buildCriteria('4.1').map(row => (row.NO === '4.3' ? { ...row, REMARK: '' } : row))
    const evaluation = evaluateGprCriteria(criteria, { gpr_43_acceptance_status: '' } as never)

    expect(evaluation.passed).toBe(false)
    expect(evaluation.failureReasons).toEqual(['Item 4.3 must be marked "Accept".'])
  })

  test('returns the missing Need items and Optional shortfall separately', () => {
    const criteria = buildCriteria('4.1').map(row => {
      if (row.NO === '4.2' || row.NO === '4.7' || row.NO === '4.8') return { ...row, UPLOADED_FILE: '' }
      return row
    })
    const evaluation = evaluateGprCriteria(criteria, { gpr_43_acceptance_status: 'ACCEPT' } as never)

    expect(evaluation.passed).toBe(false)
    expect(evaluation.failureReasons).toEqual([
      'Missing required document(s): item(s) 4.2.',
      'Optional documents are incomplete: upload documents for 2 more criterion item(s) from 4.6-4.13 (current 1/3).'
    ])
  })
})
