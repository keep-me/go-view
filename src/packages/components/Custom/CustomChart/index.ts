import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { CustomChartCategoryEnum, CustomChartCategoryEnumName } from '@/packages/index.d'

export const CustomChartConfig: ConfigType = {
  key: 'CustomChart',
  chartKey: 'VCustomChart',
  conKey: 'VCCustomChart',
  title: '自定义图表',
  category: CustomChartCategoryEnum.CUSTOM,
  categoryName: CustomChartCategoryEnumName.CUSTOM,
  package: PackagesCategoryEnum.CUSTOM,
  chartFrame: ChartFrameEnum.ECHARTS,
  image: ''
}
