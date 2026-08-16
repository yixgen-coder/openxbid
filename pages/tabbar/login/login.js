// pages/publish/index.js
const app = getApp()
const { post } = require('../../../utils/request')
const { setToken } = require('../../../services/auth')
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
    countryCode: '+86',
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
    //console.log(e.detail.value);
    this.setData({
      'product.label': e.detail.value,
      'product.value': e.detail.value,
      'countryCode': e.detail.value,
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
          // [改动] wx.request → post()
          post('/getToken', { code: res.code }, { showError: false })
            .then((data) => {
              wx.setStorageSync('openid', data.openid);
            })
            .catch(() => {});
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
      const code = e.detail.code;
      const openid = wx.getStorageSync('openid');
      // [改动] wx.request → post()，showError:false 因需手动处理 code=2
      post('/getauthorLogin', { code, openid }, { showError: false })
        .then((res) => {
          if (res.code == 1) {
            setToken(res.token);
            wx.showToast({
              title: res.msg,
              icon: 'success',
              duration: 3000,
              mask: true,
              complete: () => {
                wx.navigateBack({ delta: 1 });
              }
            });
          } else if (res.code == 2) {
            setToken(res.token);
            wx.showModal({
              title: app.globalData.languagePack.reminder,
              content: app.globalData.languagePack.lang == 1 ? 'Please set your avatar and nickname' : '请设置头像和昵称',
              confirmText: app.globalData.languagePack.sure,
              cancelText: app.globalData.languagePack.back,
              success: (res) => {
                if (res.confirm) {
                  wx.navigateTo({ url: '/pages/my/pages/info/index' });
                } else if (res.cancel) {
                  wx.navigateBack({ delta: 1 });
                }
              }
            });
          } else {
            wx.showToast({ title: res.msg, icon: 'none' });
          }
        })
        .catch((err) => {
          wx.showToast({ title: err.msg || '登录失败', icon: 'none' });
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
      if (phoneNumber == '') {
        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: app.globalData.languagePack.lang == 1 ? 'Please enter a valid mobile phone number' : '请输入有效的手机号码',
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
    const countryCode = this.data.countryCode;
    this.sendVerificationCode(tabIndex, countryCode, phoneNumber);

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
  handleServiceTap(e) {
    const type = e.currentTarget.dataset.type;

    if (type === 'service') {
      wx.navigateTo({
        url: '/pages/my/pages/about/index?artId=2'
      })
    } else if (type === 'policy') {
      wx.navigateTo({
        url: '/pages/my/pages/about/index?artId=3'
      })
    }
  },
  sendVerificationCode: function (tabIndex, countryCode, phoneNumber) {
    // [改动] wx.request → post()，showError:false 因成功/失败都弹窗
    post('/getVcode', {
      tab_index: tabIndex,
      country_code: countryCode,
      phone: phoneNumber,
      lang: app.globalData.languagePack.lang
    }, { showError: false })
      .then((res) => {
        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: res.msg,
          showCancel: false,
          confirmText: app.globalData.languagePack.sure,
          confirmColor: "#007AFF",
        });
      })
      .catch((err) => {
        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: err.msg || '验证码发送失败',
          showCancel: false,
          confirmText: app.globalData.languagePack.sure,
          confirmColor: "#007AFF",
        });
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
      if (phoneNumber == '') {

        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: app.globalData.languagePack.lang == 1 ? 'Please enter a valid mobile phone number' : '请输入有效的手机号码',
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
    const countryCode = this.data.countryCode;
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
    this.verifyCode(tabIndex, countryCode, phoneNumber, verificationCode, password, tabCurrent, app.globalData.languagePack.lang);
  },

  verifyCode: function (tabIndex, countryCode, phoneNumber, verificationCode, password, tabCurrent, lang) {
    const openid = wx.getStorageSync('openid');
    // [改动] wx.request → post()，showError:false 因需手动处理 code=2
    post('/getLogin', {
      tab_index: tabIndex,
      country_code: countryCode,
      phone: phoneNumber,
      password,
      tabCurrent,
      verify_code: verificationCode,
      openid,
      lang
    }, { showError: false })
      .then((res) => {
        if (res.code == 1) {
          setToken(res.token);
          wx.showToast({
            title: res.msg,
            icon: 'success',
            duration: 2000,
            mask: true,
            complete: () => {
              wx.navigateBack({ delta: 1 });
            }
          });
        } else if (res.code == 2) {
          setToken(res.token);
          wx.showModal({
            title: app.globalData.languagePack.reminder,
            content: app.globalData.languagePack.lang == 1 ? 'Please set your avatar and nickname' : '请设置头像和昵称',
            confirmText: app.globalData.languagePack.sure,
            cancelText: app.globalData.languagePack.back,
            success: (res) => {
              if (res.confirm) {
                wx.navigateTo({ url: '/pages/my/pages/info/index' });
              } else if (res.cancel) {
                wx.navigateBack({ delta: 1 });
              }
            }
          });
        } else {
          wx.showToast({ title: res.msg, icon: 'none' });
        }
      })
      .catch((err) => {
        wx.showToast({ title: err.msg || '登录失败', icon: 'none' });
      });
  },
  async getRegionCodes() {
    // [改动] fetchDatas → post()
    const res = await post('/getRegionCodes', {
      lang: app.globalData.languagePack.lang
    }, { showError: false });
    if (res.code == 1) {
      this.setData({
        product: res.data.regions
      });
    }
  },
})