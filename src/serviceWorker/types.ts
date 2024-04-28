export enum BadgeText {
  OFF = 'OFF',
  ON = 'ON',
}
export const BadgeTextKV: Record<BadgeText, string> = {
  [BadgeText.OFF]: '隐藏',
  [BadgeText.ON]: '开启',
}

export enum ServiceMessageType {
  BADGE_TEXT,
  QUERY_INFO,
  AXIOS_REQ
}

export interface BadgeTextMessage {
  badgeText: BadgeText
}

export interface QueryInfoMessage {
  page: number
  size: number
}

export interface ServiceMessage<T = any> {
  type: ServiceMessageType
  msgInfo: T
}
