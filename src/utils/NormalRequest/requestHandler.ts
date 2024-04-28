import { AxiosRequestConfig, AxiosHeaders } from 'axios'
import { HeaderKey } from './header'
import StorageUtil from '../storage'
import Log from '../log'

/**
 * 处理token问题
 */
export async function handleToken(requestConfig: AxiosRequestConfig) {
  const fetchToken = await StorageUtil.getItem('fetchToken')
  if (requestConfig.isAuth && requestConfig.headers && requestConfig.headers instanceof AxiosHeaders) {
    if (!requestConfig.headers.get('authorization')) {
      if (fetchToken) {
        requestConfig.headers.set(HeaderKey.AUTHORIZATION, `${fetchToken?.token_type} ${fetchToken?.access_token}`)
      }
    }
  }
}
