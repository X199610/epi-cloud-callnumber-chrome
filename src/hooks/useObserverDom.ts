class Observer {
  timer: NodeJS.Timeout | null = null
  loopFun: () => void

  constructor(call: () => void) {
    this.loopFun = call
  }

  disconnect() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  observe(target: any, options?: MutationObserverInit) {
    this.timer && this.disconnect()
    this.timer = setInterval(() => {
      this.loopFun()
    }, 1000)
  }
}

export default Observer
