<template>
  <div class="custom-chart-edit">
    <n-layout has-sider>
      <n-layout-content>
        <n-card title="自定义图表编辑器" :bordered="false">
          <template #header-extra>
            <n-space>
              <n-button @click="previewChart">
                <template #icon><EyeOutlineIcon /></template>
                预览
              </n-button>
              <n-button type="primary" @click="saveChart">
                <template #icon><SaveOutlineIcon /></template>
                保存
              </n-button>
              <n-button @click="backToList">
                <template #icon><ArrowBackOutlineIcon /></template>
                返回
              </n-button>
            </n-space>
          </template>

          <n-form label-placement="left" :label-width="100">
            <n-form-item label="图表名称">
              <n-input v-model:value="chartForm.name" placeholder="请输入图表名称" />
            </n-form-item>
            <n-form-item label="图表描述">
              <n-input v-model:value="chartForm.description" type="textarea" placeholder="请输入图表描述" :rows="2" />
            </n-form-item>
          </n-form>

          <n-tabs type="line" animated>
            <n-tab-pane name="option" tab="ECharts 配置">
              <div class="editor-section">
                <n-space justify="space-between" style="margin-bottom: 12px">
                  <n-text strong>ECharts 配置 (JSON 格式)</n-text>
                  <n-space>
                    <n-button size="small" @click="formatOption">格式化</n-button>
                    <n-button size="small" @click="resetOption">重置为默认</n-button>
                  </n-space>
                </n-space>
                <div class="code-editor-wrapper">
                  <monaco-editor
                    v-model:value="optionString"
                    language="json"
                    :height="400"
                    :theme="isDark ? 'vs-dark' : 'vs'"
                    @change="handleOptionChange"
                  />
                </div>
              </div>
            </n-tab-pane>

            <n-tab-pane name="data" tab="数据集">
              <div class="editor-section">
                <n-space justify="space-between" style="margin-bottom: 12px">
                  <n-text strong>数据集配置 (JSON 格式)</n-text>
                  <n-button size="small" @click="formatDataset">格式化</n-button>
                </n-space>
                <div class="code-editor-wrapper">
                  <monaco-editor
                    v-model:value="datasetString"
                    language="json"
                    :height="250"
                    :theme="isDark ? 'vs-dark' : 'vs'"
                    @change="handleDatasetChange"
                  />
                </div>
                <n-text depth="3" style="margin-top: 8px; display: block">
                  数据集格式示例: { "dimensions": ["product", "sales"], "source": [{ "product": "A", "sales": 100 }] }
                </n-text>
              </div>
            </n-tab-pane>

            <n-tab-pane name="examples" tab="模板示例">
              <div class="examples-section">
                <n-text depth="3" style="margin-bottom: 16px; display: block">
                  点击下方示例可快速加载预设的 ECharts 配置
                </n-text>
                <n-grid :cols="3" :x-gap="16" :y-gap="16">
                  <n-gi v-for="template in chartTemplates" :key="template.name">
                    <n-card hoverable size="small" @click="loadTemplate(template)">
                      <template #header>
                        <n-text strong>{{ template.name }}</n-text>
                      </template>
                      <n-text depth="3">{{ template.description }}</n-text>
                    </n-card>
                  </n-gi>
                </n-grid>
              </div>
            </n-tab-pane>
          </n-tabs>
        </n-card>
      </n-layout-content>

      <n-layout-sider :width="400" bordered :native-scrollbar="false">
        <n-card title="实时预览" :bordered="false">
          <div class="preview-container">
            <div ref="previewChartRef" class="chart-preview">
              <v-chart
                v-if="currentOption"
                :option="currentOption"
                :init-options="initOptions"
                autoresize
              />
              <n-empty v-else description="配置无效，无法预览">
                <template #icon>
                  <n-icon size="48"><AlertCircleOutlineIcon /></n-icon>
                </template>
              </n-empty>
            </div>
          </div>
        </n-card>
      </n-layout-sider>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePackagesStore } from '@/store/modules/packagesStore/packagesStore'
