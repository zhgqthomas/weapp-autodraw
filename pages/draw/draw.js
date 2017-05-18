// pages/draw/draw.js

const {Cloud} = require('../../lib/av-weapp-min.js')

const app = getApp()

Page({

  data: {
		canvasId: 'draw-canvas',
		width: 0,
		height: 0,
		colors: ['#4285f4', '#2dd354', '#fcd015', '#f7931e', '#ef4037', '#b442cc', '#1a1a1a', '#ffffff'],
		paintColor: '#4285f4',
		hidden: false
	},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

		wx.setNavigationBarTitle({
			title: app.globalData.language.drawTitle,
		})

		this.setData({
			width: app.globalData.systemInfo.windowWidth,
			height: app.globalData.systemInfo.windowHeight
		})

		this.context = wx.createCanvasContext(this.data.canvasId)

		console.log(this.context)
		this.arrayX = []
		this.arrayY = []
		this.arrayTime = []
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  chooseColor: function(e) {
		let paintColor = e.currentTarget.dataset.color;
		this.setData({
			paintColor
		})
  },

  onTouchStart: function( {touches, timeStamp} ) {

		const {x ,y } = touches[0]
		this.movements = [[x, y]]

		this.arrayX.push(x)
		this.arrayY.push(y)
		this.arrayTime.push(float2int(timeStamp))
  },

  onTouchMove: function( { touches, timeStamp }) {

		const { x, y } = touches[0]
		this.movements.push( [x, y])

		this.arrayX.push(x)
		this.arrayY.push(y)
		this.arrayTime.push(float2int(timeStamp))

		const [start, ...moves] = this.movements

		this.context.moveTo(...start)
		moves.forEach(move => this.context.lineTo(...move))

		this.context.setLineWidth(5)
		this.context.setStrokeStyle(this.data.paintColor)
		this.context.stroke()
    this.context.draw(true)
  },

  onTouchEnd: function(e) {

    const options = {
      'input_type': 0,
      'requests': [{
        'language': 'autodraw',
        'writing_guide': {
          'width': this.data.width,
          'height': this.data.height
        },
        'ink': [[this.arrayX, this.arrayY, this.arrayTime]]
      }]
    }

    let that = this

		Cloud.run('matchDraw', options).then(function (res) {

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
    let item = inks[index]
    item = item.replace(/ /ig, '-') // 替换空格为 '-'

    console.log(item)
    params.push(baseUrl + item + '-01.svg')
    params.push(baseUrl + item + '-02.svg')
    params.push(baseUrl + item + '-03.svg')
  }

  console.log(params)
}