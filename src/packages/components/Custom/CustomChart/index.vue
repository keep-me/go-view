<template>
  <v-chart ref="vChartRef" :init-options="initOptions" :theme="themeColor" :option="option" :manual-update="isPreview()"
    :update-options="{
      replaceMerge: replaceMergeArr
    }" autoresize></v-chart>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch, PropType } from 'vue'
import VChart from 'vue-echarts'
import { useCanvasInitOptions } from '@/hooks/useCanvasInitOptions.hook'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  FunnelChart,
  TreeChart,
  TreemapChart,
  GraphChart,
  HeatmapChart,
  SankeyChart,
  BoxplotChart,
  EffectScatterChart,
  ParallelChart
} from 'echarts/charts'
import {
  DatasetComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  ToolboxComponent,
  GeoComponent,
  SingleAxisComponent,
  PolarComponent,
  RadarComponent,
  DataZoomComponent,
  ParallelComponent
} from 'echarts/components'
import { mergeTheme } from '@/packages/public/chart'
import { useChartDataFetch } from '@/hooks'
import { CreateComponentType } from '@/packages/index.d'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { isPreview } from '@/utils'
import isObject from 'lodash/isObject'
import cloneDeep from 'lodash/cloneDeep'
import { usePackagesStore } from '@/store/modules/packagesStore/packagesStore'
import { getUUID } from '@/utils'

const props = defineProps({
  themeSetting: {
    type: Object,
    required: true
  },
  themeColor: {
    type: Object,
    required: true
  },
  chartConfig: {
    type: Object as PropType<CreateComponentType>,
    required: true
  }
})

const initOptions = useCanvasInitOptions(props.chartConfig.option, props.themeSetting)

use([
  CanvasRenderer,
  DatasetComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  ToolboxComponent,
  GeoComponent,
  SingleAxisComponent,
  PolarComponent,
  RadarComponent,
  DataZoomComponent,
  ParallelComponent,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  FunnelChart,
  TreeChart,
  TreemapChart,
  GraphChart,
  HeatmapChart,
  SankeyChart,
  BoxplotChart,
  EffectScatterChart,
  ParallelChart
])

const replaceMergeArr = ref<string[]>()
const packagesStore = usePackagesStore()

const includes = ['legend', 'xAxis', 'yAxis', 'grid', 'title', 'tooltip', 'toolbox']

const option = computed(() => {
  return mergeTheme(props.chartConfig.option, props.themeSetting, includes)
})

watch(
  () => props.chartConfig.option.dataset,
  (newData: { dimensions: any }, oldData) => {
    try {
      if (!isObject(newData) || !('dimensions' in newData)) return
      if (Array.isArray(newData?.dimensions)) {
        replaceMergeArr.value = ['series']
        nextTick(() => {
          replaceMergeArr.value = []
        })
      }
    } catch (error) {
      console.log(error)
    }
  },
  {
    deep: false
  }
)

const { vChartRef } = useChartDataFetch(props.chartConfig, useChartEditStore)
</script>
