export interface AssigneesDataItem {
    Assignees_id?: number | string;
    empcode?: string;
    empName?: string;
    empEmail?: string;
    group_name?: string;
    INUSE?: number | string;
    keyword?: string;
    in_use?: string | number;
}

export const AssigneesSQL = {
    search: (dataItem: AssigneesDataItem) => {
        let sql = `
                            SELECT 
                                       Assignees_id
                                     , empcode
                                     , empName
                                     , empEmail
                                     , group_name
                                     , INUSE 
                            FROM
                                       assignees_to 
                            WHERE
                                       1 = 1
                                       dataItem.keywordSql
                                       dataItem.groupSql
                                       dataItem.inUseSql
                            ORDER BY
                                       group_name, empcode ASC
        `

        let keywordSql = ''
        if (dataItem.keyword) {
            keywordSql = ` AND (empName LIKE 'keywordVal' OR empcode LIKE 'keywordVal' OR empEmail LIKE 'keywordVal')`
            const keywordVal = `%${dataItem.keyword}%`
            keywordSql = keywordSql.replaceAll('keywordVal', keywordVal)
        }

        let groupSql = ''
        if (dataItem.group_name) {
            groupSql = ` AND group_name = 'dataItem.group_name'`
        }

        let inUseSql = ''
        if (dataItem.in_use && dataItem.in_use !== '') {
            inUseSql = ` AND INUSE = dataItem.in_use`
        }

        sql = sql.replaceAll('dataItem.keywordSql', keywordSql)
        sql = sql.replaceAll('dataItem.groupSql', groupSql)
        sql = sql.replaceAll('dataItem.inUseSql', inUseSql)
        sql = sql.replaceAll('dataItem.group_name', dataItem.group_name || '')
        sql = sql.replaceAll('dataItem.in_use', (dataItem.in_use || 0).toString())

        return sql
    },

    insert: (dataItem: AssigneesDataItem) => {
        let sql = `
                            INSERT INTO assignees_to (
                                       empcode
                                     , empName
                                     , empEmail
                                     , group_name
                                     , INUSE
                            )
                            VALUES (
                                       'dataItem.empcode'
                                     , 'dataItem.empName'
                                     , 'dataItem.empEmail'
                                     , 'dataItem.group_name'
                                     ,  dataItem.INUSE
                            )
        `
        sql = sql.replaceAll('dataItem.empcode', dataItem.empcode || '')
        sql = sql.replaceAll('dataItem.empName', dataItem.empName || '')
        sql = sql.replaceAll('dataItem.empEmail', dataItem.empEmail || '')
        sql = sql.replaceAll('dataItem.group_name', dataItem.group_name || '')
        sql = sql.replaceAll('dataItem.INUSE', (dataItem.INUSE !== undefined ? dataItem.INUSE : 1).toString())

        return sql
    },

    update: (dataItem: AssigneesDataItem) => {
        let sql = `
                            UPDATE assignees_to SET
                                       empcode = 'dataItem.empcode'
                                     , empName = 'dataItem.empName'
                                     , empEmail = 'dataItem.empEmail'
                                     , group_name = 'dataItem.group_name'
                                     , INUSE = dataItem.INUSE
                            WHERE
                                       Assignees_id = dataItem.Assignees_id
        `
        sql = sql.replaceAll('dataItem.empcode', dataItem.empcode || '')
        sql = sql.replaceAll('dataItem.empName', dataItem.empName || '')
        sql = sql.replaceAll('dataItem.empEmail', dataItem.empEmail || '')
        sql = sql.replaceAll('dataItem.group_name', dataItem.group_name || '')
        sql = sql.replaceAll('dataItem.INUSE', (dataItem.INUSE !== undefined ? dataItem.INUSE : 1).toString())
        sql = sql.replaceAll('dataItem.Assignees_id', (dataItem.Assignees_id || 0).toString())

        return sql
    },

    delete: (dataItem: { Assignees_id: number | string }) => {
        let sql = `
                            DELETE FROM
                                       assignees_to
                            WHERE
                                       Assignees_id = dataItem.Assignees_id
        `
        sql = sql.replaceAll('dataItem.Assignees_id', (dataItem.Assignees_id || 0).toString())
        return sql
    }
}
