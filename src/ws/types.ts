export type PromiseReturnType<T extends Promise<any>> = T extends Promise<infer U> ? U : never

export enum BroadcastWsMessageType {
  VOICE = 'voice',
  QUEUE = 'queue',
  CALL = 'call',
  NOTIFY = 'notify',
  ONLINE_STATUS = 'online-status',
  OFFLINE_STATUS = 'offline-status',
}

export interface BroadcastWsMessage<C = any> {
  /* 主键，采用32位UUID--->列名: id */
  id: string
  /* 部门编号--->列名: dept_id */
  deptId: string
  /* 通道编号--->列名: channel_id */
  channelId: string
  /* 客户端socketId */
  socketId: string
  /* 消息的类型--->列名: type */
  type: BroadcastWsMessageType
  /* 消息的内容--->列名: content */
  content: C
  /* 发送者--->列名: send_name */
  sendName: string
  /* 发送时间--->列名: send_time */
  sendTime: number
  /* 创建时间--->列名: create_time */
  createTime: number
  /* 队列类型 */
  queueType?: 'down-data' | 'voice' | 'system'
  /* 加密签名消息 */
  signature?: string
}
/** C的type */
export interface WsMessageContent {
  /** 通道编号--->列名: channel_id */
  channelId: string
  /** 个案编码 */
  code: string
  /* 部门编号--->列名: dept_id */
  deptId: string
  expireTime: number
  id: string
  /** 排队号码 */
  queueNum: string
  /** 预约类型 */
  queueNumType: 'P' | 'V'
  /* 发送者--->列名: send_name */
  sendName: string
  vaccinationTime: number
  /** 接种人姓名 */
  userName: string
  /** 身份证号 */
  idCard: string
  /** 性别 */
  sex: string
  /** 出生日期 */
  birthday: string
  /** 工作台名称 有的话就是已经锁定(正在服务中) */
  workbench?: string
  /** 工作台id */
  workbenchId?: string
  /** 疫苗信息列表 */
  vaccineVoList: VaccineVo[]
}

export interface VaccineVo {
  /** 疫苗名称 */
  vaccineName: string
  /** 生产厂家 */
  manufacturerName: string
  lotNumber: string
  /** 是否免费 */
  isFree: string
  needleNum: string
  /** 二类苗code */
  vaccineMinorCode: string
}
