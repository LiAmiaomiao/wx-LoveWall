const recorderManager = wx.getRecorderManager()
var recordFilePath = ''
var that=null;
recorderManager.onStart(() => {
  console.log('recorder start')
})
recorderManager.onResume(() => {
  console.log('recorder resume')
})
recorderManager.onPause(() => {
  console.log('recorder pause')
})
recorderManager.onStop((res) => {
  console.log('recorder stop', res)
  
  //录音完成开始上传
  wx.request({
    url: 'https://xiaochengxu.kexie.group/HeiKeOnline/oss/author/loverecord.do',
    method: 'GET',
    success: function (authordata) {
      //保存凭证
      that.setData({
        accessId: authordata.data.accessid,
        policy: authordata.data.policy,
        signature: authordata.data.signature,
        dir: authordata.data.dir,
        host: authordata.data.host,
        expire: authordata.data.expire,
      });
      //截取图片路径 得到aliyunkey
      var filename = res.tempFilePath.replace('http://tmp/', '');
      var aliyunFileKey_item = authordata.data.dir + filename.replace('wxfile://', '');
      var aliyunkeys_temp = aliyunFileKey_item;

      //上传录音 获得录音的url （外网)
      wx.uploadFile({
        // url: that.data.host,
        url: 'https://static.kexie.group',
        filePath: res.tempFilePath,
        name: "file",
        formData: {
          'key': aliyunkeys_temp,
          'policy': that.data.policy,
          'OSSAccessKeyId': that.data.accessId,
          'success_action_status': '200',
          'signature': that.data.signature,
        },
        success: function (res) {
          
          //保存路径
          var PathUrl = "https://static.kexie.group/" + aliyunkeys_temp;
          // //上传成功
          recordFilePath = PathUrl
          that.setData({
            recordFilePath: recordFilePath,
          });

        }

     

         
       
      })
    }
  })
})

