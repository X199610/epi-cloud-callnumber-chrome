export async function query(queryInfo: chrome.tabs.QueryInfo) {
  return new Promise<chrome.tabs.Tab[]>((resolve, _reject) => {
    chrome.tabs.query(queryInfo, (tabs) => {
      resolve(tabs)
    })
  })
}
