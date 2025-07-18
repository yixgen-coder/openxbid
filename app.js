import updateManager from './common/updateManager';
const {
  getLanguage
} = require('./common/lang')
App({
  onLaunch: function () {
    // 设置全局语言
    this.globalData.languagePack = getLanguage()
    // 小程序客户端示例代码
    var token = wx.getStorageSync('token');
    var openid = wx.getStorageSync('openid');
    var that = this;
    //console.log(token);
    // if (!token) {
    //   this.loginAgain();
    // }
  },
  globalData: {
    languagePack: null,
  },
  onShow: function () {
    updateManager();
  },
  loginAgain: function () {
    wx.login({
      success: function (res) {
        if (res.code) {
          // 发起网络请求
          wx.request({
            url: 'https://kpy.phanlink.com/v1/getToken',
            method: 'POST',
            data: {
              code: res.code
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              wx.setStorageSync('token', res.data.token);
              wx.setStorageSync('openid', res.data.openid);
            }
          });
        } else {
          console.log('登录失败！' + res.errMsg);
        }
      }
    });
  },
});