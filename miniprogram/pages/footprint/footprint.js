Page({
  data: {
    visitRecords: [],
    loading: false,
    report: {
      totalCount: 0,
      totalDuration: 0,
      favoriteCategory: ''
    }
  },

  onShow() {
    this.loadFootprint()
  },

  // 加载我的足迹
  loadFootprint() {
    const userId = wx.getStorageSync('userId')
    const token = wx.getStorageSync('token')
    
    if (!userId || !token) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    wx.request({
      url: `http://localhost:8081/api/visit/footprint/${userId}`,
      method: 'GET',
      header: { 
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log('足迹返回数据:', res.data)  // 调试日志
        if (res.data.code === 200) {
          let records = res.data.data || []
          // 补全图片URL和格式化时间
          records.forEach(item => {
            if (item.imageUrl && item.imageUrl.startsWith('/')) {
              item.imageUrl = 'http://localhost:8081' + item.imageUrl
            }
            // 格式化时间
            if (item.visitTime) {
              item.visitTime = this.formatTime(item.visitTime)
            }
          })
          this.setData({ visitRecords: records })
          this.generateReport(records)
        } else if (res.data.code === 401) {
          wx.showToast({ title: '请重新登录', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('加载足迹失败:', err)
        wx.showToast({ title: '加载失败', icon: 'none' })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  // 生成参观报告
  generateReport(records) {
    let totalCount = records.length
    let totalDuration = 0
    let categoryCount = {}

    records.forEach(item => {
      totalDuration += item.duration || 0
      const category = item.category || '其他'
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })

    // 找出最喜欢的分类
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
        totalCount: totalCount,
        totalDuration: totalDuration,
        favoriteCategory: favoriteCategory || '暂无'
      }
    })
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return ''
    let date = new Date(timeStr)
    let year = date.getFullYear()
    let month = String(date.getMonth() + 1).padStart(2, '0')
    let day = String(date.getDate()).padStart(2, '0')
    let hour = String(date.getHours()).padStart(2, '0')
    let minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  // 跳转展品详情
  goToExhibit(e) {
    console.log('点击事件:', e)  // 调试日志
    const id = e.currentTarget.dataset.id
    console.log('展品ID:', id)  // 调试日志
    if (id) {
      wx.navigateTo({ url: `/pages/exhibit/exhibit?id=${id}` })
    } else {
      wx.showToast({ title: '展品ID无效', icon: 'none' })
    }
  },

  // 清空足迹
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

  // 下拉刷新
  onPullDownRefresh() {
    this.loadFootprint()
    wx.stopPullDownRefresh()
  }
})