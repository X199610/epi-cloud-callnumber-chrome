/** 根据单位id查询自己的预约配置（返回值） */
export interface GetQueueConfigByDeptIdRes {
  /** 提前到达时间，半小时一档，最多24 */
  advanceTime?: string
  /** 预约提前取号,0:不可取号,1:当日提前到达均可取号,2:自定义时间 */
  advanceType?: AdvanceTypeEnum
  /** 否开启单独健康询问台，0：否，1：是*/
  aloneAsk?: string | boolean
  /** 是否开启收费流程,0:否,1:是 */
  billingProcess?: string | boolean
  /** 单位id主键 */
  deptId?: string
  /** 预约过期时间，半小时一档，最多24 */
  expiredTime?: string
  /** 预约过期取号,0:不可取号,1:全天均可取号,2:自定义时间 */
  expiredType?: ExpiredTypeEnum
  /** id */
  id?: string
  /** 每日最高预约剂次*/
  dailyMaximumReservation?: number
  /** 每人预约最高剂次数*/
  personMaximumReservation?: number
  /** 登记管理，1-本机，2-外设，3-本机+外设*/
  registrationManagement?: NativeAndPeripheral
  /** 接种管理，1-本机，2-外设，3-本机+外设*/
  vaccinationManagement?: NativeAndPeripheral
  /** 预约到场开始时间 HH:mm */
  reservationArrivalStartTime?: string
  /** 预约到场结束时间  HH:mm*/
  reservationArrivalEndTime?: string
  /** 建卡 - 是否默认户籍地址和居住地为本门诊街道，0-否，1-是 */
  isDefaultAddress?: string | boolean
  /** 是否开取苗功能 0-否 1-是 */
  catchVaccine?: CatchVaccineEnum
  /** 取苗请求路径 */
  catchVaccineUrl?: string
  /** 取苗ws路径 */
  catchVaccineWsUrl?: string
}

/** 是否开取苗功能 0-否 1-是 */
export enum CatchVaccineEnum {
  /** 0-否 */
  NO = '0',
  /** 1-是 */
  YES = '1'
}
export const catchVaccineKV: Record<CatchVaccineEnum, string> = {
  [CatchVaccineEnum.NO]: '否',
  [CatchVaccineEnum.YES]: '是'
}

/** 本机和外设组合 */
export enum NativeAndPeripheral {
  /** 1-本机 */
  NATIVE = '1',
  /** 2-外设 */
  PERIPHERAL = '2',
  /** 3-本机+外设 */
  NATIVE_AND_PERIPHERAL = '3'
}

/** 预约提前取号,0:不可取号,1:当日提前到达均可取号,2:自定义时间 */
export enum AdvanceTypeEnum {
  /** 0:不可取号 */
  TYPE_0 = '0',
  /** 1:当日提前到达均可取号 */
  TYPE_1 = '1',
  /** 2:自定义时间 */
  TYPE_2 = '2'
}

/** 预约提前取号,0:不可取号,1:当日提前到达均可取号,2:自定义时间 */
export const advanceTypeKV: Record<AdvanceTypeEnum, string> = {
  [AdvanceTypeEnum.TYPE_0]: '不可取号',
  [AdvanceTypeEnum.TYPE_1]: '当日提前到达均可取号',
  [AdvanceTypeEnum.TYPE_2]: '自定义时间'
}

/** 预约过期取号,0:不可取号,1:全天均可取号,2:自定义时间 */

export enum ExpiredTypeEnum {
  /** 0:不可取号 */
  TYPE_0 = '0',
  /** 1:全天均可取号 */
  TYPE_1 = '1',
  /** 2:自定义时间 */
  TYPE_2 = '2'
}

/** 预约过期取号,0:不可取号,1:全天均可取号,2:自定义时间 */
export const expiredTypeKV: Record<ExpiredTypeEnum, string> = {
  [ExpiredTypeEnum.TYPE_0]: '不可取号',
  [ExpiredTypeEnum.TYPE_1]: '全天均可取号',
  [ExpiredTypeEnum.TYPE_2]: '自定义时间'
}
