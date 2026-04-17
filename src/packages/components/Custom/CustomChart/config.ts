import { echartOptionProfixHandle, PublicConfigClass } from '@/packages/public'
import { CustomChartConfig } from './index'
import { CreateComponentType } from '@/packages/index.d'
import cloneDeep from 'lodash/cloneDeep'

export const includes = ['legend', 'xAxis', 'yAxis', 'grid', 'title', 'tooltip']

export const defaultOption = {
  backgroundColor: 'rgba(0,0,0,0)',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110, 130]
    }
  ]
}

export const defaultDataset = {
  dimensions: ['product', 'sales'],
  source: [
    { product: 'Mon', sales: 120 },
    { product: 'Tue', sales: 200 },
    { product: 'Wed', sales: 150 },
    { product: 'Thu', sales: 80 },
    { product: 'Fri', sales: 70 },
    { product: 'Sat', sales: 110 },
    { product: 'Sun', sales: 130 }
  ]
}

export default class Config extends PublicConfigClass implements CreateComponentType {
  public key = CustomChartConfig.key
  public chartConfig = cloneDeep(CustomChartConfig)
  public option = echartOptionProfixHandle(cloneDeep(defaultOption), includes)
}
