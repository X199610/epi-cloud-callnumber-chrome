import CORSGetVaccinesRequestService, { createService, initServiceOpt } from '@/utils/CORSGetVaccinesRequest'
import { SendOrderReq, GetOrdersReq, GetOrdersResData } from './types'
import StorageUtil from '@/utils/storage'
import Msg from '@/utils/message'
import { getQueueConfigByDeptId } from '../uc/queueConfig'
import { FMApiResponse } from '../types'

export enum FetchSeedlingsApi {
  /** 发苗 */
  SEND_ORDER = 'api/order/sendOrder',
  /** 疫苗订单列表 */
  GET_ORDERS = 'api/order/getOrders',
  /** 撤回中控任务 */
  WITH_DRAW = 'api/order/withDraw',
}

let service: CORSGetVaccinesRequestService | null

async function setUpService() {
  const queueConfig = await StorageUtil.getItem('queueConfig')
  if (!queueConfig?.catchVaccineUrl) {
    const userBaseInfo = await StorageUtil.getItem('userBaseInfo')
    const { data } = await getQueueConfigByDeptId(userBaseInfo?.deptId || '')
    await StorageUtil.setItem('queueConfig', data)
  }
  if (service) return service
  service = createService({ baseURL: queueConfig?.catchVaccineUrl, ...initServiceOpt })
  return service
}

/** 让中控发苗 */
export async function sendOrder(data: SendOrderReq) {
  return (await setUpService()).post<FMApiResponse<boolean>, SendOrderReq>(FetchSeedlingsApi.SEND_ORDER, data)
}

/** 获取任务列表 */
export async function getOrders(data: GetOrdersReq) {
  return (await setUpService()).post<FMApiResponse<GetOrdersResData[]>, GetOrdersReq>(FetchSeedlingsApi.GET_ORDERS, data)
}

/** 撤回中控任务 */
export async function withDrawOrder(presNO: string) {
  return (await setUpService()).get<FMApiResponse<boolean>>(FetchSeedlingsApi.WITH_DRAW, {
    params: { presNO },
  })
}
