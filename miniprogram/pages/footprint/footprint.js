const { baseUrl } = require('../../utils/config.js')

Page({
  data: {
    visitRecords: [],
    recommends: [],
    loading: false,
    defaultImg: `${baseUrl}/images/default.jpg`,
    report: {
      totalCount: 0,
      totalDuration: 0,
      favoriteCategory: ''
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
      header: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.data.code === 200) {
          let records = res.data.data || []
          records.forEach(item => {
            if (item.imageUrl && item.imageUrl.startsWith('/')) {
              item.imageUrl = baseUrl + item.imageUrl
            }
            if (item.visitTime) {
              item.visitTime = this.formatTime(item.visitTime)
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

  // 加载基于参观历史的推荐
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

  generateReport(records) {
    let totalCount = records.length
    let totalDuration = 0
    let categoryCount = {}

    records.forEach(item => {
      totalDuration += item.duration || 0
      const category = item.category || '其他'
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })

    let favoriteCategory = ''
    let maxCount = 0
    for (let category in categoryCount) {
      if (categoryCount[category] > maxCount) {
        maxCount = categoryCount[category]
        favoriteCategory = category
      }
    }

    this.setData({
      report: {
        totalCount,
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
    if (id) {
      wx.navigateTo({ url: `/pages/exhibit/exhibit?id=${id}` })
    } else {
      wx.showToast({ title: '展品ID无效', icon: 'none' })
    }
  },

  clearFootprint() {
    wx.showModal({
      title: '提示',
      content: '确定要清空所有参观记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '功能开发中', icon: 'none' })
        }
      }
    })
  },

  onPullDownRefresh() {
    this.loadFootprint()
    wx.stopPullDownRefresh()
  }
})
