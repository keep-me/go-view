import { ChartList } from '@/packages/components/Charts/index'
import { DecorateList } from '@/packages/components/Decorates/index'
import { InformationList } from '@/packages/components/Informations/index'
import { TableList } from '@/packages/components/Tables/index'
import { PhotoList } from '@/packages/components/Photos/index'
import { IconList } from '@/packages/components/Icons/index'
import {
  PackagesCategoryEnum,
  PackagesType,
  ConfigType,
  FetchComFlagType,
  CustomChartConfig
} from '@/packages/index.d'
import { usePackagesStore } from '@/store/modules/packagesStore/packagesStore'
import { ChartFrameEnum, CustomChartCategoryEnum, CustomChartCategoryEnumName } from '@/packages/index.d'
import { PublicConfigClass, echartOptionProfixHandle } from '@/packages/public'
import cloneDeep from 'lodash/cloneDeep'

const configModules: Record<string, { default: string }> = import.meta.glob('./components/**/config.vue', {
  eager: true
})
const indexModules: Record<string, { default: string }> = import.meta.glob('./components/**/index.vue', {
  eager: true
})
const imagesModules: Record<string, { default: string }> = import.meta.glob('../assets/images/chart/**', {
  eager: true
})

// 从自定义图表配置转换为 ConfigType
export const customChartToConfigType = (customChart: CustomChartConfig): ConfigType => {
  return {
    key: `Custom_${customChart.id}`,
    chartKey: `VCustomChart`,
    conKey: `VCCustomChart`,
    title: customChart.name,
    category: CustomChartCategoryEnum.CUSTOM,
    categoryName: CustomChartCategoryEnumName.CUSTOM,
    package: PackagesCategoryEnum.CUSTOM,
    chartFrame: ChartFrameEnum.ECHARTS,
    image: customChart.previewImage || '',
    dataset: customChart.dataset,
    redirectComponent: 'Custom/CustomChart/CustomChart'
  }
}

// 获取自定义图表列表
export const getCustomChartList = (): ConfigType[] => {
  const packagesStore = usePackagesStore()
  return packagesStore.getCustomCharts.map(customChartToConfigType)
}

// * 所有图表
export let packagesList: PackagesType = {
  [PackagesCategoryEnum.CHARTS]: ChartList,
  [PackagesCategoryEnum.INFORMATIONS]: InformationList,
  [PackagesCategoryEnum.TABLES]: TableList,
  [PackagesCategoryEnum.DECORATES]: DecorateList,
  [PackagesCategoryEnum.PHOTOS]: PhotoList,
  [PackagesCategoryEnum.ICONS]: IconList,
  [PackagesCategoryEnum.CUSTOM]: []
}

// 组件缓存, 可以大幅度提升组件加载速度
const componentCacheMap = new Map<string, any>()
const loadConfig = (packageName: string, categoryName: string, keyName: string) => {
  const key = packageName + categoryName + keyName
  if (!componentCacheMap.has(key)) {
    componentCacheMap.set(key, import(`./components/${packageName}/${categoryName}/${keyName}/config.ts`))
  }
  return componentCacheMap.get(key)
}

// 自定义图表配置类
class CustomChartConfigClass extends PublicConfigClass {
  public key = 'CustomChart'
  public chartConfig = {
    key: 'CustomChart',
    chartKey: 'VCustomChart',
    conKey: 'VCCustomChart',
    title: '自定义图表',
    category: 'CustomCharts',
    categoryName: '自定义图表',
    package: PackagesCategoryEnum.CUSTOM,
    chartFrame: ChartFrameEnum.ECHARTS,
    image: ''
  }
  public option: any = {}
}

// 根据自定义图表ID获取配置
const getCustomChartById = (chartId: string): CustomChartConfig | undefined => {
  const packagesStore = usePackagesStore()
  return packagesStore.getCustomChartById(chartId)
}

