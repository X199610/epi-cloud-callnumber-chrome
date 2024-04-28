<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import type { SelectProps } from 'ant-design-vue'
import { Select, SelectOption } from 'ant-design-vue'
import { isEmpty } from 'lodash-es'
import { SelectEleId } from '@/components/SelectTable/initData'

interface MySelectProps extends Omit<SelectProps, 'options'> {
  selectOpt?: SelectProps['options']
  emptyText?: string
  eleId: string
  curTableNo?: number | null
}
const props = withDefaults(defineProps<MySelectProps>(), {
  open: false,
  selectOpt: () => [],
  emptyText: '暂无数据',
  curTableNo: null,
})
const openSelect = ref(false)
const emits = defineEmits<{
  'update:open': [boolean]
}>()

const documentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  toggleOpen(props.open ? false : target.id == props.eleId)
}

onMounted(async () => {
  document.addEventListener('click', documentClick)
})
onUnmounted(() => {
  document.removeEventListener('click', documentClick)
})

const toggleOpen = (open: boolean) => {
  openSelect.value = open
  emits('update:open', open)
}
</script>

<template>
  <span
    style="cursor: pointer; margin-right: 6px; font-size: 14px"
    v-if="eleId === SelectEleId.TABLE_NO && !curTableNo"
    @click.stop="toggleOpen(!openSelect)"
    >请选台号</span
  >
  <span v-if="isEmpty(props.selectOpt)">{{ emptyText }}</span>
  <Select
    v-bind="props"
    :getPopupContainer="(e:HTMLElement) =>( e.parentNode as HTMLElement)"
    :open="openSelect"
    @click.self="toggleOpen(true)"
    :class="eleId"
    v-else
  >
    <SelectOption v-for="i in props.selectOpt" :key="i.value" :value="i.value" @click.self="toggleOpen(false)">
      <span
        style="display: inline-block; padding-right: 6px; font-size: 14px"
        v-if="!openSelect"
        @click.stop="toggleOpen(!openSelect)"
        >{{ i.label }}</span
      >
      <span style="display: inline-block; padding-right: 6px" v-else @click="toggleOpen(true)">{{ i.label }}</span>
    </SelectOption>
  </Select>
</template>

<style lang="scss">
.select-table-no {
  position: absolute;
}
</style>
