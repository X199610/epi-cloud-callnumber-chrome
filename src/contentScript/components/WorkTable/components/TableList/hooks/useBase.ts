import { onMounted, ref } from 'vue'
import { cloneDeep, isEmpty } from 'lodash-es'

import { QueueBtnItem } from '../../../types'
import { QueueAndTableDataItem, TableRowItem } from '../types'
import { GetQueueConfigByDeptIdRes } from '@/api/uc/queueConfig/types'
import { ChannelTypeEnum } from '@/api/uc/types'

import Msg from '@/utils/message'
import Log from '@/utils/log'
import StorageUtil from '@/utils/storage'
import { getQueueConfigByDeptId } from '@/api/uc/queueConfig'

const useBase = () => {
  /** 门诊设置 */
  const queueConfig = ref<GetQueueConfigByDeptIdRes>({} as GetQueueConfigByDeptIdRes)

  /** 通道/队列 */
  const channelQueue = ref<Record<string, QueueBtnItem>>({})

  /** 队列切换按钮 */
  const btnListRef = ref<HTMLElement | null>(null)

  const lock_icon = chrome.runtime.getURL('/static/lock_icon.png')
  const wait_in_line_icon = chrome.runtime.getURL('/static/wait_in_line_icon.png')
  const order_failed_icon = chrome.runtime.getURL('/static/order_failed_icon.png')

  /** 当前队列id */
  const curQueue = ref<string>('')
  /** 通道ids */
  const channelIdsList = ref<string[]>([])
  /** 队列按钮以及table数据 */
  const queueObj = ref<Record<string, QueueAndTableDataItem>>({})

  /** 当前即将撤回的人 行信息 */
  const curRevocationRowData = ref<TableRowItem>({} as TableRowItem)

  /** 切换队列按钮的样式 */
  const changeQueueBtnStyle = (t: 'cursor' | 'border', dir: 'r' | 'l') => {
    const isFirstQueue = Object.keys(queueObj.value)[0] == curQueue.value || isEmpty(Object.keys(queueObj.value))
    const isLastQueue =
      Object.keys(queueObj.value)[Object.keys(queueObj.value).length - 1] == curQueue.value ||
      isEmpty(Object.keys(queueObj.value))
    if (dir == 'r') {
      if (t == 'cursor') {
        return { cursor: isFirstQueue ? 'not-allowed' : 'pointer' }
      }
      return { 'border-right-color': isFirstQueue ? 'rgba(31, 101, 254, 0.4)' : '#1f65fe' }
    } else {
      if (t == 'cursor') {
        return { cursor: isLastQueue ? 'not-allowed' : 'pointer' }
      }
      return { 'border-left-color': isLastQueue ? 'rgba(31, 101, 254, 0.4)' : '#1f65fe' }
    }
  }

  /** 找到撤回的目标通道id */
  const funTargetWorkbenchId = () => {
    const channelType = channelQueue.value[curQueue.value].channelType
    const vList = Object.values(cloneDeep(channelQueue.value))

    // Log.d(channelType, vList)
    if (channelType == ChannelTypeEnum.REGISTRATION) {
      const target = vList.find((i) => i.channelType == ChannelTypeEnum.INQUIRY)
      if (!target) {
        Msg.warn({ content: '待登记队列无法撤回！'})
        return undefined
      }
      return target.channelId
    } else if (channelType == ChannelTypeEnum.VACCINATION) {
      return vList.find((i) => i.channelType == ChannelTypeEnum.REGISTRATION)?.channelId
    } else if (channelType == ChannelTypeEnum.INQUIRY_DELAY) {
      return vList.find((i) => i.channelType == ChannelTypeEnum.INQUIRY)?.channelId
    } else if (channelType == ChannelTypeEnum.REGISTRATION_DELAY) {
      return vList.find((i) => i.channelType == ChannelTypeEnum.REGISTRATION)?.channelId
    } else if (channelType == ChannelTypeEnum.VACCINATION_DELAY) {
      return vList.find((i) => i.channelType == ChannelTypeEnum.VACCINATION)?.channelId
    } else if (channelType == ChannelTypeEnum.CHILD_CARE_DELAY) {
      return vList.find((i) => i.channelType == ChannelTypeEnum.CHILD_CARE)?.channelId
    } else if (channelType == ChannelTypeEnum.OBSERVATION) {
      return vList.find((i) => i.channelType == ChannelTypeEnum.VACCINATION)?.channelId
    } else if ([ChannelTypeEnum.INQUIRY, ChannelTypeEnum.OBSERVATION, ChannelTypeEnum.ABNORMAL].includes(channelType)) {
      curRevocationRowData.value = {} as TableRowItem
      Msg.warn({ content: '待询问、异常队列无法撤回！', key: 'cannot'})
      return undefined
    } else {
      Msg.warn({ content: '未找到目标队列！', key: 'unknow'})
      return undefined
    }
  }

  /** 获取单位的配置 */
  const funGetQueueConfigByDeptId = async () => {
    if (isEmpty(queueConfig.value)) {
      const userBaseInfo = await StorageUtil.getItem('userBaseInfo')
      const { data } = await getQueueConfigByDeptId(userBaseInfo?.deptId || '')
      await StorageUtil.setItem('queueConfig', data)
      queueConfig.value = data || {}
    }
  }

  return {
    channelQueue,
    btnListRef,
    lock_icon,
    wait_in_line_icon,
    order_failed_icon,
    curQueue,
    queueObj,
    curRevocationRowData,
    changeQueueBtnStyle,
    funTargetWorkbenchId,
    channelIdsList,
    queueConfig,
    funGetQueueConfigByDeptId,
  }
}

export default useBase
