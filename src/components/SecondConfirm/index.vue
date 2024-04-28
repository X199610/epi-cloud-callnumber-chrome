<script lang="ts" setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { Button, PopconfirmProps } from 'ant-design-vue'

interface MyPopconfirmProps extends PopconfirmProps {
  id?: string
}

const props = withDefaults(defineProps<MyPopconfirmProps>(), {
  showCancel: true,
  cancelText: '取消',
  okText: '确定',
  okType: 'primary',
  open: false,
})

const emits = defineEmits<{
  'update:open': [boolean]
  cancel: [MouseEvent]
  confirm: [MouseEvent]
  openChange: [boolean]
}>()

const documentClick = () => {
  emits('update:open', false)
}

const onCancel = (e: MouseEvent) => {
  documentClick()
  emits('cancel', e)
}

const onConfirm = (e: MouseEvent) => {
  documentClick()
  emits('confirm', e)
}

onMounted(() => {
  document.addEventListener('click', documentClick)
})
onUnmounted(() => {
  document.removeEventListener('click', documentClick)
})

watch(
  () => props.open,
  (v) => {
    emits('openChange', v)
  },
  { immediate: true }
)
</script>

<template>
  <div v-if="open" class="ant-popover ant-popconfirm css-dev-only-do-not-override-j6gjt1 second-confirm-box">
    <div class="ant-popover-content">
      <div class="ant-popover-inner" role="tooltip">
        <div class="ant-popover-inner-content">
          <div class="ant-popconfirm-inner-content">
            <div class="ant-popconfirm-message">
              <span class="ant-popconfirm-message-icon">
                <span role="img" aria-label="exclamation-circle" class="anticon anticon-exclamation-circle">
                  <svg
                    focusable="false"
                    class=""
                    data-icon="exclamation-circle"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    aria-hidden="true"
                    viewBox="64 64 896 896"
                  >
                    <path
                      d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"
                    ></path>
                  </svg>
                </span>
              </span>
              <div class="ant-popconfirm-message-title">
                <slot title>{{ title }}</slot>
              </div>
            </div>
            <slot description>
              {{ description }}
            </slot>
            <slot cancelButton>
              <div class="ant-popconfirm-buttons">
                <slot cancelText v-if="showCancel" @click="(e:MouseEvent)=>onCancel(e)">
                  <Button>
                    <span>{{ cancelText }}</span>
                  </Button>
                </slot>
                <slot okButton @click="(e:MouseEvent)=>onConfirm(e)">
                  <Button v-if="okType != 'danger'" class="css-dev-only-do-not-override-j6gjt1 ant-btn-sm" :type="okType">
                    <span>{{ okText }}</span>
                  </Button>
                  <Button v-else danger>
                    <span>{{ okText }}</span>
                  </Button>
                </slot>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.second-confirm-box {
  position: absolute;
}
</style>
