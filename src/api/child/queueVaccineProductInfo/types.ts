/** 获取绑定的疫苗产品信息-入参 */
export interface GetQueueVaccineProductInfoListByIdReq {
  /** ws返回队列的一项的主键id */
  queueInfoId: string
}

/** 获取绑定的疫苗产品信息-响应 */
export interface GetQueueVaccineProductInfoListByIdResData {
  /** 主键id */
  id: string
  /** 疫苗名称 */
  productInfo: string
  /** 生产企业简称 */
  productionEnterpriseNameShort: string
  /** 队列信息表主键id */
  queueInfoId: string
  /** 疫苗制品国标编码(疫苗次类编码) */
  vaccineMinorCode: string
  /** 疫苗次类名称 */
  vaccineMinorName: string
  /** 疫苗次类简称 */
  vaccineMinorNameShort?: string
  /** 疫苗产品信息表主键id */
  vaccineProductInfoId: string
  /** 疫苗剂次 */
  needleNum: string
}

/** 接种人对列绑定疫苗产品信息-入参 */
export interface SaveQueueVaccineProductInfoReq {
  /** 队列信息表主键id */
  queueInfoId: string
  /** 疫苗产品信息表主键id */
  vaccineProductInfoId: string
  /** 疫苗剂次 */
  needleNum: string
}
