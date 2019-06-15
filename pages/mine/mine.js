// pages/mine/mine.js
var timestamp = require('../../utils/util.js');
import { Config } from '../../utils/utils/config.js';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    delete: true,
    biaobaisex: true,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var userId = wx.getStorageSync("userInfoId");
    this.setData({
      userId: userId
    })
    // 设置用户登录态
    var that = this;
    var start = [];
    this.setData({
      isLogin: wx.getStorageSync('isLogin')
    });
    // 判断是否已授权登录
    if (wx.getStorageSync('isLogin')) {
      // 已登录
      wx.request({
        // url: Config.restUrl + 'market/usermarketinfo/' + wx.getStorageSync('userInfoId') + '.do',
        url: Config.restUrl + 'userinfo/' + wx.getStorageSync('userInfoId') + '.do',
        data: {},
        method: 'GET',
        header: {
          'ContentType': 'application/json'
        },
        success: function (res) {
          console.log(res)
          for (var i = 0; i < res.data.userPublishs.length; i++) {
            if (res.data.userPublishs[i].type == 'LoveAudio') {
              res.data.userPublishs[i].loveAudios.time = timestamp.getDateDiff(res.data.userPublishs[i].loveAudios.time);

            } else if (res.data.userPublishs[i].type == "LoveLetter") {
              res.data.userPublishs[i].loveLetters.time = timestamp.getDateDiff(res.data.userPublishs[i].loveLetters.time);

            }
          }
          that.setData({
            userContent: res.data
          })

        },
      })
    } else {
      // 未登录 虚拟一个用户
    }
    //初始化点赞缓存
    var likeArr = wx.getStorageSync('likeArr');
    if (likeArr != false) {
    } else {
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
  // 用户授权,获取用户信息
  toGetUserInfo: function (event) {
    var that = this;
    if (event.detail.userInfo == undefined) {
      console.log('用户拒绝授权');
    } else {
      // 将用户信息储存到数据库
      app.globalData.userInfo = event.detail.userInfo;
      wx.request({
        url: Config.restUrl + 'users/' + wx.getStorageSync('userInfoId') + '.do',
        data: {
          id: wx.getStorageSync('userInfoId'),
          name: event.detail.userInfo.nickName,
          icon: event.detail.userInfo.avatarUrl,
          gender: event.detail.userInfo.gender,
          city: event.detail.userInfo.city,
          province: event.detail.userInfo.province,
          country: event.detail.userInfo.country
        },
        method: 'PUT',
        header: {
          'ContentType': 'application/json'
        },
        success: function (res) {
          wx.request({
            // url: Config.restUrl + 'market/usermarketinfo/' + wx.getStorageSync('userInfoId') + '.do',
            url: Config.restUrl + 'userinfo/' + wx.getStorageSync('userInfoId') + '.do',
            data: {},
            method: 'GET',
            header: {
              'ContentType': 'application/json'
            },
            success: function (res) {
              console.log(res)
              for (var i = 0; i < res.data.userPublishs.length; i++) {
                if (res.data.userPublishs[i].type == 'LoveAudio') {
                  res.data.userPublishs[i].loveAudios.time = timestamp.getDateDiff(res.data.userPublishs[i].loveAudios.time);

                } else if (res.data.userPublishs[i].type == "LoveLetter") {
                  res.data.userPublishs[i].loveLetters.time = timestamp.getDateDiff(res.data.userPublishs[i].loveLetters.time);

                }
              }
              that.setData({
                userContent: res.data
              })

            },
          })
        },
      })
      wx.setStorageSync('isLogin', true);
      this.setData({
        isLogin: wx.getStorageSync('isLogin')
      });
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    wx.request({
      url: Config.restUrl + 'userinfo/' + wx.getStorageSync('userInfoId') + '.do',
      data: { },
      method: 'POST',
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        wx.hideNavigationBarLoading();
      },
      fail: function (error) {
        console.log(error);
      }
    })
  
  },
  //删除
  // onShowDelete: function (event) {
  //   delete = ! delete;
  //   this.setData({
  //     delete: false
  //   })
  // },
  onDetail: function (event) {
    console.log(event)
    wx.navigateTo({
      url: 'audio-page/audio-page?audiosid=' + event.currentTarget.dataset.audiosid
    })
  },
  //跳转详情
  onDetails: function (event) {
    wx.navigateTo({
      url: 'biaobai-detail/biaobai-page?letterid=' + event.currentTarget.dataset.letterid
    })
  },
  //文字表白点赞
  onLikeTap: function (event) {
    var likeArr = wx.getStorageSync('likeArr');
    var that = this;
    var letterid = event.currentTarget.dataset.likeid;
    var idx = event.currentTarget.dataset.idx;
    if (likeArr[letterid] == null) {
      likeArr[letterid] = true;
    } else {
      likeArr[letterid] = !likeArr[letterid];
    }
    var count = likeArr[letterid] ? 1 : -1;

    // 点赞数改变
    that.data.userContent.userPublishs[idx].loveLetters.likecount = that.data.userContent.userPublishs[idx].loveLetters.likecount + count;
    wx.setStorageSync('likeArr', likeArr);
    this.setData({
      likeArr,
      userContent: that.data.userContent
    });
    wx.request({
      url: Config.restUrl + 'lovewall/loveletters/addlike/' + letterid + '.do',
      data: {
        "loveLetterId": letterid,
        "count": count
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json"
      },
      success: function () {

      }
    })
  },
  //语音点赞
  onXinTap: function (event) {
    var xinArr = wx.getStorageSync('xinArr');
    var that = this;
    var audiosid = event.currentTarget.dataset.likeid;
    var idx = event.currentTarget.dataset.idx;
    if (xinArr[audiosid] == null) {
      xinArr[audiosid] = true;
    } else {
      xinArr[audiosid] = !xinArr[audiosid];
    }
    var count = xinArr[audiosid] ? 1 : -1;
    // 点赞数改变
    that.data.userContent.userPublishs[idx].loveAudios.likecount = that.data.userContent.userPublishs[idx].loveAudios.likecount + count;

    wx.setStorageSync('xinArr', xinArr)
    this.setData({
      xinArr,
      userContent: that.data.userContent
    });

    wx.request({
      url: Config.restUrl + 'lovewall/loveletters/addlike/' + audiosid + '.do',
      data: {
        "loveLetterId": audiosid,
        "count": count
      },
      method: 'POST',
      header: {
        "Content-Type": "application/json"
      },
      success: function () {

      }
    })

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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },


  /**
   * 页面上拉触底事件的处理函数
   */

})