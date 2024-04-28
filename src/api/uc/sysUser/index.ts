import { ApiResponse } from '@/api/types'
import { UserInfo } from './types'
import { service } from '@/utils/CORSRequest'

export enum UcSysUserApi {
  /** 登录获取 UserInfo */
  GET_USER_INFO = '/uc/sysUser/getUserInfo',
}

/** 登录获取 UserInfo */
export function getUserInfo() {
  return service.get<ApiResponse<UserInfo>>(UcSysUserApi.GET_USER_INFO)
}
