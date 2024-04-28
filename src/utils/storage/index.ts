/**
 * localStorage 封装
 */
import { StorageData } from './types'
import Log from '../log'

class StorageUtil {
  /**
   * 获取项目下配置的命名空间中的localStorage的内容
   *
   * @returns 项目下命名空间内的存储内容
   */
  static async getAllStorage(): Promise<StorageData> {
    const allStorage = await chrome.storage.local.get(null)
    return allStorage
  }

  /**
   * 通过传入的键，拿到 localStorage下相应的值
   *
   * @param key 键
   * @returns 对应键下的值
   */
  static async getItem<K extends keyof StorageData>(key: K): Promise<StorageData[K]> {
    const allStorage = await this.getAllStorage()
    return allStorage[key]
  }

  /**
   * 设置键值对到对应的命名空间下存储到 localStorage 中
   *
   * @param key 键+
   * @param value 值
   */
  static async setItem<K extends keyof StorageData>(key: K, value: StorageData[K]) {
    await chrome.storage.local.set({ [key]: value })
  }

  /**
   * 通过传入的键，删除对应 localStorage 下的一个或多个值
   * @param key 键
   */
  static async removeItem<K extends keyof StorageData>(key: K | K[]) {
    await chrome.storage.local.remove(key)
  }

  /**
   * 清除localStorage下所有的内容
   */
  static async clearAll() {
    const lastWorkbench = await StorageUtil.getItem('lastWorkbench')
    const tableNum = await StorageUtil.getItem('tableNum')
    await chrome.storage.local.clear()
    await StorageUtil.setItem('lastWorkbench', lastWorkbench)
    await StorageUtil.setItem('tableNum', tableNum)
  }
}

export default StorageUtil
