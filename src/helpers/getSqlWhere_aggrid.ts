import { getSqlWhereByColumnFilters } from './getSqlWhereByFilterColumn'

/**
 * getSqlWhere_aggrid
 * 
 * SQL helper designed for AG Grid Server-Side Row Model.
 * 
 * Key difference from getSqlWhere_elysia / getSqlWhere:
 *   - AG Grid sends `Start` as actual row offset (0, 100, 200) — NOT page index (0, 1, 2)
 *   - So we use `Start` directly as `Offset`, WITHOUT multiplying by `Limit`
 * 
 * Input body shape (from AG Grid getRows):
 *   - SearchFilters: [{ id: string, value: any }]
 *   - ColumnFilters: [{ column: string, value: string, columnFns?: string }]
 *   - Order: [{ id: string, desc: boolean }]
 *   - Start: number  ← row offset (e.g. 0, 100, 200)
 *   - Limit: number  ← rows per block (e.g. 100)
 * 
 * Output (mutates body):
 *   - body.Offset  = Start (row offset, used directly in SQL OFFSET)
 *   - body.Order   = SQL ORDER BY string
 *   - body.sqlWhere = SQL WHERE string
 *   - body.sqlHaving = SQL HAVING string (for computed columns like inuseForSearch)
 */
export default function getSqlWhere_aggrid(body: any, tableIds: any, orderByDefault: string = 'UPDATE_DATE') {
    // ── Pagination ──────────────────────────────────────────────────────
    // AG Grid sends Start as actual row offset → use directly, do NOT multiply
    body.Offset = Number(body.Start || 0)

    // ── ORDER BY ────────────────────────────────────────────────────────
    let orderBy = body.Order && body.Order.length
        ? body.Order.filter((item: any) => item.id !== 'inuseForSearch')
            .map(
                (item: any) =>
                    `${tableIds.find((i: any) => i.id === item.id)?.table ? tableIds.find((i: any) => i.id === item.id)?.table + '.' : ''}${item.id} ${item.desc ? 'DESC' : 'ASC'}`
            )
            .join(', ')
        : `${tableIds.find((i: any) => i.id === orderByDefault)?.table ? tableIds.find((i: any) => i.id === orderByDefault)?.table + '.' : ''}${orderByDefault} DESC`

    // Handle inuseForSearch special sort
    if (body.Order && Array.isArray(body.Order)) {
        const inuseForSearchOrder = body.Order.find((item: any) => item.id === 'inuseForSearch')
        if (typeof inuseForSearchOrder?.desc !== 'undefined') {
            orderBy = orderBy.length
                ? (orderBy += ` , inuseForSearch ${inuseForSearchOrder.desc ? 'DESC' : 'ASC'}`)
                : `inuseForSearch ${inuseForSearchOrder.desc ? 'DESC' : 'ASC'}`
        }
    }

    body.Order = orderBy

    // ── WHERE (SearchFilters) ───────────────────────────────────────────
    const searchFilters = (body.SearchFilters || [])
        .filter((item: any) => item.value !== '' && item.value !== null && item.value !== undefined)
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

            return `${dataItem.table ? dataItem.table + '.' : ''}${item.id} ${dataItem.Fns} ${value}`
        })
        .filter(Boolean)
        .join(' AND ')

    body.sqlWhere = searchFilters

    // ── WHERE (ColumnFilters) ───────────────────────────────────────────
    const sqlWhereColumnFilter = (body.ColumnFilters && body.ColumnFilters.length)
        ? getSqlWhereByColumnFilters(body.ColumnFilters, tableIds)
        : ''

    if (body.sqlWhere || sqlWhereColumnFilter) {
        body.sqlWhere = `WHERE ${body.sqlWhere} ${body.sqlWhere && sqlWhereColumnFilter ? 'AND' : ''} ${sqlWhereColumnFilter}`
    }

    // ── HAVING (inuseForSearch) ─────────────────────────────────────────
    const inuseForSearch = (body.SearchFilters || []).find((item: any) => item.id === 'inuseForSearch')
    body.sqlHaving = ''

    if (typeof inuseForSearch?.value !== 'undefined' && inuseForSearch.value !== '') {
        body.sqlHaving = ` HAVING inuseForSearch = ${inuseForSearch?.value}`
    }
}
