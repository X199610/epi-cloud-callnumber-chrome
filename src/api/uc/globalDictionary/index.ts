import { ApiResponse } from '@/api/types'
import { service } from '@/utils/CORSRequest'

import { GetGlobalDictionaryByTypeReq, GetGlobalDictionaryByTypeRes } from './types'

export enum UcGlobalDictionaryApi {
  /** 根据字典类查询所有字典值 */
  GET_GLOBAL_DICTIONARY_BY_TYPE = '/uc/globalDictionary/getGlobalDictionaryByType',
}

/** 根据字典类查询所有字典值 */
export function getGlobalDictionaryByType(params: GetGlobalDictionaryByTypeReq) {
  return service.get<ApiResponse<GetGlobalDictionaryByTypeRes[]>>(UcGlobalDictionaryApi.GET_GLOBAL_DICTIONARY_BY_TYPE, { params })
}
