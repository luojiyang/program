const app = getApp();
const url = app.globalData.url;
Page({
  data: {
    active: 0,   //当前tab页面
    page: 1,   //请求页面参数
    size: 5,   //每次请求视频个数
    videos: [],   //视频列表
  },
  onLoad(options) {
    this.setData({
      page: 1
    })
    this.getVideo(this.data.page, this.data.size)
  },
  onChange(event) {   //切换tab
    this.setData({ active: event.detail });
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
          let newVideo = res.data.data.videos
          for (let i = 0; i < newVideo.length; i++) {
            newVideo[i].createTime = that.modifyDate(newVideo[i].createTime)
          }
          let videos = [...that.data.videos, ...newVideo];
          that.setData({
            page: page + 1,
            videos: videos
          })
        }
      }
    })
  },
  modifyDate: function (string) {   //修改日期字符串
    let dateList = []
    dateList.push(string.slice(0, 4))
    dateList.push(string.slice(5, 7))
    dateList.push(string.slice(8, 10))
    return dateList
  },
  onReachBottom() {     //触底更新，刷新数据
    this.getVideo(this.data.page, this.data.size)
  },
  playVideo: function (e) {   //播放视频自动进入全屏
    this.videoContext = wx.createVideoContext(e.currentTarget.id, this); // 	创建 video 上下文 VideoContext 对象。
    this.videoContext.requestFullScreen({
      direction: 0
    });
  },
  pauseVideo: function (e) {   //退出全屏暂停视频
    if (!e.detail.fullScreen) {
      this.videoContext = wx.createVideoContext(e.currentTarget.id, this); // 	创建 video 上下文 VideoContext 对象。
      this.videoContext.pause()
    }
  }
})