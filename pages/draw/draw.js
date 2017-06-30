// pages/draw/draw.js

const {Cloud} = require('../../lib/av-weapp-min.js')
const template = require('../../stencils.js')

var app = getApp()

var pageData = {
  canvasId: 'draw-canvas',
  width: 0,
  height: 0,
  recommends: null
}

let stencils = null

var arrayX = []
var arrayY = []
var arrayTime = []
let initial = false

Page({

  data: pageData,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    // get stencils
    if (app.globalData.stencils) {
      stencils = app.globalData.stencils
    } else {
      stencils = template
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setNavigationBarTitle({
      title: app.globalData.language.drawTitle,
    })

    this.setData({
      width: app.globalData.systemInfo.windowWidth,
      height: app.globalData.systemInfo.windowHeight
    })

    this.context = wx.createCanvasContext(this.data.canvasId)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  //
  touchStart: function(e) {

    this.startX = e.changedTouches[0].x
    this.startY = e.changedTouches[0].y
    this.context.setStrokeStyle('#212121')
    this.context.setLineWidth(2)
    this.context.setLineCap('round')
    this.context.beginPath()

    arrayX.push(this.startX)
    arrayY.push(this.startY)
    arrayTime.push(float2int(e.timeStamp))
  },

  touchMove: function(e) {

    var curX = e.changedTouches[0].x
    var curY = e.changedTouches[0].y

    arrayX.push(curX)
    arrayY.push(curY)
    arrayTime.push(float2int(e.timeStamp))

    this.context.moveTo(this.startX, this.startY)
    this.context.lineTo(curX, curY)
    this.context.stroke()

    this.startX = curX;
    this.startY = curY;

    this.context.draw(true)

  },

  touchEnd: function(e) {

    const options = {
      'input_type': 0,
      'requests': [{
        'language': 'autodraw',
        'writing_guide': {
          'width': this.data.width,
          'height': this.data.height
        },
        'ink': [[arrayX, arrayY, arrayTime]]
      }]
    }

    var that = this

    Cloud.run('matchDraw', options).then(function (res) {

      const array = JSON.parse(res)

      const flag = array[0]

      if (flag == 'SUCCESS') {
        const inks = array[1][0][1]

        const results = achievePath(inks)
        
        that.setData({
          recommends: results
        })

        if (!initial) {
          wx.showToast({
            title: app.globalData.language.longPressToast,
            duration: 2000,
            success: function(res) {
              initial = true
            }
          })
        }
      }

    }, function (error) {
      console.log(error)
    })
  },

  // 保存链接到剪切板
  handleImageLongTap: function(e) {
    wx.setClipboardData({
      data: baseUrl + e.target.id,
      success: function(res) {
        wx.showToast({
          title: "Copied",
          icon: 'sucess',
          duration: 1000
        })
      },
      fail: function(res) {
        wx.showToast({
          title: 'Copied failed',
          duration: 1000
        })
      }
    })
  },

  // 清空画布
  handleDeleteTap: function(e) {
    this.setData({
      recommends: null
    })

    this.context.clearRect(0, 0, this.data.width, this.data.height)
    this.context.draw()

    arrayX = []
    arrayY = []
    arrayTime = []
  }
})

function float2int(value) {
  return value | 0
}

function achievePath(inks) {

  const keys = Object.keys(stencils)
  const params = []

  for (const i in inks) { // 遍历机器学习返回的单词
    const item = inks[i]

    for (const j in keys) {

      const key = keys[j]
      if (key.indexOf(item) !== -1) { // 返回的单词与模板单词进行匹配
        
        const array = stencils[key]

        for (const k in array) { // 取出匹配成功的 src
          const info = array[k]

          const result = {
            title: key,
            src: info.src,
            collection: info.collection
          }

          params.push(result)
        }
      }
    }

  }

  return params
}