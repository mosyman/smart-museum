Page({
  data: {
    exhibit: null,
    isFavorited: false,
    isPlaying: false
  },

  onLoad(options) {
    const id = options.id
    if (id) {
      this.loadExhibit(id)
      this.checkFavorite(id)
      this.recordVisit(id)
    }
  },

 // 加载展品详情
loadExhibit(id) {
  const that = this
  wx.showLoading({ title: '加载中...' })
  wx.request({
    url: `http://localhost:8081/api/exhibit/${id}`,
    method: 'GET',
    success(res) {
      wx.hideLoading()
      if (res.data.code === 200) {
        let exhibit = res.data.data
        // 补全图片URL - 关键修改
        if (exhibit.imageUrl) {
          if (exhibit.imageUrl.startsWith('/')) {
            exhibit.imageUrl = 'http://localhost:8081' + exhibit.imageUrl
          }
        } else {
          exhibit.imageUrl = 'http://localhost:8081/images/default.jpg'
        }
        that.setData({ exhibit: exhibit })
        wx.setNavigationBarTitle({ title: exhibit.name })
      } else {
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    fail() {
      wx.hideLoading()
      wx.showToast({ title: '网络错误', icon: 'none' })
    }
  })
},

  // 检查是否收藏
  checkFavorite(exhibitId) {
    const userId = wx.getStorageSync('userId')
    if (!userId) return
    const that = this
    wx.request({
      url: `http://localhost:8081/api/favorite/check?userId=${userId}&exhibitId=${exhibitId}`,
      method: 'GET',
      success(res) {
        if (res.data.code === 200) {
          that.setData({ isFavorited: res.data.data })
        }
      }
    })
  },

// 记录参观（仅登录用户）
recordVisit(exhibitId) {
  const userId = wx.getStorageSync('userId')
  const token = wx.getStorageSync('token')
  
  if (!userId || !token) {
    console.log('未登录，不记录参观')
    return
  }
  
  wx.request({
    url: 'http://localhost:8081/api/visit/record',
    method: 'POST',
    header: { 'Authorization': 'Bearer ' + token },
    data: { userId, exhibitId, duration: 30 }
  })
},

// 检查是否收藏（仅登录用户）
checkFavorite(exhibitId) {
  const userId = wx.getStorageSync('userId')
  const token = wx.getStorageSync('token')
  
  if (!userId || !token) {
    this.setData({ isFavorited: false })
    return
  }
  
  wx.request({
    url: `http://localhost:8081/api/favorite/check?userId=${userId}&exhibitId=${exhibitId}`,
    method: 'GET',
    header: { 'Authorization': 'Bearer ' + token },
    success: (res) => {
      if (res.data.code === 200) {
        this.setData({ isFavorited: res.data.data })
      }
    }
  })
},

// 收藏/取消收藏（仅登录用户）
toggleFavorite() {
  const userId = wx.getStorageSync('userId')
  const token = wx.getStorageSync('token')
  
  if (!userId || !token) {
    wx.showToast({ title: '请先登录', icon: 'none' })
    return
  }

    const that = this
    if (this.data.isFavorited) {
      wx.request({
        url: `http://localhost:8081/api/favorite/remove?userId=${userId}&exhibitId=${exhibitId}`,
        method: 'DELETE',
        success(res) {
          if (res.data.code === 200) {
            that.setData({ isFavorited: false })
            wx.showToast({ title: '已取消收藏', icon: 'success' })
          }
        }
      })
    } else {
      wx.request({
        url: 'http://localhost:8081/api/favorite/add',
        method: 'POST',
        data: { userId, exhibitId },
        success(res) {
          if (res.data.code === 200) {
            that.setData({ isFavorited: true })
            wx.showToast({ title: '收藏成功', icon: 'success' })
          }
        }
      })
    }
  },

  // 播放语音讲解
  playAudio() {
    const audioUrl = this.data.exhibit.audioUrl
    if (!audioUrl) {
      wx.showToast({ title: '暂无语音讲解', icon: 'none' })
      return
    }

    if (this.data.isPlaying) {
      this.stopAudio()
      return
    }

    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = audioUrl
    innerAudioContext.play()
    this.setData({ isPlaying: true })
    this.audioContext = innerAudioContext

    innerAudioContext.onEnded(() => {
      this.setData({ isPlaying: false })
    })

    innerAudioContext.onError(() => {
      this.setData({ isPlaying: false })
      wx.showToast({ title: '播放失败', icon: 'none' })
    })
  },

  // 停止播放
  stopAudio() {
    if (this.audioContext) {
      this.audioContext.stop()
      this.audioContext.destroy()
      this.setData({ isPlaying: false })
    }
  },

  // 查看3D模型
  viewModel3D() {
    const modelUrl = this.data.exhibit.model3dUrl
    if (!modelUrl) {
      wx.showToast({ title: '暂无3D模型', icon: 'none' })
      return
    }
    // 跳转到3D展示页面
    wx.navigateTo({ url: `/pages/ar/ar?url=${modelUrl}` })
  },

  onUnload() {
    this.stopAudio()
  }
})