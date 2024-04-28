<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Button, Dropdown, Menu, MenuItem, MenuDivider } from 'ant-design-vue'
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface'

import { BadgeText, BadgeTextKV } from '@/serviceWorker/types'
import { MenuKeyEnum } from './types'

import Log from '@/utils/log'
import Msg from '@/utils/message'

import StorageUtil from '@/utils/storage'
import { changeBadgeText } from '@/serviceWorker/util'
import { UserInfo } from '@/api/uc/sysUser/types'

import manifestConfirm from '@/manifest.json'

const popup_megaphone = chrome.runtime.getURL('/static/popup_megaphone.png')
const user = chrome.runtime.getURL('/static/user.png')

defineProps<{
  showSwitchBadge: boolean
}>()

const emits = defineEmits<{
  (e: 'update:showSwitchBadge', v: boolean): void
}>()

const badgeText = ref<BadgeText>(BadgeText.OFF)
const userInfo = ref<UserInfo>({} as UserInfo)

/** 获取本地存储的浮动小图标展示状态 */
const getBadgeText = async () => {
  badgeText.value = (await StorageUtil.getItem('badgeText')) || BadgeText.OFF
}

/** 切换页面中的浮动小图标状态，通知其是否展示 */
const changeBadge = async (v: BadgeText) => {
  if (v != badgeText.value) {
    await changeBadgeText(v)
    await getBadgeText()
    if (v == BadgeText.OFF) {
      await StorageUtil.removeItem('showWorkbench')
    }
  }
}

/** 按钮的样式 */
const btnStyle = (v: BadgeText) => {
  return {
    background: badgeText.value == v ? '#1D64FF' : '#fff',
    color: badgeText.value == v ? '#fff' : '#999',
    'border-width': 0,
    width: '60px',
    height: '32px',
    'font-weight': 400,
  }
}

/** 点击菜单 */
const handlerMenuItem = async ({ key }: MenuInfo) => {
  const k = key as MenuKeyEnum
  if (k == MenuKeyEnum.LOGOUT) {
    await logOut()
  }
}

/** 登出 */
const logOut = async () => {
  await changeBadgeText(BadgeText.OFF)
  await getBadgeText()
  await StorageUtil.clearAll()
  emits('update:showSwitchBadge', false)
}

onMounted(async () => {
  await getBadgeText()
  userInfo.value = (await StorageUtil.getItem('userBaseInfo')) || ({} as UserInfo)
})
</script>

<template>
  <div class="switch-badge">
    <div class="img-bgc">
      <img :src="popup_megaphone" />
      <div class="user-icon">
        <Dropdown>
          <img :src="user" />
          <template #overlay>
            <Menu @click="handlerMenuItem">
              <MenuItem :key="MenuKeyEnum.DEPT_INFO">{{ userInfo.deptDesc }}</MenuItem>
              <MenuDivider></MenuDivider>
              <MenuItem :key="MenuKeyEnum.LOGOUT">退出登录</MenuItem>
              <MenuDivider></MenuDivider>
              <MenuItem disabled> 版本 {{ manifestConfirm.version }}</MenuItem>
            </Menu>
          </template>
        </Dropdown>
      </div>
    </div>
    <div class="operation-area">
      <div class="operation-btns">
        <Button :style="btnStyle(BadgeText.ON)" shape="round" @click="changeBadge(BadgeText.ON)">
          {{ BadgeTextKV[BadgeText.ON] }}
        </Button>
        <Button :style="btnStyle(BadgeText.OFF)" shape="round" @click="changeBadge(BadgeText.OFF)">
          {{ BadgeTextKV[BadgeText.OFF] }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.switch-badge {
  width: 160px;
  height: 150px;
  background: #fff;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;

  .img-bgc {
    width: 160px;
    height: 80px;
    background: rgba(35, 103, 253, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    & img {
      width: 60px;
      height: 53px;
    }
    .user-icon {
      width: 21px;
      height: 21px;
      background: #ffffff;
      border-radius: 50%;
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      & img {
        width: 13px;
        height: 13px;
      }
    }
  }
  .operation-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    .operation-btns {
      width: 120px;
      height: 32px;
      display: flex;
      border: 1px solid #e6e6e6;
      border-radius: 16px;
    }
  }
}
</style>
