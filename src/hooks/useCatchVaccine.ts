import { ref, onMounted, onUnmounted, watch, computed, WritableComputedRef } from 'vue'
import { cloneDeep, debounce, isEmpty } from 'lodash-es'
import { GetVaccineProductInfoResData } from '@/api/uc/vaccineProductInfo/types'
import { devUpdateVaccine, proUpdateVaccine } from '@/utils/updateVaccine'
import { BenchType, ZCYBaseHostName } from './useAutoFillIn/types'
import { RecordSelecteValType } from '@/utils/storage/types'
import { TableRowItem } from '@/contentScript/components/WorkTable/components/TableList/types'
import ObserverDom from './useObserverDom'
import globalConfig from '@/config/global'
import StorageUtil from '@/utils/storage'
import dayjs from 'dayjs'
import Log from '@/utils/log'

export interface VaccListItem {
  type: string
  dosage: string
  vaccName: string
  enterpriseName: string
  regDate: string
  zcyName: string
}

const useCatchVaccine = (curPerson: WritableComputedRef<TableRowItem>) => {
  const isTargetUrl = computed(() => ZCYBaseHostName.includes(location.hostname))

  const bench = computed(() => location.href.split('#/')[1])

  const benchIsReg = computed(() => bench.value.includes(BenchType.REG))

  const today = dayjs().format('YYYY-MM-DD')

  /** 查询到的疫苗信息队列 */
  const finallyDataList = ref<GetVaccineProductInfoResData[]>([])

  const vaccList = ref<VaccListItem[]>([])

  const allVaccineInfo = ref<GetVaccineProductInfoResData[]>([])

  const recordSelecteVal = ref<RecordSelecteValType>({})

  const queryedKeys = ref<string[]>([])

  const isVaccStatus = ref<string>('1')

  const vaccObserver = debounce(async () => {
    const regTableDom = document.querySelector('div[class="registrationDesk-content-right"]') as HTMLElement
    const tabs = regTableDom?.querySelector('div[class="ant-tabs-nav ant-tabs-nav-animated"]') as HTMLElement

    if (tabs) {
      const curTab = tabs.querySelector('div[class="ant-tabs-tab-active ant-tabs-tab"]') as HTMLElement
      if (regTableDom && curTab?.innerText == '当前登记') {
        const tableHeader = regTableDom.querySelector('div[class="ant-table-header ant-table-hide-scrollbar"]')
        const tbody = tableHeader?.nextElementSibling?.querySelector('tbody') as unknown as HTMLElement
        if (tbody?.children && tbody.children.length) {
          vaccList.value = Array.from(tbody.children)
            .filter((item) => {
              const tds = item?.children as unknown as HTMLElement[]
              return (
                Array.from(tds)[4]?.innerText &&
                dayjs(Array.from(tds)[4].innerText).format('YYYY-MM-DD') == dayjs().format('YYYY-MM-DD')
              )
            })
            .map((item) => {
              const tds = item?.children as unknown as HTMLElement[]
              const zcyName = `${tds[2]?.innerText?.trim() || ''}|${tds[3]?.innerText?.trim() || ''}`
              return {
                type: tds[0]?.innerText?.trim() || '',
                dosage: tds[1]?.innerText?.trim() || '',
                vaccName: tds[2]?.innerText?.trim() || '',
                enterpriseName: tds[3]?.innerText?.trim() || '',
                regDate: tds[4]?.innerText?.trim() || '',
                zcyName,
              }
            })
          Log.d('==============================')
          Log.d('vaccList.value = 获取当前登记列表的信息', vaccList.value)
        } else {
          vaccList.value = []
          queryedKeys.value = []
        }
      }
    }
  }, 200)

  /**
   * MutationObserver用法总结
   * https://juejin.cn/post/7016956024561074213#heading-1
   */
  // const mutationObserver = new MutationObserver((mutationsList: MutationRecord[], observer: MutationObserver) => {
  const mutationObserver = new ObserverDom(async () => {
    Log.d('抓苗中...', location.href.split('#/')[1])
    if (benchIsReg.value) {
      funObserveInfo()
      vaccObserver()
    }
  })

  const clear = () => {
    finallyDataList.value = []
    queryedKeys.value = []
    recordSelecteVal.value = {}
    regBenchDom = null
    caseInfoDom = null
    otherInfoGird = null
    curPageCode = ''
    vaccList.value = []
  }

  const start = debounce(async (isClear = true) => {
    Log.d('start 开始获取疫苗信息', isClear)
    isClear ? clear() : stop()
    await funGetAllVaccineInfo()
    recordSelecteVal.value = {}
    // recordSelecteVal.value = (await StorageUtil.getItem('recordSelecteVal')) || ({} as RecordSelecteValType)
    // Log.d([pageDom.value])
    if (isTargetUrl.value) {
      mutationObserver.observe('', { attributes: true, subtree: true, characterData: true })
    }
  }, 200)

  const stop = () => {
    mutationObserver?.disconnect()
    clear()
  }

  /** 匹配对应疫苗 */
  const searchInSource = async (zcyName: string) => {
    const d = allVaccineInfo.value.filter((i1) => i1.zcyName == zcyName)
    Log.d(zcyName, ' <=匹配结果=> ', d)
    const fun = async () => {
      const obj = recordSelecteVal.value[today]
      if (!obj || isEmpty(obj)) {
        recordSelecteVal.value = { [today]: {} }
      }
      if (obj && obj[zcyName] && !isEmpty(obj[zcyName]) && !queryedKeys.value.includes(zcyName)) {
        finallyDataList.value = [...cloneDeep(finallyDataList.value), recordSelecteVal.value[today][zcyName]]
      } else {
        recordSelecteVal.value[today][zcyName] = {} as GetVaccineProductInfoResData
        Log.d('没有匹配到...', zcyName)
        if (d.length && !queryedKeys.value.includes(zcyName)) {
          finallyDataList.value = [
            ...cloneDeep(finallyDataList.value),
            {
              ...d[0],
              productionEnterpriseNameShort: undefined,
              productInfo: undefined,
            } as unknown as GetVaccineProductInfoResData,
          ]
        }
      }
      // await StorageUtil.setItem('recordSelecteVal', recordSelecteVal.value)
    }
    if (!isEmpty(d)) {
      if (d.length == 1 && !queryedKeys.value.includes(zcyName)) {
        finallyDataList.value = [...cloneDeep(finallyDataList.value), d[0]]
      }
      if (d.length > 1) {
        if (!recordSelecteVal.value[today] || isEmpty(recordSelecteVal.value[today])) {
          recordSelecteVal.value = { [today]: {} }
          fun()
        } else {
          fun()
        }
      }
    }
    if (d?.length === 0) fun()
    Log.d('==============================')
  }

  /** 获取cndc疫苗数据 */
  const funGetAllVaccineInfo = async () => {
    allVaccineInfo.value = (await StorageUtil.getItem('allVaccineInfo')) || []
    if (isEmpty(allVaccineInfo.value)) {
      await updateYiMiao()
    }
    Log.d('全部产品信息表数据...', allVaccineInfo.value)
  }

  /** 更新疫苗信息 */
  const updateYiMiao = async () => {
    if (globalConfig.env == 'development') {
      allVaccineInfo.value = await devUpdateVaccine()
    } else {
      allVaccineInfo.value = await proUpdateVaccine()
    }
  }

  let regBenchDom: HTMLElement | null
  let caseInfoDom: HTMLElement | null
  let otherInfoGird: HTMLElement | null
  let curPageCode = ''
  const funObserveInfo = async () => {
    !regBenchDom && ((regBenchDom = document.querySelector('div[class="registrationDesk-content-left"]')) as HTMLElement)
    if (regBenchDom) {
      !caseInfoDom && (caseInfoDom = regBenchDom.querySelector('div[class="userInfoCard content"]') as HTMLElement)
      caseInfoDom &&
        !otherInfoGird &&
        (otherInfoGird = caseInfoDom.querySelector('div[class="zcy-form-grid zcy-form-grid-horizontal"]') as HTMLElement)
      if (otherInfoGird && !isEmpty(otherInfoGird?.children)) {
        let infoRows = otherInfoGird?.children as HTMLCollection
        Array.from(infoRows).forEach((dom) => {
          const item = dom as HTMLElement
          const [key, val] = item?.innerText?.split('\n')
          if (['受种者编码'].includes(key)) {
            curPageCode = val
          }
        })
      }
    }
  }

  // /** 疫苗抓取验证 */
  // const storgeYanZhen = async (_isVaccStatus: string | null) => {
  //   const storgeVccStatus = await StorageUtil.getItem('storgeVaccStatus')

  //   if (_isVaccStatus) {
  //      console.log(_isVaccStatus)
  //     isVaccStatus.value = _isVaccStatus
  //   } else {
  //     if (storgeVccStatus) {
  //       isVaccStatus.value = storgeVccStatus
  //     } else {
  //       isVaccStatus.value = '1'
  //     }
  //   }
  // }

  watch(
    vaccList,
    async (newValue, oldValue) => {
      if (isEmpty(newValue)) {
        finallyDataList.value = []
        queryedKeys.value = []
        isVaccStatus.value = '1'
      }
      if (
        !isEmpty(newValue) &&
        curPerson.value?.code &&
        curPerson.value?.code != '00000000' &&
        curPerson.value?.code == curPageCode &&
        benchIsReg.value
      ) {
        isVaccStatus.value = '2'
        finallyDataList.value = cloneDeep(finallyDataList.value).filter((i) => i.zcyName && queryedKeys.value.includes(i.zcyName))
        const all = () => Promise.all(newValue.map((i) => searchInSource(i.zcyName)))
        await all()
        queryedKeys.value = newValue.map((i) => i.zcyName)

        if (finallyDataList.value.length > 0 && newValue.length === finallyDataList.value.length) {
          isVaccStatus.value = '3'
        }
      }
    },
    { deep: true }
  )

  onMounted(async () => {
    clear()
    await funGetAllVaccineInfo()
  })

  onUnmounted(() => {
    stop()
  })

  return { finallyDataList, start, stop, curPageCode, isVaccStatus }
}

export default useCatchVaccine
