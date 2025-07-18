const app = getApp()
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
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.showModal({
        title: app.globalData.languagePack.reminder, // 标题
        content: app.globalData.languagePack.function_registered, // 内容
        cancelText: app.globalData.languagePack.cancel, // 取消按钮文字（可选，默认为"取消"）
        confirmText: app.globalData.languagePack.login, // 确认按钮文字（可选，默认为"确定"）
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/tabbar/login/login',
            });
          } else if (res.cancel) {
            wx.navigateBack();
          }
        }
      })
    }
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
    const token = wx.getStorageSync('token');
    formData.token = token;
    formData.phone = this.data.mailNumber;
    formData.code = this.data.verificationCode;
    formData.lang = app.globalData.languagePack.lang;

    // 发送数据到服务器
    this.sendFormData(formData);
  },
  sendFormData: function (data) {
    const url = 'https://kpy.phanlink.com/v1/setMyMail'
    wx.request({
      url: url, // 服务器地址
      method: 'POST',
      data: data,
      success: function (res) {
        //console.log(res);
        if (res.data.code == 1) {
          wx.showToast({
            title: res.data.msg,
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
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: function (error) {
        console.error('提交失败', error);
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000
        });
      }
    });
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
          getCodeButtonText: `${countdown--} s ` + app.globalData.languagePack.lang == 1 ? 'Re-send' : '重新发送',
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
        if (res.data.code == 1) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          });
        }

      }
    });

  },
  fetchData() {
    const token = wx.getStorageSync('token');
    const that = this;
    wx.request({
      url: 'https://kpy.phanlink.com/v1/getmyInfo',
      method: 'POST',
      data: {
        token: token
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            mailNumber: res.data.data.mail
          })
        }
      }
    });
  }
})