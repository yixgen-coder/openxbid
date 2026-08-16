const app = getApp()
// [改动] 引入统一请求层
const { post } = require('../../../../utils/request')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    statusbar: '',
    jiaonangheight: '',
    storeInfo: {},
    storeId: 0,
  },

  onLoad(options) {
    this.setData({
      storeId: options.storeId,
    });
    this.init();

  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },


  init: async function () {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
    // [改动] fetchSetOrders → post()
    try {
      const oinfo = await post('/getStoreInfo', {
        storeId: this.data.storeId,
        lang: app.globalData.languagePack.lang
      }, { showError: false });
      if (oinfo.result != null) {
        this.setData({
          storeInfo: oinfo.result,
        });
      }
    } catch (oinfo) {
      // 静默处理
    }
  },
   /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
});