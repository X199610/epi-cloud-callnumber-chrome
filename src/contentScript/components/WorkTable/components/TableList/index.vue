<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Button, Space, Table, Tooltip } from 'ant-design-vue'
import type { GetComponentProps } from 'ant-design-vue/es/vc-table/interface'
import { cloneDeep, debounce, isArray, isEmpty, isEqual, throttle } from 'lodash-es'
import dayjs from 'dayjs'
import { v4 as uuid } from 'uuid'

import ContextMenu from '@/components/ContextMenu/index.vue'

import useTableData from './hooks/useTableData'
import useBase from './hooks/useBase'
import useWorkTableBase from '../../hooks/useBase'
import useWsFun from '@/ws/WorkBenchWs/useWsFun'
import useFetchSeedlingsWsFun from '@/ws/FetchSeedlingsWs/useWsFun'

import Msg from '@/utils/message'
import Log from '@/utils/log'
import StorageUtil from '@/utils/storage'

import { ActionItem } from '@/components/ContextMenu/types'
import { TableRowItem } from './types'
import { BtnsItem, ControlsEnum, CurPlayTypeEnum, QueueBtnItem, SomeTableDataItem } from '../../types'

import { useBroadcastWs } from '@/ws/WorkBenchWs'
import { BroadcastWsMessage, PromiseReturnType, WsMessageContent } from '@/ws/WorkBenchWs/types'

import {
  CallQueueVo,
  QueueJumpReq,
  QueuePlusInDelayReq,
  QueuePlusInRefreshReq,
  QueuePlusUpdateReq,
  StatusEnum,
  VaccinationReturnCallReq,
} from '@/api/child/queuePlusIn/types'
import { StatusEnum as FetchSeedlingsStatusEnum } from '@/api/fetchSeedlings/types'
import {
  queueJump,
  queuePlusInDelay,
  queuePlusInRefresh,
  queuePlusInVaccinationCall,
  queuePlusUpdate,
  vaccinationReturnCall,
} from '@/api/child/queuePlusIn'
import { getWorkbenchChannel } from '@/api/uc/workbenchChannel'
import { ChannelTypeEnum, WorkbenchTypeEnum, channelTypeKV, channelTypeSortKV } from '@/api/uc/types'
import { wait } from '@/utils/commonUtil'
import { CatchVaccineEnum, GetQueueConfigByDeptIdRes } from '@/api/uc/queueConfig/types'
import { getOrders, sendOrder, withDrawOrder } from '@/api/fetchSeedlings'
import { GetOrdersReq, GetOrdersResData, SendOrderReq } from '@/api/fetchSeedlings/types'
import { OrderWsResData } from '@/ws/FetchSeedlingsWs/types'

import { returnSendOrderReqData } from '@/utils/filterData'
const props = defineProps<{
  /** 当前工作台 */
  curSelectedTable: string
  curWorkBenchName: string
  /** 可接种的苗的次类编码 */
  inoculableVaccines: string[]
  /** 当前工作台类型 */
  curWorkbenchType?: WorkbenchTypeEnum | null
  /** 当前叫号人 */
  curPerson: TableRowItem
  isTableShow: boolean
  /** 操作按钮 */
  btnsList: BtnsItem[]
  /** 疫苗选择弹窗状态 */
  controlState: ControlsEnum | null
}>()

const emits = defineEmits<{
  /** 改变队列清除操作按钮的禁选状态 */
  (e: 'clearBtnDisabled'): void
  (e: 'update:btnsList', v: BtnsItem[]): void
  (e: 'update:curPerson', v: TableRowItem): void
  /** 解绑/改变队列 关闭疫苗弹窗 */
  (e: 'closeVaccineTable', v: boolean): void
  /** 关闭下拉 */
  (e: 'closeSelect'): void
}>()

const {
  tableColumns,
  tableData,
  someTableData,
  getLoading,
  fetchSeedlingsTableColumns,
  centerControlInfoLoading,
  centerControlList,
  outSideStatusColorKV,
  inoculateTableColumns,
  vaccineTableColumns,
} = useTableData()
const {
  channelQueue,
  btnListRef,
  lock_icon,
  wait_in_line_icon,
  curQueue,
  queueObj,
  curRevocationRowData,
  changeQueueBtnStyle,
  funTargetWorkbenchId,
  channelIdsList,
  queueConfig,
  order_failed_icon,
  funGetQueueConfigByDeptId,
} = useBase()
const { draggableSize } = useWorkTableBase()

const { wsInfo, startWS, closeWs } = useWsFun()
const { wsInfo: fWsInfo, startWS: fWsStart, closeWs: fWsClose } = useFetchSeedlingsWsFun()

/** 自定义菜单 */
const menuRef = ref<InstanceType<typeof ContextMenu>>()

/** 自定义菜单列表 */
const menuList = ref<ActionItem[]>([])

/** 正在切换 */
const isScroll = ref(false)
const isChangeQueue = ref(false)
const isSendingOrder = ref(false)

const channelType = computed(() => queueObj.value[curQueue.value]?.channelType)

const clearStorage = async () => {
  await StorageUtil.removeItem(['curQueryCaseCode', 'emptyNumUse'])
}

