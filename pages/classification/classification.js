const app = getApp();
const url = app.globalData.url;
Page({
  data: {
    active: 1,   //当前tab页面
    sellerInfo: {},   //发布者信息
    ifShowMoreInfo: true,   //是否显示更多信息
    access: 0,   //小程序访问量
    value: '',   //搜索关键词
    content: {},   //目录
    page: 1,   //查询商品页数
    product: [],   //商品列表
    menuId: -1,   //当前展示商品目录id,默认全部商品
    shopList: [],   //购物车列表
    shopNum: '0',   //购物车数量
    show: false,   //选择规格弹窗
    specs: [],   //添加购物车，选择规格列表
    chooseId: -1,   //选择规格时的商品ID
  },
  onLoad(options) {
    this.getSellerInfo()
    this.getMenu()
    this.getProduct(this.data.value)
  },
  onShow() {
    wx.hideHomeButton()
    let totalNum = app.globalData.shopList.reduce((acc, item) => acc + item.num, 0)
    let shopNum = totalNum > 99 ? '99+' : totalNum.toString()
    let product = this.data.product
    product = this.changeNum(app.globalData.shopList, product)
    this.setData({
      shopList: app.globalData.shopList,
      shopNum: shopNum,
      product: product
    })
  },
  showPopup() {
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  changeTab(event) {   //切换tab
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
      product: [],
    })
    this.getProduct(this.data.value, undefined)
  },
  onCancel: function () {   //取消搜索
    this.setData({
      page: 1,
      menuId: -1,
      product: [],
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
            content[i]['ifShow'] = false
            if (content[i].children != null) {
              for (let j = 0; j < content[i].children.length; j++) {
                content[i].children[j]['ifShow'] = false
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
        newFlag: 0
      },
      success(res) {
        if (res.data.code == 20008) {
          let product = that.data.product
          let page = that.data.page + 1
          for (let i = 0; i < res.data.data.products.length; i++) {
            let productInfo = res.data.data.products[i]
            productInfo['num'] = 0
            product.push(productInfo)
          }
          product = that.changeNum(that.data.shopList, product)
          that.setData({
            product: product,
            page: page
          })
        }
      }
    })
  },
  allProduct: function () {   //全部商品按钮
    let content = this.data.content
    for (let i = 0; i < content.length; i++) {   //关闭全部菜单
      if (content[i].children != null) {
        content[i].ifShow = false
        for (let j = 0; j < content[i].children.length; j++) {
          if (content[i].children[j].children != null)
            content[i].children[j].ifShow = false
        }
      }
    }
    this.setData({
      page: 1,
      menuId: -1,
      product: [],
      content: content
    })
    this.getProduct(this.data.value)
  },
  firstMenu: function (event) {   //控制一级菜单
    let id = event.currentTarget.dataset.id
    let menuId = this.data.menuId
    let content = this.data.content
    for (let i = 0; i < content.length; i++) {
      if (content[i].id == id) {
        menuId = this.findchildMenu(this.data.content[i]).id
        if (!content[i].ifShow) {   //如果一级菜单是关闭状态
          content[i].ifShow = true
          if (content[i].children != null)
            for (let j = 0; j < content[i].children.length; j++) {
              if (content[i].children[j].children != null) {
                content[i].children[j].ifShow = true
                break
              }
            }
        }
        else {   //一级菜单展开状态
          content[i]['ifShow'] = false
          if (content[i].children != null) {
            for (let j = 0; j < content[i].children.length; j++) {
              content[i].children[j]['ifShow'] = false
            }
          }
        }
        this.setData({
          page: 1,
          menuId: menuId,
          product: [],
        })
        this.getProduct(this.data.value, this.data.menuId)
      }
      else {
        content[i]['ifShow'] = false
        if (content[i].children != null) {
          for (let j = 0; j < content[i].children.length; j++) {
            content[i].children[j]['ifShow'] = false
          }
        }
      }
    }
    this.setData({
      content: content
    })
  },
  secondMenu: function (event) {   //控制二级菜单
    let id = event.currentTarget.dataset.id
    let menuId = id
    let content = this.data.content
    for (let i = 0; i < content.length; i++) {
      if (content[i].children != null)
        for (let j = 0; j < content[i].children.length; j++) {
          if (content[i].children[j].id == id) {
            if (content[i].children[j].ifShow) {   //二级菜单展开
              content[i].children[j].ifShow = false
            }
            else {   //二级菜单关闭
              content[i].children[j].ifShow = true
              menuId = this.findchildMenu(content[i].children[j]).id
              this.setData({
                page: 1,
                menuId: menuId,
                product: [],
              })
              this.getProduct(this.data.value, this.data.menuId)
            }
          }
          else {
            content[i].children[j].ifShow = false
          }
        }
    }
    this.setData({
      content: content
    })
  },
  thirdMenu: function (event) {   //控制三级菜单
    let id = event.currentTarget.dataset.id
    this.setData({
      page: 1,
      menuId: id,
      product: [],
    })
    this.getProduct(this.data.value, id)
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
    for (let i = 0; i < this.data.product.length; i++)
      idList.push(this.data.product[i].id)
    wx.navigateTo({
      url: '/pages/classification/product/product?id=' + id + '&productList=' + JSON.stringify(idList)
    })
  },
  add: function (event) {   //添加商品到购物车
    let id = event.currentTarget.dataset.id
    let productInfo
    let that = this
    wx.request({
      url: url + '/product/' + id,
      method: 'GET',
      success(res) {
        if (res.data.code == 20012) {
          productInfo = res.data.data
          if (productInfo.specs != null) {   //多个规格展示选择规格弹窗
            let specs = productInfo.specs
            for (let i = 0; i < specs.length; i++) {
              const matchingItem = that.data.shopList.find(item => item.id === id && item.specs === specs[i].name);
              if (matchingItem) {   //如果已经添加到购物车，根据购物车更新specs数量
                specs[i]['num'] = matchingItem.num
              } else {
                specs[i]['num'] = 0
              }
            }
            that.setData({
              specs: specs,
              chooseId: id
            })
            that.showPopup()
          }
          else {   //只有一个规格，添加到购物车
            that.addProduct(id)
          }
        }
      }
    })
  },
  addProduct: function (id, specs = null, num = 1) {   //将指定规格数量的商品添加到购物车
    let productInfo = {
      id: id,
      specs: specs,
      num: num,
    }
    let shopList = this.data.shopList
    if (shopList.some(productInfo => productInfo.id === id && productInfo.specs === specs)) {  //购物车列表已经存在该商品
      for (let i = 0; i < shopList.length; i++)
        if (shopList[i].id == id && shopList[i].specs == specs) {
          if (specs == null)
            shopList[i].num += 1
          else
            shopList[i].num = num
          break
        }
    } else {   //购物车列表不存在该商品
      shopList.push(productInfo)
    }
    //更新购物车数量
    let totalNum = shopList.reduce((acc, item) => acc + item.num, 0)
    let shopNum = totalNum > 99 ? '99+' : totalNum.toString()
    let product = this.data.product
    product = this.changeNum(shopList, product)
    this.setData({
      shopList: shopList,
      shopNum: shopNum,
      product: product
    })
  },
  chooseSpecs: function (event) {
    let index = event.currentTarget.dataset.index
    let specs = this.data.specs
    specs[index].num = event.detail
    this.setData({
      specs: specs
    })
    this.addProduct(this.data.chooseId, specs[index].name, event.detail)
  },
  goOrder: function () {   //跳转订单页面
    let shopList = this.data.shopList
    wx.navigateTo({
      url: '/pages/order/order?shopList=' + JSON.stringify(shopList)
    })
  },
  changeNum: function (shopList, productList) {   // 修改角标
    if (productList != null)
      for (let i = 0; i < productList.length; i++) {
        let matchingItems = shopList.filter(item => item.id == productList[i].id)
        let num = matchingItems.reduce((sum, item) => sum + item.num, 0)
        productList[i].num = num > 99 ? '99+' : num
      }
    return productList
  }
})
