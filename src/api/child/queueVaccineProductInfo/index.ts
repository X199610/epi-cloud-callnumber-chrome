import { ApiResponse } from '@/api/types'

import {
  GetQueueVaccineProductInfoListByIdReq,
  GetQueueVaccineProductInfoListByIdResData,
  SaveQueueVaccineProductInfoReq,
} from './types'

import { service } from '@/utils/CORSRequest'

export enum ChildQueueVaccineProductInfoApi {
  /** 通过队列信息id获取疫苗产品信息 */
  GET_QUEUE_VACCINE_PRODUCT_INFO_LIST_BY_ID = '/child/queueVaccineProductInfo/getQueueVaccineProductInfoListById',
  /** 保存接种人对列绑定疫苗产品信息 */
  SAVE_QUEUE_VACCINE_PRODUCT_INFO = '/child/queueVaccineProductInfo/saveQueueVaccineProductInfo',
}
/** 通过队列信息id获取疫苗产品信息 */
export function getQueueVaccineProductInfoListById(params: GetQueueVaccineProductInfoListByIdReq) {
  return service.get<ApiResponse<GetQueueVaccineProductInfoListByIdResData[]>>(
    ChildQueueVaccineProductInfoApi.GET_QUEUE_VACCINE_PRODUCT_INFO_LIST_BY_ID,
    { params }
  )
}
/** 保存接种人对列绑定疫苗产品信息 */
export function saveQueueVaccineProductInfo(data: SaveQueueVaccineProductInfoReq[]) {
  return service.post<ApiResponse, SaveQueueVaccineProductInfoReq[]>(
    ChildQueueVaccineProductInfoApi.SAVE_QUEUE_VACCINE_PRODUCT_INFO,
    data
  )
}
