function formatNumber(value: unknown, decimals = 2, useGrouping = true, unit = '', displayIsNaN = '') {
  // ตรวจสอบค่าไม่ถูกต้อง
  if (value === null || value === undefined || value === '') {
    return displayIsNaN
  }

  const num = Number(value)

  // ใช้ Number.isNaN แทน isNaN (ปลอดภัยกว่า)
  if (Number.isNaN(num) || !isFinite(num)) {
    return displayIsNaN
  }

  // ใช้ Intl.NumberFormat สำหรับการจัดรูปแบบที่สมบูรณ์
  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    useGrouping: useGrouping,
  })

  const formatted = formatter.format(num)
  return unit ? `${formatted}${unit}` : formatted
}

export default formatNumber
