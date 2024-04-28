/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 基础api地址 */
  VITE_ApiBaseUrl: string
  /** 接口请求超时时间 */
  VITE_ApiTimeOut: string

  /** websocket基础地址 */
  VITE_WS_BASE_URL: string
  /** websocket心跳消息 */
  VITE_WS_HEARTBEAT_MSG: string

  VITE_KEY_PASSWORD: string
  VITE_IV: string
}
