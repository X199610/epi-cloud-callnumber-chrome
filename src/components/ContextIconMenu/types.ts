export interface ActionItem<T = DOMStringMap> {
  /** 菜单名称 */
  title: string
  /** 图标 */
  imagePath?: string
  imageActivePath?: string
  /** 菜单快捷键说明 */
  shortcut?: string
  /**
   * 点击菜单后的回调函数
   *
   * 通过对右键菜单的区域添加 dataset 拿到对应数据
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
   */
  callBack: (dataset?: T) => void
}

export type HTMLElementEvent<T extends HTMLElement> = Event & {
  target: T
  currentTarget: T
}
