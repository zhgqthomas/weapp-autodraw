//app.js

const AV = require('./lib/av-weapp-min.js')
var language = require('./utils/language.js')
const config = require('./config.js')
const template = require('./stencils.js')

var data = {
  userInfo: null,
  language: null,
  systemInfo: null,
  stencils: null
}

AV.init({
  appId: config.appId,
  appKey: config.appKey
})

App({
  globalData: data,
  onLaunch: function () {

    // 根据系统语言来显示对应语言
    var systemInfo = wx.getSystemInfoSync()
    if (systemInfo.language == 'zh_CN') {
      this.globalData.language = language.zh
    } else {
      this.globalData.language = language.en
    }

    this.globalData.systemInfo = systemInfo
  },

  getUserInfo: function(cb){
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
              typeof cb == "function" && cb(res.userInfo)
            }
          })
        }
      })
    }
  },

  getStencils: function(callBack) {
    var that = this
    if (this.globalData.stencils) {
      typeof callBack === "function" && callBack(this.globalData.stencils)
    } else {

      AV.Cloud.run('stencils', {}).then(function (result) {

        that.globalData.stencils = result
        typeof callBack === "function" && callBack(result)

      }, function (error) {
        
        that.globalData.stencils = template
      })
    }
  }
})