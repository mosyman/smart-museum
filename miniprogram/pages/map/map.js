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
    // 如果有传入路线ID，则显示该路线
    if (options.routeId) {
      this.loadRouteDetail(options.routeId)
    }
    this.loadExhibits()
    this.loadRoutes()
  },

  // 加载展品数据
  loadExhibits() {
    const that = this
    wx.request({
      url: 'http://localhost:8081/api/exhibit/list',
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          let exhibits = res.data.data || []
          // 补全图片URL
          exhibits.forEach(item => {
            if (item.imageUrl && item.imageUrl.startsWith('/')) {
              item.imageUrl = 'http://localhost:8081' + item.imageUrl
            }
          })
          that.setData({ exhibits: exhibits })
          that.drawMap()
        }
      }
    })
  },

  // 加载路线列表
  loadRoutes() {
    const that = this
    wx.request({
      url: 'http://localhost:8081/api/route/list',
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          that.setData({ routes: res.data.data || [] })
        }
      }
    })
  },

  // 加载路线详情
  loadRouteDetail(routeId) {
    const that = this
    wx.request({
      url: `http://localhost:8081/api/route/${routeId}`,
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          const route = res.data.data
          let waypointIds = []
          try {
            waypointIds = JSON.parse(route.waypoints || '[]')
          } catch(e) {
            waypointIds = []
          }
          that.setData({
            selectedRoute: route,
            waypointIds: waypointIds,
            showRoute: true
          })
          that.drawMap()
        }
      }
    })
  },

  // 切换楼层
  switchFloor(e) {
    const floor = e.currentTarget.dataset.floor
    this.setData({ currentFloor: floor })
    this.drawMap()
  },

  // 绘制地图（用view模拟地图）
  drawMap() {
    // 获取当前楼层的展品
    const floorExhibits = this.data.exhibits.filter(
      item => item.locationFloor === this.data.currentFloor
    )
    
    // 获取当前楼层路线的展点
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

  // 选择路线
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

  // 清除路线
  clearRoute() {
    this.setData({
      selectedRoute: null,
      waypointIds: [],
      showRoute: false
    })
    this.drawMap()
  },

  // 跳转展品详情
  goToExhibit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/exhibit/exhibit?id=${id}` })
  },

  // 开始导航
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
          // 这里可以跳转到导航页面或显示导航指引
          wx.showToast({ title: '导航功能开发中', icon: 'none' })
        }
      }
    })
  }
})