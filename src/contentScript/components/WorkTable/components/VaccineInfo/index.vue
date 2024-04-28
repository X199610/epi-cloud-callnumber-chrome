<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Button, Select, Table, Space, Input, Empty } from 'ant-design-vue'
import { isEmpty, cloneDeep } from 'lodash-es'
import { getQueueVaccineProductInfoListById } from '@/api/child/queueVaccineProductInfo'
import { SaveQueueVaccineProductInfoReq } from '@/api/child/queueVaccineProductInfo/types'
import { GetVaccineProductInfoResData } from '@/api/uc/vaccineProductInfo/types'
import { ControlsEnum } from '../../types'
import type { TableRowItem } from './types'
import type { TableRowItem as CurPerson } from '../TableList/types'
import { VaccineVo } from '@/ws/WorkBenchWs/types'
import { wait } from '@/utils/commonUtil'
import { SelectProps } from 'ant-design-vue/es/vc-select'
import { ActionItem } from '@/components/ContextMenu/types'
import { CatchVaccineEnum } from '@/api/uc/queueConfig/types'
import globalConfig from '@/config/global'
import { devUpdateVaccine, fetchCurrentRegister, proUpdateVaccine } from '@/utils/updateVaccine'
import { RecordSelecteValType } from '@/utils/storage/types'
import dayjs from 'dayjs'
import ContextMenu from '@/components/ContextMenu/index.vue'
import useBase from './hooks/useBase'
import Log from '@/utils/log'
import StorageUtil from '@/utils/storage'
import Msg from '@/utils/message'

const props = defineProps<{
  /** 是否展示 */
  showVaccineInfoTable: boolean
  /** 获取到的数据 */
  catchDate: Array<Record<string, string>>
  /** 当前登记接种人 */
  curPerson: CurPerson
  /** 当前状态 */
  curWorkState: ControlsEnum | null
}>()

const emits = defineEmits<{
  closeVaccineTable: [boolean]
  confirm: [VaccineVo[], SaveQueueVaccineProductInfoReq[]]
}>()

const myCatchDate = ref<Array<Record<string, string>>>([])

const {
  tableColumns,
  tableData,
  getLoading,
  boundedVaccines,
  tableScroll,
  vaccineList,
  getPopupContainer,
  editableData,
  editableCtrlFun,
  tableRefresh,
  needleNumOptions,
  queueConfig,
  aipTableData,
} = useBase()

const sexKV = {
  ['1']: '男',
  ['2']: '女',
  ['0']: '未知',
}

const today = dayjs().format('YYYY-MM-DD')

const fold_icon = chrome.runtime.getURL('/static/fold_icon.png')

const vaccine_order = chrome.runtime.getURL('/static/vaccine_order.png')

/** 是否收缩 */
const tableShrink = ref(false)

/** 自定义菜单列表 */
const menuList = ref<ActionItem[]>([])

const menuRef = ref<InstanceType<typeof ContextMenu>>()

/** 个案编码 */
const childCode = ref('')

/** 选择疫苗 */
const selectVaccine = (selectValue: { v: any; opt: any; ind: number; key: string }) => {
  const { key, ind, opt } = selectValue
  const {
    productInfo,
    productionEnterpriseNameShort,
    vaccineMinorCode,
    vaccineMinorName,
    id: vaccineProductInfoId,
  } = cloneDeep(opt)

  tableData.value[ind] = {
    ...cloneDeep(tableData.value[ind]),
    isBounded: false,
    id: vaccineProductInfoId,
    productInfo,
    productionEnterpriseNameShort,
    vaccineMinorCode,
    vaccineMinorName,
    vaccineProductInfoId,
    queueInfoId: props.curPerson.id,
    key,
  }
  // 如果没有选择疫苗种类，那么根据选择的疫苗产品自动填充疫苗种类
  if (!tableData.value[ind].vaccineSelected) {
    tableData.value[ind].vaccineSelected = opt.vaccineMinorNameShort
  }
  Log.d(tableData.value)
}

