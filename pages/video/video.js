const app = getApp();
const url = app.globalData.url;
Page({
  data: {
    page: 1,   //请求页面参数
    size: 5,   //每次请求视频个数
    videos: [],   //视频列表
    posterInfo: {   //视频发布者信息
      avatar: '',
      posterName: ''
    }
  },
  onLoad(options) {
    this.setData({
      page: 1
    })
    this.getVideo(this.data.page, this.data.size)
    this.getPosterInfo()
  },
  getVideo: function (page, size) {   //获取视频，传入请求页和每页视频个数
    let that = this
    wx.request({
      url: url + '/video',
      method: 'GET',
      data: {
        page: page,
        size: size
      },
      success(res) {
        if (res.data.code == 20002) {
          let videos = [...that.data.videos, ...res.data.data];
          that.setData({
            page: page + 1,
            videos: videos
          })
        }
      }
    })
  },

  onReachBottom() {     // 触底更新，刷新数据
    this.getVideo(this.data.page, this.data.size)
  },
  getPosterInfo: function () {   //获取发布者信息
    let that = this
    wx.request({
      url: url + '/user',
      method: 'GET',
      success(res) {
        if (res.data.code == 20000) {
          let posterInfo = {
            avatar: res.data.data.avatar,
            posterName: res.data.data.username
          }
          that.setData({
            posterInfo: posterInfo
          })
        }
      }
    })
  }
})