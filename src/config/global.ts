type ENV = 'development' | 'production'

const globalConfig = {
  /** 公共基础路径 */
  publicBasePath: import.meta.env.BASE_URL,
  /** 当前环境 */
  env: import.meta.env.MODE as ENV,
  /** 基础api地址 */
  apiBaseUrl: import.meta.env.VITE_ApiBaseUrl,
  /** 接口超时时间 */
  apiTimeOut: parseInt(import.meta.env.VITE_ApiTimeOut),

  /** websocket基础地址 */
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL,
  /** websocket心跳消息 */
  wsHeartbeatMsg: import.meta.env.VITE_WS_HEARTBEAT_MSG,

  keyPassword: import.meta.env.VITE_KEY_PASSWORD,
  iv: import.meta.env.VITE_IV,
}

export default globalConfig
