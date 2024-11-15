const app = getApp();
const url = app.globalData.url;
Page({
  data: {
    active: 2,   //当前tab页面
    sellerInfo: {},   //发布者信息
    ifShowMoreInfo: true,   //是否显示更多信息
    access: 0,   //小程序访问量
    value: '',   //搜索关键词
    content: {},   //目录
    page: 1,   //查询商品页数
    productLeft: [],   //商品列表左侧
    productRight: [],   //商品右侧
    menuId: -1,   //当前展示商品目录id,默认全部商品
  },
  onLoad(options) {
    this.getSellerInfo()
    this.getMenu()
    this.getProduct(this.data.value)
  },
  onShow(){
    wx.hideHomeButton()
  },
  onChange(event) {   //切换tab
    this.setData({ active: event.detail });
  },
  getSellerInfo: function () {   //获取卖家信息
    let that = this
    wx.request({
      url: url + '/user',
      method: 'GET',
      success(res) {
        if (res.data.code == 20000) {
          let sellerInfo = res.data.data
          that.setData({
            sellerInfo: sellerInfo
          })
        }
      }
    })
  },
  showMoreInfo: function () {   //点击显示更多信息
    this.setData({
      ifShowMoreInfo: !this.data.ifShowMoreInfo
    })
  },
  onChange(e) {
    this.setData({
      page: 1,
      menuId: -1,
      value: e.detail,
      productLeft: [],
      productRight: [],
    })
    this.getProduct(this.data.value, undefined)
  },
  onCancel: function () {   //取消搜索
    this.setData({
      page: 1,
      menuId: -1,
      productLeft: [],
      productRight: [],
      value: '',
    })
    this.getProduct(this.data.value, undefined)
  },
  getMenu: function () {   //获取全部商品目录
    let that = this
    wx.request({
      url: url + '/category',
      method: 'GET',
      success(res) {
        if (res.data.code == 20004) {
          let content = res.data.data
          for (let i = 0; i < content.length; i++) {
            if (content[i].children != null)
              for (let j = 0; j < content[i].children.length; j++) {
                content[i].children[j]['ifShow'] = true
                if (content[i].children[j].children != null)
                  for (let k = 0; k < content[i].children[j].children.length; k++) {
                    content[i].children[j].children[k]['ifShow'] = true
                  }
              }
          }
          that.setData({
            content: content
          })
        }
      }
    })
  },
  showSecondChildMenu: function (event) {   //展开关闭二级菜单
    let id = event.currentTarget.dataset.id
    let content = this.data.content
    for (let i = 0; i < content.length; i++) {
      if (content[i].id == id) {
        for (let j = 0; j < content[i].children.length; j++) {
          content[i].children[j]['ifShow'] = !content[i].children[j]['ifShow']
          for (let k = 0; k < content[i].children[j].children.length; k++) {
            content[i].children[j].children[k]['ifShow'] = content[i].children[j]['ifShow']
          }
        }
        break
      }
    }
    this.setData({
      content: content
    })
  },
  showThirdChildMenu: function (event) {   //展开关闭三级菜单
    let id = event.currentTarget.dataset.id
    let content = this.data.content
    for (let i = 0; i < content.length; i++) {
      if (content[i].children != null)
        for (let j = 0; j < content[i].children.length; j++) {
          if (content[i].children[j].id == id) {
            for (let k = 0; k < content[i].children[j].children.length; k++) {
              content[i].children[j].children[k]['ifShow'] = !content[i].children[j].children[k]['ifShow']
            }
            break
          }
        }
    }
    this.setData({
      content: content
    })
  },
  getProduct: function (productName = "", categoryId = "") {   //获取商品
    let that = this
    wx.request({
      url: url + '/product/query',
      method: 'GET',
      data: {
        page: that.data.page,
        size: 10,
        productName: productName,
        categoryId: categoryId,
        newFlag: 1
      },
      success(res) {
        if (res.data.code == 20008) {
          let productLeft = that.data.productLeft
          let productRight = that.data.productRight
          let page = that.data.page + 1
          for (let i = 0; i < res.data.data.length; i += 2) {
            productLeft.push(res.data.data[i])
            if (i + 1 < res.data.data.length)
              productRight.push(res.data.data[i + 1])
          }
          that.setData({
            productLeft: productLeft,
            productRight: productRight,
            page: page
          })
        }
      }
    })
  },
  allProduct: function () {   //全部商品按钮
    this.setData({
      page: 1,
      menuId: -1,
      productLeft: [],
      productRight: [],
    })
    this.getProduct(this.data.value)
  },
  menuProduct: function (event) {   //获取指定目录下商品
    let index = event.currentTarget.dataset.index
    let id = event.currentTarget.dataset.id
    let menuId = id
    //一级目录找最小子目录
    if (index == "first")
      for (let i = 0; i < this.data.content.length; i++) {
        if (this.data.content[i].id == id) {
          menuId = this.findchildMenu(this.data.content[i]).id
          break
        }
      }
    else if (index == "second")
      for (let i = 0; i < this.data.content.length; i++) {
        if (this.data.content[i].children != null)
          for (let j = 0; j < this.data.content[i].children.length; j++) {
            if (this.data.content[i].children[j].id == id) {
              menuId = this.findchildMenu(this.data.content[i].children[j]).id
              break
            }
          }
      }
    this.setData({
      page: 1,
      menuId: menuId,
      productLeft: [],
      productRight: [],
    })
    this.getProduct(this.data.value, this.data.menuId)
  },
  findchildMenu: function (content) {   //找到第一个子目录
    // 如果当前目录没有子目录，则认为它是终点目录 
    if (content.children == null) {
      return content; // 返回这个目录 
    }
    // 遍历每个子目录，递归查找 
    for (let child of content.children) {
      const result = this.findchildMenu(child)
      if (result) {
        return result; // 找到终点目录后立即返回
      }
    }
  },
  getMoreProduct: function () {   //触底获取更多商品信息
    let that = this
    if (that.data.menuId == -1) {   //获取全部商品
      this.getProduct(this.data.value)
    }
    else {   //获取对应id的商品
      this.getProduct(this.data.value, this.data.menuId)
    }
  },
  productInfo: function (event) {   //跳商品商品详情页面
    let id = event.currentTarget.dataset.id
    let idList = []
    for (let i = 0; i < this.data.productLeft.length; i++)
      idList.push(this.data.productLeft[i].id)
    for (let i = 0; i < this.data.productRight.length; i++)
      idList.push(this.data.productRight[i].id)
    wx.reLaunch({
      url: '/pages/classification/product/product?id=' + id + '&productList=' + JSON.stringify(idList)
    })
  }
})
