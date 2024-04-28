import { ChannelTypeEnum } from '@/api/uc/types'

/** 播报（callQueueVo）-入参 */
export type QueuePlusInVaccinationCallReq = CallQueueVo
export interface CallQueueVo {
  /** 通道编号 */
  channelId: string
  /** 部门编号 */
  deptId: string
  /** 目的通道编号 */
  targetChannelId: string
  /** 工作台编号 */
  workbenchId: string
  /** 队列号（重复播报不能为空） */
  queueNum?: string
  /** 发送者 */
  sendName?: string
  /** 呼叫类型 0- 询问 1- 登记 2- 接种 3- 儿保 */
  type?: CallTypeEnum
  /** 接种人姓名（重复播报不能为空） */
  userName?: string
  /** 接种疫苗名称 */
  vaccineName?: string
  /** 预绑定工作台名称 */
  preBindWorkbench?: string
  /** 预绑定工作台id */
  preBindWorkbenchId?: string
  /** 播报时间 */
  preBindTime?: string
}
/** 返回的信息-队列信息 */
export interface WsReturnQueueVo {
  /** 通道编号 */
  channelId: string
  /** 部门编号 */
  deptId: string
  /** 队列号（不传默认操作第一个） */
  queueNum: string
  /** 预约时间点 */
  appointTime?: string //
  /** 接种人出生日期 */
  birthday?: string
  /** 接种人个案id */
  childInfoId?: string
  /** 个案编码 */
  code?: string
  /** 过期时间,默认当天有效 */
  expireTime?: number
  /** 队列编号 */
  id?: string
  /** 队列号类型 */
  queueNumType?: string
  /** 取号类型，0-成人，1-狂犬，2-儿童 */
  queueType?: TakeNumTypeEnum
  /** 是否预约 */
  reservation?: ReservationEnum
  /** 第二通道 */
  secondChannelId?: string
  /** 发送者 */
  sendName?: string
  /** 接种人性别 */
  sex?: string
  /** 子通道队列列表 */
  subChannelVoList?: []
  /** 接种人姓名 */
  userName?: string
  /** 接种日期 */
  vaccinationTime?: number
  /** 疫苗列表 */
  vaccineVoList?: []
  /** 工作台 */
  workbench?: string
  /** 工作台编号 */
  workbenchId?: string
}

/** 转移人员到其他队列-入参 */
export interface QueuePlusInDelayReq {
  /** 部门编号 */
  deptId: string
  /** 候诊号 */
  queueNum: string
  /** 源通道编号 */
  sourceChannelId: string
  /** 目的通道编号 */
  targetChannelId: string
  /** 延迟时间 */
  expireTime?: number
  /** 队列信息主键(确认接种不能为空) */
  id?: string
  /** orderType */
  orderType?: string
  /** queueType */
  queueType?: ChannelTypeEnum
  /** 发送者 */
  sendName?: string
  /** 接种日期 */
  vaccinationTime?: number
  /** 疫苗信息列表 */
  vaccineVoList?: VaccineVo[]
  /** 工作台编号 */
  workbenchId?: string
  
  /** 预绑定工作台名称 */
  preBindWorkbench?: string
  /** 预绑定工作台id */
  preBindWorkbenchId?: string
}

/** 疫苗信息列表 */
export interface VaccineVo {
  /** 接种注意事项 */
  announcements?: string
  /** 电子追溯码 */
  electronicCode?: string
  /** 有效期 */
  expiryDate?: string
  /** 是否免费 */
  isFree?: string
  /** 疫苗批号 */
  lotNumber?: string
  /** 生产厂家名称 */
  manufacturerName?: string
  /** 针次 */
  needleNum?: string
  /** 接种医生 */
  vaccinationDoctor?: string
  /** 接种部位 */
  vaccinationPart?: string
  /** 疫苗大类名称 */
  vaccineMajorName?: string
  /** 疫苗次类编码 */
  vaccineMinorCode?: string
  /** 疫苗名称 */
  vaccineName?: string
  /** 接种途径 */
  vaccineRoute?: string
}

