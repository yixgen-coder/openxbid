import updateManager from './common/updateManager';

App({
  onLaunch: function () {

    // 小程序客户端示例代码
    var token = wx.getStorageSync('token');
    var open = wx.getStorageSync('open');
    var that = this;

    if (token) {
      // 直接使用 token
      wx.request({
        url: 'https://kpy.phanlink.com/v1/getToken',
        method: 'POST',
        data: {
          token: token
        },
        success: function (res) {
          if (res.data.valid) {
            // token 有效，用户已登录
          } else {
            // token 无效，重新登录
            that.loginAgain();
          }
        }
      });
    } else {
      this.loginAgain();
    }
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
              if (res.data.token) {
                wx.setStorageSync('token', res.data.token);
              } else {
                wx.setStorageSync('openid', res.data.openid);
              }

            }
          });
        } else {
          console.log('登录失败！' + res.errMsg);
        }
      }
    });
  },
});