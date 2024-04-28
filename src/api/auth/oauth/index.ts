import { ApiResponse } from '@/api/types'
import { LoginReq, TokenInfo } from './types'
import { aesEncode } from '@/utils/encrypt'
import { service } from '@/utils/CORSRequest'

export enum AuthOauthApi {
  /** 登录获取token */
  TOKEN = '/auth/oauth/token',
}

/** 登录获取token */
export function fetchToken(loginInfo: LoginReq) {
  const resReq: LoginReq = { type: loginInfo.type }
  if (resReq.type === 'password' && loginInfo.password && loginInfo.username) {
    resReq.password = aesEncode(loginInfo.password)
    resReq.username = loginInfo.username
  } else if (resReq.type === 'refresh_token' && loginInfo.refresh_token) {
    resReq.refresh_token = loginInfo.refresh_token
  }
  return service.post<ApiResponse<TokenInfo>>(
    AuthOauthApi.TOKEN,
    {},
    {
      isAuth: false,
      params: resReq,
    }
  )
}
