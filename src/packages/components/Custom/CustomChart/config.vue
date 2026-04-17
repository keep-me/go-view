<template>
  <div class="custom-chart-config">
    <setting-item-box name="基础配置">
      <setting-item label="名称">
        <n-input v-model:value="nameValue" placeholder="请输入图表名称" @blur="updateName" />
      </setting-item>
      <setting-item label="描述">
        <n-input v-model:value="descriptionValue" type="textarea" placeholder="请输入图表描述" @blur="updateDescription" />
      </setting-item>
    </setting-item-box>
    <setting-item-box name="ECharts 配置">
      <setting-item label="配置编辑" :alone="true">
        <div class="code-editor-wrapper">
          <monaco-editor
            v-model:value="optionString"
            language="json"
            :height="300"
            @change="handleOptionChange"
          />
        </div>
      </setting-item>
      <setting-item label="格式化" :alone="true">
        <n-button type="primary" size="small" @click="formatOption">格式化 JSON</n-button>
      </setting-item>
    </setting-item-box>
    <setting-item-box name="数据配置">
      <setting-item label="数据集" :alone="true">
        <div class="code-editor-wrapper">
          <monaco-editor
            v-model:value="datasetString"
            language="json"
            :height="200"
            @change="handleDatasetChange"
          />
        </div>
      </setting-item>
    </setting-item-box>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'
import { MonacoEditor } from '@/components/Pages/MonacoEditor'
import { CreateComponentType } from '@/packages/index.d'
import { useTargetData } from '@/views/chart/ContentConfigurations/hooks/useTargetData.hook'
import cloneDeep from 'lodash/cloneDeep'

const { targetData } = useTargetData()

const nameValue = ref('')
const descriptionValue = ref('')
const optionString = ref('{}')
const datasetString = ref('{}')

watch(
  () => targetData.value,
  (newVal) => {
    if (newVal) {
      nameValue.value = newVal.chartConfig?.title || ''
      optionString.value = JSON.stringify(newVal.option, null, 2)
      if (newVal.option.dataset) {
        datasetString.value = JSON.stringify(newVal.option.dataset, null, 2)
      }
    }
  },
  { immediate: true, deep: true }
)

const updateName = () => {
  if (targetData.value) {
    targetData.value.chartConfig.title = nameValue.value
  }
}

const updateDescription = () => {
  if (targetData.value) {
    if (!targetData.value.option) {
      targetData.value.option = {}
    }
  }
}

const handleOptionChange = () => {
  try {
    const newOption = JSON.parse(optionString.value)
    if (targetData.value) {
      targetData.value.option = cloneDeep(newOption)
    }
  } catch (e) {
    console.log('JSON 格式错误')
  }
}

const handleDatasetChange = () => {
  try {
    const newDataset = JSON.parse(datasetString.value)
    if (targetData.value) {
      targetData.value.option.dataset = newDataset
    }
  } catch (e) {
    console.log('Dataset JSON 格式错误')
  }
}

const formatOption = () => {
  try {
    const parsed = JSON.parse(optionString.value)
    optionString.value = JSON.stringify(parsed, null, 2)
  } catch (e) {
    window['$message'].error('JSON 格式错误，无法格式化')
  }
}
</script>

<style lang="scss" scoped>
.custom-chart-config {
  .code-editor-wrapper {
    width: 100%;
    border: 1px solid rgba(128, 128, 128, 0.2);
    border-radius: 4px;
  }
}
</style>
