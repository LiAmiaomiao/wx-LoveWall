// pages/index/sayLove-page/sayLove/sayLove.js
var app = getApp();
Page({

  
  data: {
  
  },

 
  onLoad: function (options) {
    this.setData({
      open: app.globalData.open
    })
    if (app.globalData.open == false){
      setTimeout(function () {
        wx.switchTab({
          url: '../sayLove-page',
        })
      }, 1700)
    }else{

    }
  },
 

 
})