/** 处理行右键菜单 */
const customRow: GetComponentProps<TableRowItem> = (row: SomeTableDataItem, ind?: number) => {
  emits('closeSelect')
  return {
    style: {
      background: row.id == curRevocationRowData.value.id ? 'rgba(31, 101, 254, 0.1) !important' : '',
      cursor: getLoading.value ? 'wait' : 'pointer',
    },
    onContextmenu: (e: MouseEvent) => {
      e.preventDefault()
      // 插队按钮只有接种延迟队列和登记延迟队列会显示插队
      // if (menuRef.value && (globalConfig.env == 'development' || channelType.value == ChannelTypeEnum.OBSERVATION)) {
      if (
        menuRef.value &&
        ((channelType.value == ChannelTypeEnum.VACCINATION_DELAY && props.curWorkbenchType === WorkbenchTypeEnum.VACCINATION) ||
          (channelType.value == ChannelTypeEnum.REGISTRATION_DELAY && props.curWorkbenchType === WorkbenchTypeEnum.REGISTRATION))
      ) {
        curRevocationRowData.value = row
        menuList.value = [
          {
            callBack: async () => {
              const { deptId, queueNum, channelId, id, workbenchId, vaccineVoList } = curRevocationRowData.value
              const targetChannelId = funTargetWorkbenchId()
              if (targetChannelId) {
                const reqObj: QueueJumpReq = {
                  deptId,
                  queueNum,
                  sourceChannelId: channelId,
                  targetChannelId,
                  id,
                  queueType: channelType.value,
                  vaccineVoList: vaccineVoList,
                  workbenchId: props.curSelectedTable,
                } as QueueJumpReq
                await queueJump(reqObj)
                Msg.success({ content: '插队成功！' })
                await clearStorage()
                curRevocationRowData.value = {} as TableRowItem
                await changeQueue(targetChannelId)
              }
            },
            title: '插队',
          },
        ]
        menuRef.value.showMenuList(e)
      } else if (
        menuRef.value &&
        channelType.value != ChannelTypeEnum.VACCINATION_DELAY &&
        channelType.value != ChannelTypeEnum.REGISTRATION_DELAY
      ) {
        curRevocationRowData.value = row
        menuList.value = [
          {
            callBack: async () => {
              if (row.workbenchId && row.workbenchId != props.curSelectedTable) {
                return Msg.warn({ content: '禁止操作其他工作台的受种者!' })
              }
              const reqObj: QueuePlusUpdateReq = {
                ...row,
                queueType: channelType.value,
                preBindWorkbench: props.curWorkBenchName,
                preBindWorkbenchId: props.curSelectedTable,
              } as QueuePlusUpdateReq
              await queuePlusUpdate(reqObj)
              Msg.success({ content: '插队成功！' })
              await clearStorage()
              curRevocationRowData.value = {} as TableRowItem
            },
            title: '插队',
          },
          {
            callBack: async () => {
              if (row.workbenchId && row.workbenchId != props.curSelectedTable) {
                return Msg.warn({ content: '禁止撤回其他工作台的受种者!' })
              }
              const { deptId, queueNum, channelId, id, workbenchId, vaccineVoList } = row
              Log.d(row)
              if (workbenchId) {
                return Msg.warn({ content: '当前受种者已被绑定，请解绑后再进行撤回！' })
              }
              const targetChannelId = funTargetWorkbenchId()
              if (targetChannelId) {
                const reqObj: QueuePlusInDelayReq = {
                  deptId,
                  queueNum,
                  sourceChannelId: channelId,
                  targetChannelId,
                  id,
                  queueType: channelType.value,
                  vaccineVoList: [ChannelTypeEnum.VACCINATION_DELAY, ChannelTypeEnum.OBSERVATION].includes(channelType.value)
                    ? vaccineVoList
                    : undefined,
                } as QueuePlusInDelayReq
                await queuePlusInDelay(reqObj)
                Msg.success({ content: '撤回成功！' })
                await clearStorage()
                curRevocationRowData.value = {} as TableRowItem
              }
            },
            title: '撤回',
          },
        ]
        menuRef.value.showMenuList(e)
      }
    },
    onClick: async (e: MouseEvent) => {
      e.stopPropagation()
      if (menuRef?.value?.show) {
        menuRef?.value.close()
      }
      const curPlayType = await StorageUtil.getItem('curPlayType')
      await funGetQueueConfigByDeptId()
      const key = uuid()
      // if (
      //   curPlayType == CurPlayTypeEnum.MANUAL_OPERATION &&
      //   channelType.value == ChannelTypeEnum.VACCINATION &&
      //   props.curWorkbenchType == WorkbenchTypeEnum.VACCINATION &&
      //   queueConfig.value.catchVaccine == CatchVaccineEnum.YES
      // ) {
      //   if (row.preBindWorkbenchId && row.preBindWorkbenchId != props.curSelectedTable) {
      //     return Msg.warn({ content: '请选择当前工作台预绑定或等待中的受种者！', key})
      //   }
      // }
      if (row.workbenchId && row.workbenchId != props.curSelectedTable) {
        return Msg.warn({ content: '请选择当前工作台已绑定或等待中的受种者！', key })
      } else {
        const minePerson = tableData.value.find((i) => i.workbenchId == props.curSelectedTable)
        if (minePerson) {
          if (row.workbenchId != minePerson.workbenchId) {
            return Msg.warn({ content: '请完成当前工作台已绑定的受种者！', key })
          }
        }
        curRevocationRowData.value = row
        if (!curRevocationRowData.value.workbenchId) {
          const btnList = cloneDeep(props.btnsList)
          btnList.find((i) => i.label == ControlsEnum.REPALY)!.disabled = true
          emits('update:btnsList', btnList)
        }
      }
    },
  }
}

