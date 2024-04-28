import { LoginReq } from '@/api/auth/oauth/types'

export type LoginFormData = Required<Pick<LoginReq, 'username' | 'password'>>
