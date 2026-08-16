const app = getApp()
const { post } = require('../../../utils/request')
const { requireLogin } = require('../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.followers,
    statusbar: '',
    jiaonangheight: '',
    fansList: [],
  },
  onLoad(options) {
    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  async handleDel(e) {
    const {
      uid
    } = e.currentTarget.dataset;
    // [改动] fetchDatas → post()
    try {
      const res = await post('/delmyFans', { uid }, { showError: false });
      this.setData({
        fansList: this.data.fansList.filter(fans => fans.uid !== uid)
      });
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      });
    } catch (res) {
      wx.showToast({
        title: res.msg || '操作失败',
        icon: 'success',
        duration: 2000
      });
    }
  },
  handleJl(e) {
    const {
      uid
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/news/pages/message/chat/index?uId=' + uid,
    });
  },
  init() {
    // [改动] wx.getStorageSync('token') + showModal → requireLogin()
    if (!requireLogin()) return;
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
    this.fetchHomeDatas();
  },
  fetchHomeDatas: async function () {
    // [改动] fetchDatas → post()
    try {
      const res = await post('/getmyFans', { lang: app.globalData.languagePack.lang }, { showError: false });
      this.setData({
        fansList: res.result,
      });
    } catch (res) {
      // 静默失败
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
})