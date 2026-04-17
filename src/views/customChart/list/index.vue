<template>
  <div class="custom-chart-list">
    <div class="list-header">
      <n-space>
        <n-button type="primary" @click="createNewChart">
          <template #icon>
            <n-icon><AddIcon /></n-icon>
          </template>
          新建自定义图表
        </n-button>
        <n-button @click="loadCustomCharts">
          <template #icon>
            <n-icon><RefreshIcon /></n-icon>
          </template>
          刷新
        </n-button>
      </n-space>
    </div>

    <n-empty v-if="!customCharts.length" description="暂无自定义图表，点击上方按钮创建">
      <template #icon>
        <n-icon size="48"><BarChartOutlineIcon /></n-icon>
      </template>
    </n-empty>

    <div class="chart-grid" v-else>
      <n-grid :cols="4" :x-gap="20" :y-gap="20">
        <n-gi v-for="chart in customCharts" :key="chart.id">
          <n-card hoverable :bordered="true">
            <template #header>
              <div class="card-header">
                <n-text strong>{{ chart.name }}</n-text>
                <n-tag size="small" :type="chart.isShared ? 'success' : 'default'">
                  {{ chart.isShared ? '已分享' : '私有' }}
                </n-tag>
              </div>
            </template>
            <div class="card-content">
              <div class="preview-area" v-if="chart.previewImage">
                <img :src="chart.previewImage" alt="预览图" class="preview-image" />
              </div>
              <div class="preview-area no-preview" v-else>
                <n-icon size="48"><BarChartOutlineIcon /></n-icon>
                <n-text depth="3">暂无预览</n-text>
              </div>
              <div class="chart-desc" v-if="chart.description">
                <n-text depth="3">{{ chart.description }}</n-text>
              </div>
              <div class="chart-time">
                <n-text depth="3" tag>创建: {{ formatTime(chart.createdAt) }}</n-text>
                <n-text depth="3" tag>更新: {{ formatTime(chart.updatedAt) }}</n-text>
              </div>
            </div>
            <template #action>
              <n-space justify="space-around">
                <n-button text size="small" @click="editChart(chart)">
                  <template #icon><EditIcon /></template>
                  编辑
                </n-button>
                <n-button text size="small" type="primary" @click="useChart(chart)">
                  <template #icon><PlayIcon /></template>
                  使用
                </n-button>
                <n-button text size="small" @click="shareChart(chart)">
                  <template #icon><ShareSocialIcon /></template>
                  分享
                </n-button>
                <n-button text size="small" type="error" @click="deleteChart(chart)">
                  <template #icon><TrashOutlineIcon /></template>
                  删除
                </n-button>
              </n-space>
            </template>
          </n-card>
        </n-gi>
      </n-grid>
    </div>

    <n-modal v-model:show="showShareModal" preset="dialog" title="分享自定义图表" :positive-text="'复制分享链接'" :negative-text="'取消'" @positive-click="copyShareLink" @negative-click="showShareModal = false">
      <n-space vertical>
        <n-input v-model:value="shareLink" placeholder="分享链接" readonly>
          <template #prefix>
            <n-icon><LinkOutlineIcon /></n-icon>
          </template>
        </n-input>
        <n-text depth="3">复制此链接可以将自定义图表分享给他人使用</n-text>
      </n-space>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePackagesStore } from '@/store/modules/packagesStore/packagesStore'
import { CustomChartConfig } from '@/packages/index.d'
import { CustomChartEnum } from '@/enums/pageEnum'
import dayjs from 'dayjs'
import {
  AddIcon,
  RefreshIcon,
  EditIcon,
  PlayIcon,
  ShareSocialIcon,
  TrashOutlineIcon,
  LinkOutlineIcon,
  BarChartOutlineIcon
} from '@vicons/ionicons5'
import { getUUID } from '@/utils'

const router = useRouter()
const packagesStore = usePackagesStore()

const customCharts = ref<CustomChartConfig[]>([])
const showShareModal = ref(false)
const shareLink = ref('')
const currentShareChart = ref<CustomChartConfig | null>(null)

const loadCustomCharts = () => {
  packagesStore.loadCustomCharts()
  customCharts.value = packagesStore.getCustomCharts
}

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}

const createNewChart = () => {
  router.push(CustomChartEnum.CUSTOM_CHART_EDIT.replace(':id(.*)*', getUUID()))
}

const editChart = (chart: CustomChartConfig) => {
  router.push(CustomChartEnum.CUSTOM_CHART_EDIT.replace(':id(.*)*', chart.id))
}

const useChart = (chart: CustomChartConfig) => {
  window['$message'].success(`图表 "${chart.name}" 已准备就绪，可以在编辑页面的"自定义"分类中找到并拖拽使用`)
}

const shareChart = (chart: CustomChartConfig) => {
  currentShareChart.value = chart
  packagesStore.updateCustomChart(chart.id, { isShared: true, shareId: getUUID() })
  const updatedChart = packagesStore.getCustomChartById(chart.id)
  if (updatedChart?.shareId) {
    shareLink.value = `${window.location.origin}${window.location.hash}#/share/custom-chart/${updatedChart.shareId}`
    showShareModal.value = true
  }
}

const copyShareLink = () => {
  navigator.clipboard.writeText(shareLink.value).then(() => {
    window['$message'].success('分享链接已复制到剪贴板')
    showShareModal.value = false
  }).catch(() => {
    window['$message'].error('复制失败，请手动复制')
  })
}

const deleteChart = (chart: CustomChartConfig) => {
  window['$dialog'].warning({
    title: '确认删除',
    content: `确定要删除自定义图表 "${chart.name}" 吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      packagesStore.deleteCustomChart(chart.id)
      loadCustomCharts()
      window['$message'].success('删除成功')
    }
  })
}

onMounted(() => {
  loadCustomCharts()
})
</script>

<style lang="scss" scoped>
.custom-chart-list {
  padding: 20px;

  .list-header {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-content {
    .preview-area {
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(128, 128, 128, 0.1);
      border-radius: 4px;
      margin-bottom: 12px;
      overflow: hidden;

      &.no-preview {
        flex-direction: column;
        gap: 8px;
      }
    }

    .preview-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .chart-desc {
      margin-bottom: 12px;
    }

    .chart-time {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}
</style>
