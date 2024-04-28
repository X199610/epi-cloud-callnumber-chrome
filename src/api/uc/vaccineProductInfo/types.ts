/** 获取疫苗产品信息列表-入参 */
export interface GetVaccineProductInfoReq {
  /** 产品信息 */
  productInfo?: string
  /** 生产企业(生产企业简称) */
  productionEnterpriseNameShort?: string
  /** 疫苗种类(疫苗种类简称) */
  vaccineMinorNameShort?: string
  /** 疫苗制品(疫苗制品简称) */
  vaccineProductNameShort?: string
  /**  0启、1停 */
  status: '0' | '1'
}
/** 获取疫苗产品信息列表-响应 */
export interface GetVaccineProductInfoResData {
  /** 抗原含量 */
  antigenContent: string
  /** 批准文号 */
  approvalNumber: string
  /** 疫苗分类 免规 非免规 */
  category: '免规' | '非免规'
  /** 药品编号 */
  cndc: string
  /** 药品编号 */
  drugNo: string
  /** 剂型 */
  dosageForm: string
  /** 药品注册号 */
  drugRegistrationNumber: string
  /** 主键id */
  id: string
  /** 可用接种途径 */
  inoculationRoute: string
  /** 可用接种部位 */
  inoculationSite: string
  /** 最小包装疫苗规格 */
  minPackagedVaccineSpecification: string
  /** 最小包装量 */
  minPackingQuantity: string
  /** 开封时效 */
  openAging: string
  /** 包装工艺 */
  packagingTechnology: string
  /** 产品编码 */
  productCode: string
  /** 产品信息 */
  productInfo: string
  /** 生产企业 国标编码 */
  productionEnterpriseCode: string
  /** 生产企业简称 */
  productionEnterpriseNameShort: string
  /** 形状 */
  shape: string
  /** 单支使用剂量 */
  singleDose: string
  /** 单支使用剂次 */
  singleTimes: string
  /** 疫苗产地 国产 进口 */
  vaccineArea: '国产' | '进口'
  /** 疫苗制品国标编码(疫苗次类编码) */
  vaccineMinorCode: string
  /** 疫苗次类编码id */
  vaccineMinorId: string
  /** 产品全称(疫苗次类名称) */
  vaccineMinorName: string
  /** 疫苗种类英文简称(疫苗次类苗英文简称) */
  vaccineMinorNameEnglish: string
  /** 疫苗种类简称(疫苗次类简称) */
  vaccineMinorNameShort: string
  /** 疫苗制品简称 */
  vaccineProductNameShort: string
  /** 是否注销 1-是 0-否 */
  writeOff: WriteOffEnum
  /** 对于zcy页面匹配字段 名称|厂家 */
  zcyName: string

  categoryDesc: string
}

export interface GetDrugStockListData {
  TimeStamp: string
}

/** 是否注销枚举 */
export enum WriteOffEnum {
  /** 是 */
  YES = '1',
  /** 否 */
  NO = '0',
}

/** 是否注销的键值对映射 */
export const writeOffKV: Record<WriteOffEnum, string> = {
  /** 是 */
  [WriteOffEnum.YES]: '是',
  /** 否 */
  [WriteOffEnum.NO]: '否',
}

export interface GetDrugStockListRes {
  Data: {
    DrugInventoryList: []
    DrugInventorySumList: any[]
  }
  status: string
  data: {
    Message: string
    PageCount: number
    Status: number
    Data: {
      DrugInventoryList: []
      DrugInventorySumList: any[]
    }
  }
}
