// pages/goods/pages/offer/index.js
const app = getApp()
const { post } = require('../../../../utils/request')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    globalLangData: app.globalData.languagePack,
    offerList: [],
    goodsId: '',
    visible: false,
    orderSpec: [],
    orderQuantity: '',
    orderWeight: '',
    orderTotal: '',
  },
  cancel() {
    this.setData({
      visible: !this.data.visible,
      orderSpec: [],
      orderQuantity: '',
      orderWeight: '',
      orderTotal: '',
    });
  },
  handleShowOfferInfo(e) {
    const index = e.currentTarget.dataset.key;
    const orderSpec = JSON.parse(this.data.offerList[index].orderSpec);
    const orderQuantity = this.data.offerList[index].orderQuantity;
    const orderWeight = this.data.offerList[index].orderWeight;
    const orderTotal = this.data.offerList[index].orderTotal;

    this.setData({
      visible: !this.data.visible,
      orderSpec: orderSpec,
      orderQuantity: orderQuantity,
      orderWeight: orderWeight,
      orderTotal: orderTotal,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      goodsId: options.goodsId,
    });
    this.init();
  },
  init: async function () {
    // [改动] 使用统一请求层 post()，替代原 fetchSetGoods + wx.request + 硬编码 URL + 手动塞 token
    const res = await post('/getGoodsOffers', {
      goodsId: this.data.goodsId,
      lang: app.globalData.languagePack.lang,
    }, { showError: false });
    if (res.code == 1) {
      this.setData({
        offerList: res.result,
      });
    } else {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000
      });
    }
  },
  // [改动] 删除原 fetchSetGoods 方法 —— 已被 utils/request.js 的 post() 替代
     /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
})