import { describe, expect, test } from 'bun:test'
import { getTaskManagerTerminalStatuses, isTaskManagerReassignable, normalizeTaskManagerStatus } from './TaskManagerRules'

describe('TaskManagerRules', () => {
  test('normalizes request status consistently', () => {
    expect(normalizeTaskManagerStatus(' Completed ')).toBe('completed')
  })

  test.each(['Completed', 'Rejected', 'Cancelled', 'Canceled'])('blocks terminal status %s', status => {
    expect(isTaskManagerReassignable(status, true)).toBe(false)
  })

  test('requires an active workflow step', () => {
    expect(isTaskManagerReassignable('In Progress', false)).toBe(false)
    expect(isTaskManagerReassignable('In Progress', true)).toBe(true)
  })

  test('exposes the statuses used by the task queue SQL', () => {
    expect(getTaskManagerTerminalStatuses().sort()).toEqual(['canceled', 'cancelled', 'completed', 'rejected'])
  })
})