/** 模糊搜索 */
const filterOption = ((value: string, option: any) => {
  const opt = option as GetVaccineProductInfoResData
  const {
    productInfo,
    vaccineMinorCode,
    vaccineMinorName,
    vaccineMinorNameEnglish,
    vaccineMinorNameShort,
    productionEnterpriseNameShort,
  } = opt
  return (
    (productInfo && productInfo?.includes(value)) ||
    (vaccineMinorCode && vaccineMinorCode?.includes(value)) ||
    (vaccineMinorName && vaccineMinorName?.includes(value)) ||
    (vaccineMinorNameEnglish && vaccineMinorNameEnglish?.includes(value)) ||
    (vaccineMinorNameShort && vaccineMinorNameShort?.includes(value)) ||
    (productionEnterpriseNameShort && productionEnterpriseNameShort?.includes(value))
  )
}) as SelectProps['filterOption']

/** 确定绑定 */
const confirm = async () => {
  let isNext = true

  if (!isEmpty(tableData.value)) {
    tableData.value.map((item) => {
      if (!item.productInfo) {
        Msg.warn({ content: '制品名称不能为空，请选择制品名称后再提交！'})
        isNext = false
        return
      }
    })
  }

  if (!isNext) {
    return
  }

  let recordSelecteVal = (await StorageUtil.getItem('recordSelecteVal')) || ({} as RecordSelecteValType)

  const reqList: SaveQueueVaccineProductInfoReq[] = tableData.value
    .filter((i) => !i.isBounded)
    .map((i1) => ({ vaccineProductInfoId: i1.id, queueInfoId: props.curPerson.id, needleNum: i1.needleNum! }))

  const allVaccineInfo = (await StorageUtil.getItem('allVaccineInfo')) || []
  const list: VaccineVo[] = tableData.value.map((i) => {
    const vaccine = allVaccineInfo.find((i1) => i1.id == i.vaccineProductInfoId) || ({} as GetVaccineProductInfoResData)
    const {
      vaccineMinorName,
      vaccineProductNameShort,
      vaccineMinorCode,
      productionEnterpriseNameShort: manufacturerName,
      id,
      cndc,
      zcyName,
    } = vaccine

    const obj = recordSelecteVal[today]
    if (!obj || isEmpty(obj)) {
      recordSelecteVal = { [today]: {} }
    }
    if (recordSelecteVal[today] && recordSelecteVal[today][zcyName] && !isEmpty(vaccine)) {
      Log.d('这里时进行今日选择的', recordSelecteVal[today][zcyName], zcyName)
      recordSelecteVal[today][zcyName] = vaccine
    }

    return {
      vaccineName: vaccineProductNameShort,
      vaccineMinorCode,
      manufacturerName,
      needleNum: i.needleNum,
      cndc,
    } as VaccineVo
  })
  // await StorageUtil.setItem('recordSelecteVal', recordSelecteVal)
  /** 清空疫苗抓取状态 */
  await StorageUtil.setItem('storgeVaccStatus', null)

  /** 每次完成之后保存个案编码 */
  await StorageUtil.setItem('lastFinishCode', props.curPerson?.code)

  emits('confirm', list, reqList)
}

/** 取消绑定 */
const close = async () => {
  /** 清空疫苗抓取状态 */
  await StorageUtil.setItem('storgeVaccStatus', null)
  emits('closeVaccineTable', false)
}

/** 获取当前人是否已经绑定过疫苗 */
const funGetQueueVaccineProductInfoListById = async () => {
  const { data } = await getQueueVaccineProductInfoListById({
    queueInfoId: props.curPerson.id,
  })
  if (!isEmpty(data)) {
    boundedVaccines.value = data?.map((i) => ({
      ...i,
      isBounded: true,
      key: (Math.random() + '').slice(2),
      vaccineSelected: i.vaccineMinorNameShort,
    }))
  } else {
    boundedVaccines.value = []
  }

  tableData.value = [
    ...cloneDeep(boundedVaccines.value),
    ...cloneDeep(
      myCatchDate.value.map((i) => ({
        isBounded: false,
        id: i.id, // 这里的id是疫苗产品信息表id 只是为了table组件作为key使用 不会在绑定时使用
        productInfo: i.productInfo,
        productionEnterpriseNameShort: i.productionEnterpriseNameShort,
        vaccineMinorCode: i.vaccineMinorCode,
        vaccineMinorName: i.vaccineMinorName,
        vaccineProductInfoId: i.id,
        queueInfoId: props.curPerson.id,
        vaccineSelected: i.vaccineMinorNameShort,
        zcyName: i.zcyName,
        key: (Math.random() + '').slice(2),
      }))
    ),
  ]

  console.log(tableData.value, '获取的table数据')
}

