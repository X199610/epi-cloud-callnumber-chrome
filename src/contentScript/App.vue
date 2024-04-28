<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { useWindowSize, useDraggable, Position } from '@vueuse/core'
import { isEmpty } from 'lodash-es'
import { devUpdateVaccine, proUpdateVaccine } from '@/utils/updateVaccine'
import { BadgeText, ServiceMessage } from '@/serviceWorker/types'
import { isBadgeTextMessage } from '@/utils/is'
import StorageUtil from '@/utils/storage'
import globalConfig from '@/config/global'
import WorkTable from './components/WorkTable/index.vue'
import useBase from './hooks/useBase'

const draggable_icon = chrome.runtime.getURL('/static/draggable_icon.png')

const { showWorkbench, changeShowWorkbench, show, closeCheckInDesk } = useBase()

/** 拖动组件 */
const handleRef = ref<HTMLDivElement>()
const { width: winWidth, height: winHeight } = useWindowSize()
const handleSize = ref({ width: 94, height: 99 })
const {
  style,
  x: xDraggable,
  y: yDraggable,
} = useDraggable(handleRef, {
  initialValue: { x: winWidth.value - 24 - handleSize.value.width, y: winHeight.value - 24 - handleSize.value.height },
  onMove: (position: Position) => {
    if (position.x > winWidth.value - 24 - handleSize.value.width) {
      position.x = winWidth.value - handleSize.value.width
    }
    if (position.x < 0) {
      position.x = 0
    }
    if (position.y > winHeight.value - 24) {
      position.y = winHeight.value - handleSize.value.height
    }
    if (position.y < 0) {
      position.y = 0
    }
  },
})

/** 接受 serviceWorker/util/chrome.tab.sendMessage 的信息 */
chrome.runtime.onMessage.addListener(async (request: ServiceMessage, _sender, _sendRequest) => {
  if (isBadgeTextMessage(request)) {
    /** 获取到popup对storage的修改，查看是否要展示图标,
     * 并且这里要重置展示图标还是工作台 */
    const userBaseInfo = await StorageUtil.getItem('userBaseInfo')
    const isShowWorkbench = await StorageUtil.getItem('showWorkbench')
    showWorkbench.value = Boolean(
      isShowWorkbench && request.msgInfo.badgeText == BadgeText.ON && !isEmpty(userBaseInfo) && !show.value
    )
    show.value = Boolean(!isShowWorkbench && request.msgInfo.badgeText == BadgeText.ON && !isEmpty(userBaseInfo))
  }
})

const windowChange = (e: Event) => {
  const target = e.target as Window
  xDraggable.value = target.innerWidth - 24 - handleSize.value.width
  yDraggable.value = target.innerHeight - 24 - handleSize.value.width
}

/** 更新疫苗信息 */
const updateYiMiao = () => {
  if (globalConfig.env == 'development') {
    devUpdateVaccine()
  } else {
    proUpdateVaccine()
  }
}

onMounted(async () => {
  updateYiMiao()
  window.addEventListener('resize', windowChange)
  await StorageUtil.setItem('storgeVaccStatus',null)
})

onUnmounted(() => {
  window.removeEventListener('resize', windowChange)
})
</script>

<template>
  <div class="float" v-if="show" ref="handleRef" :style="style" style="position: fixed">
    <img
      v-if="!showWorkbench"
      :src="draggable_icon"
      class="draggable-icon"
      @dblclick="changeShowWorkbench"
      @mousedown="(e:MouseEvent) => e.preventDefault()"
      :style="{ width: `${handleSize.width}px`, height: `${handleSize.height}px` }"
    />
  </div>
  <WorkTable v-if="showWorkbench" :show="show || showWorkbench" @close-check-in-desk="closeCheckInDesk"></WorkTable>
</template>

<style lang="scss" scoped>
.float {
  z-index: 20000;
  .draggable-icon {
    cursor: grab;
  }
}
</style>

<style lang="scss">
.ant-message {
  top: 120px !important;
  .ant-message-notice-content {
    padding: 0 4px 0 6px;
    border-radius: 4px !important;
    font-size: 14px;
    min-width: 0 !important;
    .ant-message-custom-content {
      display: flex;
      align-items: center !important;
      color: #000 !important;
      .anticon {
        margin-right: 8px !important;
        height: 18px !important;
        &::before {
          display: none !important;
        }
        .anticon-exclamation-circle:before {
          display: none !important;
        }
        svg {
          width: 16px !important;
        }
      }
    }
  }
}

.anticon-exclamation-circle:before {
  display: none !important;
}

.ant-tooltip {
  .ant-tooltip-inner {
    color: #000 !important;
    background-color: #fff !important;
  }

  .ant-tooltip-arrow {
    border-top-color: transparent !important;
    &::before {
      background-color: #fff !important;
    }
  }
}

#ad-intercept-chrome-extension-demo {
  .ant-select-single {
    font-size: 14px;
  }

  .ant-select-arrow {
    top: 30%;
  }

  .ant-btn {
    min-width: 0 !important;
  }

  .ant-switch:after {
    display: none !important;
  }

  .ant-popover-arrow {
    display: none !important;
  }
  .ant-switch {
    height: 24px !important;
  }

  .ant-table-thead {
    font-size: 14px !important;
  }

  .ant-table-tbody {
    font-size: 14px !important;
  }
  .ant-popover .ant-popover-inner {
    padding: 0 !important;
  }

  .ant-select-dropdown {
    z-index: 20010;
    border-radius: 4px;
    overflow: hidden;
    .ant-select-item {
      font-size: 13px;
      font-weight: 400;
      color: #666666;
      border-radius: 0 !important;
    }
    .ant-select-item-option-active {
      background-color: rgba(31, 101, 254, 0.1);
      font-weight: 500;
      color: #333;
    }
    .ant-select-item-option-selected {
      font-weight: 500;
      background-color: #1f65fe;
      color: #fff;
    }
    .ant-select-item-option-content {
      padding: 4px;
    }
    .ant-select-item-empty {
      font-size: 14px !important;
      text-align: center !important;
      padding: 15px 0 !important;
    }
  }

  .ant-table-expanded-row-fixed{
    margin-top: 20px;
  }
}

.ant-popover-inner-content {
  padding: 0 !important;
}

.ant-popover-arrow {
  display: none !important;
}

.ant-select-selector {
  .ant-select-selection-search {
    inset-inline-start: 0 !important;
    .ant-select-selection-search-input {
      height: 100% !important;
    }
  }
  .ant-select-selection-item {
    display: flex;
    align-items: center;
  }
}


</style>
