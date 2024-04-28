import useWS from '@/hooks/useWS'
import { BroadcastWsMessage } from './types'
import { ref } from 'vue'

export async function useBroadcastWs(cIds: string[], onMsg?: (data: BroadcastWsMessage | null) => void) {
  const data = ref<BroadcastWsMessage | null>()

  const wsInfo = await useWS<string, { channelIds: string }>({
    params: {
      channelIds: `${cIds.join(',')},`,
    },
    onMessage(_ws, event) {
      let resp: BroadcastWsMessage | null = null
      try {
        if (event.data) {
          resp = JSON.parse(event.data)
          if (resp?.content) {
            try {
              resp.content = JSON.parse(resp.content)
            } catch (error) {
              resp.content = resp.content
            }
          }
        } else {
          resp = null
        }
      } catch (error) {
        resp = null
      }
      data.value = resp
      onMsg && onMsg(resp)
    },
    onError(_ws, _event) {
      wsInfo.close()
    },
  })

  return { ...wsInfo, data }
}
