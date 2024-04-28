import { createApp } from 'vue'
import App from './App.vue'

import './reset.scss'
import { create } from '@/utils/DomUtil'

// ;(() => {
//   const container = create('i', 'ad-intercept-chrome-extension-demo')
//   const root = document.createElement('div')
//   const styleEl = document.createElement('link')
//   const shadowDOM = container.attachShadow?.({ mode: 'open' }) || container
//   styleEl.setAttribute('rel', 'stylesheet')
//   styleEl.setAttribute('href', chrome.runtime.getURL('/src/contentScript/reset.scss'))
//   shadowDOM.appendChild(styleEl)
//   shadowDOM.appendChild(root)
//   document.body.appendChild(container)

//   createApp(App).mount(root)
// })()

createApp(App).mount('#ad-intercept-chrome-extension-demo')