/**
 * * 获取目标组件配置信息
 * @param targetData
 */
export const createComponent = async (targetData: ConfigType) => {
  const { redirectComponent, category, key, chartConfig } = targetData

  // 处理自定义图表 - 检测 key 或 chartKey 是否以 Custom_ 开头
  if (key?.startsWith('Custom_') || chartConfig?.chartKey === 'VCustomChart') {
    // 提取自定义图表 ID
    let chartId = ''
    if (key?.startsWith('Custom_')) {
      chartId = key.replace('Custom_', '')
    }

    // 创建基于 CustomChartConfigClass 的实例
    const instance = new CustomChartConfigClass()

    // 如果找到了对应的自定义图表配置，合并配置
    if (chartId) {
      const customChart = getCustomChartById(chartId)
      if (customChart) {
        instance.key = key
        instance.chartConfig = {
          ...instance.chartConfig,
          key: key,
          title: customChart.name
        }
        // 应用自定义 ECharts 配置
        const includes = ['legend', 'xAxis', 'yAxis', 'grid', 'title', 'tooltip', 'toolbox']
        instance.option = echartOptionProfixHandle(cloneDeep(customChart.option), includes)

        // 应用自定义数据集
        if (customChart.dataset) {
          instance.option.dataset = cloneDeep(customChart.dataset)
        }
      }
    }

    return instance
  }

  // redirectComponent 是给图片组件库和图标组件库使用的
  if (redirectComponent) {
    const [packageName, categoryName, keyName] = redirectComponent.split('/')
    const redirectChart = await loadConfig(packageName, categoryName, keyName)
    return new redirectChart.default()
  }
  const chart = await loadConfig(targetData.package, category, key)
  return new chart.default()
}

/**
 * * 获取组件
 * @param {string} chartName 名称
 * @param {FetchComFlagType} flag 标识 0为展示组件, 1为配置组件
 */
const fetchComponent = (chartName: string, flag: FetchComFlagType) => {
  const module = flag === FetchComFlagType.VIEW ? indexModules : configModules
  for (const key in module) {
    const urlSplit = key.split('/')
    if (urlSplit[urlSplit.length - 2] === chartName) {
      return module[key]
    }
  }
}

/**
 * * 获取展示组件
 * @param {ConfigType} dropData 配置项
 */
export const fetchChartComponent = (dropData: ConfigType) => {
  const { key, chartKey } = dropData

  // 处理自定义图表
  if (key?.startsWith('Custom_') || chartKey === 'VCustomChart') {
    return fetchComponent('CustomChart', FetchComFlagType.VIEW)?.default
  }

  return fetchComponent(key, FetchComFlagType.VIEW)?.default
}

/**
 * * 获取配置组件
 * @param {ConfigType} dropData 配置项
 */
export const fetchConfigComponent = (dropData: ConfigType) => {
  const { key, conKey } = dropData

  // 处理自定义图表
  if (key?.startsWith('Custom_') || conKey === 'VCCustomChart') {
    return fetchComponent('CustomChart', FetchComFlagType.CONFIG)?.default
  }

  return fetchComponent(key, FetchComFlagType.CONFIG)?.default
}

/**
 * * 获取图片内容
 * @param {ConfigType} targetData 配置项
 */
export const fetchImages = async (targetData?: ConfigType) => {
  if (!targetData) return ''
  // 正则判断图片是否为 url，是则直接返回该 url
  if (/^(http|https):\/\/([\w.]+\/?)\S*/.test(targetData.image)) return targetData.image
  // 新数据动态处理
  const { image } = targetData
  // 兼容旧数据
  if (image.includes('@') || image.includes('base64')) return image

  const imageName = image.substring(image.lastIndexOf('/') + 1)
  for (const key in imagesModules) {
    const urlSplit = key.split('/')
    if (urlSplit[urlSplit.length - 1] === imageName) {
      return imagesModules[key]?.default
    }
  }
  return ''
}
