import { onMounted, ref } from 'vue'
import { isEmpty } from 'lodash-es'

import StorageUtil from '@/utils/storage'

import { BadgeText } from '@/serviceWorker/types'

const useBase = () => {
  /** 工作台是否显示 */
  const showWorkbench = ref(false)

  /** 切换工作台 */
  const changeShowWorkbench = async () => {
    showWorkbench.value = true
    await StorageUtil.setItem('showWorkbench', true)
  }

  /** 关闭工作台 显示图标 */
  const closeCheckInDesk = async () => {
    showWorkbench.value = false
    show.value = true
    await StorageUtil.removeItem('showWorkbench')
  }

  /** 拖动弹窗显示 */
  const show = ref(false)

  onMounted(async () => {
    const userBaseInfo = await StorageUtil.getItem('userBaseInfo')
    const badgeText = await StorageUtil.getItem('badgeText')
    const isShowWorkbench = await StorageUtil.getItem('showWorkbench')
    showWorkbench.value = Boolean(isShowWorkbench && badgeText == BadgeText.ON && !isEmpty(userBaseInfo) && !show.value)
    show.value = Boolean(!isShowWorkbench && badgeText == BadgeText.ON && !isEmpty(userBaseInfo))
  })

  return { showWorkbench, changeShowWorkbench, show, closeCheckInDesk }
}

export default useBase
