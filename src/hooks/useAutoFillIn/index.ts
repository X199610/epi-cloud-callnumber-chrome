import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { debounce, isEmpty } from 'lodash-es'
import dayjs from 'dayjs'

import { wait } from '@/utils/commonUtil'
import Log from '@/utils/log'
import Msg from '@/utils/message'
import StorageUtil from '@/utils/storage'

import { BenchType, ZCYBaseHostName } from './types'
import { ChannelTypeEnum } from '@/api/uc/types'
import { QueuePlusUpdateReq } from '@/api/child/queuePlusIn/types'
import { queuePlusUpdate } from '@/api/child/queuePlusIn'

import ObserverDom from '../useObserverDom'
import { fetchCurrentRegister } from '@/utils/updateVaccine'

const useAutoFillIn = () => {
  const state = ref<'open' | 'close'>('close')

  const bench = computed(() => location.href.split('#/')[1])
  const benchIsPre = computed(() => bench.value.includes(BenchType.PRE))
  const benchIsReg = computed(() => bench.value.includes(BenchType.REG))
  const benchIsShot = computed(() => bench.value.includes(BenchType.SHOT))
  const isTargetUrl = computed(() => ZCYBaseHostName.includes(location.hostname))

  const curChannelType = ref<ChannelTypeEnum>()

  /** 个案信息对应元素节点 */
  let regBenchDom: HTMLElement | null
  let inquireModal: HTMLElement | null

  /** 点击播报之后查询 */
  const queryInfo = debounce(
    async (queryAttrItem: { emptyNumUse?: QueuePlusUpdateReq; queryText?: string; curChannelType?: ChannelTypeEnum }) => {
      if (isTargetUrl.value) {
        // state.value = 'open'
        clear()
        curChannelType.value = queryAttrItem.curChannelType
        regBenchDom = null
        inquireModal = null
        if (queryAttrItem.queryText) {
          // 个案编码
          await StorageUtil.setItem('curQueryCaseCode', queryAttrItem.queryText)
          await startAutoQuery()
        }
        if (!isEmpty(queryAttrItem.emptyNumUse)) {
          // 一部分个案信息
          await StorageUtil.removeItem('curQueryCaseCode')
          await StorageUtil.setItem('emptyNumUse', queryAttrItem.emptyNumUse)
          await checkInputAndBtn()
        }
      }
    },
    200
  )

  // const mutationObserver = new MutationObserver((mutationsList: MutationRecord[], observer: MutationObserver) => {
  const mutationObserver = new ObserverDom(() => {
    Log.d('空号补全中...')
    // if (benchIsReg.value) {
    /** 登记 */
    if (!inquireModal) watchDialogOpen()
    // if (!regBenchDom) inquireModalObserve()
    // } else if (benchIsPre.value) {
    /** 询问 */
    // inquireBenchObserve()
    // }
  })

  /** 用于保存需要的数据 */
  let caseInfoObj = {
    ['受种者姓名']: '',
    ['受种者性别']: '',
    ['身份证件号码']: '',
    ['出生日期']: '',
    ['受种者编码']: '',
  }

  /** 登记页面 */
  const watchDialogOpen = debounce(async () => {
    regBenchDom = document.querySelector('div[class="registrationDesk-content-left"]') as HTMLElement
    if (regBenchDom) {
      await funObserveInfo(regBenchDom)
    }
  }, 500)
  /** 未询问弹窗 */

  const inquireModalObserve = debounce(async () => {
    inquireModal = document.querySelector('div[class="ant-modal health-inquire-modal"]') as HTMLElement
    if (inquireModal) {
      await funObserveInfo(inquireModal)
    }
  }, 200)

  /** 健康询问使用到的DOM */

  const inquireBenchObserve = debounce(async () => {
    const inquireBench = document.querySelector('div[class="health-inquire-page"]') as HTMLElement
    if (inquireBench) {
      await funObserveInfo(inquireBench)
    }
  }, 500)

  const funObserveInfo = async (dom: HTMLElement) => {
    if (dom) {
      // Log.d('空号 对应dom', [dom])
      const caseInfoDom = dom.querySelector('div[class="userInfoCard content"]') as HTMLElement
      const nameDom = caseInfoDom?.querySelector('div[class="head-left-content"]') as HTMLElement

      if (nameDom) {
        const [userName, gender] = nameDom.innerText.split('\n')
        let sex = gender?.includes('男') ? '1' : gender?.includes('女') ? '2' : ''
        caseInfoObj['受种者姓名'] = userName
        caseInfoObj['受种者性别'] = sex
      }
      const otherInfoGird = caseInfoDom?.querySelector('div[class="zcy-form-grid zcy-form-grid-horizontal"]') as HTMLElement
      if (otherInfoGird && !isEmpty(otherInfoGird?.children)) {
        let infoRows = otherInfoGird?.children as HTMLCollection
        Array.from(infoRows).forEach((dom) => {
          const item = dom as HTMLElement
          const [key, val] = item?.innerText?.split('\n')
          if (['身份证件号码', '受种者编码'].includes(key)) {
            caseInfoObj[key as keyof typeof caseInfoObj] = val
          }
          if ('出生日期'.includes(key)) {
            const birthday = val?.split(' ')[0]
            birthday &&
              dayjs(birthday).format('YYYY-MM-DD') != 'Invalid Date' &&
              (caseInfoObj[key as keyof typeof caseInfoObj] = birthday)
          }
        })
      }
      const emptyNumUse = await StorageUtil.getItem('emptyNumUse')
      await StorageUtil.setItem('emptyNumUse', {
        ...emptyNumUse,
        userName: caseInfoObj['受种者姓名'],
        code: caseInfoObj['受种者编码'],
        idCard: caseInfoObj['身份证件号码'],
        sex: caseInfoObj['受种者性别'],
        birthday: caseInfoObj['出生日期'],
      } as QueuePlusUpdateReq)
      const lastFinishCode = await StorageUtil.getItem('lastFinishCode')
      if (caseInfoObj['受种者姓名'] && caseInfoObj['受种者编码'] && caseInfoObj['受种者编码'] != lastFinishCode) {
        // Log.d('页面+缓存', {
        //   ...emptyNumUse,
        //   userName: caseInfoObj['受种者姓名'],
        //   code: caseInfoObj['受种者编码'],
        //   idCard: caseInfoObj['身份证件号码'],
        //   sex: caseInfoObj['受种者性别'],
        //   birthday: caseInfoObj['出生日期'],
        // })
        await StorageUtil.setItem('lastFinishCode', caseInfoObj['受种者编码'])
        await saveInquiryInfo()
      }
    }
  }

  /** 询问页面保存真实受种者信息 */
  const saveInquiryInfo = async () => {
    const emptyNumUse = (await StorageUtil.getItem('emptyNumUse')) as QueuePlusUpdateReq
    // Log.d('缓存', emptyNumUse)
    if (!isEmpty(emptyNumUse) && emptyNumUse.deptId && emptyNumUse.channelId && emptyNumUse.userName) {
      await queuePlusUpdate(emptyNumUse)
      await StorageUtil.removeItem('emptyNumUse')
      await StorageUtil.setItem('curQueryCaseCode', emptyNumUse.code)
      clear()
      mutationObserver?.disconnect()
    }
  }

  /** 空号情况找到对应input并进行observe */
  const checkInputAndBtn = async () => {
    await wait(300)
    mutationObserver.observe('', { attributes: true, subtree: true, characterData: true })
  }

  const startAutoQuery = async () => {
    if (isTargetUrl.value) {
      const curQueryCaseCode = await StorageUtil.getItem('curQueryCaseCode')
      // Log.d(curChannelType.value, curQueryCaseCode)
      if (curQueryCaseCode) {
        const queryDom = document.querySelector('div[class="content-scan-check"]') as HTMLElement
        const inputDom = queryDom?.querySelector(
          benchIsShot.value
            ? 'input[placeholder="受种者编码/接种证条形码/身份证/电子预防接种证/疫苗追溯码"]'
            : 'input[placeholder="受种者编码/接种证条形码/身份证/电子预防接种证"]'
        ) as HTMLInputElement
        const queryBtn = queryDom?.querySelector('button[class="ant-btn search-btn"]') as HTMLButtonElement
        if (inputDom) {
          inputDom.value = curQueryCaseCode
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
          nativeInputValueSetter?.call(inputDom, curQueryCaseCode)
          const event = new Event('input', { bubbles: true })
          inputDom.dispatchEvent(event)
        }
        if (inputDom && queryBtn) {
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
          })
          queryBtn.dispatchEvent(clickEvent)
          if (inputDom) {
            await wait(300)
            inputDom.select()
          }
        }
      } else {
        const emptyNumUse = await StorageUtil.getItem('emptyNumUse')
        if (!isEmpty(emptyNumUse)) {
          await checkInputAndBtn()
        }
      }
    }
  }

  const stopMutationObserver = async () => {
    mutationObserver && mutationObserver.disconnect()
    await StorageUtil.removeItem('emptyNumUse')
    await StorageUtil.removeItem('curQueryCaseCode')
  }

  const clear = () => {
    regBenchDom = null
    inquireModal = null
    state.value = 'close'
    caseInfoObj = {
      ['受种者姓名']: '',
      ['受种者性别']: '',
      ['身份证件号码']: '',
      ['出生日期']: '',
      ['受种者编码']: '',
    }
  }

  onMounted(async () => {
    clear()
    await startAutoQuery()
  })

  onUnmounted(async () => {
    stopMutationObserver()
  })

  return {
    queryInfo,
    stopMutationObserver,
    state,
  }
}

export default useAutoFillIn
