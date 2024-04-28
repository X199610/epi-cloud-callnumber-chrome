<script setup lang="ts">
import { ref, onMounted } from 'vue'

import SwitchBadge from './components/SwitchBadge/index.vue'
import Login from './components/Login/index.vue'

import useLogin from '@/hooks/useLogin'

import StorageUtil from '@/utils/storage'
import { LoginFormData } from './components/Login/types'
import { BadgeText } from '@/serviceWorker/types'
import { changeBadgeText } from '@/serviceWorker/util'
import Msg from '@/utils/message'

const showSwitchBadge = ref(false)

const { getBaseInfo, getToken } = useLogin(false)

/** 登录 */
const loginOk = async (v: LoginFormData) => {
  await getToken()
  await getBaseInfo()

  await changeBadgeText(BadgeText.ON)

  Msg.success({ content: '登录成功！'})
  showSwitchBadge.value = true
}

onMounted(async () => {
  const userInfo = await StorageUtil.getItem('userBaseInfo')
  showSwitchBadge.value = Boolean(userInfo)
})
</script>

<template>
  <div class="popup">
    <SwitchBadge v-if="showSwitchBadge" v-model:showSwitchBadge="showSwitchBadge"></SwitchBadge>
    <Login v-else v-model:showSwitchBadge="showSwitchBadge" @signIn="loginOk"></Login>
  </div>
</template>

<style lang="scss" scoped>
.popup {
  background: #f0f1f5;
}
</style>

<style lang="scss">
body,
html {
  margin: 0;
  padding: 0;
}
#ad-intercept-chrome-extension-demo {
  .ant-dropdown {
    .ant-dropdown-menu {
      .ant-dropdown-menu-item {
        padding: 3px 8px;
        .ant-dropdown-menu-title-content {
          font-size: 12px;
          max-width: 72px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
    }
  }
  .ant-message {
    .ant-message-notice-content {
      padding: 4px 10px;
      font-size: 12px;
    }
  }
}
</style>
