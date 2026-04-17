import { RouteRecordRaw } from 'vue-router'
import { PageEnum, CustomChartEnum } from '@/enums/pageEnum'

const importPath = {
  'CustomChartEnum.CUSTOM_CHART_LIST_NAME': () => import('@/views/customChart/index.vue'),
  'CustomChartEnum.CUSTOM_CHART_LIST_NAME.List': () => import('@/views/customChart/list/index.vue'),
  'CustomChartEnum.CUSTOM_CHART_EDIT_NAME': () => import('@/views/customChart/edit/index.vue')
}

const customChartRoutes: RouteRecordRaw = {
  path: '/custom-chart',
  name: CustomChartEnum.CUSTOM_CHART_LIST_NAME,
  component: importPath['CustomChartEnum.CUSTOM_CHART_LIST_NAME'],
  redirect: CustomChartEnum.CUSTOM_CHART_LIST,
  meta: {
    title: '自定义图表',
    isRoot: true
  },
  children: [
    {
      path: CustomChartEnum.CUSTOM_CHART_LIST,
      name: CustomChartEnum.CUSTOM_CHART_LIST_NAME + 'List',
      component: importPath['CustomChartEnum.CUSTOM_CHART_LIST_NAME.List'],
      meta: {
        title: '自定义图表列表'
      }
    },
    {
      path: CustomChartEnum.CUSTOM_CHART_EDIT,
      name: CustomChartEnum.CUSTOM_CHART_EDIT_NAME,
      component: importPath['CustomChartEnum.CUSTOM_CHART_EDIT_NAME'],
      meta: {
        title: '编辑自定义图表'
      }
    }
  ]
}

export default customChartRoutes