/** 刷新队列-入参 */
export interface QueuePlusInRefreshReq {
  /** 源通道编号 */
  channelId: string
  /** 部门编号 */
  deptId: string
}

/** 接种重复播报-入参 */
export type QueuePlusInVaccinationReplayReq = Omit<CallQueueVo, 'targetChannelId'>
/** 解绑工作台-入参 */
export interface VaccinationReturnCallReq {
  /** 通道id */
  channelId: string
  /** 部门编号 */
  deptId: string
  /** 队列号（不传默认操作第一个） */
  queueNum: string
  /** 预约时间点 */
  appointTime?: string
  /** 接种人出生日期 */
  birthday?: string
  /** 接种人个案id */
  childInfoId?: string
  /** 个案编码 */
  code?: string
  /** 过期时间,默认当天有效 */
  expireTime?: number
  /** 队列编号 */
  id?: string
  /** 队列号类型 */
  queueNumType?: string
  /** 取号类型，0-成人，1-狂犬，2-儿童 */
  queueType?: TakeNumTypeEnum
  /** 是否预约 */
  reservation?: ReservationEnum
  /** 第二通道 */
  secondChannelId?: string
  /** 发送者 */
  sendName?: string
  /** 接种人性别 */
  sex?: string
  /** 子通道队列列表 */
  subChannelVoList?: SubChannelVo[]
  /** 接种人姓名 */
  userName?: string
  /** 接种日期 */
  vaccinationTime?: number
  /** 疫苗信息列表 */
  vaccineVoList?: VaccineVo[]
  /** 工作台 */
  workbench?: string
  /** 工作台编号 */
  workbenchId?: string
}

/** 子通道队列列表 */
export interface SubChannelVo {
  /** 通道代码 */
  channelCode?: string
  /** 通道名 */
  channelName?: string
  /** 通道类型 0-登记 1-接种 2-留观 3-延迟 4-告知 5-呼叫 6-缴费 7-预检 */
  channelType?: string
  /** 创建时间 */
  createTime?: string
  /** 创建者 */
  createUser?: string
  /** 部门编号 */
  deptId?: string
  /** 主键，采用32位UUID */
  id?: string
  /** 最后发送时间 */
  lastSendDate?: string
  /** 修改时间 */
  modifyTime?: string
  /** 修改者 */
  modifyUser?: string
  /** 父通道编码 */
  parentChannelCode?: string
  /** 父通道id */
  parentChannelId?: string
  /** 状态 0-正常 1-禁用 2-删除 */
  status?: string
}

/** 自主取号功能-入参 */
export interface TakeNextSerialNumberReq {
  /** 个案编码 */
  code: string
  /** 通道id */
  channelId: string
  /** 部门编号 */
  deptId: string
}
/** 自主取号功能-响应 */
export type TakeNextSerialNumberResData = SubChannelVo

/** 更新并绑定队列数据-入参 */
export interface QueuePlusUpdateReq {
  /** 通道id */
  channelId: string
  /** 部门编号 */
  deptId: string
  /** 队列号（不传默认操作第一个） */
  queueNum: string
  /** 个案编码 */
  code: string
  /** 队列编号 */
  id: string
  /** 接种人姓名 */
  userName: string
  /** 身份证号 */
  idCard: string
  /** 性别 */
  sex: string
  /** 出生日期 */
  birthday: string
  /** 通道类型 */
  queueType?: ChannelTypeEnum
  /** 预绑定工作台名称 */
  preBindWorkbench?: string
  /** 预绑定工作台id */
  preBindWorkbenchId?: string
}

/** 撤销播报-传参 */
export interface RevocationAndCallReq {
  /** 撤销对象 */
  queueTransferVo: QueueTransferVo
  /** 播报对象 */
  callQueueVo: CallQueueVo
}

