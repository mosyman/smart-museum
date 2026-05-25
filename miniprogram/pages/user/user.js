const app = getApp()
const { baseUrl } = require('../../utils/config.js')

Page({
  data: {
    isLogin: false,
    userInfo: null,
    favoriteCount: 0,
    visitCount: 0,
    showLogin: false,
    loginTab: 'login',
    loginUsername: '',
    loginPassword: '',
    regUsername: '',
    regPassword: '',
    regNickname: ''
  },

  onShow() {
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userId = wx.getStorageSync('userId')
    const userInfo = wx.getStorageSync('userInfo')
    
    if (token && userId && userInfo) {
      this.setData({ 
        isLogin: true,
        userInfo: userInfo 
      })
      this.loadUserStats(userId)
    } else {
      this.setData({ isLogin: false })
    }
  },

  // 加载用户统计数据
  loadUserStats(userId) {
    const token = wx.getStorageSync('token')
    
    wx.request({
      url: `${baseUrl}/api/favorite/list/${userId}`,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + token },
      success: (res) => {
        if (res.data.code === 200) {
          const favorites = res.data.data || []
          this.setData({ favoriteCount: favorites.length })
        }
      }
    })

    wx.request({
      url: `${baseUrl}/api/visit/footprint/${userId}`,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + token },
      success: (res) => {
        if (res.data.code === 200) {
          const records = res.data.data || []
          this.setData({ visitCount: records.length })
        }
      }
    })
  },

  // 登录成功处理
  handleLoginSuccess(userData) {
    app.userLogin(userData)
    this.setData({ 
      isLogin: true,
      userInfo: userData,
      showLogin: false 
    })
    this.loadUserStats(userData.id)
    wx.showToast({ title: '登录成功', icon: 'success' })
  },

  // 登录
  handleLogin() {
    const loginUsername = (this.data.loginUsername || '').trim()
    const loginPassword = this.data.loginPassword || ''
    if (!loginUsername || !loginPassword) {
      wx.showToast({ title: '请填写用户名和密码', icon: 'none' })
      return
    }

    wx.showLoading({ title: '登录中...' })
    wx.request({
      url: `${baseUrl}/api/user/login`,
      method: 'POST',
      data: { username: loginUsername, password: loginPassword },
      success: (res) => {
        wx.hideLoading()
        if (res.data.code === 200) {
          this.handleLoginSuccess(res.data.data)
        } else {
          wx.showToast({ title: res.data.message || '登录失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  // 注册
  handleRegister() {
    const regUsername = (this.data.regUsername || '').trim()
    const regPassword = this.data.regPassword || ''
    const regNickname = (this.data.regNickname || '').trim()
    if (!regUsername || !regPassword) {
      wx.showToast({ title: '请填写用户名和密码', icon: 'none' })
      return
    }

    wx.showLoading({ title: '注册中...' })
    wx.request({
      url: `${baseUrl}/api/user/register`,
      method: 'POST',
      data: { 
        username: regUsername, 
        password: regPassword,
        nickname: regNickname || regUsername,
        role: 'tourist'
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data.code === 200) {
          wx.showToast({ title: '注册成功，请登录', icon: 'success' })
          this.setData({ loginTab: 'login', regUsername: '', regPassword: '', regNickname: '' })
        } else {
          wx.showToast({ title: res.data.message || '注册失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout()
          this.setData({ 
            isLogin: false,
            userInfo: null,
            visitCount: 0,
            favoriteCount: 0
          })
          wx.showToast({ title: '已退出登录', icon: 'success' })
        }
      }
    })
  },

  // 跳转收藏列表
  goToFavorites() {
    if (!this.data.isLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/favorite/favorite' })
  },

  // 跳转足迹（tabBar 页面用 switchTab）
  goToFootprint() {
    if (!this.data.isLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.switchTab({ url: '/pages/footprint/footprint' })
  },

  // 显示登录弹窗
  showLoginDialog() {
    this.setData({ showLogin: true })
  },

  // 关闭登录弹窗
  closeLoginDialog() {
    this.setData({ showLogin: false, loginTab: 'login' })
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ loginTab: tab })
  },

  // 阻止冒泡
  stopPropagation() {},

  // 输入框绑定
  onLoginUsernameInput(e) {
    this.setData({ loginUsername: e.detail.value })
  },
  onLoginPasswordInput(e) {
    this.setData({ loginPassword: e.detail.value })
  },
  onRegUsernameInput(e) {
    this.setData({ regUsername: e.detail.value })
  },
  onRegPasswordInput(e) {
    this.setData({ regPassword: e.detail.value })
  },
  onRegNicknameInput(e) {
    this.setData({ regNickname: e.detail.value })
  }
})