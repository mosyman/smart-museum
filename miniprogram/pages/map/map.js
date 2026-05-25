const { baseUrl } = require('../../utils/config.js')

Page({
  data: {
    currentFloor: 1,
    floors: [1, 2, 3],
    exhibits: [],
    routes: [],
    selectedRoute: null,
    waypointIds: [],
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
            waypointIds = JSON.parse(route.waypoints || '[]')
          } catch (e) {
            waypointIds = []
          }
          this.setData({
            selectedRoute: route,
            waypointIds: waypointIds,
            showRoute: true
          })
          this.drawMap()
        }
      }
    })
  },

  switchFloor(e) {
    this.setData({ currentFloor: e.currentTarget.dataset.floor })
    this.drawMap()
  },

  drawMap() {
    const floorExhibits = this.data.exhibits.filter(
      item => item.locationFloor === this.data.currentFloor
    )

    let routeExhibits = []
    if (this.data.showRoute && this.data.waypointIds.length > 0) {
      routeExhibits = floorExhibits.filter(
        item => this.data.waypointIds.includes(item.id)
      )
    }

    this.setData({
      floorExhibits: floorExhibits,
      routeExhibits: routeExhibits
    })
  },

  onRouteChange(e) {
    const routeId = e.detail.value
    if (routeId) {
      this.loadRouteDetail(routeId)
    } else {
      this.setData({
        selectedRoute: null,
        waypointIds: [],
        showRoute: false
      })
      this.drawMap()
    }
  },

  clearRoute() {
    this.setData({
      selectedRoute: null,
      waypointIds: [],
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
    wx.showModal({
      title: '开始导航',
      content: `即将开始"${this.data.selectedRoute.name}"，预计${this.data.selectedRoute.recommendTime}分钟`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '导航功能开发中', icon: 'none' })
        }
      }
    })
  }
})
