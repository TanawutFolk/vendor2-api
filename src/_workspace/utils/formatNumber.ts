function formatNumber(value: unknown, decimals = 2, useGrouping = true, unit = '', displayIsNaN = '') {
  if (value === null || value === undefined || value === '') {
    return displayIsNaN
  }

  const num = Number(value)

  if (Number.isNaN(num) || !isFinite(num)) {
    return displayIsNaN
  }

  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    useGrouping: useGrouping,
  })

  const formatted = formatter.format(num)
  return unit ? `${formatted}${unit}` : formatted
}

export default formatNumber
