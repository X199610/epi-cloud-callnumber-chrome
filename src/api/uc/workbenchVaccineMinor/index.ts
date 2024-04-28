import { ApiResponse } from '@/api/types'

import { GetWorkbenchVaccineMinorListReq, GetWorkbenchVaccineMinorListResData } from './types'

import { service } from '@/utils/CORSRequest'

export enum UcWorkbenchVaccineMinorApi {
  /** 获取工作台绑定的次类疫苗信息 */
  GET_WORKBENCH_VACCINE_MINOR_LIST = '/uc/workbenchVaccineMinor/getWorkbenchVaccineMinorList',
}

/** 获取工作台绑定的次类疫苗信息 */
export function getWorkbenchVaccineMinorList(params: GetWorkbenchVaccineMinorListReq) {
  return service.get<ApiResponse<GetWorkbenchVaccineMinorListResData[]>>(
    UcWorkbenchVaccineMinorApi.GET_WORKBENCH_VACCINE_MINOR_LIST,
    { params }
  )
}
