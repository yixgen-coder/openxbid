// pages/my/pages/system/index.js
const app = getApp()
// [改动] 引入统一请求层 post()
const { post } = require('../../../utils/request')
const { requireLogin } = require('../../../services/auth')
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
    // [改动] wx.getStorageSync('token') + showModal → requireLogin()
    if (!requireLogin()) return;
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
      // [改动] 使用 post() 替代内联 wx.request，删除 token 字段
      try {
        const result = await post('/cancelAccount', {}, { showError: false });
        wx.clearStorageSync();
        wx.showToast({
          title: result.msg
        });
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/tabbar/home/home'
          })
        }, 2000);
      } catch (result) {
        wx.showToast({
          title: result.msg,
          icon: 'none',
          duration: 2000
        });
      }
    }
  },
  // [改动] 使用 post() 替代内联 wx.request，删除 token 字段
  async fetUseriInfoHandle() {
    try {
      const res = await post('/getmyInfo', {}, { showError: false });
      this.setData({
        userinfo: res.data
      })
    } catch (res) {}
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