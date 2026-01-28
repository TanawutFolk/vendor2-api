// import mysql, { Connection, ConnectionOptions } from 'mysql2/promise'

// const connection = async (configDb: string = ''): Promise<Connection> => {
//   try {
//     const access: ConnectionOptions = {
//       multipleStatements: true,
//       host: process.env[`${configDb ? `${configDb}_` : ''}HOST`],
//       user: process.env[`${configDb ? `${configDb}_` : ''}USER_NAME`],
//       password: process.env[`${configDb ? `${configDb}_` : ''}PASSWORD`],
//       database: process.env[`${configDb ? `${configDb}_` : ''}DB`],
//       decimalNumbers: true, // This option is required to avoid rounding numbers
//       // supportBigNumbers: true,
//       // bigNumberStrings: true,
//     }

//     const con = await mysql.createConnection(access)
//     return con
//   } catch (error) {
//     console.error('Database connection failed:', error)
//     throw error
//   }
// }

// export { connection }

// db.ts
import mysql, { Pool, PoolConnection, PoolOptions } from 'mysql2/promise'
import oracledb from 'oracledb'


const oraclePools = new Map<string, oracledb.Pool>()

const connectionOracle = async (configDb: string = ''): Promise<oracledb.Connection> => {
  const key = configDb || 'DEFAULT'

  if (!oraclePools.has(key)) {
    const dbConfig = {
      user: process.env[`${configDb ? `${configDb}_` : ''}USER_NAME`],
      password: process.env[`${configDb ? `${configDb}_` : ''}PASSWORD`],
      connectString: process.env[`${configDb ? `${configDb}_` : ''}HOST`],
      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1
    }

    const pool = await oracledb.createPool(dbConfig)
    oraclePools.set(key, pool)
  }

  return oraclePools.get(key)!.getConnection()
}

const pools = new Map<string, Pool>()

const connection = async (configDb: string = ''): Promise<PoolConnection> => {
  const key = configDb || 'DEFAULT'

  if (!pools.has(key)) {
    const access: PoolOptions = {
      multipleStatements: true,

      host: process.env[`${configDb ? `${configDb}_` : ''}HOST`],
      user: process.env[`${configDb ? `${configDb}_` : ''}USER_NAME`],
      password: process.env[`${configDb ? `${configDb}_` : ''}PASSWORD`],
      database: process.env[`${configDb ? `${configDb}_` : ''}DB`],

      decimalNumbers: true,

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
    }

    const pool = mysql.createPool(access)
    pools.set(key, pool)
  }

  return pools.get(key)!.getConnection()
}

export { connection, connectionOracle }
