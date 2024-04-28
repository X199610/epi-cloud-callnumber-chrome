import { computed, h, ref, toRef, watch } from 'vue'
import type { SelectProps, SelectValue } from 'ant-design-vue/es/select'
import { cloneDeep, isEmpty } from 'lodash-es'

import SelectTableVue from '@/components/SelectTable/index.vue'

import StorageUtil from '@/utils/storage'

import { StatusEnum, WorkbenchTypeEnum } from '@/api/uc/types'
import { getWorkbench } from '@/api/uc/workbenchChannel'
import { GetWorkbenchReq, GetWorkbenchRes } from '@/api/uc/workbenchChannel/types'
import { GetWorkbenchVaccineMinorListReq } from '@/api/uc/workbenchVaccineMinor/types'
import { getWorkbenchVaccineMinorList } from '@/api/uc/workbenchVaccineMinor'
import { getSysUserWorkbenchList } from '@/api/uc/sysUserWorkbench'
import { GetSysUserWorkbenchListReq } from '@/api/uc/sysUserWorkbench/types'
import { SelectEleId } from '@/components/SelectTable/initData'

const useSelectTable = () => {
  /** 当前工作台id */
  const curSelectedTable = ref<string>('')
  /** 当前工作台类型 */
  const curWorkbenchType = computed<WorkbenchTypeEnum | null>(() => {
    const item = selectOpt.value?.find((i) => i.value == curSelectedTable.value)
    return item?.type || null
  })
  /** 当前工作台名称 */
  const curWorkBenchName = computed<string>(() => {
    const item = selectOpt.value?.find((i) => i.value == curSelectedTable.value)
    return item?.workbenchName || ''
  })

  /** 接种台可接种的疫苗 */
  const inoculableVaccines = ref<string[]>([])

  /** 下拉框是否开启 */
  const selectOpen = ref<boolean>(false)

  /** 下拉数据 */
  const selectOpt = ref<Array<GetWorkbenchRes & { value: string; label: string }>>([])

  /** 设置下拉数据 选中第一个数据做当前工作台 */
  const setSelectOpt = async (list: Array<GetWorkbenchRes & { value: string; label: string }>) => {
    selectOpt.value = cloneDeep(list)
    const lastWorkbench = await StorageUtil.getItem('lastWorkbench')
    const isExist = list?.find((i) => i.value == lastWorkbench?.id)
    if (lastWorkbench && !isEmpty(isExist)) {
      curSelectedTable.value = lastWorkbench.id
    } else {
      curSelectedTable.value = list![0] && list![0].value ? list![0].value + '' : ''
      await StorageUtil.setItem('lastWorkbench', {
        id: curSelectedTable.value,
        type: list![0].type,
      })
    }
  }

  /** 获取工作台 */
  const funGetWorkbench = async () => {
    const userBaseInfo = await StorageUtil.getItem('userBaseInfo')

    if (userBaseInfo) {
      const reqObj: GetWorkbenchReq = {
        deptId: userBaseInfo.deptId,
        // userId: userBaseInfo.id,
        status: StatusEnum.NORMAL,
      }
      const { data } = await getWorkbench(reqObj)
      // Log.d('工作台列表信息', data)
      if (!isEmpty(data)) {
        // 这里会改变工作台 自动调用ws差队列
        setSelectOpt(
          data
            .filter((i1) =>
              [
                WorkbenchTypeEnum.INQUIRY,
                WorkbenchTypeEnum.REGISTRATION,
                WorkbenchTypeEnum.VACCINATION,
                WorkbenchTypeEnum.CHILD_CARE,
              ].includes(i1.type)
            )
            .map((i) => ({ ...i, value: i.id, label: i.workbenchName }))
        )
      } else {
        setSelectOpt([])
      }
    }
  }

  /** 查询接种工作台可接种的疫苗 */
  const funGetWorkbenchVaccineMinorList = async () => {
    const userBaseInfo = await StorageUtil.getItem('userBaseInfo')
    if (userBaseInfo) {
      const reqObj: GetWorkbenchVaccineMinorListReq = {
        deptId: userBaseInfo.deptId,
        workbenchId: curSelectedTable.value,
      }
      const { data } = await getWorkbenchVaccineMinorList(reqObj)
      if (!isEmpty(data)) {
        inoculableVaccines.value = data.map((i) => i.vaccineMinorCode)
      } else {
        inoculableVaccines.value = []
      }
    }
  }

  /** 渲染组件 */
  const component = () => {
    return h(SelectTableVue, {
      dropdownMatchSelectWidth: 160,
      bordered: false,
      value: curSelectedTable.value,
      'onUpdate:value': async (v: SelectValue) => {
        curSelectedTable.value = v as string
        const workbenchInfo = selectOpt.value.find((i) => i.value == v)
        await StorageUtil.setItem('lastWorkbench', { id: v as string, type: workbenchInfo!.type })
      },
      selectOpt: selectOpt.value,
      open: selectOpen.value,
      'onUpdate:open': (v: boolean) => (selectOpen.value = v),
      placeholder: '请选择工作台！',
      emptyText: '暂无工作台',
      eleId: SelectEleId.TABLE,
    })
  }

  watch(
    () => curWorkbenchType.value,
    async (v) => {
      if (v && v == WorkbenchTypeEnum.VACCINATION) {
        await funGetWorkbenchVaccineMinorList()
      } else {
        inoculableVaccines.value = []
      }
    },
    { immediate: true }
  )

  return {
    curSelectedTable,
    setSelectOpt,
    selectOpen,
    component,
    selectOpt,
    funGetWorkbench,
    inoculableVaccines,
    curWorkbenchType,
    curWorkBenchName,
  }
}

export default useSelectTable
