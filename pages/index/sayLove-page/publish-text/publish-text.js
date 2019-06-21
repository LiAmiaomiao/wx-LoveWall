// pages/used/addCommodity/addCommodity.js
import { Config } from '../../../../utils/utils/config.js';
var util = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    biaobaisex: true,
    imgDefault: '../../../../images/icon/photo.png',
    accessId: null,
    policy: null,
    signature: null,
    dir: null,
    host: null,
    expire: null,
    aliyunkeys: [],

    //表示选择的
    filepaths: [],
    //表示上传成功显示的
    //返回给应用服务器的图片地址
    successImagePath: [],
    //是否显示进度条
    isshow: "none",
    progressLength: 0,

    //表单数据
    toPeople: null,
    fromPeople: null,
    text: null,
    userId: 1514,
  },

  sendData: function (i) {
    var that = this;
    var missionSize = this.data.filepaths.length;
    //出口
    if (missionSize <= i) {
      return;
    }
    var successImagePath = that.data.successImagePath;
    wx.uploadFile({
      url: this.data.host,
      filePath: this.data.filepaths[i],
      name: "file",
      formData: {
        'key': this.data.aliyunkeys[i],
        'policy': this.data.policy,
        'OSSAccessKeyId': this.data.accessId,
        'success_action_status': '200',
        'signature': this.data.signature,
      },
      success: function (res) {
        //保存路径
        successImagePath[i] = Config.uploadUrl + that.data.aliyunkeys[i];
        //更新相应按钮样式
        var textinfostyletemp = that.data.textinfostyle;
        textinfostyletemp[i] = false;
        var textinfotemp = that.data.textinfo;
        textinfotemp[i] = '上传成功';
        i++;
        //更新进度条
        var progressPercent = parseInt((i / missionSize) * 100);
        // console.log("第" + i + "张图片上传成功");
        //每次上传成功都覆盖全局变量
        that.setData({
          successImagePath: successImagePath,
          progressLength: progressPercent,
          textinfostyle: textinfostyletemp,
          textinfo: textinfotemp
        });
        //递归调用自身
        that.sendData(i);
      }
    })
  },
  /**
   * 发送数据请求(单个)
   */
  sendDataOne: function (i) {
    var that = this;

    var successImagePath = that.data.successImagePath;
    //获取授权
    wx.request({
      url: 'https://xiaochengxu.kexie.group/HeiKeOnline/oss/author/lovewall.do',
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
        wx.uploadFile({
          url: that.data.host,
          filePath: that.data.filepaths[i],
          name: "file",
          formData: {
            'key': that.data.aliyunkeys[i],
            'policy': that.data.policy,
            'OSSAccessKeyId': that.data.accessId,
            'success_action_status': '200',
            'signature': that.data.signature,
          },
          success: function (res) {
            console.log("againUp is ok");
            console.log(that.data.aliyunkeys[i]);
          }
        })
      }
    })
  },
  /**
   * 发送请求授权，选择图片后，保存所有图片路径 和 alinyunkeys
   */
  addImage: function () {
    var that = this;
    //选择图片
    wx.chooseImage({
      sourceType: ['album', 'camera'],
      camera: 'back',
      count: 9,
      success: function (files) {
        //获取授权
        wx.request({
          url: 'https://xiaochengxu.kexie.group/HeiKeOnline/oss/author/lovewall.do',
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

            var aliyunkeys_temp = [];
            var textinfostyletemp = [];
            var textinfotemp = [];
            for (var i = 0; i < files.tempFilePaths.length; i++) {
              var filepath_item = files.tempFilePaths[i];
              var filepath_item = filepath_item.replace('http://tmp/', '');
              var aliyunFileKey_item = authordata.data.dir + filepath_item.replace('wxfile://', '');
              aliyunkeys_temp[i] = aliyunFileKey_item;
              textinfostyletemp[i] = true;
              textinfotemp[i] = '可以取消哦';
            }
            //保存选择的文件的 aliyunkey
            that.setData({
              aliyunkeys: aliyunkeys_temp,
              filepaths: files.tempFilePaths,
              textinfostyle: textinfostyletemp,
              textinfo: textinfotemp
            });
            //开始尝试第一次上传
            that.sendData(0);
          }
        })
      }
    })
  },

  // 表白信的发布
  bindFormSubmit: function (e) {
    var that = this;
    var toPeople = e.detail.value.toPeople;
    var fromPeople = e.detail.value.fromPeople;
    var text = e.detail.value.loveContent;
    var imgUrls_str = that.data.successImagePath;
    // if (toPeople == '') {
    //   wx.showToast({
    //     title: '请输入表白对象',
    //     icon: "none",
    //     duration: 1500
    //   })
    //   return;
    // }
    // if (fromPeople == '') {
    //   wx.showToast({
    //     title: '请留下你的名字',
    //     icon: "none",
    //     duration: 1500
    //   })
    // }
    if (text == '') {
      wx.showToast({
        title: '请输入表白内容',
        icon: "none",
        duration: 1500
      })
      return;
    }
    wx.showLoading({
      title: '正在上传中',
      mask: true
    })
    //检查图片是否上传完成
    that.checkImageUp(0);
    wx.request({
      'url': Config.restUrl + 'lovewall/loveletters.do',
      data: {
        'toPeople': toPeople, 'fromPeople': fromPeople, 'text': text, 'imgUrls_str': imgUrls_str, 'userId': wx.getStorageSync('userInfoId')
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      success: function (res) {
        that.setData({
          additionalItem: res.data
        });
        wx.hideLoading();
        wx.showToast({
          title: '发布成功',
          duration: 2000,
          icon: 'success',
          success: function () {
            setTimeout(function () {
              wx.navigateBack({
              })
              console.log('已上传');
            }, 2000)
          }
        });
      },
      fail: function (err) { }
    })
  },
  checkImageUp: function (i) {
    var that = this;
    if (that.data.filepaths.length > i) {
      var j = i;
      //异步请求
      wx.request({
        url: that.data.successImagePath[i],
        method: 'HEAD',
        success(data) {
          if (data.statusCode == 404) {//如果找不到key
            that.sendDataOne(j);//再次上传
          }
        }
      })
      i++;
      that.checkImageUp(i);
    }
  },
  onUnload: function () {
    var that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    var pretPage = pages[pages.length - 2];
    console.log(currPage, pretPage);
    var temp = [];
    if (currPage.data.text == '') {
      
    } else {
     
      if (currPage.data.additionalItem != null) {
        for (var i = 0; i < currPage.data.additionalItem.imgUrls_str.length; i++) {
          var imgArr = {
            id: 0,
            url: currPage.data.additionalItem.imgUrls_str[i]
          }
          temp[i] = imgArr;
        }
        currPage.data.additionalItem.pictures = temp;
        currPage.data.additionalItem.likecount = 0;
        currPage.data.additionalItem.commentcount = 0;
        currPage.data.additionalItem.time = util.getDateDiff(currPage.data.additionalItem.time);
        pretPage.data.newsArr.unshift(currPage.data.additionalItem);
        pretPage.setData({
          newsArr: pretPage.data.newsArr,
        });
      } else {
        
      } 
    }
  }
})