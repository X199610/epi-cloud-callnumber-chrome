<script lang="ts" setup>
import { computed, h, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { Button, Space, Switch, Popconfirm } from 'ant-design-vue'
import { UseDraggable as Draggable } from '@vueuse/components'
import { cloneDeep, isEmpty, debounce } from 'lodash-es'
import dayjs from 'dayjs'
import * as qs from 'qs'
import TableList from './components/TableList/index.vue'
import VaccineInfo from './components/VaccineInfo/index.vue'
import ContextIconMenu from '@/components/ContextIconMenu/index.vue'
import useControls from './hooks/useControls'
import useSelectTable from './hooks/useSelectTable'
import useSelectTableNo from './hooks/useSelectTableNo'
import useBase from './hooks/useBase'
import useAutoFillIn from '@/hooks/useAutoFillIn'
import useCatchVaccine from '@/hooks/useCatchVaccine'
import { wait } from '@/utils/commonUtil'
import { BtnsItem, CurPlayTypeEnum, SomeTableDataItem, curPlayTypeKV } from './types'
import { ControlsEnum } from './types'
import { TableRowItem } from './components/TableList/types'
import Log from '@/utils/log'
import Msg from '@/utils/message'

import {
  queuePlusInDelay,
  queuePlusInRefresh,
  queuePlusInVaccinationCall,
  queuePlusInVaccinationReplay,
  queuePlusUpdate,
  removeQueue,
  revocationAndCall,
  takeNextSerialNumber,
} from '@/api/child/queuePlusIn'
import {
  CallQueueVo,
  QueuePlusInVaccinationReplayReq,
  QueuePlusInDelayReq,
  QueuePlusInRefreshReq,
  QueuePlusUpdateReq,
  CallTypeEnum,
  RevocationAndCallReq,
  RemoveQueueReq,
} from '@/api/child/queuePlusIn/types'
import { ChannelTypeEnum, WorkbenchTypeEnum, channelTypeKV } from '@/api/uc/types'
import { VaccineVo } from '@/ws/WorkBenchWs/types'
import { SaveQueueVaccineProductInfoReq } from '@/api/child/queueVaccineProductInfo/types'
import { saveQueueVaccineProductInfo } from '@/api/child/queueVaccineProductInfo'
import StorageUtil from '@/utils/storage'
import { BenchType, ZCYBaseHostName } from '@/hooks/useAutoFillIn/types'
import { CatchVaccineEnum } from '@/api/uc/queueConfig/types'
import { SelectEleId } from '@/components/SelectTable/initData'
import { returnSendOrderReqData } from '@/utils/filterData'
import { SendOrderReq, StatusEnum } from '@/api/fetchSeedlings/types'
import { sendOrder } from '@/api/fetchSeedlings'
import globalConfig from '@/config/global'
import { ActionItem } from '@/components/ContextIconMenu/types'
import { GetWorkStatusReq, SetWorkStatusReq } from '@/api/uc/workbenchChannel/types'
import { getWorkStatus, setWorkStatus } from '@/api/uc/workbenchChannel'
import { LatestWorkUpdateData } from '@/utils/storage/types'
import { devTakeNextSerialNumber, proTakeNextSerialNumber } from '@/utils/updateVaccine'

const props = defineProps<{
  /** 是否显示 */
  show: boolean
}>()

const emits = defineEmits<{
  closeCheckInDesk: []
}>()

const { btnsList, disabledBtns, btnUsed, btnUnUse, allUnUsed, switch_icon, active_switch_icon, curPlayType, getCurPlayTyp } =
  useControls()
const {
  component: SelectTableComponent,
  curSelectedTable,
  selectOpen,
  selectOpt,
  funGetWorkbench,
  inoculableVaccines,
  curWorkbenchType,
  curWorkBenchName,
} = useSelectTable()
const { component: SelectTableNoComponent, selectOpen: tableNoOpen, curTableNo, toggleOpen } = useSelectTableNo()
const {
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
  getDelayToNormalCallType,
  getDelayToNormalChannelType,
} = useBase()
const { queryInfo, stopMutationObserver } = useAutoFillIn()

let timer: NodeJS.Timer | null
const autoPlayIng = ref(false)

const isHidden = ref<boolean>(false)
const isHiddenNum = ref<number>(0)

/** 自定义菜单 */
// const iconMenuRef = ref<InstanceType<typeof ContextIconMenu>>()
/** 自定义菜单列表 */
// const menuList = ref<ActionItem[]>([])

/** tableList组件 */
const tableListRef = ref<InstanceType<typeof TableList>>()
const curTableData = computed(() => tableListRef.value?.tableData || [])
const curOrderAndTableData = computed(() => tableListRef.value?.someTableData || [])

/** 疫苗信息弹窗 */
const vaccineInfoRef = ref<InstanceType<typeof VaccineInfo>>()

const bench = computed(() => location.href.split('#/')[1])
const benchIsPre = computed(() => bench.value.includes(BenchType.PRE))
const benchIsReg = computed(() => bench.value.includes(BenchType.REG))

const canFetchSeedlings = computed(
  () =>
    queueConfig.value.catchVaccine == CatchVaccineEnum.YES &&
    tableListRef.value?.channelType == ChannelTypeEnum.VACCINATION &&
    curWorkbenchType.value == WorkbenchTypeEnum.VACCINATION
)

/** 工作台的工作状态 1开启 0关闭*/
const workStatus = ref<string>('0')
/** 工作台的工作切换弹窗*/
const workPopConfirm = ref<boolean>(false)
/** 工作台弹窗是否可以关闭 */
const workCanClose = ref<boolean>(false)
/** 是否展示table */
const isTableShow = ref(false)

const curPerson = computed<TableRowItem>({
  get: () => {
    const minePerson = cloneDeep(curTableData.value.find((i) => i.workbenchId == curSelectedTable.value))
    handleMinePerson()
    return minePerson || ({} as TableRowItem)
  },
  set: (v: TableRowItem) => {},
})

// 获取疫苗抓取的数据
const catchVaccine = useCatchVaccine(curPerson)

const isReqing = ref(false)

const clearStorage = async () => {
  await StorageUtil.removeItem(['curQueryCaseCode', 'emptyNumUse'])
}

const handleMinePerson = debounce(() => {
  const minePerson = cloneDeep(curTableData.value.find((i) => i.workbenchId == curSelectedTable.value))
  if (!isEmpty(minePerson)) {
    btnUsed(curPlayType.value == CurPlayTypeEnum.AUTO ? ControlsEnum.AUTO_PLAY : ControlsEnum.PLAY)
    if (ZCYBaseHostName.includes(location.hostname)) {
      const { userName, code, channelId, deptId, queueNum, id, idCard, sex, birthday } = minePerson
      if (
        (benchIsPre.value && tableListRef.value?.channelType == ChannelTypeEnum.INQUIRY) ||
        (benchIsReg.value && tableListRef.value?.channelType == ChannelTypeEnum.REGISTRATION)
      ) {
        if (!userName || code == '00000000') {
          queryInfo({
            emptyNumUse: {
              channelId,
              deptId,
              queueNum,
              id,
              idCard,
              sex,
              birthday,
            } as QueuePlusUpdateReq,
          })
        }
      }
      if (
        benchIsReg.value &&
        tableListRef.value?.channelType == ChannelTypeEnum.REGISTRATION &&
        curWorkbenchType.value == WorkbenchTypeEnum.REGISTRATION &&
        queueConfig.value?.catchVaccine == CatchVaccineEnum.YES
      ) {
        /** 如果是沈苏登记页面才会执行observer */
        console.log('computed 开始疫苗搜索...178')
        catchVaccine.start(false)
      }
    }
  }
  if (isEmpty(minePerson)) {
    allUnUsed()
    stopMutationObserver()
  }
}, 500)

/** 获取要用到的数据 */
const getUseData = () => {
  // 更新工作台数据
  if (curTableData.value && curTableData.value.length > 0) {
    if (
      curWorkbenchType.value === WorkbenchTypeEnum.REGISTRATION &&
      tableListRef?.value?.channelType == ChannelTypeEnum.REGISTRATION
    ) {
      workBranchTime(curTableData.value)
    }
  }

  const returnRowData = () => {
    // Log.d('当前列表数据', curTableData.value, curSelectedTable.value)

    let mineList: SomeTableDataItem[] = []
    let unlocked: SomeTableDataItem[] = []
    if (canFetchSeedlings.value) {
      mineList = (curOrderAndTableData.value || []).filter(
        (i) =>
          i.workbenchId == curSelectedTable.value &&
          (curPlayType.value == CurPlayTypeEnum.AUTO
            ? i.status == StatusEnum.COMPLETED || i.status == StatusEnum.FAIL || (!i.status && isEmpty(i.vaccineVoList))
            : true)
      )
      unlocked = (curOrderAndTableData.value || []).filter(
        (i) =>
          !i.workbenchId &&
          (curPlayType.value == CurPlayTypeEnum.AUTO
            ? (i.preBindWorkbenchId == curSelectedTable.value &&
                (i.status == StatusEnum.COMPLETED || i.status == StatusEnum.FAIL)) ||
              (!i.status && isEmpty(i.vaccineVoList))
            : !i.preBindWorkbenchId || i.preBindWorkbenchId == curSelectedTable.value)
      )
    } else {
      mineList = (curTableData.value || []).filter((i) => i.workbenchId == curSelectedTable.value)
      unlocked = (curTableData.value || []).filter(
        (i) => !i.workbenchId && (!i.preBindWorkbenchId || i.preBindWorkbenchId === curSelectedTable.value)
      )
    }
    // Log.d('mineList', mineList)
    // Log.d('unlocked', unlocked)
    if (!isEmpty(mineList)) {
      return mineList[0]
    } else {
      if (!isEmpty(tableListRef.value?.curRevocationRowData) && curPlayType.value != CurPlayTypeEnum.AUTO) {
        // console.log(tableListRef.value, 'mineList没有数据，且自动播报情况下')
        return tableListRef.value?.curRevocationRowData
      }
    }
    return unlocked[0]
  }
  /** 选中或绑定的受种者信息 */
  const curRowData = cloneDeep(returnRowData())
  // Log.d('选中或绑定的受种者信息', curRowData)
  /** 获取当前通道以及队列人员信息 */
  const curChannelAndQueue = cloneDeep(tableListRef.value?.channelQueue[tableListRef.value?.curQueue])

  const { channelId, deptId, workbenchId, channelType, data: queueData } = cloneDeep(curChannelAndQueue) || {}
  /** 获取队列信息 */
  const {
    queueNum,
    id: queueDataId,
    userName,
    code,
    workbench: queueWorkBench,
    workbenchId: queueWorkBenchId,
    idCard = '',
    sex = '',
    birthday = '',
  } = cloneDeep(curRowData) || {}

  /** 移动队列按钮到可视范围 */
  tableListRef.value?.scrollBtnListView()

  return {
    curRowData, // 选中或绑定的受种者信息
    channelId, // 通道id
    deptId,
    workbenchId, // 工作台id
    channelType, // 通道类型
    queueNum, // 排队编号
    queueDataId, // ws人的队列id
    userName,
    code,
    queueWorkBenchId, // 人绑定的工作台
    queueWorkBench, // 人绑定的工作台
    idCard,
    sex,
    birthday,
    queueData, // 当前通道的所有人员信息
  }
}

const workBranchTime = async (d: any[]) => {
  // Log.d('当前列表最新数据！！！！！', d)

  const workData = d

  // 获取缓存最新数据
  const latestWorkUpdateData: LatestWorkUpdateData[] = (await StorageUtil.getItem('latestWorkUpdateTime')) || []

  // 获取列表中上锁数据
  const filteredData: any[] = []

  workData.map((item) => {
    if (item.workbench) {
      filteredData.push(item)
    }
  })

  // 依据filteredData列表中上锁数据和latestWorkUpdateData缓存最新数据中queueNum字段值一样的话合并数据
  const mergedArray: any = []

  filteredData.map((item) => {
    latestWorkUpdateData.map((items) => {
      if (items.queueNum === item.queueNum) {
        if (items.workTimesTamp) {
          mergedArray.push(items)
        } else {
          mergedArray.push(item)
        }
      }
    })
  })
  // mergedArray = filteredData.concat(latestWorkUpdateData).reduce((accumulator: any[], currentItem: { queueNum: string }) => {
  //   const existingItem = accumulator.find((item) => item.queueNum === currentItem.queueNum)
  //   if (existingItem) {
  //     // 如果已存在，更新现有项的值（可以根据需要选择哪些字段要更新）
  //     Object.assign(existingItem, currentItem)
  //   } else {
  //     // 如果不存在，添加到累加器中
  //     accumulator.push(currentItem)
  //   }
  //   return accumulator
  // }, [])

  // 判断mergedArray中workTimesTamp没有值的情况下，workTimesTamp给当前时间戳
  mergedArray.map((item: { workTimesTamp: number }) => {
    if (!item.workTimesTamp) {
      item.workTimesTamp = new Date().getTime()
    }
  })

  // 排序
  mergedArray.sort((a: { workTimesTamp: number }, b: { workTimesTamp: number }) => b.workTimesTamp - a.workTimesTamp)

  // Log.d('获取缓存中当前工作台最新更新数据', mergedArray)
  await StorageUtil.setItem('latestWorkUpdateTime', mergedArray)
}

// 移动接种人
const movePerson = async (label: ControlsEnum, d: VaccineVo[] = []) => {
  await clearStorage()
  const { channelId, deptId, queueNum, id: queueDataId, vaccineVoList = [], workbenchId } = cloneDeep(curPerson.value)
  // const { channelId, deptId, channelType, queueNum, queueDataId, curRowData, workbenchId } = getUseData()
  Log.d(curPerson.value)
  const channelType = tableListRef.value?.channelType
  /** 目标通道id */
  const targetChannelId = funTargetChannelId(label, { channelType })
  if (!targetChannelId) {
    isReqing.value = false
    return Msg.warn({ content: '请确认队列是否配置正确！' })
  }
  const reqObj: QueuePlusInDelayReq = {
    deptId,
    queueNum,
    sourceChannelId: channelId,
    targetChannelId,
    id: queueDataId,
    queueType: channelType,
    workbenchId: workbenchId,
  } as QueuePlusInDelayReq

  if (channelType == ChannelTypeEnum.VACCINATION) {
    reqObj.vaccinationTime = dayjs().valueOf()
    reqObj.vaccineVoList = isEmpty(vaccineVoList) ? undefined : vaccineVoList
  }
  if (label == ControlsEnum.ACCOMPLISH && channelType == ChannelTypeEnum.REGISTRATION) {
    reqObj.preBindWorkbench = undefined
    reqObj.preBindWorkbenchId = undefined
  }
  if (!isEmpty(d)) {
    reqObj.vaccineVoList = d
  }
  // console.log(reqObj, '疫苗绑定成功后推到ws队列中的数据')
  await queuePlusInDelay(reqObj)
  await closeVaccineTable()
  await wait(300)
}

// 纯播报
const callPerson = async (label: ControlsEnum) => {
  const {
    curRowData, // 选中或绑定的受种者信息
    channelId, // 通道id
    deptId,
    workbenchId, // 工作台id
    channelType, // 通道类型
    queueNum, // 排队编号
    queueDataId, // ws人的队列id
    userName,
    code,
    queueWorkBench, // 人绑定的工作台
    idCard,
    sex,
    birthday,
  } = getUseData()

  /** 目标通道id */
  const targetChannelId = funTargetChannelId(ControlsEnum.PLAY, { channelType })

  // if (isEmpty(curTableData.value)) {
  //   disabledBtns(true) // 禁选所有操作按钮
  //   allUnUsed() // 取消所有按钮高亮
  //   isReqing.value = false
  //   return Msg.warn({ content: `当前队列为空,无法进行${label}!` })
  // }
  // Log.d(queueConfig.value, 'queueConfig.value')
  // Log.d(curRowData, 'curRowData')
  // if (isEmpty(curRowData) && queueConfig.value.catchVaccine != CatchVaccineEnum.YES) {
  //   allUnUsed() // 取消所有按钮高亮
  //   isReqing.value = false
  //   return Msg.warn({ content: `当前等待${channelTypeKV[tableListRef.value!.channelType] || ''}的受种者已播报完毕。` })
  // }

  allUnUsed() // 取消所有按钮高亮
  btnUsed(label)
  if (isEmpty(curRowData) && queueConfig.value.catchVaccine == CatchVaccineEnum.YES) {
    return
  }
  if (!queueWorkBench) {
    /** 没有绑定工作台就播报接口进行绑定 */
    if (!targetChannelId) {
      isReqing.value = false
      return Msg.warn({ content: '请确认队列是否配置正确！' })
    }
    const reqObj: CallQueueVo = {
      channelId,
      deptId,
      targetChannelId,
      workbenchId: curSelectedTable.value,
      preBindWorkbench: curWorkBenchName.value,
      preBindWorkbenchId: curSelectedTable.value,
      queueNum,
      userName,
      type: getCallType(channelType),
      preBindTime: curRowData?.preBindTime,
    } as CallQueueVo

    try {
      await queuePlusInVaccinationCall(reqObj)
      /** 是流水号就到页面找信息 */
      if (!userName || code == '00000000') {
        await queryInfo({
          emptyNumUse: {
            channelId,
            deptId,
            queueNum,
            id: queueDataId,
            idCard,
            sex,
            birthday,
          } as QueuePlusUpdateReq,
        })
      } else {
        await queryInfo({ queryText: code!, curChannelType: channelType })
      }
      if (
        benchIsReg.value &&
        channelType == ChannelTypeEnum.REGISTRATION &&
        queueConfig.value?.catchVaccine == CatchVaccineEnum.YES
      ) {
        console.log('开始疫苗搜索...468')
        catchVaccine.start()
      }
    } finally {
      /** 如果有选中的人员就进行清空 */
      if (!isEmpty(tableListRef.value?.curRevocationRowData)) {
        tableListRef.value?.clearCurRevocationRowData()
      }
      isReqing.value = false
    }
  }
}

/** 自助取号 */
const numberRetrieval = async () => {
  if (globalConfig.env == 'development') {
    devTakeNextSerialNumber()
  } else {
    proTakeNextSerialNumber()
  }
}

/** 点击操作按钮 */
const handleClick = debounce(async (curBtnOpt: BtnsItem) => {
  if (isReqing.value) return
  if (autoPlayIng.value) return
  isReqing.value = true
  if (curBtnOpt.disabled) {
    isReqing.value = false
    return
  }
  btnUsed(curBtnOpt.label) /** 当前按钮高亮 */

  const {
    curRowData, // 选中或绑定的受种者信息
    channelId, // 通道id
    deptId,
    workbenchId, // 工作台id
    channelType, // 通道类型
    queueNum, // 排队编号
    queueDataId, // ws人的队列id
    userName,
    code,
    queueWorkBenchId, // 人绑定的工作台
    queueWorkBench, // 人绑定的工作台
    idCard,
    sex,
    birthday,
    queueData, // 当前通道的所有人员信息
  } = getUseData()

  /** 目标通道id */
  const targetChannelId = funTargetChannelId(curBtnOpt.label, { channelType })

  try {
    /** 自动播报 */
    if (curBtnOpt.label == ControlsEnum.AUTO_PLAY) {
      allUnUsed() // 取消所有按钮高亮
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      try {
        if (curPlayType.value == CurPlayTypeEnum.AUTO) {
          curPlayType.value = CurPlayTypeEnum.MANUAL_OPERATION
          btnUnUse(curBtnOpt.label)
          await StorageUtil.setItem('curPlayType', curPlayType.value)
          Msg.info({ content: '自动播报功能已关闭！', key: 'stop_auto_paly' })
        } else {
          curPlayType.value = CurPlayTypeEnum.AUTO
          btnUsed(curBtnOpt.label)
          await StorageUtil.setItem('curPlayType', curPlayType.value)
          Msg.info({ content: '自动播报功能已开启！', key: 'start_auto_paly' })
          await autoCall()
          timer = setInterval(async () => {
            await autoCall()
          }, 1500)
        }
      } finally {
        /** 如果有选中的人员就进行清空 */
        if (!isEmpty(tableListRef.value?.curRevocationRowData)) {
          tableListRef.value?.clearCurRevocationRowData()
        }
        if (curPlayType.value == CurPlayTypeEnum.MANUAL_OPERATION) return (isReqing.value = false)
      }
    }

    // 刷新 没有队列允许刷新
    if (curBtnOpt.label == ControlsEnum.REFRESH) {
      const reqObj: QueuePlusInRefreshReq = { channelId, deptId } as QueuePlusInRefreshReq
      try {
        if (canFetchSeedlings.value) {
          tableListRef.value?.fWsStart()
        }
        if (channelId && deptId) {
          await queuePlusInRefresh(reqObj)
        } else {
          await tableListRef.value?.startWS()
        }
      } finally {
        /** 如果有选中的人员就进行清空 */
        if (!isEmpty(tableListRef.value?.curRevocationRowData)) {
          tableListRef.value?.clearCurRevocationRowData()
        }
        btnUnUse(curBtnOpt.label)
        isReqing.value = false
        return
      }
    } else {
      if (isEmpty(curTableData.value) && curPlayType.value != CurPlayTypeEnum.AUTO) {
        allUnUsed() // 取消所有按钮高亮
        isReqing.value = false
        return Msg.warn({ content: `当前队列为空,无法进行${curBtnOpt.label}!` })
      }
      if (
        isEmpty(curRowData) &&
        queueConfig.value.catchVaccine != CatchVaccineEnum.YES &&
        curPlayType.value != CurPlayTypeEnum.AUTO
      ) {
        allUnUsed() // 取消所有按钮高亮
        isReqing.value = false
        return Msg.warn({ content: `当前等待${channelTypeKV[tableListRef.value!.channelType] || ''}的受种者已播报完毕。` })
      }
    }

    // 暂停、完成
    if (curBtnOpt.label == ControlsEnum.ACCOMPLISH) {
      allUnUsed() // 取消所有按钮高亮
      btnUsed(curBtnOpt.label)
      /** 如果是登记台需要确认疫苗信息 之后再进行受种者呼叫 */
      /** 测试test */
      if (
        channelType == ChannelTypeEnum.REGISTRATION &&
        isEmpty(curRowData?.vaccineVoList) &&
        queueConfig.value?.catchVaccine == CatchVaccineEnum.YES
      ) {
        catchDate.value = cloneDeep(catchVaccine.finallyDataList.value)
        showVaccineInfoTable.value = true
        controlState.value = ControlsEnum.ACCOMPLISH
        /** 如果有选中的人员就进行清空 */
        if (!isEmpty(tableListRef.value?.curRevocationRowData)) {
          tableListRef.value?.clearCurRevocationRowData()
        }
      } else if (channelType == ChannelTypeEnum.CHILD_CARE) {
        // 执行移出队列接口
        await fetchRemoveQueue(deptId, queueNum, channelId)
        return
      } else {
        try {
          await movePerson(curBtnOpt.label)
        } finally {
          /** 如果有选中的人员就进行清空 */
          if (!isEmpty(tableListRef.value?.curRevocationRowData)) {
            tableListRef.value?.clearCurRevocationRowData()
          }
          btnUnUse(curBtnOpt.label)
        }
      }
    }

    // 播报
    if (curBtnOpt.label == ControlsEnum.PLAY) {
      allUnUsed() // 取消所有按钮高亮
      btnUsed(curBtnOpt.label)
      const f =
        channelType &&
        [
          ChannelTypeEnum.INQUIRY_DELAY,
          ChannelTypeEnum.REGISTRATION_DELAY,
          ChannelTypeEnum.VACCINATION_DELAY,
          ChannelTypeEnum.CHILD_CARE_DELAY,
        ].includes(channelType)

      /** 校验工作台是否空闲，然后撤回到指定队列并播报 */
      const funDelayChannel = async () => {
        const target = await getDelayToNormalChannelId()
        // Log.d('在这里校验撤回并播报', target)
        /** 延迟队列播报 */
        await fetchRevocationAndCall(target)
      }

      if (f) {
        isReqing.value = false
        await funDelayChannel()
        return (isReqing.value = false)
      } else {
        if (curPlayType.value == CurPlayTypeEnum.AUTO) {
          curPlayType.value = CurPlayTypeEnum.MANUAL_OPERATION
          await StorageUtil.setItem('curPlayType', curPlayType.value)
          allUnUsed() // 取消所有按钮高亮
          Msg.info({ content: '已切换为手动播报！', key: 'change_paly' })
          if (!isEmpty(curPerson.value)) {
            btnUsed(curBtnOpt.label)
          } else {
            await wait(300)
            isReqing.value = false
            await handleClick(curBtnOpt)
            return
          }
        }
      }
      if (canFetchSeedlings.value && !queueNum) {
        Msg.warn({ content: '当前队列中无未绑定的受种者。' })
        isReqing.value = false
        btnUnUse(curBtnOpt.label)
        return
      }
      if (!queueWorkBench) {
        await callPerson(curBtnOpt.label)
        // } else {
        // /** 如果是登记台需要确认疫苗信息 之后再进行受种者呼叫 */
        // if (
        //   channelType == ChannelTypeEnum.REGISTRATION &&
        //   isEmpty(curRowData?.vaccineVoList) &&
        //   queueConfig.value?.catchVaccine == CatchVaccineEnum.YES
        // ) {
        //   catchDate.value = catchVaccine.finallyDataList.value
        //   showVaccineInfoTable.value = true
        //   controlState.value = ControlsEnum.PLAY
        //   /** 如果有选中的人员就进行清空 */
        //   if (!isEmpty(tableListRef.value?.curRevocationRowData)) {
        //     tableListRef.value?.clearCurRevocationRowData()
        //   }
        // }
      }
    }

    // 重播
    if (curBtnOpt.label == ControlsEnum.REPALY) {
      if (!queueWorkBenchId) {
        Msg.warn({ content: `${queueNum} ${userName} 暂未绑定工作台，不可重播。` })
        allUnUsed() // 取消对应按钮高亮
        isReqing.value = false
        return
      } else {
        const reqObj: QueuePlusInVaccinationReplayReq = {
          channelId,
          deptId,
          workbenchId,
          queueNum,
          type: getCallType(channelType),
          userName,
        } as QueuePlusInVaccinationReplayReq
        await queuePlusInVaccinationReplay(reqObj)

        Msg.success({ content: `${queueNum} 重播成功！` })

        curPerson.value = cloneDeep(curRowData) as TableRowItem
        await closeVaccineTable()
        /** 如果有选中的人员就进行清空 */
        if (!isEmpty(tableListRef.value?.curRevocationRowData)) {
          tableListRef.value?.clearCurRevocationRowData()
        }
        btnUnUse(curBtnOpt.label)
      }
    }

    // 延迟/异常 移动接种人
    if (curBtnOpt.label == ControlsEnum.DELAY || curBtnOpt.label == ControlsEnum.ERROR) {
      await movePerson(curBtnOpt.label) // 移动受种者
      await closeVaccineTable()
      /** 如果有选中的人员就进行清空 */
      if (!isEmpty(tableListRef.value?.curRevocationRowData)) {
        tableListRef.value?.clearCurRevocationRowData()
      }
      allUnUsed()
    }
  } finally {
    await wait(300)
    isReqing.value = false
  }
}, 800)

// 延迟队列播报
const fetchRevocationAndCall = async (target: string | undefined) => {
  const {
    curRowData, // 选中或绑定的受种者信息
    channelId, // 通道id
    deptId,
    workbenchId, // 工作台id
    channelType, // 通道类型
    queueNum, // 排队编号
    queueDataId, // ws人的队列id
    userName,
    code,
    queueWorkBench, // 人绑定的工作台
    idCard,
    sex,
    birthday,
  } = getUseData()

  Log.d(getUseData(), '选中或绑定的受种者信息')

  const reqObj = {
    queueTransferVo: {
      /** 目的通道编号 */
      channelId: target,
      /** 部门编号 */
      deptId,
      /** 目的通道编号 */
      targetChannelId: target,
      /** 工作台编号 */
      workbenchId,
      /** 队列号（重复播报不能为空） */
      queueNum,
      /** 接种人姓名（重复播报不能为空） */
      userName,
      /** 源通道编号*/
      sourceChannelId: channelId,
      /** 选择的疫苗 */
      vaccineVoList: curRowData?.vaccineVoList,
    },
    callQueueVo: {
      /** 目的通道编号 */
      channelId: target,
      /** 部门编号 */
      deptId,
      /** 目的通道编号 */
      targetChannelId: target,
      /** 工作台编号 */
      workbenchId,
      /** 队列号（重复播报不能为空） */
      queueNum,
      /** 呼叫类型 0- 询问 1- 登记 2- 接种 */
      type: getDelayToNormalCallType(channelType),
      /** 接种人姓名（重复播报不能为空） */
      userName,
      /** 选择的疫苗 */
      // vaccineVoList: curRowData?.vaccineVoList,
    },
  } as RevocationAndCallReq

  Log.d(reqObj, '延迟播报传参')

  try {
    await revocationAndCall(reqObj)
    if (curPlayType.value == CurPlayTypeEnum.AUTO) {
      curPlayType.value = CurPlayTypeEnum.MANUAL_OPERATION
      await StorageUtil.setItem('curPlayType', curPlayType.value)
    }
    if (!target) return (isReqing.value = false)
    await tableListRef.value?.changeQueue(target)
    await wait(300)
    /** 是流水号就到页面找信息 */
    if (!userName || code == '00000000') {
      await queryInfo({
        emptyNumUse: {
          channelId,
          deptId,
          queueNum,
          id: queueDataId,
          idCard,
          sex,
          birthday,
        } as QueuePlusUpdateReq,
      })
    } else {
      // 自动切换到普通队列后的类型
      // Log.d(tableListRef?.value?.channelType, ChannelTypeEnum.VACCINATION)
      await queryInfo({ queryText: code!, curChannelType: getDelayToNormalChannelType(channelType) })
    }
    if (
      benchIsReg.value &&
      channelType == ChannelTypeEnum.REGISTRATION &&
      queueConfig.value?.catchVaccine == CatchVaccineEnum.YES
    ) {
      /** 自动点击页面查询 */
      console.log('开始疫苗搜索...854')
      catchVaccine.start()
    }
  } finally {
    /** 如果有选中的人员就进行清空 */
    if (!isEmpty(tableListRef.value?.curRevocationRowData)) {
      tableListRef.value?.clearCurRevocationRowData()
    }
    isReqing.value = false
  }
}

/** 确认绑定受种者的疫苗 */
const confirmPersonVaccine = debounce(async (vaccineForQueue: VaccineVo[], bindVaccine: SaveQueueVaccineProductInfoReq[]) => {
  await saveQueueVaccineProductInfo(bindVaccine || [])
  // Msg.success({ content: '疫苗信息绑定成功！' })
  if (controlState.value) {
    await movePerson(controlState.value, vaccineForQueue)
    await closeVaccineTable()
    await wait(300)
    // location.reload()
    // if (controlState.value == ControlsEnum.PLAY) {
    //   await callNextPerson(controlState.value) // 播报下一位
    // }
  }
}, 800)

/** 返回目标通道id */
const funTargetChannelId = (btnType: ControlsEnum, opt: { channelType?: ChannelTypeEnum }) => {
  const vList = Object.values(tableListRef.value?.channelQueue || {})
  switch (btnType) {
    case ControlsEnum.ERROR:
      return vList.find((i) => i.channelType === ChannelTypeEnum.ABNORMAL)?.channelId
    case ControlsEnum.PLAY:
      return vList.find((i) => i.channelType === getPlayChannelCode(opt.channelType))?.channelId
    case ControlsEnum.ACCOMPLISH:
      return vList.find((i) => i.channelType === getPlayChannelCode(opt.channelType))?.channelId
    case ControlsEnum.DELAY:
      return vList.find((i) => i.channelType === getDelayChannelCode(opt.channelType))?.channelId
    default:
      return ''
  }
}

const autoCall = async () => {
  // 判断是否可以继续执行播报程序
  if (
    curWorkbenchType.value === WorkbenchTypeEnum.REGISTRATION &&
    tableListRef?.value?.channelType == ChannelTypeEnum.REGISTRATION
  ) {
    // 获取缓存最新数据
    const lastWorkUpdateData = (await StorageUtil.getItem('latestWorkUpdateTime')) || []

    if (lastWorkUpdateData && lastWorkUpdateData.length > 0) {
      Log.d('等候时间最新工作台名称', lastWorkUpdateData[0].workbench, lastWorkUpdateData[0].queueNum)
      Log.d('当前作台名称', curWorkBenchName.value)

      // 尚未分配的工作台
      const lastCurTableData: LatestWorkUpdateData[] = []

      curTableData.value.map((item) => {
        if (item.workbench === undefined || item.workbench === null || item.workbench === '') {
          lastCurTableData.push(item)
        }
      })

      if (lastCurTableData.length === 1) {
        if (curWorkBenchName.value === lastWorkUpdateData[0].workbench) {
          console.log('被阻止！')
          // 延迟2秒执行的代码
          setTimeout(async function () {
            console.log('2秒已过，继续执行下面的代码。')
            await autoCallTime()
            // 这里放置2秒后需要执行的代码
          }, 2000) // 延迟时间单位是毫秒，2秒 = 2000毫秒
        } else {
          await autoCallTime()
        }
      } else {
        await autoCallTime()
      }
    } else {
      await autoCallTime()
    }
  } else {
    await autoCallTime()
  }
}

const autoCallTime = async () => {
  if (autoPlayIng.value) {
    return
  }

  await getCurPlayTyp()

  if (curPlayType.value != CurPlayTypeEnum.AUTO || isEmpty(curTableData.value)) {
    return
  }

  // console.log('执行！！！！')
  const {
    curRowData, // 选中或绑定的受种者信息
  } = getUseData()
  if (isEmpty(curPerson.value) && !isEmpty(curRowData)) {
    if (
      (curWorkbenchType.value == WorkbenchTypeEnum.VACCINATION &&
        tableListRef.value?.channelType == ChannelTypeEnum.VACCINATION) ||
      (curWorkbenchType.value == WorkbenchTypeEnum.REGISTRATION &&
        tableListRef.value?.channelType == ChannelTypeEnum.REGISTRATION) ||
      (curWorkbenchType.value == WorkbenchTypeEnum.INQUIRY && tableListRef.value?.channelType == ChannelTypeEnum.INQUIRY) ||
      (curWorkbenchType.value == WorkbenchTypeEnum.CHILD_CARE && tableListRef.value?.channelType == ChannelTypeEnum.CHILD_CARE)
    ) {
      autoPlayIng.value = true
      try {
        await callPerson(ControlsEnum.AUTO_PLAY)
      } finally {
        autoPlayIng.value = false
      }
    }
  }
}

/** 获取延迟直接播报的目标通道类型 */
const getDelayToNormalChannelId = async () => {
  const queueList = Object.values(tableListRef.value?.channelQueue || {})
  if (curWorkbenchType.value == WorkbenchTypeEnum.INQUIRY) {
    const t = queueList.find((i) => i.channelType == ChannelTypeEnum.INQUIRY)?.channelId
    if (!t) Msg.warn({ content: '未找到待询问队列，请确认队列配置！' })
    return t
  } else if (curWorkbenchType.value == WorkbenchTypeEnum.REGISTRATION) {
    const t = queueList.find((i) => i.channelType == ChannelTypeEnum.REGISTRATION)?.channelId
    if (!t) Msg.warn({ content: '未找到待登记队列，请确认队列配置！' })
    return t
  } else if (curWorkbenchType.value == WorkbenchTypeEnum.VACCINATION) {
    const t = queueList.find((i) => i.channelType == ChannelTypeEnum.VACCINATION)?.channelId
    if (!t) Msg.warn({ content: '未找到待接种队列，请确认队列配置！' })
    return t
  } else if (curWorkbenchType.value == WorkbenchTypeEnum.CHILD_CARE) {
    const t = queueList.find((i) => i.channelType == ChannelTypeEnum.CHILD_CARE)?.channelId
    if (!t) Msg.warn({ content: '未找到儿保队列，请确认队列配置！' })
    return t
  }
}

/** 关闭抓取以及疫苗窗口 */
const closeVaccineTable = async (v: boolean = true) => {
  v && catchVaccine.stop()
  showVaccineInfoTable.value = false
  // catchDate.value = []
  controlState.value = null
  btnUnUse(ControlsEnum.ACCOMPLISH)
}

/** 更新工作台状态 */
const updateWorkStatus = async () => {
  // 移除队列缓存数据
  await StorageUtil.removeItem('latestWorkUpdateTime')
  await fetchGetWorkStatus()
}

/** 获取工作台的工作状态 */
const fetchGetWorkStatus = async () => {
  const userBaseInfo = await StorageUtil.getItem('userBaseInfo')
  const lastWorkbench = await StorageUtil.getItem('lastWorkbench')
  if (lastWorkbench?.id && userBaseInfo?.deptId) {
    const reqObj: GetWorkStatusReq = {
      deptId: userBaseInfo?.deptId,
      workbenchId: lastWorkbench?.id,
    } as GetWorkStatusReq
    workStatus.value = (await getWorkStatus(reqObj)).data
  }
  workPopConfirm.value = false
  workCanClose.value = false
}

const icon_img_click = () => {
  isHiddenNum.value = isHiddenNum.value + 1
  if (isHiddenNum.value >= 5) {
    isHidden.value = true
    isHiddenNum.value = 0
  } else {
    isHidden.value = false
  }
}

/** 拖拽点击事件 */
const draggClick = async () => {
  if (workCanClose.value) {
    workPopConfirm.value = false
  }
}

/** 开启和暂停按钮点击 */
const switchClick = () => {
  workCanClose.value = false
  workPopConfirm.value = !workPopConfirm.value
  setTimeout(function () {
    workCanClose.value = true
  }, 1000)
}

/** 弹窗确认事件 */
const statusConfirm = async () => {
  workStatus.value = workStatus.value === '1' ? '0' : '1'
  workPopConfirm.value = false
  const userBaseInfo = await StorageUtil.getItem('userBaseInfo')
  const lastWorkbench = await StorageUtil.getItem('lastWorkbench')
  const reqObj: SetWorkStatusReq = {
    deptId: userBaseInfo?.deptId,
    workbenchId: lastWorkbench?.id,
    status: workStatus.value,
  } as SetWorkStatusReq
  await setWorkStatus(reqObj)
  Msg.success({ content: '工作台状态修改成功！' })
}

/** 弹窗取消事件 */
const statusCancel = () => {
  workPopConfirm.value = false
}

const fetchRemoveQueue = async (deptId?: string, queueNum?: string, channelId?: string) => {
  const reqObj: RemoveQueueReq = {
    deptId,
    queueNum,
    channelId,
  } as RemoveQueueReq
  await removeQueue(reqObj)
}

const selectTableNo = ref(null)
const openMenu = () => {
  toggleOpen()
}

const updateCurPerson = async () => {
  const emptyNumUse: QueuePlusUpdateReq = {
    /** 通道id */
    channelId: curPerson.value.channelId,
    /** 部门编号 */
    deptId: curPerson.value.deptId,
    /** 队列号（不传默认操作第一个） */
    queueNum: curPerson.value.queueNum,
    /** 个案编码 */
    code: '00000000',
    /** 队列编号 */
    id: curPerson.value.id,
    /** 接种人姓名 */
    userName: '',
    /** 身份证号 */
    idCard: '',
    /** 性别 */
    sex: '',
    /** 出生日期 */
    birthday: '',
  } as unknown as QueuePlusUpdateReq
  await queryInfo({ emptyNumUse })
  if (showVaccineInfoTable.value) {
    showVaccineInfoTable.value = false
    btnUnUse(ControlsEnum.ACCOMPLISH)
  }
  await StorageUtil.setItem('lastFinishCode', '')
  await StorageUtil.setItem('storgeVaccStatus', null)

  catchVaccine.start()
}

/** 当浮动小图标为显示的时候请求工作台、通道、ws队列 */
watch(
  () => props.show,
  async (v) => {
    if (v) {
      await funGetWorkbench()
    }
  },
  { immediate: true }
)

/** 当工作台改变的时候 操作按钮的禁用状态要清除 */
watch(curSelectedTable, (v) => {
  disabledBtns(false)
})

watch(curTableNo, (v) => {
  if (
    v &&
    curWorkbenchType.value == WorkbenchTypeEnum.VACCINATION &&
    queueConfig.value.catchVaccine == CatchVaccineEnum.YES &&
    tableListRef?.value?.channelType == ChannelTypeEnum.VACCINATION
  ) {
    tableListRef?.value?.fWsStart()
    tableListRef?.value?.getFetchSeedlingsData()
  }
})

watchEffect(async () => {
  // if (curWorkbenchType.value == WorkbenchTypeEnum.VACCINATION && queueConfig.value.catchVaccine == CatchVaccineEnum.YES) {
  //   draggableSize.width = 608
  // } else {
  //   draggableSize.width = 496
  // }
  if (curWorkbenchType.value != WorkbenchTypeEnum.REGISTRATION) {
    showVaccineInfoTable.value = false
  }
})

onMounted(async () => {
  await getCurPlayTyp()
  // 获取工作台的工作状态
  await fetchGetWorkStatus()
  if (curPlayType.value == CurPlayTypeEnum.AUTO) {
    timer = setInterval(async () => {
      await autoCall()
    }, 1500)
  }
})

onUnmounted(() => {
  tableListRef.value?.closeWs()
  tableListRef.value?.fWsClose()
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <Draggable
    id="workbench-draggable"
    class="workbench-box"
    :style="draggableObj.style"
    :initial-value="draggableObj.initialValue"
    :prevent-default="true"
    :handle="handleRef"
    @click="draggClick"
  >
    <VaccineInfo
      v-if="curWorkbenchType == WorkbenchTypeEnum.REGISTRATION && curPerson?.queueNum"
      ref="vaccineInfoRef"
      v-model:showVaccineInfoTable="showVaccineInfoTable"
      :catchDate="catchDate"
      :curPerson="curPerson"
      :cur-work-state="controlState"
      @closeVaccineTable="closeVaccineTable"
      @confirm="confirmPersonVaccine"
    >
    </VaccineInfo>
    <div class="top-area" ref="handleRef">
      <div class="left">
        <Space :size="16">
          <div class="left">
            <img :src="check_in_desk_icon" style="width: 16px; height: auto; margin-right: 6px" @click="icon_img_click" />
            <SelectTableComponent @change="updateWorkStatus" />
            <img
              v-if="!isEmpty(selectOpt)"
              :id="SelectEleId.TABLE"
              :src="triangle_icon"
              style="width: 12px; height: 12px"
              :style="{ transform: selectOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"
            />
          </div>
          <div
            v-if="curWorkbenchType == WorkbenchTypeEnum.VACCINATION && queueConfig.catchVaccine == CatchVaccineEnum.YES"
            class="left"
          >
            <SelectTableNoComponent @change="updateWorkStatus" />
            <span style="display: inline-block; width: 40px" v-if="curTableNo"></span>
            <img
              :src="triangle_icon"
              :id="SelectEleId.TABLE_NO"
              style="width: 12px; height: 12px"
              :style="{ transform: tableNoOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"
            />
          </div>
          <!-- 用于测试，放开后打包记得注释 -->
          <Button @click="numberRetrieval" v-if="isHidden" style="height: 20px; padding: 0 8px" type="dashed">自助取号</Button>
          <template
            v-if="
              workStatus && curWorkbenchType == WorkbenchTypeEnum.VACCINATION && queueConfig.catchVaccine == CatchVaccineEnum.YES
            "
          >
            <Popconfirm
              :open="workPopConfirm"
              overlayClassName="ant-pop-confirm-class"
              :title="workStatus === '1' ? '是否确认切换状态为暂停工作？' : '是否确认切换状态为开启工作？'"
              ok-text="确认"
              cancel-text="取消"
              @confirm="statusConfirm"
              @cancel="statusCancel"
            >
              <Switch
                v-if="workStatus === '1'"
                :checked="workStatus"
                :class="workStatus === '1' ? 'switch-work-true' : 'switch-work-false'"
                :checkedValue="'1'"
                :unCheckedValue="'0'"
                :checked-children="workStatus === '1' ? '开启工作' : '暂停工作'"
                @click="switchClick"
              />

              <Switch
                v-else
                :checked="workStatus"
                :class="workStatus === '1' ? 'switch-work-true' : 'switch-work-false'"
                :checkedValue="'1'"
                :unCheckedValue="'0'"
                :checked-children="workStatus === '1' ? '开启工作' : '暂停工作'"
                @click="switchClick"
              />
            </Popconfirm>
          </template>
        </Space>
      </div>
      <div class="right">
        <svg
          z-index="999"
          @click="updateCurPerson"
          t="1713425578068"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="2554"
          width="15"
          height="15"
          style="cursor: pointer"
        >
          <path
            d="M506.696377 512.080115A131.25576 131.25576 0 1 1 636.825917 380.926739 130.641458 130.641458 0 0 1 506.696377 512.080115zM304.284023 701.592136v58.256262h404.92709v-58.256262a145.282311 145.282311 0 0 0-144.668009-145.794229h-115.693455a145.179928 145.179928 0 0 0-144.565626 145.794229z m650.647701-430.011069a506.082075 506.082075 0 0 0-911.213932 29.588857 37.67716 37.67716 0 0 0 18.633813 49.860807 37.267626 37.267626 0 0 0 49.451273-18.83858 431.75159 431.75159 0 0 1 774.73661-29.486473l-66.651716 30.715076 182.038019 130.948609L1023.835879 240.046922z m-10.238358 418.441724A37.267626 37.267626 0 0 0 894.423024 706.608932a431.546823 431.546823 0 0 1-759.788606 28.769788l65.423113-32.865131L13.617017 578.322297 0 803.361423l67.573168-34.093735a506.082075 506.082075 0 0 0 893.808722-28.872172 37.67716 37.67716 0 0 0-16.790908-50.475109z"
            p-id="2555"
            fill="#1f65fe"
          ></path>
        </svg>
        <!-- <img :src="fold_icon" style="width: 15px; height: 15px" @click="emits('closeCheckInDesk')" /> -->
        <img :src="close_icon" style="width: 15px; height: 15px" @click="emits('closeCheckInDesk')" />
      </div>
    </div>
    <div class="controls-area">
      <div class="cur-person">
        <p style="font-size: 12px">现:</p>
        <p style="font-size: 18px; margin: 0 12px 0 2px; min-width: 26px">{{ curPerson?.queueNum || '' }}</p>
        <p style="font-size: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100px">
          {{ curPerson?.queueNum ? curPerson?.userName || '空号' : '待叫号' }}
        </p>
        <div class="num-shrink">
          <span style="font-size: 10px">{{ curTableData.length || 0 }}</span>
          <img v-if="isTableShow" :src="shrink_icon" @click="isTableShow = false" />
          <img v-else :src="shrink_icon" style="transform: rotate(180deg)" @click="isTableShow = true" />
        </div>
      </div>
      <Button
        v-for="i in btnsList"
        style="padding: 0"
        :style="{
          opacity: i.disabled ? 0.6 : 1,
          background: i.isActive ? '#1f65fe' : '#fff',
          color: i.isActive ? '#fff' : '#666',
          width: i.label == ControlsEnum.AUTO_PLAY ? '110%' : '100%',
          cursor: i.disabled ? 'not-allowed' : 'pointer',
        }"
      >
        <div
          class="btn-item"
          @click="() => (i.disabled || autoPlayIng || isReqing ? null : handleClick(i))"
          @dblclick="(e:MouseEvent) => e.preventDefault()"
        >
          <!-- <span
            class="point"
            v-if="i.label == ControlsEnum.ACCOMPLISH"
            :style="{
              backgroundColor: !isEmpty(catchVaccine.finallyDataList.value) ? '#aaec3e' : '#e6e6e6',
            }"
          ></span> -->
          <span
            class="point"
            v-if="i.label == ControlsEnum.ACCOMPLISH && catchVaccine.isVaccStatus.value === '3'"
            style="background-color: #aaec3e"
          ></span>

          <span
            class="point"
            v-if="i.label == ControlsEnum.ACCOMPLISH && catchVaccine.isVaccStatus.value === '2'"
            style="background-color: #f77808"
          ></span>

          <span
            class="point"
            v-if="i.label == ControlsEnum.ACCOMPLISH && catchVaccine.isVaccStatus.value === '1'"
            style="background-color: #e6e6e6"
          ></span>

          <img :src="i.isActive ? i.active_icon : i.icon" style="width: 16px; height: 16px" />
          <span style="text-align: center; width: 100%">{{ i.label }}</span>
        </div>
      </Button>
    </div>
    <TableList
      ref="tableListRef"
      v-model:btnsList="btnsList"
      v-model:curPerson="curPerson"
      @clearBtnDisabled="disabledBtns(false)"
      @close-vaccine-table="closeVaccineTable"
      @close-select="
        () => {
          selectOpen = false
          tableNoOpen = false
        }
      "
      :curSelectedTable="curSelectedTable"
      :curWorkBenchName="curWorkBenchName"
      :inoculableVaccines="inoculableVaccines"
      :curWorkbenchType="curWorkbenchType"
      :isTableShow="isTableShow"
      :controlState="controlState"
    ></TableList>
    <!-- <ContextIconMenu ref="iconMenuRef" :menuList="menuList"></ContextIconMenu> -->
  </Draggable>
</template>
<style lang="scss" scoped>
#ad-intercept-chrome-extension-demo {
  .workbench-box {
    position: fixed;
    z-index: 20000;
    background: #ffffff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    .top-area {
      height: 25px;
      background: rgba(31, 101, 254, 0.1);
      padding: 0px 8px 0px 11px;
      border-radius: 8px 8px 0 0;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      cursor: grab;
      img {
        cursor: pointer;
      }
      .left {
        column-gap: 0px;
        font-size: 16px;
        font-weight: 500;
        color: #1f65fe;
      }
      .right {
        column-gap: 12px;
      }
      .left,
      .right {
        display: flex;
        align-items: center;
      }
    }
    .controls-area {
      border-radius: 0 0 8px 8px;
      flex: 1;
      padding: 4px 8px;
      box-sizing: border-box;
      display: flex;
      column-gap: 8px;
      .cur-person {
        // width: 200px;
        flex: 0 0 200px;
        overflow: hidden;
        height: 35px;
        background: #1f65fe;
        box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        position: relative;
        display: flex;
        color: #ffffff;
        align-items: center;
        padding-left: 8px;
        box-sizing: border-box;
        .num-shrink {
          position: absolute;
          right: 5px;
          bottom: 5px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          img {
            width: 8px;
            height: 11px;
            cursor: pointer;
          }
        }
      }
      button {
        .btn-item {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12px;
          font-weight: 400;
          overflow: hidden;
          position: relative;
          .point {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
          }
          .carousel {
            margin: 0 4px;
            box-sizing: border-box;
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
.ant-pop-confirm-class {
  z-index: 30000 !important;
  .exclamation-circle {
    &::before {
      display: none !important;
    }
  }
  .ant-btn {
    font-size: 12px !important;
  }
}
#ad-intercept-chrome-extension-demo {
  .workbench-box {
    .top-area {
      .left {
        // 下拉框的一些默认样式的修改
        .ant-select-selector {
          background: transparent;
          font-size: 16px;
          font-weight: 500;
          color: #1f65fe;
          height: 21px !important;
          padding: 0 !important;
          .ant-select-selection-item {
            padding: 0;
          }
        }

        .ant-space-item {
          display: flex;
          align-items: center;
          // 工作台开启工作样式
          .switch-work-true {
            width: 80px;
            text-align: left;
            padding-right: 18px;
            font-size: 12px;
            line-height: 1;
            .ant-switch-inner {
              width: 100%;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              line-height: 22px !important;
              .ant-switch-inner-checked {
                line-height: 22px !important;
              }
            }
          }

          // 工作台暂停工作样式
          .switch-work-false {
            width: 80px;
            text-align: right;
            padding-left: 18px;
            font-size: 12px;
            line-height: 1;
            .ant-switch-inner {
              width: 100%;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              line-height: 22px !important;
              .ant-switch-inner-checked {
                line-height: 22px !important;
              }
            }
          }
        }
      }
    }
    .controls-area {
      .ant-btn {
        height: 35px;
        width: 35px;
        box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        border-width: 0;
        color: #666666;
      }
    }
  }
}
</style>
