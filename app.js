App({
  globalData: {
    url: 'http://ljwzcc2.tpddns.cn:8888',
    pages:[
      "pages/classification/classification",
      "pages/newProduct/newProduct",
      "pages/video/video",
      "pages/order/order",
    ],
    shopList:[],   //购物车全局变量
  },
  onHide: function () {
    wx.redirectTo({
      url: '/pages/classification/classification',
    })
  }
})
