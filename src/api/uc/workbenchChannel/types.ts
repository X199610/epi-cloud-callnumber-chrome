import { PageReq } from '@/api/types'
import { ChannelTypeEnum, StatusEnum, WorkbenchTypeEnum } from '../types'

/** 工作台管理-查询工作台信息列表（传参） */
export interface GetWorkbenchReq extends PageReq {
  /** 部门编号 */
  deptId: string
  /** 状态 0-正常 1-禁用 2-删除 */
  status?: StatusEnum
  /** 工作台类型，0-取号 1-登记 2-接种 3-呼叫 4-大屏 6-狂犬接种 7-缴费 8-儿童登记 9-儿童接种 10-新冠登记 11-新冠接种 12-询问  */
  type?: WorkbenchTypeEnum
}

/** 工作台管理-查询工作台信息列表（返回值） */
export interface GetWorkbenchRes {
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
  /** 编号数组 */
  idArr?: string[]
  /** 描述 */
  screenDesc?: string
  /** 大屏备注 */
  screenRemark?: string
}

/** 工作台管理-查询工作台通道配置信息列表 （传参） */
export interface GetWorkbenchChannelReq {
  /** 部门编号 */
  deptId: string
  /** 工作台ID */
  workbenchId: string
}

/** 工作台管理-查询工作台通道配置信息列表 （返回值） */
export interface GetWorkbenchChannelRes {
  /** 通道代码 */
  channelCode: string
  /** 通道ID */
  channelId: string
  /** 通道名 */
  channelName: string
  /** 通道类型 */
  channelType: ChannelTypeEnum
  /** 创建时间 */
  createTime: string
  /** 机构id */
  deptId: string
  /** 序号 */
  id: string
  /** 编号数组 */
  idArr?: string[]
  /** 通道状态 */
  status: StatusEnum
  /** 工作台Id */
  workbenchId: string
}

/** 获取工作台的工作状态（传参） */
export interface GetWorkStatusReq {
  /** 部门编号 */
  deptId: string
  /** 工作台ID */
  workbenchId: string
}

/** 设置工作台的工作状态（传参） */
export interface SetWorkStatusReq {
  /** 部门编号 */
  deptId: string
  /** 工作台ID */
  workbenchId: string
  /** 工作状态 1-开启 0-关闭*/
  status: string
}