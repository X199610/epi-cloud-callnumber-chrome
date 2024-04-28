<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Popconfirm } from 'ant-design-vue'

import { ActionItem } from './types'
import Log from '@/utils/log'

const props = defineProps<{
  menuList: ActionItem<any>[]
}>()

const menuRef = ref<HTMLElement | null>(null)
const show = ref(false)

/** 暴露到外部可在鼠标位置展开菜单 */
const showMenuList = (e: MouseEvent) => {
  if (menuRef.value) {
    e.preventDefault()
    menuRef.value.style.display = 'block'
    show.value = true
    menuRef.value.style.top = `${e.clientY}px`
    menuRef.value.style.left = `${e.clientX}px`
  }
}

const handleMenuItemClick = (actionItem: ActionItem) => {
  actionItem.callBack()
}

const handleClick = () => {
  if (menuRef.value) {
    menuRef.value.style.display = 'none'
    show.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClick)
})

defineExpose({
  showMenuList,
  show,
  close: handleClick,
})
</script>

<template>
  <div class="ant-dropdown-content context-menu-content" ref="menuRef" @mouseleave="handleClick">
    <ul
      class="ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ant-dropdown-menu-light"
      @contextmenu="(e:MouseEvent)=>e.preventDefault()"
    >
      <li
        class="ant-dropdown-menu-item ant-dropdown-menu-item-only-child context-menu-item"
        v-for="i in menuList"
        :key="i.title"
        @click="handleMenuItemClick(i)"
      >
        <span>{{ i.title }}</span>
        <!-- <span class="shortcut-text">{{ i.shortcut }}</span> -->
      </li>
    </ul>
  </div>
</template>
<style lang="scss" scoped>
#ad-intercept-chrome-extension-demo {
  .context-menu-content {
    width: fit-content;
    display: none;
    position: fixed;
    background: #ffffff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    z-index: 20000;
    overflow: hidden;
    ul {
      width: fit-content;
      .context-menu-item {
        width: fit-content;
        font-size: 14px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        transition: all 0.3s ease;
        color: #666;
        font-weight: 400;
        height: 24px;
        cursor: pointer;
        &:hover {
          color: #fff;
          background-color: rgba(0, 107, 253, 0.8);
          font-weight: 500;
        }
        .shortcut-text {
          // color: $color-text-light;
        }
        .icon-area {
          width: 22px;
        }
      }
    }
  }
}
</style>
