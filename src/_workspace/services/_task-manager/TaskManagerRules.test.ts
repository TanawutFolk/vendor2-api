import { describe, expect, test } from 'bun:test'
import { isTaskManagerReassignable } from './TaskManagerRules'

describe('TaskManagerRules', () => {
  test.each([12, 13, 14])('blocks non-active request state ID %s', requestStateId => {
    expect(isTaskManagerReassignable(requestStateId, 11, true)).toBe(false)
  })

  test('requires an active workflow step', () => {
    expect(isTaskManagerReassignable(11, 11, false)).toBe(false)
    expect(isTaskManagerReassignable(11, 11, true)).toBe(true)
    expect(isTaskManagerReassignable('IN_PROGRESS', 11, true)).toBe(false)
  })
})
