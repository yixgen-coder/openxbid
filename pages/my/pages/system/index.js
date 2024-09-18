// pages/my/pages/system/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo: {},
    versionNo: ''
  },


  /**
   * 生命周期函数--监听页面
   */
  onLoad() {
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/tabbar/login/login',
      });
    }
    this.fetUseriInfoHandle();
    this.getVersionInfo();
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
  handleLogOut() {
    wx.removeStorageSync('token');
    wx.switchTab({
      url: '/pages/tabbar/home/home',
    });
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