/** 解锁 */
const willBeUnlock = (e: MouseEvent, rowItem: Record<string, any>) => {
  const row = rowItem as TableRowItem
  e.stopPropagation()
  menuList.value = [
    {
      callBack: async () => {
        if (row.workbenchId && row.workbenchId != props.curSelectedTable) {
          return Msg.warn({ content: '禁止解绑其他工作台的受种者!' })
        }
        const { channelId, deptId, queueNum, id, vaccineVoList } = cloneDeep(row)
        const reqObj: VaccinationReturnCallReq = { channelId, deptId, queueNum, id, vaccineVoList }
        await vaccinationReturnCall(reqObj)
        Msg.success({ content: '解绑成功！' })
        await clearStorage()
        emits('closeVaccineTable', true)
        emits('update:curPerson', {} as TableRowItem)
        curRevocationRowData.value = {} as TableRowItem
      },
      title: '解绑',
    },
  ]
  menuRef.value?.showMenuList(e)
}

/** 撤回发苗 */
const revocation = (e: MouseEvent, rowItem: Record<string, any>) => {
  const row = rowItem as GetOrdersResData
  e.stopPropagation()
  menuList.value = [
    {
      callBack: async () => {
        await withDrawOrder(row.presNO)
        Msg.success({ content: '撤回成功！' })
      },
      title: '确认',
    },
  ]
  menuRef.value?.showMenuList(e)
}

/** 滚动按钮容器 */
const scrollBtnsBox = async (t: 'left' | 'right') => {
  if (btnListRef.value && !isScroll.value) {
    isScroll.value = true
    const queueObjKeys = Object.values(queueObj.value).map((i) => i.channelId)
    const curInd = queueObjKeys.findIndex((k, ind) => k == curQueue.value)
    if ((curInd == 0 && t == 'left') || (curInd == queueObjKeys.length - 1 && t == 'right')) {
      return
    }
    await changeQueue(queueObjKeys[t == 'left' ? curInd - 1 : curInd + 1])
    await scrollBtnListView()
  }
  isScroll.value = false
}
const scrollBtnListView = async () => {
  if (btnListRef.value) {
    await nextTick()
    const curSelectedDom = btnListRef.value.getElementsByClassName('curSelected')[0]
    curSelectedDom?.scrollIntoView({ behavior: 'smooth', inline: 'center' })
  }
}

/** 切换队列 */
const changeQueue = async (id: string) => {
  if (curQueue.value != id && !isChangeQueue.value) {
    tableData.value = []
    isChangeQueue.value = true
    curQueue.value = id
    emits('closeVaccineTable', false)
    if (!isScroll.value) {
      await scrollBtnListView()
    }
    await funGetTableData()
    try {
      if (
        queueConfig.value?.catchVaccine == CatchVaccineEnum.YES &&
        props.curWorkbenchType == WorkbenchTypeEnum.VACCINATION &&
        channelType.value == ChannelTypeEnum.VACCINATION
      ) {
        /** 中控的任务列表 */
        await initFetchSeedlingsData()
      }
      if (!['OPEN', 'CONNECTING'].includes(wsInfo.value?.status.value || '')) {
        /** 刷新 */
        const reqObj: QueuePlusInRefreshReq = {
          channelId: id,
          deptId: queueObj.value[id].deptId,
        } as QueuePlusInRefreshReq
        await queuePlusInRefresh(reqObj)
      }
    } finally {
      await changeControlBtn()
    }
  }
  isChangeQueue.value = false
}

/** 获取当前列表状态 并切换按钮的禁用状态 */
const changeControlBtn = async () => {
  emits('clearBtnDisabled')

  const btnList = cloneDeep(props.btnsList)
  const minePerson = tableData.value.find((i) => i.workbenchId == props.curSelectedTable)
  await funGetQueueConfigByDeptId()
  // Log.d(queueConfig)
  // 根据不同的队列类型设置按钮的禁用状态
  const f =
    (props.curWorkbenchType == WorkbenchTypeEnum.INQUIRY && channelType.value == ChannelTypeEnum.INQUIRY_DELAY) ||
    (props.curWorkbenchType == WorkbenchTypeEnum.REGISTRATION &&
      [ChannelTypeEnum.REGISTRATION_DELAY, ChannelTypeEnum.VACCINATION_DELAY].includes(channelType.value)) ||
    (props.curWorkbenchType == WorkbenchTypeEnum.VACCINATION && channelType.value == ChannelTypeEnum.VACCINATION_DELAY) ||
    (props.curWorkbenchType == WorkbenchTypeEnum.CHILD_CARE && channelType.value == ChannelTypeEnum.CHILD_CARE_DELAY)
  btnList.forEach((i) => {
    if (
      // 异常、留观，禁用除刷新外的其他按钮
      ([ChannelTypeEnum.ABNORMAL, ChannelTypeEnum.OBSERVATION].includes(channelType.value) && i.label !== ControlsEnum.REFRESH) ||
      // 延迟队列时，禁用除 刷新 外的其他按钮
      // 播报按钮额外根据工作台类型进行处理
      ([
        ChannelTypeEnum.INQUIRY_DELAY,
        ChannelTypeEnum.REGISTRATION_DELAY,
        ChannelTypeEnum.VACCINATION_DELAY,
        ChannelTypeEnum.CHILD_CARE_DELAY,
      ].includes(channelType.value) &&
        ![ControlsEnum.REFRESH, ...(f ? [ControlsEnum.PLAY] : [])].includes(i.label)) ||
      /** 没有绑定受种者则禁用 完成 按钮 */
      ([ControlsEnum.ACCOMPLISH].includes(i.label) && isEmpty(minePerson)) ||
      /**
       * 询问工作台时，不是询问通道
       * 登记工作台时，不是登记通道
       * 接种工作台时，不是接种通道
       * 儿保工作台时，不是儿保通道
       * 禁用除 刷新、播报、自动播报 以外的按钮
       */
      (((props.curWorkbenchType == WorkbenchTypeEnum.INQUIRY && channelType.value != ChannelTypeEnum.INQUIRY) ||
        (props.curWorkbenchType == WorkbenchTypeEnum.REGISTRATION && channelType.value != ChannelTypeEnum.REGISTRATION) ||
        (props.curWorkbenchType == WorkbenchTypeEnum.VACCINATION && channelType.value != ChannelTypeEnum.VACCINATION) ||
        (props.curWorkbenchType == WorkbenchTypeEnum.CHILD_CARE && channelType.value != ChannelTypeEnum.CHILD_CARE)) &&
        ![ControlsEnum.REFRESH, ...(f ? [ControlsEnum.PLAY] : [])].includes(i.label))
      /** 绑定受种者之后，禁用播报按钮 */
      // || (!isEmpty(minePerson) && i.label == ControlsEnum.PLAY)
    ) {
      i.disabled = true
    } else if (
      // 询问、登记、接种、儿保 时，如果当前工作台没有绑定接种人，则禁用 重播、完成、异常 按钮
      [ChannelTypeEnum.INQUIRY, ChannelTypeEnum.REGISTRATION, ChannelTypeEnum.VACCINATION, ChannelTypeEnum.CHILD_CARE].includes(
        channelType.value
      ) &&
      [ControlsEnum.REPALY, ControlsEnum.DELAY, ControlsEnum.ERROR].includes(i.label)
    ) {
      i.disabled = isEmpty(minePerson)
    } else {
      // 其他情况下，按钮可用
      i.disabled = false
    }
  })

  emits('update:btnsList', btnList) // 更改操作按钮
}

