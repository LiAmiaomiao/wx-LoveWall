// pages/index/sayLove-page/love-detail/love-detail.js
var timestamp = require('../../../../utils/util.js');
import {
  Config
} from '../../../../utils/utils/config.js'
Page({
  data: {

    biaobaisex: true,
    showModal: false,
    //评论
    commentsize: 0,
    //初始化userId

    // userIcon:"https://wx.qlogo.cn/mmopen/vi_32/o9RIibWt7KwVRAHTF8YVZv8ub5WEl9fTe8GHM1GYn7OKpNAbEfNibHboM0pGx1ZM91pq103wSaePDesgqxsEhwvw/0",
    userName: "唐博文"
  },
  onLoad: function (options) {
    var that = this;
    //全局变量
    that.data.globalId = options.lovelistid;
    var start = [];
    wx.request({
      method: 'GET',
      url: Config.restUrl + 'lovewall/loveletters/' + options.lovelistid + '.do',
      success: function (res) {
        //转换为时间戳
        var mess = res.data.time;
        var miss = timestamp.getDateDiff(mess);
        res.data.time = miss;
        //转换评论时间戳
        var timebox = [];
        for (var i = 0; i < res.data.comments.length; i++) {
          var olddtime = res.data.comments[i].time
          timebox[i] = timestamp.getDateDiff(olddtime);
          res.data.comments[i].time = timebox[i];
        }
        that.setData({
          'loveItem': res.data
        })
      }

    })
    //初始化点赞缓存
    var likeArr = wx.getStorageSync('likeArr');
    that.setData({
      likeArr
    });

    var commentArr2 = wx.getStorageSync('commentArr2');
    if (commentArr2 != false) { } else {
      var commentArr2 = {};
    }
    wx.setStorageSync('commentArr2', commentArr2)
    that.setData({
      commentArr2
    });

  },

  /**显示评论框，取消=》隐藏评论框 */
  onComment: function () {
    this.setData({
      showModal: true,
    })
  },
  oncancle: function () {
    this.setData({
      showModal: false,
    })
  },

  /**提交评论 */
  submitComment: function (event) {
    var that = this;
    var commentText = event.detail.value.textarea;
    var userid = wx.getStorageSync("userInfoId")
    wx.request({
      url: Config.restUrl + 'lovewall/lovelettercomments.do',
      data: {
        'content': commentText,
        'userId': userid,
        'loveletterId': this.data.globalId,
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        res.data.likecount = 0;
        that.data.likecount = res.data.likecount;
        var status = res.data.status;
        // var content=res.data.content;
        if (res.data.content == "") {
          wx.showToast({
            title: '内容不能为空',
            image: '/images/icon/warning.png'
          })

        } else {
          if (status == 1) {
            that.setData({
              showModal: false
            })
            var mess = res.data.time;
            var miss = timestamp.getDateDiff(mess);
            that.setData({
              addcomments: res.data,
              mess: miss,
            })
            wx.showToast({
              title: '评论成功',
              icon: "success",
            })
            var commentsize = that.data.commentsize + 1;
            that.setData({
              commentsize: commentsize
            })
          } else {
            wx.showToast({
              title: '不能包含敏感词汇',
              image: '/images/icon/x.png'
            })
          }

        }
      }
    })

  },

  //文字表白详情评论点赞
  onAddFlower: function (event) {
    var that = this;
    var commentArr2 = wx.getStorageSync('commentArr2');
    if (commentArr2[event.currentTarget.dataset.flowercountid] == "") {
      commentArr2[event.currentTarget.dataset.flowercountid] = true;

    } else {
      commentArr2[event.currentTarget.dataset.flowercountid] = !commentArr2[event.currentTarget.dataset.flowercountid];
    }

    var count = commentArr2[event.currentTarget.dataset.flowercountid] ? 1 : -1;
    that.data.addcomments.likecount = that.data.addcomments.likecount + count;
    wx.setStorageSync('commentArr2', commentArr2)
    this.setData({
      commentArr2,
      addcomments: that.data.addcomments
    })
    wx.request({
      url: Config.restUrl + 'lovewall/lovelettercomments/addlike/' + event.currentTarget.dataset.flowercountid + '.do',
      data: {
        "loveLetterId": event.currentTarget.dataset.flowercountid,
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
  //表白详情评论点赞(真实)
  onaddflowerComment: function (event) {
    var that = this;
    var commentArr2 = wx.getStorageSync('commentArr2');
    if (commentArr2[event.currentTarget.dataset.addflowerid] == '') {
      commentArr2[event.currentTarget.dataset.addflowerid] = true;
    } else {
      commentArr2[event.currentTarget.dataset.addflowerid] = !commentArr2[event.currentTarget.dataset.addflowerid];
    }
    var count = commentArr2[event.currentTarget.dataset.addflowerid] ? 1 : -1;
    for (var i = 0; i < that.data.loveItem.comments.length; i++) {
      if (that.data.loveItem.comments[i].id == event.currentTarget.dataset.addflowerid) {
        that.data.loveItem.comments[i].likecount = that.data.loveItem.comments[i].likecount + count;
      }
    }
    wx.setStorageSync('commentArr2', commentArr2)
    this.setData({
      commentArr2,
      loveItem: that.data.loveItem
    })
    wx.request({
      url: Config.restUrl + 'lovewall/lovelettercomments/addlike/' + event.currentTarget.dataset.addflowerid + '.do',
      data: {
        "loveLetterId": event.currentTarget.dataset.addflowerid,
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
  // 表白详情点赞
  onLikeTap: function (event) {
    var that = this;
    var likeArr = wx.getStorageSync('likeArr');
    event.currentTarget.dataset.likeid;
    if (likeArr[event.currentTarget.dataset.likeid] == null) {
      likeArr[event.currentTarget.dataset.likeid] = true;
    } else {
      likeArr[event.currentTarget.dataset.likeid] = !likeArr[event.currentTarget.dataset.likeid];
    }
    var count = likeArr[event.currentTarget.dataset.likeid] ? 1 : -1;
    that.data.loveItem.likecount = that.data.loveItem.likecount + count;
    wx.setStorageSync('likeArr', likeArr)
    this.setData({
      likeArr,
      loveItem: that.data.loveItem
    })
    wx.request({
      url: Config.restUrl + 'lovewall/loveletters/addlike/' + event.currentTarget.dataset.likeid + '.do',
      data: {
        "loveLetterId": event.currentTarget.dataset.likeid,
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
  onUnload: function () {
    var that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    var pretPage = pages[pages.length - 2];
    for (var i = 0; i < pretPage.data.newsArr.length; i++) {
      if (pretPage.data.newsArr[i].id == currPage.data.loveItem.id) {
        pretPage.data.newsArr[i].commentcount = pretPage.data.newsArr[i].commentcount + that.data.commentsize;
        pretPage.data.newsArr[i].likecount = currPage.data.loveItem.likecount;
      }
    }
    pretPage.setData({
      newsArr: pretPage.data.newsArr,
      likeArr: wx.getStorageSync('likeArr')
    })
  },
})