import { CustomChartConfig, defaultOption, defaultDataset } from '@/packages/components/Custom/CustomChart/config'
import { CustomChartEnum } from '@/enums/pageEnum'
import { getUUID } from '@/utils'
import { useSettingStore } from '@/store/modules/settingStore/settingStore'
import { useCanvasInitOptions } from '@/hooks/useCanvasInitOptions.hook'
import VChart from 'vue-echarts'
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
  TreemapChart,
  GraphChart,
  HeatmapChart,
  SankeyChart
} from 'echarts/charts'
import {
  DatasetComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  ToolboxComponent,
  DataZoomComponent
} from 'echarts/components'
import {
  SaveOutlineIcon,
  EyeOutlineIcon,
  ArrowBackOutlineIcon,
  AlertCircleOutlineIcon
} from '@vicons/ionicons5'
import { MonacoEditor } from '@/components/Pages/MonacoEditor'
import cloneDeep from 'lodash/cloneDeep'

use([
  CanvasRenderer,
  DatasetComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  ToolboxComponent,
  DataZoomComponent,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  FunnelChart,
  TreemapChart,
  GraphChart,
  HeatmapChart,
  SankeyChart
])

const route = useRoute()
const router = useRouter()
const packagesStore = usePackagesStore()
const settingStore = useSettingStore()

const previewChartRef = shallowRef<HTMLElement | null>(null)
const chartForm = ref({
  name: '自定义图表',
  description: ''
})

const optionString = ref(JSON.stringify(defaultOption, null, 2))
const datasetString = ref(JSON.stringify(defaultDataset, null, 2))
const currentOption = ref<any>(null)
const optionError = ref(false)

const isDark = computed(() => settingStore.getDarkTheme)
const initOptions = useCanvasInitOptions({}, {})

const chartTemplates = [
  {
    name: '基础柱状图',
    description: '最常用的柱状图配置',
    option: {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [120, 200, 150, 80, 70, 110, 130] }]
    }
  },
  {
    name: '基础折线图',
    description: '带有平滑曲线的折线图',
    option: {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      yAxis: { type: 'value' },
      series: [{ type: 'line', smooth: true, data: [150, 230, 224, 218, 135, 147, 260] }]
    }
  },
  {
    name: '基础饼图',
    description: '带标签的圆形饼图',
    option: {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        type: 'pie',
        radius: '70%',
        data: [
          { value: 1048, name: '搜索引擎' },
          { value: 735, name: '直接访问' },
          { value: 580, name: '邮件营销' },
          { value: 484, name: '联盟广告' },
          { value: 300, name: '视频广告' }
        ],
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        }
      }]
    }
  },
  {
    name: '散点图',
    description: '用于展示数据分布的散点图',
    option: {
      tooltip: { trigger: 'item' },
      xAxis: { type: 'value' },
      yAxis: { type: 'value' },
      series: [{
        type: 'scatter',
        data: [[10, 20], [20, 30], [30, 15], [40, 25], [50, 35], [60, 20]]
      }]
    }
  },
  {
    name: '雷达图',
    description: '多维度数据展示的雷达图',
    option: {
      tooltip: {},
      legend: { data: ['预算分配', '实际开销'] },
      radar: {
        indicator: [
          { name: '销售', max: 100 },
          { name: '管理', max: 100 },
          { name: '技术', max: 100 },
          { name: '客服', max: 100 },
          { name: '研发', max: 100 },
          { name: '市场', max: 100 }
        ]
      },
      series: [{
        type: 'radar',
        data: [
          { value: [80, 70, 90, 85, 95, 88], name: '预算分配' },
          { value: [75, 65, 85, 80, 90, 82], name: '实际开销' }
        ]
      }]
    }
  },
  {
    name: '漏斗图',
    description: '展示数据转化过程的漏斗图',
    option: {
      tooltip: { trigger: 'item' },
      legend: { data: ['展现', '点击', '访问', '咨询', '订单'] },
      series: [{
        type: 'funnel',
        left: '10%',
        width: '80%',
        label: { position: 'inside' },
        emphasis: { label: { fontSize: 20 } },
        data: [
          { value: 100, name: '展现' },
          { value: 80, name: '点击' },
          { value: 60, name: '访问' },
          { value: 40, name: '咨询' },
          { value: 20, name: '订单' }
        ]
      }]
    }
  }
]

