// pages/publish/index.js
const app = getApp()
const { post } = require('../../../utils/request')
const auth = require('../../../services/auth')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    globalLangData: app.globalData.languagePack,
    statusbar: '',
    jiaonangheight: '',
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    auth.requireLogin();
    this.getMessageCount();
  },
  async getMessageCount() {
    const res = await post('/getMessageCounts', {}, { showError: false });
    if (res.code == 1) {
      this.getTabBar().init(res.result.messageCount);
      // if (res.company_status < 2) {
      //   wx.showModal({
      //     title: app.globalData.languagePack.reminder, // 标题
      //     content: app.globalData.languagePack.lang == 1 ? 'Please complete the membership verification before Posting' : '请进行会员认证后才能发布', // 内容
      //     showCancel: false,
      //     confirmText: app.globalData.languagePack.sure, // 确认按钮文字（可选，默认为"确定"）
      //     success: (res) => {
      //       if (res.confirm) {
      //         wx.navigateTo({
      //           url: '/pages/my/pages/approve/index',
      //         });
      //       } else if (res.cancel) {
      //         wx.switchTab({
      //           url: 'pages/tabbar/home/home' // 替换为你的 tabBar 页面路径
      //         });
      //       }
      //     }
      //   })
      // }
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
})