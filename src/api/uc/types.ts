/** 状态 0-正常 1-禁用 2-删除 */
export enum StatusEnum {
  /** 正常 */
  NORMAL = '0',
  /** 禁用 */
  DISABLED = '1',
  /** 删除 */
  DELETED = '2',
}

/** 状态的键值对映射 */
export const StatusKV: Record<StatusEnum, string> = {
  /** 正常 */
  [StatusEnum.NORMAL]: '正常',
  /** 禁用 */
  [StatusEnum.DISABLED]: '禁用',
  /** 删除 */
  [StatusEnum.DELETED]: '删除',
}

/** 工作台类型 */
export enum WorkbenchTypeEnum {
  /** 取号 */
  GET_NUMBER = '0',
  /** 登记 */
  REGISTRATION = '1',
  /** 接种 */
  VACCINATION = '2',
  /** 呼叫 */
  CALL = '3',
  /** 大屏 */
  SCREEN = '4',
  /** 狂犬接种 */
  RABIES_VACCINATION = '6',
  /** 缴费 */
  PAYMENT = '7',
  /** 儿童登记 */
  CHILD_REGISTRATION = '8',
  /** 儿童接种 */
  CHILD_VACCINATION = '9',
  /** 新冠登记 */
  COVID_REGISTRATION = '10',
  /** 新冠接种 */
  COVID_VACCINATION = '11',
  /** 询问 */
  INQUIRY = '12',
  /** 儿保 */
  CHILD_CARE = '13',
}

/** 工作台类型的键值对映射 */
export const workbenchTypeKV: Record<WorkbenchTypeEnum, string> = {
  /** 取号 */
  [WorkbenchTypeEnum.GET_NUMBER]: '取号',
  /** 登记 */
  [WorkbenchTypeEnum.REGISTRATION]: '登记',
  /** 接种 */
  [WorkbenchTypeEnum.VACCINATION]: '接种',
  /** 呼叫 */
  [WorkbenchTypeEnum.CALL]: '呼叫',
  /** 大屏 */
  [WorkbenchTypeEnum.SCREEN]: '大屏',
  /** 狂犬接种 */
  [WorkbenchTypeEnum.RABIES_VACCINATION]: '狂犬接种',
  /** 缴费 */
  [WorkbenchTypeEnum.PAYMENT]: '缴费',
  /** 儿童登记 */
  [WorkbenchTypeEnum.CHILD_REGISTRATION]: '儿童登记',
  /** 儿童接种 */
  [WorkbenchTypeEnum.CHILD_VACCINATION]: '儿童接种',
  /** 新冠登记 */
  [WorkbenchTypeEnum.COVID_REGISTRATION]: '新冠登记',
  /** 新冠接种 */
  [WorkbenchTypeEnum.COVID_VACCINATION]: '新冠接种',
  /** 询问 */
  [WorkbenchTypeEnum.INQUIRY]: '询问',
  /** 儿保 */
  [WorkbenchTypeEnum.CHILD_CARE]: '儿保',
}

/** 通道类型 0-询问,1-登记,2-接种,3-留观,4-延迟,5-告知,6-呼叫,7-缴费,8-异常 */
export enum ChannelTypeEnum {
  /** 询问 */
  INQUIRY = '0',
  /** 待登记 */
  REGISTRATION = '1',
  /** 待接种 */
  VACCINATION = '2',
  /** 留观 */
  OBSERVATION = '3',
  /** 询问延迟 */
  INQUIRY_DELAY = '4',
  /** 询问告知 */
  INQUIRY_NOTIFICATION = '5',
  /** 呼叫 */
  CALL = '6',
  /** 缴费 */
  PAYMENT = '7',
  /** 异常 */
  ABNORMAL = '8',
  /** 正在接种 */
  VACCINATING = '10',
  /** 接种台语音通道 */
  VACCINATION_VOICE = '11',
  /** 登记台语音通道 */
  REGISTRATION_VOICE = '12',
  /** 箱体 */
  BOX = '13',
  /** 询问台语音通道 */
  INQUIRY_VOICE = '14',
  /** 登记延迟 */
  REGISTRATION_DELAY = '15',
  /** 接种延迟 */
  VACCINATION_DELAY = '16',
  /** 登记告知 */
  REGISTRATION_NOTIFICATION = '17',
  /** 接种告知 */
  VACCINATION_NOTIFICATION = '18',
  /** 儿保 */
  CHILD_CARE = '19',
  /** 儿保延迟 */
  CHILD_CARE_DELAY = '20',
  /** 前端自定义  取苗队列
   * 2024-03-04 结合进入queueVo
   */
  // FETCH_SEEDLINGS = '999qm',
}