/** 队列锁定的排在最上面 */
const sortTableList = (v: WsMessageContent[]) => {
  return v.sort((a, b) => {
    return a.workbenchId == props.curSelectedTable ? -1 : 0
  })
}

/** 获取队列信息处理数据顺序并将结果放入当前列表数据 */
// const funGetTableData = async () => {
//   getLoading.value = true
//   const data = queueObj.value[curQueue.value] ? queueObj.value[curQueue.value].data || [] : []
//   tableData.value = isArray(data)
//     ? sortTableList(data).map((i) => ({
//         ...i,
//         birthday: i.birthday || '',
//         sex: i.sex || '',
//       }))
//     : []
//   await wait(300)
//   /** 更新按钮的状态 */
//   await changeControlBtn()
//   getLoading.value = false
// }

/** 获取队列信息处理数据顺序并将结果放入当前列表数据 */
// 不带排序的
const funGetTableData = async () => {
  getLoading.value = true
  const data = queueObj.value[curQueue.value] ? queueObj.value[curQueue.value].data || [] : []
  tableData.value = isArray(data)
    ? data.map((i) => ({
        ...i,
        birthday: i.birthday || '',
        sex: i.sex || '',
      }))
    : []
  await wait(300) /** 更新按钮的状态 */
  await changeControlBtn()
  getLoading.value = false
}

/** 获取取苗订单列表 */
const funGetCenterControl = async () => {
  if (centerControlInfoLoading.value) return
  const tableNo = (await StorageUtil.getItem('tableNum')) || ''
  if (tableNo) {
    centerControlInfoLoading.value = true
    const reqObj: GetOrdersReq = {
      stationNO: Number(tableNo),
      orderCreatedTime: dayjs().format('YYYY-MM-DD'),
      status: -1,
    }
    try {
      const { data } = await getOrders(reqObj)
      if (!isEmpty(data)) {
        centerControlList.value = data.map((i) => ({
          ...i,
          status: i.status || i.status === 0 ? `${i.status}` : i.status,
        })) as GetOrdersResData[]
        await StorageUtil.setItem('order', [...cloneDeep(centerControlList.value)])
      } else {
        await StorageUtil.setItem('order', [])
        centerControlList.value = []
      }
    } catch (e) {
      centerControlList.value = (await StorageUtil.getItem('order')) || []
    } finally {
      centerControlInfoLoading.value = false
    }
    Log.d('取苗订单列表', centerControlList.value)
  } else {
    if (props.curWorkbenchType === WorkbenchTypeEnum.VACCINATION) {
      Msg.warn({ content: '请选择台号！' })
    }
  }
}

/** 创建队列按钮队列信息 */
const initQueueList = async () => {
  if (!isEmpty(channelQueue.value)) {
    queueObj.value = {}
    const obj = cloneDeep(channelQueue.value)
    const cur = dayjs().valueOf()
    Object.values(obj).forEach((i) => {
      if (!curQueue.value) {
        curQueue.value = i.channelId
      }
      queueObj.value[i.channelId] = {
        ...i,
        data:
          i.channelType == ChannelTypeEnum.OBSERVATION
            ? i.data?.filter((i1) => Math.abs(dayjs(cur).diff(dayjs(i1.vaccinationTime), 'minutes')) <= 30)
            : i.data,
        title: channelTypeKV[i.channelType],
      }
    })
    await funGetTableData()
    if (
      props.curWorkbenchType === WorkbenchTypeEnum.VACCINATION &&
      channelType.value == ChannelTypeEnum.VACCINATION &&
      queueConfig.value.catchVaccine == CatchVaccineEnum.YES &&
      !isSendingOrder.value
    ) {
      await initFetchSeedlingsData()
      await fetchSeedlings()
    }
  }
}

