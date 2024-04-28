import axios from 'axios'
import dayjs from 'dayjs'

import globalConfig from '@/config/global'
import { handleToken } from './requestHandler'
import { handleHttpError, handleNormalResponse } from './responseHandler'

import useLogin from '@/hooks/useLogin'

import Msg from '../message'
import Log from '../log'
import StorageUtil from '../storage'

export const service = axios.create({
  baseURL: globalConfig.apiBaseUrl,
  timeout: globalConfig.apiTimeOut,
  isAuth: true,
  showCommonErrMsg: true,
  maskingErrorInterceptors: false,
})

service.interceptors.request.use(async (requestConfig) => {
  const beLoggingIn = await StorageUtil.getItem('beLoggingIn')
  const expiresIn = await StorageUtil.getItem('expiresIn')
  const f = await StorageUtil.getItem('fetchToken')
  if (!beLoggingIn && expiresIn && dayjs(dayjs().valueOf()).isAfter(dayjs(expiresIn))) {
    await StorageUtil.setItem('fetchToken', { ...f!, access_token: 'asdasd' })
    await StorageUtil.setItem('beLoggingIn', true)
    Msg.warn({ content: '登录凭证即将消失，正在为您重新登录！', key: 'auto_login' })
    if (useLogin) {
      const { getBaseInfo, getToken } = useLogin(false)
      await getToken()
      await getBaseInfo()
    }
    await StorageUtil.removeItem('beLoggingIn')
    Msg.success({ content: '登录成功，请继续操作！', key: 'auto_login_success' })
  }
  await handleToken(requestConfig)
  return requestConfig
})

service.interceptors.response.use(
  async (resp) => {
    /** 处理http响应码为200的响应 */
    const isSuccess = await handleNormalResponse(resp)
    if (isSuccess) {
      return resp.data
    } else {
      return Promise.reject(resp)
    }
  },
  (err) => {
    if (axios.isAxiosError(err)) {
      return handleHttpError(err)
    }
    Msg.error({ content: '网络请求发生了意料之外的错误！' })
    return Promise.reject(err)
  }
)
