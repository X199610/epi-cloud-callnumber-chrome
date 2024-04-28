import { message, MessageArgsProps } from 'ant-design-vue'

/** 项目统一toast显示Key，统一使用此key可避免toast重复显示 */
export const msgKey = 'msg'
const className = 'ant-msg'

/**
 * toast显示工具类
 */
class Msg {
  static info(content: MessageArgsProps, duration: number = 2) {
    if (!content.content) {
      content.content = '未知消息'
    }
    return message.info(
      {
        key: content.key || msgKey,
        class: content.class || className,
        ...content,
      },
      duration
    )
  }
  static success(content: MessageArgsProps, duration: number = 2) {
    if (!content.content) {
      content.content = '未知消息'
    }
    return message.success(
      {
        key: content.key || msgKey,
        class: content.class || className,
        ...content,
      },
      duration
    )
  }
  static error(content: MessageArgsProps, duration: number = 2) {
    if (!content.content) {
      content.content = '未知错误'
    }
    return message.error(
      {
        key: content.key || msgKey,
        class: content.class || className,
        ...content,
      },
      duration
    )
  }
  static warn(content: MessageArgsProps, duration: number = 2) {
    if (!content.content) {
      content.content = '未知消息'
    }
    return message.warn(
      {
        key: content.key || msgKey,
        class: content.class || className,
        ...content,
      },
      duration
    )
  }
  static loading(content: MessageArgsProps, duration: number = 2) {
    if (!content.content) {
      content.content = '未知消息'
    }
    return message.loading(
      {
        key: content.key || msgKey,
        class: content.class || className,
        ...content,
      },
      duration
    )
  }
}

export default Msg
