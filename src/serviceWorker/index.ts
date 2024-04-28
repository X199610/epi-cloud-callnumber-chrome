import Log from '@/utils/log'
import axios, { Options } from 'redaxios'
import { BadgeText, QueryInfoMessage, ServiceMessage, ServiceMessageType } from './types'
import { changeBadgeText, sendCurrentTabMessage } from './util'
import { ExtraGetVaccinesOptions } from '@/utils/CORSGetVaccinesRequest'
import { ExtraOptions } from '@/utils/CORSRequest'

/** 扩展安装完成回调 */
chrome.runtime.onInstalled.addListener(async () => {
  await changeBadgeText(BadgeText.ON, false)
  console.log('安装完成！')
})

// 处理redaxios库没有timeout
// https://github.com/developit/redaxios/issues/19
const fetchWithTimeout =
  (timeoutMs: number) =>
  (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    return fetch(input, {
      ...init,
      signal: abortFetchSignal(timeoutMs),
    })
  }
const abortFetchSignal = (timeoutMs: number) => {
  const abortController = new AbortController()
  setTimeout(() => abortController.abort(), timeoutMs)
  return abortController.signal
}

/** 接受信息 runtime.sendMessage */
// chrome.runtime.onMessage.addListener((m, s) => {
//   console.log('我是service_worker, 我收到了消息：', m)
// })

/** 接口拦截器 */
chrome.webRequest.onBeforeRequest.addListener(
  (e) => {
    // Log.d(e)
    if (e.url.includes('/EpiWebCloud/EpiChildWeb/epiMainProcess.action')) {
      const rawData = e.requestBody?.raw
      if (rawData) {
        const decoder = new TextDecoder('utf-8')
        const reqObj = JSON.parse(decoder.decode(rawData[0].bytes))
        // Log.d(reqObj)

        sendCurrentTabMessage<ServiceMessage<QueryInfoMessage>>({
          type: ServiceMessageType.QUERY_INFO,
          msgInfo: JSON.parse(decoder.decode(rawData[0].bytes)),
        })
      }
    }
  },
  { urls: ['<all_urls>'] },
  ['requestBody']
)

chrome.runtime.onMessage.addListener(
  (request: ServiceMessage<Options & ExtraGetVaccinesOptions & ExtraOptions>, sender, sendResponse) => {
    // console.log('我是service_worker, 我收到了消息：', request)
    switch (request.type) {
      case ServiceMessageType.AXIOS_REQ:
        ;(async () => {
          const resp = await axios({ ...request.msgInfo, fetch: fetchWithTimeout(request.msgInfo.timeout || 5000) }).catch(
            (err) => {
              if (err) {
                err?.config && (err.config = { ...request.msgInfo, ...err.config })
                sendResponse(err)
              } else {
                sendResponse({ success: false })
              }
            }
          )
          resp?.config && (resp.config = { ...request.msgInfo, ...resp.config })
          sendResponse(resp)
        })()
        break
      default:
        sendResponse({ success: false })
    }
    return true
  }
)
