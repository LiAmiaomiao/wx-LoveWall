
var timestamp = require('../../../utils/util.js');
import { Config } from '../../../utils/utils/config.js'
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
    that.data.globalId = options.letterid;
    var start = [];
    wx.request({
      method: 'GET',
      url: Config.restUrl + 'lovewall/loveletters/' + options.letterid + '.do',
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
    if (commentArr2 != false) {
    } else {
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
    wx.request({
      url: Config.restUrl + 'lovewall/lovelettercomments.do',
      data: {
        'content': commentText, 'userId': 1514, 'loveletterId': this.data.globalId,
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        res.data.likecount = 0;
        var status = res.data.status;
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
    })

  },

  //文字表白详情评论点赞
  onAddFlower: function (event) {
    var that = this;
    var commentArr1 = wx.getStorageSync('commentArr1');
    event.currentTarget.dataset.data.flowerCountid;
    if (commentArr1[event.currentTarget.dataset.flowerCountid] == null) {
      commentArr1[event.currentTarget.dataset.flowerCountid] = true;
    } else {
      commentArr1[event.currentTarget.dataset.flowerCountid] = !commentArr1[event.currentTarget.dataset.flowerCountid];
    }
    var count = commentArr1[event.currentTarget.dataset.flowerCountid] ? 1 : -1;
    that.data.addcomments.likecount = that.data.loveaddcommentsItem.likecount + count;
    console.log(that.data.addcomments.likecount);
    wx.setStorageSync('commentArr1', commentArr1)
    this.setData({
      commentArr1,
      addcomments: that.data.addcomments
    })
    wx.request({
      url: Config.restUrl + 'lovewall/loveletterscomments/addlike/' + event.currentTarget.dataset.flowerCountid + '.do',
      data: {
        "loveLetterId": event.currentTarget.dataset.flowerCountid,
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

  //表白详情评论点赞（真实）
  onaddflowerComment: function (event) {
    var that = this;
    var commentArr2 = wx.getStorageSync('commentArr2');
    event.currentTarget.dataset.addflowerid;
    console.log(event.currentTarget.dataset.addflowerid)
    if (commentArr2[event.currentTarget.dataset.addflowerid] == null) {
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
    // console.log(that.data.loveItem.likecount)
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
    var userPublishs = pretPage.data.userContent.userPublishs
    console.log(currPage, pretPage)

    for (var i = 0; i < pretPage.data.userContent.userPublishs.length; i++) {
      if (pretPage.data.userContent.userPublishs[i].type == 'LoveLetter') {
        if (pretPage.data.userContent.userPublishs[i].loveLetters.id == currPage.data.loveItem.id) {
          pretPage.data.userContent.userPublishs[i].loveLetters.commentcount = pretPage.data.userContent.userPublishs[i].loveLetters.commentcount + that.data.commentsize;
          pretPage.data.userContent.userPublishs[i].loveLetters.likecount = currPage.data.loveItem.likecount;
        }
      }

    }

    pretPage.setData({
      userContent: pretPage.data.userContent,
      likeArr: wx.getStorageSync('likeArr')
    })
  }

})