import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { isEmpty } from 'lodash-es'

import { useWindowSize } from '@vueuse/core'
import Log from '@/utils/log'
import globalConfig from '@/config/global'
import { ChannelTypeEnum, WorkbenchTypeEnum } from '@/api/uc/types'
import { CallTypeEnum } from '@/api/child/queuePlusIn/types'

import { ControlsEnum } from '../types'
import { CatchVaccineEnum, GetQueueConfigByDeptIdRes } from '@/api/uc/queueConfig/types'
import { getGlobalDictionaryByType } from '@/api/uc/globalDictionary'
import { GetGlobalDictionaryByTypeReq } from '@/api/uc/globalDictionary/types'
import { getQueueConfigByDeptId } from '@/api/uc/queueConfig'

import StorageUtil from '@/utils/storage'
import Msg from '@/utils/message'
import { GetVaccineProductInfoResData } from '@/api/uc/vaccineProductInfo/types'
import { devUpdateVaccine, proUpdateVaccine } from '@/utils/updateVaccine'
import { ShengSuDomOption } from '@/hooks/types'

const useBase = () => {
  const queueConfig = ref<GetQueueConfigByDeptIdRes>({} as GetQueueConfigByDeptIdRes)

  /** 获取对应下一步通道的id */
  const getPlayChannelCode = (channelType?: ChannelTypeEnum) => {
    switch (channelType) {
      case ChannelTypeEnum.INQUIRY:
        return ChannelTypeEnum.REGISTRATION
      case ChannelTypeEnum.REGISTRATION:
        return ChannelTypeEnum.VACCINATION
      case ChannelTypeEnum.VACCINATION:
        return ChannelTypeEnum.OBSERVATION
      case ChannelTypeEnum.CHILD_CARE:
        return ChannelTypeEnum.CHILD_CARE
      default:
        return ''
    }
  }

  /** 获取对应延迟通道id */
  const getDelayChannelCode = (channelType?: ChannelTypeEnum) => {
    switch (channelType) {
      case ChannelTypeEnum.INQUIRY:
        return ChannelTypeEnum.INQUIRY_DELAY
      case ChannelTypeEnum.REGISTRATION:
        return ChannelTypeEnum.REGISTRATION_DELAY
      case ChannelTypeEnum.VACCINATION:
        return ChannelTypeEnum.VACCINATION_DELAY
      case ChannelTypeEnum.CHILD_CARE:
        return ChannelTypeEnum.CHILD_CARE_DELAY
      default:
        return ''
    }
  }

  /** 根据通道code 返回当前播报状态 */
  const getCallType = (channelType?: ChannelTypeEnum) => {
    switch (channelType) {
      case ChannelTypeEnum.INQUIRY:
        return CallTypeEnum.INQUIRY
      case ChannelTypeEnum.REGISTRATION:
        return CallTypeEnum.REGISTRATION
      case ChannelTypeEnum.VACCINATION:
        return CallTypeEnum.VACCINATION
      case ChannelTypeEnum.CHILD_CARE:
        return CallTypeEnum.CHILD_CARE
      default:
        return undefined
    }
  }

  /** 根据通道类型 返回延迟直接播报的目标队列的呼叫类型 */
  const getDelayToNormalCallType = (channelType?: ChannelTypeEnum) => {
    switch (channelType) {
      case ChannelTypeEnum.INQUIRY_DELAY:
        return CallTypeEnum.INQUIRY
      case ChannelTypeEnum.REGISTRATION_DELAY:
        return CallTypeEnum.REGISTRATION
      case ChannelTypeEnum.VACCINATION_DELAY:
        return CallTypeEnum.VACCINATION
      case ChannelTypeEnum.CHILD_CARE_DELAY:
        return CallTypeEnum.CHILD_CARE
      default:
        return undefined
    }
  }

  /** 根据通道类型 返回延迟直接播报的目标队列的通道类型 */
  const getDelayToNormalChannelType = (channelType?: ChannelTypeEnum) => {
    switch (channelType) {
      case ChannelTypeEnum.INQUIRY_DELAY:
        return ChannelTypeEnum.INQUIRY
      case ChannelTypeEnum.REGISTRATION_DELAY:
        return ChannelTypeEnum.REGISTRATION
      case ChannelTypeEnum.VACCINATION_DELAY:
        return ChannelTypeEnum.VACCINATION
      case ChannelTypeEnum.CHILD_CARE_DELAY:
        return ChannelTypeEnum.CHILD_CARE
      default:
        return undefined
    }
  }

  /** draggable尺寸 */
  const draggableSize = reactive<{ height: number; width: number }>({ width: 427, height: 70 })
  /** 可拖动位置 */
  const handleRef = ref<HTMLDivElement>()

  const { width: winWidth, height: winHeight } = useWindowSize()

  const workbenchDraggable = ref<HTMLElement | null>(null)

  const draggableObj = computed<{
    style: { height: string; width: string }
    initialValue: { x: number; y: number }
  }>(() => ({
    style: { height: `${draggableSize.height}px`, width: `${draggableSize.width}px` },
    initialValue: { x: winWidth.value / 2 - draggableSize.width / 2, y: 0 },
  }))

  /** 监听dom  回调  控制安全区 */
  const mutationObserver = new MutationObserver((mutationsList: MutationRecord[], observer: MutationObserver) => {
    const target = mutationsList[0]
    if (target.attributeName == 'style') {
      controlSafeArea()
    }
  })

  /** 控制安全区 */
  const controlSafeArea = () => {
    const t = workbenchDraggable.value
    if (t) {
      const top = parseInt(t.style.top)
      const left = parseInt(t.style.left)
      if (left > winWidth.value - draggableSize.width) {
        t.style.left = winWidth.value - draggableSize.width + 'px'
      }
      if (left < 0) {
        t.style.left = 0 + 'px'
      }
      if (top > winHeight.value - draggableSize.height) {
        t.style.top = winHeight.value - draggableSize.height + 'px'
      }
      if (top < 0) {
        t.style.top = 0 + 'px'
      }
    }
  }

  /** 疫苗信息列表是否显示 */
  const showVaccineInfoTable = ref(false)
  /** 保存页面数据 */
  const catchDate = ref<Array<Record<string, string>>>([])
  /** 当前疫苗弹窗打开时的操作状态 */
  const controlState = ref<ControlsEnum | null>(null)

  const check_in_desk_icon = chrome.runtime.getURL('/static/check_in_desk_icon.png')
  const triangle_icon = chrome.runtime.getURL('/static/triangle_icon.png')
  const fold_icon = chrome.runtime.getURL('/static/fold_icon.png')
  const close_icon = chrome.runtime.getURL('/static/close_icon.png')
  const shrink_icon = chrome.runtime.getURL('/static/shrink_icon.png')

  /** 获取所有疫苗信息 */
  const funGetAllVaccines = async () => {
    const allVaccineInfo = await StorageUtil.getItem('allVaccineInfo')
    if (isEmpty(allVaccineInfo)) {
      const queueConfig = await StorageUtil.getItem('queueConfig')
      updateYiMiao()
    }
  }

  // 获取疫苗最新信息
  const updateYiMiao = () => {
    if (globalConfig.env == 'development') {
      devUpdateVaccine()
    } else {
      proUpdateVaccine()
    }
  }

  /** 获取shengsu系统dom配置
   * zcy页面用不到了
   */
  const funGetShengSuOpt = async () => {
    // // const shengSuDomOptionStorage = await StorageUtil.getItem('shengSuDomOption')
    // // if (isEmpty(shengSuDomOptionStorage)) {
    // const reqObj: GetGlobalDictionaryByTypeReq = {
    //   // searchField: '00f75ae7caa14ec4928de8e4726458e5',
    //   typeName: '叫号精灵抓苗查询配置',
    // }
    // const { data } = await getGlobalDictionaryByType(reqObj)
    // if (!isEmpty(data) && data[0].keyDesc) {
    //   try {
    //     // await StorageUtil.setItem('shengSuDomOption', JSON.parse(data[0].keyDesc) || ({} as ShengSuDomOption))
    //     await StorageUtil.setItem('shengSuDomOption', {} as ShengSuDomOption)
    //   } catch (error) {
    //     // Msg.warn({ content: '配置转化出错，使用本地配置！'})
    //   } finally {
    //     await StorageUtil.setItem('shengSuDomOption', {} as ShengSuDomOption)
    //   }
    // } else {
    //   await StorageUtil.setItem('shengSuDomOption', {} as ShengSuDomOption)
    // }
    // // }
    await StorageUtil.setItem('shengSuDomOption', {} as ShengSuDomOption)
  }

  /** 获取单位的配置 */
  const funGetQueueConfigByDeptId = async () => {
    const userBaseInfo = await StorageUtil.getItem('userBaseInfo')
    const { data } = await getQueueConfigByDeptId(userBaseInfo?.deptId || '')
    await StorageUtil.setItem('queueConfig', data)
    // Log.d(data)
  }

  const all = async () => Promise.all([funGetShengSuOpt(), funGetAllVaccines(), funGetQueueConfigByDeptId()])

  onMounted(async () => {
    await all()
    const targetDom = document.getElementById('workbench-draggable')
    workbenchDraggable.value = targetDom
    if (targetDom) {
      mutationObserver.observe(targetDom, { attributes: true })
    }
    window.addEventListener('resize', controlSafeArea)
    queueConfig.value = (await StorageUtil.getItem('queueConfig')) || ({} as GetQueueConfigByDeptIdRes)
  })

  onUnmounted(() => {
    mutationObserver.disconnect()
    window.removeEventListener('resize', controlSafeArea)
  })

  return {
    getPlayChannelCode,
    getDelayChannelCode,
    getCallType,
    handleRef,
    draggableSize,
    draggableObj,
    showVaccineInfoTable,
    catchDate,
    controlState,
    check_in_desk_icon,
    triangle_icon,
    fold_icon,
    close_icon,
    shrink_icon,
    queueConfig,
    funGetShengSuOpt,
    getDelayToNormalCallType,
    getDelayToNormalChannelType,
  }
}

export default useBase
