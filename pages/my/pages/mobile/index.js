const app = getApp()
// [改动] 引入统一请求层 post()
const { post } = require('../../../utils/request')
const { requireLogin } = require('../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.modify_phone_number,
    statusbar: '',
    jiaonangheight: '',
    userinfo: {},
    verificationCode: '',
    getCodeButtonText: app.globalData.languagePack.get_code,
    countdown: 0, // 倒计时
    sendcodestatus: false,
    isDisabled: true,
    phoneNumber: '',
    countryCode: '',
    product: {},
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // [改动] wx.getStorageSync('token') + showModal → requireLogin()
    if (!requireLogin()) return;
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
    this.fetchData();
    this.getRegionCodes();
  },
  onChange(e) {
    //console.log(e.detail.value);
    this.setData({
      'product.label': e.detail.value,
      'product.value': e.detail.value,
      'countryCode': e.detail.value,
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
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },

  submitForm: function (e) {
    const formData = {};
    // [改动] 删除 formData.token = wx.getStorageSync('token')，post() 自动注入
    formData.phone = this.data.phoneNumber;
    formData.countryCode = this.data.countryCode;
    formData.code = this.data.verificationCode;
    formData.lang = app.globalData.languagePack.lang;
    // 发送数据到服务器
    this.sendFormData(formData);
  },
  // [改动] 使用 post() 替代内联 wx.request
  sendFormData: async function (data) {
    try {
      const res = await post('/setMyPhone', data, { showError: false });
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000,
        mask: true,
        success: () => {
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 2000);
        }
      });
    } catch (res) {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000
      });
    }
  },
  getVerificationCode: function () {
    let phoneNumber = '';
    phoneNumber = this.data.phoneNumber;
    if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      wx.showToast({
        title: app.globalData.languagePack.lang == 1 ? 'Please enter a valid mobile phone number!' : '请输入有效的手机号码！',
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
          getCodeButtonText: `${countdown--} s ` + (app.globalData.languagePack.lang == 1 ? 'Re-send"' : '后重新发送'),
        });
      } else {
        clearInterval(interval);
        this.setData({
          getCodeButtonText: app.globalData.languagePack.lang == 1 ? 'Re-send"' : '重新发送',
          countdown: 0,
          sendcodestatus: false
        });
      }
    }, 1000);
  },
  // [改动] 使用 post() 替代内联 wx.request
  sendVerificationCode: async function (phoneNumber) {
    try {
      const res = await post('/getVcode', {
        tab_index: 1,
        country_code: this.data.countryCode,
        phone: phoneNumber,
        lang: app.globalData.languagePack.lang
      }, { showError: false });
      wx.showToast({
        title: res.msg,
        icon: 'none'
      });
    } catch (res) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      });
    }
  },
  // [改动] 使用 post() 替代 fetchDatas，删除 token 字段
  async getRegionCodes() {
    try {
      const res = await post('/getRegionCodes', {
        lang: app.globalData.languagePack.lang
      }, { showError: false });
      this.setData({
        product: res.data.regions
      });
    } catch (res) {}
  },
  // [改动] 使用 post() 替代内联 wx.request
  async fetchData() {
    try {
      const res = await post('/getmyInfo', {}, { showError: false });
      this.setData({
        phoneNumber: res.data.mobile.replace(res.data.country_code, ''),
        countryCode: res.data.country_code
      });
    } catch (res) {}
  }
})