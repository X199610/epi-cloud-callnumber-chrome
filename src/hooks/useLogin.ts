import { ref } from 'vue'
import dayjs from 'dayjs'

import { LoginFormData } from '../popup/components/Login/types'

import { fetchToken } from '@/api/auth/oauth'
import { LoginReq } from '@/api/auth/oauth/types'
import { getUserInfo } from '@/api/uc/sysUser'

import { aesDecode, aesEncode } from '@/utils/encrypt'
import Log from '@/utils/log'
import StorageUtil from '@/utils/storage'
import globalConfig from '@/config/global'

/** 登录页面以外 使用时传入false */
const uesLogin = (isLoginPage = true) => {
  /** 获取token */
  const formData = ref<LoginFormData>({
    username: globalConfig.env == 'development' ? 'admin' : '',
    password: globalConfig.env == 'development' ? 'gigaccms' : '',
  })

  /** 获取token */
  const getToken = async () => {
    const userLogin = await StorageUtil.getItem('userLogin')
    const reqObj: LoginReq = {
      username: isLoginPage ? formData.value.username : userLogin?.username,
      // password:isLoginPage? aesEncode(formData.value.password),
      password: isLoginPage ? formData.value.password : aesDecode(userLogin!.password),
      type: 'password',
    }
    const { data } = await fetchToken(reqObj)
    isLoginPage &&
      (await StorageUtil.setItem('userLogin', {
        username: formData.value.username,
        password: aesEncode(formData.value.password),
      }))
    await StorageUtil.setItem(
      'expiresIn',
      dayjs(dayjs().valueOf())
        .add((parseInt(data.expires_in) || 7200) / 60 - 20, 'm')
        .valueOf()
    )
    await StorageUtil.setItem('fetchToken', data)
  }

  /** 获取用户信息 */
  const getBaseInfo = async () => {
    const { data } = await getUserInfo()
    await StorageUtil.setItem('userBaseInfo', data)
  }

  return { formData, getToken, getBaseInfo }
}
export default uesLogin
