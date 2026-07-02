import { MySQLExecute } from '@businessData/dbExecute'
import { EnvironmentCertificateSQL } from '@src/_workspace/sql/environment-certificate/EnvironmentCertificateSQL'
import { RowDataPacket } from 'mysql2'

export const EnvironmentCertificateService = {
  search: async (dataItem: any) => {
    const sql = await EnvironmentCertificateSQL.search(dataItem)
    const resultData = (await MySQLExecute.searchList(sql)) as RowDataPacket[]
    return resultData
  },
  getByLikeEnvironmentCertificateNameAndInuse: async (dataItem: any) => {
    const sql = await EnvironmentCertificateSQL.getByLikeEnvironmentCertificateNameAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  getByLikeProductMainNameAndProductCategoryIdAndInuse: async (dataItem: any) => {
    const sql = await EnvironmentCertificateSQL.getByLikeProductMainNameAndProductCategoryIdAndInuse(dataItem)
    const resultData = await MySQLExecute.search(sql)
    return resultData
  },
  create: async (dataItem: any) => {
    const sql = await EnvironmentCertificateSQL.create(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
  update: async (dataItem: any) => {
    const sql = await EnvironmentCertificateSQL.update(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
  delete: async (dataItem: any) => {
    const sql = await EnvironmentCertificateSQL.delete(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
  getAllByLikeInuse: async (dataItem: any) => {
    const sql = await EnvironmentCertificateSQL.getAllByLikeInuse(dataItem)
    const resultData = await MySQLExecute.execute(sql)
    return resultData
  },
}
