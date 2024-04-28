import { ref } from 'vue'
import { useWebSocket } from '@vueuse/core'
import type { UseWebSocketOptions } from '@vueuse/core'

import type { OrderWsResData } from './types'
import Log from '@/utils/log'
import Msg from '@/utils/message'
import StorageUtil from '@/utils/storage'

export const useFetchSeedlingsWs = async <D = any, P = any>(
  opt?: {
    url: string
    stationNO: number
    onMsg: (data: OrderWsResData) => void
    onReconnect?: () => void | Promise<void>
  } & UseWebSocketOptions
) => {
  const { url, stationNO, onMsg, onReconnect, ...vueUseOpt } = opt || {}

  const data = ref<OrderWsResData>({} as OrderWsResData)

  // const wsInfo = useWebSocket('ws://127.0.0.1:7415/', {
  const wsInfo = useWebSocket(`${url}/client?type=1&stationNO=${stationNO}`, {
    heartbeat: {
      message: 'ping',
      interval: 20 * 1000,
      pongTimeout: 10 * 1000,
    },
    autoReconnect: {
      delay: 3 * 1000,
      retries: 1,
      onFailed: () => {
        // Msg.warn({ content: '中控连接失败，请确认门诊设置中的取苗Ws路径是否正确！', key: 'center-ctrl-ws-url-err' })
      },
    },
    immediate: false,
    onMessage(_ws, event) {
      // Log.d(_ws, event)
      try {
        if (event.data) {
          data.value = JSON.parse(event.data)
        }
      } catch (error) {
        data.value = {} as OrderWsResData
      }
      onMsg && onMsg(data.value)
    },
    onError(_ws, _event) {
      wsInfo.close()
    },
    onDisconnected(_ws, _event) {
      Log.d('ws已断开，自动重连...')
      wsInfo.close()
      onReconnect && onReconnect()
    },
    ...vueUseOpt,
  })

  return { ...wsInfo, data }
}
