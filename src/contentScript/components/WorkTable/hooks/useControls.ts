import { onMounted, ref, watch } from 'vue'
import { ControlsEnum, BtnsItem, CurPlayTypeEnum } from '../types'

import Log from '@/utils/log'
import StorageUtil from '@/utils/storage'

const useControls = () => {
  const curPlayType = ref<CurPlayTypeEnum>(CurPlayTypeEnum.MANUAL_OPERATION)

  const active_play_icon = chrome.runtime.getURL('/static/active_play_icon.png')
  const play_icon = chrome.runtime.getURL('/static/play_icon.png')
  const active_replay_icon = chrome.runtime.getURL('/static/active_replay_icon.png')
  const replay_icon = chrome.runtime.getURL('/static/replay_icon.png')
  const active_wait_icon = chrome.runtime.getURL('/static/active_wait_icon.png')
  const wait_icon = chrome.runtime.getURL('/static/wait_icon.png')
  const active_delay_icon = chrome.runtime.getURL('/static/active_delay_icon.png')
  const delay_icon = chrome.runtime.getURL('/static/delay_icon.png')
  const active_refresh_icon = chrome.runtime.getURL('/static/active_refresh_icon.png')
  const refresh_icon = chrome.runtime.getURL('/static/refresh_icon.png')
  const active_error_icon = chrome.runtime.getURL('/static/active_error_icon.png')
  const error_icon = chrome.runtime.getURL('/static/error_icon.png')
  // const active_fetch_seedlings_icon = chrome.runtime.getURL('/static/active_fetch_seedlings_icon.png')
  // const fetch_seedlings_icon = chrome.runtime.getURL('/static/fetch_seedlings_icon.png')
  const switch_icon = chrome.runtime.getURL('/static/switch_icon.png')
  const active_switch_icon = chrome.runtime.getURL('/static/active_switch_icon.png')

  /**
   * 2024-04-24
   * 重播、自动播报、完成、延时
   * 呼叫、自动、完成、跳过
   */
  const createBtnItem = (label: ControlsEnum): BtnsItem => {
    const obj: BtnsItem = { label, disabled: false, isActive: false } as BtnsItem
    if (label === ControlsEnum.PLAY) {
      obj.active_icon = active_play_icon
      obj.icon = play_icon
    } else if (label === ControlsEnum.AUTO_PLAY) {
      // obj.active_icon = active_play_icon
      // obj.icon = play_icon
      obj.active_icon = active_replay_icon
      obj.icon = replay_icon
    } else if (label === ControlsEnum.REPALY) {
      // obj.active_icon = active_replay_icon
      // obj.icon = replay_icon
      obj.active_icon = active_play_icon
      obj.icon = play_icon
    } else if (label === ControlsEnum.ACCOMPLISH) {
      obj.active_icon = active_wait_icon
      obj.icon = wait_icon
    } else if (label === ControlsEnum.DELAY) {
      obj.active_icon = active_delay_icon
      obj.icon = delay_icon
    } else if (label === ControlsEnum.REFRESH) {
      obj.active_icon = active_refresh_icon
      obj.icon = refresh_icon
    } else if (label === ControlsEnum.ERROR) {
      obj.active_icon = active_error_icon
      obj.icon = error_icon
    }
    // else {
    //   obj.active_icon = active_fetch_seedlings_icon
    //   obj.icon = fetch_seedlings_icon
    // }
    return obj
  }
  /**
   * 播报、自动播报、重播、完成、延时
   * 2024-04-24
   * 重播、自动播报、完成、延时
   * 呼叫、自动、完成、跳过
   */
  const btnsList = ref<BtnsItem[]>([
    // createBtnItem(ControlsEnum.PLAY),
    createBtnItem(ControlsEnum.REPALY),
    createBtnItem(ControlsEnum.AUTO_PLAY),
    createBtnItem(ControlsEnum.ACCOMPLISH),
    createBtnItem(ControlsEnum.DELAY),
    // createBtnItem(ControlsEnum.REFRESH),
    // createBtnItem(ControlsEnum.ERROR),
    // createBtnItem(ControlsEnum.FETCH_SEEDLINGS),
  ])

  /** 操作按钮是否禁选 如果禁选清空正在使用状态 */
  const disabledBtns = (isDisabled: boolean) => {
    btnsList.value.forEach((k) => {
      k.disabled = isDisabled
      isDisabled && (k.isActive = false)
    })
  }

  /** 按钮正在使用 */
  const btnUsed = (target?: ControlsEnum) => {
    btnsList.value.forEach((k) => {
      if (k.label == target) {
        k.isActive = true
      }
    })
  }
  const btnUnUse = (target: ControlsEnum) => {
    btnsList.value.forEach((k) => {
      if (k.label == target) {
        k.isActive = target == ControlsEnum.AUTO_PLAY && curPlayType.value == CurPlayTypeEnum.AUTO
      }
    })
  }
  const allUnUsed = () => {
    btnsList.value.forEach((k) => {
      k.isActive = k.label == ControlsEnum.AUTO_PLAY && curPlayType.value == CurPlayTypeEnum.AUTO
    })
  }

  const getCurPlayTyp = async () => {
    curPlayType.value = (await StorageUtil.getItem('curPlayType')) || CurPlayTypeEnum.MANUAL_OPERATION
    await StorageUtil.setItem('curPlayType', curPlayType.value)
  }

  onMounted(async () => {
    await getCurPlayTyp()
  })

  return {
    btnsList,
    disabledBtns,
    btnUsed,
    btnUnUse,
    allUnUsed,
    switch_icon,
    active_switch_icon,
    curPlayType,
    getCurPlayTyp,
  }
}

export default useControls