/** 合并取苗数据 */
const initFetchSeedlingsData = async () => {
  // someTableData.value默认为[]
  someTableData.value = []
  try {
    /** 获取取苗订单列表 */
    await funGetCenterControl()
    await funGetQueueConfigByDeptId()
  } finally {
    // 判断工作台类型是接种的时候请求取苗的接口，将取苗的数据和队列数据进行匹配
    if (
      props.curWorkbenchType === WorkbenchTypeEnum.VACCINATION &&
      channelType.value == ChannelTypeEnum.VACCINATION &&
      queueConfig.value.catchVaccine == CatchVaccineEnum.YES
    ) {
      // 获取取苗列表
      // const allVaccineInfo = await StorageUtil.getItem('allVaccineInfo')
      const order = (await StorageUtil.getItem('order')) || []
      const filterData = tableData.value.map((i) => {
        const t = order.find((i1) => i1?.queueNO == i.queueNum)
        if (t) {
          const { statusDisplay, status, message, orderDrugs, updateTime } = t
          return {
            ...i,
            statusDisplay,
            status,
            message,
            orderDrugs,
            updateTime,
          }
        } else {
          return i as SomeTableDataItem
        }
      })
      // .sort((a, b) => Number(a.queueNum.slice(1)) - Number(b.queueNum.slice(1)))

      let mine: SomeTableDataItem[] = []
      let other: SomeTableDataItem[] = []
      filterData.forEach((i) => {
        if (i.workbenchId == props.curSelectedTable || i.preBindWorkbenchId == props.curSelectedTable) {
          mine = [...mine, i]
        } else {
          other = [...other, i]
        }
      })
      someTableData.value = [...mine, ...other]
    } else {
      someTableData.value = tableData.value
    }
  }
  console.log(someTableData.value, '合并取苗数据列表')
}
/** 获取工作台对应的通道
 * 工作台切换的时候会调用
 */
const getPassage = async () => {
  const userBaseInfo = await StorageUtil.getItem('userBaseInfo')
  if (userBaseInfo && props.curSelectedTable) {
    if (isEmpty(channelIdsList.value)) {
      const { data } = await getWorkbenchChannel({
        deptId: userBaseInfo.deptId,
        workbenchId: props.curSelectedTable,
      })

      /** 保存通道信息 */
      if (isEmpty(data)) {
        Msg.warn({ content: '当前暂无队列。' })
        const btnList = cloneDeep(props.btnsList)
        btnList.forEach((i) => {
          i.disabled = true
        })
        emits('update:btnsList', btnList)
        tableData.value = []
      } else {
        /** 将通道配置排序 且要筛选过滤没必要的通道 */
        const list = data
          .filter((i) =>
            [
              ChannelTypeEnum.INQUIRY,
              ChannelTypeEnum.INQUIRY_DELAY,
              ChannelTypeEnum.REGISTRATION,
              ChannelTypeEnum.REGISTRATION_DELAY,
              ChannelTypeEnum.VACCINATION,
              ChannelTypeEnum.VACCINATION_DELAY,
              ChannelTypeEnum.OBSERVATION,
              ChannelTypeEnum.ABNORMAL,
              ChannelTypeEnum.CHILD_CARE,
              ChannelTypeEnum.CHILD_CARE_DELAY,
            ].includes(i.channelType)
          )
          .sort((a, b) => channelTypeSortKV[a.channelType] - channelTypeSortKV[b.channelType])

        channelQueue.value = {}
        channelIdsList.value = list.map((i) => {
          channelQueue.value[i.channelId] = { ...i, data: [] }
          return i.channelId
        })

        // Log.d(channelQueue.value, '工作台配置信息')
        // Log.d(list, '工作台配置信息')
      }
      /** 创建 queueObj 队列按钮以及数据 */
      initQueueList()
      await funGetQueueConfigByDeptId()

      try {
        if (
          queueConfig.value?.catchVaccine == CatchVaccineEnum.YES &&
          props.curWorkbenchType == WorkbenchTypeEnum.VACCINATION &&
          channelType.value == ChannelTypeEnum.VACCINATION
        ) {
          await fWsStart(onFetchSeedlingsMessage, async () => {
            await initFetchSeedlingsData()
          })
        }
      } finally {
        if (!isEmpty(channelIdsList.value)) {
          /** 开始ws */
          await startWS(channelIdsList.value, onMessage)
        }
      }
    }
  }
}

/** 按照工作台的类型定位对应的队列 */
const locationQueue = async () => {
  const lastWorkbench = await StorageUtil.getItem('lastWorkbench')
  const lastWorkbenchType = lastWorkbench?.type
  const queueObjValues = Object.values(queueObj.value)
  queueObjValues.forEach((i: QueueBtnItem) => {
    if (
      (lastWorkbenchType == WorkbenchTypeEnum.REGISTRATION && i.channelType == ChannelTypeEnum.REGISTRATION) ||
      (lastWorkbenchType == WorkbenchTypeEnum.VACCINATION && i.channelType == ChannelTypeEnum.VACCINATION) ||
      (lastWorkbenchType == WorkbenchTypeEnum.INQUIRY && i.channelType == ChannelTypeEnum.INQUIRY) ||
      (lastWorkbenchType == WorkbenchTypeEnum.CHILD_CARE && i.channelType == ChannelTypeEnum.CHILD_CARE)
    ) {
      curQueue.value = i.channelId
    }
  })
  await scrollBtnListView()
}

