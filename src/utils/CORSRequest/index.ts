import globalConfig from '@/config/global'
import useLogin from '@/hooks/useLogin'
import { ServiceMessage, ServiceMessageType } from '@/serviceWorker/types'
import Msg from '@/utils/message'
import StorageUtil from '@/utils/storage'
import dayjs from 'dayjs'
import { Options, Response } from 'redaxios'
import { handleHttpError, handleNormalResponse } from './responseHandler'
import { handleToken } from './requestHandler'
import { ApiResponse } from '@/api/types'
import Log from '../log'

export interface ExtraOptions {
  /** 是否添加token */
  isAuth?: boolean
  /** 是否展示全局通用的错误提示，如果设为false则可以将全局通用的错误提示关闭，自己处理提示问题 */
  showCommonErrMsg?: boolean
  /** 是否屏蔽内部错误处理 */
  maskingErrorInterceptors?: boolean
  /**
   * 返回消息体中是否注入header信息，
   * 如果开启了此选配置返回类型则需要使用 ApiResponseWithHeader(src/api/types.ts) 类型包裹
   */
  // showRespHeader?: boolean
  timeout?: number
}

export type CORSServiceOpt = ExtraOptions & Options
export type CORSResponse<T = any> = Omit<Response<T>, 'config'> & { config: CORSServiceOpt; ok: boolean }

class CORSService {
  private _opt: CORSServiceOpt
  private _requestInterceptor: (requestOpt: CORSServiceOpt) => Promise<CORSServiceOpt>
  private _responseInterceptor: <T>(resp: CORSResponse<T>) => Promise<T>

  constructor(_opt: CORSServiceOpt) {
    this._opt = _opt
    this._requestInterceptor = async (opt) => opt
    this._responseInterceptor = async (resp) => resp.data
  }

  async get<T>(url: string, opt: CORSServiceOpt = {}) {
    const realOpt = await this._requestInterceptor({ ...this._opt, method: 'GET', url, ...opt })
    const res = await chrome.runtime.sendMessage<ServiceMessage<CORSServiceOpt>, CORSResponse<T>>({
      type: ServiceMessageType.AXIOS_REQ,
      msgInfo: realOpt,
    })
    return this._responseInterceptor<T>(res)
  }

  async post<T, R = any>(url: string, data: R, opt: CORSServiceOpt = {}) {
    const realOpt = await this._requestInterceptor({ ...this._opt, url, method: 'POST', data, ...opt })
    const res = await chrome.runtime.sendMessage<ServiceMessage<CORSServiceOpt>, CORSResponse<T>>({
      type: ServiceMessageType.AXIOS_REQ,
      msgInfo: realOpt,
    })
    return this._responseInterceptor<T>(res)
  }

  async localPost<T, R = any>(url: string, data: R, opt: CORSServiceOpt = {}) {
    const realOpt = await this._requestInterceptor({ ...this._opt, url, method: 'POST', data, ...opt })
    const res = await chrome.runtime.sendMessage<ServiceMessage<CORSServiceOpt>, CORSResponse<T>>({
      type: ServiceMessageType.AXIOS_REQ,
      msgInfo: realOpt,
    })
    return res
  }

  public set requestInterceptor(value: (requestOpt: CORSServiceOpt) => Promise<CORSServiceOpt>) {
    this._requestInterceptor = value
  }

  public set responseInterceptor(value: <T>(resp: CORSResponse<T>) => Promise<T>) {
    this._responseInterceptor = value
  }
}

export const initServiceOpt: CORSServiceOpt = {
  isAuth: true,
  showCommonErrMsg: true,
  maskingErrorInterceptors: false,
  timeout: globalConfig.apiTimeOut,
}

export const createService = (serviceOpt: CORSServiceOpt): CORSService => {
  const newService = new CORSService(serviceOpt)

  newService.requestInterceptor = async (requestConfig) => {
    const beLoggingIn = await StorageUtil.getItem('beLoggingIn')
    const expiresIn = await StorageUtil.getItem('expiresIn')
    const f = await StorageUtil.getItem('fetchToken')
    if (
      !beLoggingIn &&
      expiresIn &&
      dayjs(dayjs().format('YYYY-MM-DD HH:mm:ss')).isAfter(dayjs(expiresIn).format('YYYY-MM-DD HH:mm:ss'))
    ) {
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
  }

  newService.responseInterceptor = async (response) => {
    // console.log('responseInterceptor', response)
    if (response.ok === true) {
      const isSuccess = await handleNormalResponse(response as CORSResponse<ApiResponse<any>>)
      if (isSuccess) {
        return response.data
      } else {
        return Promise.reject(response)
      }
    } else {
      return handleHttpError(response as CORSResponse<ApiResponse<any>>)
    }
  }

  return newService
}

export const service = createService({
  baseURL: globalConfig.apiBaseUrl,
  ...initServiceOpt,
})

export default CORSService
