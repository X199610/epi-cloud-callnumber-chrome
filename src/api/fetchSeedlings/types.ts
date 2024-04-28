/** 发苗请求 */
export interface SendOrderReq {
  /** 接种号台 */
  stationNO: number
  /** 处方单号 订单编号生成规则：个案号(18+位)+年月日(8位)+药品编号(cndc11+位)+台号(2位) */
  presNO: string
  /** 病人姓名 */
  patientName: string
  /** 病人年龄 */
  patientAge?: string
  /** 病人ID */
  patientID: string
  /** 排队号码 */
  queueNO: string
  /** 药品信息 */
  orderDrugs: OrderDrugs[]
}

export interface OrderDrugs {
  /** 药品id */
  drugId: string
  /** 药品编号 */
  drugNo: string
  /** 药品名称 */
  drugName: string
  /** 药品数量 */
  drugNumber: number
  /** 包装单位  */
  packagingUnit: string
  /** 规格 */
  specifications: string
  /** 药品厂家 */
  drugFactory: string
  /** 剂次 */
  dosage?: number
  /** 产品信息 */
  product: string
}

/** 获取任务列表 */
export interface GetOrdersReq {
  /** 接种号台 */
  stationNO: number
  /** 订单创建时间  只需要传天  默认从当天00点到第二天00点  2021-01-01*/
  orderCreatedTime: string
  /* 内部状态       外部状态
           0 - 待发苗     0 - 待发苗
           1 - 取苗中     1 - 取苗中
           2 - 取苗完成   1 - 取苗中  
           3 - 放苗中     1 - 取苗中
           4 - 放苗完成   4 - 传送中
           5 - 已完成     5 - 已完成
           6 - 发苗失败   6  - 失败
        请使用外部状态 传status = -1为搜索所有状态
        为避免存在00接种台的情况 如果不需要按照接种台搜索 请传-1
           */
  status: number
}

export interface GetOrdersResData {
  /** 台号 */
  stationNO: number
  /** 处方单号 */
  presNO: string
  /** 病人姓名 */
  patientName: string
  /** 病人年龄 */
  patientAge: string
  /** 病人ID */
  patientID: string
  /** 排队号码 */
  queueNO: string
  /** 外部状态 中文 */
  statusDisplay: string
  /** 内部状态 */
  status: StatusEnum
  /** 订单创建时间  2023-10-28 10:00:00 */
  orderCreatedTime: string
  /** 订单开始执行时间 2023-10-28 10:00:00 */
  orderStartExecuteTime: string
  /** 订单结束执行时间 2023-10-28 10:00:00 */
  orderEndExecuteTime: string
  /** 任务最近一次更新时间 2023-10-28 10:00:00 */
  updateTime: string
  /** 错误消息 */
  message: string
  /** 药品信息 */
  orderDrugs: OrderDrugsMore[]
}
export interface OrderDrugsMore extends Omit<OrderDrugs, 'drugNumber'> {
  /** 药品数量 */
  number: number
  /** 监管码 追溯码 */
  electronicBarcode: string
  /** 效期 */
  dateExpire: string
  /** 批次 */
  batchNo: string
  /** 发药日期 */
  dateDispensed: string
  /** 实际发放数量 */
  actualNumber: number
}

/**
 * 内部状态 0-待发苗 1-取苗中 2-取苗完成 3-放苗中 4-放苗完成 5-已完成 6-发苗失败
 * 外部状态 0-待发苗 1-取苗中 1-取苗中  1-取苗中  4-传送中  5-已完成  6-失败
 */
export enum StatusEnum {
  /** 待发苗 */
  READY_SEEDLING = '0',
  /** 取苗中 */
  COLLECTING_SEEDLINGS = '1',
  /** 取苗完成 */
  SEEDLING_EXTRACTION_COMPLETED = '2',
  /** 放苗中 */
  RELEASING_SEEDLINGS = '3',
  /** 放苗完成 */
  SEEDING_COMPLETE = '4',
  /** 已完成 */
  COMPLETED = '5',
  /** 发苗失败 */
  FAIL = '6',
}

/** 内部状态 */
export const inSideStatusKV: Record<StatusEnum, string> = {
  [StatusEnum.READY_SEEDLING]: '待发苗',
  [StatusEnum.COLLECTING_SEEDLINGS]: '取苗中',
  [StatusEnum.SEEDLING_EXTRACTION_COMPLETED]: '取苗完成',
  [StatusEnum.RELEASING_SEEDLINGS]: '放苗中',
  [StatusEnum.SEEDING_COMPLETE]: '放苗完成',
  [StatusEnum.COMPLETED]: '已完成',
  [StatusEnum.FAIL]: '发苗失败',
}

/** 外部状态 */
export const outSideStatusKV: Record<StatusEnum, string> = {
  [StatusEnum.READY_SEEDLING]: '待发苗',
  [StatusEnum.COLLECTING_SEEDLINGS]: '取苗中',
  [StatusEnum.SEEDLING_EXTRACTION_COMPLETED]: '取苗中',
  [StatusEnum.RELEASING_SEEDLINGS]: '取苗中',
  [StatusEnum.SEEDING_COMPLETE]: '传送中',
  [StatusEnum.COMPLETED]: '已完成',
  [StatusEnum.FAIL]: '失败',
}
