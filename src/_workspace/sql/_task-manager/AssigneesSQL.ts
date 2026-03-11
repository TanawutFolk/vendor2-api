export const AssigneesSQL = {
    search: (filters: any) => {
        let sql = `
            SELECT 
                Assignees_id, 
                empcode, 
                empName, 
                empEmail, 
                group_name, 
                INUSE 
            FROM assignees_to 
            WHERE 1=1
        `

        if (filters.keyword) {
            sql += ` AND (empName LIKE '%${filters.keyword}%' OR empcode LIKE '%${filters.keyword}%' OR empEmail LIKE '%${filters.keyword}%')`
        }

        if (filters.group_name) {
            sql += ` AND group_name = '${filters.group_name}'`
        }

        if (filters.in_use && filters.in_use !== '') {
            sql += ` AND INUSE = ${filters.in_use}`
        }

        sql += ` ORDER BY group_name, empcode ASC`

        return sql
    },

    insert: (data: any) => {
        let sql = `
            INSERT INTO assignees_to (empcode, empName, empEmail, group_name, INUSE)
            VALUES (
                '${data.empcode}',
                '${data.empName}',
                '${data.empEmail}',
                '${data.group_name}',
                ${data.INUSE !== undefined ? data.INUSE : 1}
            )
        `
        return sql
    },

    update: (data: any) => {
        let sql = `
            UPDATE assignees_to SET
                empcode = '${data.empcode}',
                empName = '${data.empName}',
                empEmail = '${data.empEmail}',
                group_name = '${data.group_name}',
                INUSE = ${data.INUSE !== undefined ? data.INUSE : 1}
            WHERE Assignees_id = ${Number(data.Assignees_id)}
        `
        return sql
    },

    delete: (id: number) => {
        let sql = `
            DELETE FROM assignees_to WHERE Assignees_id = ${Number(id)}
        `
        return sql
    }
}
