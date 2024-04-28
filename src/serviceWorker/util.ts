import { query } from '@/utils/chrome/tabs'
import { BadgeText, BadgeTextMessage, ServiceMessage, ServiceMessageType } from './types'
import StorageUtil from '@/utils/storage'

export async function changeBadgeText(text: BadgeText, sendToTab = true) {
  await StorageUtil.setItem('badgeText', text)
  if (sendToTab) {
    await sendCurrentTabMessage<ServiceMessage<BadgeTextMessage>>({
      type: ServiceMessageType.BADGE_TEXT,
      msgInfo: { badgeText: text },
    })
  }
}
/** 向对应标签页发送信息
 * contentScript 会收到信息 然后根据是否有用户token 以及是否开启
 * 来展示可拖动的小图标
 */
export async function sendCurrentTabMessage<T = any>(msg: T) {
  /** 获取当前tab页id */
  const [tab] = await query({ active: true, currentWindow: true })
  if (tab?.id) {
    /** 向当前tab页发送信息 */
    return await chrome.tabs.sendMessage<T, boolean>(tab.id, msg)
  }
  return false
}
