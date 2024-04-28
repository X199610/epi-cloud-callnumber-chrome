export interface ShengSuDomOption {
  /** 询问-input */
  inquiryInput: string
  /** 询问-table 用于选取后面的查询按钮元素 */
  inquiryTable: string

  /** 菜单容器 */
  menuListBox: string
  /** 目标菜单未选中 */
  targetMenuLabelDefault: string
  /** 目标菜单子节点 */
  targetMenuChild: string

  /** 登记-查询表单label */
  searchFormLabels: string
  /** 登记-查询按钮 */
  queryBtn: string

  /** 接种-input */
  inoculateInput: string
  /** 接种-table 用于选取后面的查询按钮元素 */
  inoculateTable: string

  /** 系统里所有的表单容器 */
  formBoxs: string
  /** 关于登记疫苗的表单容器 */
  vaccineFormBox: string
  /** 关于登记疫苗的表单容器label */
  vaccineFormLabels: string

  /** 系统的错误提示弹窗 */
  errDialog: string
  /** 是否自动关闭系统的错误提示弹窗 0-否 ，1-是 */
  isCloseErrDialog: '0' | '1'
  /** 关闭错误弹窗的图片 */
  closeErrDialog: string

  /** 登记为空号获取真实信息-弹窗 */
  dialog: string
  /** 询问为空号获取真实信息-表单div */
  formDivEle: string
}
