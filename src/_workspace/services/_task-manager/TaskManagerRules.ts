export const isTaskManagerReassignable = (
  requestStateId: unknown,
  inProgressRequestStateId: unknown,
  hasCurrentStep: boolean
) => {
  if (!hasCurrentStep) return false
  const currentId = Number(requestStateId)
  const inProgressId = Number(inProgressRequestStateId)
  return Number.isInteger(currentId) && currentId > 0 && currentId === inProgressId
}
