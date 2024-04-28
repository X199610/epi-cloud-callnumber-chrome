import globalConfig from '@/config/global'
import { Aes } from '@mgw1986/epi-cloud-web-tools'

//用于登录的数据加密-Aes
export function aesEncode(importStr: string) {
  if (!importStr) return ''
  const decryptData = Aes.encrypt(importStr, globalConfig.keyPassword, globalConfig.iv)
  return decryptData
}
/** 解密 */
export function aesDecode(importStr: string) {
  if (!importStr) return ''
  const decryptData = Aes.decrypt(importStr, globalConfig.keyPassword, globalConfig.iv)
  return decryptData
}

export function base64ToUtf8(str: string) {
  return decodeURIComponent(window.escape(window.atob(str)))
}