export interface QueueTransferVo {
  /** * 部门编号 */
  deptId: string
  /** * 延迟时间 */
  expireTime?: number
  /** * 队列信息主键(确认接种不能为空) */
  id?: string
  orderType?: string
  /** * 候诊号 */
  queueNum: string
  queueType?: string
  /** * 发送者 */
  sendName?: string
  /** * 源通道编号 */
  sourceChannelId: string
  /** * 目的通道编号 */
  targetChannelId: string
  /** * 接种日期 */
  vaccinationTime?: number
  /** 疫苗信息列表 */
  vaccineVoList?: VaccineVo[]
  workbenchId?: string
}

// 移出队列传参
export interface RemoveQueueReq {
  deptId?: string
  queueNum?: string
  channelId?: string
}

// 插队传感
export interface QueueJumpReq {
  /** 部门编号 */
  deptId: string
  /** 候诊号 */
  queueNum: string
  /** 源通道编号 */
  sourceChannelId: string
  /** 目的通道编号 */
  targetChannelId: string
  /** 延迟时间 */
  expireTime?: number
  /** 队列信息主键(确认接种不能为空) */
  id?: string
  /** orderType */
  orderType?: string
  /** queueType */
  queueType?: ChannelTypeEnum
  /** 发送者 */
  sendName?: string
  /** 接种日期 */
  vaccinationTime?: number
  /** 疫苗信息列表 */
  vaccineVoList?: VaccineVo[]
  /** 工作台编号 */
  workbenchId?: string
}

/** 呼叫类型 0-询问 1-登记 2-接种 3-儿保 */
export enum CallTypeEnum {
  /** 询问 */
  INQUIRY = '0',
  /** 登记 */
  REGISTRATION = '1',
  /** 接种 */
  VACCINATION = '2',
  /** 儿保 */
  CHILD_CARE = '3',
}

/** 呼叫类型的键值对映射 */
export const callTypeKV: Record<CallTypeEnum, string> = {
  [CallTypeEnum.INQUIRY]: '询问',
  [CallTypeEnum.REGISTRATION]: '登记',
  [CallTypeEnum.VACCINATION]: '接种',
  [CallTypeEnum.CHILD_CARE]: '儿保',
}

/** 取号类型，0-成人，1-狂犬，2-儿童 */
export enum TakeNumTypeEnum {
  /** 成人 */
  ADULT = '0',
  /** 狂犬 */
  RABIES = '1',
  /** 儿童 */
  CHILD = '2',
}

/** 取号类型的键值对映射 */
export const takeNumTypeKV: Record<TakeNumTypeEnum, string> = {
  /** 成人 */
  [TakeNumTypeEnum.ADULT]: '成人',
  /** 狂犬 */
  [TakeNumTypeEnum.RABIES]: '狂犬',
  /** 儿童 */
  [TakeNumTypeEnum.CHILD]: '儿童',
}

/** 状态 0-正常 1-禁用 2-删除 */
export enum StatusEnum {
  /** 正常 */
  NORMAL = '0',
  /** 禁用 */
  DISABLED = '1',
  /** 删除 */
  DELETED = '2',
}

/** 状态的键值对映射 */
export const statusKV: Record<StatusEnum, string> = {
  /** 正常 */
  [StatusEnum.NORMAL]: '正常',
  /** 禁用 */
  [StatusEnum.DISABLED]: '禁用',
  /** 删除 */
  [StatusEnum.DELETED]: '删除',
}

/** 是否预约枚举 */
export enum ReservationEnum {
  /** 现场 */
  ONSITE = '1',
  /** 预约 */
  RESERVED = '2',
}

/** 是否预约的键值对映射 */
export const reservationKV: Record<ReservationEnum, string> = {
  /** 现场 */
  [ReservationEnum.ONSITE]: '现场',
  /** 预约 */
  [ReservationEnum.RESERVED]: '预约',
}
