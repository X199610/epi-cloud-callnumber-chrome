import { GetOrdersResData } from '@/api/fetchSeedlings/types'

export interface OrderWsResData {
  type: 'delete' | 'order'
  data: GetOrdersResData
}
