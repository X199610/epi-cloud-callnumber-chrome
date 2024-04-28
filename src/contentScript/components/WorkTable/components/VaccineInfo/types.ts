import { GetQueueVaccineProductInfoListByIdResData } from '@/api/child/queueVaccineProductInfo/types'

export interface TableRowItem extends Omit<GetQueueVaccineProductInfoListByIdResData, 'needleNum'> {
  /** 是否已经绑定 */
  isBounded: boolean
  /** 是否是新添加的 */
  isNewAdd?: boolean
  /** 剂次 */
  needleNum?: string
  key: string
  vaccineSelected?: string
  zcyName?: string
}
