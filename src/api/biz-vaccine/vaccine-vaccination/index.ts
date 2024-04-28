import { ApiResponse } from '@/api/types'

import { CurrentRegisterReq, CurrentRegisterResData } from './types'
import { service } from '@/utils/CORSRequest'
import globalConfig from '@/config/global'

export enum BizVaccineApi {
  /** 获取登记数据-测试 */
  CURRENT_REGISTER_DEV = 'http://www.test-ymg.cai-inc.com/api/biz-vaccine/vaccine-vaccination/vaccinate/current/register',

  /** 获取登记数据-真线 */
  CURRENT_REGISTER_PRO = 'http://59.202.53.66/api/biz-vaccine/vaccine-vaccination/vaccinate/current/register',
}

/**
 * 获取登记数据
 * @param data
 * @returns
 */
export function current_register(params: CurrentRegisterReq) {
  if (globalConfig.env == 'development') {
    // 浙江-杭州-贝瑞斯门诊-测试
    return service.get<CurrentRegisterResData>(BizVaccineApi.CURRENT_REGISTER_DEV, { params })
  } else {
    // 浙江-温州-郭溪门诊-真线
    return service.get<CurrentRegisterResData>(BizVaccineApi.CURRENT_REGISTER_PRO, { params })
  }
}
