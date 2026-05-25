Component({
  properties: {
    current: {
      type: Number,
      value: 0
    }
  },
  data: {},
  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index
      const pages = [
        '/pages/index/index',
        '/pages/map/map',
        '/pages/footprint/footprint',
        '/pages/user/user'
      ]
      if (index !== this.properties.current) {
        wx.switchTab({ url: pages[index] })
      }
    }
  }
})