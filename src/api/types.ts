import { AxiosResponseHeaders } from 'axios'

/**
 * 接口响应类型
 *
 * T 为data具体类型,默认为null
 */
export interface ApiResponse<T = null> {
  // code: BusinessErrCode | ErrCode
  data: T
  message: string
  signature: string
  success: boolean
  total: number
}

export interface ApiResponseWithHeader<T = null> {
  respData: T
  headers: AxiosResponseHeaders
}

/**
 * 分页接口响应的data类型
 *
 * T 为result中数组的每一项具体类型
 *
 * 此类型需要与ApiResponse结合使用，以下范例表示接收到一个string[]类型的列表分页接口
 *
 * ```
 * ApiResponse<PageResp<string>>
 * ```
 */
export interface PageResp<T> {
  result: T[]
  total: number
}

/**
 * 分页请求类型封装
 *
 * 遇到分页请求，请集成次类型，范例如下
 *
 * ```
 * interface FruitListReq extends PageReq {
 *    color: string
 * }
 * ```
 * 这个相当于
 * ```
 * interface FruitListReq  {
 *    color: string
 *    pageIndex: number
 *    pageSize: number
 * }
 * ```
 */
export interface PageReq {
  pageIndex?: number
  pageSize?: number
}

/** 发苗功能终端响应体 */
export interface FMApiResponse<T = null> {
  data: T
  isSuccess: boolean
  message: string
}