var timestamp = require('../../../../utils/util.js');
import { Config } from '../../../../utils/utils/config.js'
Page({
  data: {
    biaobaisex: true,
    hideRecord: true,
    imgDefault: '../../../../images/icon/photo.png',
    successUpImagePath:null,
    radomheight: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
    isshow: true,
    firstRecord: true,
    isRecording: false,// 是否在录音
    j: 1,//帧动画初始图片
    recordFilePath: null,

    //上传图片的凭证
    accessId: null,
    policy: null,
    signature: null,
    host: null,
    expire: null,
    dir: '',

    
  },
  onLoad: function (options) {
  that=this;
  },
  //取图片
  addImage: function (event) {
    var that = this;
    wx.request({
      url: 'https://xiaochengxu.kexie.group/HeiKeOnline/oss/author/testWx.do',
      method: 'GET',
      success: function (authordata) {
        //保存凭证
        that.setData({
          accessId: authordata.data.accessid,
          policy: authordata.data.policy,
          signature: authordata.data.signature,
          dir: authordata.data.dir,
          host: authordata.data.host,
          expire: authordata.data.expire,
        });
        //选择图片
        wx.chooseImage({
          sourceType: ['album', 'camera'],
          camera: 'back',
          count: 1,
          success: function (res) {

            //选择的图片的本地路径
            var filepath_item = res.tempFilePaths[0];
            //截取图片路径 得到aliyunkey
            var filename = filepath_item.replace('http://tmp/', '');
            var aliyunFileKey_item = authordata.data.dir + filename.replace('wxfile://', '');
            var aliyunkeys_temp = aliyunFileKey_item;
            
            that.setData({
              imgDefault: res.tempFilePaths[0],
            });

            //上传图片 获得图片的url （外网)
            wx.uploadFile({
              // url: that.data.host,
              url: this.data.host,
              filePath: filepath_item,
              name: "file",
              formData: {
                'key': aliyunkeys_temp,
                'policy': that.data.policy,
                'OSSAccessKeyId': that.data.accessId,
                'success_action_status': '200',
                'signature': that.data.signature,
              },
              success: function (res) {

                //保存路径
                var imgPathUrl = Config.uploadUrl + aliyunkeys_temp;
                // //每次上传成功都覆盖全局变量
                that.setData({
                  successUpImagePath: imgPathUrl,
                });

              }
            })
          }
        })
      }
    })
  },
  //提交内容发请求
  bindSubmit: function (event) {
    var that = this;
    var userid = wx.getStorageSync('userInfoId')
    var coverUrl = this.data.successUpImagePath;
    var toPeople = event.detail.value.toPeople;
    var fromPeople = event.detail.value.fromPeople;
    var textarea = event.detail.value.loveContent;
    var audioFilePath = recordFilePath;
    if (audioFilePath==null) {
      wx.showToast({
        title: '录音不能为空',
        image: '/images/icon/warning.png'
      })
    } else {
      wx.request({
        url: Config.restUrl + 'loverecord/loveaudio.do',
        method: 'POST',
        data: {
          'coverUrl': coverUrl, 'fromPeople': fromPeople, 'toPeople': toPeople, 'audioPath': audioFilePath, 'userId': userid,
          'text': textarea
        },
        header: {
          'Content-Type': 'application/json'
        },
        success: function (res) {
          res.data.likecount = 0;
          res.data.commentcount = 0;
          res.data.viewcount = 0;
          var newaudio = res.data;
          that.setData({
            newaudio
          })
          wx.showToast({
            title: '发表成功',
            icon: 'success'
          })
          setTimeout(function () {
            wx.navigateBack({
            })
          }, 1500)

        }
      })
    }
  },
  //表白语音回显
  onUnload: function () {
    var that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    var pretPage = pages[pages.length - 2];
      if (currPage.data.newaudio != undefined) {
        currPage.data.newaudio.time = timestamp.getDateDiff(currPage.data.newaudio.time);
        pretPage.data.recordArr.unshift(that.data.newaudio);
        pretPage.setData({
          recordArr: pretPage.data.recordArr,
          currentTab: "1",
        });
      } else {
      } 
      // console.log(currPage, pretPage)
    },


  onRecord: function () {
    this.setData({
      hideRecord: false
    })
  },
  onReady: function () {
    this.animation1 = wx.createAnimation({ duration: 1000, })
    this.animation2 = wx.createAnimation({ duration: 1000, })
    this.animation3 = wx.createAnimation({ duration: 1000, })
  },

  /** 
   * 生命周期函数--监听页面显示 
   */

  //我的随机数  
  myradom: function () {
    if (!this.data.isshow) {
      return;
    }
    const that = this;
    var _radomheight = that.data.radomheight;

    for (var i = 0; i < that.data.radomheight.length; i++) {
      //+1是为了避免为0  
      _radomheight[i] = (200 * Math.random().toFixed(2)) + 10;
    }
    that.setData({
      radomheight: _radomheight
    });
    setTimeout(function () { that.myradom(); }, 500);
  },
  startOrpause: function () {
    if (this.data.firstRecord) {//第一次录音
      recorderManager.start();
      this.myradom();//开始长短线条动画
      this.setData({
        firstRecord: false,
        isRecording: true
      });
      speaking.call(this);//开始话筒动画
    } else {//不是第一次点击录音
      if (this.data.isRecording) {//正在录 点击 则暂停
        recorderManager.pause();
        clearInterval(this.timer);//停止话筒动画
        this.setData({
          isRecording: false,//停止长短线条动画
          isshow: false,
        });
      } else { //恢复录音
        recorderManager.resume();
        this.setData({
          isshow: true,
          isRecording: true
        });
        this.myradom();//开始长短线条动画
        speaking.call(this);//开始话筒动画
      }
    }

  },
  finsh: function () {
    recorderManager.stop();
    this.setData({
      hideRecord: true
    })
  },

})
function speaking() {
  var _this = this;
  //话筒帧动画
  var i = 1;
  this.timer = setInterval(function () {
    i++;
    i = i % 5;
    _this.setData({
      j: i
    })
    return
  }, 200);
  //波纹放大,淡出动画
}
