var timestamp = require('../../../../utils/util.js');
import { Config} from '../../../../utils/utils/config.js'
Page({
  data: {
    biaobaisex:true,
    showModal: false,
    play: false,
    audioAction: {
      method: 'pause'
    },
    commentsize:0

  },
  onLoad: function (options) {
    var that = this;
    //全局变量
    that.data.globalId = options.recordid;
    wx.request({
      method: 'GET',
      url: Config.restUrl+'loverecord/loveaudio/' + options.recordid + '.do',
      success: function (res) {
        console.log(res);
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
          'recordItem': res.data
        })
      }
    })
    //初始化点赞缓存
    var xinArr = wx.getStorageSync('xinArr');
    that.setData({
      xinArr
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
      url: Config.restUrl+'loverecord/loveaudiocomment.do',
      data: {
        'content': commentText, 'userId': userid, 'loveAudioId': this.data.globalId,
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        res.data.likecount=0;
       var status = res.data.status;
       if(res.data.content==""){
         wx.showToast({
           title: '内容不能为空',
           image: '/images/icon/warning.png'
         })
       }else{
         if (status == 1) {
           that.setData({
             showModal: false
           })
           var mess = res.data.time;
           var miss = timestamp.getDateDiff(mess);
           that.setData({
             addcomments: res.data,
             mess: miss,
             commentsize: that.data.commentsize++
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
 
  //表白详情评论点赞（真实）
  onaddflowerComment: function (event) {
    var that = this;
    var commentArr2 = wx.getStorageSync('commentArr2');
    if (commentArr2[event.currentTarget.dataset.flowercountid] == null) {
      commentArr2[event.currentTarget.dataset.flowercountid] = true;
    } else {
      commentArr2[event.currentTarget.dataset.flowercountid] = !commentArr2[event.currentTarget.dataset.flowercountid];
    }
    var count = commentArr2[event.currentTarget.dataset.flowercountid] ? 1 : -1;
    for (var i = 0; i < that.data.recordItem.comments.length; i++) {
      if (that.data.recordItem.comments[i].id == event.currentTarget.dataset.flowercountid) {
        that.data.recordItem.comments[i].likecount = that.data.recordItem.comments[i].likecount + count;
      }
    }
    wx.setStorageSync('commentArr2', commentArr2)
    this.setData({
      commentArr2,
      recordItem: that.data.recordItem
    })
    // wx.request({
    //   url: Config.restUrl +'loverecord/loveaudiocomment.do',
    //   data: {
    //     "loveLetterId": event.currentTarget.dataset.flowercountid,
    //     "count": count
    //   },
    //   method: 'POST',
    //   header: {
    //     "Content-Type": "application/json"
    //   },
    //   success: function () {

    //   }
    // })
  },
  //表白详情评论点赞
  onAddFlower: function (event) {
    var that = this;
    var commentArr2 = wx.getStorageSync('commentArr2');
    if (commentArr2[event.currentTarget.dataset.addflowerid] =="") {
      commentArr2[event.currentTarget.dataset.addflowerid] = true;
    } else {
      commentArr2[event.currentTarget.dataset.addflowerid] = !commentArr2[event.currentTarget.dataset.addflowerid];
    }
    console.log(commentArr2[event.currentTarget.dataset.addflowerid]);
    var count = commentArr2[event.currentTarget.dataset.addflowerid] ? 1 : -1;
    console.log(count)
    that.data.addcomments.likecount = that.data.addcomments.likecount + count; 
    wx.setStorageSync('commentArr2', commentArr2)
    this.setData({
      commentArr2,
      addcomments: that.data.addcomments
    })
    // wx.request({
    //   url: Config.restUrl +'loverecord/loveaudiocomment.do',
    //   data: {
    //     "loveLetterId": event.currentTarget.dataset.addflowerid,
    //     "count": count
    //   },
    //   method: 'POST',
    //   header: {
    //     "Content-Type": "application/json"
    //   },
    //   success: function () {

    //   }
    // })
  },
  // 表白录音详情点赞
  onLikeTap: function (event) {
    var that = this;
    var xinArr = wx.getStorageSync('xinArr');
    event.currentTarget.dataset.likeid;
    if (xinArr[event.currentTarget.dataset.likeid] == null) {
      xinArr[event.currentTarget.dataset.likeid] = true;
    } else {
      xinArr[event.currentTarget.dataset.likeid] = !xinArr[event.currentTarget.dataset.likeid];
    }
    var count = xinArr[event.currentTarget.dataset.likeid] ? 1 : -1;
    that.data.recordItem.likecount = that.data.recordItem.likecount + count;
    
    console.log(that.data.recordItem.likecount);
    wx.setStorageSync('xinArr', xinArr)
    this.setData({
      xinArr,
      recordItem: that.data.recordItem
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
  //录音播放
  audioTimeUpdated: function (e) {
    
    this.duration = e.detail.duration;
  },
  timeSliderChanged: function (e) {
    if (!this.duration)
      return;
    var time = this.duration * e.detail.value / 100;
    this.setData({
      audioAction: {
        method: 'setCurrentTime',
        data: time
      }
    });
  },
  playbackRateSliderChanged: function (e) {
    this.setData({
      audioAction: {
        method: 'setPlaybackRate',
        data: e.detail.value
      }
    })
  },
  playAudio: function () {
    this.setData({
      audioAction: {
        method: 'play',
      },
      play: true,
    });
  },
  pauseAudio: function () {
    this.setData({
      audioAction: {
        method: 'pause',
      },
      play: false
    });
  },
  //页面关闭的时候(点击返回的时候)
  onUnload:function(){
    var that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    var pretPage = pages[pages.length - 2];
    console.log(currPage, pretPage)
    for (var i = 0; i < pretPage.data.recordArr.length; i++) {
      if (pretPage.data.recordArr[i].id == currPage.data.recordItem.id) {
        pretPage.data.recordArr[i].commentcount = pretPage.data.recordArr[i].commentcount + that.data.commentsize;
        pretPage.data.recordArr[i].likecount = currPage.data.recordItem.likecount;
      }
    }
    pretPage.setData({
      recordArr: pretPage.data.recordArr,
      xinArr: wx.getStorageSync('xinArr')
    })
  }
})