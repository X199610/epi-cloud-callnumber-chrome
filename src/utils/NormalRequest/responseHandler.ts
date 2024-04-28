import { ApiResponse } from '@/api/types'
import { AxiosError, AxiosResponse } from 'axios'
import { ErrCode, errCodeMsgKV } from './errcode'
import Msg from '../message'
import StorageUtil from '../storage'
import Log from '../log'
import { fetchToken } from '@/api/auth/oauth'
import { LoginReq } from '@/api/auth/oauth/types'
import { getUserInfo } from '@/api/uc/sysUser'
import dayjs from 'dayjs'
import { aesDecode } from '../encrypt'
import { BadgeText } from '@/serviceWorker/types'

/**
 * 处理resp.data.success为false的情况
 *
 * @param respData 接口返回数据
 * @param showCommonErrMsg 是否显示提示信息
 * @returns 如果resp.data.success === true则返回true否则返回false
 */
export async function handleInnerCodeErr(respData: ApiResponse, showCommonErrMsg = true) {
  if (!respData?.success) {
    // 展示默认错误提示信息
    if (showCommonErrMsg) {
      // 展示默认错误提示信息
      Msg.error({ content: respData.message })
    }
    return false
  }
  return true
}

/**
 * 处理http响应码为200的响应
 */
export const handleNormalResponse = async (resp: AxiosResponse<ApiResponse>) => {
  // 如果发现屏蔽内部错误处理标记打开，则直接放行
  if (resp.config.maskingErrorInterceptors) return true
  // 处理resp.data.success为false的情况
  return handleInnerCodeErr(resp.data)
}

/** 获取token */
const getToken = async () => {
  const userLogin = await StorageUtil.getItem('userLogin')
  const reqObj: LoginReq = {
    username: userLogin?.username,
    // password:isLoginPage? aesEncode(formData.value.password),
    password: aesDecode(userLogin!.password),
    type: 'password',
  }
  const { data } = await fetchToken(reqObj)
  await StorageUtil.setItem('expiresIn', dayjs(dayjs().valueOf()).add(5, 's').valueOf())
  await StorageUtil.setItem('fetchToken', data)
}

/** 获取用户信息 */
const getBaseInfo = async () => {
  const { data } = await getUserInfo()
  await StorageUtil.setItem('userBaseInfo', data)
}

const showErrModalAndAutoLogin = async (msg: string) => {
  Msg.error({ content: msg, key: 'refresh_token_msg' })
  await getToken()
  await getBaseInfo()
  Msg.success({ content: '已自动登录成功！请继续操作。', key: 'refresh_token_ok' })
  await StorageUtil.removeItem('testAutoLogin')
}

const handleExpiredToken = async (err: AxiosError<ApiResponse>) => {
  // Log.d('code不为200，这里处理账号登录过期、异常', err)
  const testAutoLogin = await StorageUtil.getItem('testAutoLogin')
  if (!testAutoLogin) {
    await StorageUtil.setItem('testAutoLogin', true)
    if (err.response?.status === ErrCode.UNAUTHORIZED) {
      await showErrModalAndAutoLogin('账号凭证异常,操作已被拦截,正在尝试重新登录...')
    } else if (err.response?.status === ErrCode.SYS_ERROR_3) {
      await showErrModalAndAutoLogin('登录过期,操作已被拦截,正在尝试重新登录...')
    }
  }
}

/**
 * 处理http响应码不为200的响应
 */
export const handleHttpError = async (err: AxiosError<ApiResponse>) => {
  const badgeText = await StorageUtil.getItem('badgeText')
  // 展示默认错误提示信息
  if (err.config?.showCommonErrMsg && badgeText == BadgeText.ON) {
    const msg = errCodeMsgKV[err.response?.status as ErrCode]
    if (err.code === 'ECONNABORTED' && err.message.includes('timeout')) {
      Msg.error({ content: '请求超时, 请检查网络连接！' })
    } else if (err.message === 'Network Error') {
      Msg.error({ content: '服务器错误或网络错误, 请稍后再试！' })
    } else if (msg) {
      await handleExpiredToken(err)
      Msg.error({ content: err.response?.data.message || msg })
    } else {
      Msg.error({ content: '服务器发出了未知错误' })
    }
  }
  return Promise.reject(err)
}
