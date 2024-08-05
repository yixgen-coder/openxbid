// pages/publish/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusbar: '',
    jiaonangheight: '',
    image: 'https://imgs.phanlink.com/program/images/logo.png',
    tabCurrent: 0,
    checked: false,
    phoneNumber: '',
    verificationCode: '',
    getCodeButtonText: '获取验证码',
    countdown: 0, // 倒计时
    sendcodestatus: false,
    isDisabled: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
  },
  onReady() {
    const checked = this.data.checked;
    if (!checked) {
      wx.showToast({
        title: '请先勾选服务协议和隐私协议！',
        icon: 'none'
      });
    }
  },

  getPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 用户同意授权
      // 获取到的加密数据和初始化向量
      const code = e.detail.code;
      const openid = wx.getStorageSync('openid');
      wx.request({
        url: 'https://kpy.phanlink.com/v1/getauthorLogin',
        method: 'POST',
        data: {
          code: code,
          openid: openid
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          //手机号授权登录
          if (res.data.code == 1) {
            wx.setStorageSync('token', res.data.token);
            wx.showToast({
              title: res.data.msg,
              icon: 'success',
              duration: 3000,
              mask: true,
              complete: () => {
                wx.navigateBack({
                  delta: 1
                });
              }
            });

          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'loading'
            });
          }

        }
      });
    } else {
      // 用户拒绝授权
      wx.showToast({
        title: '您拒绝了手机号授权',
        icon: 'none'
      });
    }
  },
  checktap(e) {
    var check = this.data.checked;
    this.setData({
      "checked": check ? false : true,
      "isDisabled": check ? true : false
    });
  },
  tabcheck() {
    this.setData({
      tabCurrent: 1
    });
  },
  tabcheck1() {
    this.setData({
      tabCurrent: 0
    });
  },
  handlephoneNumber(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },
  handleverificationCode(e) {
    this.setData({
      verificationCode: e.detail.value
    });
  },
  getVerificationCode: function () {
    const phoneNumber = this.data.phoneNumber;
    if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      wx.showToast({
        title: '请输入有效的手机号',
        icon: 'none'
      });
      return;
    }
    const checked = this.data.checked;
    if (!checked) {
      wx.showToast({
        title: '请先勾选服务协议和隐私协议！',
        icon: 'none'
      });
      return;
    }
    this.setData({
      sendcodestatus: true
    });
    // 发送验证码的逻辑
    this.sendVerificationCode(phoneNumber);

    // 开始倒计时
    let countdown = 60;
    const interval = setInterval(() => {
      if (countdown > 0) {
        this.setData({
          getCodeButtonText: `${countdown--} s 后重新发送`,
        });
      } else {
        clearInterval(interval);
        this.setData({
          getCodeButtonText: '重新发送',
          countdown: 0,
          sendcodestatus: false
        });
      }
    }, 1000);
  },

  sendVerificationCode: function (phoneNumber) {
    // 发送验证码的逻辑
    // 这里只是一个示例，实际应用中需要发送到服务器
    wx.request({
      url: 'https://kpy.phanlink.com/v1/getVcode',
      method: 'POST',
      data: {
        phone: phoneNumber
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //手机号授权登录
        console.log(res.data.code);
        if (res.data.code == 1) {
          wx.showToast({
            title: res.data.msg,
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'loading'
          });
        }

      }
    });

  },

  submitForm: function () {
    const phoneNumber = this.data.phoneNumber;
    const verificationCode = this.data.verificationCode;
    // 验证验证码的逻辑
    this.verifyCode(phoneNumber, verificationCode);
  },

  verifyCode: function (phoneNumber, verificationCode) {
    const openid = wx.getStorageSync('openid');
    wx.request({
      url: 'https://kpy.phanlink.com/v1/getLogin',
      method: 'POST',
      data: {
        phone: phoneNumber,
        verify_code: verificationCode,
        openid: openid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //手机号授权登录
        if (res.data.code == 1) {
          wx.setStorageSync('token', res.data.token);
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 2000,
            mask: true,
            complete: () => {
              wx.navigateBack({
                delta: 1
              });
            }
          });

        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'loading'
          });
        }

      }
    });
  }

})