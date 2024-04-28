import { ref, shallowRef, watch } from 'vue'

import { useFetchSeedlingsWs } from './index'
import { OrderWsResData } from './types'
import { PromiseReturnType } from '../WorkBenchWs/types'
import StorageUtil from '@/utils/storage'
import Msg from '@/utils/message'
import { getQueueConfigByDeptId } from '@/api/uc/queueConfig'
import Log from '@/utils/log'
import { CatchVaccineEnum } from '@/api/uc/queueConfig/types'
import { debounce } from 'lodash-es'

const useWsFun = () => {
  const wsInfo = shallowRef<PromiseReturnType<ReturnType<typeof useFetchSeedlingsWs>>>()

  /** 关闭ws */
  const closeWs = () => {
    const ws = wsInfo.value
    if (ws && (ws?.status.value === 'OPEN' || ws?.status.value === 'CONNECTING')) {
      ws.close()
    }
  }

  /** 是否正在重连 */
  const isReconnect = ref(false)
  /** 重连成果后调用 */
  const reconnect = shallowRef<() => void>()

  /** 开启ws */
  const startWS = async (wsResCallBack: (v: OrderWsResData | null) => void, reconnectCallBack: () => void | Promise<void>) => {
    // closeWs()
    const tableNum = await StorageUtil.getItem('tableNum')
    const ws = wsInfo.value
    if (ws?.status.value === 'OPEN' || (ws?.status.value === 'CONNECTING' && ws?.ws.value?.url.slice(-1) == tableNum)) return
    const queueConfig = await StorageUtil.getItem('queueConfig')
    if (!tableNum) return
    if (queueConfig?.catchVaccine == CatchVaccineEnum.NO) return
    const isShowWorkbench = await StorageUtil.getItem('showWorkbench')
    if (isShowWorkbench) {
      if (!queueConfig?.catchVaccineWsUrl) {
        const userBaseInfo = await StorageUtil.getItem('userBaseInfo')
        const { data } = await getQueueConfigByDeptId(userBaseInfo?.deptId || '')
        if (!data?.catchVaccineWsUrl) return Msg.warn({ content: '取苗ws路径为空，请检查门诊设置！' })
        await StorageUtil.setItem('queueConfig', data)
      }
      wsInfo.value = await useFetchSeedlingsWs({
        url: queueConfig!.catchVaccineWsUrl!,
        stationNO: tableNum!,
        onMsg: wsResCallBack,
        onReconnect:
          wsInfo.value?.status.value === 'OPEN' || wsInfo.value?.status.value === 'CONNECTING'
            ? undefined
            : debounce(() => {
                startWS(wsResCallBack, reconnectCallBack)
                isReconnect.value = true
              }, 1000),
      })
      reconnect.value = reconnectCallBack
      wsInfo.value.open()
    }
  }

  watch(
    wsInfo,
    (v) => {
      /** 检测重连 */
      if (v?.status.value === 'OPEN' && isReconnect.value) {
        reconnect.value && reconnect.value()
        isReconnect.value = false
      }
    },
    { deep: true }
  )

  return {
    wsInfo,
    startWS,
    closeWs,
  }
}

export default useWsFun
