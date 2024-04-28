<script setup lang="ts">
import manifestConfirm from '@/manifest.json'
import { Space } from 'ant-design-vue'

const url = chrome.runtime.getURL('/static/extension_icon.png')
</script>

<template>
  <div class="options">
    <img :src="url" class="logo" />
    <Space style="align-items: baseline">
      <h1>叫号精灵</h1>
      <div>版本V{{ manifestConfirm.version }}</div>
    </Space>
  </div>
</template>

<style lang="scss" scoped>
.options {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .logo {
    width: 256px;
    height: 256px;
  }
}
</style>
