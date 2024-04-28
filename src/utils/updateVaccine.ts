import { isEmpty } from 'lodash-es'
import {
  GetDrugStockList,
  devqueryVaccineProductInfoByTimeStamp,
  proqueryVaccineProductInfoByTimeStamp,
} from '@/api/uc/vaccineProductInfo'
import Log from './log'
import StorageUtil from './storage'
import { GetVaccineProductInfoResData } from '@/api/uc/vaccineProductInfo/types'
import { takeNextSerialNumber } from '@/api/child/queuePlusIn'
import { current_register } from '@/api/biz-vaccine/vaccine-vaccination'
import { CurrentRegisterReq, LocalFinallResData } from '@/api/biz-vaccine/vaccine-vaccination/types'
import globalConfig from '@/config/global'
import vaccine from '@/vaccine.json'

// 本地
export async function devUpdateVaccine() {
  // 获取疫苗数据-mock
  // const { data } = vaccine.data
  // 获取疫苗数据-本地
  const { data } = await devqueryVaccineProductInfoByTimeStamp()
  //获取疫苗数据-线上
  // const { data } = await proqueryVaccineProductInfoByTimeStamp()

  // 获取疫苗库存
  const lastData = (await fetchGetDrugStockList(data)) ? await fetchGetDrugStockList(data) : data

  lastData.map((item: any) => {
    item.cndc = item.drugNo

    if (item.category === '非免规') {
      item.categoryDesc = '非免疫规划疫苗'
    }

    if (item.category === '免规') {
      item.categoryDesc = '免疫规划疫苗'
    }
  })

  if (!isEmpty(lastData)) {
    await StorageUtil.setItem('allVaccineInfo', lastData)
  } else {
    await StorageUtil.setItem('allVaccineInfo', [])
  }
  return lastData
}

// 线上
export async function proUpdateVaccine() {
  //获取疫苗数据-线上
  const { data } = await proqueryVaccineProductInfoByTimeStamp()

  // 获取疫苗库存
  const lastData = (await fetchGetDrugStockList(data)) ? await fetchGetDrugStockList(data) : data

  lastData.map((item: any) => {
    item.cndc = item.drugNo
    if (item.category === '非免规') {
      item.categoryDesc = '非免疫规划疫苗'
    }

    if (item.category === '免规') {
      item.categoryDesc = '免疫规划疫苗'
    }
  })

  if (!isEmpty(lastData)) {
    await StorageUtil.setItem('allVaccineInfo', lastData)
  } else {
    await StorageUtil.setItem('allVaccineInfo', [])
  }
  return lastData
}

/** 获取疫苗库存 */
export async function fetchGetDrugStockList(vaccInfoData: GetVaccineProductInfoResData[]) {
  const resData = await GetDrugStockList({
    TimeStamp: new Date().getTime().toString(),
  })

  if (resData.status === 200) {
    const filteredArray = vaccInfoData.filter((mainItem) =>
      resData.data.Data.DrugInventorySumList.some((filterItem: any) => filterItem.DrugNo === mainItem.drugNo)
    )
    return filteredArray
  } else {
    return vaccInfoData
  }
}

// 自助取号-开发
export async function devTakeNextSerialNumber() {
  await takeNextSerialNumber({
    channelId: 'B06B8B46EEC1452F8184644E3A2C8A24',
    deptId: '8a40f5f65c5c11ee9464b8cef6b428f8',
    code: '00000000',
  })
}

// 自助取号-真线
export async function proTakeNextSerialNumber() {
  await takeNextSerialNumber({
    channelId: '1BE21F3CAA9C4430A6214192E06B4305',
    deptId: '011365db7bbf11eeb0d46805cab65a68',
    code: '00000000',
  })
}

// 获取疫苗登记数据
export async function fetchCurrentRegister(childCode: string) {
  // 部门code
  let deptCode = null

  if (globalConfig.env == 'development') {
    // 浙江-杭州-贝瑞斯门诊-测试
    deptCode = '330102004002'
  } else {
    // 浙江-温州-郭溪门诊-真线
    deptCode = '330304034001'
  }

  if (childCode) {
    const params: CurrentRegisterReq = {
      // 时间戳
      timestamp: new Date().getTime().toString(),
      //个案编码
      childCode: childCode,
      // 状态2是今日登记
      status: '2',
      // 部门code
      deptCode: deptCode,
    }
    const response = await current_register(params)

    jiaoYanSatus(response.result)

    const localFinallData: LocalFinallResData[] = []

    response.result.map((item, i) => {
      localFinallData.push({
        dosage: undefined,
        enterpriseName: undefined,
        regDate: undefined,
        type: undefined,
        vaccName: undefined,
        zcyName: undefined,
        categoryDesc: undefined,
        vaccinePrice: undefined,
      })
      localFinallData[i].dosage = item.needleNum.toString()
      localFinallData[i].enterpriseName = item.manufacturerName
      localFinallData[i].regDate = item.registrationDate
      localFinallData[i].type = item.vaccineTypeName
      localFinallData[i].vaccName = item.vaccineMinorNameShort
      localFinallData[i].zcyName = item.vaccineMinorNameShort + '|' + item.manufacturerName
      localFinallData[i].categoryDesc = item.categoryDesc
      localFinallData[i].vaccinePrice = item.vaccinePrice
    })

    if (await StorageUtil.getItem('allVaccineInfo')) {
      let allVaccineInfo = await StorageUtil.getItem('allVaccineInfo')
      // 创建一个空数组来存储匹配的结果
      let matchedArray: Array<Record<string, string>> = []
      // 遍历数组B，对于每个元素，检查其name是否在数据A中存在
      if (allVaccineInfo && allVaccineInfo.length > 0) {
        allVaccineInfo.forEach((itemB) => {
          const found = localFinallData.find((itemA) => itemA.zcyName === itemB.zcyName)
          if (found) {
            // 如果找到了匹配的name，则合并相关信息并添加到matchedArray中
            matchedArray.push({
              // ...found, // 包含数据A中找到的匹配项的所有字段
              ...itemB,
            })
          }
        })
      }

      await StorageUtil.setItem('LocalFinallData', localFinallData)

      console.log(matchedArray, '登记的疫苗')

      let uniqueArray: Record<string, string>[] = []

      let allUniqueArray: Record<string, string>[] = []

      uniqueArray = uniqueByName(matchedArray)

      Log.d(uniqueArray, 6767676767666666666666666666)
      return uniqueArray
    }
  }
}

async function jiaoYanSatus(arr: any[]) {
  let isVaccStatus = '1'

  let allVaccineInfo = (await StorageUtil.getItem('allVaccineInfo')) || []
  if (arr.length > 0) {
    isVaccStatus = '2'
    arr.map((itemA) => {
      let _zcyName = itemA.vaccineMinorNameShort + '|' + itemA.manufacturerName
      allVaccineInfo.map((itemB) => {
        if (_zcyName === itemB.zcyName) {
          isVaccStatus = '3'
        }
      })
    })
  }

  await StorageUtil.setItem('storgeVaccStatus', isVaccStatus)
}

function uniqueByName(arr: any[]) {
  // 创建一个空的映射对象用于跟踪已经遇到的name
  const zcyName = new Set()
  return arr.filter((item) => {
    if (!zcyName.has(item.zcyName)) {
      zcyName.add(item.zcyName)
      return true
    }
    return false
  })
}
