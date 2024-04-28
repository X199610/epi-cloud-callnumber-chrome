import { ApiResponse } from '@/api/types'
import { GetVaccineProductInfoReq, GetVaccineProductInfoResData, GetDrugStockListData, GetDrugStockListRes } from './types'
import { service } from '@/utils/CORSRequest'
import Log from '@/utils/log'
import StorageUtil from '@/utils/storage'

function getPathBeforeLastSlash(path: string | string[]) {
  var lastIndex = path.lastIndexOf(':')
  if (lastIndex === -1) {
    // 如果没有找到'/'，则返回原路径
    return path
  } else {
    // 否则，返回最后一个'/'之前的路径
    return path.slice(0, lastIndex)
  }
}

export enum UcVaccineProductInfoApi {
  /** 获取疫苗产品信息列表 */
  GET_VACCINE_PRODUCT_INFO_LIST = '/uc/vaccineProductInfo/getVaccineProductInfoList',
  /** 获取疫苗库存 */
  GET_DRUG_STOCK_LIST = 'http://10.13.104.95:8036/actionapi/AutoVaccine/GetDrugStockList',
}

/** 获取疫苗产品信息列表 */
export function getVaccineProductInfoList(
  data: GetVaccineProductInfoReq = {
    status: '0',
  }
) {
  return service.post<ApiResponse<GetVaccineProductInfoResData[]>, GetVaccineProductInfoReq>(
    UcVaccineProductInfoApi.GET_VACCINE_PRODUCT_INFO_LIST,
    data
  )
}

/** 获取疫苗产品信息测试列表 */
export function devqueryVaccineProductInfoByTimeStamp(
  data: GetVaccineProductInfoReq = {
    status: '0',
  }
) {
  let LOCAL_QUERY_VACCINE_PRODUCTINFO_BY_TIMESTAMP = 'http://192.168.1.241:8090/vaccine/getVaccineProductInfoList'
  return service.post<ApiResponse<GetVaccineProductInfoResData[]>, GetVaccineProductInfoReq>(
    LOCAL_QUERY_VACCINE_PRODUCTINFO_BY_TIMESTAMP,
    data
  )
}

/** 获取疫苗产品信息现场列表 */
export async function proqueryVaccineProductInfoByTimeStamp(data: GetVaccineProductInfoReq = { status: '0' }) {
  const queueConfig = await StorageUtil.getItem('queueConfig')
  let NOW_QUERY_VACCINE_PRODUCTINFO_BY_TIMESTAMP =
    getPathBeforeLastSlash(queueConfig!.catchVaccineUrl!) + '/api/epi/epi-cloud/vc/catch/vaccine/getVaccineProductInfoList'
  return service.post<ApiResponse<GetVaccineProductInfoResData[]>, GetVaccineProductInfoReq>(
    NOW_QUERY_VACCINE_PRODUCTINFO_BY_TIMESTAMP,
    data
  )
}

// 获取疫苗库存
export async function GetDrugStockList(data: GetDrugStockListData) {
  return service.localPost<GetDrugStockListRes, GetDrugStockListData>(UcVaccineProductInfoApi.GET_DRUG_STOCK_LIST, data)
}
