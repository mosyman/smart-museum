const { baseUrl } = require('../../utils/config.js')

Page({
  data: {
    route: null,
    waypoints: [],   // 完整路径展品列表
    currentIdx: 0,   // 当前到达的展品下标
    finished: false,
    defaultImg: `${baseUrl}/images/default.jpg`
  },

  onLoad(options) {
    const routeId = options.routeId
    if (!routeId) {
      wx.showToast({ title: '缺少路线参数', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 800)
      return
    }
    this.loadRouteAndWaypoints(routeId)
  },

  loadRouteAndWaypoints(routeId) {
    wx.showLoading({ title: '加载路线...' })
    wx.request({
      url: `${baseUrl}/api/route/${routeId}`,
      method: 'GET',
      success: (res) => {
        if (res.data.code !== 200) {
          wx.hideLoading()
          wx.showToast({ title: '路线不存在', icon: 'none' })
          return
        }
        const route = res.data.data
        let ids = []
        try {
          ids = typeof route.waypoints === 'string'
            ? JSON.parse(route.waypoints)
            : (Array.isArray(route.waypoints) ? route.waypoints : [])
        } catch (e) { ids = [] }

        if (ids.length === 0) {
          wx.hideLoading()
          wx.showToast({ title: '路线没有途经展品', icon: 'none' })
          return
        }

        // 获取展品详情列表
        wx.request({
          url: `${baseUrl}/api/exhibit/list`,
          method: 'GET',
          success: (r2) => {
            wx.hideLoading()
            if (r2.data.code !== 200) {
              wx.showToast({ title: '获取展品失败', icon: 'none' })
              return
            }
            const all = r2.data.data || []
            // 按 waypoints 顺序排列
            const ordered = ids
              .map(id => all.find(e => e.id === id))
              .filter(Boolean)
              .map(e => ({
                ...e,
                imageUrl: e.imageUrl && e.imageUrl.startsWith('/')
                  ? baseUrl + e.imageUrl
                  : e.imageUrl
              }))
            this.setData({
              route,
              waypoints: ordered,
              currentIdx: 0,
              finished: false
            })
            wx.setNavigationBarTitle({ title: route.name })
          }
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  // 下一站
  nextStep() {
    const next = this.data.currentIdx + 1
    if (next >= this.data.waypoints.length) {
      this.setData({ finished: true })
      return
    }
    this.setData({ currentIdx: next })
    // 切到下一站时记录一次"到达"，用户已登录则上报参观
    this.reportVisit(this.data.waypoints[next].id)
  },

  // 上一站
  prevStep() {
    const prev = this.data.currentIdx - 1
    if (prev >= 0) this.setData({ currentIdx: prev, finished: false })
  },

  reportVisit(exhibitId) {
    const userId = wx.getStorageSync('userId')
    const token = wx.getStorageSync('token')
    if (!userId || !token) return
    wx.request({
      url: `${baseUrl}/api/visit/record`,
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + token },
      data: { userId, exhibitId, duration: 60 }
    })
  },

  // 跳到展品详情
  viewDetail() {
    const current = this.data.waypoints[this.data.currentIdx]
    if (current) {
      wx.navigateTo({ url: `/pages/exhibit/exhibit?id=${current.id}` })
    }
  },

  // 完成后回到首页
  finish() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  // 跳到任一站
  jumpTo(e) {
    const idx = e.currentTarget.dataset.idx
    this.setData({ currentIdx: idx, finished: false })
  }
})
