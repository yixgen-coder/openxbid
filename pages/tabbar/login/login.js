// pages/publish/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    globalLangData: app.globalData.languagePack,
    statusbar: '',
    jiaonangheight: '',
    image: 'https://imgs.phanlink.com/program/images/logo.jpg',
    tabCurrent: 0,
    checked: false,
    phoneNumber: '',
    mailNumber: '',
    password: '',
    verificationCode: '',
    getCodeButtonText: app.globalData.languagePack.get_code,
    countdown: 0, // 倒计时
    sendcodestatus: false,
    isDisabled: true,
    tabList: [{
      text: app.globalData.languagePack.mobile_number,
      key: 1
    }, {
      text: app.globalData.languagePack.email,
      key: 2
    }],
    tabIndex: 1,
    product: {},
  },
  tabChangeHandle(e) {
    this.setData({
      tabIndex: e.detail.value
    })
  },
  onChange(e) {
    this.setData({
      'product.label': e.detail.value,
      'product.value': e.detail.value,
    });
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
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      this.loginAgain();
    }
    this.getRegionCodes();
  },
  onReady() {

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
              wx.setStorageSync('openid', res.data.openid);
            }
          });
        } else {
          console.log('登录失败！' + res.errMsg);
        }
      }
    });
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
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

          } else if (res.data.code == 2) {
            wx.setStorageSync('token', res.data.token);
            wx.showModal({
              title: app.globalData.languagePack.reminder,
              content: app.globalData.languagePack.lang == 1 ? 'Please set your avatar and nickname' : '请设置头像和昵称',
              confirmText: app.globalData.languagePack.sure, // 默认"确定"
              cancelText: app.globalData.languagePack.back, // 默认"取消"
              success: (res) => {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/my/pages/info/index',
                  });
                } else if (res.cancel) {
                  wx.navigateBack({
                    delta: 1
                  });
                }
              }
            })
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            });
          }

        }
      });
    } else {
      // 用户拒绝授权
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.lang == 1 ? 'You refuse the authorization of the mobile phone number' : '您拒绝了手机号授权',
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
      });
    }
  },
  getPhoneNumber1() {
    const checked = this.data.checked;
    if (!checked) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.please_check_the_service,
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
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
      tabCurrent: 1,
      tabIndex: 1
    });
  },
  tabcheck1() {
    this.setData({
      tabCurrent: 0,
      tabIndex: 1
    });
  },
  tabcheck2() {
    this.setData({
      tabCurrent: 2,
      tabIndex: 1
    });
  },
  handlephoneNumber(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },
  handleMailNumber(e) {
    this.setData({
      mailNumber: e.detail.value
    });
  },
  handlePassword(e) {
    this.setData({
      password: e.detail.value
    });
  },
  handleverificationCode(e) {
    this.setData({
      verificationCode: e.detail.value
    });
  },
  getVerificationCode: function () {
    const tabIndex = this.data.tabIndex;
    let phoneNumber = '';
    if (tabIndex == 2) {
      phoneNumber = this.data.mailNumber;
      if (!phoneNumber || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(phoneNumber)) {

        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: app.globalData.languagePack.lang == 1 ? 'Please enter a valid email number!' : '请输入有效的邮箱号码！',
          showCancel: false, // 隐藏取消按钮
          confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
          confirmColor: "#007AFF", // 自定义确认按钮颜色
        });
        return;
      }
    }

    if (tabIndex == 1) {
      phoneNumber = this.data.phoneNumber;
      if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: app.globalData.languagePack.lang == 1 ? 'Please enter a valid mobile phone number' : '请输入有效的手机号',
          showCancel: false, // 隐藏取消按钮
          confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
          confirmColor: "#007AFF", // 自定义确认按钮颜色
        });
        return;
      }
    }
    const checked = this.data.checked;
    if (!checked) {

      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.lang == 1 ? 'Please check the service agreement and Privacy agreement first!' : '请先勾选服务协议和隐私协议！',
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
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
          getCodeButtonText: `${countdown--} s ` + (app.globalData.languagePack.lang == 1 ? 'Re-send' : '后重新发送'),
        });
      } else {
        clearInterval(interval);
        this.setData({
          getCodeButtonText: app.globalData.languagePack.lang == 1 ? 'Re-send' : '重新发送',
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
        phone: phoneNumber,
        lang: app.globalData.languagePack.lang
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //手机号授权登录
        //console.log(res.data.code);
        if (res.data.code == 1) {

          wx.showModal({
            title: app.globalData.languagePack.reminder,
            content: res.data.msg,
            showCancel: false, // 隐藏取消按钮
            confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
            confirmColor: "#007AFF", // 自定义确认按钮颜色
          });
        } else {
          wx.showModal({
            title: app.globalData.languagePack.reminder,
            content: res.data.msg,
            showCancel: false, // 隐藏取消按钮
            confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
            confirmColor: "#007AFF", // 自定义确认按钮颜色
          });
        }

      }
    });

  },

  submitForm: function () {
    const checked = this.data.checked;
    const tabIndex = this.data.tabIndex;
    //console.log(tabIndex);
    if (!checked) {

      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.lang == 1 ? 'Please check the service agreement and Privacy agreement first!' : '请先勾选服务协议和隐私协议！',
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
      });
      return;
    }
    let phoneNumber = '';
    if (tabIndex == 2) {
      phoneNumber = this.data.mailNumber;
      if (!phoneNumber || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(phoneNumber)) {

        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: app.globalData.languagePack.lang == 1 ? 'Please enter a valid email number!' : '请输入有效的邮箱号码！',
          showCancel: false, // 隐藏取消按钮
          confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
          confirmColor: "#007AFF", // 自定义确认按钮颜色
        });
        return;
      }
    }

    if (tabIndex == 1) {
      phoneNumber = this.data.phoneNumber;
      if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {

        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: app.globalData.languagePack.lang == 1 ? 'Please enter a valid mobile phone number' : '请输入有效的手机号',
          showCancel: false, // 隐藏取消按钮
          confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
          confirmColor: "#007AFF", // 自定义确认按钮颜色
        });
        return;
      }
    }
    //console.log(phoneNumber);
    const password = this.data.password;
    const tabCurrent = this.data.tabCurrent;
    const verificationCode = this.data.verificationCode;
    if (tabCurrent == 2) {
      if (password == '') {

        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: app.globalData.languagePack.lang == 1 ? 'Please enter the password.' : '请输入密码',
          showCancel: false, // 隐藏取消按钮
          confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
          confirmColor: "#007AFF", // 自定义确认按钮颜色
        });
        return;
      }
    } else {
      if (verificationCode == '') {

        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: app.globalData.languagePack.lang == 1 ? 'Please enter the verification code' : '请输入验证码',
          showCancel: false, // 隐藏取消按钮
          confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
          confirmColor: "#007AFF", // 自定义确认按钮颜色
        });
        return;
      }
    }

    // 验证验证码的逻辑
    this.verifyCode(phoneNumber, verificationCode, password, tabCurrent, app.globalData.languagePack.lang);
  },

  verifyCode: function (phoneNumber, verificationCode, password, tabCurrent, lang) {
    const openid = wx.getStorageSync('openid');
    wx.request({
      url: 'https://kpy.phanlink.com/v1/getLogin',
      method: 'POST',
      data: {
        phone: phoneNumber,
        password: password,
        tabCurrent: tabCurrent,
        verify_code: verificationCode,
        openid: openid,
        lang: lang
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

        } else if (res.data.code == 2) {
          wx.setStorageSync('token', res.data.token);
          wx.showModal({
            title: app.globalData.languagePack.reminder,
            content: app.globalData.languagePack.lang == 1 ? 'Please set your avatar and nickname' : '请设置头像和昵称',
            confirmText: app.globalData.languagePack.sure, // 默认"确定"
            cancelText: app.globalData.languagePack.back, // 默认"取消"
            success: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/my/pages/info/index',
                });
              } else if (res.cancel) {
                wx.navigateBack({
                  delta: 1
                });
              }
            }
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          });
        }

      }
    });
  },
  async getRegionCodes() {
    const url = 'https://kpy.phanlink.com/v1/getRegionCodes';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.lang = app.globalData.languagePack.lang;
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      //console.log(res.data);
      this.setData({
        product: res.data.regions
      });
    }
  },
  fetchDatas(url, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'POST',
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          reject(err);
        }
      });
    });
  },
})