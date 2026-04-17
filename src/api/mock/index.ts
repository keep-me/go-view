import test from './test.mock'
import { MockMethod } from 'vite-plugin-mock'
import { RequestHttpEnum } from '@/enums/httpEnum'

// 单个X数据
export const chartDataUrl = '/mock/chartData'
export const chartSingleDataUrl = '/mock/chartSingleData'
export const numberFloatUrl = '/mock/number/float'
export const numberIntUrl = '/mock/number/int'
export const textUrl = '/mock/text'
export const imageUrl = '/mock/image'
export const rankListUrl = '/mock/rankList'
export const scrollBoardUrl = '/mock/scrollBoard'
export const radarUrl = '/mock/radarData'
export const heatMapUrl = '/mock/heatMapData'
export const scatterBasicUrl = '/mock/scatterBasic'
export const mapUrl = '/mock/map'
export const capsuleUrl = '/mock/capsule'
export const wordCloudUrl = '/mock/wordCloud'
export const treemapUrl = '/mock/treemap'
export const threeEarth01Url = '/mock/threeEarth01Data'
export const sankeyUrl = '/mock/sankey'
export const graphUrl = '/mock/graphData'

// 登录 mock 数据
const mockLoginData = {
  code: 200,
  data: {
    token: {
      tokenName: 'token',
      tokenValue: 'mock-token-' + Date.now()
    },
    userinfo: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      avatar: ''
    }
  },
  msg: '登录成功'
}

const mockProjectListData = {
  code: 200,
  data: {
    list: [],
    total: 0
  },
  msg: '获取成功'
}

const mockProjectCreateData = {
  code: 200,
  data: {
    id: 'mock-project-id-' + Date.now()
  },
  msg: '创建成功'
}

const mockProjectDetailData = {
  code: 200,
  data: {
    id: '',
    content: '{}',
    status: -1
  },
  msg: '获取成功'
}

const mockObject: MockMethod[] = [
  {
    // 正则
    // url: /\/mock\/mockData(|\?\S*)$/,
    url: chartDataUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchMockData
  },
  {
    url: chartSingleDataUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchMockSingleData
  },
  {
    url: numberFloatUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchNumberFloat
  },
  {
    url: numberIntUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchNumberInt
  },
  {
    url: textUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchText
  },
  {
    url: imageUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchImage(Math.round(Math.random() * 10))
  },
  {
    url: rankListUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchRankList
  },
  {
    url: scrollBoardUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchScrollBoard
  },
  {
    url: radarUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchRadar
  },
  {
    url: heatMapUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchHeatmap
  },
  {
    url: scatterBasicUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchScatterBasic
  },
  {
    url: mapUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchMap
  },
  {
    url: capsuleUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchCapsule
  },
  {
    url: wordCloudUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchWordCloud
  },
  {
    url: treemapUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchTreemap
  },
  {
    url: threeEarth01Url,
    method: RequestHttpEnum.GET,
    response: () => test.threeEarth01Data
  },
  {
    url: sankeyUrl,
    method: RequestHttpEnum.GET,
    response: () => test.fetchSankey
  },
  {
    url: graphUrl,
    method: RequestHttpEnum.GET,
    response: () => test.graphData
  },
  // 登录接口
  {
    url: '/api/goview/sys/login',
    method: RequestHttpEnum.POST,
    response: () => {
      return {
        code: 200,
        data: {
          token: {
            tokenName: 'token',
            tokenValue: 'mock-token-' + Date.now()
          },
          userinfo: {
            id: 1,
            username: 'admin',
            nickname: '管理员',
            avatar: ''
          }
        },
        msg: '登录成功'
      }
    }
  },
  // 登出接口
  {
    url: '/api/goview/sys/logout',
    method: RequestHttpEnum.GET,
    response: () => {
      return {
        code: 200,
        data: null,
        msg: '登出成功'
      }
    }
  },
  // 获取项目列表
  {
    url: '/api/goview/project/list',
    method: RequestHttpEnum.GET,
    response: () => {
      return {
        code: 200,
        data: {
          list: [],
          total: 0
        },
        msg: '获取成功'
      }
    }
  },
  // 获取项目详情
  {
    url: /\/api\/goview\/project\/getData(|\?\S*)$/,
    method: RequestHttpEnum.GET,
    response: () => {
      return {
        code: 200,
        data: {
          id: '',
          content: '{}',
          status: -1
        },
        msg: '获取成功'
      }
    }
  },
  // 创建项目
  {
    url: '/api/goview/project/create',
    method: RequestHttpEnum.POST,
    response: () => {
      return {
        code: 200,
        data: {
          id: 'mock-project-id-' + Date.now()
        },
        msg: '创建成功'
      }
    }
  },
  // 编辑项目
  {
    url: '/api/goview/project/edit',
    method: RequestHttpEnum.POST,
    response: () => {
      return {
        code: 200,
        data: null,
        msg: '编辑成功'
      }
    }
  },
  // 删除项目
  {
    url: /\/api\/goview\/project\/delete(|\?\S*)$/,
    method: RequestHttpEnum.GET,
    response: () => {
      return {
        code: 200,
        data: null,
        msg: '删除成功'
      }
    }
  },
  // 获取OSS信息
  {
    url: '/api/goview/sys/getOssInfo',
    method: RequestHttpEnum.GET,
    response: () => {
      return {
        code: 200,
        data: {
          bucketURL: ''
        },
        msg: '获取成功'
      }
    }
  },
]

export default mockObject
