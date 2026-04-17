import { ref, watch, computed, onMounted, reactive } from 'vue'
import { icon } from '@/plugins'
import { renderLang, renderIcon } from '@/utils'
import { themeColor, setItem, getCharts } from './useLayout.hook'
import {
  PackagesCategoryEnum,
  PackagesCategoryName,
  ConfigType,
  CustomChartConfig,
  CustomChartCategoryEnum,
  CustomChartCategoryEnumName
} from '@/packages/index.d'
import { usePackagesStore } from '@/store/modules/packagesStore/packagesStore'
import { ChartLayoutStoreEnum } from '@/store/modules/chartLayoutStore/chartLayoutStore.d'
// 图标
const { AirPlaneOutlineIcon, ImageIcon, BarChartIcon, ColorPaletteOutlineIcon } = icon.ionicons5
const { TableSplitIcon, RoadmapIcon, SpellCheckIcon, GraphicalDataFlowIcon } = icon.carbon

// 图表
export type MenuOptionsType = {
  key: string
  icon: ReturnType<typeof renderIcon>
  label: ReturnType<typeof renderLang>
  list: ConfigType[]
}

const packagesListObj = {
  [PackagesCategoryEnum.CHARTS]: {
    icon: renderIcon(RoadmapIcon),
    label: PackagesCategoryName.CHARTS
  },
  [PackagesCategoryEnum.INFORMATIONS]: {
    icon: renderIcon(SpellCheckIcon),
    label: PackagesCategoryName.INFORMATIONS
  },
  [PackagesCategoryEnum.TABLES]: {
    icon: renderIcon(TableSplitIcon),
    label: PackagesCategoryName.TABLES
  },
  [PackagesCategoryEnum.DECORATES]: {
    icon: renderIcon(GraphicalDataFlowIcon),
    label: PackagesCategoryName.DECORATES
  },
  [PackagesCategoryEnum.PHOTOS]: {
    icon: renderIcon(ImageIcon),
    label: PackagesCategoryName.PHOTOS
  },
  [PackagesCategoryEnum.ICONS]: {
    icon: renderIcon(AirPlaneOutlineIcon),
    label: PackagesCategoryName.ICONS
  },
  [PackagesCategoryEnum.CUSTOM]: {
    icon: renderIcon(ColorPaletteOutlineIcon),
    label: PackagesCategoryName.CUSTOM
  }
}

const customChartToConfigType = (customChart: CustomChartConfig): ConfigType => {
  return {
    key: `Custom_${customChart.id}`,
    chartKey: 'VCustomChart',
    conKey: 'VCCustomChart',
    title: customChart.name,
    category: CustomChartCategoryEnum.CUSTOM,
    categoryName: CustomChartCategoryEnumName.CUSTOM,
    package: PackagesCategoryEnum.CUSTOM,
    chartFrame: 'echarts',
    image: customChart.previewImage || '',
    redirectComponent: 'Custom/CustomCharts/CustomChart',
    dataset: customChart.dataset
  }
}

export const useAsideHook = () => {
  const packagesStore = usePackagesStore()
  const menuOptions: MenuOptionsType[] = []

  const getCustomChartList = (): ConfigType[] => {
    return packagesStore.getCustomCharts.map(customChartToConfigType)
  }

  // 处理列表
  const handlePackagesList = () => {
    for (const val in packagesStore.getPackagesList) {
      // 跳过空的自定义分类，将在后面单独处理
      if (val === PackagesCategoryEnum.CUSTOM) continue

      menuOptions.push({
        key: val,
        // @ts-ignore
        icon: packagesListObj[val].icon,
        // @ts-ignore
        label: packagesListObj[val].label,
        // @ts-ignore
        list: packagesStore.getPackagesList[val]
      })
    }

    // 处理自定义图表
    const customCharts = getCustomChartList()
    if (customCharts.length > 0) {
      menuOptions.push({
        key: PackagesCategoryEnum.CUSTOM,
        // @ts-ignore
        icon: packagesListObj[PackagesCategoryEnum.CUSTOM].icon,
        // @ts-ignore
        label: packagesListObj[PackagesCategoryEnum.CUSTOM].label,
        list: customCharts
      })
    }
  }

  // 记录选中值
  let beforeSelect: string = ''
  const selectValue = ref<string>('')

  // 选中的对象值
  const selectOptions = ref<any>(null)

  // 初始化
  const initMenuOptions = () => {
    packagesStore.loadCustomCharts()
    menuOptions.length = 0
    handlePackagesList()

    if (menuOptions.length > 0) {
      beforeSelect = menuOptions[0]['key']
      selectValue.value = menuOptions[0]['key']
      selectOptions.value = menuOptions[0]
    }
  }

  initMenuOptions()

  // 点击 item
  const clickItemHandle = (key: string, item: any) => {
    selectOptions.value = item
    // 处理折叠
    if (beforeSelect === key) {
      setItem(ChartLayoutStoreEnum.CHARTS, !getCharts.value, false)
    } else {
      setItem(ChartLayoutStoreEnum.CHARTS, true, false)
    }
    beforeSelect = key
  }

  return {
    getCharts,
    BarChartIcon,
    themeColor,
    selectOptions,
    selectValue,
    clickItemHandle,
    menuOptions
  }
}
