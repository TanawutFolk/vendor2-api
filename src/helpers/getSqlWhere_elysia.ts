import { getSqlWhereByColumnFilters } from './getSqlWhereByFilterColumn'

export default function getSqlWhere_elysia(body: any, tableIds: any, orderByDefault: string = 'UPDATE_DATE') {
  const searchFiltersInput = body.SEARCHFILTERS || body.SearchFilters || []
  const columnFiltersInput = body.COLUMNFILTERS || body.ColumnFilters || []
  const orderInput = body.ORDER || body.Order || []
  const startInput = body.START ?? body.Start ?? 0
  const limitInput = body.LIMIT ?? body.Limit ?? 0
  const columnSql = (id: string) => {
    const tableId = tableIds.find((item: any) => item.id === id || item.alias === id)
    if (tableId) {
      const columnName = String(tableId.column || tableId.alias || tableId.id).toUpperCase()
      return `${tableId.table ? `${tableId.table}.` : ''}${columnName}`
    }

    if (id.includes('.')) {
      const [tableName, columnName] = id.split('.')
      return `${tableName}.${columnName.toUpperCase()}`
    }

    return id
  }

  body.START = Number(startInput) * Number(limitInput)
  body.Start = body.START

  let orderBy = orderInput.length
    ? orderInput
        .filter((item: any) => item.id !== 'inuseForSearch')
        .map(
          (item: any) =>
            `${columnSql(item.id)} ${item.desc ? 'DESC' : 'ASC'}`
        )
        .join(', ')
    : `${columnSql(orderByDefault)} DESC`

  const inuseForSearchOrder = orderInput.find((item: any) => item.id === 'inuseForSearch')

  if (typeof inuseForSearchOrder?.desc !== 'undefined') {
    orderBy = orderBy.length ? (orderBy += ` ,  inuseForSearch ${inuseForSearchOrder.desc ? 'DESC' : 'ASC'}`) : ` inuseForSearch ${inuseForSearchOrder.desc ? 'DESC' : 'ASC'}`
  }

  body.ORDER = orderBy
  body.Order = orderBy

  const searchFilters = searchFiltersInput
    .filter((item: any) => item.value !== '')
    .map((item: any) => {
      const dataItem = tableIds.find((i: any) => i.id === item.id)
      if (!dataItem) return ''
      let value

      if (dataItem.Fns === 'IN' && item.value.length === 0) {
        return ''
      }

      switch (dataItem.Fns) {
        case 'IN':
          value = `(${item.value.join(', ')})`
          break
        case 'LIKE':
          value = `'%${item.value}%'`
          break
        default:
          value = `'${item.value}'`
          break
      }

      return `${columnSql(item.id)} ${dataItem.Fns} ${value}`
    })
    .filter(Boolean)
    .join(' AND ')

  body.SQLWHERE = searchFilters
  body.sqlWhere = searchFilters

  const sqlWhereColumnFilter = columnFiltersInput.length ? getSqlWhereByColumnFilters(columnFiltersInput, tableIds) : ''

  if (body.SQLWHERE || sqlWhereColumnFilter) {
    body.SQLWHERE = `WHERE ${body.SQLWHERE} ${body.SQLWHERE && sqlWhereColumnFilter ? 'AND' : ''} ${sqlWhereColumnFilter}`
    body.sqlWhere = body.SQLWHERE
  }

  const inuseForSearch = searchFiltersInput.find((item: any) => item.id === 'inuseForSearch')
  body.SQLHAVING = ''
  body.sqlHaving = ''

  if (typeof inuseForSearch?.value !== 'undefined' && inuseForSearch.value !== '') {
    body.SQLHAVING = ` HAVING inuseForSearch = ${inuseForSearch?.value}`
    body.sqlHaving = body.SQLHAVING
  }
}
