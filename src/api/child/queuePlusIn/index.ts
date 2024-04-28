import { ApiResponse } from '@/api/types'

import {
  QueuePlusInVaccinationCallReq,
  QueuePlusInDelayReq,
  QueuePlusInRefreshReq,
  QueuePlusInVaccinationReplayReq,
  VaccinationReturnCallReq,
  TakeNextSerialNumberReq,
  TakeNextSerialNumberResData,
  QueuePlusUpdateReq,
  RevocationAndCallReq,
  RemoveQueueReq,
  QueueJumpReq,
} from './types'
import { service } from '@/utils/CORSRequest'

export enum ChildQueuePlusInApi {
  /** 播报（callQueueVo） */
  QUEUE_PLUS_IN_CALL = '/child/queuePlusIn/call',
  /** 转移人员到其他队列 */
  QUEUE_PLUS_IN_DELAY = '/child/queuePlusIn/delay',
  /** 刷新队列 */
  QUEUE_PLUS_IN_REFRESH = '/child/queuePlusIn/refresh',
  /** 接种重复播报 */
  QUEUE_PLUS_IN_REPLAY = '/child/queuePlusIn/replay',
  /** 解绑工作台 */
  QUEUE_PLUS_IN_RETURN_CALL = '/child/queuePlusIn/returnCall',
  /** 自主取号功能 */
  TAKE_NEXT_SERIAL_NUMBER = '/child/queuePlusIn/takeNextSerialNumber',
  /** 更新并绑定队列数据 */
  QUEUE_PLUS_UPDATE = '/child/queuePlusIn/updateQueue',
  /** 撤销播报 */
  REVO_CATION_AND_CALL = '/child/queuePlusIn/revocationAndCall',
  /** 移出队列 */
  REMOVE_QUEUE = '/child/vaccination/removeQueue',
  /** 插队 */
  QUEUE_JUMP = '/child/queuePlusIn/queueJump',
}

/** 播报（callQueueVo）仅添加锁定状态
 * 再次点击播报需要调用 queuePlusInDelay 将人员异动并删除
 * 随后再次调用  queuePlusInVaccinationCall 将下一人给予锁定状态
 */
export function queuePlusInVaccinationCall(data: QueuePlusInVaccinationCallReq) {
  return service.post<ApiResponse, QueuePlusInVaccinationCallReq>(ChildQueuePlusInApi.QUEUE_PLUS_IN_CALL, data)
}

/** 转移人员到其他队列 */
export function queuePlusInDelay(data: QueuePlusInDelayReq) {
  return service.post<ApiResponse, QueuePlusInDelayReq>(ChildQueuePlusInApi.QUEUE_PLUS_IN_DELAY, data)
}

/** 刷新队列 */
export function queuePlusInRefresh(data: QueuePlusInRefreshReq) {
  return service.post<ApiResponse, QueuePlusInRefreshReq>(ChildQueuePlusInApi.QUEUE_PLUS_IN_REFRESH, data)
}

/** 接种重复播报 */
export function queuePlusInVaccinationReplay(data: QueuePlusInVaccinationReplayReq) {
  return service.post<ApiResponse, QueuePlusInVaccinationReplayReq>(ChildQueuePlusInApi.QUEUE_PLUS_IN_REPLAY, data)
}

/** 解绑工作台 */
export function vaccinationReturnCall(data: VaccinationReturnCallReq) {
  return service.post<ApiResponse, VaccinationReturnCallReq>(ChildQueuePlusInApi.QUEUE_PLUS_IN_RETURN_CALL, data)
}

/** 自主取号功能 */
export function takeNextSerialNumber(data: TakeNextSerialNumberReq) {
  return service.post<ApiResponse<TakeNextSerialNumberResData>, TakeNextSerialNumberReq>(
    ChildQueuePlusInApi.TAKE_NEXT_SERIAL_NUMBER,
    data
  )
}

/** 更新并绑定队列数据 */
export function queuePlusUpdate(data: QueuePlusUpdateReq) {
  return service.post<ApiResponse, QueuePlusUpdateReq>(ChildQueuePlusInApi.QUEUE_PLUS_UPDATE, data)
}

/** 延迟队列撤销播报 */
export function revocationAndCall(data: RevocationAndCallReq) {
  return service.post<ApiResponse, RevocationAndCallReq>(ChildQueuePlusInApi.REVO_CATION_AND_CALL, data)
}

/** 移出队列 */
export function removeQueue(data: RemoveQueueReq) {
  return service.post<ApiResponse, RemoveQueueReq>(ChildQueuePlusInApi.REMOVE_QUEUE, data)
}

/** 插队 */
export function queueJump(data: QueueJumpReq) {
  return service.post<ApiResponse, QueueJumpReq>(ChildQueuePlusInApi.QUEUE_JUMP, data)
}
