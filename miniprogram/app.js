const { baseUrl } = require('./utils/config.js')

App({
  globalData: {
    userInfo: null,
    userId: null,
    token: null,
    baseUrl: `${baseUrl}/api`
  },

  onLaunch() {
    const token = wx.getStorageSync('token')
    const userId = wx.getStorageSync('userId')
    const userInfo = wx.getStorageSync('userInfo')

    if (token && userId && userInfo) {
      this.globalData.token = token
      this.globalData.userId = userId
      this.globalData.userInfo = userInfo
    }
  },

  userLogin(userData) {
    this.globalData.token = userData.token
    this.globalData.userId = userData.id
    this.globalData.userInfo = userData
    wx.setStorageSync('token', userData.token)
    wx.setStorageSync('userId', userData.id)
    wx.setStorageSync('userInfo', userData)
  },

  logout() {
    this.globalData.token = null
    this.globalData.userId = null
    this.globalData.userInfo = null
    wx.removeStorageSync('token')
    wx.removeStorageSync('userId')
    wx.removeStorageSync('userInfo')
  }
})
