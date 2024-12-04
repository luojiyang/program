const app = getApp();
const url = app.globalData.url;
const { wxml, style } = require('./canvas');
Page({
  data: {
    id: -1,   //商品id
    productList: [],   //滑动商品id列表
    product: {},   //商品信息
    phone: '',
  },
  onLoad(options) {
    let id = options.id
    let productList = JSON.parse(options.productList)
    this.setData({
      id: id,
      productList: productList
    })
    this.getSellerInfo()
    this.getInfo()
    this.widget = this.selectComponent('.widget');
    wx.showShareMenu({
      withShareTicket: true
    });
  },
  getServerData() {   //生成图片
    wx.showLoading({
      title: '图片生成中...',
    });
    let image = this.data.product.images[0]
    let name = this.data.product.name
    let _wxml
    let _style
    if (this.data.product.specs != null) {
      let specs = this.data.product.specs.filter(item => item.active).map(item => item.name)
      let value = this.data.product.specs.filter(item => item.active).map(item => item.value)
      let styles = {   //这里设定规格宽度
        specsWidth: specs.toString().replace(/[\u0391-\uFFE5]/g, "aa").length * 12
      }
      _wxml = wxml(image, name, specs, value);
      _style = style(styles)
    }
    else {
      let value = this.data.product.highPrice
      _wxml = wxml(image, name, null, value);
      _style = style()
    }
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
  onShow() {
    wx.hideHomeButton()
  },
  getSellerInfo: function () {   //获取卖家信息
    let that = this
    wx.request({
      url: url + '/user',
      method: 'GET',
      success(res) {
        if (res.data.code == 20000) {
          let phone = res.data.data.phone
          that.setData({
            phone: phone
          })
        }
      }
    })
  },
  getInfo: function () {   //获取产品信息
    let that = this
    wx.request({
      url: url + '/product/' + that.data.id,
      method: 'GET',
      success(res) {
        if (res.data.code == 20012) {
          let product = res.data.data
          if (product.specs != null) {
            for (let i = 0; i < product.specs.length; i++)
              product.specs[i]['active'] = false
            product.specs[0]['active'] = true
          }
          that.setData({
            product: product
          })
        }
      }
    })
  },
  lastProduct: function () {   //上一个商品
    let that = this
    let index = that.data.productList.indexOf(parseInt(that.data.id))
    if (index == 0)
      wx.showModal({
        title: '提示',
        content: '当前展示第一个商品，无上一个商品！',
        showCancel: false
      })
    else {
      this.setData({
        id: that.data.productList[index - 1]
      })
      this.getInfo()
    }
  },
  nextProduct: function () {   //下一个商品
    let that = this
    let index = that.data.productList.indexOf(that.data.id)
    if (index == that.data.productList.length - 1)
      wx.showModal({
        title: '提示',
        content: '当前展示最后一个商品，无下一个商品！',
        showCancel: false
      })
    else {
      this.setData({
        id: that.data.productList[index + 1]
      })
      that.getInfo()
    }
  },
  chooseSpec: function (event) {   //选择规格
    let index = event.currentTarget.dataset.index
    let product = this.data.product
    for (let i = 0; i < product.specs.length; i++)
      product.specs[i].active = false
    product.specs[index].active = true
    this.setData({
      product: product
    })
  },
  onClick(event) {   //分享\咨询\回到主页
    if (event.detail == 0) {
      this.getServerData()
    }
    else if (event.detail == 1) {
      wx.navigateBack({
        delta: 1
      })
    }
    else {
      wx.makePhoneCall({
        phoneNumber: this.data.phone
      })
    }
  },
  preservation() {   //保存图片到本地或收藏
    const p2 = this.widget.canvasToTempFilePath()
    p2.then(res => {
      wx.showShareImageMenu({
        path: res.tempFilePath
      })
    }).catch(err => {
      console.log(err)
    })
  },
  clickTopImg: function (e) {   //顶图预览
    var imgUrl = this.data.product.avatar;
    wx.previewImage({
      urls: [imgUrl],
      current: '',
    })
  },
  clickImg: function (e) {   //详情图预览
    let url = e.target.dataset.pic
    let imgUrl = this.data.product.images
    wx.previewImage({
      urls: imgUrl,
      current: url,
    })
  }
})