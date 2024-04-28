export interface UserInfo {
  birthday?: string
  /** 单位名称 */
  deptDesc: string
  /** 单位编号 */
  deptId: string
  deptType?: string
  education?: string
  email?: string
  fullOrPart?: string
  id: string
  idNo?: string
  imageUrl?: string
  isTop?: string
  jobTitle?: string
  mobileNo?: string
  name?: string
  navigationSwitch?: string
  personId?: string
  personName?: string
  phoneNoSwitch?: string
  qualify?: string
  roleId?: string
  roleName?: string
  sex?: string
  status?: string
  sysRoleVoList?: SysRoleVoList[]
  tipSwitch?: string
  /** 用户名 */
  userName: string
  workGroupId?: string
  workGroupName?: string
  wxId?: string
}

export interface SysRoleVoList {
  createTime?: string
  id?: string
  idArr?: string[]
  onlySuperAdmin?: string
  roleCode?: string
  roleDesc?: string
  roleName?: string
  sorted?: number
  status?: string
  workGroupId?: string
  workGroupName?: string
}
