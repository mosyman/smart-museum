Page({
  data: {
  banners: [
    'http://localhost:8081/images/lunbo1.jpg',
    'http://localhost:8081/images/lunbo2.jpg',
    'http://localhost:8081/images/lunbo3.jpg'
  ],
 // 热门展品
 hotExhibits: [],
 // 推荐路线
 routes: [],
 // 加载状态
 loading: false,
 // 路线详情弹窗
 showRouteModal: false,
 currentRoute: null,
 routeExhibits: []
},

onLoad() {
 this.loadHotExhibits()
 this.loadRoutes()
},

onShow() {
 // 每次显示页面时刷新数据
 this.loadHotExhibits()
 this.loadRoutes()
},

// 加载热门展品
loadHotExhibits() {
 const that = this
 wx.request({
   url: 'http://localhost:8081/api/exhibit/hot',
   method: 'GET',
   success: (res) => {
     console.log('热门展品返回:', res.data)
     if (res.data.code === 200) {
       let exhibits = res.data.data || []
       // 补全图片URL
       exhibits.forEach(item => {
         if (item.imageUrl && item.imageUrl.startsWith('/')) {
           item.imageUrl = 'http://localhost:8081' + item.imageUrl
         }
       })
       that.setData({ hotExhibits: exhibits })
     }
   },
   fail: (err) => {
     console.log('加载热门展品失败:', err)
   }
 })
},

// 加载热门展品
loadHotExhibits() {
  const that = this
  wx.request({
    url: 'http://localhost:8081/api/exhibit/hot',
    method: 'GET',
    success: (res) => {
      console.log('热门展品返回:', res.data)
      if (res.data.code === 200) {
        let exhibits = res.data.data || []
        // 只取前3条
        exhibits = exhibits.slice(0, 3)
        // 补全图片URL
        exhibits.forEach(item => {
          if (item.imageUrl && item.imageUrl.startsWith('/')) {
            item.imageUrl = 'http://localhost:8081' + item.imageUrl
          }
        })
        that.setData({ hotExhibits: exhibits })
      }
    },
    fail: (err) => {
      console.log('加载热门展品失败:', err)
    }
  })
},

// 获取展品列表（用于路线详情）
getExhibitsByIds(ids, callback) {
  console.log('========== getExhibitsByIds 开始 ==========')
  console.log('要查询的展品IDs:', ids)
  
  if (!ids || ids.length === 0) {
    console.log('ids为空，返回空数组')
    callback([])
    return
  }
  
  const that = this
  wx.request({
    url: 'http://localhost:8081/api/exhibit/list',
    method: 'GET',
    success: (res) => {
      console.log('展品列表接口返回:', res.data)
      if (res.data.code === 200) {
        const allExhibits = res.data.data || []
        console.log('所有展品数量:', allExhibits.length)
        console.log('所有展品ID列表:', allExhibits.map(item => item.id))
        
        // 过滤出路线中的展品
        const exhibits = allExhibits.filter(item => ids.includes(item.id))
        console.log('匹配到的展品数量:', exhibits.length)
        console.log('匹配到的展品:', exhibits)
        
        // 补全图片URL
        exhibits.forEach(item => {
          if (item.imageUrl && item.imageUrl.startsWith('/')) {
            item.imageUrl = 'http://localhost:8081' + item.imageUrl
          }
        })
        callback(exhibits)
      } else {
        console.log('获取展品列表失败，code:', res.data.code)
        callback([])
      }
    },
    fail: (err) => {
      console.log('请求失败:', err)
      callback([])
    }
  })
},

// 跳转馆藏集珍（所有展品）
goToCollection() {
  wx.navigateTo({ url: '/pages/collection/collection' })
},

// 加载推荐路线
loadRoutes() {
  const that = this
  wx.request({
    url: 'http://localhost:8081/api/route/list',
    method: 'GET',
    success: (res) => {
      if (res.data.code === 200) {
        let routes = res.data.data || []
        that.setData({ routes: routes.slice(0, 3) })
      }
    }
  })
},

// 显示路线详情弹窗
showRouteDetail(routeId) {
  console.log('========== showRouteDetail 开始 ==========')
  console.log('路线ID:', routeId)
  
  const that = this
  wx.request({
    url: `http://localhost:8081/api/route/${routeId}`,
    method: 'GET',
    success: (res) => {
      console.log('路线详情接口返回:', res.data)
      if (res.data.code === 200) {
        const route = res.data.data
        console.log('路线名称:', route.name)
        console.log('原始waypoints字段:', route.waypoints)
        console.log('waypoints类型:', typeof route.waypoints)
        
        // 解析途经展品ID
        let waypointIds = []
        if (route.waypoints) {
          try {
            // 如果 waypoints 是字符串，尝试解析
            if (typeof route.waypoints === 'string') {
              waypointIds = JSON.parse(route.waypoints)
              console.log('字符串解析后的IDs:', waypointIds)
            } else if (Array.isArray(route.waypoints)) {
              waypointIds = route.waypoints
              console.log('已经是数组:', waypointIds)
            }
          } catch (e) {
            console.log('解析waypoints失败:', e)
            waypointIds = []
          }
        } else {
          console.log('waypoints为空')
        }
        
        // 获取展品详情
        that.getExhibitsByIds(waypointIds, (exhibits) => {
          console.log('最终获取到的展品详情数量:', exhibits.length)
          console.log('最终展品详情:', exhibits)
          that.setData({
            showRouteModal: true,
            currentRoute: route,
            routeExhibits: exhibits
          })
        })
      } else {
        console.log('获取路线详情失败:', res.data.message)
        wx.showToast({ title: '获取路线详情失败', icon: 'none' })
      }
    },
    fail: (err) => {
      console.log('网络请求失败:', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    }
  })
},

// 关闭路线弹窗
closeRouteModal() {
 this.setData({ showRouteModal: false })
},

// 阻止冒泡（防止点击弹窗内容时关闭）
stopPropagation() {},

// 开始导航
startNavigation() {
 const route = this.data.currentRoute
 if (route) {
   this.closeRouteModal()
   wx.navigateTo({ url: `/pages/map/map?routeId=${route.id}` })
 }
},

// ========== 页面跳转方法 ==========

// 跳转地图导览
goToMap() {
 wx.navigateTo({ url: '/pages/map/map' })
},

// 扫码讲解
scanQRCode() {
 wx.scanCode({
   success: (res) => {
     console.log('扫码结果:', res.result)
     // 假设二维码内容为展品ID
     const exhibitId = parseInt(res.result)
     if (exhibitId) {
       wx.navigateTo({ url: `/pages/exhibit/exhibit?id=${exhibitId}` })
     } else {
       wx.showToast({ title: '无效的二维码', icon: 'none' })
     }
   },
   fail: () => {
     wx.showToast({ title: '扫码失败', icon: 'none' })
   }
 })
},

// 跳转我的足迹
goToFootprint() {
 const token = wx.getStorageSync('token')
 if (!token) {
   wx.showToast({ title: '请先登录', icon: 'none' })
   return
 }
 wx.navigateTo({ url: '/pages/footprint/footprint' })
},

// 跳转推荐路线（地图页）
goToRecommend() {
 wx.navigateTo({ url: '/pages/map/map' })
},

// 跳转展品详情
goToExhibit(e) {
 const id = e.currentTarget.dataset.id
 if (id) {
   wx.navigateTo({ url: `/pages/exhibit/exhibit?id=${id}` })
 }
},

// 点击路线（显示详情弹窗）
goToRoute(e) {
 const id = e.currentTarget.dataset.id
 if (id) {
   this.showRouteDetail(id)
 } else {
   wx.showToast({ title: '路线ID无效', icon: 'none' })
 }
},

// 图片加载失败时使用默认图片
onImageError(e) {
 const index = e.currentTarget.dataset.index
 const hotExhibits = this.data.hotExhibits
 if (hotExhibits[index] && hotExhibits[index].imageUrl) {
   hotExhibits[index].imageUrl = 'http://localhost:8081/images/default.jpg'
   this.setData({ hotExhibits })
 }
}
})