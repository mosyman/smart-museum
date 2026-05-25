const { baseUrl } = require('../../utils/config.js')

Page({
  data: {
    banners: [
      `${baseUrl}/images/lunbo1.jpg`,
      `${baseUrl}/images/lunbo2.jpg`,
      `${baseUrl}/images/lunbo3.jpg`
    ],
    defaultImg: `${baseUrl}/images/default.jpg`,
    hotExhibits: [],
    routes: [],
    loading: false,
    showRouteModal: false,
    currentRoute: null,
    routeExhibits: []
  },

  onLoad() {
    this.loadHotExhibits()
    this.loadRoutes()
  },

  onShow() {
    this.loadHotExhibits()
    this.loadRoutes()
  },

  // 加载热门展品（取前 3 条）
  loadHotExhibits() {
    wx.request({
      url: `${baseUrl}/api/exhibit/hot`,
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          let exhibits = (res.data.data || []).slice(0, 3)
          exhibits.forEach(item => {
            if (item.imageUrl && item.imageUrl.startsWith('/')) {
              item.imageUrl = baseUrl + item.imageUrl
            }
          })
          this.setData({ hotExhibits: exhibits })
        }
      }
    })
  },

  // 加载推荐路线（取前 3 条）
  loadRoutes() {
    wx.request({
      url: `${baseUrl}/api/route/list`,
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({ routes: (res.data.data || []).slice(0, 3) })
        }
      }
    })
  },

  // 获取展品列表（用于路线详情）
  getExhibitsByIds(ids, callback) {
    if (!ids || ids.length === 0) {
      callback([])
      return
    }
    wx.request({
      url: `${baseUrl}/api/exhibit/list`,
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          const all = res.data.data || []
          const exhibits = all.filter(item => ids.includes(item.id))
          exhibits.forEach(item => {
            if (item.imageUrl && item.imageUrl.startsWith('/')) {
              item.imageUrl = baseUrl + item.imageUrl
            }
          })
          callback(exhibits)
        } else {
          callback([])
        }
      },
      fail: () => callback([])
    })
  },

  // 显示路线详情弹窗
  showRouteDetail(routeId) {
    wx.request({
      url: `${baseUrl}/api/route/${routeId}`,
      method: 'GET',
      success: (res) => {
        if (res.data.code !== 200) {
          wx.showToast({ title: '获取路线详情失败', icon: 'none' })
          return
        }
        const route = res.data.data
        let waypointIds = []
        try {
          if (typeof route.waypoints === 'string') {
            waypointIds = JSON.parse(route.waypoints)
          } else if (Array.isArray(route.waypoints)) {
            waypointIds = route.waypoints
          }
        } catch (e) {
          waypointIds = []
        }
        this.getExhibitsByIds(waypointIds, (exhibits) => {
          this.setData({
            showRouteModal: true,
            currentRoute: route,
            routeExhibits: exhibits
          })
        })
      },
      fail: () => wx.showToast({ title: '网络错误', icon: 'none' })
    })
  },

  // 智能推荐路线（按可用时间）
  recommendRouteByTime() {
    wx.showActionSheet({
      itemList: ['30 分钟', '60 分钟', '120 分钟'],
      success: (res) => {
        const minutes = [30, 60, 120][res.tapIndex]
        wx.request({
          url: `${baseUrl}/api/route/recommend?availableTime=${minutes}`,
          method: 'GET',
          success: (r) => {
            if (r.data.code === 200 && r.data.data && r.data.data.id) {
              this.showRouteDetail(r.data.data.id)
            } else {
              wx.showToast({ title: '暂无合适路线', icon: 'none' })
            }
          }
        })
      }
    })
  },

  closeRouteModal() {
    this.setData({ showRouteModal: false })
  },
  stopPropagation() {},

  startNavigation() {
    const route = this.data.currentRoute
    if (route) {
      this.closeRouteModal()
      wx.navigateTo({ url: `/pages/navigation/navigation?routeId=${route.id}` })
    }
  },

  goToMap() {
    // /pages/map/map 是 tabBar 页面，必须用 switchTab，navigateTo 会静默失败
    wx.switchTab({ url: '/pages/map/map' })
  },

  goToCollection() {
    wx.navigateTo({ url: '/pages/collection/collection' })
  },

  scanQRCode() {
    wx.scanCode({
      success: (res) => {
        const exhibitId = parseInt(res.result)
        if (exhibitId) {
          wx.navigateTo({ url: `/pages/exhibit/exhibit?id=${exhibitId}` })
        } else {
          wx.showToast({ title: '无效的二维码', icon: 'none' })
        }
      },
      fail: () => wx.showToast({ title: '扫码失败', icon: 'none' })
    })
  },

  goToFootprint() {
    if (!wx.getStorageSync('token')) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    // tabBar 页面用 switchTab
    wx.switchTab({ url: '/pages/footprint/footprint' })
  },

  goToExhibit(e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `/pages/exhibit/exhibit?id=${id}` })
  },

  goToRoute(e) {
    const id = e.currentTarget.dataset.id
    if (id) this.showRouteDetail(id)
  },

  onImageError(e) {
    const index = e.currentTarget.dataset.index
    const hotExhibits = this.data.hotExhibits
    if (hotExhibits[index]) {
      hotExhibits[index].imageUrl = this.data.defaultImg
      this.setData({ hotExhibits })
    }
  }
})
