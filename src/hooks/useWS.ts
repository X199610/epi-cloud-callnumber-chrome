import globalConfig from '@/config/global'
import StorageUtil from '@/utils/storage'
import { UseWebSocketOptions, useWebSocket } from '@vueuse/core'
import qs from 'qs'

const useWS = async <D = any, P = any>(opt?: { params?: P; isAuth?: boolean } & UseWebSocketOptions) => {
  const { params, isAuth = true, ...vueUseOpt } = opt || {}

  const arg: Record<string, any> = {
    ...params,
  }

  if (isAuth) {
    const fetchToken = await StorageUtil.getItem('fetchToken')
    arg.token = fetchToken?.access_token
  } else {
    if (arg.token) delete arg.token
  }

  const url = `${globalConfig.wsBaseUrl}?${qs.stringify(arg)}`

  const wsInfo = useWebSocket<D>(url, {
    heartbeat: {
      message: globalConfig.wsHeartbeatMsg,
      interval: 10 * 1000,
      pongTimeout: 5 * 1000,
    },
    immediate: false,
    autoReconnect: true,
    ...vueUseOpt,
  })

  return wsInfo
}

export default useWS
