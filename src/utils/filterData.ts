import dayjs from 'dayjs'
import StorageUtil from './storage'
import { SendOrderReq } from '@/api/fetchSeedlings/types'
import { GetVaccineProductInfoResData } from '@/api/uc/vaccineProductInfo/types'
import { VaccineVo } from '@/ws/WorkBenchWs/types'

interface ReturnSendOrderReqDataOpt extends Pick<SendOrderReq, 'patientName' | 'patientID' | 'queueNO'> {
  list: VaccineVo[]
}

export const returnSendOrderReqData = async (opt: ReturnSendOrderReqDataOpt): Promise<SendOrderReq> => {
  const {
    patientName, // 姓名
    patientID, // 个案编码
    queueNO, // 排队号码
    list,
  } = opt

  const code = !patientID || patientID == '00000000' ? '00000000' + String(Math.random()).slice(2, 12) : patientID

  const tableNum = await StorageUtil.getItem('tableNum')

  const allVaccineInfo = await StorageUtil.getItem('allVaccineInfo')

  const resData: SendOrderReq = {
    //接种号台
    stationNO: tableNum!,
    //处方单号 订单编号生成规则：个案号(18+位)+年月日(8位)+药品编号(cndc 11+位)+台号(2位)
    presNO: code + dayjs().format('YYYYMMDD') + list[0].cndc + 0 + tableNum,
    //病人姓名
    patientName: patientName || '',
    //病人年龄
    patientAge: '不详',
    //病人ID
    patientID: code,
    //排队号码
    queueNO,
    //药品信息
    orderDrugs: list.map((i) => {
      const { vaccineProductNameShort, minPackingQuantity, productionEnterpriseNameShort, id, productInfo } =
        allVaccineInfo?.find((i1) => i.cndc == i1.cndc) || ({} as GetVaccineProductInfoResData)
      return {
        //药品编号
        drugNo: i.cndc || '',
        //药品id
        drugId: id || '',
        //药品名称
        drugName: vaccineProductNameShort || '',
        //药品数量
        drugNumber: 1,
        //包装单位
        packagingUnit: '不详',
        //规格
        specifications: minPackingQuantity || '',
        //药品厂家
        drugFactory: productionEnterpriseNameShort || '',
        //剂次
        dosage: 1,
        //产品信息
        product: productInfo || '',
      }
    }),
  }
  return resData
}