interface VaccineMinorGroup {
  vaccineMinorCode: string
  vaccineMinorName: string
  vaccineMinorNameShort: string
  children: GetVaccineProductInfoResData[]
}

const useVaccineList = ref<VaccineMinorGroup[]>()

/** 格式化抓到的数据 */
const initTableData = async () => {
  getLoading.value = true

  try {
    await funGetQueueVaccineProductInfoListById()
  } finally {
    if (isEmpty(vaccineList.value)) {
      const allVaccineInfo = (await StorageUtil.getItem('allVaccineInfo')) || []
      const allVaccineInfoSort = !isEmpty(allVaccineInfo)
        ? allVaccineInfo.sort((a, b) => Number(a?.vaccineMinorCode) - Number(b?.vaccineMinorCode))
        : []
      const useVaccineInfoObj = new Map()
      allVaccineInfoSort.forEach((item) => {
        const mapKey = item.vaccineMinorNameShort
        if (useVaccineInfoObj.get(mapKey) == undefined) {
          useVaccineInfoObj.set(mapKey, {
            vaccineMinorCode: item.vaccineMinorCode,
            vaccineMinorName: item.vaccineMinorName,
            vaccineMinorNameShort: item.vaccineMinorNameShort,
            zcyName: item.zcyName,
            children: [item],
          })
        } else {
          const _children = useVaccineInfoObj.get(mapKey).children
          useVaccineInfoObj.set(mapKey, {
            vaccineMinorCode: item.vaccineMinorCode,
            vaccineMinorName: item.vaccineMinorName,
            vaccineMinorNameShort: item.vaccineMinorNameShort,
            zcyName: item.zcyName,
            children: [..._children, item],
          })
        }
      })
      useVaccineList.value = Array.from(useVaccineInfoObj.values())
      vaccineList.value = allVaccineInfoSort
      Log.d(useVaccineList.value, '疫苗列表数据')
      Log.d(tableData.value, '当前抓取疫苗数据')

      // 当前抓取到的苗是空的时候，执行添加一行
      if (tableData.value.length === 0 && isEmpty(tableData.value[0]?.vaccineSelected)) {
        addOneRow()
      }
    }

    getLoading.value = false
  }
}

/** 点击菜单 */
const delVaccine = async (e: MouseEvent, row: TableRowItem) => {
  e.stopPropagation()
  menuList.value = [
    {
      callBack: async () => {
        tableData.value = tableData.value.filter((i) => i.key != row.key)
        if (isEmpty(tableData.value)) {
          tableRefresh.value = false
        }
        editableCtrlFun.cancel(row.key)
        await wait(100)
        tableRefresh.value = true
      },
      title: '确认',
    },
  ]
  menuRef.value?.showMenuList(e)
}

/** 添加一行  */
const addOneRow = () => {
  const key = (Math.random() + '').slice(2)
  tableData.value.push({
    id: '',
    key,
    productionEnterpriseNameShort: '选择疫苗后展示',
    vaccineMinorCode: '',
    vaccineMinorName: '',
    vaccineProductInfoId: '',
    queueInfoId: props.curPerson.id,
    isBounded: false,
    isNewAdd: true,
    vaccineSelected: undefined,
  } as TableRowItem)
}

const handleVaccineMinorChange = (value: string, index: number) => {
  if (tableData.value[index].productInfo) {
    tableData.value[index].productInfo = undefined as unknown as string
  }
  // 如果疫苗制品只有一个，默认选中
  const _filterVaccines = useVaccineList.value?.filter(
    (item) => item.vaccineMinorNameShort === tableData.value[index].vaccineSelected
  )
  if (_filterVaccines && _filterVaccines[0].children.length == 1) {
    const _vaccine = _filterVaccines[0].children[0]
    tableData.value[index].productInfo = _vaccine.productInfo
    selectVaccine({ v: _vaccine.productInfo, opt: _vaccine, ind: index, key: tableData.value[index].key })
  }
}

