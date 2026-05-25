const { baseUrl } = require('../../utils/config.js')

Page({
  data: {
    currentFloor: 1,
    floors: [1, 2, 3],
    exhibits: [],
    routes: [],
    selectedRoute: null,
    waypointIds: [],          // 当前路线的所有 waypoint exhibit_id
    routeExhibitIds: [],      // 当前楼层 & 在路线中的 exhibit_id（WXML 用 ID 比较，避免对象引用问题）
    floorExhibits: [],
    showRoute: false,
    loading: false
  },

  onLoad(options) {
    if (options.routeId) {
      this.loadRouteDetail(options.routeId)
    }
    this.loadExhibits()
    this.loadRoutes()
  },

  loadExhibits() {
    wx.request({
      url: `${baseUrl}/api/exhibit/list`,
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          let exhibits = res.data.data || []
          exhibits.forEach(item => {
            if (item.imageUrl && item.imageUrl.startsWith('/')) {
              item.imageUrl = baseUrl + item.imageUrl
            }
          })
          this.setData({ exhibits: exhibits })
          this.drawMap()
        }
      }
    })
  },

  loadRoutes() {
    wx.request({
      url: `${baseUrl}/api/route/list`,
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({ routes: res.data.data || [] })
        }
      }
    })
  },

  loadRouteDetail(routeId) {
    wx.request({
      url: `${baseUrl}/api/route/${routeId}`,
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          const route = res.data.data
          let waypointIds = []
          try {
            waypointIds = typeof route.waypoints === 'string'
              ? JSON.parse(route.waypoints || '[]')
              : (Array.isArray(route.waypoints) ? route.waypoints : [])
          } catch (e) {
            waypointIds = []
          }
          // 自动切到路线的首发楼层（若当前楼层没途经展品）
          let nextFloor = this.data.currentFloor
          if (waypointIds.length > 0) {
            const firstWaypoint = this.data.exhibits.find(e => e.id === waypointIds[0])
            if (firstWaypoint && firstWaypoint.locationFloor) {
              const hasOnCurrent = this.data.exhibits.some(
                e => waypointIds.includes(e.id) && e.locationFloor === this.data.currentFloor
              )
              if (!hasOnCurrent) nextFloor = firstWaypoint.locationFloor
            }
          }
          this.setData({
            selectedRoute: route,
            waypointIds,
            showRoute: true,
            currentFloor: nextFloor
          })
          this.drawMap()
        }
      }
    })
  },

  switchFloor(e) {
    this.setData({ currentFloor: Number(e.currentTarget.dataset.floor) })
    this.drawMap()
  },

  drawMap() {
    const floorExhibits = this.data.exhibits.filter(
      item => item.locationFloor === this.data.currentFloor
    )
    // 用 ID 数组比较，避免 WXML 中对象引用不一致问题
    const routeExhibitIds = this.data.showRoute && this.data.waypointIds.length > 0
      ? floorExhibits.filter(item => this.data.waypointIds.includes(item.id)).map(e => e.id)
      : []
    this.setData({ floorExhibits, routeExhibitIds })
  },

  onRouteChange(e) {
    // picker 返回的是数组下标
    const idx = Number(e.detail.value)
    const route = this.data.routes[idx]
    if (route && route.id) {
      this.loadRouteDetail(route.id)
    } else {
      this.clearRoute()
    }
  },

  clearRoute() {
    this.setData({
      selectedRoute: null,
      waypointIds: [],
      routeExhibitIds: [],
      showRoute: false
    })
    this.drawMap()
  },

  goToExhibit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/exhibit/exhibit?id=${id}` })
  },

  startNavigation() {
    if (!this.data.selectedRoute) {
      wx.showToast({ title: '请先选择路线', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: `/pages/navigation/navigation?routeId=${this.data.selectedRoute.id}`
    })
  }
})
