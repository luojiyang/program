const wxml = (productArray, total) => {
  let product = ''
  for (let i = 0; i < productArray.length; i++) {
    let containerLeft = `<view class="product-card"><view class="container">`
    let containerRight = `</view></view>`
    let spec = productArray[i].specs != null ? productArray[i].specs : '无'
    let productName = productArray[i].name
    function truncateStringWithChineseChars(str, maxLength) {
      let length = 0;
      let result = '';
      for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i)
        if (charCode <= 0x80) {
          length++;
        } else {
          length += 2;
        }
        if (length <= maxLength) {
          result += str.charAt(i);
        } else {
          break;
        }
      }
      return result
    }
    if (productName.toString().replace(/[\u0391-\uFFE5]/g, "aa").length > 36) {
      productName = truncateStringWithChineseChars(productName, 36) + '...'
    }
    let info = `<view class="info-container">
                  <view>
                    <text class="product-name">${productName}</text>
                  </view>
                  <view>
                    <text class="product-text">规格：${spec}</text>
                  </view>
                  <view>
                    <text class="product-text">单价：￥${productArray[i].value}</text>
                  </view>
                  <view>
                    <text class="product-text">数量：${productArray[i].num}</text>
                  </view>
                  <view>
                    <text class="product-text">合计：￥${productArray[i].total}</text>
                  </view>
                </view>`
    product += containerLeft + info + containerRight
  }
  let totalContainer = `<view class="total">
                          <view>
                            <text class="total-text">合计:</text>
                          </view>
                          <view>
                            <text class="price">￥${total}</text>
                          </view>
                        </view>`
  return '<view class="canvas">' + product + totalContainer + '</view>'

}
const style = () => {
  return {
    canvas: {
      width: 390,
      backgroundColor: '#E7E6E6',
    },
    productCard: {
      backgroundColor: '#ffffff',
      width: 350,
      marginTop: 10,
      marginLeft: 20,
      borderRadius: 5,
    },
    container: {
      width: 330,
      height: 105,
      marginTop: 10,
      marginLeft: 10,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    },
    pic: {
      width: 90,
      height: 90,
    },
    infoContainer: {
      width: 330,
      height: 95,
      marginLeft: 10,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    productName: {
      width: 300,
      height: 25,
      fontSize: 15,
      fontWeight: 800,
    },
    productText: {
      width: 300,
      height: 15,
      fontSize: 10,
    },
    total: {
      width: 390,
      backgroundColor: '#ffffff',
      height: 50,
      marginTop: 10,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    totalText: {
      width: 42,
      height: 50,
      lineHeight: 50,
      fontSize: 10,
    },
    price: {
      width: 100,
      height: 50,
      lineHeight: 50,
      fontSize: 20,
      color: 'red',
      marginRight: 20,
    }
  }
}

module.exports = {
  wxml,
  style
}