import dayjs, { Dayjs } from 'dayjs'

export interface IdentityCardInfo {
  /** 性别 */
  sex: string
  /** 户籍地址省市区编码组 */
  address: string[]
  /** 生日 */
  birthday: string
  /** 派出所编号 */
  policeStationCode: string
  /** 原身份证 */
  cardId: string
}

/** 验证身份证的正则表达式 */
export const identityCardReg =
  /^\d{6}((((((19|20)\d{2})(0[13-9]|1[012])(0[1-9]|[12]\d|30))|(((19|20)\d{2})(0[13578]|1[02])31)|((19|20)\d{2})02(0[1-9]|1\d|2[0-8])|((((19|20)([13579][26]|[2468][048]|0[48]))|(2000))0229))\d{3})|((((\d{2})(0[13-9]|1[012])(0[1-9]|[12]\d|30))|((\d{2})(0[13578]|1[02])31)|((\d{2})02(0[1-9]|1\d|2[0-8]))|(([13579][26]|[2468][048]|0[048])0229))\d{2}))(\d|X|x)$/

/**
 * 身份证解析函数
 *
 * 主要用来通过身份证号码获取一些人物的基本信息
 *
 * @param cardId 身份证号码
 */
export function getIdentityCardInfo(cardId: string): IdentityCardInfo {
  if (!identityCardReg.test(cardId)) {
    return {
      sex: '',
      address: [],
      birthday: '',
      policeStationCode: '',
      cardId: '',
    }
  }

  const addressData = cardId.slice(0, 6)
  const birthDayData = cardId.slice(6, 14)
  const sexData = cardId.slice(16, 17)

  return {
    sex: Number(sexData) % 2 === 1 ? '1' : '2',
    address: [`${addressData.slice(0, 2)}0000000`, `${addressData.slice(0, 4)}00000`, `${addressData.slice(0, 6)}000`],
    birthday: dayjs(birthDayData).format('YYYY-MM-DD'),
    policeStationCode: cardId.slice(14, 16),
    cardId,
  }
}
