const { baseUrl } = require('../../utils/config.js')

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
    this.loadFavorites()
  },

  loadExhibits(isLoadMore = false) {
    if (this.data.loading) return
    if (!isLoadMore) {
      this.setData({ page: 1, exhibits: [], hasMore: true })
    }
    if (!this.data.hasMore && isLoadMore) return

    this.setData({ loading: true })
    const that = this

    wx.request({
      url: `${baseUrl}/api/exhibit/list`,
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          let allExhibits = res.data.data || []
          allExhibits.forEach(item => {
            if (item.imageUrl && item.imageUrl.startsWith('/')) {
              item.imageUrl = baseUrl + item.imageUrl
            }
            item.isFavorited = that.data.favorites.includes(item.id)
          })

          const start = (that.data.page - 1) * that.data.pageSize
          const newExhibits = allExhibits.slice(start, start + that.data.pageSize)

          that.setData({
            exhibits: isLoadMore ? [...that.data.exhibits, ...newExhibits] : newExhibits,
            hasMore: start + that.data.pageSize < allExhibits.length,
            page: that.data.page + 1
          })
        }
      },
      fail: () => wx.showToast({ title: '加载失败', icon: 'none' }),
      complete: () => this.setData({ loading: false })
    })
  },

  loadFavorites() {
    const userId = wx.getStorageSync('userId')
    const token = wx.getStorageSync('token')
    if (!userId || !token) {
      this.setData({ favorites: [] })
      return
    }

    wx.request({
      url: `${baseUrl}/api/favorite/list/${userId}`,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + token },
      success: (res) => {
        if (res.data.code === 200) {
          const favorites = res.data.data || []
          const favoriteIds = favorites.map(item => item.exhibitId)
          this.setData({ favorites: favoriteIds })
          this.updateFavoriteStatus()
        }
      }
    })
  },

  updateFavoriteStatus() {
    const exhibits = this.data.exhibits
    exhibits.forEach(item => {
      item.isFavorited = this.data.favorites.includes(item.id)
    })
    this.setData({ exhibits })
  },

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
    const header = { 'Authorization': 'Bearer ' + token }

    if (isFavorited) {
      wx.request({
        url: `${baseUrl}/api/favorite/remove?userId=${userId}&exhibitId=${exhibitId}`,
        method: 'DELETE',
        header,
        success: (res) => {
          if (res.data.code === 200) {
            exhibit.isFavorited = false
            this.setData({ exhibits: this.data.exhibits })
            wx.showToast({ title: '已取消收藏', icon: 'success' })
            this.loadFavorites()
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
            exhibit.isFavorited = true
            this.setData({ exhibits: this.data.exhibits })
            wx.showToast({ title: '收藏成功', icon: 'success' })
            this.loadFavorites()
          }
        }
      })
    }
  },

  goToExhibit(e) {
    const id = e.currentTarget.dataset.id
    if (id) {
      wx.navigateTo({ url: `/pages/exhibit/exhibit?id=${id}` })
    } else {
      wx.showToast({ title: '展品ID无效', icon: 'none' })
    }
  },

  loadMore() {
    this.loadExhibits(true)
  }
})
