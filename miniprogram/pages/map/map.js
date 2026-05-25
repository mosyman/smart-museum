const { baseUrl } = require('../../utils/config.js')
const { floorPlanDataUrl } = require('./floorplans.js')

Page({
  data: {
    currentFloor: 1,
    floors: [1, 2, 3],

    exhibits: [],          // 所有展品（带百分比定位前的原始数据）
    floorExhibits: [],     // 当前楼层展品（已加 pctX/pctY/visited/routeIdx）

    routes: [],
    selectedRoute: null,
    waypointIds: [],
    routeWaypointsOnFloor: [], // 当前楼层路线点（按顺序），供 SVG 路径绘制
    onFloorCount: 0,           // 路线在当前楼层共多少站

    visitedIds: [],
    floorPlanUrl: '',
    showRoute: false
  },

  onLoad(options) {
    if (options.routeId) this.pendingRouteId = options.routeId
    this.loadRoutes()
    this.loadExhibits()
  },

  onShow() {
    this.loadVisited()
  },

  loadExhibits() {
    wx.request({
      url: `${baseUrl}/api/exhibit/list`,
      method: 'GET',
      success: (res) => {
        if (res.data.code !== 200) return
        const exhibits = (res.data.data || []).map(item => ({
          ...item,
          imageUrl: item.imageUrl && item.imageUrl.startsWith('/')
            ? baseUrl + item.imageUrl
            : item.imageUrl
        }))
        this.setData({ exhibits })
        if (this.pendingRouteId) {
          const r = this.pendingRouteId
          this.pendingRouteId = null
          this.loadRouteDetail(r)
        } else {
          this.refreshFloor()
        }
      }
    })
  },

  loadRoutes() {
    wx.request({
      url: `${baseUrl}/api/route/list`,
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) this.setData({ routes: res.data.data || [] })
      }
    })
  },

  loadVisited() {
    const userId = wx.getStorageSync('userId')
    const token = wx.getStorageSync('token')
    if (!userId || !token) {
      this.setData({ visitedIds: [] })
      if (this.data.exhibits.length > 0) this.refreshFloor()
      return
    }
    wx.request({
      url: `${baseUrl}/api/visit/footprint/${userId}`,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + token },
      success: (res) => {
        if (res.data.code === 200) {
          const ids = (res.data.data || []).map(r => r.exhibitId)
          this.setData({ visitedIds: ids })
          if (this.data.exhibits.length > 0) this.refreshFloor()
        }
      }
    })
  },

  loadRouteDetail(routeId) {
    wx.request({
      url: `${baseUrl}/api/route/${routeId}`,
      method: 'GET',
      success: (res) => {
        if (res.data.code !== 200) return
        const route = res.data.data
        let waypointIds = []
        try {
          waypointIds = typeof route.waypoints === 'string'
            ? JSON.parse(route.waypoints || '[]')
            : (Array.isArray(route.waypoints) ? route.waypoints : [])
        } catch (e) { waypointIds = [] }

        // 自动切到首个 waypoint 楼层（若当前楼层无 waypoint）
        let nextFloor = this.data.currentFloor
        if (waypointIds.length > 0) {
          const hasOnCurrent = this.data.exhibits.some(
            e => waypointIds.includes(e.id) && e.locationFloor === this.data.currentFloor
          )
          if (!hasOnCurrent) {
            const first = this.data.exhibits.find(e => e.id === waypointIds[0])
            if (first && first.locationFloor) nextFloor = first.locationFloor
          }
        }

        this.setData({
          selectedRoute: route,
          waypointIds,
          showRoute: true,
          currentFloor: nextFloor
        })
        this.refreshFloor()
      }
    })
  },

  /**
   * 重算当前楼层的视图数据。
   * 给每个展品计算 pctX/pctY/visited/routeIdx，
   * 拼出当前楼层的路线点序列供 SVG 画虚线。
   */
  refreshFloor() {
    const { exhibits, currentFloor, waypointIds, visitedIds, showRoute } = this.data

    const floorExhibits = exhibits
      .filter(e => e.locationFloor === currentFloor)
      .map(e => {
        const i = waypointIds.indexOf(e.id)
        return {
          ...e,
          pctX: (e.positionX / 400) * 100,
          pctY: (e.positionY / 300) * 100,
          visited: visitedIds.includes(e.id),
          routeIdx: i >= 0 ? i + 1 : 0
        }
      })

    const onFloor = []
    if (showRoute && waypointIds.length > 0) {
      waypointIds.forEach((wid, idx) => {
        const e = exhibits.find(ex => ex.id === wid)
        if (e && e.locationFloor === currentFloor) {
          onFloor.push({ x: e.positionX, y: e.positionY, idx: idx + 1 })
        }
      })
    }

    this.setData({
      floorExhibits,
      routeWaypointsOnFloor: onFloor,
      onFloorCount: onFloor.length,
      floorPlanUrl: floorPlanDataUrl(currentFloor, onFloor)
    })
  },

  switchFloor(e) {
    this.setData({ currentFloor: Number(e.currentTarget.dataset.floor) })
    this.refreshFloor()
  },

  onRouteChange(e) {
    const idx = Number(e.detail.value)
    const route = this.data.routes[idx]
    if (route && route.id) {
      this.loadRouteDetail(route.id)
    } else {
      this.clearRoute()
    }
  },

  clearRoute() {
    this.setData({
      selectedRoute: null,
      waypointIds: [],
      showRoute: false
    })
    this.refreshFloor()
  },

  goToExhibit(e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: `/pages/exhibit/exhibit?id=${id}` })
  },

  startNavigation() {
    if (!this.data.selectedRoute) {
      wx.showToast({ title: '请先选择路线', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: `/pages/navigation/navigation?routeId=${this.data.selectedRoute.id}`
    })
  }
})
