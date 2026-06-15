const TERMINAL_REQUEST_STATUSES = new Set(['completed', 'rejected', 'cancelled', 'canceled'])

export const normalizeTaskManagerStatus = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

export const isTaskManagerReassignable = (requestStatus: unknown, hasCurrentStep: boolean) => {
  if (!hasCurrentStep) return false
  return !TERMINAL_REQUEST_STATUSES.has(normalizeTaskManagerStatus(requestStatus))
}

export const getTaskManagerTerminalStatuses = () => Array.from(TERMINAL_REQUEST_STATUSES)
