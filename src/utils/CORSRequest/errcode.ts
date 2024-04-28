export enum ErrCode {
  /** 操作成功 */
  SUCCESS = 200,
  /** 不存在该资源 */
  NOT_FOUND = 404,
  /** 抱歉，没有访问权限！ */
  UNAUTHORIZED = 401,
  /** 访问妥限 */
  FORBIDDEN = 403,
  /** 系统内部错误 */
  SYS_ERROR_1 = 500,
  SYS_ERROR_2 = 503,
  SYS_ERROR_3 = 406,
  SYS_ERROR_4 = 400,
  SYS_ERROR_5 = 504,
}

export const errCodeMsgKV: Record<ErrCode, string> = {
  [ErrCode.SUCCESS]: '请求成功',
  [ErrCode.NOT_FOUND]: '',
  [ErrCode.UNAUTHORIZED]: '抱歉，没有访问权限！',
  [ErrCode.FORBIDDEN]: '抱歉，禁止访问此资源！',
  [ErrCode.SYS_ERROR_1]: '500-系统内部错误',
  [ErrCode.SYS_ERROR_2]: '503-系统内部错误',
  [ErrCode.SYS_ERROR_3]: '登录已过期，请重新登录',
  [ErrCode.SYS_ERROR_4]: '服务器无法理解此请求',
  [ErrCode.SYS_ERROR_5]: '网关超时',
}
