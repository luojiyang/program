const app = getApp();
const url = app.globalData.url;
const { wxml, style } = require('./canvas');
Page({
  data: {
    shopList: [],   //购物车列表
    ifAll: true,   //全选框
    totalPrice: 0,   //选中商品总金额*100
    productArray: []  //商品列表
  },
  onLoad(options) {
    let shopList = JSON.parse(options.shopList)
    this.getInfo(shopList)
    this.widget = this.selectComponent('.widget');
  },
  onShow() {
    wx.hideHomeButton()
  },
  check(event) {   //选择商品
    let index = event.currentTarget.dataset.index
    let productArray = this.data.productArray
    productArray[index].ifCheck = !productArray[index].ifCheck
    let allTrue = productArray.every(item => item.ifCheck == true)
    let ifAll = allTrue ? true : false
    let totalPrice = productArray.reduce((total, item) => { if (item.ifCheck) { return total + item.total; } return total; }, 0) * 100;
    this.setData({
      productArray: productArray,
      ifAll: ifAll,
      totalPrice: totalPrice
    })
    this.changeShopList(productArray)
  },
  allSelect: function () {   //全选
    let productArray = this.data.productArray
    let ifAll = this.data.ifAll
    for (let i = 0; i < productArray.length; i++) {
      if (ifAll)
        productArray[i].ifCheck = false
      else
        productArray[i].ifCheck = true
    }
    let totalPrice = productArray.reduce((total, item) => { if (item.ifCheck) { return total + item.total; } return total; }, 0) * 100;
    this.setData({
      productArray: productArray,
      ifAll: !ifAll,
      totalPrice: totalPrice
    })
    this.changeShopList(productArray)
  },
  clearShopList: function () {  //清空购物车
    let productArray = []
    this.setData({
      productArray: productArray,
      totalPrice: 0
    })
    this.changeShopList(productArray)
  },
  getProductInfo: function (id, spec = null) {  //根据产品id(规格)获取其名称，单价，图像
    return new Promise((resolve, reject) => {
      wx.request({
        url: url + '/product/' + id,
        method: 'GET',
        success(res) {
          if (res.data.code == 20012) {
            let name = res.data.data.name;
            let value = 0;
            if (spec != null) {  //商品不止一个价格，根据规格返回相应单价
              value = res.data.data.specs.find(item => item.name == spec).value;
            } else {  //获取商品单价
              value = res.data.data.highPrice;
            }
            let pic = res.data.data.images ? res.data.data.images[0] : '';
            resolve({ name, value, pic });
          } else {
            reject(new Error('Failed to fetch product information'));
          }
        },
        fail(err) {
          reject(err);
        }
      });
    });
  },
  async getInfo(shopList) {   //遍历购物车列表，获取全部信息
    //名称，规格，单价，数量，合计，图像、是否选中
    let productArray = shopList
    for (let i = 0; i < productArray.length; i++) {
      let { name, value, pic } = await this.getProductInfo(productArray[i].id, productArray[i].specs);
      productArray[i]['name'] = name
      productArray[i]['value'] = value
      productArray[i]['image'] = pic
      productArray[i]['ifCheck'] = true
      productArray[i]['total'] = productArray[i].value * productArray[i].num
    }
    let totalPrice = productArray.reduce((total, item) => { if (item.ifCheck) { return total + item.total; } return total; }, 0) * 100
    this.setData({
      productArray: productArray,
      totalPrice: totalPrice
    })
    this.changeShopList(productArray)
  },
  delet: function (event) {   //删除某个商品
    let index = event.currentTarget.dataset.index
    let productArray = this.data.productArray
    productArray.splice(index, 1)
    let totalPrice = productArray.reduce((total, item) => { if (item.ifCheck) { return total + item.total; } return total; }, 0) * 100;
    this.setData({
      productArray: productArray,
      totalPrice: totalPrice
    })
    this.changeShopList(productArray)
  },
  changeNum: function (event) {   //商品步进器
    let index = event.currentTarget.dataset.index
    let productArray = this.data.productArray
    productArray[index].num = event.detail
    productArray[index].total = productArray[index].value * productArray[index].num
    let totalPrice = productArray.reduce((total, item) => { if (item.ifCheck) { return total + item.total; } return total; }, 0) * 100;
    this.setData({
      productArray: productArray,
      totalPrice: totalPrice
    })
    this.changeShopList(productArray)
  },
  creatOrder() {   //生成图片
    wx.showLoading({
      title: '图片生成中...',
    });
    let productArray = this.data.productArray.filter(item => { return item.ifCheck })
    let _wxml = wxml(productArray, this.data.totalPrice / 100);
    let _style = style();
    setTimeout(() => {
      const p1 = this.widget.renderToCanvas({
        wxml: _wxml,
        style: _style,
      });
      p1.then((res) => {
        this.container = res;
        wx.hideLoading();
        this.preservation();
      });
    }, 500);
  },
  preservation: function () {   //保存图片到本地
    const p2 = this.widget.canvasToTempFilePath()
    p2.then(res => {
      wx.showShareImageMenu({
        path: res.tempFilePath
      })
    }).catch(err => {
      console.log(err)
    })
  },
  changeShopList: function (productArray) {   //修改购物车全局变量
    let shopList = []
    for (let i = 0; i < productArray.length; i++) {
      shopList.push({ id: productArray[i].id, specs: productArray[i].specs, num: productArray[i].num })
    }
    app.globalData.shopList = shopList
  }
})