var timestamp = require('../../../utils/util.js');
import {
  Config
} from '../../../utils/utils/config.js';
var app = getApp();
Page({
  data: {
    userId: '',
    biaobaisex: true,
    showModal: false,
    currentTab: 0,
    likeChange: false,
    // userIcon:"https://wx.qlogo.cn/mmopen/vi_32/o9RIibWt7KwVRAHTF8YVZv8ub5WEl9fTe8GHM1GYn7OKpNAbEfNibHboM0pGx1ZM91pq103wSaePDesgqxsEhwvw/0",
  },
  onLoad: function(options) {
   
    var that = this;
    //授权
    var userId = wx.getStorageSync("userInfoId");
    this.setData({
      userId: userId
    })
    if (wx.getStorageSync('userInfoId')) {
      // 已授权,进行用户数据查询
      if (wx.getStorageSync('isLogin')) {
        // 已授权,进行用户数据查询
        wx.request({
          url: Config.restUrl + 'users/' + wx.getStorageSync('userInfoId') + '.do',
          data: {},
          method: 'GET',
          header: {
            'ContentType': 'application/json'
          },
          success: function(res) {
            console.log(res)
            app.globalData.gender = res.data.gender
          },
          fail: function(err) {
            console.log('获取用户信息失败', err);
          }
        })
      } else {}
    } else {
      //新用户
      wx.setStorageSync("isLogin", false);
      var that = this;
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId\
          if (res.code) {
            wx.request({
              url: Config.restUrl + 'users/register.do?code=' + res.code,
              data: {},
              method: 'GET',
              success: function(result) {
                //获取用户信息
                //将用户id存入缓存 
                wx.setStorageSync('userInfoId', result.data.id);

              },
              fail: function(res) {},
              complete: function() {}
            })
          } else {
            console.log('注册失败！' + res.errMsg)
          }
        }
      })
    }

    //表白列表
    var start = [];
    var limit = 5;
    wx.request({
      method: "POST",
      url: Config.restUrl + 'lovewall/loveletters/list.do',
      data: {
        offset: 0,
        limit: limit
      },
      header: {
        "Content-Type": "application/json"
      },
      success: function(res) {
       // console.log(res)
        //转换为时间戳
        for (var i = 0; i < res.data.length; i++) {
          var oldtime = res.data[i].time;
          var mess = timestamp.getDateDiff(oldtime);
          //转换oldtime
          start[i] = mess;
          res.data[i].time = start[i];
        }
        that.setData({
          newsArr: res.data,
        })
        limit += 4;
        that.data.limit = limit;
        // console.log(that.data.limit)
      },
    })
    wx.request({
      method: "POST",
      url: Config.restUrl + 'loverecord/loveaudio/list.do',
      data: {
        offset: 0,
        limit: limit
      },
      header: {
        "Content-Type": "application/json"
      },
      success: function(res) {
        //转换为时间戳
        for (var i = 0; i < res.data.length; i++) {
          var oldtime = res.data[i].time;
          var mess = timestamp.getDateDiff(oldtime);
          //转换oldtime
          start[i] = mess;
          res.data[i].time = start[i];
        }
        that.setData({
          recordArr: res.data
        })
      }
    })

    //初始化点赞缓存
    var likeArr = wx.getStorageSync('likeArr');
    if (likeArr != false) {} else {
      var likeArr = {};
    }
    wx.setStorageSync('likeArr', likeArr)
    that.setData({
      likeArr
    });

    //初始化点赞缓存
    var xinArr = wx.getStorageSync('xinArr');
    if (xinArr != false) {

    } else {
      var xinArr = {};
    }
    wx.setStorageSync('xinArr', xinArr)
    that.setData({
      xinArr
    });
  },

  //文字表白点赞
  onLikeTap: function(event) {
    console.log(event)
    var likeArr = wx.getStorageSync('likeArr');
    var that = this;
    var loveId = event.currentTarget.dataset.likeid;
    if (likeArr[loveId] == null) {
      likeArr[loveId] = true;
    } else {
      likeArr[loveId] = !likeArr[loveId];
    }
    var count = likeArr[loveId] ? 1 : -1;
    for (var i = 0; i < that.data.newsArr.length; i++) {
      if (that.data.newsArr[i].id == loveId) {
        that.data.newsArr[i].likecount = that.data.newsArr[i].likecount + count;
      }
    }
    wx.setStorageSync('likeArr', likeArr)
    this.setData({
      likeArr,
      newsArr: that.data.newsArr
    })

    wx.request({
      url: Config.restUrl + 'lovewall/loveletters/addlike/' + loveId + '.do',
      data: {
        "loveLetterId": loveId,
        "count": count
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json"
      },
      success: function() {

      }
    })
  },
  //语音表白点赞
  onXinTap: function(event) {
    var xinArr = wx.getStorageSync('xinArr');
    var that = this;
    var loveId = event.currentTarget.dataset.likeid;
    if (xinArr[loveId] == null) {
      xinArr[loveId] = true;
    } else {
      xinArr[loveId] = !xinArr[loveId];
    }
    var count = xinArr[loveId] ? 1 : -1;
    for (var i = 0; i < that.data.recordArr.length; i++) {
      if (that.data.recordArr[i].id == loveId) {
        that.data.recordArr[i].likecount = that.data.recordArr[i].likecount + count;
      }
    }
    wx.setStorageSync('xinArr', xinArr)
    this.setData({
      xinArr,
      recordArr: that.data.recordArr
    })

    wx.request({
      url: Config.restUrl + 'lovewall/loveletters/addlike/' + loveId + '.do',
      data: {
        "loveLetterId": loveId,
        "count": count
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json"
      },
      success: function() {

      }
    })

  },

  submit: function() {
    if (wx.getStorageSync('isLogin')) {
      this.setData({
        showModal: true
      })
    } else {
      wx.showToast({
        title: '请先登录',
        image: '/images/icon/warning.png',
        success: function() {
          setTimeout(function() {
            wx.switchTab({
              url: '/pages/mine/mine',
            })
          }, 1000)
        }
      })
    }

  },
  go: function() {
    this.setData({
      showModal: false
    })
  },
  onShowDetail: function(event) {
    wx.navigateTo({
      url: 'love-detail/love-detail?lovelistid=' + event.currentTarget.dataset.lovelistid,

    })
  },
  switchTab: function(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.currenttab
    })
  },
  onShowRecord: function(event) {
    wx.navigateTo({
      url: 'sound-detail/sound-deail?recordid=' + event.currentTarget.dataset.recordid,
    })
  },
  onShowSound: function() {
    this.setData({
      showModal: false,
    })
    wx.navigateTo({
      url: 'public-sound/public-sound',
    })
  },
  onShowText: function() {
    this.setData({
      showModal: false,
    })
    wx.navigateTo({
      url: 'publish-text/publish-text',
    })
  },
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    wx.request({
      url: Config.restUrl + 'lovewall/loveletters/list.do',
      data: {
        offset: 0,
        limit: 10
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json"
      },
      success: function(res) {
        setTimeout(function() {
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        }, 1500)
      },
      fail: function(error) {
        console.log(error);
      }
    })
    wx.request({
      url: Config.restUrl + 'loverecord/loveaudio/list.do',
      data: {
        offset: 0,
        limit: 5
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json"
      },
      success: function(res) {
        setTimeout(function () {
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        }, 1500)
      },
      fail: function(error) {
        console.log(error);
      }
    })

  },
  //上拉触底事件
  onReachBottom: function() {
    var that = this;
    var start = [];
    var limit = that.data.limit;
    wx.request({
      url: Config.restUrl + 'lovewall/loveletters/list.do',
      data: {
        offset: 0,
        limit: limit
      },
      method: "POST",
      header: {
        'ContentType': 'application/json'
      },
      success: function(res) {
        for (var i = 0; i < res.data.length; i++) {
          var oldtime = res.data[i].time;
          var mess = timestamp.getDateDiff(oldtime);
          //转换oldtime
          start[i] = mess;
          res.data[i].time = start[i];
        }
        that.setData({
          newsArr: res.data,
        })
        if (limit > res.data.length) {
          setTimeout(function() {
            that.setData({
              hide: false,
              title: '托底了，兄台'
            })
          }, 500)
        }
        if (limit > res.data.length) {
          limit = res.data.length;
        } else {
          limit = limit + 5;
          that.data.limit = limit;
        }
      }
    })
    wx.request({
      method: "POST",
      url: Config.restUrl + 'loverecord/loveaudio/list.do',
      data: {
        offset: 0,
        limit: limit
      },
      header: {
        "Content-Type": "application/json"
      },
      success: function(res) {
        //转换为时间戳
        for (var i = 0; i < res.data.length; i++) {
          var oldtime = res.data[i].time;
          var mess = timestamp.getDateDiff(oldtime);
          //转换oldtime
          start[i] = mess;
          res.data[i].time = start[i];
        }
        that.setData({
          recordArr: res.data
        })
        if (limit > res.data.length) {
          setTimeout(function() {
            that.setData({
              hide: false,
              title: '托底了，兄台'
            })
          }, 500)
        }
        if (limit > res.data.length) {
          limit = res.data.length;
        } else {
          limit = limit + 5;
          that.data.limit = limit;
        }
      }

    })
  },

})