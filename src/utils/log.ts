import Global from '@/config/global'
/**
 * 日志工具类
 */
class Log {
  static get d(): typeof console.log {
    if (Global.env === 'development') {
      return console.log
    }
    return (..._: any[]) => {}
  }

  static get e(): typeof console.error {
    return console.error
  }

  static get w(): typeof console.warn {
    return console.warn
  }  
  
  static get r(): typeof console.warn {
    return console.dir
  }
}

export default Log
