const app = getApp()
const { post } = require('../../../utils/request')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    artId: '',
    artInfo: {},
  },
  onLoad: function (options) {
    if (options.artId > 0) {
      this.setData({
        artId: options.artId
      })
    } else {
      this.goback();
    }
    this.init();
  },
  init() {
    const artId = this.data.artId;
    if (artId > 0) {
      this.fetchHomeDatas();
    }

  },
  fetchHomeDatas: async function () {
    // [改动] fetchDatas → post()
    try {
      const res = await post('/getArtDatas', { artId: this.data.artId, lang: app.globalData.languagePack.lang }, { showError: false });
      const nextList = res.result;
      if (nextList.id > 0) {
        this.setData({
          artId: nextList.id,
          artInfo: nextList
        });
      }
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
      // 来自页面内转发按钮
      // console.log(res);
    }
    return {
      title: this.data.artInfo.title,
      imageUrl: 'https://imgs.phanlink.com/' + this.data.artInfo.pic,
      path: '/pages/news/pages/art/index?artId=' + this.data.artId
    }
  },
  onShareTimeline: function (res) {
    return {
      title: this.data.artInfo.title,
      query: 'artId=' + this.data.artId,
      imageUrl: 'https://imgs.phanlink.com/' + this.data.artInfo.pic
    }
  },
})