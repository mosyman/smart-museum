Page({
  data: {
    favorites: [],
    loading: false
  },

  onShow() {
    this.loadFavorites()
  },

  // 加载收藏列表
  loadFavorites() {
    const userId = wx.getStorageSync('userId')
    const token = wx.getStorageSync('token')
    
    if (!userId || !token) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    wx.request({
      url: `http://localhost:8081/api/favorite/list/${userId}`,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + token },
      success: (res) => {
        if (res.data.code === 200) {
          let favorites = res.data.data || []
          // 补全图片URL
          favorites.forEach(item => {
            if (item.imageUrl && item.imageUrl.startsWith('/')) {
              item.imageUrl = 'http://localhost:8081' + item.imageUrl
            }
          })
          this.setData({ favorites: favorites })
        }
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  // 取消收藏
  removeFavorite(e) {
    const exhibitId = e.currentTarget.dataset.id
    const userId = wx.getStorageSync('userId')
    const token = wx.getStorageSync('token')

    wx.showModal({
      title: '提示',
      content: '确定要取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `http://localhost:8081/api/favorite/remove?userId=${userId}&exhibitId=${exhibitId}`,
            method: 'DELETE',
            header: { 'Authorization': 'Bearer ' + token },
            success: (res) => {
              if (res.data.code === 200) {
                wx.showToast({ title: '已取消收藏', icon: 'success' })
                this.loadFavorites() // 刷新列表
              }
            }
          })
        }
      }
    })
  },

  // 跳转展品详情
  goToExhibit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/exhibit/exhibit?id=${id}` })
  }
})