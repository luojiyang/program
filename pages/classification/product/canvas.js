const wxml = (image, name, specs, value) => {
  let valueContent
  if(specs==null){
    valueContent = `<view class="value-container">
              <text class="value">￥${value}</text>
            </view>`
  }
  else{
    valueContent = `  <view class="specs">
                <view class="tag-border">
                  <text class="active-tag">${specs}</text>  
                </view>
              </view>
              <view class="value-container">
                <text class="value">￥${value}</text>
              </view>`
  }
  return `
  <view class="container">
  <view></view>
  <image class="poster-img" src="${image}"></image>
  <view class="name-container">
    <text class="product-name">${name}</text>
  </view>` + valueContent + `</view>`
}
const style = (styles = null) => {
  if(styles)
  return {
    container: {
      width: 390,
    },
    posterImg: {
      width: 390,
      height: 390,
    },
    nameContainer: {
      width: 390,
      height: 50,
      backgroundColor: '#ffffff',
    },
    productName: {
      width: 380,
      height: 50,
      lineHeight: 50,
      marginLeft: 10,
      fontSize: 18,
      fontWeight: 800,
    },
    specs: {
      width: 390,
      height: 40,
      backgroundColor: '#ffffff',
    },
    tagBorder: {
      width: styles.specsWidth,
      height: 30,
      borderWidth: 2,
      borderStyle: 'solid',
      borderColor: '#C00000',
      borderRadius: 6,
      marginTop: 5,
      marginLeft: 10,
      backgroundColor: '#ffffff',
      textAlign: 'center',
    },
    activeTag: {
      width: styles.specsWidth,
      height: 30,
      lineHeight: 30,
      color: '#C00000',
    },
    valueContainer: {
      width: 390,
      height: 40,
      backgroundColor: '#ffffff',
    },
    value: {
      width: 390,
      height: 40,
      lineHeight: 40,
      marginTop: 5,
      marginLeft: 10,
      fontSize: 18,
      fontWeight: 600,
      color: 'red'
    }
  }
  else
  return {
    container: {
      width: 390,
    },
    posterImg: {
      width: 390,
      height: 390,
    },
    nameContainer: {
      width: 390,
      height: 50,
      backgroundColor: '#ffffff',
    },
    productName: {
      width: 380,
      height: 50,
      lineHeight: 50,
      marginLeft: 10,
      fontSize: 18,
      fontWeight: 800,
    },
    valueContainer: {
      width: 390,
      height: 40,
      backgroundColor: '#ffffff',
    },
    value: {
      width: 390,
      height: 40,
      lineHeight: 40,
      marginTop: 5,
      marginLeft: 10,
      fontSize: 18,
      fontWeight: 600,
      color: 'red'
    }
  }
}

module.exports = {
  wxml,
  style
}