/** 预绑定人进行疫苗的下单取苗 */
const fetchSeedlings = throttle(async () => {
  isSendingOrder.value = true
  const tableNum = await StorageUtil.getItem('tableNum')
  if (
    props.curWorkbenchType === WorkbenchTypeEnum.VACCINATION &&
    channelType.value == ChannelTypeEnum.VACCINATION &&
    queueConfig.value.catchVaccine == CatchVaccineEnum.YES &&
    tableNum
  ) {
    const _order = await StorageUtil.getItem('order')
    const _today = dayjs().format('YYYY-MM-DD')
    const _todayOrder = _order ? _order.filter((i) => dayjs(i.orderCreatedTime).format('YYYY-MM-DD') === _today) : []
    await StorageUtil.setItem('order', _todayOrder)
    const _orderQueueNum = _todayOrder.map((i) => i.queueNO)
    const reqList = someTableData.value.filter(
      (i) =>
        i.preBindWorkbench &&
        i.preBindWorkbenchId === props.curSelectedTable &&
        !i.status &&
        !isEmpty(i.vaccineVoList) &&
        !_orderQueueNum.includes(i.queueNum)
    )
    // Log.d('发苗的队列数据', reqList)
    if (!isEmpty(reqList)) {
      const all = () =>
        Promise.all(
          reqList.map(async (i) => {
            return await sendOrder(
              await returnSendOrderReqData({
                patientName: i.userName!, // 姓名
                patientID: i.code!, // 个案编码
                queueNO: i.queueNum!, // 排队号码
                list: i.vaccineVoList,
              })
            )
          })
        )
          .then(async (data) => {
            // Log.d('then 成功', data)
            await initFetchSeedlingsData()
          })
          .catch(async (err) => {
            await initFetchSeedlingsData()
          })

      await all()
    }
  }
  isSendingOrder.value = false
}, 1500)

const onMessage = async (data: BroadcastWsMessage<WsMessageContent[]> | null) => {
  const d = data?.content
  // Log.d(d, 'content')
  if (isArray(d)) {
    // Log.d('branch-msg', d)
    if (!isEmpty(props.inoculableVaccines) && props.curWorkbenchType == WorkbenchTypeEnum.VACCINATION) {
      // Log.d('可接种的苗的次类编码', props.inoculableVaccines)
      const t = d.filter((i) => {
        return isEmpty(i.vaccineVoList) || i.vaccineVoList.some((i1) => props.inoculableVaccines.includes(i1.vaccineMinorCode))
      })
      if (!isEqual(channelQueue.value[data!.channelId].data, t)) {
        channelQueue.value[data!.channelId].data = t
        await initQueueList()
      }
    } else {
      if (!isEqual(channelQueue.value[data!.channelId].data, d)) {
        channelQueue.value[data!.channelId].data = d
        await initQueueList()
      }
    }
  }
  // Log.d(channelQueue.value)
}

const onFetchSeedlingsMessage = async (data: OrderWsResData | null) => {
  const d = data?.data
  if (d) {
    const tableNo = (await StorageUtil.getItem('tableNum')) || ''
    if (d.message && d.stationNO == tableNo && props.curWorkbenchType == WorkbenchTypeEnum.VACCINATION) {
      const key = uuid()
      let msg = d.orderDrugs?.map((i) => i.drugName)?.join('、')
      if (d.message.includes('库存不足')) {
        msg += '因取苗机无库存取苗失败，请手动取苗'
      } else if (d.message.includes('发苗失败')) {
        msg += '取苗失败，请手动取苗'
      } else {
        msg += d.message
      }
      Msg.warn({ content: msg, key, duration: 8 })
    }
    if (data.type == 'order') {
      Log.d('fetch-seedlings-msg', data)
      const target = centerControlList.value.find((i) => i.presNO == d.presNO)
      if (target) {
        centerControlList.value.forEach((i) => {
          if (i.presNO == d.presNO) {
            i = d
          }
        })
      } else {
        centerControlList.value.push(d)
      }
      centerControlList.value
      // .sort((a, b) => dayjs(a.orderCreatedTime).valueOf() - dayjs(b.orderCreatedTime).valueOf())
      // .sort((a, b) => Number(a.status) - Number(b.status))
      await initFetchSeedlingsData()
    } else if (data.type == 'delete') {
      const targetInd = centerControlList.value.findIndex((i) => i.presNO == d.presNO)
      centerControlList.value.splice(targetInd!, 1)
      await initFetchSeedlingsData()
    }
  }
}

onMounted(() => {
  window.addEventListener('contextmenu', (e) => {
    getLoading.value && e.preventDefault()
  })
})

onUnmounted(() => {
  closeWs()
  fWsClose()
  window.removeEventListener('contextmenu', (e) => {
    getLoading.value && e.preventDefault()
  })
})

watch(
  /** 切换工作台的时候 请求通道配置、ws队列 */
  () => props.curSelectedTable,
  async (v) => {
    await funGetQueueConfigByDeptId()
    if (v) {
      curQueue.value = ''
      channelQueue.value = {}
      queueObj.value = {}
      channelIdsList.value = []
      tableData.value = []
      /** 获取工作台对应的通道 */
      await getPassage()
      /** 自动选择工作台对应的业务类型的队列 */
      await locationQueue()
    }
  },
  { immediate: true, deep: true }
)
watch(
  () => curQueue.value,
  async (v) => {
    if (v) {
      curRevocationRowData.value = {} as TableRowItem
      if (
        queueConfig.value?.catchVaccine == CatchVaccineEnum.YES &&
        props.curWorkbenchType == WorkbenchTypeEnum.VACCINATION &&
        channelType.value == ChannelTypeEnum.VACCINATION
      ) {
        // await funGetCenterControl()
        await fWsStart(onFetchSeedlingsMessage, async () => {
          await initFetchSeedlingsData()
        })
      }
    }
  },
  { immediate: true, deep: true }
)

