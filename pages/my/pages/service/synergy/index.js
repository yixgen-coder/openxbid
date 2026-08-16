const app = getApp()
// [改动] 引入统一请求层 post()
const { post } = require('../../../../utils/request')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.lang == 1 ? 'This week quotation' : '本周报价',
    statusbar: '',
    jiaonangheight: '',
    artId: 1,
    artInfo: {},
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })

    this.fetchHomeDatas();
  },
  onShow() {

  },

  canGoBack: function () {
    const pages = getCurrentPages();
    const currentPageIndex = pages.length - 1;

    if (currentPageIndex > 0) {
      return true;
    } else {
      return false;
    }
  },
  goback: function () {
    if (this.canGoBack()) {
      wx.navigateBack({
        delta: 1
      });
    } else {
      wx.switchTab({
        url: '/pages/tabbar/home/home',
      });
    }
  },

  // [改动] 使用 post() 替代 fetchDatas，URL 去掉前缀
  fetchHomeDatas: async function () {
    try {
      const res = await post('/getSeviceT2Datas', {}, { showError: false });
      this.setData({
        artInfo: res.result
      });
    } catch (res) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: false,
        confirmText: app.globalData.languagePack.sure,
        success: rs => {
          if (rs.confirm) {
            wx.navigateBack({
              delta: 1
            });
          }
        }
      });
    }


  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {

    }
    return {
      title: app.globalData.languagePack.lang == 1 ? 'This week quotation' : '本周报价',
      imageUrl: 'https://imgs.phanlink.com/uploads/20250531/ab00131f41d8ba851a7ddf72adee20b2.png',
      path: '/pages/my/pages/service/synergy/index',
    }
  },
  onShareTimeline: function (res) {

    return {
      title: app.globalData.languagePack.lang == 1 ? 'This week quotation' : '本周报价',
      imageUrl: 'https://imgs.phanlink.com/uploads/20250531/ab00131f41d8ba851a7ddf72adee20b2.png',
      path: '/pages/my/pages/service/synergy/index',
    }
  }
})