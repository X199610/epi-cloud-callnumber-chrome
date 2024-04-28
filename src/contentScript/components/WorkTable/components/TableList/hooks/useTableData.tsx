import { ref } from 'vue'
import dayjs from 'dayjs'

import { TableRowItem } from '../types'
import { TableProps } from 'ant-design-vue'
import { ColumnType } from 'ant-design-vue/es/table'
import { GetOrdersResData, StatusEnum } from '@/api/fetchSeedlings/types'
import { SomeTableDataItem } from '../../../types'

const useTableData = () => {
  const getLoading = ref(false)

  const centerControlInfoLoading = ref(false)

  const tableData = ref<SomeTableDataItem[]>([])

  const someTableData = ref<SomeTableDataItem[]>([])

  const centerControlList = ref<GetOrdersResData[]>([])

  const cellStyle = {
    height: '24px',
    lineHeight: '24px',
    borderWidth: 0,
    padding: '0 0 0 6px',
    color: '#333',
  }

  const sexKV = {
    ['1']: '男',
    ['2']: '女',
    ['0']: '未知',
  }

  const tableColumns = ref<TableProps<SomeTableDataItem>['columns']>(
    [
      {
        title: '候诊号',
        dataIndex: 'queueNum',
        width: '20%',
      },
      {
        title: '姓名',
        dataIndex: 'userName',
        customRender: (({ value, record }) => {
          return value || '-'
        }) as ColumnType['customRender'],
        width: '30%',
      },
      {
        title: '性别',
        dataIndex: 'sex',
        customRender: (({ value }) => {
          return value ? sexKV[value as '1' | '2' | '0'] : '-'
        }) as ColumnType['customRender'],
        width: '20%',
      },
      {
        title: '出生日期',
        dataIndex: 'birthday',
        customRender: (({ value }) => {
          return value && dayjs(value).format('YYYY-MM-DD') != 'Invalid Date' ? dayjs(value).format('YYYY-MM-DD') : '-'
        }) as ColumnType['customRender'],
        width: '30%',
      },
    ].map((i) => ({
      ...i,
      customCell: () => {
        return {
          style: {
            ...cellStyle,
            fontWeight: 400,
            cursor: getLoading.value ? 'wait' : 'pointer',
          },
        }
      },
      customHeaderCell: () => {
        return {
          style: {
            ...cellStyle,
            fontWeight: 500,
            cursor: getLoading.value ? 'wait' : 'pointer',
          },
        }
      },
    }))
  )

  const inoculateTableColumns = ref<TableProps<SomeTableDataItem>['columns']>(
    [
      {
        title: '候诊号',
        dataIndex: 'queueNum',
        width: '15%',
      },
      {
        title: '疫苗名称',
        dataIndex: 'vaccineVoList',
        width: '25%',
      },
      {
        title: '姓名',
        dataIndex: 'userName',
        customRender: (({ value }) => {
          return value || '-'
        }) as ColumnType['customRender'],
        width: '20%',
      },
      {
        title: '性别',
        dataIndex: 'sex',
        customRender: (({ value }) => {
          return value ? sexKV[value as '1' | '2' | '0'] : '-'
        }) as ColumnType['customRender'],
        width: '15%',
      },
      {
        title: '出生日期',
        dataIndex: 'birthday',
        customRender: (({ value }) => {
          return value && dayjs(value).format('YYYY-MM-DD') != 'Invalid Date' ? dayjs(value).format('YYYY-MM-DD') : '-'
        }) as ColumnType['customRender'],
        width: '25%',
      },
    ].map((i) => ({
      ...i,
      customCell: () => {
        return {
          style: {
            ...cellStyle,
            fontWeight: 400,
            cursor: getLoading.value ? 'wait' : 'pointer',
          },
        }
      },
      customHeaderCell: () => {
        return {
          style: {
            ...cellStyle,
            fontWeight: 500,
            cursor: getLoading.value ? 'wait' : 'pointer',
          },
        }
      },
    }))
  )

  const vaccineTableColumns = ref<TableProps<SomeTableDataItem>['columns']>(
    [
      {
        title: '候诊号',
        dataIndex: 'queueNum',
        width: 70,
      },
      {
        title: '订单状态',
        dataIndex: 'statusDisplay',
        width: 100,
      },
      {
        title: '疫苗名称',
        dataIndex: 'vaccineVoList',
        width: 100,
      },
      {
        title: '姓名',
        dataIndex: 'userName',
        customRender: (({ value }) => {
          return value || '-'
        }) as ColumnType['customRender'],
        width: 100,
      },
      {
        title: '性别',
        dataIndex: 'sex',
        customRender: (({ value }) => {
          return value ? sexKV[value as '1' | '2' | '0'] : '-'
        }) as ColumnType['customRender'],
        width: 70,
      },
      {
        title: '出生日期',
        dataIndex: 'birthday',
        customRender: (({ value }) => {
          return value && dayjs(value).format('YYYY-MM-DD') != 'Invalid Date' ? dayjs(value).format('YYYY-MM-DD') : '-'
        }) as ColumnType['customRender'],
        width: 100,
      },
    ].map((i) => ({
      ...i,
      customCell: () => {
        return {
          style: {
            ...cellStyle,
            fontWeight: 400,
            cursor: getLoading.value ? 'wait' : 'pointer',
          },
        }
      },
      customHeaderCell: () => {
        return {
          style: {
            ...cellStyle,
            fontWeight: 500,
            cursor: getLoading.value ? 'wait' : 'pointer',
          },
        }
      },
    }))
  )

  const fetchSeedlingsTableColumns = ref<TableProps<GetOrdersResData>['columns']>(
    [
      {
        title: '候诊号',
        dataIndex: 'queueNO',
        width: 100,
      },
      {
        title: '疫苗名称',
        dataIndex: 'drugName',
        width: 100,
      },
      {
        title: '姓名',
        dataIndex: 'patientName',
        customRender: (({ value }) => {
          return value || '-'
        }) as ColumnType['customRender'],
        width: 100,
      },
      {
        title: '状态',
        dataIndex: 'statusDisplay',
        width: 100,
      },
      {
        title: '发苗时间',
        dataIndex: 'orderCreatedTime',
        customRender: (({ value }) => {
          return value && dayjs(value).format('YYYY-MM-DD HH:mm:ss') != 'Invalid Date'
            ? dayjs(value).format('YYYY-MM-DD HH:mm:ss')
            : '-'
        }) as ColumnType['customRender'],
        width: 100,
      },
      {
        title: '操作',
        width: 40,
        dataIndex: 'controls',
      },
    ].map((i) => ({
      ...i,
      customCell: () => {
        return {
          style: {
            ...cellStyle,
            fontWeight: 400,
            cursor: centerControlInfoLoading.value ? 'wait' : 'pointer',
          },
        }
      },
      customHeaderCell: () => {
        return {
          style: {
            ...cellStyle,
            fontWeight: 500,
            cursor: centerControlInfoLoading.value ? 'wait' : 'pointer',
          },
        }
      },
    }))
  )

  /** 外部状态文本颜色 */
  const outSideStatusColorKV: Record<StatusEnum, string> = {
    [StatusEnum.READY_SEEDLING]: '#ccc',
    [StatusEnum.COLLECTING_SEEDLINGS]: '#006bfd',
    [StatusEnum.SEEDLING_EXTRACTION_COMPLETED]: '#006bfd',
    [StatusEnum.RELEASING_SEEDLINGS]: '#006bfd',
    [StatusEnum.SEEDING_COMPLETE]: '#006bfd',
    [StatusEnum.COMPLETED]: '#00b552',
    [StatusEnum.FAIL]: '#f77807',
  }

  return {
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
  }
}

export default useTableData