watch(
  () => props.showVaccineInfoTable,
  async (v) => {
    tableShrink.value = false
    if (v) {
      if (props.curPerson?.code == '00000000' || !props.curPerson?.code) {
        childCode.value = ''
        tableRefresh.value = true
        tableData.value = []
        boundedVaccines.value = []
        await initTableData()

        // 当前抓取到的苗是空的时候，执行添加一行
        if (tableData.value.length === 0 && isEmpty(tableData.value[0]?.vaccineSelected)) {
          addOneRow()
        }
      } else {
        childCode.value = props.curPerson?.code
        myCatchDate.value = props.catchDate

        try {
          if (childCode.value && childCode.value != '000000' && (await fetchCurrentRegister(childCode.value))) {
            myCatchDate.value = (await fetchCurrentRegister(props.curPerson?.code)) || []
          }
        } finally {
          tableRefresh.value = true
          tableData.value = []
          boundedVaccines.value = []
          await initTableData()

          // 当前抓取到的苗是空的时候，执行添加一行
          if (tableData.value.length === 0 && isEmpty(tableData.value[0]?.vaccineSelected)) {
            addOneRow()
          }
        }
      }
    }
  },
  { immediate: true }
)

// 更新疫苗信息
const updateYiMiao = async () => {
  if (globalConfig.env == 'development') {
    devUpdateVaccine()
  } else {
    proUpdateVaccine()
  }
  // 更新疫苗列表数据
  await initTableData()

  // 当前抓取到的苗是空的时候，执行添加一行
  if (tableData.value.length === 0 && isEmpty(tableData.value[0]?.vaccineSelected)) {
    addOneRow()
  }
}
</script>

<template>
  <div id="vaccine-info-table" class="vaccine-info-table" v-show="showVaccineInfoTable && !tableShrink">
    <div class="top-area">
      <img :src="vaccine_order" style="width: 16px; height: 16px; margin-right: 4px" />

      <div class="title">
        疫苗信息
        <Button type="primary" style="margin-left: 10px; height: 20px; padding: 0 8px" @click="updateYiMiao">刷新</Button>
      </div>

      <img
        :src="fold_icon"
        style="width: 15px; height: 15px"
        @click="
          () => {
            emits('closeVaccineTable', false)
            tableShrink = true
          }
        "
      />
    </div>
    <div class="content">
      <div class="person">
        <div>姓名：{{ curPerson.userName || '-' }}</div>
        <div>
          性别：{{
            curPerson.sex
              ? ['1', '2', '0'].includes(curPerson.sex)
                ? sexKV[curPerson.sex as '1' | '2' | '0']
                : curPerson.sex || '-'
              : '-'
          }}
        </div>
        <div>出生日期：{{ curPerson.birthday ? dayjs(curPerson.birthday).format('YYYY-MM-DD') : '-' }}</div>
      </div>
      <Table
        v-if="tableRefresh"
        :locale="{
          emptyText: getLoading ? '加载中...' : '暂无数据',
        }"
        :loading="getLoading"
        :columns="tableColumns"
        :data-source="tableData"
        size="small"
        :pagination="false"
        :scroll="tableScroll"
        row-key="key"
        notFoundContent="暂无数据"
      >
        <template #bodyCell="{ column, index, value, record }">
          <template v-if="column.dataIndex == 'vaccineMinorCode' && !record.isBounded">
            <Select
              v-model:value="tableData[index].vaccineSelected"
              :options="useVaccineList"
              :field-names="{ label: 'vaccineMinorNameShort', value: 'vaccineMinorNameShort' }"
              placeholder="请选择疫苗"
              :getPopupContainer="getPopupContainer"
              :filter-option="filterOption"
              show-search
              :dropdownMatchSelectWidth="false"
              style="width: 100%"
              size="small"
              @change="(v: any, opt: any) => handleVaccineMinorChange(v, index)"
            ></Select>
          </template>
          <template v-if="column.dataIndex == 'productInfo' && !record.isBounded && tableData[index].zcyName">
            <Select
              v-model:value="tableData[index].productInfo"
              :options="
                tableData[index].vaccineSelected
                  ? useVaccineList
                      ?.filter((item) => item.vaccineMinorNameShort === tableData[index].vaccineSelected)[0]
                      ?.children?.filter((oitem) => oitem.zcyName === tableData[index].zcyName) || []
                  : vaccineList
              "
              :field-names="{ label: 'productInfo', value: 'productInfo' }"
              placeholder="请选择疫苗制品"
              @change="(v: any, opt: any) => selectVaccine({ v, opt, ind: index, key: record.key })"
              :getPopupContainer="getPopupContainer"
              :filter-option="filterOption"
              show-search
              :dropdownMatchSelectWidth="false"
              style="width: 220px"
              size="small"
            ></Select>
          </template>

          <template v-if="column.dataIndex == 'productInfo' && !record.isBounded && isEmpty(tableData[index].zcyName)">
            <Select
              v-model:value="tableData[index].productInfo"
              :options="
                tableData[index].vaccineSelected
                  ? useVaccineList?.filter((item) => item.vaccineMinorNameShort === tableData[index].vaccineSelected)[0]
                      ?.children || []
                  : vaccineList
              "
              :field-names="{ label: 'productInfo', value: 'productInfo' }"
              placeholder="请选择疫苗制品"
              @change="(v: any, opt: any) => selectVaccine({ v, opt, ind: index, key: record.key })"
              :getPopupContainer="getPopupContainer"
              :filter-option="filterOption"
              show-search
              :dropdownMatchSelectWidth="false"
              style="width: 220px"
              size="small"
            ></Select>
          </template>

          <template v-if="column.dataIndex == 'ctrl' && !record.isBounded">
            <Space>
              <Button
                size="small"
                type="link"
                danger
                @click="(e: MouseEvent) => delVaccine(e, record as TableRowItem)"
                style="padding: 0"
              >
                删除
              </Button>
            </Space>
          </template>
        </template>
        <template #footer>
          <div style="display: flex; column-gap: 8px; align-items: center">
            <Button size="small" type="primary" @click="addOneRow" style="height: 20px"> 添加 </Button>
            <span v-if="queueConfig.catchVaccine == CatchVaccineEnum.YES" style="color: #a7aebb; font-size: 14px">
              疫苗选择错误会导致发苗错误，请仔细确认！
            </span>
          </div>
        </template>
      </Table>
      <ContextMenu ref="menuRef" :menuList="menuList"></ContextMenu>

      <div class="bottom">
        <Button size="small" type="primary" @click="confirm">确定</Button>
        <Button size="small" @click="close">取消</Button>
      </div>
    </div>
  </div>
  <div class="vaccine-info-shrink" v-show="showVaccineInfoTable && tableShrink">
    <div class="bgc">
      <img :src="fold_icon" style="width: 15px; height: 15px; transform: rotate(180deg)" @click="tableShrink = false" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