defineExpose({
  channelQueue,
  curQueue,
  channelType,
  tableData,
  someTableData,
  startWS: async () => await startWS(channelIdsList.value, onMessage),
  curRevocationRowData,
  clearCurRevocationRowData: () => (curRevocationRowData.value = {} as TableRowItem),
  scrollBtnListView,
  closeWs,
  fWsClose,
  fWsStart: async () => {
    if (
      queueConfig.value?.catchVaccine == CatchVaccineEnum.YES &&
      props.curWorkbenchType == WorkbenchTypeEnum.VACCINATION &&
      channelType.value == ChannelTypeEnum.VACCINATION
    ) {
      await fWsStart(onFetchSeedlingsMessage, async () => {
        await initFetchSeedlingsData()
      })
    }
  },
  getFetchSeedlingsData: async () => {
    if (
      props.curWorkbenchType === WorkbenchTypeEnum.VACCINATION &&
      channelType.value == ChannelTypeEnum.VACCINATION &&
      queueConfig.value.catchVaccine == CatchVaccineEnum.YES &&
      !isSendingOrder.value
    ) {
      await initFetchSeedlingsData()
      await fetchSeedlings()
    }
  },
  changeQueue,
})
</script>

<template>
  <div
    class="table-list-box"
    v-show="isTableShow"
    :style="{
      width:
        curWorkbenchType == WorkbenchTypeEnum.VACCINATION && queueConfig.catchVaccine == CatchVaccineEnum.YES
          ? `${draggableSize.width}px`
          : `${draggableSize.width}px`,
    }"
    @contextmenu="(e: Event) => e.preventDefault()"
    @click.stop="
      () => {
        menuRef?.close()
        emits('closeSelect')
      }
    "
  >
    <div class="top-list">
      <div class="btn-area btn-area-left" @click="scrollBtnsBox('left')" :style="changeQueueBtnStyle('cursor', 'r')">
        <span class="triangle triangle-left" :style="changeQueueBtnStyle('border', 'r')"></span>
      </div>
      <div ref="btnListRef" class="center-list">
        <Button
          v-for="(i, ind) in queueObj"
          :style="{
            background: ind == curQueue ? 'rgba(31, 101, 254, 0.1)' : '',
            color: ind == curQueue ? '#1F65FE' : '#666',
          }"
          :disabled="getLoading"
          :class="{ curSelected: ind == curQueue }"
          @click="changeQueue(ind)"
          :key="ind"
          >{{ i.title }}({{ i.data.length }})
        </Button>
      </div>
      <div class="btn-area btn-area-right" @click="scrollBtnsBox('right')" :style="changeQueueBtnStyle('cursor', 'l')">
        <span class="triangle triangle-right" :style="changeQueueBtnStyle('border', 'l')"></span>
      </div>
    </div>
    <!-- :locale="{
        emptyText: getLoading ? '加载中...' : '暂无数据',
      }" -->
    <Table
      :customRow="customRow"
      :locale="{
        emptyText: getLoading ? '加载中...' : '暂无数据',
      }"
      :columns="
        channelType == ChannelTypeEnum.VACCINATION &&
        queueConfig.catchVaccine == CatchVaccineEnum.YES &&
        curWorkbenchType == WorkbenchTypeEnum.VACCINATION
          ? vaccineTableColumns
          : channelType == ChannelTypeEnum.VACCINATION
          ? inoculateTableColumns
          : channelType == ChannelTypeEnum.OBSERVATION
          ? inoculateTableColumns
          : tableColumns
      "
      :loading="getLoading"
      :data-source="
        channelType == ChannelTypeEnum.VACCINATION &&
        queueConfig.catchVaccine == CatchVaccineEnum.YES &&
        curWorkbenchType == WorkbenchTypeEnum.VACCINATION
          ? someTableData
          : tableData
      "
      size="small"
      :pagination="false"
      :scroll="
        channelType === ChannelTypeEnum.REGISTRATION || //待登记
        channelType === ChannelTypeEnum.REGISTRATION_DELAY || //登记延迟
        channelType === ChannelTypeEnum.VACCINATION_DELAY || //接种延迟
        channelType === ChannelTypeEnum.ABNORMAL || //异常
        channelType === ChannelTypeEnum.CHILD_CARE || //儿保
        channelType === ChannelTypeEnum.CHILD_CARE_DELAY || //儿保延迟
        channelType === ChannelTypeEnum.OBSERVATION //留观
          ? { y: 50, x: '100%' }
          : { y: 50, x: 600 }
      "
    >
      <template #bodyCell="{ column, value, record }">
        <template v-if="column.dataIndex == 'queueNum'">
          <div v-if="record.workbench" class="work-bench-img">
            <Tooltip placement="topLeft" :title="record.workbench" overlayClassName="ant-tooltip-class">
              <div class="point" v-if="record.workbenchId == curSelectedTable"></div>
              <img
                :src="lock_icon"
                style="width: 15px; height: 15px; margin: -2px 2px 0"
                @click.self="(e: MouseEvent) => willBeUnlock(e, record)"
              />
              {{ value }}
            </Tooltip>
          </div>

          <div
            v-else-if="
              !record.workbench &&
              record.preBindWorkbenchId &&
              (channelType === ChannelTypeEnum.VACCINATION || channelType === ChannelTypeEnum.REGISTRATION) &&
              (queueConfig.catchVaccine == CatchVaccineEnum.YES || record.preBindTime)
            "
            class="work-bench-img"
          >
            <Tooltip placement="topLeft" :title="record.preBindWorkbench" overlayClassName="ant-tooltip-class">
              <div class="point" v-if="record.preBindWorkbenchId == curSelectedTable"></div>
              <img :src="wait_in_line_icon" style="width: 15px; height: 15px; margin: 0 2px" />
              {{ value }}
            </Tooltip>
          </div>
        </template>

        <template v-if="column.dataIndex == 'vaccineVoList'">
          <!-- <div style="line-height: 20px; padding: 4px 6px 4px 0; box-sizing: border-box">
            {{ !isEmpty(record.vaccineVoList) ? record.vaccineVoList.map((i: any) => i.vaccineName)?.join('、') : '-' }}
          </div> -->
          <Tooltip
            v-if="!isEmpty(record.vaccineVoList)"
            placement="top"
            :title="record.vaccineVoList.map((i: any) => i.vaccineName)?.join('、')"
            overlayClassName="ant-tooltip-class"
          >
            <div style="max-width: 106px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
              {{ record.vaccineVoList.map((i: any) => i.vaccineName)?.join('、') }}
            </div>
          </Tooltip>
          <template v-else>-</template>
        </template>

        <template v-if="column.dataIndex == 'statusDisplay'">
          <template
            v-if="
              (record.workbenchId && record.workbenchId == props.curSelectedTable) ||
              (record.preBindWorkbenchId && record.preBindWorkbenchId == props.curSelectedTable)
            "
          >
            <span v-if="record.message?.includes('库存不足')" style="color: #ccc">无库存</span>
            <div v-else-if="value == '发苗失败'" style="color: #f77807; display: flex; align-items: center; column-gap: 4px">
              <span style="">失败</span>
              <Tooltip placement="top" :title="record.message" overlayClassName="ant-tooltip-class">
                <!-- <img :src="order_failed_icon" style="width: 14px; height: 14px; margin-top: -2px" /> -->
                <svg
                  t="1709890161920"
                  class="icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="7055"
                  id="mx_n_1709890161921"
                  width="14px"
                  height="14px"
                  style="transform: translateY(-1px)"
                >
                  <path
                    d="M512 0a512 512 0 1 1 0 1024A512 512 0 0 1 512 0z m0 696.027429c-26.185143 0-47.396571 22.528-47.396571 50.249142 0 27.721143 21.211429 50.249143 47.396571 50.249143 26.258286 0 47.396571-22.528 47.396571-50.322285 0-27.574857-21.211429-50.102857-47.396571-50.102858v-0.073142z m0-468.48c-26.185143 0-47.396571 22.454857-47.396571 50.176v301.202285c0 27.794286 21.211429 50.176 47.396571 50.176 26.258286 0 47.396571-22.454857 47.396571-50.176V277.796571c0-27.794286-21.211429-50.249143-47.396571-50.249142z"
                    fill="#ccc"
                    p-id="7056"
                  ></path>
                </svg>
              </Tooltip>
            </div>
            <span :style="{ color: outSideStatusColorKV[record.status as FetchSeedlingsStatusEnum] }" v-else>{{
              value || '-'
            }}</span>
          </template>

          <template v-else>-</template>
        </template>
      </template>
    </Table>
  </div>
  <ContextMenu ref="menuRef" :menuList="menuList"></ContextMenu>
