import { ApiResponse } from '@/api/types'
import { GetSysUserWorkbenchListReq, GetSysUserWorkbenchListRes } from './types'
import { service } from '@/utils/CORSRequest'

export enum UcSysUserWorkbenchApi {
  /** 获取当前用户绑定工作台 */
  GET_SYS_USER_WORKBENCH_LIST = '/uc/sysUserWorkbench/getSysUserWorkbenchList',
}

/** 获取当前用户绑定工作台 */
export function getSysUserWorkbenchList(data: GetSysUserWorkbenchListReq) {
  return service.get<ApiResponse<GetSysUserWorkbenchListRes[]>>(UcSysUserWorkbenchApi.GET_SYS_USER_WORKBENCH_LIST, {
    params: { ...data },
  })
}
