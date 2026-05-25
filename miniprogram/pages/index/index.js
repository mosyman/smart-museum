const { baseUrl } = require('../../utils/config.js')

/**
 * 从扫码结果提取展品 ID。
 * 支持两种格式：
 *   1. URL 形式: https://museum.local/e/5 → 5
 *   2. 纯数字（向后兼容旧码）: "5" → 5
 * 其它内容（普通网址、文本等）一律返回 null。
 */
function parseExhibitId(raw) {
  if (!raw) return null
  const s = String(raw).trim()
  // 匹配 /e/数字 结尾（兼容大小写、可选末尾斜杠/查询串）
  const m = s.match(/\/e\/(\d+)\/?(?:\?|#|$)/i)
  if (m) return Number(m[1])
  // 兼容纯数字
  if (/^\d+$/.test(s)) return Number(s)
  return null
}

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
      scanType: ['qrCode'],  // 只接受二维码，排除条形码
      success: (res) => {
        const id = parseExhibitId(res.result)
        if (!id) {
          wx.showModal({
            title: '无法识别',
            content: `扫码内容："${(res.result || '').slice(0, 60)}"\n不是本馆展品二维码。`,
            showCancel: false
          })
          return
        }
        wx.showLoading({ title: '加载展品...' })
        wx.navigateTo({
          url: `/pages/exhibit/exhibit?id=${id}`,
          complete: () => wx.hideLoading()
        })
      },
      fail: () => wx.showToast({ title: '扫码取消', icon: 'none' })
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