const updatePreview = () => {
  try {
    const option = JSON.parse(optionString.value)
    if (option.dataset) {
      delete option.dataset
    }
    try {
      const dataset = JSON.parse(datasetString.value)
      if (dataset.dimensions && dataset.source) {
        option.dataset = dataset
      }
    } catch (e) {
      // Dataset 解析失败，忽略
    }
    option.backgroundColor = 'rgba(0,0,0,0)'
    currentOption.value = option
    optionError.value = false
  } catch (e) {
    optionError.value = true
    console.error('Option JSON 解析错误:', e)
  }
}

const handleOptionChange = () => {
  updatePreview()
}

const handleDatasetChange = () => {
  updatePreview()
}

const formatOption = () => {
  try {
    const parsed = JSON.parse(optionString.value)
    optionString.value = JSON.stringify(parsed, null, 2)
  } catch (e) {
    window['$message'].error('JSON 格式错误，无法格式化')
  }
}

const formatDataset = () => {
  try {
    const parsed = JSON.parse(datasetString.value)
    datasetString.value = JSON.stringify(parsed, null, 2)
  } catch (e) {
    window['$message'].error('JSON 格式错误，无法格式化')
  }
}

const resetOption = () => {
  optionString.value = JSON.stringify(defaultOption, null, 2)
  datasetString.value = JSON.stringify(defaultDataset, null, 2)
  updatePreview()
}

const loadTemplate = (template: any) => {
  optionString.value = JSON.stringify(cloneDeep(template.option), null, 2)
  updatePreview()
  window['$message'].success(`已加载模板: ${template.name}`)
}

const saveChart = () => {
  if (!chartForm.value.name) {
    window['$message'].warning('请输入图表名称')
    return
  }

  try {
    const option = JSON.parse(optionString.value)
    try {
      const dataset = JSON.parse(datasetString.value)
      const chartId = route.params.id as string

      const existingChart = packagesStore.getCustomChartById(chartId)
      if (existingChart) {
        packagesStore.updateCustomChart(chartId, {
          name: chartForm.value.name,
          description: chartForm.value.description,
          option,
          dataset: dataset.dimensions ? dataset : undefined
        })
      } else {
        packagesStore.addCustomChart({
          name: chartForm.value.name,
          description: chartForm.value.description,
          option,
          dataset: dataset.dimensions ? dataset : undefined,
          isShared: false
        })
      }
      window['$message'].success('保存成功')
    } catch (e) {
      window['$message'].error('Dataset JSON 格式错误')
    }
  } catch (e) {
    window['$message'].error('ECharts 配置 JSON 格式错误')
  }
}

const previewChart = () => {
  updatePreview()
  window['$message'].info('预览已更新')
}

const backToList = () => {
  router.push(CustomChartEnum.CUSTOM_CHART_LIST)
}

onMounted(() => {
  const chartId = route.params.id as string
  const existingChart = packagesStore.getCustomChartById(chartId)
  if (existingChart) {
    chartForm.value.name = existingChart.name
    chartForm.value.description = existingChart.description || ''
    optionString.value = JSON.stringify(existingChart.option, null, 2)
    if (existingChart.dataset) {
      datasetString.value = JSON.stringify(existingChart.dataset, null, 2)
    }
  }
  updatePreview()
})
</script>

<style lang="scss" scoped>
.custom-chart-edit {
  height: calc(100vh - 64px);
  overflow: hidden;

  .editor-section {
    .code-editor-wrapper {
      width: 100%;
      border: 1px solid rgba(128, 128, 128, 0.2);
      border-radius: 4px;
    }
  }

  .examples-section {
    padding: 8px 0;
  }

  .preview-container {
    width: 100%;

    .chart-preview {
      width: 100%;
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
