// pages/draw/draw.js

const {Cloud} = require('../../lib/av-weapp-min.js')

const cloud_match_draw = 'matchDraw'

var app = getApp()

var pageData = {
  canvasId: 'draw-canvas',
  width: 0,
  height: 0
}

var arrayX = []
var arrayY = []
var arrayTime = []

Page({

  data: pageData,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    this.context.setStrokeStyle('#000000')
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

    Cloud.run(cloud_match_draw, options).then(function (res) {

      const array = JSON.parse(res)

      const flag = array[0]

      if (flag == 'SUCCESS') {
        const inks = array[1][0][1]

        console.log(inks)

        achievePath(inks)
      }

    }, function (error) {
      console.log(error)
    })
  }
})

function float2int(value) {
  return value | 0
}

function achievePath(inks) {

  const baseUrl = 'https://storage.googleapis.com/artlab-public.appspot.com/stencils/selman/'
  const params = []

  for (const index in inks) {
    var item = inks[index]
    item = item.replace(/ /ig, '-') // 替换空格为 '-'

    console.log(item)
    params.push(baseUrl + item + '-01.svg')
    params.push(baseUrl + item + '-02.svg')
    params.push(baseUrl + item + '-03.svg')
  }

  console.log(params)
}