#ad-intercept-chrome-extension-demo {
  #vaccine-info-table {
    position: absolute;
    z-index: 20000;
    height: 80px;
    width: 496px;
    left: -496px;
    background-color: #fff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.2);
    border-radius: 8px;

    .top-area {
      height: 25px;
      background: rgba(31, 101, 254, 0.1);
      padding: 8px 8px 8px 11px;
      border-radius: 8px 8px 0 0;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;

      img {
        cursor: pointer;
        transform: translateY(0.5px);
      }

      .title {
        flex: 1;
        color: #1f65fe;
        font-size: 14px;
        font-weight: 500;
      }
    }

    .content {
      background: #fff;
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      padding: 4px 8px;
      box-sizing: border-box;
      width: 496px !important;
      min-width: 496px !important;
      max-width: 496px !important;

      .person {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        width: 480px;
        background: rgba(31, 101, 254, 0.05);
        border-radius: 2px;
        padding: 0 10px;
        box-sizing: border-box;
        flex-wrap: wrap;
        div {
          display: flex;
          align-items: center;
          width: 25% !important;
          font-size: 14px;
          font-weight: 400;
          color: #333333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          &:last-child {
            width: 48% !important;
          }
        }
      }
    }

    .bottom {
      margin-top: 4px;
      display: flex;
      justify-content: center;
      gap: 20px;
    }
  }

  .vaccine-info-shrink {
    position: absolute;
    z-index: 20000;
    height: 20px;
    width: 20px;
    left: -20px;
    background: #fff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.2);
    border-radius: 4px;

    .bgc {
      border-radius: 4px;
      background: rgba(31, 101, 254, 0.1);
      height: 100%;
      width: 100%;
      color: #1f65fe;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        cursor: pointer;
      }
    }
  }
}
</style>
<style lang="scss">
#ad-intercept-chrome-extension-demo {
  #vaccine-info-table {
    .content {
      .ant-table-placeholder {
        min-width: 473px;
        min-height: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    // a-select
    .ant-select-single {
      display: flex;
      align-items: center;
    }

    .ant-select-selector,
    .ant-select-selection-search {
      width: 100%;
    }

    .ant-select-selector {
      border: 1px solid #d9d9d9;
    }

    .bottom {
      .ant-btn {
        height: 20px;
      }
    }
  }
}
</style>
