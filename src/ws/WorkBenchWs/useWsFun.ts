import { shallowRef } from 'vue'

import { useBroadcastWs } from './index'
import { BroadcastWsMessage, PromiseReturnType, WsMessageContent } from './types'

const useWsFun = () => {
  const wsInfo = shallowRef<PromiseReturnType<ReturnType<typeof useBroadcastWs>>>()

  /** 关闭ws */
  const closeWs = () => {
    const ws = wsInfo.value
    if (ws && (ws?.status.value === 'OPEN' || ws?.status.value === 'CONNECTING')) {
      ws.close()
    }
  }

  /** 开启ws */
  const startWS = async (idArr: string[], wsResCallBack: (v: BroadcastWsMessage<WsMessageContent[]> | null) => void) => {
    closeWs()
    wsInfo.value = await useBroadcastWs(idArr, wsResCallBack)
    wsInfo.value.open()
  }

  return {
    wsInfo,
    startWS,
    closeWs,
  }
}

export default useWsFun
