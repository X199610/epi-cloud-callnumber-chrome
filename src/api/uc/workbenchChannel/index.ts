import { ApiResponse } from '@/api/types'
import { GetWorkbenchReq, GetWorkbenchRes, GetWorkbenchChannelReq, GetWorkbenchChannelRes, GetWorkStatusReq, SetWorkStatusReq } from './types'
import { service } from '@/utils/CORSRequest'

export enum UcWorkbenchChannelApi {
  /** 工作台管理-查询工作台信息列表 */
  GET_WORK_BENCH = '/uc/workbenchChannel/getWorkbench',
  /** 工作台管理-查询工作台通道配置信息列表 */
  GET_WORK_BENCH_CHANNEL = '/uc/workbenchChannel/getWorkbenchChannel',

  /** 工作台管理-获取工作台的工作状态 */
  GET_WORK_STATUS = '/uc/workbenchChannel/getWorkStatus',

  /** 工作台管理-设置工作台的工作状态 */
  SET_WORK_STATUS = '/uc/workbenchChannel/setWorkStatus',
}

/** 工作台管理-查询工作台信息列表 */
export async function getWorkbench(params: GetWorkbenchReq) {
  return service.get<ApiResponse<GetWorkbenchRes[]>>(UcWorkbenchChannelApi.GET_WORK_BENCH, { params })
}

/** 工作台管理-分页查询工作台通道配置信息列表 */
export function getWorkbenchChannel(params: GetWorkbenchChannelReq) {
  return service.get<ApiResponse<GetWorkbenchChannelRes[]>>(UcWorkbenchChannelApi.GET_WORK_BENCH_CHANNEL, {
    params,
  })
}

/** 工作台管理-获取工作台的工作状态 */
export function getWorkStatus(params: GetWorkStatusReq) {
  return service.get<ApiResponse<string>>(UcWorkbenchChannelApi.GET_WORK_STATUS, {
    params,
  })
}

/** 工作台管理-设置工作台的工作状态 */
export function setWorkStatus(params: SetWorkStatusReq) {
  return service.get<ApiResponse<string>>(UcWorkbenchChannelApi.SET_WORK_STATUS, {
    params,
  })
}
