import { ApiResponse } from '@/api/types'
import { BadgeTextMessage, QueryInfoMessage, ServiceMessage, ServiceMessageType } from '@/serviceWorker/types'

export function isBadgeTextMessage(object: ServiceMessage): object is ServiceMessage<BadgeTextMessage> {
  return object.type === ServiceMessageType.BADGE_TEXT
}

export function isQueryInfoMessage(object: ServiceMessage): object is ServiceMessage<QueryInfoMessage> {
  return object.type === ServiceMessageType.QUERY_INFO
}

/**
 * 判断是否是规范的公卫接口返回结构
 */
export function isApiResponse(object?: any): object is ApiResponse {
  if (!object) return false
  return object.code != null && object.success != null && object.msg != null
}
