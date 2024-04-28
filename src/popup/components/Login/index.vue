<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import { Form, FormItem, Input, Button, InputPassword } from 'ant-design-vue'
import { cloneDeep, debounce } from 'lodash-es'

import { LoginFormData } from './types'

import useLogin from '@/hooks/useLogin'

import { aesEncode } from '@/utils/encrypt'

import Log from '@/utils/log'
import Msg from '@/utils/message'
import StorageUtil from '@/utils/storage/index'

import manifestConfirm from '@/manifest.json'

const login_icon = chrome.runtime.getURL('/static/login_icon.png')

defineProps<{
  showSwitchBadge: boolean
}>()
const emits = defineEmits<{
  (e: 'signIn', v: LoginFormData): void
}>()

const formRef = ref<FormInstance>()

const { formData } = useLogin()

const login = debounce(async () => {
  try {
    await formRef.value?.validateFields()
    await StorageUtil.setItem('userLogin', {
      username: cloneDeep(formData.value.username),
      password: cloneDeep(aesEncode(formData.value.password)),
    })
    emits('signIn', cloneDeep(formData.value))
  } catch (error) {
    Msg.warn({ content: '请根据提示重新填写！'})
  }
}, 300)
</script>

<template>
  <div class="login-form-box">
    <div class="icon-area">
      <img :src="login_icon" />
      <p>密码登录</p>
    </div>
    <Form ref="formRef" :model="formData">
      <div class="inp-box">
        <span>账号</span>
        <FormItem name="username" :rules="{ required: true, message: '请填写账号！' }">
          <Input v-model:value="formData.username" :bordered="false" allowClear @press-enter="login"></Input>
        </FormItem>
      </div>
      <div class="inp-box">
        <span>密码</span>
        <FormItem name="password" :rules="{ required: true, message: '请填写密码！' }">
          <InputPassword v-model:value="formData.password" :bordered="false" allowClear @press-enter="login"> </InputPassword>
        </FormItem>
      </div>
      <Button type="primary" shape="round" @click="login">登录</Button>
    </Form>
    <p class="lv">版本号：{{ manifestConfirm.version }}</p>
  </div>
</template>

<style lang="scss" scoped>
.login-form-box {
  width: 240px;
  height: 324px;
  background: #ffffff;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  column-gap: 20px;
  padding: 30px 20px;
  box-sizing: border-box;
  .icon-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    img {
      width: 60px;
      height: 60px;
    }
    p {
      height: 15px;
      font-size: 16px;
      font-weight: 400;
      color: #333333;
      margin: 9px 0 20px;
    }
  }
  .ant-form {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 20px;
    .inp-box,
    .ant-btn-round {
      width: 100%;
      height: 40px;
    }
    .inp-box {
      background: #f0f1f5;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      & span {
        font-size: 14px;
        font-weight: 400;
        color: #999999;
      }
      .ant-form-item {
        margin-bottom: 0;
        .ant-form-item-control {
          position: relative;
          .ant-input-affix-wrapper {
            width: 132px;
          }
          .ant-form-item-explain-error {
            position: absolute;
          }
        }
      }
    }
  }
  .lv {
    color: #999999;
    position: relative;
    top: -5px;
  }
}
</style>
