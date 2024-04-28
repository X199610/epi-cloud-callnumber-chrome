import { WsMessageContent } from '@/ws/WorkBenchWs/types'
import { QueueBtnItem } from '../../types'

export interface QueueAndTableDataItem extends QueueBtnItem {
  title: string
}

export type TableRowItem = WsMessageContent
