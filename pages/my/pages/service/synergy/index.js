const app = getApp()
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.lang == 1 ? 'X Documents' : '协同文件',
    statusbar: '',
    jiaonangheight: '',
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
  },
  onShow() {
    // 用户未登录，跳转到登录页面
    wx.showModal({
      title: app.globalData.languagePack.reminder, // 标题
      content: app.globalData.languagePack.lang == 1 ? 'Only premium members have the right to view' : '高级会员才有权利查看', // 内容
      cancelText: app.globalData.languagePack.cancel, // 取消按钮文字（可选，默认为"取消"）
      confirmText: app.globalData.languagePack.sure, // 确认按钮文字（可选，默认为"确定"）
      success: (res) => {
        wx.navigateBack();
      }
    })
  },

  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  }
})