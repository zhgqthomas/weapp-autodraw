//app.js

const AV = require('./lib/av-weapp-min.js')
var language = require('./utils/language.js')
const config = require('./config.js')

var data = {
  userInfo: null,
  language: null,
  systemInfo: null
}

AV.init({
  appId: config.appId,
  appKey: config.appKey
})

App({
  globalData: data,
  onLaunch: function () {
    
    //调用 API 从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 根据系统语言来显示对应语言
    var systemInfo = wx.getSystemInfoSync()
    if (systemInfo.language == 'zh_CN') {
      this.globalData.language = language.zh
    } else {
      this.globalData.language = language.en
    }

    this.globalData.systemInfo = systemInfo
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  }
})