/** 通道类型的键值对映射 */
export const channelTypeKV: Record<ChannelTypeEnum, string> = {
  /** 询问 */
  [ChannelTypeEnum.INQUIRY]: '待询问',
  /** 登记 */
  [ChannelTypeEnum.REGISTRATION]: '待登记',
  /** 接种 */
  [ChannelTypeEnum.VACCINATION]: '待接种',
  /** 留观 */
  [ChannelTypeEnum.OBSERVATION]: '留观',
  /** 询问延迟 */
  [ChannelTypeEnum.INQUIRY_DELAY]: '询问延迟',
  /** 告知 */
  [ChannelTypeEnum.INQUIRY_NOTIFICATION]: '询问告知',
  /** 呼叫 */
  [ChannelTypeEnum.CALL]: '呼叫',
  /** 缴费 */
  [ChannelTypeEnum.PAYMENT]: '缴费',
  /** 异常 */
  [ChannelTypeEnum.ABNORMAL]: '异常',
  /** 正在接种 */
  [ChannelTypeEnum.VACCINATING]: '正在接种',
  /** 接种台语音通道 */
  [ChannelTypeEnum.VACCINATION_VOICE]: '接种台语音通道',
  /** 登记台语音通道 */
  [ChannelTypeEnum.REGISTRATION_VOICE]: '登记台语音通道',
  /** 箱体 */
  [ChannelTypeEnum.BOX]: '箱体',
  /** 询问台语音通道 */
  [ChannelTypeEnum.INQUIRY_VOICE]: '询问台语音通道',
  /** 登记延迟 */
  [ChannelTypeEnum.REGISTRATION_DELAY]: '登记延迟',
  /** 接种延迟 */
  [ChannelTypeEnum.VACCINATION_DELAY]: '接种延迟',
  /** 登记告知 */
  [ChannelTypeEnum.REGISTRATION_NOTIFICATION]: '登记告知',
  /** 接种告知 */
  [ChannelTypeEnum.VACCINATION_NOTIFICATION]: '接种告知',
  /** 儿保 */
  [ChannelTypeEnum.CHILD_CARE]: '儿保',
  /** 儿保延迟 */
  [ChannelTypeEnum.CHILD_CARE_DELAY]: '儿保延迟',
  /** 前端自定义  取苗队列 2024-03-04 新需求将流水和订单结合 */
  // [ChannelTypeEnum.FETCH_SEEDLINGS]: '取苗',
}

/** 通道类型 排序 的键值对映射 */
export const channelTypeSortKV: Record<ChannelTypeEnum, number> = {
  /** 儿保 */
  [ChannelTypeEnum.CHILD_CARE]: -20,
  /** 儿保延迟 */
  [ChannelTypeEnum.CHILD_CARE_DELAY]: -10,
  /** 询问 */
  [ChannelTypeEnum.INQUIRY]: 10,
  /** 询问延迟 */
  [ChannelTypeEnum.INQUIRY_DELAY]: 20,
  /** 询问台语音通道 */
  [ChannelTypeEnum.INQUIRY_VOICE]: 30,
  /** 询问告知 */
  [ChannelTypeEnum.INQUIRY_NOTIFICATION]: 40,
  /** 登记 */
  [ChannelTypeEnum.REGISTRATION]: 50,
  /** 登记延迟 */
  [ChannelTypeEnum.REGISTRATION_DELAY]: 60,
  /** 登记台语音通道 */
  [ChannelTypeEnum.REGISTRATION_VOICE]: 70,
  /** 登记告知 */
  [ChannelTypeEnum.REGISTRATION_NOTIFICATION]: 80,
  /** 接种 */
  [ChannelTypeEnum.VACCINATION]: 90,
  /** 接种延迟 */
  [ChannelTypeEnum.VACCINATION_DELAY]: 100,
  /** 接种台语音通道 */
  [ChannelTypeEnum.VACCINATION_VOICE]: 110,
  /** 接种告知 */
  [ChannelTypeEnum.VACCINATION_NOTIFICATION]: 120,
  /** 留观 */
  [ChannelTypeEnum.OBSERVATION]: 130,
  /** 异常 */
  [ChannelTypeEnum.ABNORMAL]: 140,

  /** 呼叫 */
  [ChannelTypeEnum.CALL]: 150,
  /** 缴费 */
  [ChannelTypeEnum.PAYMENT]: 160,
  /** 正在接种 */
  [ChannelTypeEnum.VACCINATING]: 170,
  /** 箱体 */
  [ChannelTypeEnum.BOX]: 180,
  /** 前端自定义  取苗队列 2024-03-04 新需求将流水和订单结合 */
  // [ChannelTypeEnum.FETCH_SEEDLINGS]: 999,
}
/** 0:否,1:是 */
export enum IsOrNoEnum {
  /** 否 */
  NO = '0',
  /** 是 */
  YES = '1',
}
export const isOrNoKV: Record<IsOrNoEnum, string> = {
  [IsOrNoEnum.NO]: '否',
  [IsOrNoEnum.YES]: '是',
}
