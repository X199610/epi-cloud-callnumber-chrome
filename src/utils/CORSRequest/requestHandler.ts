import { CORSServiceOpt } from '@/utils/CORSRequest'
import StorageUtil from '@/utils/storage'
import { HeaderKey } from './header'

/**
 * 处理token问题
 */
export async function handleToken(requestConfig: CORSServiceOpt) {
  const fetchToken = await StorageUtil.getItem('fetchToken')
  if (requestConfig.isAuth) {
    if (!requestConfig.headers) {
      requestConfig.headers = { [HeaderKey.AUTHORIZATION]: `Bearer ${fetchToken?.access_token}` }
    } else {
      // @ts-ignore
      requestConfig.headers.append(HeaderKey.AUTHORIZATION, `Bearer ${fetchToken?.access_token}`)
    }
  }
}
