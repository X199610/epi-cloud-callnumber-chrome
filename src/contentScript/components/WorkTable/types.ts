import { OrderDrugsMore, StatusEnum } from '@/api/fetchSeedlings/types'
import { GetWorkbenchChannelRes } from '@/api/uc/workbenchChannel/types'
import { WsMessageContent } from '@/ws/WorkBenchWs/types'

export interface BtnsItem {
  /** default_icon */
  icon: string
  active_icon: string
  /** 按钮名称 */
  label: ControlsEnum
  /** 按钮是否禁用 */
  disabled: boolean
  /** 当前是否使用 */
  isActive: boolean
}
/**
 *2024-04-24
  * 重播、自动播报、完成、延时 =>
  * 呼叫、自动、完成、跳过
 */
export enum ControlsEnum {
  /** 播报 */
  PLAY = '播报',
  /** 自动播报 2024-03-04 */
  AUTO_PLAY = '自动',
  /** 暂停
   * 2024-02-06 其实际效果为了弥补播报一直自动往下播报下一位受种者
   * 类似于完成功能
   */
  ACCOMPLISH = '完成',
  /** 重播 */
  REPALY = '呼叫',
  /** 延时 */
  DELAY = '跳过',
  /** 刷新 */
  REFRESH = '刷新',
  /** 异常 */
  ERROR = '异常',
  /** 取苗 2024-01-10 取苗机器对应功能
   * 2024-03-04 取苗按钮结合到接种队列操作中
   */
  // FETCH_SEEDLINGS = '取苗',
}

export interface QueueBtnItem extends GetWorkbenchChannelRes {
  data: WsMessageContent[]
}

export enum CurPlayTypeEnum {
  /** 自动 */
  AUTO = '自动播报',
  /** 手动 */
  MANUAL_OPERATION = '播报',
}
export const curPlayTypeKV: Record<CurPlayTypeEnum, string> = {
  [CurPlayTypeEnum.AUTO]: '切换到手动播报',
  [CurPlayTypeEnum.MANUAL_OPERATION]: '切换到自动播报',
}

export interface SomeTableDataItem extends WsMessageContent {
  /** 外部状态 中文 */
  statusDisplay?: string
  /** 内部状态 */
  status?: StatusEnum
  /** 错误消息 */
  message?: string
  /** 药品信息 */
  orderDrugs?: OrderDrugsMore[]
  /** 任务最近一次更新时间 2023-10-28 10:00:00 */
  updateTime?: string
}
