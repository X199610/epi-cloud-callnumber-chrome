export enum HeaderKey {
  /** 内容数据类型头 */
  CONTENT_TYPE = 'Content-Type',
  /** token验证头 */
  AUTHORIZATION = 'Authorization',
  /**
   * Content-Disposition 响应头指示回复的内容该以何种形式展示
   * 是以内联的形式（即网页或者页面的一部分）
   * 还是以附件的形式下载并保存到本地。
   */
  CONTENT_DISPOSITION = 'Content-Disposition',
}

/**
 * 表单头
 */
export const formHeader = {
  [HeaderKey.CONTENT_TYPE]: 'application/x-www-form-urlencoded;charset=UTF-8',
}
