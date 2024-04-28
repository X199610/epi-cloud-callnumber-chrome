export interface LoginReq {
  username?: string
  password?: string
  refresh_token?: string
  type: 'password' | 'refresh_token'
}

export interface TokenInfo {
  access_token: string
  expires_in: string
  refresh_token: string
  scope: string
  token_type: string
}
