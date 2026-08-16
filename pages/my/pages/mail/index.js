const app = getApp()
const { post } = require('../../../utils/request')
const { requireLogin } = require('../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.modify_email,
    statusbar: '',
    jiaonangheight: '',
    userinfo: {},
    verificationCode: '',
    getCodeButtonText: app.globalData.languagePack.get_code,
    countdown: 0, // 倒计时
    sendcodestatus: false,
    isDisabled: true,
    mailNumber: ''
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
  },
  handleMailNumber(e) {
    this.setData({
      mailNumber: e.detail.value
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
    formData.phone = this.data.mailNumber;
    formData.code = this.data.verificationCode;
    formData.lang = app.globalData.languagePack.lang;

    // 发送数据到服务器
    this.sendFormData(formData);
  },
  sendFormData: async function (data) {
    // [改动] wx.request → post()
    try {
      const res = await post('/setMyMail', data, { showError: false });
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
        title: res.msg || '网络错误',
        icon: 'none',
        duration: 2000
      });
    }
  },
  getVerificationCode: function () {
    let phoneNumber = '';
    phoneNumber = this.data.mailNumber;
    if (!phoneNumber || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(phoneNumber)) {
      wx.showToast({
        title: app.globalData.languagePack.lang == 1 ? 'Please enter a valid email number!' : '请输入有效的邮箱号码！',
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
          getCodeButtonText: `${countdown--} s ` + (app.globalData.languagePack.lang == 1 ? 'Re-send' : '重新发送'),
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
    // [改动] wx.request → post()
    post('/getVcode', {
      tab_index: 2,
      country_code: '0',
      phone: phoneNumber,
      lang: app.globalData.languagePack.lang
    }, { showError: false }).then(res => {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      });
    }).catch(res => {
      wx.showToast({
        title: res.msg || '获取验证码失败',
        icon: 'none'
      });
    });

  },
  fetchData() {
    // [改动] wx.request → post()
    const that = this;
    post('/getmyInfo', {}, { showError: false }).then(res => {
      that.setData({
        mailNumber: res.data.mail
      })
    });
  }
})