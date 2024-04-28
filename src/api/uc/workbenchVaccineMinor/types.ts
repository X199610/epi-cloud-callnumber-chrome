import { StatusEnum } from '../types'

/** 获取工作台绑定的次类疫苗信息-入参 */
export interface GetWorkbenchVaccineMinorListReq {
  /** 机构id */
  deptId: string
  /** 工作台id */
  workbenchId: string
}
/** 获取工作台绑定的次类疫苗信息-响应 */
export interface GetWorkbenchVaccineMinorListResData {
  /** 创建日期 */
  createTime: string
  /** 创建人 */
  createUser: string
  /** 部门编号 */
  deptId: string
  /** 32位主键 */
  id: string
  /** 修改时间 */
  modifyTime: string
  /** 修改人 */
  modifyUser: string
  /** 状态 0-正常 1-禁用 2-删除 */
  status: StatusEnum
  /** 疫苗次类编码 */
  vaccineMinorCode: string
  /** 次类疫苗id */
  vaccineMinorId: string
  /** 疫苗次类名称 */
  vaccineMinorName: string
  /** 工作台ID */
  workbenchId: string
}
