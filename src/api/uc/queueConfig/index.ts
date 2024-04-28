import { ApiResponse } from '@/api/types'
import { service } from '@/utils/CORSRequest'
import { GetQueueConfigByDeptIdRes } from './types'

export enum UcQueueConfigApi {
  /** 根据单位id查询自己的预约配置 */
  GET_QUEUE_CONFIG_BY_DEPTID = '/uc/queueConfig/getQueueConfigByDeptId',
}

/** 根据单位id查询自己的预约配置 */
export function getQueueConfigByDeptId(deptId: string) {
  return service.get<ApiResponse<GetQueueConfigByDeptIdRes>>(`${UcQueueConfigApi.GET_QUEUE_CONFIG_BY_DEPTID}/${deptId}`)
}
