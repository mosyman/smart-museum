const { baseUrl } = require('../../utils/config.js')

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

  // 加载展品详情（404 友好提示）
  loadExhibit(id) {
    const that = this
    wx.showLoading({ title: '加载中...' })
    wx.request({
      url: `${baseUrl}/api/exhibit/${id}`,
      method: 'GET',
      success(res) {
        wx.hideLoading()
        // 后端找不到展品时 code=200 data=null
        if (res.data.code !== 200 || !res.data.data) {
          that.setData({ exhibit: null, notFound: true })
          wx.setNavigationBarTitle({ title: '展品不存在' })
          return
        }
        let exhibit = res.data.data
        if (exhibit.imageUrl && exhibit.imageUrl.startsWith('/')) {
          exhibit.imageUrl = baseUrl + exhibit.imageUrl
        } else if (!exhibit.imageUrl) {
          exhibit.imageUrl = baseUrl + '/images/default.jpg'
        }
        if (exhibit.audioUrl && exhibit.audioUrl.startsWith('/')) {
          exhibit.audioUrl = baseUrl + exhibit.audioUrl
        }
        that.setData({ exhibit, notFound: false })
        wx.setNavigationBarTitle({ title: exhibit.name })
      },
      fail() {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  goBack() {
    wx.navigateBack({ delta: 1, fail: () => wx.switchTab({ url: '/pages/index/index' }) })
  },

  // 记录参观（仅登录用户）
  recordVisit(exhibitId) {
    const userId = wx.getStorageSync('userId')
    const token = wx.getStorageSync('token')
    if (!userId || !token) return

    wx.request({
      url: `${baseUrl}/api/visit/record`,
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
      url: `${baseUrl}/api/favorite/check?userId=${userId}&exhibitId=${exhibitId}`,
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
    const exhibit = this.data.exhibit
    if (!userId || !token) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    if (!exhibit || !exhibit.id) return
    const exhibitId = exhibit.id

    const header = { 'Authorization': 'Bearer ' + token }
    if (this.data.isFavorited) {
      wx.request({
        url: `${baseUrl}/api/favorite/remove?userId=${userId}&exhibitId=${exhibitId}`,
        method: 'DELETE',
        header,
        success: (res) => {
          if (res.data.code === 200) {
            this.setData({ isFavorited: false })
            wx.showToast({ title: '已取消收藏', icon: 'success' })
          }
        }
      })
    } else {
      wx.request({
        url: `${baseUrl}/api/favorite/add`,
        method: 'POST',
        header,
        data: { userId, exhibitId },
        success: (res) => {
          if (res.data.code === 200) {
            this.setData({ isFavorited: true })
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

    innerAudioContext.onEnded(() => this.setData({ isPlaying: false }))
    innerAudioContext.onError(() => {
      this.setData({ isPlaying: false })
      wx.showToast({ title: '播放失败', icon: 'none' })
    })
  },

  stopAudio() {
    if (this.audioContext) {
      this.audioContext.stop()
      this.audioContext.destroy()
      this.setData({ isPlaying: false })
    }
  },

  // 查看 3D 模型（简化版：图片大图预览）
  viewModel3D() {
    const exhibit = this.data.exhibit
    const imageUrl = exhibit && exhibit.imageUrl
    if (!imageUrl) {
      wx.showToast({ title: '暂无展示图片', icon: 'none' })
      return
    }
    wx.previewImage({ current: imageUrl, urls: [imageUrl] })
  },

  onUnload() {
    this.stopAudio()
  }
})
