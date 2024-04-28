import { UnwrapRef, computed, onMounted, reactive, ref } from 'vue'
import { TableProps } from 'ant-design-vue'
import { cloneDeep, isEmpty } from 'lodash-es'
import type { FixedType } from 'ant-design-vue/es/vc-table/interface'

import { TableRowItem } from '../types'

import { GetVaccineProductInfoResData } from '@/api/uc/vaccineProductInfo/types'
import { GetQueueConfigByDeptIdRes } from '@/api/uc/queueConfig/types'

import Log from '@/utils/log'
import StorageUtil from '@/utils/storage'

const useBase = () => {
  /** 门诊设置 */
  const queueConfig = ref<GetQueueConfigByDeptIdRes>({} as GetQueueConfigByDeptIdRes)

  const getLoading = ref(false)

  /** 控制强制重渲染table 因为删除所有的信息之后样式会崩掉 */
  const tableRefresh = ref(false)

  const tableData = ref<TableRowItem[]>([])

  const aipTableData = ref<TableRowItem[]>([])

  const editableData: UnwrapRef<Record<string, TableRowItem>> = reactive({})

  const editableCtrlFun: { edit: (key: string) => void; save: (key: string) => void; cancel: (key: string) => void } = {
    edit: (key: string) => {
      editableData[key] = tableData.value.filter((item) => key === item.key)[0]
    },
    save: (key: string) => {
      const { productInfo, needleNum, isNewAdd, ...other } = editableData[key]
      Object.assign(tableData.value.filter((item) => key === item.key)[0], {
        ...other,
        productInfo,
        needleNum,
        isNewAdd: !productInfo,
      })
      delete editableData[key]
    },
    cancel: (key: string) => {
      delete editableData[key]
    },
  }

  /** 查询到的疫苗 */
  const vaccineList = ref<GetVaccineProductInfoResData[]>([])
  /** 已绑定的疫苗 */
  const boundedVaccines = ref<TableRowItem[]>([])

  const tableScroll = computed(() => {
    if (isEmpty(tableData.value)) {
      return { y: 154, x: 460 }
    }
    return { y: 154, x: 'max-content' }
  })

  const cellStyle = { height: '25px', lineHeight: '25px', borderWidth: 0, padding: '0 0 0 6px', color: '#333', fontSize: '14px' }

  const tableColumns = ref<TableProps<TableRowItem>['columns']>(
    [
      {
        title: '序号',
        customRender({ index }: { text: string; record: TableRowItem; index: number; column: any }) {
          return index + 1 > 9 ? index + 1 : '0' + (index + 1)
        },
        width: 50,
      },
      {
        title: '疫苗名称',
        dataIndex: 'vaccineMinorCode',
        ellipsis: true,
        width: 130,
      },
      {
        title: '制品名称',
        dataIndex: 'productInfo',
        width: 220,
        ellipsis: true,
      },
      // {
      //   title: '剂次',
      //   dataIndex: 'needleNum',
      //   width: 60,
      // },
      // {
      //   title: '生产厂家',
      //   dataIndex: 'productionEnterpriseNameShort',
      //   width: 140,
      // },
      {
        title: '操作',
        dataIndex: 'ctrl',
        width: 60,
        fixed: 'right' as FixedType,
      },
    ].map((i) => ({
      ...i,
      customCell: () => {
        return {
          style: {
            ...cellStyle,
          },
        }
      },
      customHeaderCell: () => {
        return {
          style: {
            ...cellStyle,
            fontWeight: 500,
          },
        }
      },
    }))
  )

  const getPopupContainer = () => {
    return document.getElementById('vaccine-info-table') as HTMLElement
  }

  const needleNumOptions = [
    { label: '①', value: '1' },
    { label: '②', value: '2' },
    { label: '③', value: '3' },
    { label: '④', value: '4' },
    { label: '⑤', value: '5' },
    { label: '⑥', value: '6' },
    { label: '⑦', value: '7' },
    { label: '⑧', value: '8' },
    { label: '⑨', value: '9' },
    { label: '⑩', value: '10' },
  ]

  onMounted(async () => {
    queueConfig.value = (await StorageUtil.getItem('queueConfig')) || ({} as GetQueueConfigByDeptIdRes)
  })

  return {
    tableColumns,
    tableData,
    getLoading,
    tableScroll,
    boundedVaccines,
    vaccineList,
    getPopupContainer,
    editableData,
    editableCtrlFun,
    tableRefresh,
    needleNumOptions,
    queueConfig,
    aipTableData
  }
}

export default useBase
