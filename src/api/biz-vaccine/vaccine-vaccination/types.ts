import { ChannelTypeEnum } from '@/api/uc/types'

export interface CurrentRegisterReq {
  timestamp: string
  childCode: string
  status: string
  deptCode: string
}

export interface CurrentRegisterResData {
  code: string
  message: string
  result: ResultData[]
}

export interface ResultData {
  needleNum: string
  manufacturerName: string
  registrationDate: string
  vaccineTypeName: string
  vaccineMinorNameShort: string
  categoryDesc: string
  vaccinePrice: string
}

export interface LocalFinallResData {
  dosage?: string
  enterpriseName?: string
  regDate?: string
  type?: string
  vaccName?: string
  zcyName?: string
  categoryDesc?: string
  vaccinePrice?: string
}
