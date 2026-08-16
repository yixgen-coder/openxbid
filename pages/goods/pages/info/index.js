const app = getApp()
// [改动] 引入统一请求层和认证服务
const { post } = require('../../../../utils/request')
const { requireLogin } = require('../../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    statusbar: '',
    jiaonangheight: '',
    orderInfo: {},
    ordId: 0,
    visible: false,
    pjvisible: false,
    isShow: false,
    gg: [],
    orderSpec: [],
    total: {
      stock: 0,
      weight: 0,
      price: 0
    },
    pjvalue: 1,
    msg: '',
    cj: 0,
    pj: 0,
  },
  handleShow() {
    this.setData({
      isShow: !this.data.isShow
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  handleShowPJ() {
    this.setData({
      pjvisible: !this.data.pjvisible
    })
  },
  onPJChange(e) {
    const {
      value
    } = e.detail;
    this.setData({
      pjvalue: value,
    });
  },
  handleMsg(e) {
    this.setData({
      msg: e.detail.value,
    });
  },
  handleSubmit: async function () {
    const formData = {};
    formData.msg = this.data.msg;
    formData.ordId = this.data.ordId;
    formData.pjvalue = this.data.pjvalue;
    formData.lang = app.globalData.languagePack.lang;
    // [改动] fetchSetOrders → post()
    try {
      const res = await post('/setOrderPJ', formData, { showError: false });
      wx.showToast({
        title: 'success',
        icon: 'success',
        duration: 2000,
        mask: true,
        complete: () => {
          setTimeout(() => {
            wx.navigateBack({ delta: 1 });
          }, 2000);
        }
      });
    } catch (res) {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000
      });
    }
  },
  handleShowDel() {
    // [改动] 登录检查 → requireLogin()
    if (!requireLogin()) return;
    const ordId = this.data.ordId;
    wx.showModal({
      title: app.globalData.languagePack.reminder,
      content: app.globalData.languagePack.sure_delete,
      success: async function (res) {
        if (res.confirm) {
          // [改动] fetchSetOrders → post()
          try {
            await post('/delOrder', { ordId }, { showError: false });
            wx.showToast({
              title: 'Success',
              icon: 'success',
              duration: 2000,
              mask: true
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 2000);
          } catch (err) {}
        }
      }.bind(this)
    });
  },
  onVisibleChange() {
    this.setData({
      isShow: !this.data.isShow
    })
  },
  cancel() {
    this.setData({
      visible: !this.data.visible,
    });
  },
  handleShowOfferInfo(e) {
    this.setData({
      visible: !this.data.visible,
    });
  },
  onLoad(options) {
    if (options.cj == 1) {
      this.setData({
        isShow: true,
        cj: 1,
      });
    }
    if (options.pj == 1) {
      this.setData({
        pjvisible: true,
        pj: 1,
      });
    }
    this.setData({
      ordId: options.ordId,
    });
    this.init();

  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  submitBJ: async function () {
    const formData = {};
    formData.goodsId = this.data.orderInfo.goods_id;
    formData.gg = this.data.gg;
    formData.lang = app.globalData.languagePack.lang;
    if (formData.gg.length == 0) {
      wx.showToast({
        title: app.globalData.languagePack.lang == 1 ? 'Please make a bid first' : '请先出价',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // [改动] fetchSetOrders → post()
    try {
      const res = await post('/setGoodsQuot', formData, { showError: false });
      this.onVisibleChange();
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      });
      if (this.data.cj == 1) {
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
      }
    } catch (res) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: false,
        confirmText: app.globalData.languagePack.sure,
        confirmColor: "#007AFF",
      });
    }
  },
  ggainput(e) {
    let goodsspec = this.data.orderSpec;
    let total = this.data.total;
    total.price = 0;
    const gg = e.detail[0].gg;
    for (let i = 0; i < gg.length; i++) {

      total.price += parseFloat(goodsspec[i].a4 * gg[i]);
    }

    this.setData({
      gg: gg,
      total: total,
    });
  },
  checkUserLogin: function () {
    // [改动] 登录检查 → requireLogin()
    requireLogin();
  },
  handleGoChat() {
    wx.navigateTo({
      url: '/pages/news/pages/message/chat/index?storeId=' + this.data.orderInfo.storeid,
    });
  },
  init: async function () {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top,
      jiaonangheight: res.height
    })
    this.checkUserLogin();
    // [改动] fetchSetOrders → post()
    try {
      const oinfo = await post('/getOrderInfo', { ordId: this.data.ordId }, { showError: false });
      const total = this.data.total;
      total.stock = oinfo.result.orderQuantity;
      total.weight = oinfo.result.orderWeight;
      total.price = oinfo.result.orderTotal;
      this.setData({
        orderInfo: oinfo.result,
        orderSpec: JSON.parse(oinfo.result.orderSpec),
        total: total,
      });
    } catch (err) {}
  },
});