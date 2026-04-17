import { defineStore } from 'pinia'
import { ConfigType, PackagesStoreType, PackagesType, CustomChartConfig } from './packagesStore.d'
import { packagesList } from '@/packages/index'
import { StorageEnum } from '@/enums/storageEnum'
import { getLocalStorage, setLocalStorage, getUUID } from '@/utils'
import cloneDeep from 'lodash/cloneDeep'

// 组件 packages
export const usePackagesStore = defineStore({
  id: 'usePackagesStore',
  state: (): PackagesStoreType => ({
    packagesList: Object.freeze(packagesList),
    newPhoto: undefined,
    customCharts: []
  }),
  getters: {
    getPackagesList(): PackagesType {
      return this.packagesList
    },
    getCustomCharts(): CustomChartConfig[] {
      return this.customCharts
    }
  },
  actions: {
    addPhotos(newPhoto: ConfigType, index: number) {
      this.newPhoto = newPhoto
      this.packagesList.Photos.splice(index, 0, newPhoto)
    },
    deletePhotos(photoInfo: ConfigType, index: number) {
      this.packagesList.Photos.splice(index, 1)
      const StoreKey = StorageEnum.GO_USER_MEDIA_PHOTOS
      const userPhotosList = getLocalStorage(StoreKey)
      userPhotosList.splice(index - 1, 1)
      setLocalStorage(StoreKey, userPhotosList)
    },
    loadCustomCharts() {
      const StoreKey = StorageEnum.GO_USER_CUSTOM_CHARTS
      const savedCustomCharts = getLocalStorage(StoreKey)
      if (savedCustomCharts) {
        this.customCharts = savedCustomCharts
      }
    },
    saveCustomCharts() {
      const StoreKey = StorageEnum.GO_USER_CUSTOM_CHARTS
      setLocalStorage(StoreKey, this.customCharts)
    },
    addCustomChart(chartConfig: Omit<CustomChartConfig, 'id' | 'createdAt' | 'updatedAt'>) {
      const newChart: CustomChartConfig = {
        ...chartConfig,
        id: getUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      this.customCharts.push(newChart)
      this.saveCustomCharts()
      return newChart
    },
    updateCustomChart(id: string, updates: Partial<CustomChartConfig>) {
      const index = this.customCharts.findIndex(chart => chart.id === id)
      if (index !== -1) {
        this.customCharts[index] = {
          ...this.customCharts[index],
          ...updates,
          updatedAt: Date.now()
        }
        this.saveCustomCharts()
      }
    },
    deleteCustomChart(id: string) {
      const index = this.customCharts.findIndex(chart => chart.id === id)
      if (index !== -1) {
        this.customCharts.splice(index, 1)
        this.saveCustomCharts()
      }
    },
    getCustomChartById(id: string): CustomChartConfig | undefined {
      return this.customCharts.find(chart => chart.id === id)
    }
  }
})
