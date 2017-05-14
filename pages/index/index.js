//index.js
//获取应用实例
var app = getApp()

var indexData = {
  userInfo: {},
  slogn: '',
  startDraw: '',
  tutorial: '',
}

Page({
  data: indexData,

  onLoad: function (options) {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })

    that.setData({
      slogn: app.globalData.language.slogn,
      startDraw: app.globalData.language.startDraw,
      tutorial: app.globalData.language.tutorial
    })
  },

  onShow: function() {
    // 设置标题
    wx.setNavigationBarTitle({
      title: app.globalData.language.indexTitle,
    })
  },

  // 跳转到绘画页面
  nav2Draw: function() {
    wx.navigateTo({
      url: '../draw/draw',
    })
  },

  // 跳转到讲解页面
  nav2Tutorial: function() {
    wx.navigateTo({
      url: '../tutorial/tutorial',
    })
  }
})
