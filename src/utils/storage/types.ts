import { TokenInfo } from '@/api/auth/oauth/types'
import { LocalFinallResData } from '@/api/biz-vaccine/vaccine-vaccination/types'
import { QueuePlusUpdateReq } from '@/api/child/queuePlusIn/types'
import { GetOrdersResData } from '@/api/fetchSeedlings/types'
import { GetQueueConfigByDeptIdRes } from '@/api/uc/queueConfig/types'
import { UserInfo } from '@/api/uc/sysUser/types'
import { ChannelTypeEnum, WorkbenchTypeEnum } from '@/api/uc/types'
import { GetVaccineProductInfoResData } from '@/api/uc/vaccineProductInfo/types'
import { CurPlayTypeEnum } from '@/contentScript/components/WorkTable/types'
import { ShengSuDomOption } from '@/hooks/types'
import { LoginFormData } from '@/popup/components/Login/types'
import { BadgeText } from '@/serviceWorker/types'

export interface OrderData {
  /**候诊序号 */
  queueNum: string
  /**预绑定台号 */
  preBindWorkbenchId: string
  time: string
}

export interface LatestWorkUpdateData {
  channelId?: string
  code?: string
  deptId?: string
  expireTime?: number
  id?: string
  queueNum?: string
  queueNumType?: string
  sendName?: string
  vaccinationTime?: number
  workbench?: string
  workbenchId?: string
  workTimesTamp?: number
}

export type RecordSelecteValType = Record<string, Record<string, GetVaccineProductInfoResData>>

export interface StorageData {
  /** 当前登录用户token信息 */
  badgeText?: BadgeText
  /** 当前登录用户基本信息 */
  userBaseInfo?: UserInfo
  /** token信息 */
  fetchToken?: TokenInfo
  /** 用户登录使用 */
  userLogin?: LoginFormData
  /** 登录凭证失效时间 */
  expiresIn?: number
  /** 正在自动重新登录 */
  beLoggingIn?: boolean
  /** 尝试重新登录 */
  testAutoLogin?: boolean
  /** 工作台状态 */
  showWorkbench?: boolean
  /** 所有疫苗的信息 */
  allVaccineInfo?: GetVaccineProductInfoResData[]
  /** 保存上次登录的工作台id */
  lastWorkbench?: { id: string; type: WorkbenchTypeEnum }
  /** shengsu系统dom配置 抓取、查询 */
  shengSuDomOption?: ShengSuDomOption
  /** 本单位取号配置 */
  queueConfig?: GetQueueConfigByDeptIdRes

  /** 当前播报状态 */
  curPlayType?: CurPlayTypeEnum
  /** 当前查询的个案编码 */
  curQueryCaseCode?: string
  /** 保存一下空号对应的信息 */
  emptyNumUse?: QueuePlusUpdateReq

  /** 台号 */
  tableNum?: number
  /**已发苗候诊数据 */
  order?: GetOrdersResData[]
  /** 保存抓取的疫苗信息 */
  // saveVaccineInfoList?: Record<string, GetVaccineProductInfoResData[]>
  latestWorkUpdateTime?: LatestWorkUpdateData[]
  /** 当匹配到的疫苗为多数的时候 进行标记 再次登记则直接使用这个值里的 */
  recordSelecteVal?: RecordSelecteValType
  /** 上一个完成登记的个案编码 */
  lastFinishCode?: string
  /** 最新登记的疫苗数据 */
  LocalFinallData?: LocalFinallResData[]
  /** 疫苗抓取状态 '1'未抓到  2抓到了但是匹配不上 3抓到了匹配上了 */
  storgeVaccStatus?: string | null
}