</template>

<style lang="scss" scoped>
#ad-intercept-chrome-extension-demo {
  .table-list-box {
    position: absolute;
    bottom: -115px;
    height: 115px;
    background: #ffffff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    display: flex;
    flex-direction: column;

    .top-list {
      height: 30px;
      border-bottom: 1px solid #f0f1f5;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      column-gap: 4px;

      .btn-area {
        height: 100%;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
        cursor: pointer;

        &:hover {
          background-color: rgba(31, 101, 254, 0.1);
        }

        .triangle {
          border: 6px solid transparent;
        }

        .triangle-left {
          border-right-color: #1f65fe;
          transform: translateX(-3px);
        }

        .triangle-right {
          border-left-color: #1f65fe;
          transform: translateX(3px);
        }
      }

      .btn-area-left {
        &:hover {
          border-radius: 4px 0 0 4px;
        }
      }

      .btn-area-right {
        &:hover {
          border-radius: 0 4px 4px 0;
        }
      }

      .center-list {
        width: 100%;
        display: flex;
        column-gap: 8px;
        box-sizing: border-box;
        scroll-behavior: smooth;
        overflow-x: auto;
        padding: 1px;

        &::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.ant-tooltip-class {
  z-index: 30002 !important;
  display: flex;
  align-items: center;
}

.work-bench-img {
  display: flex;
  align-items: center;

  span {
    display: flex;
    align-items: center;
  }
}

.ant-dropdown-menu-light {
  display: flex;
  align-items: center;
}

#ad-intercept-chrome-extension-demo {
  .table-list-box {
    .top-list {
      .center-list {
        .ant-btn {
          border-width: 0;
          height: 20px;
          padding: 0px 10px;
          box-sizing: border-box;
          border-radius: 4px;
          box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
        }
      }
    }

    .ant-table-wrapper {
      flex: 1;
      padding: 4px 8px;
      box-sizing: border-box;

      .ant-table-row {
        font-weight: 400;
        color: #333333;
        cursor: pointer;

        td.ant-table-cell {
          height: 24px !important;
          max-height: 24px !important;
          vertical-align: middle !important;
          position: relative;
          .point {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #1f65fe;
            position: absolute;
            top: 5px;
            left: 2px;
          }
        }

        td.ant-table-cell-row-hover {
          background: rgba(31, 101, 254, 0.1) !important;
        }
      }
    }

    tr.ant-table-placeholder {
      td.ant-table-cell {
        border: 0 !important;
        height: 50px;
        line-height: 50px;
        padding: 0 !important;
        color: #666;
        .ant-table-expanded-row-fixed {
          margin: 0;
        }
      }
    }
  }
}
</style>
