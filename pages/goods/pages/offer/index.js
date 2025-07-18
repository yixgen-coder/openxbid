// pages/goods/pages/offer/index.js
const app = getApp()
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
    const url = 'https://kpy.phanlink.com/v1/getGoodsOffers';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.goodsId = this.data.goodsId;
    formData.lang = app.globalData.languagePack.lang;
    const res = await this.fetchSetGoods(url, formData);
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
  fetchSetGoods(url, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'POST',
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          reject(err);
        }
      });
    });
  },
     /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
})