import { PageReq } from '@/api/types'
import { StatusEnum } from '../types'

/** 根据字典类查询所有字典值(参数) */
export interface GetGlobalDictionaryByTypeReq extends PageReq {
  searchField?: string
  /** 字典类型名称 */
  typeName?: string
}

/** 根据字典类查询所有字典值(返回值) */
export interface GetGlobalDictionaryByTypeRes {
  /** 创建时间 */
  createTime: string
  /** 创建者 */
  createUser: string
  /** 主键，采用32位UUID */
  id: string
  idArr: []
  /** 字典键 */
  key: string
  /** 键说明 */
  keyDesc: string
  /** 修改时间 */
  modifyTime: string
  /** 修改者 */
  modifyUser: string
  /** 类型名称 */
  name: string
  personName: string
  /** 排序字段 */
  sort: number
  /** 状态 0-正常 1-禁用 2-删除 */
  status: StatusEnum
  /** 类型编号 */
  typeId: string
  userName: string
  /** 字典值 */
  value: string
}
