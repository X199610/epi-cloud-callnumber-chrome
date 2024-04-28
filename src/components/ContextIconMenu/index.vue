<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'

import { ActionItem } from './types'
import Log from '@/utils/log'

const props = defineProps<{
  menuList: ActionItem<any>[]
}>()

const menuRef = ref<HTMLElement | null>(null)
const show = ref(false)
const curItem = ref<ActionItem<any> | null>()

/** 暴露到外部可在鼠标位置展开菜单 */
const showMenuList = (e: MouseEvent) => {
  if (menuRef.value) {
    e.preventDefault()
    menuRef.value.style.display = 'block'
    show.value = true
    const t = e.target as HTMLElement
    menuRef.value.style.top = t.offsetHeight * 2 + 'px'
    menuRef.value.style.left = t.offsetLeft + 'px'
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
  <div class="ant-dropdown-content context-icon-menu-content" ref="menuRef" @mouseleave="handleClick">
    <ul
      class="ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ant-dropdown-menu-light"
      @contextmenu="(e:MouseEvent)=>e.preventDefault()"
    >
      <li
        class="ant-dropdown-menu-item ant-dropdown-menu-item-only-child context-menu-item"
        v-for="i in menuList"
        :key="i.title"
        @click="handleMenuItemClick(i)"
        @mouseenter="() => (curItem = i)"
        @mouseleave="() => (curItem = null)"
      >
        <img v-if="i.imagePath" :src="curItem == i ? i.imageActivePath : i.imagePath" style="width: 10px; height: auto" />
        <span>{{ i.title }}</span>
        <!-- <span class="shortcut-text">{{ i.shortcut }}</span> -->
      </li>
    </ul>
  </div>
</template>
<style lang="scss" scoped>
#ad-intercept-chrome-extension-demo {
  .context-icon-menu-content {
    width: fit-content;
    display: none;
    position: absolute;
    background: #ffffff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    z-index: 20000;
    overflow: hidden;
    ul {
      width: fit-content;
      .context-menu-item {
        width: fit-content;
        font-size: 12px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        transition: all 0.3s ease;
        color: #666;
        font-weight: 400;
        height: 24px;
        column-gap: 8px;
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
