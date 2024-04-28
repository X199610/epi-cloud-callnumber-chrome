import { ChannelTypeEnum, StatusEnum, WorkbenchTypeEnum } from '../types'

export interface GetSysUserWorkbenchListReq {
  userId?: string
  deptId?: string
}

export interface GetSysUserWorkbenchListRes {
  /** 部门编号 */
  deptId: string
  /** 编号 */
  id: string
  /** 状态 0-正常 1-禁用 2-删除 */
  status: StatusEnum
  /** 工作台类型，0-取号 1-登记 2-接种 3-呼叫 4-大屏 6-狂犬接种 7-缴费 8-儿童登记 9-儿童接种 10-新冠登记 11-新冠接种 12-询问  */
  type: WorkbenchTypeEnum
  /** 工作台名称 */
  workbenchName: string
  workbenchId: string
  /** 描述 */
  screenDesc?: string
  /** 大屏备注 */
  screenRemark?: string
}
