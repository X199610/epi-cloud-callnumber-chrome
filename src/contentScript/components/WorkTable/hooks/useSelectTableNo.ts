import { h, onMounted, ref, watchEffect } from 'vue'
import type { SelectValue } from 'ant-design-vue/es/select'

import SelectTableVue from '@/components/SelectTable/index.vue'

import StorageUtil from '@/utils/storage'
import { SelectEleId } from '@/components/SelectTable/initData'
import { CatchVaccineEnum } from '@/api/uc/queueConfig/types'

const useSelectTableNo = () => {
  const curTableNo = ref()

  /** 下拉框是否开启 */
  const selectOpen = ref(false)
  /** 下拉数据 */
  const selectOpt = ref([
    { label: '01号', value: 1 },
    { label: '02号', value: 2 },
    { label: '03号', value: 3 },
    { label: '04号', value: 4 },
  ])
  /** 渲染组件 */
  const component = () => {
    return h(SelectTableVue, {
      dropdownMatchSelectWidth: 80,
      bordered: false,
      curTableNo: curTableNo.value,
      value: curTableNo.value,
      'onUpdate:value': async (v: SelectValue) => {
        curTableNo.value = v as number
        await StorageUtil.setItem('tableNum', curTableNo.value)
      },
      selectOpt: selectOpt.value,
      open: selectOpen.value,
      'onUpdate:open': (v: boolean) => (selectOpen.value = v),
      placeholder: '',
      emptyText: '暂无台号',
      eleId: SelectEleId.TABLE_NO,
    })
  }

  watchEffect(async () => {
    const queueConfig = await StorageUtil.getItem('queueConfig')
    if (queueConfig?.catchVaccine == CatchVaccineEnum.YES) {
      curTableNo.value = await StorageUtil.getItem('tableNum')
    } else {
      StorageUtil.removeItem('tableNum')
    }
  })

  const toggleOpen = () => {
    SelectTableVue.selectOpen.value = !selectOpen.value
  }

  return {
    selectOpen,
    component,
    curTableNo,
    toggleOpen,
  }
}

export default useSelectTableNo
