const { baseUrl } = require('../../utils/config.js')

Page({
  data: {
    visitRecords: [],   // 聚合后的足迹（按展品）
    recommends: [],
    loading: false,
    defaultImg: `${baseUrl}/images/default.jpg`,
    report: {
      totalCount: 0,        // 去重后的展品数
      totalDuration: 0,     // 累计停留秒数
      favoriteCategory: ''  // 偏好分类
    }
  },

  onShow() {
    this.loadFootprint()
  },

  loadFootprint() {
    const userId = wx.getStorageSync('userId')
    const token = wx.getStorageSync('token')
    if (!userId || !token) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    wx.request({
      url: `${baseUrl}/api/visit/footprint/${userId}`,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + token },
      success: (res) => {
        if (res.data.code === 200) {
          let records = res.data.data || []
          records.forEach(item => {
            if (item.imageUrl && item.imageUrl.startsWith('/')) {
              item.imageUrl = baseUrl + item.imageUrl
            }
            if (item.lastVisitTime) {
              item.lastVisitTimeText = this.formatTime(item.lastVisitTime)
            }
          })
          this.setData({ visitRecords: records })
          this.generateReport(records)
          this.loadRecommends(userId, token)
        } else if (res.data.code === 401) {
          wx.showToast({ title: '请重新登录', icon: 'none' })
        }
      },
      fail: () => wx.showToast({ title: '加载失败', icon: 'none' }),
      complete: () => this.setData({ loading: false })
    })
  },

  loadRecommends(userId, token) {
    wx.request({
      url: `${baseUrl}/api/recommend/${userId}`,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + token },
      success: (res) => {
        if (res.data.code === 200) {
          let items = (res.data.data || []).slice(0, 6)
          items.forEach(item => {
            if (item.imageUrl && item.imageUrl.startsWith('/')) {
              item.imageUrl = baseUrl + item.imageUrl
            }
          })
          this.setData({ recommends: items })
        }
      }
    })
  },

  // 报告基于聚合后的数据：展品数、累计时长、按访问次数找偏好分类
  generateReport(records) {
    let totalDuration = 0
    const categoryWeight = {}
    records.forEach(item => {
      totalDuration += item.totalDuration || 0
      const category = item.category || '其他'
      categoryWeight[category] = (categoryWeight[category] || 0) + (item.visitCount || 1)
    })
    let favoriteCategory = ''
    let max = 0
    for (const c in categoryWeight) {
      if (categoryWeight[c] > max) { max = categoryWeight[c]; favoriteCategory = c }
    }
    this.setData({
      report: {
        totalCount: records.length,
        totalDuration,
        favoriteCategory: favoriteCategory || '暂无'
      }
    })
  },

  formatTime(timeStr) {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    const pad = (n) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  },

  goToExhibit(e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `/pages/exhibit/exhibit?id=${id}` })
  },

  // 删除单个展品的所有参观记录
  removeOne(e) {
    const exhibitId = e.currentTarget.dataset.id
    const name = e.currentTarget.dataset.name || '该展品'
    const token = wx.getStorageSync('token')
    if (!token) return

    wx.showModal({
      title: '删除',
      content: `确定删除"${name}"的全部参观记录？`,
      success: (res) => {
        if (!res.confirm) return
        wx.request({
          url: `${baseUrl}/api/visit/mine/exhibit/${exhibitId}`,
          method: 'DELETE',
          header: { 'Authorization': 'Bearer ' + token },
          success: (r) => {
            if (r.data.code === 200) {
              wx.showToast({ title: '已删除', icon: 'success' })
              this.loadFootprint()
            } else {
              wx.showToast({ title: r.data.message || '删除失败', icon: 'none' })
            }
          },
          fail: () => wx.showToast({ title: '网络错误', icon: 'none' })
        })
      }
    })
  },

  // 清空全部参观记录
  clearFootprint() {
    const token = wx.getStorageSync('token')
    if (!token) return
    if (this.data.visitRecords.length === 0) {
      wx.showToast({ title: '没有可清空的记录', icon: 'none' })
      return
    }
    wx.showModal({
      title: '清空足迹',
      content: '确定清空所有参观记录？此操作不可恢复。',
      success: (res) => {
        if (!res.confirm) return
        wx.request({
          url: `${baseUrl}/api/visit/mine`,
          method: 'DELETE',
          header: { 'Authorization': 'Bearer ' + token },
          success: (r) => {
            if (r.data.code === 200) {
              wx.showToast({ title: `已清空 ${r.data.data} 条`, icon: 'success' })
              this.loadFootprint()
            }
          }
        })
      }
    })
  },

  // 阻止点击删除按钮时冒泡到 item 跳转
  noop() {},

  onPullDownRefresh() {
    this.loadFootprint()
    wx.stopPullDownRefresh()
  }
})
