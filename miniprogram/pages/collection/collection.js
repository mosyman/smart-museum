Page({
  data: {
    exhibits: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    favorites: []
  },

  onLoad() {
    this.loadExhibits()
    this.loadFavorites()
  },

  onShow() {
    // 每次显示页面时刷新收藏状态
    this.loadFavorites()
  },

  // 加载所有展品
  loadExhibits(isLoadMore = false) {
    if (this.data.loading) return
    if (!isLoadMore) {
      this.setData({ page: 1, exhibits: [], hasMore: true })
    }
    if (!this.data.hasMore && isLoadMore) return

    this.setData({ loading: true })
    const that = this

    wx.request({
      url: 'http://localhost:8081/api/exhibit/list',
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          let allExhibits = res.data.data || []
          // 补全图片URL
          allExhibits.forEach(item => {
            if (item.imageUrl && item.imageUrl.startsWith('/')) {
              item.imageUrl = 'http://localhost:8081' + item.imageUrl
            }
            // 添加收藏标记
            item.isFavorited = that.data.favorites.includes(item.id)
          })
          
          // 分页处理
          const start = (that.data.page - 1) * that.data.pageSize
          const newExhibits = allExhibits.slice(start, start + that.data.pageSize)
          
          that.setData({
            exhibits: isLoadMore ? [...that.data.exhibits, ...newExhibits] : newExhibits,
            hasMore: start + that.data.pageSize < allExhibits.length,
            page: that.data.page + 1
          })
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

  // 加载用户收藏
  loadFavorites() {
    const userId = wx.getStorageSync('userId')
    const token = wx.getStorageSync('token')
    
    if (!userId || !token) {
      this.setData({ favorites: [] })
      return
    }

    wx.request({
      url: `http://localhost:8081/api/favorite/list/${userId}`,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + token },
      success: (res) => {
        if (res.data.code === 200) {
          const favorites = res.data.data || []
          const favoriteIds = favorites.map(item => item.exhibitId)
          this.setData({ favorites: favoriteIds })
          // 更新展品收藏状态
          this.updateFavoriteStatus()
        }
      }
    })
  },

  // 更新展品收藏状态
  updateFavoriteStatus() {
    const exhibits = this.data.exhibits
    exhibits.forEach(item => {
      item.isFavorited = this.data.favorites.includes(item.id)
    })
    this.setData({ exhibits })
  },

  // 收藏/取消收藏
  toggleFavorite(e) {
    const exhibitId = e.currentTarget.dataset.id
    const userId = wx.getStorageSync('userId')
    const token = wx.getStorageSync('token')
    
    if (!userId || !token) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    const exhibit = this.data.exhibits.find(item => item.id === exhibitId)
    const isFavorited = exhibit.isFavorited

    const that = this
    if (isFavorited) {
      wx.request({
        url: `http://localhost:8081/api/favorite/remove?userId=${userId}&exhibitId=${exhibitId}`,
        method: 'DELETE',
        header: { 'Authorization': 'Bearer ' + token },
        success: (res) => {
          if (res.data.code === 200) {
            exhibit.isFavorited = false
            that.setData({ exhibits: that.data.exhibits })
            wx.showToast({ title: '已取消收藏', icon: 'success' })
            // 刷新收藏列表
            that.loadFavorites()
          }
        }
      })
    } else {
      wx.request({
        url: 'http://localhost:8081/api/favorite/add',
        method: 'POST',
        header: { 'Authorization': 'Bearer ' + token },
        data: { userId, exhibitId },
        success: (res) => {
          if (res.data.code === 200) {
            exhibit.isFavorited = true
            that.setData({ exhibits: that.data.exhibits })
            wx.showToast({ title: '收藏成功', icon: 'success' })
            // 刷新收藏列表
            that.loadFavorites()
          }
        }
      })
    }
  },

// 跳转展品详情
goToExhibit(e) {
  console.log('========== goToExhibit 被调用了 ==========')
  console.log('事件对象:', e)
  const id = e.currentTarget.dataset.id
  console.log('获取到的展品ID:', id)
  if (id) {
    console.log('准备跳转到:', `/pages/exhibit/exhibit?id=${id}`)
    wx.navigateTo({
      url: `/pages/exhibit/exhibit?id=${id}`,
      success: () => {
        console.log('跳转成功')
      },
      fail: (err) => {
        console.log('跳转失败:', err)
      }
    })
  } else {
    console.log('展品ID为空，无法跳转')
    wx.showToast({ title: '展品ID无效', icon: 'none' })
  }
},


  // 加载更多
  loadMore() {
    this.loadExhibits(true)
  }
})