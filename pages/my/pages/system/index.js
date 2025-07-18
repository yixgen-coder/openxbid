// pages/my/pages/system/index.js
const app = getApp()
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    userinfo: {},
    versionNo: ''
  },


  /**
   * 生命周期函数--监听页面
   */
  onLoad() {
    wx.setNavigationBarTitle({
      title: app.globalData.languagePack.account_settings
    });
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
    this.fetUseriInfoHandle();
    this.getVersionInfo();
  },
  async cancelAccount() {
    const res = await new Promise((resolve) => {
      wx.showModal({
        content: app.globalData.languagePack.lang == 1 ? 'All data will be cleared after cancellation. Do you want to continue?' : '注销后所有数据将被清除，是否继续？',
        cancelText: app.globalData.languagePack.cancel, // 取消按钮文字（可选，默认为"取消"）
        confirmText: app.globalData.languagePack.sure, // 确认按钮文字（可选，默认为"确定"）
        success: resolve
      })
    });
    if (res.confirm) {
      wx.showLoading({
        title: app.globalData.languagePack.lang == 1 ? 'Cancellation in progress' : '注销中...',
        mask: true // 禁止用户操作
      });
      const token = wx.getStorageSync('token');
      const that = this;
      wx.request({
        url: 'https://kpy.phanlink.com/v1/cancelAccount',
        method: 'POST',
        data: {
          token: token
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.code == 1) {
            wx.clearStorageSync();
            wx.showToast({
              title: res.data.msg
            });
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/tabbar/home/home'
              })
            }, 2000);
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 2000
            });
          }
        }
      });
    }
  },
  fetUseriInfoHandle() {
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
            userinfo: res.data.data
          })
        }
      }
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  handleLogOut() {
    wx.clearStorageSync();
    wx.reLaunch({
      url: '/pages/tabbar/home/home'
    })
  },
  getVersionInfo() {
    const versionInfo = wx.getAccountInfoSync();
    const {
      version,
      envVersion = __wxConfig
    } = versionInfo.miniProgram;
    this.setData({
      versionNo: envVersion === 'release' ? version : envVersion,
    });
  },
})